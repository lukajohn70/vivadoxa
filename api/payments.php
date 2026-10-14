<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $ref = trim($_GET['ref'] ?? '');
    if (!empty($ref)) {
        $stmt = $pdo->prepare("SELECT * FROM `payments` WHERE reference = :ref OR application_no = :ref LIMIT 1");
        $stmt->execute([':ref' => $ref]);
        $row = $stmt->fetch();
        if ($row) {
            jsonResponse(['success' => true, 'data' => $row]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Payment not found.'], 404);
        }
    }

    $stmt = $pdo->query("SELECT * FROM `payments` ORDER BY created_at DESC LIMIT 100");
    $rows = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $rows]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: Update payment status (Admin verification) ────────────────────
    if ($action === 'update_status') {
        $ref = trim($input['reference'] ?? '');
        $id = (int)($input['id'] ?? 0);
        $newStatus = trim($input['status'] ?? 'verified');

        $validStatuses = ['pending', 'verified', 'declined'];
        if (!in_array($newStatus, $validStatuses, true)) {
            jsonResponse(['success' => false, 'error' => "Invalid status: $newStatus"], 400);
        }

        if (!empty($ref)) {
            $stmt = $pdo->prepare("
                UPDATE `payments`
                SET `status` = :st, `verified_at` = CASE WHEN :st = 'verified' THEN NOW() ELSE `verified_at` END
                WHERE `reference` = :ref
            ");
            $stmt->execute([':st' => $newStatus, ':ref' => $ref]);

            // If verified and has application_no, also update the application to 'approved'
            if ($newStatus === 'verified') {
                $payStmt = $pdo->prepare("SELECT `application_no` FROM `payments` WHERE `reference` = :ref");
                $payStmt->execute([':ref' => $ref]);
                $payRow = $payStmt->fetch();
                if (!empty($payRow['application_no'])) {
                    $upApp = $pdo->prepare("UPDATE `applications` SET `status` = 'approved' WHERE `application_no` = :no");
                    $upApp->execute([':no' => $payRow['application_no']]);
                }
            }
        } elseif ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE `payments`
                SET `status` = :st, `verified_at` = CASE WHEN :st = 'verified' THEN NOW() ELSE `verified_at` END
                WHERE `id` = :id
            ");
            $stmt->execute([':st' => $newStatus, ':id' => $id]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Payment reference or ID required.'], 400);
        }

        jsonResponse(['success' => true, 'message' => "Payment marked as '$newStatus'."]);
    }

    // ── Action: Create / submit payment proof ─────────────────────────────────
    $payerName = trim($input['payerName'] ?? $input['payer_name'] ?? '');
    $payerEmail = trim($input['payerEmail'] ?? $input['payer_email'] ?? '');
    $amount = (float)($input['amountPaid'] ?? $input['amount'] ?? 0);
    $reference = trim($input['transactionRef'] ?? $input['reference'] ?? ('REF-VDX-' . rand(10000, 99999)));
    $appNo = trim($input['applicationNo'] ?? $input['application_no'] ?? '');
    $methodType = trim($input['method'] ?? 'Bank Transfer');
    $notes = trim($input['notes'] ?? ('Payment Date: ' . ($input['paymentDate'] ?? date('Y-m-d'))));

    if (empty($payerName) || $amount <= 0) {
        jsonResponse(['success' => false, 'error' => 'Please provide payer name and payment amount.'], 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO `payments` (`reference`, `application_no`, `payer_name`, `payer_email`, `amount`, `method`, `status`, `notes`)
        VALUES (:ref, :app_no, :name, :email, :amt, :method, 'pending', :notes)
        ON DUPLICATE KEY UPDATE
            `payer_name` = VALUES(`payer_name`),
            `amount` = VALUES(`amount`),
            `notes` = VALUES(`notes`)
    ");

    $stmt->execute([
        ':ref' => $reference,
        ':app_no' => !empty($appNo) ? $appNo : null,
        ':name' => $payerName,
        ':email' => $payerEmail,
        ':amt' => $amount,
        ':method' => $methodType,
        ':notes' => $notes,
    ]);

    jsonResponse([
        'success' => true,
        'reference' => $reference,
        'message' => 'Proof of payment submitted successfully.',
    ], 201);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
