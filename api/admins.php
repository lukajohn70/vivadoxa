<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure session
$currentAdmin = $_SESSION['admin_user'] ?? null;

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT id, email, name, role, is_active, last_login, created_at
            FROM admins
            ORDER BY id ASC
        ");
        $admins = $stmt->fetchAll();
        jsonResponse([
            'success' => true,
            'admins' => $admins,
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? 'add');

    try {
        if ($action === 'add') {
            $name = trim($input['name'] ?? '');
            $email = trim($input['email'] ?? '');
            $role = trim($input['role'] ?? 'staff');
            $password = trim($input['password'] ?? '');

            if (empty($name) || empty($email) || empty($password)) {
                jsonResponse(['success' => false, 'error' => 'Name, email, and password are required.'], 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL) && strpos($email, '@') === false) {
                $email = strtolower($email) . '@vivadoxa.ng';
            }

            // Check duplicate
            $stmt = $pdo->prepare("SELECT id FROM admins WHERE LOWER(email) = LOWER(:email) LIMIT 1");
            $stmt->execute([':email' => $email]);
            if ($stmt->fetch()) {
                jsonResponse(['success' => false, 'error' => 'A staff account with this email already exists.'], 409);
            }

            $hash = password_hash($password, PASSWORD_BCRYPT);
            $ins = $pdo->prepare("
                INSERT INTO `admins` (`name`, `email`, `role`, `password_hash`, `is_active`)
                VALUES (:name, :email, :role, :hash, 1)
            ");
            $ins->execute([
                ':name' => $name,
                ':email' => $email,
                ':role' => $role,
                ':hash' => $hash,
            ]);

            jsonResponse([
                'success' => true,
                'message' => "Staff member $name added successfully.",
                'id' => (int)$pdo->lastInsertId(),
            ], 201);
        } elseif ($action === 'update') {
            $id = (int)($input['id'] ?? 0);
            $name = trim($input['name'] ?? '');
            $email = trim($input['email'] ?? '');
            $role = trim($input['role'] ?? 'staff');
            $newPass = trim($input['password'] ?? '');

            if ($id <= 0 || empty($name) || empty($email)) {
                jsonResponse(['success' => false, 'error' => 'Valid ID, name, and email are required.'], 400);
            }

            if (!empty($newPass)) {
                $hash = password_hash($newPass, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("
                    UPDATE `admins`
                    SET `name` = :name, `email` = :email, `role` = :role, `password_hash` = :hash
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':name' => $name,
                    ':email' => $email,
                    ':role' => $role,
                    ':hash' => $hash,
                    ':id' => $id,
                ]);
            } else {
                $stmt = $pdo->prepare("
                    UPDATE `admins`
                    SET `name` = :name, `email` = :email, `role` = :role
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':name' => $name,
                    ':email' => $email,
                    ':role' => $role,
                    ':id' => $id,
                ]);
            }

            jsonResponse(['success' => true, 'message' => "Staff member details updated."]);
        } elseif ($action === 'toggle_active') {
            $id = (int)($input['id'] ?? 0);
            if ($id === 1) {
                jsonResponse(['success' => false, 'error' => 'Primary Superadmin cannot be deactivated.'], 403);
            }

            $stmt = $pdo->prepare("SELECT is_active FROM admins WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            if (!$row) {
                jsonResponse(['success' => false, 'error' => 'Staff record not found.'], 404);
            }

            $newActive = $row['is_active'] ? 0 : 1;
            $pdo->prepare("UPDATE admins SET is_active = :act WHERE id = :id")->execute([
                ':act' => $newActive,
                ':id' => $id,
            ]);

            jsonResponse([
                'success' => true,
                'message' => $newActive ? "Staff account activated." : "Staff account deactivated.",
                'is_active' => $newActive,
            ]);
        } elseif ($action === 'delete') {
            $id = (int)($input['id'] ?? 0);
            if ($id === 1) {
                jsonResponse(['success' => false, 'error' => 'Primary Superadmin account cannot be deleted.'], 403);
            }

            if ($currentAdmin && (int)$currentAdmin['id'] === $id) {
                jsonResponse(['success' => false, 'error' => 'You cannot delete your own logged-in account.'], 403);
            }

            $stmt = $pdo->prepare("DELETE FROM admins WHERE id = :id");
            $stmt->execute([':id' => $id]);

            jsonResponse(['success' => true, 'message' => 'Staff account deleted successfully.']);
        } else {
            jsonResponse(['success' => false, 'error' => 'Unknown action.'], 400);
        }
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'error' => 'Database operation error: ' . $e->getMessage()], 500);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
