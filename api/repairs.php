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
    jsonResponse(['success' => true, 'data' => $rows, 'repairs' => $rows]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: Delete repair (Admin) ─────────────────────────────────────────
    if ($action === 'delete') {
        $code = trim($input['tracking_code'] ?? '');
        $id = (int)($input['id'] ?? 0);
        if (!empty($code)) {
            $stmt = $pdo->prepare("DELETE FROM `repairs` WHERE `tracking_code` = :code");
            $stmt->execute([':code' => $code]);
            jsonResponse(['success' => true, 'message' => "Repair order $code deleted successfully."]);
        } elseif ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM `repairs` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            jsonResponse(['success' => true, 'message' => "Repair order deleted successfully."]);
        }
        jsonResponse(['success' => false, 'error' => 'Tracking code or ID required.'], 400);
    }

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
    $equipmentType = trim($input['equipmentType'] ?? $input['instrumentType'] ?? $input['instrument'] ?? '');
    $instrument = $equipmentType;
    $brandModel = trim($input['brandModel'] ?? $input['brand_model'] ?? '');
    $serialNumber = trim($input['serialNumber'] ?? $input['serial_number'] ?? '');
    $accessories = trim($input['accessories'] ?? '');
    $equipmentAge = trim($input['equipmentAge'] ?? $input['approxAge'] ?? '');
    $problemStarted = trim($input['problemStarted'] ?? $input['whenStarted'] ?? '');
    $previouslyRepaired = trim($input['previouslyRepaired'] ?? 'No');
    $visibleDamage = trim($input['visibleDamage'] ?? 'No');
    $serviceRequested = is_array($input['serviceRequested'] ?? null) 
        ? implode(', ', $input['serviceRequested']) 
        : trim($input['serviceRequested'] ?? 'Repair');
    $additionalNotes = trim($input['additionalNotes'] ?? $input['notes'] ?? '');
    $preferredContact = trim($input['preferredContact'] ?? 'Phone / WhatsApp');
    $bestTime = trim($input['bestTime'] ?? 'Morning');
    $signature = trim($input['customerSignature'] ?? $input['signature'] ?? $name);

    $issue = trim($input['issue'] ?? $input['problemDescription'] ?? '');
    $intakeMethod = trim($input['intakeMethod'] ?? $input['intake_method'] ?? 'dropoff');
    if (!in_array($intakeMethod, ['dropoff', 'pickup'], true)) {
        $intakeMethod = 'dropoff';
    }
    $pickupAddress = trim($input['pickupAddress'] ?? $input['addressArea'] ?? $input['pickup_address'] ?? '');
    $collectionArrangement = trim($input['collectionArrangement'] ?? ($intakeMethod === 'pickup' ? 'Courier Pickup & Delivery' : 'Drop-off & Studio Collection'));

    if (empty($name) || empty($phone) || empty($instrument)) {
        jsonResponse(['success' => false, 'error' => 'Please provide customer name, phone, and instrument details.'], 400);
    }
    // Allow blank email — store empty string so NOT NULL constraint is satisfied
    if (empty($email)) {
        $email = '';
    }

    if ($intakeMethod === 'pickup' && empty($pickupAddress)) {
        jsonResponse(['success' => false, 'error' => 'Please provide a pickup address and landmark for instrument collection.'], 400);
    }

    $trackingCode = 'REP-' . date('Y') . '-' . str_pad((string)rand(10, 999), 3, '0', STR_PAD_LEFT);
    $formDataJson = json_encode($input, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    $stmt = $pdo->prepare("
        INSERT INTO `repairs` (
            `tracking_code`, `customer_name`, `customer_email`, `customer_phone`, 
            `instrument`, `equipment_type`, `brand_model`, `serial_number`, 
            `accessories`, `equipment_age`, `problem_started`, `previously_repaired`, 
            `visible_damage`, `service_requested`, `preferred_contact`, `best_time`, 
            `collection_arrangement`, `customer_signature`, `additional_notes`, 
            `issue`, `intake_method`, `pickup_address`, `form_data`, `status`
        )
        VALUES (
            :code, :name, :email, :phone, 
            :inst, :eq_type, :brand_model, :serial_num, 
            :accessories, :eq_age, :prob_started, :prev_rep, 
            :vis_dam, :srv_req, :pref_cont, :best_time, 
            :coll_arr, :sig, :notes, 
            :issue, :intake, :pickup_addr, :form_data, 'received'
        )
    ");
    $stmt->execute([
        ':code' => $trackingCode,
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':inst' => $instrument,
        ':eq_type' => $equipmentType,
        ':brand_model' => $brandModel,
        ':serial_num' => $serialNumber,
        ':accessories' => $accessories,
        ':eq_age' => $equipmentAge,
        ':prob_started' => $problemStarted,
        ':prev_rep' => $previouslyRepaired,
        ':vis_dam' => $visibleDamage,
        ':srv_req' => $serviceRequested,
        ':pref_cont' => $preferredContact,
        ':best_time' => $bestTime,
        ':coll_arr' => $collectionArrangement,
        ':sig' => $signature,
        ':notes' => $additionalNotes,
        ':issue' => $issue,
        ':intake' => $intakeMethod,
        ':pickup_addr' => !empty($pickupAddress) ? $pickupAddress : null,
        ':form_data' => $formDataJson,
    ]);

    // Auto-provision Client Portal Account if not existing
    try {
        if (!empty($email)) {
            $uCheck = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(:em) LIMIT 1");
            $uCheck->execute([':em' => $email]);
            if (!$uCheck->fetch()) {
                $userPass = !empty($input['password']) ? trim($input['password']) : 'ClientPass2025!';
                $uHash = password_hash($userPass, PASSWORD_BCRYPT);
                $uIns = $pdo->prepare("
                    INSERT INTO users (full_name, email, phone, password_hash, role, address, is_active)
                    VALUES (:fn, :em, :ph, :pw, 'client', :ad, 1)
                ");
                $uIns->execute([
                    ':fn' => $name,
                    ':em' => $email,
                    ':ph' => $phone,
                    ':pw' => $uHash,
                    ':ad' => !empty($pickupAddress) ? $pickupAddress : null,
                ]);
            }
        }
    } catch (Exception $uEx) {}

    jsonResponse([
        'success' => true,
        'tracking_code' => $trackingCode,
        'intake_method' => $intakeMethod,
        'message' => 'Repair request created successfully.',
    ], 201);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
