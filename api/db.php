<?php
// ─── Database connection & common helpers for Vivadoxa ─────────────────────────
ini_set('memory_limit', '256M');

// CORS headers for Vite dev server & production
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
    session_start();
}

function getEnvVar(string $key, string $default = ''): string {
    static $env = null;
    if ($env === null) {
        $env = [];
        $envPath = dirname(__DIR__) . '/.env';
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line && $line[0] !== '#' && strpos($line, '=') !== false) {
                    list($k, $v) = explode('=', $line, 2);
                    $env[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
                }
            }
        }
    }
    return getenv($key) ?: ($env[$key] ?? $default);
}

function tryGetDb(): ?PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = getEnvVar('DB_HOST', '127.0.0.1');
    $port = (int)getEnvVar('DB_PORT', '3306');
    $dbname = getEnvVar('DB_NAME', 'vivadoxa');
    $user = getEnvVar('DB_USER', 'root');
    $pass = getEnvVar('DB_PASS', 'root');
    $socket = getEnvVar('DB_SOCKET', '/Applications/MAMP/tmp/mysql/mysql.sock');

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => true,
    ];

    try {
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $pass, $options);
        return $pdo;
    } catch (PDOException $tcpEx) {
        if (file_exists($socket)) {
            try {
                $pdo = new PDO("mysql:unix_socket=$socket;dbname=$dbname;charset=utf8mb4", $user, $pass, $options);
                return $pdo;
            } catch (PDOException $sockEx) {}
        }
        return null;
    }
}

function getDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = getEnvVar('DB_HOST', '127.0.0.1');
    $port = (int)getEnvVar('DB_PORT', '3306');
    $dbname = getEnvVar('DB_NAME', 'vivadoxa');
    $user = getEnvVar('DB_USER', 'root');
    $pass = getEnvVar('DB_PASS', 'root');
    $socket = getEnvVar('DB_SOCKET', '/Applications/MAMP/tmp/mysql/mysql.sock');

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => true,
    ];

    // Try TCP first
    try {
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $pass, $options);
        return $pdo;
    } catch (PDOException $tcpEx) {
        // Fallback to MAMP Unix socket if available
        if (file_exists($socket)) {
            try {
                $pdo = new PDO("mysql:unix_socket=$socket;dbname=$dbname;charset=utf8mb4", $user, $pass, $options);
                return $pdo;
            } catch (PDOException $sockEx) {
                // fall through to error
            }
        }

        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $tcpEx->getMessage(),
        ]);
        exit;
    }
}

function jsonResponse(array $data, int $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    $json = json_encode($data, JSON_INVALID_UTF8_SUBSTITUTE | JSON_PARTIAL_OUTPUT_ON_ERROR);
    if ($json === false) {
        $json = json_encode([
            'success' => false,
            'error' => 'JSON encoding failed: ' . json_last_error_msg(),
        ]);
    }
    echo $json;
    exit;
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (!$raw && php_sapi_name() === 'cli') {
        $raw = file_get_contents('php://stdin');
    }
    if (!$raw) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}

/**
 * Save an uploaded image file into all web-accessible media directories:
 * 1. $baseDir/media/$subfolder (cPanel Apache webroot direct access)
 * 2. $baseDir/public/media/$subfolder (Vite dev server)
 * 3. $baseDir/dist/media/$subfolder (Local production build)
 */
function saveMediaImage(array $fileInfo, string $subfolder, string $prefix = 'img'): array {
    $errorCode = $fileInfo['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($errorCode !== UPLOAD_ERR_OK) {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMsg = 'Uploaded image file exceeds server size limits (upload_max_filesize).';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMsg = 'Image file upload was only partially completed. Please try again.';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMsg = 'No file was selected for upload.';
                break;
            default:
                $errorMsg = 'File upload error (Code ' . $errorCode . ').';
                break;
        }
        return ['success' => false, 'error' => $errorMsg];
    }

    $fileTmp = $fileInfo['tmp_name'];
    $origName = basename($fileInfo['name']);
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg', 'jfif'];
    if (!in_array($ext, $allowedExts)) {
        return ['success' => false, 'error' => 'Invalid file format (.' . $ext . '). Supported formats: JPG, PNG, WEBP, GIF, AVIF, SVG.'];
    }

    $safeName = $prefix . '-' . time() . '-' . rand(100, 999) . '.' . $ext;
    $baseDir = dirname(__DIR__);

    $primaryDir = $baseDir . '/media/' . $subfolder;
    $publicDir = $baseDir . '/public/media/' . $subfolder;
    $distDir = $baseDir . '/dist/media/' . $subfolder;

    $allDirs = [$primaryDir, $publicDir, $distDir];
    foreach ($allDirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }

    $saved = false;
    $primaryPath = $primaryDir . '/' . $safeName;
    if (move_uploaded_file($fileTmp, $primaryPath)) {
        $saved = true;
        @chmod($primaryPath, 0644);
    } else {
        // Fallback: write to public directory
        $publicPath = $publicDir . '/' . $safeName;
        if (move_uploaded_file($fileTmp, $publicPath)) {
            $saved = true;
            $primaryPath = $publicPath;
            @chmod($publicPath, 0644);
        }
    }

    if (!$saved) {
        return ['success' => false, 'error' => 'Failed to write uploaded image to server storage. Please check disk permissions.'];
    }

    // Mirror to other media directories so it is accessible in all environments
    foreach ($allDirs as $dir) {
        $targetFile = $dir . '/' . $safeName;
        if ($targetFile !== $primaryPath) {
            @copy($primaryPath, $targetFile);
            @chmod($targetFile, 0644);
        }
    }

    $webUrl = '/media/' . $subfolder . '/' . $safeName;

    return [
        'success' => true,
        'message' => 'Image uploaded successfully.',
        'image_url' => $webUrl,
        'filename' => $safeName,
    ];
}

