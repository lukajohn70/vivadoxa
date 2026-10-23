<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$input = getJsonInput();
$emailOrUsername = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($emailOrUsername) || empty($password)) {
    jsonResponse(['success' => false, 'error' => 'Please enter both your email/username and password.'], 400);
}

try {
    $pdo = getDb();

    // Support full email (e.g. admin@vivadoxa.ng) or username alias (e.g. admin)
    $cleanInput = strtolower($emailOrUsername);
    if (strpos($cleanInput, '@') === false) {
        $emailCandidate = $cleanInput . '@vivadoxa.ng';
    } else {
        $emailCandidate = $cleanInput;
    }

    $stmt = $pdo->prepare("
        SELECT id, email, password_hash, name, role, is_active
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

    // Update last_login
    $pdo->prepare("UPDATE admins SET last_login = NOW() WHERE id = :id")->execute([':id' => $admin['id']]);

    // Set session
    $_SESSION['admin_user'] = [
        'id' => (int)$admin['id'],
        'email' => $admin['email'],
        'name' => $admin['name'],
        'role' => $admin['role'],
    ];

    jsonResponse([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => (int)$admin['id'],
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
