<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Get user from session, or from query/body identifier if provided
$user = null;
$identifier = trim($_GET['email'] ?? $_POST['email'] ?? $_GET['identifier'] ?? '');

if (!empty($identifier)) {
    $stmt = $pdo->prepare("
        SELECT id, email, phone, full_name, role, avatar, address, guardian_name, guardian_phone, created_at 
        FROM users 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) 
           OR phone = :ph 
           OR id IN (SELECT id FROM users WHERE LOWER(TRIM(email)) IN (SELECT LOWER(TRIM(email)) FROM applications WHERE LOWER(TRIM(application_no)) = LOWER(TRIM(:id))))
        LIMIT 1
    ");
    $stmt->execute([':em' => $identifier, ':ph' => $identifier, ':id' => $identifier]);
    $user = $stmt->fetch() ?: null;
}

if (!$user && !empty($_SESSION['client_user'])) {
    $user = $_SESSION['client_user'];
}

// If user is still not in `users` table, but an application exists with this email or ref, auto-create user shell
if (!$user && !empty($identifier)) {
    $appFind = $pdo->prepare("
        SELECT first_name, last_name, email, phone, address, guardian_name, guardian_phone 
        FROM applications 
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) OR LOWER(TRIM(application_no)) = LOWER(TRIM(:no)) 
        ORDER BY id DESC LIMIT 1
    ");
    $appFind->execute([':em' => $identifier, ':no' => $identifier]);
    $foundApp = $appFind->fetch();
    if ($foundApp && !empty($foundApp['email'])) {
        $uPass = password_hash('StudentPass2025!', PASSWORD_BCRYPT);
        $ins = $pdo->prepare("
            INSERT INTO users (full_name, email, phone, password_hash, role, address, guardian_name, guardian_phone, is_active)
            VALUES (:fn, :em, :ph, :pw, 'student', :ad, :gn, :gp, 1)
        ");
        $ins->execute([
            ':fn' => trim($foundApp['first_name'] . ' ' . $foundApp['last_name']),
            ':em' => $foundApp['email'],
            ':ph' => $foundApp['phone'] ?? '',
            ':pw' => $uPass,
            ':ad' => $foundApp['address'] ?? '',
            ':gn' => $foundApp['guardian_name'] ?? '',
            ':gp' => $foundApp['guardian_phone'] ?? '',
        ]);
        $uid = (int)$pdo->lastInsertId();
        $user = [
            'id' => $uid,
            'full_name' => trim($foundApp['first_name'] . ' ' . $foundApp['last_name']),
            'email' => $foundApp['email'],
            'phone' => $foundApp['phone'] ?? '',
            'role' => 'student',
            'avatar' => null,
            'address' => $foundApp['address'] ?? '',
            'guardian_name' => $foundApp['guardian_name'] ?? '',
            'guardian_phone' => $foundApp['guardian_phone'] ?? '',
            'created_at' => date('Y-m-d H:i:s'),
        ];
        $_SESSION['client_user'] = $user;
    }
}

if ($method === 'GET') {
    if (!$user) {
        jsonResponse(['success' => false, 'error' => 'Please sign in to view your Student & Client Portal.'], 401);
    }

    $email = strtolower(trim($user['email']));
    $phone = trim($user['phone'] ?? '');
    $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

    // 1. Applications
    $appStmt = $pdo->prepare("
        SELECT id, application_no, first_name, last_name, email, phone, program, study_mode, skill_level, status, payment_status, tuition_fee, passport_photo, duration, currency, address, class_type, session_time, letter_released, created_at
        FROM applications
        WHERE LOWER(TRIM(email)) = :em
           OR (:ph != '' AND (phone = :ph OR phone = :cph))
           OR application_no IN (SELECT application_no FROM payments WHERE LOWER(TRIM(payer_email)) = :em)
           OR application_no IN (SELECT application_no FROM students WHERE LOWER(TRIM(email)) = :em)
        ORDER BY created_at DESC
    ");
    $appStmt->execute([
        ':em'  => $email,
        ':ph'  => $phone,
        ':cph' => $cleanPhone,
    ]);
    $applications = $appStmt->fetchAll();

    // Collect all application numbers
    $appNos = array_values(array_unique(array_filter(array_column($applications, 'application_no'))));

    // 2. Enrolled Student Records
    $studParams = [':em' => $email, ':ph' => $phone];
    $studSql = "
        SELECT id, student_no, application_no, full_name, email, phone, program, study_mode, cohort, status, enrolled_at
        FROM students
        WHERE LOWER(TRIM(email)) = :em
           OR (:ph != '' AND phone = :ph)
    ";
    if (!empty($appNos)) {
        $pKeys = [];
        foreach ($appNos as $k => $val) {
            $pk = ":sano_$k";
            $pKeys[] = $pk;
            $studParams[$pk] = $val;
        }
        $studSql .= " OR application_no IN (" . implode(',', $pKeys) . ")";
    }
    $studSql .= " ORDER BY enrolled_at DESC";
    $studStmt = $pdo->prepare($studSql);
    $studStmt->execute($studParams);
    $students = $studStmt->fetchAll();

    // 3. Tuition & Service Payments
    $paySql = "
        SELECT id, reference, application_no, payer_name, payer_email, amount, currency, method, status, notes, created_at, verified_at
        FROM payments
        WHERE LOWER(TRIM(payer_email)) = :em
    ";
    $payParams = [':em' => $email];

    if (!empty($appNos)) {
        $placeholders = [];
        foreach ($appNos as $i => $no) {
            $key = ":app_$i";
            $placeholders[] = $key;
            $payParams[$key] = $no;
        }
        $paySql .= " OR application_no IN (" . implode(',', $placeholders) . ")";
    }
    $paySql .= " ORDER BY created_at DESC";

    $payStmt = $pdo->prepare($paySql);
    $payStmt->execute($payParams);
    $payments = $payStmt->fetchAll();

    // Harmonize payment status back into applications
    $verifiedAppNos = [];
    foreach ($payments as $pay) {
        if ($pay['status'] === 'verified' && !empty($pay['application_no'])) {
            $verifiedAppNos[] = $pay['application_no'];
        }
    }
    foreach ($applications as &$app) {
        if (in_array($app['application_no'], $verifiedAppNos, true)) {
            $app['payment_status'] = 'verified';
            $app['is_paid'] = true;
        } elseif (!empty($app['payment_status']) && $app['payment_status'] === 'verified') {
            $app['is_paid'] = true;
        } else {
            $app['is_paid'] = false;
        }
    }
    unset($app);

    // 4. Workshop Repairs
    $repStmt = $pdo->prepare("
        SELECT id, tracking_code, customer_name, customer_email, customer_phone, instrument, issue, intake_method, pickup_address, status, estimated_cost, created_at
        FROM repairs
        WHERE LOWER(TRIM(customer_email)) = :em OR (:ph != '' AND customer_phone = :ph)
        ORDER BY created_at DESC
    ");
    $repStmt->execute([':em' => $email, ':ph' => $phone]);
    $repairs = $repStmt->fetchAll();

    // 5. Cohort class details
    $cohortList = array_filter(array_column($students, 'cohort'));
    $cohorts = [];
    if (!empty($cohortList)) {
        $inCohort = [];
        $cohParams = [];
        foreach (array_unique($cohortList) as $idx => $cname) {
            $inCohort[] = ":c_$idx";
            $cohParams[":c_$idx"] = $cname;
        }
        $cohStmt = $pdo->prepare("SELECT * FROM cohorts WHERE name IN (" . implode(',', $inCohort) . ")");
        $cohStmt->execute($cohParams);
        $cohorts = $cohStmt->fetchAll();
    }

    // 6. Schedule & Reschedule Requests
    $schedStmt = $pdo->prepare("
        SELECT id, program, request_type, current_schedule, affected_date, return_date, reason, makeup_requested, preferred_makeup_slot, notes, status, allocated_makeup_date, allocated_room, staff_notes, created_at
        FROM schedule_requests
        WHERE LOWER(TRIM(student_email)) = :em
        ORDER BY created_at DESC
    ");
    $schedStmt->execute([':em' => $email]);
    $scheduleRequests = $schedStmt->fetchAll();

    // 7. Balance calculation
    $totalInvoiced = 0.0;
    foreach ($applications as $app) {
        $totalInvoiced += (float)($app['tuition_fee'] ?? 0);
    }
    $totalPaid = 0.0;
    foreach ($payments as $pay) {
        if ($pay['status'] === 'verified') {
            $totalPaid += (float)($pay['amount'] ?? 0);
        }
    }
    $balanceDue = max(0, $totalInvoiced - $totalPaid);

    jsonResponse([
        'success' => true,
        'user' => $user,
        'portal' => [
            'applications' => $applications,
            'students' => $students,
            'payments' => $payments,
            'repairs' => $repairs,
            'cohorts' => $cohorts,
            'schedule_requests' => $scheduleRequests,
            'financials' => [
                'total_invoiced' => $totalInvoiced,
                'total_paid' => $totalPaid,
                'balance_due' => $balanceDue,
                'formatted_invoiced' => '₦' . number_format($totalInvoiced, 2),
                'formatted_paid' => '₦' . number_format($totalPaid, 2),
                'formatted_balance' => '₦' . number_format($balanceDue, 2),
            ],
        ],
    ]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: Link / Claim existing application ─────────────────────────────
    if ($action === 'link_application') {
        $appNo = trim($input['application_no'] ?? $input['ref'] ?? '');
        if (empty($appNo)) {
            jsonResponse(['success' => false, 'error' => 'Application reference is required.'], 400);
        }

        if (!$user) {
            jsonResponse(['success' => false, 'error' => 'You must be signed in to link an application.'], 401);
        }

        $userEmail = strtolower(trim($user['email']));
        $findStmt = $pdo->prepare("SELECT * FROM applications WHERE LOWER(TRIM(application_no)) = LOWER(TRIM(:no)) LIMIT 1");
        $findStmt->execute([':no' => $appNo]);
        $targetApp = $findStmt->fetch();

        if (!$targetApp) {
            jsonResponse(['success' => false, 'error' => "No application record found for reference '$appNo'. Please check your reference code."], 404);
        }

        // Link application to current user's email
        $pdo->prepare("UPDATE applications SET email = :em, updated_at = NOW() WHERE id = :id")->execute([':em' => $userEmail, ':id' => $targetApp['id']]);
        $pdo->prepare("UPDATE payments SET payer_email = :em WHERE application_no = :no")->execute([':em' => $userEmail, ':no' => $targetApp['application_no']]);
        $pdo->prepare("UPDATE students SET email = :em WHERE application_no = :no")->execute([':em' => $userEmail, ':no' => $targetApp['application_no']]);

        jsonResponse([
            'success' => true,
            'message' => "Application {$targetApp['application_no']} has been linked to your student portal successfully!",
            'application' => $targetApp,
        ]);
    }

    if ($action === 'approve_repair') {
        $code = trim($input['tracking_code'] ?? '');
        if (empty($code)) {
            jsonResponse(['success' => false, 'error' => 'Tracking code is required.'], 400);
        }

        $stmt = $pdo->prepare("UPDATE repairs SET status = 'in_progress' WHERE tracking_code = :code");
        $stmt->execute([':code' => $code]);

        jsonResponse([
            'success' => true,
            'message' => "Repair estimate for $code accepted. Our luthiers have started work on your instrument!",
            'tracking_code' => $code,
            'status' => 'in_progress',
        ]);
    } else {
        jsonResponse(['success' => false, 'error' => 'Unknown action.'], 400);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
