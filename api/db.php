<?php
// ─── Database connection & common helpers for Vivadoxa ─────────────────────────

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
    echo json_encode($data);
    exit;
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
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
        $errorMsg = match ($errorCode) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Uploaded image file exceeds server size limits (upload_max_filesize).',
            UPLOAD_ERR_PARTIAL => 'Image file upload was only partially completed. Please try again.',
            UPLOAD_ERR_NO_FILE => 'No file was selected for upload.',
            default => 'File upload error (Code ' . $errorCode . ').',
        };
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
    $ext = match ($rawExt) {
        'jpeg', 'jpg' => 'jpeg',
        'png' => 'png',
        'webp' => 'webp',
        'gif' => 'gif',
        'svg+xml' => 'svg',
        default => 'jpeg',
    };

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
