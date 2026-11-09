<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/two_factor.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$input = getJsonInput();
$action = trim($input['action'] ?? 'login');
$pdo = getDb();
ensureTwoFactorTables($pdo);

$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$deviceId = trim($input['device_id'] ?? '');

// ── Action: Verify 2FA OTP ────────────────────────────────────────────────────
if ($action === 'verify_2fa') {
    $pending = $_SESSION['vdx_2fa_pending'] ?? null;
    $userId = (int)($input['user_id'] ?? ($pending['user_id'] ?? 0));
    $userType = $pending['user_type'] ?? 'admin';
    $code = trim($input['code'] ?? '');
    $tempToken = trim($input['temp_token'] ?? '');

    if ($userId <= 0 || empty($code)) {
        jsonResponse(['success' => false, 'error' => 'User ID and verification code are required.'], 400);
    }

    if ($pending && !empty($pending['temp_token']) && $tempToken !== $pending['temp_token']) {
        jsonResponse(['success' => false, 'error' => 'Invalid or expired verification session. Please sign in again.'], 403);
    }

    $ver = verify2FACode($pdo, $userType, $userId, $code, $deviceId, $ip, $userAgent);
    if (!$ver['success']) {
        jsonResponse(['success' => false, 'error' => $ver['error']], 400);
    }

    // Successfully verified! Look up admin user and establish session
    $stmt = $pdo->prepare("SELECT id, email, name, role, is_active FROM admins WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $admin = $stmt->fetch();

    if (!$admin || !$admin['is_active']) {
        jsonResponse(['success' => false, 'error' => 'Account is inactive.'], 403);
    }

    // Update last_login
    $pdo->prepare("UPDATE admins SET last_login = NOW() WHERE id = :id")->execute([':id' => $admin['id']]);

    $_SESSION['admin_user'] = [
        'id' => (int)$admin['id'],
        'email' => $admin['email'],
        'name' => $admin['name'],
        'role' => $admin['role'],
    ];

    jsonResponse([
        'success' => true,
        'message' => 'Device verified and login successful',
        'user' => [
            'id' => (int)$admin['id'],
            'email' => $admin['email'],
            'name' => $admin['name'],
            'role' => $admin['role'],
        ],
    ]);
}

// ── Action: Resend 2FA OTP ───────────────────────────────────────────────────
if ($action === 'resend_2fa') {
    $pending = $_SESSION['vdx_2fa_pending'] ?? null;
    $userId = (int)($input['user_id'] ?? ($pending['user_id'] ?? 0));

    if (!$pending || (int)$pending['user_id'] !== $userId) {
        jsonResponse(['success' => false, 'error' => 'No active pending verification session. Please sign in again.'], 400);
    }

    $otpData = generateAndSend2FACode(
        $pdo,
        'admin',
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

// ── Action: Standard Email/Password Login ─────────────────────────────────────
$emailOrUsername = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($emailOrUsername) || empty($password)) {
    jsonResponse(['success' => false, 'error' => 'Please enter both your email/username and password.'], 400);
}

try {
    // Support full email (e.g. admin@vivadoxa.ng) or username alias (e.g. admin)
    $cleanInput = strtolower($emailOrUsername);
    if (strpos($cleanInput, '@') === false) {
        $emailCandidate = $cleanInput . '@vivadoxa.ng';
    } else {
        $emailCandidate = $cleanInput;
    }

    $stmt = $pdo->prepare("
        SELECT id, email, password_hash, name, role, is_active, last_login
        FROM admins
        WHERE LOWER(email) = :email OR LOWER(email) = :fullEmail
        LIMIT 1
    ");

    $stmt->execute([
        ':email' => $cleanInput,
        ':fullEmail' => $emailCandidate,
    ]);

    $admin = $stmt->fetch();

    if (!$admin) {
        jsonResponse([
            'success' => false,
            'error' => 'No staff account found with this email or username.',
        ], 401);
    }

    if (!$admin['is_active']) {
        jsonResponse([
            'success' => false,
            'error' => 'This account has been deactivated. Please contact an administrator.',
        ], 403);
    }

    // Strict database password verification using bcrypt
    if (!password_verify($password, $admin['password_hash'])) {
        jsonResponse([
            'success' => false,
            'error' => 'Incorrect password. Please try again.',
        ], 401);
    }

    $adminId = (int)$admin['id'];

    // ── 2FA Check: First-time login OR login on a new device ─────────────────
    $isVerified = isDeviceVerified($pdo, 'admin', $adminId, $deviceId);

    if (!$isVerified) {
        // Trigger Email 2FA
        $otpPayload = generateAndSend2FACode(
            $pdo,
            'admin',
            $adminId,
            $admin['email'],
            $admin['name'],
            $deviceId,
            $ip,
            $userAgent
        );

        jsonResponse([
            'success' => true,
            'requires_2fa' => true,
            'user_id' => $adminId,
            'temp_token' => $otpPayload['temp_token'],
            'email_masked' => $otpPayload['email_masked'],
            'device_id' => $deviceId,
            'device_name' => $otpPayload['device_name'],
            'message' => 'Security check: A 6-digit verification code was sent to your email to verify this device.',
        ]);
    }

    // Recognized device — direct login
    $pdo->prepare("UPDATE admins SET last_login = NOW() WHERE id = :id")->execute([':id' => $adminId]);

    $_SESSION['admin_user'] = [
        'id' => $adminId,
        'email' => $admin['email'],
        'name' => $admin['name'],
        'role' => $admin['role'],
    ];

    jsonResponse([
        'success' => true,
        'requires_2fa' => false,
        'message' => 'Login successful',
        'user' => [
            'id' => $adminId,
            'email' => $admin['email'],
            'name' => $admin['name'],
            'role' => $admin['role'],
        ],
    ]);
} catch (PDOException $e) {
    jsonResponse([
        'success' => false,
        'error' => 'Database authentication error: ' . $e->getMessage(),
    ], 500);
}
