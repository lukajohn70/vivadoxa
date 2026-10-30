<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Get user from session, or from query/body identifier if provided
$user = $_SESSION['client_user'] ?? null;
$identifier = trim($_GET['email'] ?? $_POST['email'] ?? '');

if (!$user && !empty($identifier)) {
    $stmt = $pdo->prepare("SELECT id, email, phone, full_name, role, avatar, address, guardian_name, guardian_phone, created_at FROM users WHERE LOWER(email) = LOWER(:em) OR phone = :ph LIMIT 1");
    $stmt->execute([':em' => $identifier, ':ph' => $identifier]);
    $user = $stmt->fetch();
}

if ($method === 'GET') {
    if (!$user) {
        jsonResponse(['success' => false, 'error' => 'Please sign in to view your Student & Client Portal.'], 401);
    }

    $email = strtolower($user['email']);
    $phone = $user['phone'];

    // 1. Applications
    $appStmt = $pdo->prepare("
        SELECT id, application_no, first_name, last_name, email, phone, program, study_mode, skill_level, status, tuition_fee, passport_photo, duration, currency, address, class_type, session_time, created_at
        FROM applications
        WHERE LOWER(email) = :em OR phone = :ph
        ORDER BY created_at DESC
    ");
    $appStmt->execute([':em' => $email, ':ph' => $phone]);
    $applications = $appStmt->fetchAll();

    // Collect all application numbers
    $appNos = array_filter(array_column($applications, 'application_no'));

    // 2. Enrolled Student Records
    $studStmt = $pdo->prepare("
        SELECT id, student_no, application_no, full_name, email, phone, program, study_mode, cohort, status, enrolled_at
        FROM students
        WHERE LOWER(email) = :em OR phone = :ph
        ORDER BY enrolled_at DESC
    ");
    $studStmt->execute([':em' => $email, ':ph' => $phone]);
    $students = $studStmt->fetchAll();

    // 3. Tuition & Service Payments
    $paySql = "
        SELECT id, reference, application_no, payer_name, payer_email, amount, method, status, notes, created_at, verified_at
        FROM payments
        WHERE LOWER(payer_email) = :em
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

    // 4. Workshop Repairs
    $repStmt = $pdo->prepare("
        SELECT id, tracking_code, customer_name, customer_email, customer_phone, instrument, issue, intake_method, pickup_address, status, estimated_cost, created_at
        FROM repairs
        WHERE LOWER(customer_email) = :em OR customer_phone = :ph
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
        WHERE LOWER(student_email) = :em
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
