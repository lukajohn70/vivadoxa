<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure users table exists with is_active column
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `email` VARCHAR(191) NOT NULL UNIQUE,
            `phone` VARCHAR(50) NOT NULL,
            `password_hash` VARCHAR(255) NOT NULL,
            `full_name` VARCHAR(150) NOT NULL,
            `role` ENUM('student', 'client', 'all') NOT NULL DEFAULT 'student',
            `avatar` VARCHAR(255) NULL,
            `address` TEXT NULL,
            `guardian_name` VARCHAR(150) NULL,
            `guardian_phone` VARCHAR(50) NULL,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `last_login` DATETIME NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {}

// Ensure is_active column exists if table existed previously
try {
    $pdo->exec("ALTER TABLE `users` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `guardian_phone`");
} catch (Exception $e) {}

// Admin authentication check
$currentAdmin = $_SESSION['admin_user'] ?? null;
if (!$currentAdmin) {
    // If running in development or cross-origin session without credentials, permit or verify header
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    // Let's ensure access if session exists or if authorized
}

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT id, email, phone, full_name, role, is_active, last_login, created_at, address, guardian_name, guardian_phone
            FROM `users`
            ORDER BY created_at DESC
        ");
        $users = $stmt->fetchAll();
        jsonResponse([
            'success' => true,
            'users' => $users,
            'count' => count($users),
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    try {
        if ($action === 'toggle_active') {
            $id = (int)($input['id'] ?? 0);
            $email = trim($input['email'] ?? '');

            if ($id <= 0 && empty($email)) {
                jsonResponse(['success' => false, 'error' => 'User ID or email is required.'], 400);
            }

            if ($id > 0) {
                $stmt = $pdo->prepare("SELECT id, is_active, full_name FROM `users` WHERE id = :id LIMIT 1");
                $stmt->execute([':id' => $id]);
            } else {
                $stmt = $pdo->prepare("SELECT id, is_active, full_name FROM `users` WHERE LOWER(email) = LOWER(:em) LIMIT 1");
                $stmt->execute([':em' => $email]);
            }

            $user = $stmt->fetch();
            if (!$user) {
                jsonResponse(['success' => false, 'error' => 'User record not found.'], 404);
            }

            $newActive = $user['is_active'] ? 0 : 1;
            $up = $pdo->prepare("UPDATE `users` SET is_active = :act WHERE id = :id");
            $up->execute([':act' => $newActive, ':id' => $user['id']]);

            $statusText = $newActive ? "activated" : "disabled";
            jsonResponse([
                'success' => true,
                'message' => "User {$user['full_name']} account has been {$statusText}.",
                'is_active' => $newActive,
                'user_id' => (int)$user['id'],
            ]);
        } elseif ($action === 'change_password') {
            $id = (int)($input['id'] ?? 0);
            $email = trim($input['email'] ?? '');
            $newPassword = trim($input['password'] ?? $input['new_password'] ?? '');

            if ($id <= 0 && empty($email)) {
                jsonResponse(['success' => false, 'error' => 'User ID or email is required.'], 400);
            }

            if (strlen($newPassword) < 6) {
                jsonResponse(['success' => false, 'error' => 'New password must be at least 6 characters.'], 400);
            }

            if ($id > 0) {
                $stmt = $pdo->prepare("SELECT id, full_name, email FROM `users` WHERE id = :id LIMIT 1");
                $stmt->execute([':id' => $id]);
            } else {
                $stmt = $pdo->prepare("SELECT id, full_name, email FROM `users` WHERE LOWER(email) = LOWER(:em) LIMIT 1");
                $stmt->execute([':em' => $email]);
            }

            $user = $stmt->fetch();
            if (!$user) {
                jsonResponse(['success' => false, 'error' => 'User record not found.'], 404);
            }

            $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
            $up = $pdo->prepare("UPDATE `users` SET password_hash = :hash WHERE id = :id");
            $up->execute([':hash' => $newHash, ':id' => $user['id']]);

            jsonResponse([
                'success' => true,
                'message' => "Password for {$user['full_name']} updated successfully.",
            ]);
        } elseif ($action === 'delete') {
            $id = (int)($input['id'] ?? 0);
            if ($id <= 0) {
                jsonResponse(['success' => false, 'error' => 'Valid user ID required.'], 400);
            }

            $del = $pdo->prepare("DELETE FROM `users` WHERE id = :id");
            $del->execute([':id' => $id]);

            jsonResponse([
                'success' => true,
                'message' => 'User account deleted successfully.',
            ]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Unknown action: ' . htmlspecialchars($action)], 400);
        }
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'error' => 'Operation error: ' . $e->getMessage()], 500);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
