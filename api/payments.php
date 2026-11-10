<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

// Ensure payments table has required columns (self-healing migration)
function ensurePaymentsSchema(PDO $pdo): void {
    static $checked = false;
    if ($checked) return;
    try {
        $pdo->exec("ALTER TABLE `payments` ADD COLUMN `currency` VARCHAR(10) NOT NULL DEFAULT 'NGN' AFTER `amount`");
    } catch (Exception $e) {
        // Column already exists or table not ready
    }
    $checked = true;
}

$pdo = getDb();
ensurePaymentsSchema($pdo);
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

        try {
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
                ':email' => !empty($payerEmail) ? $payerEmail : '',
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
        } catch (Exception $gwEx) {
            // Fallback in case table lacks currency column and ALTER was blocked
            if (stripos($gwEx->getMessage(), 'currency') !== false) {
                try {
                    $pdo->exec("ALTER TABLE `payments` ADD COLUMN `currency` VARCHAR(10) NOT NULL DEFAULT 'NGN' AFTER `amount`");
                    $stmt->execute([
                        ':ref' => $reference,
                        ':app_no' => !empty($appNo) ? $appNo : null,
                        ':name' => $payerName,
                        ':email' => !empty($payerEmail) ? $payerEmail : '',
                        ':amt' => $amount,
                        ':curr' => $currency,
                        ':method' => $methodType,
                        ':notes' => $notes,
                    ]);
                } catch (Exception $fallbackEx) {
                    // Fall back to query without currency column
                    $stmtNoCurr = $pdo->prepare("
                        INSERT INTO `payments` (`reference`, `application_no`, `payer_name`, `payer_email`, `amount`, `method`, `status`, `notes`, `verified_at`)
                        VALUES (:ref, :app_no, :name, :email, :amt, :method, 'verified', :notes, NOW())
                        ON DUPLICATE KEY UPDATE
                            `payer_name` = VALUES(`payer_name`),
                            `amount` = VALUES(`amount`),
                            `method` = VALUES(`method`),
                            `status` = 'verified',
                            `notes` = VALUES(`notes`),
                            `verified_at` = NOW()
                    ");
                    $stmtNoCurr->execute([
                        ':ref' => $reference,
                        ':app_no' => !empty($appNo) ? $appNo : null,
                        ':name' => $payerName,
                        ':email' => !empty($payerEmail) ? $payerEmail : '',
                        ':amt' => $amount,
                        ':method' => $methodType,
                        ':notes' => "[Currency: $currency] " . $notes,
                    ]);
                }
            } else {
                jsonResponse([
                    'success' => false,
                    'error' => 'Unable to record online settlement: ' . $gwEx->getMessage(),
                ], 500);
            }
        }

        // Notify Admissions & Student
        try {
            $settings = getGeneralSettingsConfig();
            $schoolEmail = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
            $currSymbol = $currency === 'USD' ? '$' : '₦';
            $formattedAmt = $currSymbol . number_format($amount, 2);

            if (!empty($settings['emailAlerts']) && !empty($settings['alertOnPayment'] ?? true)) {
                $subject = "💳 Instant Online Payment Received: {$payerName} ({$formattedAmt} via {$methodType})";
                $body = "
                    <p>An online tuition payment has cleared successfully via <strong>{$methodType}</strong>:</p>
                    <table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Reference:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$reference}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Application No:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>" . ($appNo ?: 'Direct Online Checkout') . "</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Payer Name:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$payerName}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Amount / Currency:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee; color: #157054; font-weight: bold;'>{$formattedAmt} {$currency}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Channel:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$methodType}</td></tr>
                    </table>
                ";
                $html = buildBrandedEmailTemplate([
                    'title'      => 'Online Payment',
                    'badge'      => 'Bursary & Accounts',
                    'clientName' => 'Finance Desk',
                    'headline'   => 'Automated Payment Cleared',
                    'refNumber'  => $reference,
                    'refLabel'   => 'Transaction Reference',
                    'bodyHtml'   => $body,
                    'deptName'   => 'Vivadoxa Accounts & Bursary',
                    'deptEmail'  => 'bursary@vivadoxamusic.com',
                    'ctaText'    => 'View in Admin Portal',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
                ]);
                sendSystemEmail($schoolEmail, $subject, $html, $settings, 'bursary');
                $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
                if (!empty($officialGmail) && strcasecmp($schoolEmail, $officialGmail) !== 0) {
                    sendSystemEmail($officialGmail, $subject, $html, $settings, 'bursary');
                }
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

    try {
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
            ':email' => !empty($payerEmail) ? $payerEmail : '',
            ':amt' => $amount,
            ':curr' => $currency,
            ':method' => $methodType,
            ':notes' => $notes,
        ]);

        if (!empty($appNo)) {
            try {
                $pdo->prepare("UPDATE `applications` SET `updated_at` = NOW() WHERE `application_no` = :no")->execute([':no' => $appNo]);
            } catch (Exception $appUpEx) {}
        }
    } catch (Exception $dbEx) {
        if (stripos($dbEx->getMessage(), 'currency') !== false) {
            try {
                $pdo->exec("ALTER TABLE `payments` ADD COLUMN `currency` VARCHAR(10) NOT NULL DEFAULT 'NGN' AFTER `amount`");
                $stmt->execute([
                    ':ref' => $reference,
                    ':app_no' => !empty($appNo) ? $appNo : null,
                    ':name' => $payerName,
                    ':email' => !empty($payerEmail) ? $payerEmail : '',
                    ':amt' => $amount,
                    ':curr' => $currency,
                    ':method' => $methodType,
                    ':notes' => $notes,
                ]);
            } catch (Exception $fallbackEx) {
                // Fall back to query without currency column
                try {
                    $stmtNoCurr = $pdo->prepare("
                        INSERT INTO `payments` (`reference`, `application_no`, `payer_name`, `payer_email`, `amount`, `method`, `status`, `notes`)
                        VALUES (:ref, :app_no, :name, :email, :amt, :method, 'pending', :notes)
                        ON DUPLICATE KEY UPDATE
                            `payer_name` = VALUES(`payer_name`),
                            `amount` = VALUES(`amount`),
                            `notes` = VALUES(`notes`)
                    ");
                    $stmtNoCurr->execute([
                        ':ref' => $reference,
                        ':app_no' => !empty($appNo) ? $appNo : null,
                        ':name' => $payerName,
                        ':email' => !empty($payerEmail) ? $payerEmail : '',
                        ':amt' => $amount,
                        ':method' => $methodType,
                        ':notes' => "[Currency: $currency] " . $notes,
                    ]);
                } catch (Exception $finalEx) {
                    jsonResponse([
                        'success' => false,
                        'error' => 'Unable to record payment: ' . $finalEx->getMessage(),
                    ], 500);
                }
            }
        } else {
            jsonResponse([
                'success' => false,
                'error' => 'Unable to record payment: ' . $dbEx->getMessage(),
            ], 500);
        }
    }

    // Automated Notifications Pipeline
    try {
        $settings = getGeneralSettingsConfig();
        $schoolEmail = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
        $schoolWhatsapp = $settings['schoolWhatsapp'] ?? '08031308881';

        // 1. Email notification to Finance / Admissions
        if (!empty($settings['emailAlerts']) && !empty($settings['alertOnPayment'] ?? true)) {
            $formattedAmt = '₦' . number_format($amount, 2);
            $adminSubject = "💰 New Payment Proof Submitted: {$payerName} ({$formattedAmt})";
            $adminBody = "
                <p>A student has submitted transfer payment proof for bursary verification:</p>
                <table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Reference:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$reference}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Application No:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>" . ($appNo ?: 'Direct Enrollment') . "</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Payer Name:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$payerName}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Payer Email:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$payerEmail}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Amount:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee; color: #157054; font-weight: bold;'>{$formattedAmt}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Method:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$methodType}</td></tr>
                </table>
            ";
            $adminHtml = buildBrandedEmailTemplate([
                'title'      => 'Payment Verification',
                'badge'      => 'Bursary & Accounts',
                'clientName' => 'Accounts Desk',
                'headline'   => 'Payment Proof Verification Needed',
                'refNumber'  => $reference,
                'refLabel'   => 'Transaction Reference',
                'bodyHtml'   => $adminBody,
                'deptName'   => 'Vivadoxa Accounts & Bursary',
                'deptEmail'  => 'bursary@vivadoxamusic.com',
                'ctaText'    => 'Verify in Admin Portal',
                'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
            ]);
            sendSystemEmail($schoolEmail, $adminSubject, $adminHtml, $settings, 'bursary');
            $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
            if (!empty($officialGmail) && strcasecmp($schoolEmail, $officialGmail) !== 0) {
                sendSystemEmail($officialGmail, $adminSubject, $adminHtml, $settings, 'bursary');
            }

            // Send Payer Confirmation Email
            if (!empty($payerEmail)) {
                $payerSubject = "Vivadoxa Accounts — Payment Proof Received (#{$reference})";
                $payerBody = "
                    <p>We have received your payment proof for <strong>{$formattedAmt} {$currency}</strong> via {$methodType}.</p>
                    <p>Our accounts team is reconciling the transfer with our bank statements. You will receive an official digital receipt and confirmation once verified.</p>
                    <p style='font-size: 13px; color: #666; margin-top: 18px;'>If you have questions regarding your transaction, please reply to this email or chat with our bursary desk on WhatsApp at <strong>{$schoolWhatsapp}</strong>.</p>
                ";
                $payerHtml = buildBrandedEmailTemplate([
                    'title'      => 'Proof Received',
                    'badge'      => 'Accounts & Bursary',
                    'clientName' => $payerName,
                    'headline'   => 'Payment Submission Received',
                    'refNumber'  => $reference,
                    'refLabel'   => 'Transaction Reference',
                    'bodyHtml'   => $payerBody,
                    'deptName'   => 'Vivadoxa Music Academy Accounts & Bursary',
                    'deptEmail'  => 'bursary@vivadoxamusic.com',
                    'ctaText'    => 'Track Admission Status',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#status',
                ]);
                sendSystemEmail($payerEmail, $payerSubject, $payerHtml, $settings, 'bursary');
            }
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
