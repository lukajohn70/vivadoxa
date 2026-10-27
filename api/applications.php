<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

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

    jsonResponse(['success' => true, 'data' => $rows, 'applications' => $rows]);
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

    // ── Action: Modify application details (Admin) ────────────────────────────
    if ($action === 'modify') {
        $appNo = trim($input['application_no'] ?? '');
        $updates = $input['updates'] ?? [];
        if (!empty($appNo) && is_array($updates)) {
            $fields = [];
            $params = [':no' => $appNo];
            $allowed = ['program', 'study_mode', 'skill_level', 'status', 'tuition_fee', 'currency', 'phone', 'email', 'class_type', 'session_time', 'duration', 'marital_status', 'state_of_origin', 'nationality', 'occupation', 'sponsor'];
            foreach ($allowed as $f) {
                if (isset($updates[$f])) {
                    $fields[] = "`$f` = :$f";
                    $params[":$f"] = $updates[$f];
                }
            }
            if (!empty($fields)) {
                $sql = "UPDATE `applications` SET " . implode(', ', $fields) . " WHERE `application_no` = :no";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                jsonResponse(['success' => true, 'message' => "Application $appNo modified successfully."]);
            }
        }
        jsonResponse(['success' => false, 'error' => 'Application reference and valid fields required.'], 400);
    }

    // ── Action: Delete application (Admin) ────────────────────────────────────
    if ($action === 'delete') {
        $appNo = trim($input['application_no'] ?? '');
        $id = (int)($input['id'] ?? 0);
        if (!empty($appNo)) {
            $stmt = $pdo->prepare("DELETE FROM `applications` WHERE `application_no` = :no");
            $stmt->execute([':no' => $appNo]);
            jsonResponse(['success' => true, 'message' => "Application $appNo deleted successfully."]);
        } elseif ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM `applications` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            jsonResponse(['success' => true, 'message' => "Application record deleted successfully."]);
        }
        jsonResponse(['success' => false, 'error' => 'Application reference or ID required.'], 400);
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
    $tuitionFee = (float)($input['amount'] ?? $input['tuition_fee'] ?? 55000.00);

    // Official 2026 Application Form docx fields
    $classType = trim($input['classType'] ?? $input['class_type'] ?? 'Regular classes');
    $stateOfOrigin = trim($input['stateOfOrigin'] ?? $input['state_of_origin'] ?? $input['state'] ?? '');
    $maritalStatus = trim($input['maritalStatus'] ?? $input['marital_status'] ?? 'Single');
    $nationality = trim($input['nationality'] ?? 'Nigerian');
    $occupation = trim($input['occupation'] ?? '');
    $sponsor = trim($input['sponsor'] ?? $input['guardianName'] ?? '');
    $sessionTime = trim($input['sessionTime'] ?? $input['session_time'] ?? $input['schedule'] ?? 'Morning Section (10 AM-1 PM)');
    $duration = trim($input['duration'] ?? $input['planTier'] ?? '3 Months');
    $currency = strtoupper(trim($input['currency'] ?? 'NGN'));
    if ($currency !== 'USD') {
        $currency = 'NGN';
    }

    if (empty($firstName) || empty($email) || empty($phone)) {
        jsonResponse(['success' => false, 'error' => 'Please provide your name, email, and phone number.'], 400);
    }

    // Generate readable Vivadoxa application reference
    $appNo = 'VDX-' . date('Y') . '-' . str_pad((string)rand(100, 9999), 4, '0', STR_PAD_LEFT);

    $stmt = $pdo->prepare("
        INSERT INTO `applications`
        (`application_no`, `first_name`, `last_name`, `email`, `phone`, `program`, `study_mode`, `skill_level`, `dob`, `gender`, `guardian_name`, `guardian_phone`, `address`, `class_type`, `state_of_origin`, `marital_status`, `nationality`, `occupation`, `sponsor`, `session_time`, `duration`, `currency`, `status`, `tuition_fee`)
        VALUES (:no, :fn, :ln, :em, :ph, :pr, :sm, :sl, :dob, :gen, :gname, :gph, :addr, :ctype, :state, :marital, :nat, :occ, :spon, :stime, :dur, :curr, 'pending', :fee)
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
        ':ctype' => $classType,
        ':state' => $stateOfOrigin,
        ':marital' => $maritalStatus,
        ':nat' => $nationality,
        ':occ' => $occupation,
        ':spon' => $sponsor,
        ':stime' => $sessionTime,
        ':dur' => $duration,
        ':curr' => $currency,
        ':fee' => $tuitionFee,
    ]);

    // Auto-provision Student Portal Account if not existing
    try {
        $uCheck = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(:em) LIMIT 1");
        $uCheck->execute([':em' => $email]);
        if (!$uCheck->fetch()) {
            $userPass = !empty($input['password']) ? trim($input['password']) : 'StudentPass2025!';
            $uHash = password_hash($userPass, PASSWORD_BCRYPT);
            $uIns = $pdo->prepare("
                INSERT INTO users (full_name, email, phone, password_hash, role, address, guardian_name, guardian_phone, is_active)
                VALUES (:fn, :em, :ph, :pw, 'student', :ad, :gn, :gp, 1)
            ");
            $uIns->execute([
                ':fn' => trim($firstName . ' ' . $lastName),
                ':em' => $email,
                ':ph' => $phone,
                ':pw' => $uHash,
                ':ad' => $address,
                ':gn' => $guardianName,
                ':gp' => $guardianPhone,
            ]);
        }
    } catch (Exception $uEx) {}

    // Automated Notifications Pipeline
    try {
        $settings = getGeneralSettingsConfig();
        $schoolEmail = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
        $schoolWhatsapp = $settings['schoolWhatsapp'] ?? '08031308881';

        // 1. Email notification to Admissions Desk
        if (!empty($settings['emailAlerts']) && !empty($settings['alertOnApplication'] ?? true)) {
            $adminSubject = "🎵 New Application: {$firstName} {$lastName} [{$appNo}]";
            $adminHtml = "
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ded8; border-radius: 8px;'>
                    <h2 style='color: #0b0b0b; margin-top: 0;'>New Student Admission Application</h2>
                    <p>A new student application has been submitted on the portal:</p>
                    <table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Application No:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$appNo}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Applicant Name:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$firstName} {$lastName}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Program:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$program}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Study Mode / Level:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$studyMode} ({$skillLevel})</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Phone:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$phone}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Email:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$email}</td></tr>
                    </table>
                    <p style='margin-top: 20px;'><a href='http://localhost/Vivadoxa/#admin' style='background: #c96b32; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Open Admissions Manager</a></p>
                </div>
            ";
            sendSystemEmail($schoolEmail, $adminSubject, $adminHtml, $settings);

            // Student confirmation
            if (!empty($settings['studentEmailConfirmation'] ?? true)) {
                $studentSubject = "Welcome to Vivadoxa — Application #{$appNo} Received";
                $studentHtml = "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ded8; border-radius: 8px;'>
                        <h2 style='color: #0b0b0b; margin-top: 0;'>Application Received!</h2>
                        <p>Dear {$firstName},</p>
                        <p>Thank you for choosing Vivadoxa Music Academy. We have successfully received your admission application for <strong>{$program}</strong>.</p>
                        <div style='background: #f7f5f0; padding: 14px; border-radius: 6px; margin: 15px 0;'>
                            <p style='margin: 0;'><strong>Application Reference:</strong> <span style='color: #c96b32; font-size: 16px; font-weight: bold;'>{$appNo}</span></p>
                            <p style='margin: 6px 0 0; font-size: 13px; color: #5c5954;'>Track your admission status anytime on our website using this reference.</p>
                        </div>
                        <p>Our admissions committee is reviewing your details. If you have questions, reply to this email or chat with us on WhatsApp at {$schoolWhatsapp}.</p>
                    </div>
                ";
                sendSystemEmail($email, $studentSubject, $studentHtml, $settings);
            }
        }

        // 2. WhatsApp notification
        if (!empty($settings['whatsappAlerts']) && !empty($settings['alertOnApplication'] ?? true)) {
            $waMsg = "🔔 *New Vivadoxa Application*\n\nRef: {$appNo}\nStudent: {$firstName} {$lastName}\nProgram: {$program}\nPhone: {$phone}\nEmail: {$email}\nMode: {$studyMode}";
            sendSystemWhatsApp($schoolWhatsapp, $waMsg, $settings);
        }
    } catch (Exception $notifEx) {
        // Notification failure never blocks application submission
    }

    jsonResponse([
        'success' => true,
        'message' => 'Application submitted successfully!',
        'application_no' => $appNo,
        'tuition_fee' => $tuitionFee,
    ], 201);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