/**
 * Convert base64 data URI (data:image/...) to a static file in all media directories.
 */
function saveBase64MediaImage(string $dataUri, string $subfolder, string $prefix = 'img'): ?string {
    if (!preg_match('#^data:image/([a-zA-Z0-9\+\-\.]+);base64,(.+)$#i', $dataUri, $matches)) {
        return null;
    }

    $rawExt = strtolower($matches[1]);
    $extMap = [
        'jpeg' => 'jpeg',
        'jpg' => 'jpeg',
        'png' => 'png',
        'webp' => 'webp',
        'gif' => 'gif',
        'svg+xml' => 'svg',
    ];
    $ext = $extMap[$rawExt] ?? 'jpeg';

    $binaryData = base64_decode($matches[2]);
    if ($binaryData === false || strlen($binaryData) < 10) {
        return null;
    }

    $safeName = $prefix . '-' . time() . '-' . rand(100, 999) . '.' . $ext;
    $baseDir = dirname(__DIR__);

    $primaryDir = $baseDir . '/media/' . $subfolder;
    $publicDir = $baseDir . '/public/media/' . $subfolder;
    $distDir = $baseDir . '/dist/media/' . $subfolder;

    $allDirs = [$primaryDir, $publicDir, $distDir];
    foreach ($allDirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }

    $primaryPath = $primaryDir . '/' . $safeName;
    if (@file_put_contents($primaryPath, $binaryData) === false) {
        $primaryPath = $publicDir . '/' . $safeName;
        if (@file_put_contents($primaryPath, $binaryData) === false) {
            return null;
        }
    }

    @chmod($primaryPath, 0644);

    foreach ($allDirs as $dir) {
        $targetFile = $dir . '/' . $safeName;
        if ($targetFile !== $primaryPath) {
            @file_put_contents($targetFile, $binaryData);
            @chmod($targetFile, 0644);
        }
    }

    return '/media/' . $subfolder . '/' . $safeName;
}

/**
 * Ensure all required columns exist in the applications table.
 */
function ensureApplicationSchema(PDO $pdo): void {
    static $ensured = false;
    if ($ensured) return;
    $ensured = true;

    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `applications`")->fetchAll(PDO::FETCH_COLUMN);
        $existing = array_map('strtolower', $cols ?: []);

        $needed = [
            'class_type' => "ALTER TABLE `applications` ADD COLUMN `class_type` VARCHAR(100) DEFAULT 'Regular classes'",
            'state_of_origin' => "ALTER TABLE `applications` ADD COLUMN `state_of_origin` VARCHAR(100) NULL",
            'marital_status' => "ALTER TABLE `applications` ADD COLUMN `marital_status` VARCHAR(50) DEFAULT 'Single'",
            'nationality' => "ALTER TABLE `applications` ADD COLUMN `nationality` VARCHAR(100) DEFAULT 'Nigerian'",
            'occupation' => "ALTER TABLE `applications` ADD COLUMN `occupation` VARCHAR(100) NULL",
            'sponsor' => "ALTER TABLE `applications` ADD COLUMN `sponsor` VARCHAR(150) NULL",
            'session_time' => "ALTER TABLE `applications` ADD COLUMN `session_time` VARCHAR(100) DEFAULT 'Morning Section (10 AM-1 PM)'",
            'duration' => "ALTER TABLE `applications` ADD COLUMN `duration` VARCHAR(50) DEFAULT '3 Months'",
            'currency' => "ALTER TABLE `applications` ADD COLUMN `currency` VARCHAR(10) DEFAULT 'NGN'",
            'tuition_fee' => "ALTER TABLE `applications` ADD COLUMN `tuition_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00",
            'passport_photo' => "ALTER TABLE `applications` ADD COLUMN `passport_photo` LONGTEXT NULL",
            'letter_released' => "ALTER TABLE `applications` ADD COLUMN `letter_released` TINYINT(1) NOT NULL DEFAULT 0",
            'payment_status' => "ALTER TABLE `applications` ADD COLUMN `payment_status` ENUM('pending', 'verified', 'declined') NOT NULL DEFAULT 'pending'",
            'dob' => "ALTER TABLE `applications` ADD COLUMN `dob` DATE NULL",
            'gender' => "ALTER TABLE `applications` ADD COLUMN `gender` VARCHAR(20) NULL",
            'guardian_name' => "ALTER TABLE `applications` ADD COLUMN `guardian_name` VARCHAR(100) NULL",
            'guardian_phone' => "ALTER TABLE `applications` ADD COLUMN `guardian_phone` VARCHAR(50) NULL",
            'address' => "ALTER TABLE `applications` ADD COLUMN `address` TEXT NULL",
        ];

        foreach ($needed as $col => $sql) {
            if (!in_array(strtolower($col), $existing, true)) {
                try {
                    $pdo->exec($sql);
                } catch (Throwable $alterEx) {}
            }
        }
    } catch (Throwable $e) {}
}

