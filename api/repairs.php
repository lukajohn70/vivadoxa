<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $code = trim($_GET['code'] ?? $_GET['tracking_code'] ?? '');
    if (!empty($code)) {
        $stmt = $pdo->prepare("SELECT * FROM `repairs` WHERE tracking_code = :code LIMIT 1");
        $stmt->execute([':code' => $code]);
        $row = $stmt->fetch();
        if ($row) {
            jsonResponse(['success' => true, 'data' => $row]);
        } else {
            jsonResponse(['success' => false, 'error' => 'No repair order found matching this tracking code.'], 404);
        }
    }

    $stmt = $pdo->query("SELECT * FROM `repairs` ORDER BY created_at DESC LIMIT 100");
    $rows = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $rows]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: Update repair status (Admin / Workshop) ──────────────────────
    if ($action === 'update_status') {
        $code = trim($input['tracking_code'] ?? '');
        $id = (int)($input['id'] ?? 0);
        $newStatus = trim($input['status'] ?? '');
        $cost = isset($input['estimated_cost']) ? (float)$input['estimated_cost'] : null;

        $validStatuses = ['received', 'assessing', 'in_progress', 'ready', 'collected'];
        if (!in_array($newStatus, $validStatuses, true)) {
            jsonResponse(['success' => false, 'error' => "Invalid status: $newStatus"], 400);
        }

        if (!empty($code)) {
            $sql = "UPDATE `repairs` SET `status` = :st";
            $params = [':st' => $newStatus, ':code' => $code];
            if ($cost !== null) {
                $sql .= ", `estimated_cost` = :cost";
                $params[':cost'] = $cost;
            }
            $sql .= " WHERE `tracking_code` = :code";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } elseif ($id > 0) {
            $sql = "UPDATE `repairs` SET `status` = :st";
            $params = [':st' => $newStatus, ':id' => $id];
            if ($cost !== null) {
                $sql .= ", `estimated_cost` = :cost";
                $params[':cost'] = $cost;
            }
            $sql .= " WHERE `id` = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } else {
            jsonResponse(['success' => false, 'error' => 'Tracking code or ID required.'], 400);
        }

        jsonResponse(['success' => true, 'message' => "Repair status updated to '$newStatus'."]);
    }

    // ── Action: Submit repair request (Public Client) ────────────────────────
    $name = trim($input['fullName'] ?? $input['customer_name'] ?? '');
    $email = trim($input['email'] ?? $input['customer_email'] ?? '');
    $phone = trim($input['phone'] ?? $input['customer_phone'] ?? '');
    $instrument = trim($input['instrumentType'] ?? $input['instrument'] ?? '');
    $issue = trim($input['issue'] ?? '');
    $intakeMethod = trim($input['intakeMethod'] ?? $input['intake_method'] ?? 'dropoff');
    if (!in_array($intakeMethod, ['dropoff', 'pickup'], true)) {
        $intakeMethod = 'dropoff';
    }
    $pickupAddress = trim($input['pickupAddress'] ?? $input['pickup_address'] ?? '');

    if (empty($name) || empty($phone) || empty($instrument)) {
        jsonResponse(['success' => false, 'error' => 'Please provide customer name, phone, and instrument details.'], 400);
    }

    if ($intakeMethod === 'pickup' && empty($pickupAddress)) {
        jsonResponse(['success' => false, 'error' => 'Please provide a pickup address and landmark for instrument collection.'], 400);
    }

    $trackingCode = 'REP-' . date('Y') . '-' . str_pad((string)rand(10, 999), 3, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO `repairs` (`tracking_code`, `customer_name`, `customer_email`, `customer_phone`, `instrument`, `issue`, `intake_method`, `pickup_address`, `status`)
        VALUES (:code, :name, :email, :phone, :inst, :issue, :intake, :pickup_addr, 'received')
    ");
    $stmt->execute([
        ':code' => $trackingCode,
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':inst' => $instrument,
        ':issue' => $issue,
        ':intake' => $intakeMethod,
        ':pickup_addr' => !empty($pickupAddress) ? $pickupAddress : null,
    ]);

    jsonResponse([
        'success' => true,
        'tracking_code' => $trackingCode,
        'intake_method' => $intakeMethod,
        'message' => 'Repair request created successfully.',
    ], 201);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
