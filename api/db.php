<?php
// ─── Database connection & common helpers for Vivadoxa ─────────────────────────

// CORS headers for Vite dev server & production
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (session_status() === PHP_SESSION_NONE) {
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
                    $env[trim($k)] = trim($v);
                }
            }
        }
    }
    return getenv($key) ?: ($env[$key] ?? $default);
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
        PDO::ATTR_EMULATE_PREPARES => false,
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
