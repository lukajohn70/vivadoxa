<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $ref = trim($_GET['ref'] ?? $_GET['application_no'] ?? $_GET['code'] ?? $_GET['reference'] ?? $_GET['tracking_code'] ?? $_GET['q'] ?? '');
    $email = trim($_GET['email'] ?? '');
    $isSingleLookup = isset($_GET['track']) || isset($_GET['lookup']) || !empty($ref) || (!empty($email) && empty($_GET['search']) && empty($_GET['status']));

    // Single lookup mode (e.g. for student status checking)
    if ($isSingleLookup) {
        // If ref contains '@' and email is empty, swap
        if (strpos($ref, '@') !== false && empty($email)) {
            $email = $ref;
            $ref = '';
        }

        $app = null;
        if (!empty($ref) && !empty($email)) {
            $sql = "SELECT * FROM `applications` 
                    WHERE (LOWER(TRIM(application_no)) = LOWER(TRIM(:ref)) 
                       OR phone = :ref 
                       OR application_no IN (SELECT application_no FROM payments WHERE LOWER(TRIM(reference)) = LOWER(TRIM(:ref)))) 
                      AND LOWER(TRIM(email)) = LOWER(TRIM(:email)) 
                    ORDER BY id DESC LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':ref' => $ref, ':email' => $email]);
            $app = $stmt->fetch();
        } elseif (!empty($ref)) {
            $sql = "SELECT * FROM `applications` 
                    WHERE LOWER(TRIM(application_no)) = LOWER(TRIM(:ref)) 
                       OR LOWER(TRIM(email)) = LOWER(TRIM(:ref)) 
                       OR phone = :ref 
                       OR application_no IN (SELECT application_no FROM payments WHERE LOWER(TRIM(reference)) = LOWER(TRIM(:ref)) OR LOWER(TRIM(application_no)) = LOWER(TRIM(:ref)))
                    ORDER BY id DESC LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':ref' => $ref]);
            $app = $stmt->fetch();

            // If not found in applications, check if ref is a payment reference
            if (!$app) {
                $pCheck = $pdo->prepare("SELECT * FROM `payments` WHERE LOWER(TRIM(reference)) = LOWER(TRIM(:ref)) LIMIT 1");
                $pCheck->execute([':ref' => $ref]);
                $foundPay = $pCheck->fetch();
                if ($foundPay && !empty($foundPay['payer_email'])) {
                    $appStmt = $pdo->prepare("SELECT * FROM `applications` WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) ORDER BY id DESC LIMIT 1");
                    $appStmt->execute([':em' => $foundPay['payer_email']]);
                    $app = $appStmt->fetch();
                }
            }
        } elseif (!empty($email)) {
            $sql = "SELECT * FROM `applications` WHERE LOWER(TRIM(email)) = LOWER(TRIM(:email)) ORDER BY id DESC LIMIT 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':email' => $email]);
            $app = $stmt->fetch();
        }

        if (!$app) {
            $searchedTerm = $ref ?: $email;
            jsonResponse([
                'success' => false, 
                'error' => "No application record found for '$searchedTerm'. Please verify your application reference or email address."
            ], 404);
        }

        // Fetch best payment record linked by application_no OR payer_email
        $payStmt = $pdo->prepare("
            SELECT * FROM `payments` 
            WHERE (application_no = :no AND :no != '') 
               OR (payer_email != '' AND LOWER(TRIM(payer_email)) = LOWER(TRIM(:em))) 
            ORDER BY CASE WHEN status = 'verified' THEN 1 WHEN status = 'pending' THEN 2 ELSE 3 END, id DESC 
            LIMIT 1
        ");
        $payStmt->execute([':no' => $app['application_no'], ':em' => $app['email']]);
        $payment = $payStmt->fetch() ?: null;

        // Synchronize payment status
        if ($payment && $payment['status'] === 'verified') {
            $app['payment_status'] = 'verified';
            if ($app['status'] !== 'approved') {
                $app['status'] = 'approved';
                $app['letter_released'] = 1;
                $pdo->prepare("UPDATE `applications` SET `status` = 'approved', `payment_status` = 'verified', `letter_released` = 1 WHERE `id` = :id")->execute([':id' => $app['id']]);
            }
        } else {
            $app['payment_status'] = $payment ? $payment['status'] : ($app['payment_status'] ?? 'pending');
        }

        // Fetch student record if enrolled
        $studStmt = $pdo->prepare("SELECT * FROM `students` WHERE application_no = :no OR LOWER(TRIM(email)) = LOWER(TRIM(:em)) LIMIT 1");
        $studStmt->execute([':no' => $app['application_no'], ':em' => $app['email']]);
        $student = $studStmt->fetch() ?: null;
        if ($student) {
            $app['student_no'] = $student['student_no'];
        }

        // Fetch all applications under same email so applicant can toggle
        $allAppsStmt = $pdo->prepare("SELECT id, application_no, program, study_mode, status, payment_status, created_at FROM `applications` WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) ORDER BY id DESC");
        $allAppsStmt->execute([':em' => $app['email']]);
        $allApps = $allAppsStmt->fetchAll();

        jsonResponse([
            'success' => true,
            'application' => $app,
            'payment' => $payment,
            'student' => $student,
            'applications_list' => $allApps,
        ]);
    }

    // List mode (for admin portal)
    $search = trim($_GET['search'] ?? '');
    $status = trim($_GET['status'] ?? '');

    $sql = "SELECT a.*, 
                   COALESCE(p.reference, a_p.reference) AS payment_reference,
                   COALESCE(p.status, a_p.status, a.payment_status, 'pending') AS payment_status,
                   COALESCE(p.amount, a_p.amount, a.tuition_fee) AS payment_amount,
                   COALESCE(p.currency, a_p.currency, a.currency, 'NGN') AS payment_currency,
                   COALESCE(p.method, a_p.method, 'Bank Transfer') AS payment_method,
                   COALESCE(p.created_at, a_p.created_at) AS payment_date
            FROM `applications` a
            LEFT JOIN (
                SELECT p1.* FROM `payments` p1
                INNER JOIN (
                    SELECT MAX(id) AS max_id FROM `payments` GROUP BY application_no
                ) p2 ON p1.id = p2.max_id
            ) p ON p.application_no = a.application_no
            LEFT JOIN (
                SELECT p3.* FROM `payments` p3
                INNER JOIN (
                    SELECT MAX(id) AS max_id FROM `payments` GROUP BY payer_email
                ) p4 ON p3.id = p4.max_id
            ) a_p ON LOWER(TRIM(a_p.payer_email)) = LOWER(TRIM(a.email))
            WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $sql .= " AND (a.first_name LIKE :s1 OR a.last_name LIKE :s2 OR a.email LIKE :s3 OR a.application_no LIKE :s4 OR p.reference LIKE :s5 OR a_p.reference LIKE :s6)";
        $term = "%$search%";
        $params[':s1'] = $term;
        $params[':s2'] = $term;
        $params[':s3'] = $term;
        $params[':s4'] = $term;
        $params[':s5'] = $term;
        $params[':s6'] = $term;
    }

    if (!empty($status)) {
        $sql .= " AND a.status = :st";
        $params[':st'] = $status;
    }

    $sql .= " ORDER BY a.created_at DESC LIMIT 100";
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

        // Find application
        $targetApp = null;
        if (!empty($appNo)) {
            $stmt = $pdo->prepare("SELECT * FROM `applications` WHERE `application_no` = :no LIMIT 1");
            $stmt->execute([':no' => $appNo]);
            $targetApp = $stmt->fetch();
        } elseif ($id > 0) {
            $stmt = $pdo->prepare("SELECT * FROM `applications` WHERE `id` = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $targetApp = $stmt->fetch();
        }

        if (!$targetApp) {
            jsonResponse(['success' => false, 'error' => 'Application ID or reference required.'], 400);
        }

        $appNo = $targetApp['application_no'];
        $appId = (int)$targetApp['id'];

        if ($newStatus === 'approved') {
            // Check if there is an existing payment
            $pCheck = $pdo->prepare("SELECT id, status FROM `payments` WHERE application_no = :no OR (payer_email != '' AND LOWER(TRIM(payer_email)) = LOWER(TRIM(:em))) ORDER BY id DESC LIMIT 1");
            $pCheck->execute([':no' => $appNo, ':em' => $targetApp['email']]);
            $existingPay = $pCheck->fetch();

            $payStatus = 'verified';
            if ($existingPay) {
                // Verify payment in payments table
                $pdo->prepare("UPDATE `payments` SET `status` = 'verified', `verified_at` = NOW() WHERE `id` = :pid")->execute([':pid' => $existingPay['id']]);
            }

            // Update application: approved, payment_status = verified, letter_released = 1
            $upSql = "UPDATE `applications` 
                      SET `status` = 'approved', 
                          `payment_status` = :pst, 
                          `letter_released` = 1,
                          `updated_at` = NOW() 
                      WHERE `id` = :id";
            $pdo->prepare($upSql)->execute([':pst' => $payStatus, ':id' => $appId]);

            // Auto-enroll in students table if not already enrolled
            $studCheck = $pdo->prepare("SELECT id FROM `students` WHERE LOWER(TRIM(application_no)) = LOWER(TRIM(:no)) OR LOWER(TRIM(email)) = LOWER(TRIM(:em)) LIMIT 1");
            $studCheck->execute([':no' => $appNo, ':em' => $targetApp['email']]);
            if (!$studCheck->fetch()) {
                $studNo = 'VD-' . date('Y') . '-' . str_pad((string)rand(10, 999), 3, '0', STR_PAD_LEFT);
                $pdo->prepare("
                    INSERT INTO `students` (`student_no`, `application_no`, `full_name`, `email`, `phone`, `program`, `study_mode`, `cohort`, `status`)
                    VALUES (:sno, :ano, :fn, :em, :ph, :pr, :sm, 'Saturday Cohort A', 'active')
                ")->execute([
                    ':sno' => $studNo,
                    ':ano' => $appNo,
                    ':fn'  => trim(($targetApp['first_name'] ?? '') . ' ' . ($targetApp['last_name'] ?? '')),
                    ':em'  => $targetApp['email'],
                    ':ph'  => $targetApp['phone'] ?? '',
                    ':pr'  => $targetApp['program'] ?? 'Music Course',
                    ':sm'  => $targetApp['study_mode'] ?? 'Onsite',
                ]);
            }

            // Ensure portal user account exists
            $uCheck = $pdo->prepare("SELECT id FROM `users` WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em)) LIMIT 1");
            $uCheck->execute([':em' => $targetApp['email']]);
            if (!$uCheck->fetch()) {
                $uPass = password_hash('StudentPass2025!', PASSWORD_BCRYPT);
                $pdo->prepare("
                    INSERT INTO `users` (`full_name`, `email`, `phone`, `password_hash`, `role`, `is_active`)
                    VALUES (:fn, :em, :ph, :pw, 'student', 1)
                ")->execute([
                    ':fn' => trim(($targetApp['first_name'] ?? '') . ' ' . ($targetApp['last_name'] ?? '')),
                    ':em' => $targetApp['email'],
                    ':ph' => $targetApp['phone'] ?? '',
                    ':pw' => $uPass,
                ]);
            } else {
                $pdo->prepare("UPDATE `users` SET `is_active` = 1 WHERE LOWER(TRIM(email)) = LOWER(TRIM(:em))")->execute([':em' => $targetApp['email']]);
            }
        } else {
            $stmt = $pdo->prepare("UPDATE `applications` SET `status` = :st, `updated_at` = NOW() WHERE `id` = :id");
            $stmt->execute([':st' => $newStatus, ':id' => $appId]);
        }

        jsonResponse([
            'success' => true, 
            'message' => "Application $appNo status updated to '$newStatus'. Student ledger synchronized.",
            'application_no' => $appNo,
            'status' => $newStatus,
        ]);
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

    // ── Action: Release admission letter (Admin) ──────────────────────────────
    if ($action === 'release_letter') {
        $appNo = trim($input['application_no'] ?? '');
        if (empty($appNo)) {
            jsonResponse(['success' => false, 'error' => 'Application reference required.'], 400);
        }
        $stmt = $pdo->prepare("UPDATE `applications` SET `letter_released` = 1, `updated_at` = NOW() WHERE `application_no` = :no");
        $stmt->execute([':no' => $appNo]);

        // Fetch application details to notify the candidate
        $candStmt = $pdo->prepare("SELECT * FROM `applications` WHERE `application_no` = :no LIMIT 1");
        $candStmt->execute([':no' => $appNo]);
        $cand = $candStmt->fetch();

        $emailSent = false;
        if ($cand && !empty($cand['email'])) {
            try {
                $settings     = getGeneralSettingsConfig();
                $firstName    = htmlspecialchars($cand['first_name'] ?? 'Candidate');
                $lastName     = htmlspecialchars($cand['last_name'] ?? '');
                $fullName     = trim("{$firstName} {$lastName}");
                $program      = htmlspecialchars($cand['program'] ?? 'Music Program');
                $studyMode    = htmlspecialchars($cand['study_mode'] ?? 'Onsite');
                $skillLevel   = htmlspecialchars($cand['skill_level'] ?? 'Beginner');
                $tuitionFee   = number_format((float)($cand['tuition_fee'] ?? 20000));
                $currency     = htmlspecialchars($cand['currency'] ?? 'NGN');
                $studentEmail = trim($cand['email']);
                $studentPhone = trim($cand['phone'] ?? '');

                $studentSubject = "🎉 Congratulations! Your Official Admission Letter Has Been Released (#{$appNo})";

                $bodyHtml = "
                    <p style='margin: 0 0 16px; font-size: 15px; color: #333;'>We are delighted to formally announce that the <strong>Vivadoxa Music Academy Admissions Board</strong> has approved your admission into our academy for the <strong>{$program}</strong> program.</p>
                    
                    <p style='margin: 0 0 16px; font-size: 15px; color: #333;'>Your official, digitally signed <strong>Admission Letter</strong> has now been generated, sealed, and released. You can preview, download, and print your letter anytime using your application reference code.</p>

                    <div style='background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; font-size: 14px;'>
                        <p style='margin: 0 0 8px;'><strong>Candidate Name:</strong> {$fullName}</p>
                        <p style='margin: 0 0 8px;'><strong>Application Ref:</strong> <span style='font-family: monospace; font-weight: bold; color: #a24a18;'>{$appNo}</span></p>
                        <p style='margin: 0 0 8px;'><strong>Program &amp; Track:</strong> {$program} ({$studyMode} · {$skillLevel})</p>
                        <p style='margin: 0 0 8px;'><strong>Term Tuition:</strong> ₦{$tuitionFee} {$currency}</p>
                        <p style='margin: 0;'><strong>Official Status:</strong> <span style='display: inline-block; background: #ecfdf5; color: #047857; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 11px;'>Admission Letter Released &amp; Active</span></p>
                    </div>

                    <p style='margin: 18px 0 8px; font-size: 14px; font-weight: 700; color: #0b0b0b;'>Next Steps to Complete Your Enrollment:</p>
                    <ol style='margin: 0 0 20px; padding-left: 20px; font-size: 14px; color: #555; line-height: 1.7;'>
                        <li>Click the button below to preview and download your official Admission Letter (PDF).</li>
                        <li>Review your cohort timetable and terms of enrollment.</li>
                        <li>Submit your tuition payment proof via bank transfer or your student portal to secure your studio instrument slot.</li>
                    </ol>

                    <p style='font-size: 13px; color: #666; margin-top: 20px;'>If you have questions regarding orientation, studio cohort allocation, or payment reconciliation, our admissions team is here to assist you.</p>
                ";

                $studentEmailBody = buildBrandedEmailTemplate([
                    'title'      => 'Official Admission Letter',
                    'badge'      => 'Admissions Board',
                    'clientName' => $firstName,
                    'headline'   => "Congratulations, {$firstName}! Your Admission Letter is Ready.",
                    'refNumber'  => $appNo,
                    'refLabel'   => 'Application Number',
                    'bodyHtml'   => $bodyHtml,
                    'deptName'   => 'Vivadoxa Music Academy Admissions Office',
                    'deptEmail'  => 'academy@vivadoxamusic.com',
                    'ctaText'    => 'View Admission Letter',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#status',
                ]);

                // Send to student (automatically BCCs official Gmail vivadoxa@gmail.com)
                sendSystemEmail($studentEmail, $studentSubject, $studentEmailBody, $settings, 'academy');
                $emailSent = true;

                // Send notice to admissions desk and official Gmail
                $adminDeskNotice = buildBrandedEmailTemplate([
                    'title'      => 'Admission Letter Released',
                    'badge'      => 'Admissions Alert',
                    'clientName' => 'Admissions Team',
                    'headline'   => "Admission Letter Released for {$fullName} ({$appNo})",
                    'refNumber'  => $appNo,
                    'refLabel'   => 'Candidate Ref',
                    'bodyHtml'   => "
                        <p>An official admission letter has been released to candidate:</p>
                        <p><strong>Candidate:</strong> {$fullName}<br>
                           <strong>Email:</strong> {$studentEmail}<br>
                           <strong>Phone:</strong> {$studentPhone}<br>
                           <strong>Program:</strong> {$program} ({$studyMode})</p>
                        <p>The student has been sent their release notification email with download instructions.</p>
                    ",
                    'deptName'   => 'Vivadoxa Admissions Office',
                    'deptEmail'  => 'academy@vivadoxamusic.com',
                    'ctaText'    => 'Open Applications Manager',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
                ]);

                $schoolEmail = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
                sendSystemEmail($schoolEmail, "Letter Released: {$appNo} — {$fullName}", $adminDeskNotice, $settings, 'academy');
                $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
                if (!empty($officialGmail) && strcasecmp($schoolEmail, $officialGmail) !== 0) {
                    sendSystemEmail($officialGmail, "Letter Released: {$appNo} — {$fullName}", $adminDeskNotice, $settings, 'academy');
                }
            } catch (Exception $mailEx) {}
        }

        jsonResponse([
            'success'    => true,
            'message'    => 'Admission letter released for ' . $appNo . ($emailSent ? ' and congratulatory email sent to student.' : '.'),
            'email_sent' => $emailSent,
        ]);
    }

    // ── Action: Revoke admission letter (Admin) ───────────────────────────────
    if ($action === 'revoke_letter') {
        $appNo = trim($input['application_no'] ?? '');
        if (empty($appNo)) {
            jsonResponse(['success' => false, 'error' => 'Application reference required.'], 400);
        }
        $stmt = $pdo->prepare("UPDATE `applications` SET `letter_released` = 0, `updated_at` = NOW() WHERE `application_no` = :no");
        $stmt->execute([':no' => $appNo]);
        jsonResponse(['success' => true, 'message' => 'Admission letter access revoked for ' . $appNo]);
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
    $passportPhoto = trim($input['passportPhoto'] ?? $input['passport_photo'] ?? '');

    $stmt = $pdo->prepare("
        INSERT INTO `applications`
        (`application_no`, `first_name`, `last_name`, `email`, `phone`, `program`, `study_mode`, `skill_level`, `dob`, `gender`, `guardian_name`, `guardian_phone`, `address`, `class_type`, `state_of_origin`, `marital_status`, `nationality`, `occupation`, `sponsor`, `session_time`, `duration`, `currency`, `status`, `tuition_fee`, `passport_photo`)
        VALUES (:no, :fn, :ln, :em, :ph, :pr, :sm, :sl, :dob, :gen, :gname, :gph, :addr, :ctype, :state, :marital, :nat, :occ, :spon, :stime, :dur, :curr, 'pending', :fee, :passport)
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
        ':passport' => !empty($passportPhoto) ? $passportPhoto : null,
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
            $adminDetails = "
                <p>A new student application has been submitted on the portal:</p>
                <table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Application No:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$appNo}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Applicant Name:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$firstName} {$lastName}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Program:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$program}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Study Mode / Level:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$studyMode} ({$skillLevel})</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Phone:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$phone}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Email:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$email}</td></tr>
                </table>
            ";
            $adminHtml = buildBrandedEmailTemplate([
                'title'      => 'New Application',
                'badge'      => 'Admissions Board',
                'clientName' => 'Admissions Team',
                'headline'   => "New Admission Application: {$firstName} {$lastName}",
                'refNumber'  => $appNo,
                'refLabel'   => 'Application Number',
                'bodyHtml'   => $adminDetails,
                'deptName'   => 'Vivadoxa Music Academy Admissions Office',
                'deptEmail'  => 'academy@vivadoxamusic.com',
                'ctaText'    => 'Open Admissions Manager',
                'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
            ]);
            sendSystemEmail($schoolEmail, $adminSubject, $adminHtml, $settings, 'academy');
            $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
            if (!empty($officialGmail) && strcasecmp($schoolEmail, $officialGmail) !== 0) {
                sendSystemEmail($officialGmail, $adminSubject, $adminHtml, $settings, 'academy');
            }

            // Student confirmation
            if (!empty($settings['studentEmailConfirmation'] ?? true)) {
                $studentSubject = "Welcome to Vivadoxa — Application #{$appNo} Received";
                $studentBody = "
                    <p>Thank you for choosing Vivadoxa Music Academy. We have successfully received your admission application for <strong>{$program}</strong>.</p>
                    <p>Our admissions committee is reviewing your submission. You can track your admission status anytime on our website using your application number.</p>
                    <p style='font-size: 13px; color: #666; margin-top: 18px;'>If you have any questions regarding your admission, program curriculum, or studio cohorts, reply to this email or chat with our admissions desk on WhatsApp at <strong>{$schoolWhatsapp}</strong>.</p>
                ";
                $studentHtml = buildBrandedEmailTemplate([
                    'title'      => 'Application Received',
                    'badge'      => 'Admissions Board',
                    'clientName' => $firstName,
                    'headline'   => 'Welcome to Vivadoxa Music Academy',
                    'refNumber'  => $appNo,
                    'refLabel'   => 'Application Number',
                    'bodyHtml'   => $studentBody,
                    'deptName'   => 'Vivadoxa Music Academy Admissions Office',
                    'deptEmail'  => 'academy@vivadoxamusic.com',
                    'ctaText'    => 'Track Admission Status',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#status',
                ]);
                sendSystemEmail($email, $studentSubject, $studentHtml, $settings, 'academy');
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
