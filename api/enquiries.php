<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `enquiries` ORDER BY created_at DESC LIMIT 200");
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

    // ── Action: Submit public enquiry (Contact / Store / Rentals / General) ──
    $name    = trim($input['fullName'] ?? $input['name'] ?? '');
    $email   = trim($input['email'] ?? '');
    $phone   = trim($input['phone'] ?? '');
    $subject = trim($input['subject'] ?? 'General Enquiry');
    $source  = trim($input['source'] ?? 'contact'); // 'contact' | 'store' | 'rentals' | 'general'
    $type    = trim($input['type']   ?? 'general'); // 'quote' | 'reservation' | 'contact' | 'general'

    // Build the message body from either a pre-built message or individual fields
    $message = trim($input['message'] ?? '');

    // For Store / Rentals that pass structured fields, compose a message if none provided
    if (empty($message)) {
        $parts = [];
        $equipList = $input['equipmentList'] ?? $input['equipment_list'] ?? $input['items'] ?? null;
        if ($equipList) {
            $listStr = is_array($equipList) ? implode(', ', $equipList) : $equipList;
            $parts[] = "Equipment / Items: $listStr";
        }
        foreach (['duration','intake','intakeMethod','collectionMethod','budget','instrumentPlayed',
                  'instrumentNeeded','clientType','notes','additionalNotes','address','pickupAddress'] as $fld) {
            $val = trim($input[$fld] ?? '');
            if ($val !== '') {
                $label = ucfirst(preg_replace('/(?<!^)[A-Z]/', ' $0', $fld));
                $parts[] = "$label: $val";
            }
        }
        $message = implode("\n", $parts);
    }

    // Require at minimum a name and either email or phone
    if (empty($name)) {
        jsonResponse(['success' => false, 'error' => 'Please provide your name.'], 400);
    }
    if (empty($email) && empty($phone)) {
        jsonResponse(['success' => false, 'error' => 'Please provide at least a phone number or email address.'], 400);
    }
    if (empty($message)) {
        jsonResponse(['success' => false, 'error' => 'Please describe your enquiry or requirements.'], 400);
    }

    // Ensure `source` and `type` columns exist (idempotent migration)
    try {
        $pdo->exec("ALTER TABLE `enquiries` ADD COLUMN `source` VARCHAR(50) NOT NULL DEFAULT 'contact'");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `enquiries` ADD COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'general'");
    } catch (Exception $e) {}

    $stmt = $pdo->prepare("
        INSERT INTO `enquiries` (`name`, `email`, `phone`, `subject`, `message`, `source`, `type`, `is_read`)
        VALUES (:name, :email, :phone, :subj, :msg, :src, :typ, 0)
    ");
    $stmt->execute([
        ':name'  => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':subj'  => $subject,
        ':msg'   => $message,
        ':src'   => $source,
        ':typ'   => $type,
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Your enquiry has been received. The Vivadoxa team will be in touch shortly.',
    ], 201);

} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
