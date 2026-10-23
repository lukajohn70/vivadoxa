<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `enquiries` ORDER BY created_at DESC LIMIT 100");
    $rows = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $rows, 'enquiries' => $rows]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: Delete enquiry (Admin) ────────────────────────────────────────
    if ($action === 'delete') {
        $id = (int)($input['id'] ?? 0);
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM `enquiries` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            jsonResponse(['success' => true, 'message' => 'Enquiry record deleted successfully.']);
        }
        jsonResponse(['success' => false, 'error' => 'Valid enquiry ID required.'], 400);
    }

    // ── Action: Mark enquiry read / unread ────────────────────────────────────
    if ($action === 'mark_read') {
        $id = (int)($input['id'] ?? 0);
        $isRead = isset($input['is_read']) ? (int)$input['is_read'] : 1;

        if ($id <= 0) {
            jsonResponse(['success' => false, 'error' => 'Valid enquiry ID required.'], 400);
        }

        $stmt = $pdo->prepare("UPDATE `enquiries` SET `is_read` = :rd WHERE `id` = :id");
        $stmt->execute([':rd' => $isRead, ':id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Enquiry status updated.']);
    }

    // ── Action: Submit public enquiry ─────────────────────────────────────────
    $name = trim($input['fullName'] ?? $input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $subject = trim($input['subject'] ?? 'General Enquiry');
    $message = trim($input['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        jsonResponse(['success' => false, 'error' => 'Please fill in your name, email, and message.'], 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO `enquiries` (`name`, `email`, `phone`, `subject`, `message`, `is_read`)
        VALUES (:name, :email, :phone, :subj, :msg, 0)
    ");
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':subj' => $subject,
        ':msg' => $message,
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Your message has been sent to the Vivadoxa admissions team.',
    ], 201);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
