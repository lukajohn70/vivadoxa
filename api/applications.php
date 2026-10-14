<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $ref = trim($_GET['ref'] ?? $_GET['application_no'] ?? '');
    $email = trim($_GET['email'] ?? '');

    // Single lookup mode (e.g. for student status checking)
    if (!empty($ref)) {
        $sql = "SELECT * FROM `applications` WHERE application_no = :ref";
        $params = [':ref' => $ref];
        if (!empty($email)) {
            $sql .= " AND LOWER(email) = LOWER(:email)";
            $params[':email'] = $email;
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $app = $stmt->fetch();

        if (!$app) {
            jsonResponse(['success' => false, 'error' => 'No application found with these details.'], 404);
        }

        // Fetch any payment linked to this application
        $payStmt = $pdo->prepare("SELECT * FROM `payments` WHERE application_no = :ref ORDER BY id DESC LIMIT 1");
        $payStmt->execute([':ref' => $app['application_no']]);
        $payment = $payStmt->fetch() ?: null;

        jsonResponse([
            'success' => true,
            'application' => $app,
            'payment' => $payment,
        ]);
    }

    // List mode (for admin portal)
    $search = trim($_GET['search'] ?? '');
    $status = trim($_GET['status'] ?? '');

    $sql = "SELECT * FROM `applications` WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $sql .= " AND (first_name LIKE :s OR last_name LIKE :s OR email LIKE :s OR application_no LIKE :s)";
        $params[':s'] = "%$search%";
    }

    if (!empty($status)) {
        $sql .= " AND status = :st";
        $params[':st'] = $status;
    }

    $sql .= " ORDER BY created_at DESC LIMIT 100";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    jsonResponse(['success' => true, 'data' => $rows]);
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: Update application status (Admin) ─────────────────────────────
    if ($action === 'update_status') {
        $appNo = trim($input['application_no'] ?? '');
        $id = (int)($input['id'] ?? 0);
        $newStatus = trim($input['status'] ?? '');

        $validStatuses = ['pending', 'reviewing', 'approved', 'rejected'];
        if (!in_array($newStatus, $validStatuses, true)) {
            jsonResponse(['success' => false, 'error' => "Invalid status: $newStatus"], 400);
        }

        if (!empty($appNo)) {
            $stmt = $pdo->prepare("UPDATE `applications` SET `status` = :st WHERE `application_no` = :no");
            $stmt->execute([':st' => $newStatus, ':no' => $appNo]);
        } elseif ($id > 0) {
            $stmt = $pdo->prepare("UPDATE `applications` SET `status` = :st WHERE `id` = :id");
            $stmt->execute([':st' => $newStatus, ':id' => $id]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Application ID or reference required.'], 400);
        }

        jsonResponse(['success' => true, 'message' => "Application status updated to '$newStatus'."]);
    }

    // ── Action: Create new application (Public Student Flow) ──────────────────
    $fullName = trim($input['fullName'] ?? $input['full_name'] ?? '');
    $firstName = trim($input['first_name'] ?? '');
    $lastName = trim($input['last_name'] ?? '');

    if (empty($firstName) && !empty($fullName)) {
        $parts = preg_split('/\s+/', $fullName, 2);
        $firstName = $parts[0] ?? '';
        $lastName = $parts[1] ?? '';
    }

    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $program = trim($input['program'] ?? 'Piano & Keyboard');
    $studyMode = trim($input['studyMode'] ?? $input['study_mode'] ?? 'Onsite');
    $skillLevel = trim($input['level'] ?? $input['skill_level'] ?? 'Beginner');
    $dob = !empty($input['dateOfBirth']) ? trim($input['dateOfBirth']) : null;
    $gender = !empty($input['gender']) ? trim($input['gender']) : null;
    $guardianName = !empty($input['guardianName']) ? trim($input['guardianName']) : null;
    $guardianPhone = !empty($input['guardianPhone']) ? trim($input['guardianPhone']) : null;
    $address = !empty($input['address']) ? trim($input['address']) : null;
    $tuitionFee = (float)($input['amount'] ?? $input['tuition_fee'] ?? 75000.00);

    if (empty($firstName) || empty($email) || empty($phone)) {
        jsonResponse(['success' => false, 'error' => 'Please provide your name, email, and phone number.'], 400);
    }

    // Generate readable Vivadoxa application reference
    $appNo = 'VDX-' . date('Y') . '-' . str_pad((string)rand(100, 9999), 4, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO `applications`
        (`application_no`, `first_name`, `last_name`, `email`, `phone`, `program`, `study_mode`, `skill_level`, `dob`, `gender`, `guardian_name`, `guardian_phone`, `address`, `status`, `tuition_fee`)
        VALUES (:no, :fn, :ln, :em, :ph, :pr, :sm, :sl, :dob, :gen, :gname, :gph, :addr, 'pending', :fee)
    ");

    $stmt->execute([
        ':no' => $appNo,
        ':fn' => $firstName,
        ':ln' => $lastName,
        ':em' => $email,
        ':ph' => $phone,
        ':pr' => $program,
        ':sm' => $studyMode,
        ':sl' => $skillLevel,
        ':dob' => $dob,
        ':gen' => $gender,
        ':gname' => $guardianName,
        ':gph' => $guardianPhone,
        ':addr' => $address,
        ':fee' => $tuitionFee,
    ]);

    jsonResponse([
        'success' => true,
        'message' => 'Application submitted successfully!',
        'application_no' => $appNo,
        'tuition_fee' => $tuitionFee,
    ], 201);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