/**
 * Auto-reconcile any payments that have an application_no not yet in applications table.
 */
function reconcileOrphanedPayments(PDO $pdo): void {
    static $reconciled = false;
    if ($reconciled) return;
    $reconciled = true;

    try {
        $stmt = $pdo->query("
            SELECT p.* 
            FROM `payments` p 
            LEFT JOIN `applications` a ON LOWER(TRIM(p.application_no)) = LOWER(TRIM(a.application_no))
            WHERE a.id IS NULL 
              AND p.application_no IS NOT NULL 
              AND TRIM(p.application_no) != ''
        ");
        $orphans = $stmt ? $stmt->fetchAll() : [];

        foreach ($orphans as $p) {
            $appNo = trim($p['application_no']);
            $payerName = trim($p['payer_name'] ?? '');
            $payerEmail = trim($p['payer_email'] ?? '');
            $amount = (float)($p['amount'] ?? 55000.00);
            $payStatus = $p['status'] ?? 'pending';
            $isVerified = ($payStatus === 'verified');
            $appStatus = $isVerified ? 'approved' : 'pending';
            $letterRel = $isVerified ? 1 : 0;
            $createdAt = !empty($p['created_at']) ? $p['created_at'] : date('Y-m-d H:i:s');

            $nameParts = preg_split('/\s+/', $payerName, 2);
            $firstName = $nameParts[0] ?: 'Student';
            $lastName = $nameParts[1] ?? 'Applicant';

            // Check if application exists by email
            $existingApp = null;
            if (!empty($payerEmail)) {
                $chk = $pdo->prepare("SELECT * FROM `applications` WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) AND (application_no IS NULL OR application_no = '' OR application_no = :ano) LIMIT 1");
                $chk->execute([':em' => $payerEmail, ':ano' => $appNo]);
                $existingApp = $chk->fetch();
            }

            if ($existingApp) {
                $pdo->prepare("
                    UPDATE `applications` 
                    SET `application_no` = :ano,
                        `tuition_fee` = :fee,
                        `status` = CASE WHEN :v = 1 THEN 'approved' ELSE `status` END,
                        `payment_status` = :pst,
                        `letter_released` = CASE WHEN :v = 1 THEN 1 ELSE `letter_released` END
                    WHERE `id` = :id
                ")->execute([
                    ':ano' => $appNo,
                    ':fee' => $amount,
                    ':v' => $isVerified ? 1 : 0,
                    ':pst' => $payStatus,
                    ':id' => $existingApp['id']
                ]);
            } else {
                $ins = $pdo->prepare("
                    INSERT INTO `applications`
                    (`application_no`, `first_name`, `last_name`, `email`, `phone`, `program`, `study_mode`, `skill_level`, `status`, `payment_status`, `tuition_fee`, `letter_released`, `created_at`)
                    VALUES (:no, :fn, :ln, :em, '', 'Music Academy Course', 'Onsite', 'Beginner', :st, :pst, :fee, :rel, :cat)
                ");
                $ins->execute([
                    ':no' => $appNo,
                    ':fn' => $firstName,
                    ':ln' => $lastName,
                    ':em' => $payerEmail,
                    ':st' => $appStatus,
                    ':pst' => $payStatus,
                    ':fee' => $amount,
                    ':rel' => $letterRel,
                    ':cat' => $createdAt
                ]);
            }

            // Also ensure student account in users table if email is present
            if (!empty($payerEmail)) {
                try {
                    $uCheck = $pdo->prepare("SELECT id FROM `users` WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) LIMIT 1");
                    $uCheck->execute([':em' => $payerEmail]);
                    if (!$uCheck->fetch()) {
                        $uPass = password_hash('StudentPass2025!', PASSWORD_BCRYPT);
                        $pdo->prepare("
                            INSERT INTO `users` (`full_name`, `email`, `password_hash`, `role`, `is_active`)
                            VALUES (:fn, :em, :pw, 'student', 1)
                        ")->execute([
                            ':fn' => $payerName,
                            ':em' => $payerEmail,
                            ':pw' => $uPass
                        ]);
                    }
                } catch (Throwable $uEx) {}
            }
        }
    } catch (Throwable $reconEx) {
        error_log("Reconcile error: " . $reconEx->getMessage());
    }
}
