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
                $html = "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ded8; border-radius: 8px;'>
                        <h2 style='color: #0b0b0b; margin-top: 0;'>Student Schedule / Absence Notice</h2>
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
                        <p><a href='http://localhost/Vivadoxa/#admin' style='background: #c96b32; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Review & Allocate Makeup in Admin</a></p>
                    </div>
                ";
                sendSystemEmail($schoolEmail, $subject, $html, $settings);

                // Student confirmation email
                $studentSub = "Vivadoxa Academy — Schedule Request Received (#REQ-{$requestId})";
                $studentHtml = "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ded8; border-radius: 8px;'>
                        <h2 style='color: #0b0b0b; margin-top: 0;'>Schedule Notice Received</h2>
                        <p>Dear {$studentName},</p>
                        <p>We have received your schedule notice regarding <strong>{$program}</strong> for <strong>{$dateInfo}</strong>.</p>
                        <p>Our academic coordinator and instructors have been notified. If a makeup session was requested, we will allocate an open studio slot and confirm via WhatsApp and your portal.</p>
                        <p style='margin-top: 20px; font-size: 13px; color: #5c5954;'>Vivadoxa Music Academy Admissions & Studio Office · Kaduna</p>
                    </div>
                ";
                sendSystemEmail($studentEmail, $studentSub, $studentHtml, $settings);
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
                $html = "
                    <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ded8; border-radius: 8px;'>
                        <h2 style='color: #157054; margin-top: 0;'>Schedule Update Confirmed!</h2>
                        <p>Dear {$sName},</p>
                        <p>Your schedule notice for <strong>{$prog}</strong> has been approved by the academic desk.</p>
                        " . ($makeupDate ? "<div style='background: #f7f5f0; padding: 14px; border-radius: 6px; margin: 15px 0;'><p style='margin: 0;'><strong>Makeup Session Date & Time:</strong> {$makeupStr}</p><p style='margin: 4px 0 0;'><strong>Studio Location:</strong> {$room}</p></div>" : "") . "
                        " . ($staffNotes ? "<p><em>Instructor Note: {$staffNotes}</em></p>" : "") . "
                        <p>You can view your updated timetable anytime in your <a href='http://localhost/Vivadoxa/#portal'>Student Portal</a>.</p>
                    </div>
                ";
                sendSystemEmail($sEmail, $sub, $html, $settings);
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
