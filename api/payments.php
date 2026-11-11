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
        $appNoInput = trim($input['application_no'] ?? $input['applicationNo'] ?? '');
        $newStatus = trim($input['status'] ?? 'verified');

        $validStatuses = ['pending', 'verified', 'declined'];
        if (!in_array($newStatus, $validStatuses, true)) {
            jsonResponse(['success' => false, 'error' => "Invalid status: $newStatus"], 400);
        }

        // Locate existing payment row
        $payRow = null;
        if (!empty($ref)) {
            $pStmt = $pdo->prepare("SELECT * FROM `payments` WHERE LOWER(TRIM(reference)) = LOWER(TRIM(:ref)) OR application_no = :ref LIMIT 1");
            $pStmt->execute([':ref' => $ref]);
            $payRow = $pStmt->fetch();
        }
        if (!$payRow && $id > 0) {
            $pStmt = $pdo->prepare("SELECT * FROM `payments` WHERE id = :id LIMIT 1");
            $pStmt->execute([':id' => $id]);
            $payRow = $pStmt->fetch();
        }
        if (!$payRow && !empty($appNoInput)) {
            $pStmt = $pdo->prepare("SELECT * FROM `payments` WHERE LOWER(TRIM(application_no)) = LOWER(TRIM(:ano)) ORDER BY id DESC LIMIT 1");
            $pStmt->execute([':ano' => $appNoInput]);
            $payRow = $pStmt->fetch();
        }

        if (!$payRow && empty($ref) && $id <= 0 && empty($appNoInput)) {
            jsonResponse(['success' => false, 'error' => 'Payment reference, ID, or application number required.'], 400);
        }

        $payId = $payRow ? (int)$payRow['id'] : $id;
        $payRef = $payRow ? $payRow['reference'] : $ref;

        // Perform update on payments table
        $upSql = "UPDATE `payments` 
                  SET `status` = :st, 
                      `verified_at` = CASE WHEN :st2 = 'verified' THEN NOW() ELSE `verified_at` END";
        $upParams = [':st' => $newStatus, ':st2' => $newStatus];

        if (!empty($appNoInput)) {
            $upSql .= ", `application_no` = :app_no";
            $upParams[':app_no'] = $appNoInput;
        }

        if ($payId > 0) {
            $upSql .= " WHERE `id` = :id";
            $upParams[':id'] = $payId;
        } else {
            $upSql .= " WHERE LOWER(TRIM(`reference`)) = LOWER(TRIM(:ref))";
            $upParams[':ref'] = $payRef;
        }

        $stmt = $pdo->prepare($upSql);
        $stmt->execute($upParams);

        // Fetch refreshed payment row
        if ($payId > 0) {
            $refreshed = $pdo->prepare("SELECT * FROM `payments` WHERE id = :id LIMIT 1");
            $refreshed->execute([':id' => $payId]);
            $payRow = $refreshed->fetch() ?: $payRow;
        }

        $targetAppNo = $appNoInput ?: ($payRow['application_no'] ?? '');
        $payerEmail = trim($payRow['payer_email'] ?? '');

        // Synchronize with applications, students, and users
        $appRow = null;
        if (!empty($targetAppNo)) {
            $appStmt = $pdo->prepare("SELECT * FROM `applications` WHERE LOWER(TRIM(application_no)) = LOWER(TRIM(:no)) LIMIT 1");
            $appStmt->execute([':no' => $targetAppNo]);
            $appRow = $appStmt->fetch();
        }
        if (!$appRow && !empty($payerEmail)) {
            $appStmt = $pdo->prepare("SELECT * FROM `applications` WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) ORDER BY id DESC LIMIT 1");
            $appStmt->execute([':em' => $payerEmail]);
            $appRow = $appStmt->fetch();
        }

        if ($appRow) {
            $appNo = $appRow['application_no'];
            // If payment lacked application_no, link it now
            if ($payRow && empty($payRow['application_no'])) {
                $pdo->prepare("UPDATE `payments` SET `application_no` = :no WHERE id = :pid")->execute([':no' => $appNo, ':pid' => $payRow['id']]);
            }

            if ($newStatus === 'verified') {
                // 1. Update application status, payment_status, and release admission letter
                $pdo->prepare("
                    UPDATE `applications` 
                    SET `status` = 'approved', 
                        `payment_status` = 'verified', 
                        `letter_released` = 1, 
                        `updated_at` = NOW() 
                    WHERE `id` = :id
                ")->execute([':id' => $appRow['id']]);

                // 2. Ensure student is enrolled in students table
                $studCheck = $pdo->prepare("SELECT id, student_no FROM `students` WHERE LOWER(TRIM(application_no)) = LOWER(TRIM(:no)) OR LOWER(TRIM(email)) = LOWER(TRIM(:em)) LIMIT 1");
                $studCheck->execute([':no' => $appNo, ':em' => $appRow['email']]);
                $studRow = $studCheck->fetch();

                if (!$studRow) {
                    $studNo = 'VD-' . date('Y') . '-' . str_pad((string)rand(10, 999), 3, '0', STR_PAD_LEFT);
                    $insStud = $pdo->prepare("
                        INSERT INTO `students` (`student_no`, `application_no`, `full_name`, `email`, `phone`, `program`, `study_mode`, `cohort`, `status`)
                        VALUES (:sno, :ano, :fn, :em, :ph, :pr, :sm, 'Saturday Cohort A', 'active')
                    ");
                    $insStud->execute([
                        ':sno' => $studNo,
                        ':ano' => $appNo,
                        ':fn'  => trim(($appRow['first_name'] ?? '') . ' ' . ($appRow['last_name'] ?? '')),
                        ':em'  => $appRow['email'],
                        ':ph'  => $appRow['phone'] ?? '',
                        ':pr'  => $appRow['program'] ?? 'Music Course',
                        ':sm'  => $appRow['study_mode'] ?? 'Onsite',
                    ]);
                } else {
                    $pdo->prepare("UPDATE `students` SET `status` = 'active', `application_no` = :ano WHERE id = :id")->execute([':ano' => $appNo, ':id' => $studRow['id']]);
                }

                // 3. Ensure student portal user account exists
                $uCheck = $pdo->prepare("SELECT id FROM `users` WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) LIMIT 1");
                $uCheck->execute([':em' => $appRow['email']]);
                if (!$uCheck->fetch()) {
                    $defaultPass = password_hash('StudentPass2025!', PASSWORD_BCRYPT);
                    $pdo->prepare("
                        INSERT INTO `users` (`full_name`, `email`, `phone`, `password_hash`, `role`, `is_active`)
                        VALUES (:fn, :em, :ph, :pw, 'student', 1)
                    ")->execute([
                        ':fn' => trim(($appRow['first_name'] ?? '') . ' ' . ($appRow['last_name'] ?? '')),
                        ':em' => $appRow['email'],
                        ':ph' => $appRow['phone'] ?? '',
                        ':pw' => $defaultPass,
                    ]);
                } else {
                    $pdo->prepare("UPDATE `users` SET `is_active` = 1 WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em))")->execute([':em' => $appRow['email']]);
                }

                // 4. Dispatch Official Payment Receipt & Admission Confirmed Email
                try {
                    $settings = getGeneralSettingsConfig();
                    $payerName = htmlspecialchars(trim(($appRow['first_name'] ?? '') . ' ' . ($appRow['last_name'] ?? '')));
                    $payerEmail = $appRow['email'];
                    $amountFmt = '₦' . number_format((float)($payRow['amount'] ?? $appRow['tuition_fee']), 2);
                    $subj = "🧾 Official Receipt & Admission Cleared — Vivadoxa Music Academy (#{$payRef})";
                    $receiptBody = "
                        <p>We are pleased to confirm that your tuition payment of <strong>{$amountFmt}</strong> has been verified by the Bursary and Finance Office.</p>
                        <div style='background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; font-size: 14px;'>
                            <p style='margin: 0 0 8px;'><strong>Candidate Name:</strong> {$payerName}</p>
                            <p style='margin: 0 0 8px;'><strong>Application Ref:</strong> <span style='font-family: monospace; font-weight: bold; color: #a24a18;'>{$appNo}</span></p>
                            <p style='margin: 0 0 8px;'><strong>Payment Ref:</strong> <span style='font-family: monospace; font-weight: bold;'>{$payRef}</span></p>
                            <p style='margin: 0 0 8px;'><strong>Program:</strong> {$appRow['program']} ({$appRow['study_mode']})</p>
                            <p style='margin: 0;'><strong>Status:</strong> <span style='display: inline-block; background: #ecfdf5; color: #047857; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 11px;'>Tuition Cleared · Official Receipt Issued</span></p>
                        </div>
                        <p>Your official digital payment receipt and admission credentials are now unlocked. You can download and print them anytime from your Student Portal or Admission Status Tracker.</p>
                    ";
                    $htmlReceipt = buildBrandedEmailTemplate([
                        'title'      => 'Payment Verified',
                        'badge'      => 'Bursary & Accounts',
                        'clientName' => $payerName,
                        'headline'   => 'Tuition Payment Confirmed & Reconciled',
                        'refNumber'  => $payRef,
                        'refLabel'   => 'Receipt Reference',
                        'bodyHtml'   => $receiptBody,
                        'deptName'   => 'Vivadoxa Accounts & Bursary',
                        'deptEmail'  => 'bursary@vivadoxamusic.com',
                        'ctaText'    => 'View Receipt & Student Portal',
                        'ctaUrl'     => 'https://www.vivadoxamusic.com/#portal',
                    ]);
                    sendSystemEmail($payerEmail, $subj, $htmlReceipt, $settings, 'bursary');
                } catch (Exception $e) {}
            } elseif ($newStatus === 'declined') {
                $pdo->prepare("UPDATE `applications` SET `payment_status` = 'declined', `updated_at` = NOW() WHERE `id` = :id")->execute([':id' => $appRow['id']]);
            }
        }

        jsonResponse([
            'success' => true,
            'message' => "Payment marked as '$newStatus'. Student admission ledger synchronized.",
            'reference' => $payRef,
            'application_no' => $targetAppNo,
        ]);
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
