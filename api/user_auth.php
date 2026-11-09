<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/two_factor.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
ensureTwoFactorTables($pdo);
$method = $_SERVER['REQUEST_METHOD'];

$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

if ($method === 'GET') {
    // Current session check
    $user = $_SESSION['client_user'] ?? null;
    if ($user) {
        $stmt = $pdo->prepare("SELECT id, email, phone, full_name, role, avatar, address, guardian_name, guardian_phone, created_at FROM users WHERE id = :id AND is_active = 1 LIMIT 1");
        $stmt->execute([':id' => $user['id']]);
        $fresh = $stmt->fetch();
        if ($fresh) {
            $_SESSION['client_user'] = $fresh;
            jsonResponse(['success' => true, 'authenticated' => true, 'user' => $fresh]);
        }
    }
    jsonResponse(['success' => true, 'authenticated' => false, 'user' => null]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? 'login');

    $deviceId = trim($input['device_id'] ?? '');

    if ($action === 'verify_2fa') {
        $pending = $_SESSION['vdx_2fa_pending'] ?? null;
        $userId = (int)($input['user_id'] ?? ($pending['user_id'] ?? 0));
        $code = trim($input['code'] ?? '');
        $tempToken = trim($input['temp_token'] ?? '');

        if ($userId <= 0 || empty($code)) {
            jsonResponse(['success' => false, 'error' => 'User ID and verification code are required.'], 400);
        }

        if ($pending && !empty($pending['temp_token']) && $tempToken !== $pending['temp_token']) {
            jsonResponse(['success' => false, 'error' => 'Invalid or expired verification session. Please sign in again.'], 403);
        }

        $ver = verify2FACode($pdo, 'user', $userId, $code, $deviceId, $ip, $userAgent);
        if (!$ver['success']) {
            jsonResponse(['success' => false, 'error' => $ver['error']], 400);
        }

        $stmt = $pdo->prepare("SELECT id, email, phone, full_name, role, avatar, address, guardian_name, guardian_phone, is_active FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();

        if (!$user || !$user['is_active']) {
            jsonResponse(['success' => false, 'error' => 'Account is inactive.'], 403);
        }

        $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = :id")->execute([':id' => $user['id']]);
        $_SESSION['client_user'] = $user;

        jsonResponse([
            'success' => true,
            'message' => 'Device verified and login successful',
            'user' => $user,
        ]);
    }

    if ($action === 'resend_2fa') {
        $pending = $_SESSION['vdx_2fa_pending'] ?? null;
        $userId = (int)($input['user_id'] ?? ($pending['user_id'] ?? 0));

        if (!$pending || (int)$pending['user_id'] !== $userId) {
            jsonResponse(['success' => false, 'error' => 'No active pending verification session. Please sign in again.'], 400);
        }

        $otpData = generateAndSend2FACode(
            $pdo,
            'user',
            $userId,
            $pending['email'],
            $pending['full_name'],
            $deviceId ?: $pending['device_id'],
            $ip,
            $userAgent
        );

        jsonResponse([
            'success' => true,
            'message' => 'A fresh verification code has been dispatched to your email.',
            'data' => $otpData,
        ]);
    }

    if ($action === 'login') {
        $identifier = trim($input['email'] ?? $input['phone'] ?? $input['identifier'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($identifier) || empty($password)) {
            jsonResponse(['success' => false, 'error' => 'Please enter your email/phone and password.'], 400);
        }

        $stmt = $pdo->prepare("
            SELECT id, email, phone, password_hash, full_name, role, avatar, address, guardian_name, guardian_phone, is_active, last_login
            FROM users
            WHERE LOWER(email) = LOWER(:em) OR phone = :ph
            LIMIT 1
        ");
        $stmt->execute([':em' => $identifier, ':ph' => $identifier]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(['success' => false, 'error' => 'No account found with this email or phone. Please register or check your credentials.'], 401);
        }

        if (!$user['is_active']) {
            jsonResponse(['success' => false, 'error' => 'Your student account is deactivated. Please contact admissions.'], 403);
        }

        // Strict database password verification using bcrypt
        if (!password_verify($password, $user['password_hash'])) {
            jsonResponse(['success' => false, 'error' => 'Incorrect password. Please try again.'], 401);
        }

        $userId = (int)$user['id'];

        // ── 2FA Check: First-time login OR login on a new device ─────────────
        $isVerified = isDeviceVerified($pdo, 'user', $userId, $deviceId);

        if (!$isVerified) {
            $otpPayload = generateAndSend2FACode(
                $pdo,
                'user',
                $userId,
                $user['email'],
                $user['full_name'],
                $deviceId,
                $ip,
                $userAgent
            );

            jsonResponse([
                'success' => true,
                'requires_2fa' => true,
                'user_id' => $userId,
                'temp_token' => $otpPayload['temp_token'],
                'email_masked' => $otpPayload['email_masked'],
                'device_id' => $deviceId,
                'device_name' => $otpPayload['device_name'],
                'message' => 'Security check: A 6-digit verification code was sent to your email to verify this device.',
            ]);
        }

        // Recognized device: complete login
        $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = :id")->execute([':id' => $userId]);

        unset($user['password_hash']);
        $_SESSION['client_user'] = $user;

        jsonResponse([
            'success' => true,
            'requires_2fa' => false,
            'message' => 'Login successful',
            'user' => $user,
        ]);
    } elseif ($action === 'register') {
        $fullName = trim($input['full_name'] ?? $input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = trim($input['password'] ?? '');
        $role = trim($input['role'] ?? 'student');

        if (empty($fullName) || empty($email) || empty($password)) {
            jsonResponse(['success' => false, 'error' => 'Name, email, and password are required.'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['success' => false, 'error' => 'Please provide a valid email address.'], 400);
        }

        // Check duplicate
        $stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(:em) LIMIT 1");
        $stmt->execute([':em' => $email]);
        if ($stmt->fetch()) {
            jsonResponse(['success' => false, 'error' => 'An account with this email already exists. Please log in instead.'], 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $ins = $pdo->prepare("
            INSERT INTO users (full_name, email, phone, password_hash, role, address, guardian_name, guardian_phone, is_active)
            VALUES (:fn, :em, :ph, :pw, :rl, :ad, :gn, :gp, 1)
        ");
        $ins->execute([
            ':fn' => $fullName,
            ':em' => $email,
            ':ph' => $phone,
            ':pw' => $hash,
            ':rl' => $role,
            ':ad' => trim($input['address'] ?? ''),
            ':gn' => trim($input['guardian_name'] ?? ''),
            ':gp' => trim($input['guardian_phone'] ?? ''),
        ]);

        $userId = (int)$pdo->lastInsertId();
        $user = [
            'id' => $userId,
            'full_name' => $fullName,
            'email' => $email,
            'phone' => $phone,
            'role' => $role,
            'avatar' => null,
            'address' => trim($input['address'] ?? ''),
            'guardian_name' => trim($input['guardian_name'] ?? ''),
            'guardian_phone' => trim($input['guardian_phone'] ?? ''),
            'is_active' => 1,
        ];

        $_SESSION['client_user'] = $user;

        jsonResponse([
            'success' => true,
            'message' => 'Account created successfully! Welcome to Vivadoxa.',
            'user' => $user,
        ], 201);
    } elseif ($action === 'logout') {
        unset($_SESSION['client_user']);
        jsonResponse(['success' => true, 'message' => 'Logged out successfully.']);
    } elseif ($action === 'update_profile') {
        $currentUser = $_SESSION['client_user'] ?? null;
        if (!$currentUser) {
            jsonResponse(['success' => false, 'error' => 'Not authenticated.'], 401);
        }

        $name = trim($input['full_name'] ?? $currentUser['full_name']);
        $phone = trim($input['phone'] ?? $currentUser['phone']);
        $address = trim($input['address'] ?? ($currentUser['address'] ?? ''));
        $guardianName = trim($input['guardian_name'] ?? ($currentUser['guardian_name'] ?? ''));
        $guardianPhone = trim($input['guardian_phone'] ?? ($currentUser['guardian_phone'] ?? ''));
        $newPass = trim($input['password'] ?? '');

        if (!empty($newPass)) {
            $hash = password_hash($newPass, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("
                UPDATE users
                SET full_name = :fn, phone = :ph, address = :ad, guardian_name = :gn, guardian_phone = :gp, password_hash = :pw
                WHERE id = :id
            ");
            $stmt->execute([
                ':fn' => $name,
                ':ph' => $phone,
                ':ad' => $address,
                ':gn' => $guardianName,
                ':gp' => $guardianPhone,
                ':pw' => $hash,
                ':id' => $currentUser['id'],
            ]);
        } else {
            $stmt = $pdo->prepare("
                UPDATE users
                SET full_name = :fn, phone = :ph, address = :ad, guardian_name = :gn, guardian_phone = :gp
                WHERE id = :id
            ");
            $stmt->execute([
                ':fn' => $name,
                ':ph' => $phone,
                ':ad' => $address,
                ':gn' => $guardianName,
                ':gp' => $guardianPhone,
                ':id' => $currentUser['id'],
            ]);
        }

        // Refresh session
        $currentUser['full_name'] = $name;
        $currentUser['phone'] = $phone;
        $currentUser['address'] = $address;
        $currentUser['guardian_name'] = $guardianName;
        $currentUser['guardian_phone'] = $guardianPhone;
        $_SESSION['client_user'] = $currentUser;

        jsonResponse([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $currentUser,
        ]);
    } else {
        jsonResponse(['success' => false, 'error' => 'Unknown action.'], 400);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
