<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $email = trim($_GET['email'] ?? '');
    $status = trim($_GET['status'] ?? 'all');
    $all = isset($_GET['all']) || empty($email);

    if ($all && empty($email)) {
        // Admin overview
        $sql = "SELECT * FROM `schedule_requests`";
        $params = [];
        if ($status !== 'all' && in_array($status, ['pending', 'approved', 'declined', 'completed'])) {
            $sql .= " WHERE `status` = :st";
            $params[':st'] = $status;
        }
        $sql .= " ORDER BY `created_at` DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        jsonResponse([
            'success' => true,
            'requests' => $stmt->fetchAll(),
        ]);
    } else {
        // Student requests
        $sql = "SELECT * FROM `schedule_requests` WHERE LOWER(student_email) = LOWER(:em)";
        $params = [':em' => $email];
        if ($status !== 'all') {
            $sql .= " AND `status` = :st";
            $params[':st'] = $status;
        }
        $sql .= " ORDER BY `created_at` DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        jsonResponse([
            'success' => true,
            'requests' => $stmt->fetchAll(),
        ]);
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? 'create');

    if ($action === 'create') {
        $studentName = trim($input['student_name'] ?? '');
        $studentEmail = trim($input['student_email'] ?? '');
        $studentPhone = trim($input['student_phone'] ?? '');
        $program = trim($input['program'] ?? 'Music Academy Program');
        $requestType = trim($input['request_type'] ?? 'absence_travel'); // 'absence_travel' | 'one_off_reschedule' | 'permanent_change'
        $currentSchedule = trim($input['current_schedule'] ?? 'Saturday Cohort');
        $affectedDate = !empty($input['affected_date']) ? trim($input['affected_date']) : null;
        $returnDate = !empty($input['return_date']) ? trim($input['return_date']) : null;
        $reason = trim($input['reason'] ?? 'Traveling out of town');
        $makeupRequested = isset($input['makeup_requested']) ? (int)(bool)$input['makeup_requested'] : 1;
        $preferredMakeup = trim($input['preferred_makeup_slot'] ?? '');
        $notes = trim($input['notes'] ?? '');

        if (empty($studentName) || empty($studentEmail)) {
            jsonResponse(['success' => false, 'error' => 'Student name and email are required.'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `schedule_requests`
            (`student_name`, `student_email`, `student_phone`, `program`, `request_type`, `current_schedule`, `affected_date`, `return_date`, `reason`, `makeup_requested`, `preferred_makeup_slot`, `notes`, `status`)
            VALUES (:sn, :se, :sp, :pr, :rt, :cs, :ad, :rd, :re, :mr, :pm, :no, 'pending')
        ");
        $stmt->execute([
            ':sn' => $studentName,
            ':se' => $studentEmail,
            ':sp' => $studentPhone,
            ':pr' => $program,
            ':rt' => $requestType,
            ':cs' => $currentSchedule,
            ':ad' => $affectedDate,
            ':rd' => $returnDate,
            ':re' => $reason,
            ':mr' => $makeupRequested,
            ':pm' => $preferredMakeup,
            ':no' => $notes,
        ]);

        $requestId = (int)$pdo->lastInsertId();

        // Automated notification to school admissions/instructors
        try {
            $settings = getGeneralSettingsConfig();
            $schoolEmail = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
            $schoolWhatsapp = $settings['schoolWhatsapp'] ?? '08031308881';

            $typeLabel = $requestType === 'one_off_reschedule'
                ? 'One-Off Reschedule Request'
                : ($requestType === 'permanent_change' ? 'Permanent Cohort Change' : 'Travel / Absence Notice');

            $dateInfo = $affectedDate ? $affectedDate : 'Upcoming session';
            if ($returnDate) $dateInfo .= " until $returnDate";

            // 1. WhatsApp to Admin/Instructor
            if (!empty($settings['whatsappAlerts'])) {
                $waMsg = "📅 *Vivadoxa Schedule Update Notice*\n\nType: {$typeLabel}\nStudent: {$studentName}\nProgram: {$program}\nCurrent Schedule: {$currentSchedule}\nDate(s) Affected: {$dateInfo}\nReason: {$reason}\nMakeup Requested: " . ($makeupRequested ? "Yes ($preferredMakeup)" : "No");
                sendSystemWhatsApp($schoolWhatsapp, $waMsg, $settings);
            }

            // 2. Email to School
            if (!empty($settings['emailAlerts'])) {
                $subject = "📅 Schedule Update: {$studentName} ({$typeLabel})";
                $body = "
                    <p>A student has logged an unavailability or reschedule request:</p>
                    <table style='width: 100%; border-collapse: collapse; margin: 15px 0;'>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Student:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$studentName} ({$studentEmail})</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Program:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$program}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Current Schedule:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$currentSchedule}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Request Type:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$typeLabel}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Date(s) Affected:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$dateInfo}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Reason:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$reason}</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Preferred Makeup:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>" . ($makeupRequested ? $preferredMakeup : 'No makeup needed') . "</td></tr>
                        <tr><td style='padding: 8px; border-bottom: 1px solid #eee;'><strong>Student Notes:</strong></td><td style='padding: 8px; border-bottom: 1px solid #eee;'>{$notes}</td></tr>
                    </table>
                ";
                $html = buildBrandedEmailTemplate([
                    'title'      => 'Schedule Notice',
                    'badge'      => 'Academic Coordinator',
                    'clientName' => 'Admissions & Faculty',
                    'headline'   => "Schedule Notice: {$studentName}",
                    'refNumber'  => "REQ-{$requestId}",
                    'refLabel'   => 'Notice Reference',
                    'bodyHtml'   => $body,
                    'deptName'   => 'Vivadoxa Music Academy Admissions',
                    'deptEmail'  => 'academy@vivadoxamusic.com',
                    'ctaText'    => 'Review in Admin Portal',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
                ]);
                sendSystemEmail($schoolEmail, $subject, $html, $settings, 'academy');
                $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
                if (!empty($officialGmail) && strcasecmp($schoolEmail, $officialGmail) !== 0) {
                    sendSystemEmail($officialGmail, $subject, $html, $settings, 'academy');
                }

                // Student confirmation email
                $studentSub = "Vivadoxa Academy — Schedule Request Received (#REQ-{$requestId})";
                $studentBody = "
                    <p>We have received your schedule notice regarding <strong>{$program}</strong> for <strong>{$dateInfo}</strong>.</p>
                    <p>Our academic coordinator and studio instructors have been notified. If a makeup session was requested, we will allocate an open studio slot and confirm via WhatsApp and your Student Portal.</p>
                    <p style='font-size: 13px; color: #666; margin-top: 18px;'>If you have any urgent changes, reply directly to this email or chat with our admissions desk on WhatsApp.</p>
                ";
                $studentHtml = buildBrandedEmailTemplate([
                    'title'      => 'Notice Received',
                    'badge'      => 'Academic Coordinator',
                    'clientName' => $studentName,
                    'headline'   => 'Schedule Notice Logged',
                    'refNumber'  => "REQ-{$requestId}",
                    'refLabel'   => 'Notice Reference',
                    'bodyHtml'   => $studentBody,
                    'deptName'   => 'Vivadoxa Music Academy Admissions Office',
                    'deptEmail'  => 'academy@vivadoxamusic.com',
                    'ctaText'    => 'Open Student Portal',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#portal',
                ]);
                sendSystemEmail($studentEmail, $studentSub, $studentHtml, $settings, 'academy');
            }
        } catch (Exception $e) {}

        jsonResponse([
            'success' => true,
            'message' => 'Schedule notice submitted successfully. Instructors and admissions have been alerted.',
            'id' => $requestId,
        ], 201);
    } elseif ($action === 'respond') {
        $id = (int)($input['id'] ?? 0);
        $newStatus = trim($input['status'] ?? 'approved'); // 'approved' | 'declined'
        $makeupDate = !empty($input['allocated_makeup_date']) ? trim($input['allocated_makeup_date']) : null;
        $room = trim($input['allocated_room'] ?? 'Studio Room 1');
        $staffNotes = trim($input['staff_notes'] ?? '');

        if ($id <= 0) {
            jsonResponse(['success' => false, 'error' => 'Valid request ID required.'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM `schedule_requests` WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $req = $stmt->fetch();
        if (!$req) {
            jsonResponse(['success' => false, 'error' => 'Schedule request not found.'], 404);
        }

        $up = $pdo->prepare("
            UPDATE `schedule_requests`
            SET `status` = :st, `allocated_makeup_date` = :md, `allocated_room` = :rm, `staff_notes` = :sn
            WHERE id = :id
        ");
        $up->execute([
            ':st' => $newStatus,
            ':md' => $makeupDate,
            ':rm' => $room,
            ':sn' => $staffNotes,
            ':id' => $id,
        ]);

        // Send alert to student
        try {
            $settings = getGeneralSettingsConfig();
            $sName = $req['student_name'];
            $sEmail = $req['student_email'];
            $sPhone = $req['student_phone'];
            $prog = $req['program'];

            if ($newStatus === 'approved') {
                $makeupStr = $makeupDate ? date('l, jS M Y @ g:i A', strtotime($makeupDate)) : 'Allocated in student schedule';
                
                // WhatsApp ping to student
                $waMsg = "🎵 *Vivadoxa Schedule Update Approved*\n\nHello {$sName}, your request for {$prog} has been approved.\n" . ($makeupDate ? "Catch-up / Makeup Session: {$makeupStr}\nStudio Room: {$room}\n" : "") . ($staffNotes ? "Notes: {$staffNotes}\n" : "") . "See you in studio!";
                sendSystemWhatsApp($sPhone, $waMsg, $settings);

                // Email to student
                $sub = "Vivadoxa Academy — Schedule Request Approved ({$prog})";
                $approvedBody = "
                    <p>Your schedule notice for <strong>{$prog}</strong> has been approved by the academic desk.</p>
                    " . ($makeupDate ? "<div style='background: #f7f5f0; border: 1px solid #dfdad0; border-radius: 8px; padding: 14px 18px; margin: 15px 0;'><p style='margin: 0; color: #157054; font-weight: bold;'>Makeup Session Allocated</p><p style='margin: 4px 0 0;'><strong>Date & Time:</strong> {$makeupStr}</p><p style='margin: 4px 0 0;'><strong>Studio Location:</strong> {$room}</p></div>" : "") . "
                    " . ($staffNotes ? "<p><em>Academic Coordinator Note: {$staffNotes}</em></p>" : "") . "
                    <p>You can view your updated timetable and studio allocation anytime in your Student Portal.</p>
                ";
                $html = buildBrandedEmailTemplate([
                    'title'      => 'Schedule Approved',
                    'badge'      => 'Academic Coordinator',
                    'clientName' => $sName,
                    'headline'   => 'Schedule Update Approved',
                    'refNumber'  => "REQ-{$id}",
                    'refLabel'   => 'Notice Reference',
                    'bodyHtml'   => $approvedBody,
                    'deptName'   => 'Vivadoxa Music Academy Admissions Office',
                    'deptEmail'  => 'academy@vivadoxamusic.com',
                    'ctaText'    => 'Open Student Portal',
                    'ctaUrl'     => 'https://www.vivadoxamusic.com/#portal',
                ]);
                sendSystemEmail($sEmail, $sub, $html, $settings, 'academy');
            }
        } catch (Exception $e) {}

        jsonResponse([
            'success' => true,
            'message' => "Schedule request #$id marked as $newStatus.",
            'id' => $id,
            'status' => $newStatus,
        ]);
    } else {
        jsonResponse(['success' => false, 'error' => 'Unknown action.'], 400);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
