<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

function ensureTwoFactorTables(PDO $pdo): void {
    static $done = false;
    if ($done) return;

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `user_devices` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_type` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                `user_id` INT NOT NULL,
                `device_id` VARCHAR(100) NOT NULL,
                `device_name` VARCHAR(255) NULL,
                `ip_address` VARCHAR(50) NULL,
                `user_agent` TEXT NULL,
                `verified_at` DATETIME NOT NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY `uniq_user_device` (`user_type`, `user_id`, `device_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {}

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `login_otp_codes` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_type` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
                `user_id` INT NOT NULL,
                `email` VARCHAR(191) NOT NULL,
                `code` VARCHAR(10) NOT NULL,
                `device_id` VARCHAR(100) NOT NULL,
                `device_name` VARCHAR(255) NULL,
                `ip_address` VARCHAR(50) NULL,
                `expires_at` DATETIME NOT NULL,
                `is_used` TINYINT(1) NOT NULL DEFAULT 0,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_verify` (`user_type`, `user_id`, `code`, `is_used`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {}

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `password_reset_codes` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `user_type` ENUM('admin', 'user') NOT NULL DEFAULT 'admin',
                `user_id` INT NOT NULL,
                `email` VARCHAR(191) NOT NULL,
                `code` VARCHAR(10) NOT NULL,
                `ip_address` VARCHAR(50) NULL,
                `user_agent` TEXT NULL,
                `expires_at` DATETIME NOT NULL,
                `is_used` TINYINT(1) NOT NULL DEFAULT 0,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_reset_verify` (`user_type`, `user_id`, `code`, `is_used`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {}

    $done = true;
}

function parseDeviceName(?string $userAgent): string {
    if (empty($userAgent)) return 'Unknown Browser / Device';

    $os = 'Unknown OS';
    if (stripos($userAgent, 'Mac OS') !== false || stripos($userAgent, 'Macintosh') !== false) {
        $os = 'macOS';
    } elseif (stripos($userAgent, 'iPhone') !== false) {
        $os = 'iPhone';
    } elseif (stripos($userAgent, 'iPad') !== false) {
        $os = 'iPad';
    } elseif (stripos($userAgent, 'Android') !== false) {
        $os = 'Android';
    } elseif (stripos($userAgent, 'Windows') !== false) {
        $os = 'Windows';
    } elseif (stripos($userAgent, 'Linux') !== false) {
        $os = 'Linux';
    }

    $browser = 'Web Browser';
    if (stripos($userAgent, 'Chrome') !== false && stripos($userAgent, 'Edg') === false) {
        $browser = 'Chrome';
    } elseif (stripos($userAgent, 'Safari') !== false && stripos($userAgent, 'Chrome') === false) {
        $browser = 'Safari';
    } elseif (stripos($userAgent, 'Firefox') !== false) {
        $browser = 'Firefox';
    } elseif (stripos($userAgent, 'Edg') !== false) {
        $browser = 'Edge';
    }

    return "$browser on $os";
}

function maskEmail(string $email): string {
    $parts = explode('@', $email, 2);
    if (count($parts) < 2) return $email;
    $name = $parts[0];
    $domain = $parts[1];
    $len = strlen($name);
    if ($len <= 2) {
        $maskedName = substr($name, 0, 1) . '*';
    } else {
        $maskedName = substr($name, 0, 2) . str_repeat('*', min(4, $len - 2));
    }
    return $maskedName . '@' . $domain;
}

function isDeviceVerified(PDO $pdo, string $userType, int $userId, string $deviceId): bool {
    ensureTwoFactorTables($pdo);

    if (empty($deviceId)) return false;

    // Check if this user has any verified devices recorded
    $checkAny = $pdo->prepare("SELECT COUNT(*) FROM `user_devices` WHERE `user_type` = :ut AND `user_id` = :uid");
    $checkAny->execute([':ut' => $userType, ':uid' => $userId]);
    $totalVerified = (int)$checkAny->fetchColumn();

    // If no devices ever verified, this is first-time login: require 2FA
    if ($totalVerified === 0) {
        return false;
    }

    // Otherwise check if this specific device is recognized
    $stmt = $pdo->prepare("SELECT id FROM `user_devices` WHERE `user_type` = :ut AND `user_id` = :uid AND `device_id` = :did LIMIT 1");
    $stmt->execute([
        ':ut' => $userType,
        ':uid' => $userId,
        ':did' => $deviceId,
    ]);
    return (bool)$stmt->fetch();
}

function generateAndSend2FACode(
    PDO $pdo,
    string $userType,
    int $userId,
    string $email,
    string $fullName,
    string $deviceId,
    string $ip,
    string $userAgent
): array {
    ensureTwoFactorTables($pdo);

    // Invalidate previous unused codes for this session
    $inv = $pdo->prepare("UPDATE `login_otp_codes` SET `is_used` = 1 WHERE `user_type` = :ut AND `user_id` = :uid AND `is_used` = 0");
    $inv->execute([':ut' => $userType, ':uid' => $userId]);

    // Generate 6-digit code
    $code = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    $deviceName = parseDeviceName($userAgent);

    // Expiry: 10 minutes from now
    $ins = $pdo->prepare("
        INSERT INTO `login_otp_codes` (`user_type`, `user_id`, `email`, `code`, `device_id`, `device_name`, `ip_address`, `expires_at`, `is_used`)
        VALUES (:ut, :uid, :em, :code, :did, :dn, :ip, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)
    ");
    $ins->execute([
        ':ut' => $userType,
        ':uid' => $userId,
        ':em' => $email,
        ':code' => $code,
        ':did' => $deviceId,
        ':dn' => $deviceName,
        ':ip' => $ip,
    ]);

    // Temp security token for client verification handshake
    $tempToken = bin2hex(random_bytes(20));
    $_SESSION['vdx_2fa_pending'] = [
        'user_type' => $userType,
        'user_id' => $userId,
        'email' => $email,
        'full_name' => $fullName,
        'device_id' => $deviceId,
        'temp_token' => $tempToken,
        'created_at' => time(),
    ];

    // Build email
    $timeFormatted = date('D, M j, Y · g:i A') . ' (WAT)';
    $htmlBody = "
        <p style='margin: 0 0 16px; font-size: 15px; color: #191715;'>
            A sign-in request was made to your Vivadoxa account from a <strong>new device or first-time login</strong>.
        </p>

        <div style='background: #fff8f3; border: 2px dashed #c96b32; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center;'>
            <div style='font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a24a18; font-weight: 700; margin-bottom: 8px;'>Your 6-Digit One-Time Code</div>
            <div style='font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #0b0b0b; font-family: monospace;'>{$code}</div>
            <div style='font-size: 12px; color: #78716c; margin-top: 8px;'>Valid for 10 minutes · Do not share this code with anyone</div>
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
            If you did not initiate this sign-in attempt, please secure your password immediately or alert the Vivadoxa Security Desk at admissions@vivadoxamusic.com.
        </p>
    ";

    $emailTemplate = buildBrandedEmailTemplate([
        'title' => 'Sign-In Verification Code',
        'badge' => 'Account Security',
        'headline' => 'Sign-In Security Verification',
        'clientName' => $fullName,
        'bodyHtml' => $htmlBody,
        'deptName' => 'Vivadoxa Security Desk',
        'deptEmail' => 'info@vivadoxamusic.com',
    ]);

    // Send the email (do not BCC official gmail to preserve privacy of OTP codes)
    sendSystemEmail(
        $email,
        "{$code} is your Vivadoxa sign-in verification code",
        $emailTemplate,
        null,
        'security',
        false
    );

    return [
        'requires_2fa' => true,
        'temp_token' => $tempToken,
        'email_masked' => maskEmail($email),
        'device_id' => $deviceId,
        'device_name' => $deviceName,
        'user_type' => $userType,
        'user_id' => $userId,
        'message' => 'A 6-digit verification code has been sent to ' . maskEmail($email) . ' to verify this new device.',
    ];
}

function verify2FACode(
    PDO $pdo,
    string $userType,
    int $userId,
    string $code,
    string $deviceId,
    string $ip,
    string $userAgent
): array {
    ensureTwoFactorTables($pdo);

    $cleanCode = trim(preg_replace('/[^0-9]/', '', $code));
    if (strlen($cleanCode) !== 6) {
        return ['success' => false, 'error' => 'Please enter the complete 6-digit verification code.'];
    }

    $stmt = $pdo->prepare("
        SELECT id, expires_at, is_used
        FROM `login_otp_codes`
        WHERE `user_type` = :ut
          AND `user_id` = :uid
          AND `code` = :cd
          AND `is_used` = 0
          AND `expires_at` > NOW()
        ORDER BY id DESC
        LIMIT 1
    ");
    $stmt->execute([
        ':ut' => $userType,
        ':uid' => $userId,
        ':cd' => $cleanCode,
    ]);
    $otpRow = $stmt->fetch();

    if (!$otpRow) {
        return ['success' => false, 'error' => 'Invalid or expired verification code. Please check your email or request a new code.'];
    }

    // Mark code as used
    $pdo->prepare("UPDATE `login_otp_codes` SET `is_used` = 1 WHERE `id` = :id")->execute([':id' => $otpRow['id']]);

    // Register this device as verified
    $deviceName = parseDeviceName($userAgent);
    try {
        $reg = $pdo->prepare("
            INSERT INTO `user_devices` (`user_type`, `user_id`, `device_id`, `device_name`, `ip_address`, `user_agent`, `verified_at`)
            VALUES (:ut, :uid, :did, :dn, :ip, :ua, NOW())
            ON DUPLICATE KEY UPDATE
                `device_name` = VALUES(`device_name`),
                `ip_address` = VALUES(`ip_address`),
                `user_agent` = VALUES(`user_agent`),
                `verified_at` = NOW()
        ");
        $reg->execute([
            ':ut' => $userType,
            ':uid' => $userId,
            ':did' => $deviceId,
            ':dn' => $deviceName,
            ':ip' => $ip,
            ':ua' => $userAgent,
        ]);
    } catch (Exception $e) {}

    // Clear pending session
    unset($_SESSION['vdx_2fa_pending']);

    return ['success' => true];
}
