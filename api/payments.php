<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $ref = trim($_GET['ref'] ?? '');
    if (!empty($ref)) {
        $stmt = $pdo->prepare("SELECT * FROM `payments` WHERE reference = :ref1 OR application_no = :ref2 LIMIT 1");
        $stmt->execute([':ref1' => $ref, ':ref2' => $ref]);
        $row = $stmt->fetch();
        if ($row) {
            jsonResponse(['success' => true, 'data' => $row]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Payment not found.'], 404);
        }
    }

    $stmt = $pdo->query("SELECT * FROM `payments` ORDER BY created_at DESC LIMIT 100");
    $rows = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $rows, 'payments' => $rows]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: Delete payment (Admin) ────────────────────────────────────────
    if ($action === 'delete') {
        $ref = trim($input['reference'] ?? '');
        $id = (int)($input['id'] ?? 0);
        if (!empty($ref)) {
            $stmt = $pdo->prepare("DELETE FROM `payments` WHERE `reference` = :ref");
            $stmt->execute([':ref' => $ref]);
            jsonResponse(['success' => true, 'message' => "Payment record $ref deleted successfully."]);
        } elseif ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM `payments` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            jsonResponse(['success' => true, 'message' => "Payment record deleted successfully."]);
        }
        jsonResponse(['success' => false, 'error' => 'Payment reference or ID required.'], 400);
    }

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
                SET `status` = :st, `verified_at` = CASE WHEN :st2 = 'verified' THEN NOW() ELSE `verified_at` END
                WHERE `reference` = :ref
            ");
            $stmt->execute([':st' => $newStatus, ':st2' => $newStatus, ':ref' => $ref]);

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
                SET `status` = :st, `verified_at` = CASE WHEN :st2 = 'verified' THEN NOW() ELSE `verified_at` END
                WHERE `id` = :id
            ");
            $stmt->execute([':st' => $newStatus, ':st2' => $newStatus, ':id' => $id]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Payment reference or ID required.'], 400);
        }

        jsonResponse(['success' => true, 'message' => "Payment marked as '$newStatus'."]);
    }

    // ── Action: Online Gateway Verification / Instant Settlement ─────────────
    if ($action === 'verify_gateway') {
        $reference = trim($input['reference'] ?? ('REF-GW-' . rand(10000, 99999)));
        $appNo = trim($input['applicationNo'] ?? $input['application_no'] ?? '');
        $payerName = trim($input['payerName'] ?? $input['payer_name'] ?? 'Online Applicant');
        $payerEmail = trim($input['payerEmail'] ?? $input['payer_email'] ?? '');
        $amount = (float)($input['amount'] ?? $input['amountPaid'] ?? 0);
        $currency = strtoupper(trim($input['currency'] ?? 'NGN'));
        if ($currency !== 'USD') {
            $currency = 'NGN';
        }
        $methodType = trim($input['gateway'] ?? $input['method'] ?? 'Online Payment Gateway');
        $notes = trim($input['notes'] ?? ("Automated {$methodType} checkout transaction verified"));

        if ($amount <= 0) {
            jsonResponse(['success' => false, 'error' => 'Valid payment amount required.'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `payments` (`reference`, `application_no`, `payer_name`, `payer_email`, `amount`, `currency`, `method`, `status`, `notes`, `verified_at`)
            VALUES (:ref, :app_no, :name, :email, :amt, :curr, :method, 'verified', :notes, NOW())
            ON DUPLICATE KEY UPDATE
                `payer_name` = VALUES(`payer_name`),
                `amount` = VALUES(`amount`),
                `currency` = VALUES(`currency`),
                `method` = VALUES(`method`),
                `status` = 'verified',
                `notes` = VALUES(`notes`),
                `verified_at` = NOW()
        ");

        $stmt->execute([
            ':ref' => $reference,
            ':app_no' => !empty($appNo) ? $appNo : null,
            ':name' => $payerName,
            ':email' => $payerEmail,
            ':amt' => $amount,
            ':curr' => $currency,
            ':method' => $methodType,
            ':notes' => $notes,
        ]);

        // Automatically approve application upon successful online payment
        if (!empty($appNo)) {
            $upApp = $pdo->prepare("UPDATE `applications` SET `status` = 'approved' WHERE `application_no` = :no");
            $upApp->execute([':no' => $appNo]);
        }

        // Notify Admissions & Student
        try {
            $settings = getGeneralSettingsConfig();
            $schoolEmail = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
            $currSymbol = $currency === 'USD' ? '$' : '₦';
            $formattedAmt = $currSymbol . number_format($amount, 2);

            if (!empty($settings['emailAlerts']) && !empty($settings['alertOnPayment'] ?? true)) {
                $subject = "💳 Instant Online Payment Received: {$payerName} ({$formattedAmt} via {$methodType})";
                $html = "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ded8; border-radius: 8px;'>
                        <h2 style='color: #157054; margin-top: 0;'>Automated Payment Cleared</h2>
                        <p>An online tuition payment has cleared successfully via {$methodType}:</p>
                        <table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>
                            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Reference:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$reference}</td></tr>
                            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Application No:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>" . ($appNo ?: 'Direct Online Checkout') . "</td></tr>
                            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Payer Name:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$payerName}</td></tr>
                            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Amount / Currency:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee; color: #157054; font-weight: bold;'>{$formattedAmt} {$currency}</td></tr>
                            <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Channel:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$methodType}</td></tr>
                        </table>
                    </div>
                ";
                sendSystemEmail($schoolEmail, $subject, $html, $settings);
            }
        } catch (Exception $e) {}

        jsonResponse([
            'success' => true,
            'message' => 'Online payment confirmed and admission cleared.',
            'reference' => $reference,
            'application_no' => $appNo,
        ]);
    }

    // ── Action: Create / submit payment proof ─────────────────────────────────
    $payerName = trim($input['payerName'] ?? $input['payer_name'] ?? '');
    $payerEmail = trim($input['payerEmail'] ?? $input['payer_email'] ?? '');
    $amount = (float)($input['amountPaid'] ?? $input['amount'] ?? 0);
    $currency = strtoupper(trim($input['currency'] ?? 'NGN'));
    if ($currency !== 'USD') {
        $currency = 'NGN';
    }
    $reference = trim($input['transactionRef'] ?? $input['reference'] ?? ('REF-VDX-' . rand(10000, 99999)));
    $appNo = trim($input['applicationNo'] ?? $input['application_no'] ?? '');
    $methodType = trim($input['method'] ?? 'Bank Transfer');
    $notes = trim($input['notes'] ?? ('Payment Date: ' . ($input['paymentDate'] ?? date('Y-m-d'))));

    if (empty($payerName) || $amount <= 0) {
        jsonResponse(['success' => false, 'error' => 'Please provide payer name and payment amount.'], 400);
    }

    $stmt = $pdo->prepare("
        INSERT INTO `payments` (`reference`, `application_no`, `payer_name`, `payer_email`, `amount`, `currency`, `method`, `status`, `notes`)
        VALUES (:ref, :app_no, :name, :email, :amt, :curr, :method, 'pending', :notes)
        ON DUPLICATE KEY UPDATE
            `payer_name` = VALUES(`payer_name`),
            `amount` = VALUES(`amount`),
            `currency` = VALUES(`currency`),
            `notes` = VALUES(`notes`)
    ");

    $stmt->execute([
        ':ref' => $reference,
        ':app_no' => !empty($appNo) ? $appNo : null,
        ':name' => $payerName,
        ':email' => $payerEmail,
        ':amt' => $amount,
        ':curr' => $currency,
        ':method' => $methodType,
        ':notes' => $notes,
    ]);

    // Automated Notifications Pipeline
    try {
        $settings = getGeneralSettingsConfig();
        $schoolEmail = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
        $schoolWhatsapp = $settings['schoolWhatsapp'] ?? '08031308881';

        // 1. Email notification to Finance / Admissions
        if (!empty($settings['emailAlerts']) && !empty($settings['alertOnPayment'] ?? true)) {
            $formattedAmt = '₦' . number_format($amount, 2);
            $adminSubject = "💰 New Payment Proof Submitted: {$payerName} ({$formattedAmt})";
            $adminHtml = "
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ded8; border-radius: 8px;'>
                    <h2 style='color: #0b0b0b; margin-top: 0;'>New Payment Verification Needed</h2>
                    <p>A student has submitted transfer payment proof:</p>
                    <table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Reference:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$reference}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Application No:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>" . ($appNo ?: 'Direct Enrollment') . "</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Payer Name:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$payerName}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Payer Email:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$payerEmail}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Amount:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee; color: #157054; font-weight: bold;'>{$formattedAmt}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Method:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$methodType}</td></tr>
                    </table>
                    <p style='margin-top: 20px;'><a href='http://localhost/Vivadoxa/#admin' style='background: #157054; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Verify in Admin Portal</a></p>
                </div>
            ";
            sendSystemEmail($schoolEmail, $adminSubject, $adminHtml, $settings);
        }

        // 2. WhatsApp notification
        if (!empty($settings['whatsappAlerts']) && !empty($settings['alertOnPayment'] ?? true)) {
            $formattedAmt = '₦' . number_format($amount, 2);
            $waMsg = "💰 *New Vivadoxa Payment Submitted*\n\nRef: {$reference}\nPayer: {$payerName}\nAmount: {$formattedAmt}\nMethod: {$methodType}\nStatus: Pending Verification";
            sendSystemWhatsApp($schoolWhatsapp, $waMsg, $settings);
        }
    } catch (Exception $payNotifEx) {
        // Notification failure never blocks payment submission
    }

    jsonResponse([
        'success' => true,
        'reference' => $reference,
        'message' => 'Proof of payment submitted successfully.',
    ], 201);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
