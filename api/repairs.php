<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

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
        $adminNote = trim($input['admin_note'] ?? ''); // optional custom note from admin

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
            // Fetch full record to use in notification
            $fetchStmt = $pdo->prepare("SELECT * FROM `repairs` WHERE `tracking_code` = :code LIMIT 1");
            $fetchStmt->execute([':code' => $code]);
            $repairRow = $fetchStmt->fetch();
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
            $fetchStmt = $pdo->prepare("SELECT * FROM `repairs` WHERE `id` = :id LIMIT 1");
            $fetchStmt->execute([':id' => $id]);
            $repairRow = $fetchStmt->fetch();
            $code = $repairRow['tracking_code'] ?? "REP-{$id}";
        } else {
            jsonResponse(['success' => false, 'error' => 'Tracking code or ID required.'], 400);
        }

        // ── Auto-notify customer by email ──────────────────────────────────────
        try {
            $settings = getGeneralSettingsConfig();
            $deptInfo = getDepartmentSender('repairs', $settings);
            $customerEmail = $repairRow['customer_email'] ?? '';
            $customerName  = $repairRow['customer_name'] ?? 'Valued Customer';
            $instrument    = $repairRow['instrument'] ?? 'Your Instrument';
            $brandModel    = $repairRow['brand_model'] ?? '';
            $estimatedCost = $cost ?? ($repairRow['estimated_cost'] ?? null);

            // Human-readable status labels
            $statusLabels = [
                'received'    => 'Intake Received',
                'assessing'   => 'Under Assessment',
                'in_progress' => 'Repair In Progress',
                'ready'       => 'Ready for Pickup / Delivery',
                'collected'   => 'Collected / Delivered',
            ];
            $statusLabel = $statusLabels[$newStatus] ?? ucfirst(str_replace('_', ' ', $newStatus));

            // Status-specific message body
            $statusMessages = [
                'received' => "We have received your instrument at the Vivadoxa Instrument Clinic and it is now in our intake queue. Our technician will begin an initial assessment shortly.",
                'assessing' => "Our workshop technician is currently inspecting your instrument and diagnosing the reported issue. We will reach out with a full assessment and cost quotation before any repair work begins.",
                'in_progress' => "Great news — your instrument is now actively being worked on by our workshop team. We will notify you again as soon as the repair is complete.",
                'ready' => "Your instrument repair is now complete and ready for " . ($repairRow['intake_method'] === 'pickup' ? 'delivery back to you' : 'collection at our Kaduna Studio') . ". Please " . ($repairRow['intake_method'] === 'pickup' ? 'expect our logistics team to contact you shortly regarding delivery.' : 'visit the studio at your earliest convenience to collect it.'),
                'collected' => "Your repair ticket is now marked as closed. We hope your instrument is performing well. Thank you for trusting Vivadoxa Instrument Clinic with your gear.",
            ];
            $statusMessage = $statusMessages[$newStatus] ?? "Your repair ticket has been updated to: <strong>{$statusLabel}</strong>.";

            // Build cost block if cost has been set
            $costBlock = '';
            if ($estimatedCost !== null && $estimatedCost > 0) {
                $formattedCost = '₦' . number_format((float)$estimatedCost, 2);
                $costBlock = "
                    <div style='margin: 14px 0; padding: 12px 16px; background: #f7f5f0; border: 1px solid #ede8e0; border-radius: 8px; font-size: 13px;'>
                        <strong>Quoted / Repair Cost:</strong> <span style='color: #c96b32; font-weight: 700; font-size: 15px;'>{$formattedCost}</span>
                    </div>";
            }

            // Build admin note block if present
            $noteBlock = '';
            if (!empty($adminNote)) {
                $noteBlock = "
                    <div style='margin: 14px 0; padding: 12px 16px; background: #f0f9ff; border-left: 4px solid #0369a1; border-radius: 0 8px 8px 0; font-size: 13px; color: #333;'>
                        <strong>Message from our Workshop Team:</strong><br>" . nl2br(htmlspecialchars($adminNote)) . "
                    </div>";
            }

            $bodyHtml = "
                <p style='margin: 0 0 14px; font-size: 15px; color: #333;'>
                    Here is a live status update on your instrument repair ticket at Vivadoxa Instrument Clinic.
                </p>
                <div style='background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px; padding: 16px 18px; margin: 0 0 18px; font-size: 13px;'>
                    <p style='margin: 0 0 6px;'><strong>Instrument:</strong> " . htmlspecialchars($instrument . ($brandModel ? " ({$brandModel})" : '')) . "</p>
                    <p style='margin: 0 0 6px;'><strong>Tracking Code:</strong> <code style='font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px;'>{$code}</code></p>
                    <p style='margin: 0;'><strong>Current Stage:</strong>
                        <span style='display: inline-block; background: #c96b32; color: white; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px; margin-left: 6px;'>{$statusLabel}</span>
                    </p>
                </div>
                <p style='font-size: 14px; color: #444; margin: 0 0 14px;'>{$statusMessage}</p>
                {$costBlock}
                {$noteBlock}
                <p style='font-size: 13px; color: #666; margin: 16px 0 0;'>
                    You can track your repair live at any time using your tracking code on our website. 
                    If you have any questions, please don&rsquo;t hesitate to contact our clinic team directly.
                </p>
            ";

            if (!empty($customerEmail)) {
                $emailBody = buildBrandedEmailTemplate([
                    'title'      => 'Repair Status Update',
                    'badge'      => 'Instrument Clinic',
                    'clientName' => $customerName,
                    'headline'   => "Repair Update: {$statusLabel}",
                    'refNumber'  => $code,
                    'refLabel'   => 'Repair Tracking Code',
                    'bodyHtml'   => $bodyHtml,
                    'deptName'   => $deptInfo['name'],
                    'deptEmail'  => $deptInfo['email'],
                    'ctaText'    => 'Track Repair Online',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#repairs',
                ]);
                sendSystemEmail(
                    $customerEmail,
                    "Vivadoxa Clinic Update — {$statusLabel} [{$code}]",
                    $emailBody,
                    $settings,
                    'repairs'
                );
            }
        } catch (Exception $notifyEx) {
            // Notification failure must not block the status update response
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

    // Send automated branded email confirmation
    try {
        $settings = getGeneralSettingsConfig();
        $deptInfo = getDepartmentSender('repairs', $settings);

        $intakeLabel = ($intakeMethod === 'pickup')
            ? "Courier Collection from: <strong>" . htmlspecialchars($pickupAddress) . "</strong>"
            : "Drop-off at Vivadoxa Instrument Clinic (Kaduna Studio)";

        $repairHtml = "
            <p style='margin: 0 0 16px; font-size: 15px; color: #333;'>We have safely logged your instrument repair request into our diagnostic clinic queue.</p>
            
            <div style='background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px; padding: 16px; margin: 18px 0; font-size: 13px;'>
                <p style='margin: 0 0 8px;'><strong>Instrument:</strong> " . htmlspecialchars($instrument) . ($brandModel ? " (" . htmlspecialchars($brandModel) . ")" : "") . "</p>
                " . (!empty($serviceRequested) ? "<p style='margin: 0 0 8px;'><strong>Service Requested:</strong> " . htmlspecialchars($serviceRequested) . "</p>" : "") . "
                " . (!empty($issue) ? "<p style='margin: 0 0 8px;'><strong>Reported Issue:</strong> <em>" . htmlspecialchars($issue) . "</em></p>" : "") . "
                <p style='margin: 0 0 8px;'><strong>Intake Method:</strong> {$intakeLabel}</p>
                <p style='margin: 0;'><strong>Current Status:</strong> <span style='display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;'>Intake Received</span></p>
            </div>

            <p style='font-size: 14px; color: #444; margin-top: 18px;'>Our luthier / technician will inspect your instrument and communicate an accurate diagnostic assessment and cost quotation before proceeding with any invasive work.</p>
            <p style='font-size: 13px; color: #666;'>You can check live progress at any time using your tracking code on our website.</p>
        ";

        if (!empty($email)) {
            $customerEmailBody = buildBrandedEmailTemplate([
                'title'      => 'Instrument Clinic Intake',
                'badge'      => 'Instrument Clinic',
                'clientName' => $name,
                'headline'   => 'Repair Intake Confirmed',
                'refNumber'  => $trackingCode,
                'refLabel'   => 'Repair Tracking Code',
                'bodyHtml'   => $repairHtml,
                'deptName'   => $deptInfo['name'],
                'deptEmail'  => $deptInfo['email'],
                'ctaText'    => 'Track Repair Online',
                'ctaUrl'     => 'https://www.vivadoxamusic.com/#repairs',
            ]);
            sendSystemEmail($email, "Vivadoxa Instrument Clinic — Tracking Code: {$trackingCode}", $customerEmailBody, $settings, 'repairs');
        }

        // Notify Admin Desk
        $adminRecipient = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
        $adminEmailBody = buildBrandedEmailTemplate([
            'title'      => 'New Repair Request',
            'badge'      => 'Clinic Alert',
            'clientName' => 'Clinic Team',
            'headline'   => "New Repair Lodged: {$instrument} ({$name})",
            'refNumber'  => $trackingCode,
            'refLabel'   => 'Tracking Code',
            'bodyHtml'   => "
                <p>A new repair order has been submitted via the Clinic intake form:</p>
                <p><strong>Customer:</strong> " . htmlspecialchars($name) . "<br>
                   <strong>Phone:</strong> " . htmlspecialchars($phone) . "<br>
                   <strong>Email:</strong> " . htmlspecialchars($email ?: 'Not provided') . "</p>
                {$repairHtml}
            ",
            'deptName'   => $deptInfo['name'],
            'deptEmail'  => $deptInfo['email'],
            'ctaText'    => 'Open Clinic Manager',
            'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
        ]);
        sendSystemEmail($adminRecipient, "New Repair Intake [{$trackingCode}] — {$name} ({$instrument})", $adminEmailBody, $settings, 'repairs');
        $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
        if (!empty($officialGmail) && strcasecmp($adminRecipient, $officialGmail) !== 0) {
            sendSystemEmail($officialGmail, "New Repair Intake [{$trackingCode}] — {$name} ({$instrument})", $adminEmailBody, $settings, 'repairs');
        }

    } catch (Exception $mailEx) {}

    jsonResponse([
        'success' => true,
        'tracking_code' => $trackingCode,
        'intake_method' => $intakeMethod,
        'message' => 'Repair request created successfully.',
    ], 201);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
