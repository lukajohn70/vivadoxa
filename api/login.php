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

// ── Action: Request Admin Password Reset Code ────────────────────────────────
if ($action === 'request_password_reset') {
    $emailOrUsername = trim($input['email'] ?? '');
    if (empty($emailOrUsername)) {
        jsonResponse(['success' => false, 'error' => 'Please enter your registered staff email or username.'], 400);
    }

    $cleanInput = strtolower($emailOrUsername);
    if (strpos($cleanInput, '@') === false) {
        $emailCandidate = $cleanInput . '@vivadoxa.ng';
    } else {
        $emailCandidate = $cleanInput;
    }

    $stmt = $pdo->prepare("
        SELECT id, email, name, role, is_active 
        FROM admins 
        WHERE LOWER(email) = :email OR LOWER(email) = :fullEmail 
        LIMIT 1
    ");
    $stmt->execute([':email' => $cleanInput, ':fullEmail' => $emailCandidate]);
    $admin = $stmt->fetch();

    if (!$admin) {
        jsonResponse([
            'success' => false,
            'error' => 'No staff administrator account found with this email or username.',
        ], 404);
    }

    if (!$admin['is_active']) {
        jsonResponse([
            'success' => false,
            'error' => 'This account has been deactivated. Please contact an administrator.',
        ], 403);
    }

    $adminId = (int)$admin['id'];
    $adminEmail = $admin['email'];
    $adminName = $admin['name'];

    // Invalidate previous unused codes for this admin
    $inv = $pdo->prepare("UPDATE `password_reset_codes` SET `is_used` = 1 WHERE `user_type` = 'admin' AND `user_id` = :uid AND `is_used` = 0");
    $inv->execute([':uid' => $adminId]);

    // Generate 6-digit verification code
    $code = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $deviceName = parseDeviceName($userAgent);

    $ins = $pdo->prepare("
        INSERT INTO `password_reset_codes` (`user_type`, `user_id`, `email`, `code`, `ip_address`, `user_agent`, `expires_at`, `is_used`)
        VALUES ('admin', :uid, :em, :code, :ip, :ua, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0)
    ");
    $ins->execute([
        ':uid' => $adminId,
        ':em'  => $adminEmail,
        ':code' => $code,
        ':ip'   => $ip,
        ':ua'   => $userAgent,
    ]);

    // Send email with 6-digit code
    $timeFormatted = date('D, M j, Y · g:i A') . ' (WAT)';
    $htmlBody = "
        <p style='margin: 0 0 16px; font-size: 15px; color: #191715;'>
            A password reset request was initiated for your <strong>Vivadoxa Staff Administrator Account</strong> ({$adminName}).
        </p>

        <div style='background: #fff8f3; border: 2px dashed #c96b32; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center;'>
            <div style='font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a24a18; font-weight: 700; margin-bottom: 8px;'>Your 6-Digit Password Reset Code</div>
            <div style='font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #0b0b0b; font-family: monospace;'>{$code}</div>
            <div style='font-size: 12px; color: #78716c; margin-top: 8px;'>Valid for 15 minutes · Do not share this code with anyone</div>
        </div>

        <table style='width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px;'>
            <tr>
                <td style='padding: 10px 14px; border-bottom: 1px solid #ede8e0; font-weight: 600; color: #5c5954; width: 35%;'>Device / Browser</td>
                <td style='padding: 10px 14px; border-bottom: 1px solid #ede8e0; color: #0b0b0b; font-weight: 700;'>{$deviceName}</td>
            </tr>
            <tr>
                <td style='padding: 10px 14px; border-bottom: 1px solid #ede8e0; font-weight: 600; color: #5c5954;'>IP Address</td>
                <td style='padding: 10px 14px; border-bottom: 1px solid #ede8e0; color: #0b0b0b; font-family: monospace;'>{$ip}</td>
            </tr>
            <tr>
                <td style='padding: 10px 14px; font-weight: 600; color: #5c5954;'>Request Time</td>
                <td style='padding: 10px 14px; color: #0b0b0b;'>{$timeFormatted}</td>
            </tr>
        </table>

        <p style='margin: 18px 0 0; font-size: 12px; color: #78716c; line-height: 1.5;'>
            If you did not request this password reset, please ignore this email or notify IT security immediately. Your current password remains unchanged.
        </p>
    ";

    $emailTemplate = buildBrandedEmailTemplate([
        'title' => 'Password Reset Code',
        'badge' => 'Staff Security Desk',
        'headline' => 'Staff Password Reset Request',
        'clientName' => $adminName,
        'bodyHtml' => $htmlBody,
        'deptName' => 'Vivadoxa Security Desk',
        'deptEmail' => 'info@vivadoxamusic.com',
    ]);

    sendSystemEmail(
        $adminEmail,
        "🔑 {$code} is your Vivadoxa staff password reset code",
        $emailTemplate,
        null,
        'security',
        false
    );

    jsonResponse([
        'success' => true,
        'message' => 'A 6-digit password reset code has been sent to your registered staff email.',
        'email_masked' => maskEmail($adminEmail),
        'email' => $adminEmail,
    ]);
}

// ── Action: Verify Password Reset Code & Update Password ─────────────────────
if ($action === 'verify_password_reset') {
    $email = trim($input['email'] ?? '');
    $code = trim($input['code'] ?? '');
    $newPassword = trim($input['new_password'] ?? $input['password'] ?? '');

    if (empty($email) || empty($code) || empty($newPassword)) {
        jsonResponse(['success' => false, 'error' => 'Email, reset code, and new password are required.'], 400);
    }

    if (strlen($newPassword) < 8) {
        jsonResponse(['success' => false, 'error' => 'Password must be at least 8 characters long.'], 400);
    }

    $cleanInput = strtolower($email);
    if (strpos($cleanInput, '@') === false) {
        $emailCandidate = $cleanInput . '@vivadoxa.ng';
    } else {
        $emailCandidate = $cleanInput;
    }

    // Verify reset code
    $stmt = $pdo->prepare("
        SELECT id, user_id, email, expires_at, is_used 
        FROM password_reset_codes 
        WHERE user_type = 'admin' 
          AND (LOWER(TRIM(email)) = LOWER(TRIM(:em)) OR LOWER(TRIM(email)) = LOWER(TRIM(:fullEmail))) 
          AND code = :code 
          AND is_used = 0 
          AND expires_at > NOW() 
        ORDER BY id DESC LIMIT 1
    ");
    $stmt->execute([':em' => $cleanInput, ':fullEmail' => $emailCandidate, ':code' => $code]);
    $resetRow = $stmt->fetch();

    if (!$resetRow) {
        jsonResponse(['success' => false, 'error' => 'Invalid or expired verification code. Please request a new reset code.'], 400);
    }

    $adminId = (int)$resetRow['user_id'];

    // Invalidate code
    $pdo->prepare("UPDATE password_reset_codes SET is_used = 1 WHERE id = :id")->execute([':id' => $resetRow['id']]);
    $pdo->prepare("UPDATE password_reset_codes SET is_used = 1 WHERE user_type = 'admin' AND user_id = :uid")->execute([':uid' => $adminId]);

    // Update password hash in admins table
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
    $pdo->prepare("UPDATE admins SET password_hash = :pw, updated_at = NOW() WHERE id = :id")->execute([
        ':pw' => $newHash,
        ':id' => $adminId,
    ]);

    // Fetch updated admin
    $aStmt = $pdo->prepare("SELECT id, name, email, role FROM admins WHERE id = :id LIMIT 1");
    $aStmt->execute([':id' => $adminId]);
    $admin = $aStmt->fetch();

    // Send confirmation email
    $deviceName = parseDeviceName($userAgent);
    $timeFormatted = date('D, M j, Y · g:i A') . ' (WAT)';
    $confirmBody = "
        <p style='margin: 0 0 16px; font-size: 15px; color: #191715;'>
            The password for your Vivadoxa Staff Administrator Account has been <strong>successfully reset and updated</strong>.
        </p>
        <table style='width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px;'>
            <tr>
                <td style='padding: 10px 14px; border-bottom: 1px solid #ede8e0; font-weight: 600; color: #5c5954; width: 35%;'>Device / Browser</td>
                <td style='padding: 10px 14px; border-bottom: 1px solid #ede8e0; color: #0b0b0b; font-weight: 700;'>{$deviceName}</td>
            </tr>
            <tr>
                <td style='padding: 10px 14px; border-bottom: 1px solid #ede8e0; font-weight: 600; color: #5c5954;'>IP Address</td>
                <td style='padding: 10px 14px; border-bottom: 1px solid #ede8e0; color: #0b0b0b; font-family: monospace;'>{$ip}</td>
            </tr>
            <tr>
                <td style='padding: 10px 14px; font-weight: 600; color: #5c5954;'>Timestamp</td>
                <td style='padding: 10px 14px; color: #0b0b0b;'>{$timeFormatted}</td>
            </tr>
        </table>
        <p style='margin: 18px 0 0; font-size: 12px; color: #78716c; line-height: 1.5;'>
            If you did not perform this change, please immediately alert the IT Security Desk at info@vivadoxamusic.com.
        </p>
    ";

    $confirmTemplate = buildBrandedEmailTemplate([
        'title' => 'Password Changed',
        'badge' => 'Security Alert',
        'headline' => 'Admin Password Successfully Reset',
        'clientName' => $admin['name'] ?? 'Administrator',
        'bodyHtml' => $confirmBody,
        'deptName' => 'Vivadoxa Security Desk',
        'deptEmail' => 'info@vivadoxamusic.com',
    ]);

    sendSystemEmail(
        $admin['email'],
        "🔐 Your Vivadoxa Admin password was changed",
        $confirmTemplate,
        null,
        'security',
        false
    );

    jsonResponse([
        'success' => true,
        'message' => 'Your password has been reset successfully. You can now sign in with your new password.',
        'email' => $admin['email'],
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
