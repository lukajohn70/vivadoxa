<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM `enquiries` ORDER BY created_at DESC LIMIT 200");
    $rows = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $rows, 'enquiries' => $rows]);

} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: Delete enquiry (Admin) ────────────────────────────────────────
    if ($action === 'delete') {
        $id = (int)($input['id'] ?? 0);
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM `enquiries` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            jsonResponse(['success' => true, 'message' => 'Enquiry record deleted successfully.']);
        }
        jsonResponse(['success' => false, 'error' => 'Valid enquiry ID required.'], 400);
    }

    // ── Action: Mark enquiry read / unread ────────────────────────────────────
    if ($action === 'mark_read') {
        $id = (int)($input['id'] ?? 0);
        $isRead = isset($input['is_read']) ? (int)$input['is_read'] : 1;

        if ($id <= 0) {
            jsonResponse(['success' => false, 'error' => 'Valid enquiry ID required.'], 400);
        }

        $stmt = $pdo->prepare("UPDATE `enquiries` SET `is_read` = :rd WHERE `id` = :id");
        $stmt->execute([':rd' => $isRead, ':id' => $id]);

        jsonResponse(['success' => true, 'message' => 'Enquiry status updated.']);
    }

    // ── Action: Reply to client via in-app email (Admin) ──────────────────────
    if ($action === 'reply') {
        $id = (int)($input['id'] ?? 0);
        $replyText = trim($input['reply'] ?? $input['message'] ?? '');
        $subject = trim($input['subject'] ?? '');
        $repliedBy = trim($input['replied_by'] ?? $input['admin_name'] ?? 'Vivadoxa Admin Desk');

        if ($id <= 0) {
            jsonResponse(['success' => false, 'error' => 'Valid enquiry ID required.'], 400);
        }
        if (empty($replyText)) {
            jsonResponse(['success' => false, 'error' => 'Reply message cannot be empty.'], 400);
        }

        // Fetch the enquiry
        $stmt = $pdo->prepare("SELECT * FROM `enquiries` WHERE `id` = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $enquiry = $stmt->fetch();
        if (!$enquiry) {
            jsonResponse(['success' => false, 'error' => 'Enquiry record not found.'], 404);
        }

        $clientEmail = trim($enquiry['email'] ?? '');
        if (empty($clientEmail)) {
            jsonResponse(['success' => false, 'error' => 'This enquiry has no email address on file. Please reach out via phone or WhatsApp.'], 400);
        }

        // Ensure reply columns exist in database (idempotent)
        try {
            $pdo->exec("ALTER TABLE `enquiries` ADD COLUMN `reply_message` TEXT NULL");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE `enquiries` ADD COLUMN `replied_at` DATETIME NULL");
        } catch (Exception $e) {}
        try {
            $pdo->exec("ALTER TABLE `enquiries` ADD COLUMN `replied_by` VARCHAR(100) NULL");
        } catch (Exception $e) {}

        // Format subject if not provided
        if (empty($subject)) {
            $origSubject = $enquiry['subject'] ?: 'Your Inquiry with Vivadoxa Music';
            $subject = (stripos($origSubject, 'Re:') === 0) ? $origSubject : "Re: {$origSubject}";
        }

        $source = $enquiry['source'] ?? 'contact';
        $settings = getGeneralSettingsConfig();
        $dept = 'contact';
        if (in_array($source, ['store', 'rentals', 'repairs', 'academy'], true)) {
            $dept = $source;
        }
        $deptInfo = getDepartmentSender($dept, $settings);

        // Format paragraphs for HTML email
        $replyHtmlFormatted = nl2br(htmlspecialchars($replyText));
        $originalMessageFormatted = nl2br(htmlspecialchars($enquiry['message'] ?? ''));

        $bodyHtml = "
            <div style='margin-bottom: 24px; font-size: 15px; color: #191715; line-height: 1.7;'>
                {$replyHtmlFormatted}
            </div>

            <div style='background: #faf8f5; border: 1px solid #ede8e0; border-left: 4px solid #c96b32; border-radius: 6px; padding: 14px 18px; margin: 26px 0 16px; font-size: 13px; color: #5c5954;'>
                <p style='margin: 0 0 6px; font-weight: 700; color: #191715; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;'>
                    Your Original Inquiry (" . htmlspecialchars($enquiry['created_at'] ?? 'Recently') . "):
                </p>
                <div style='font-style: italic; color: #444; line-height: 1.6;'>
                    {$originalMessageFormatted}
                </div>
            </div>

            <p style='font-size: 13px; color: #777; margin-top: 18px;'>
                Have additional questions or need immediate assistance? You can reply directly to this email or chat with our desk on WhatsApp at <strong style='color: #191715;'>" . htmlspecialchars($settings['schoolWhatsapp'] ?? '08031308881') . "</strong>.
            </p>
        ";

        $emailContent = buildBrandedEmailTemplate([
            'title'      => 'Vivadoxa Music Response',
            'badge'      => $deptInfo['badge'] ?: 'Support Desk',
            'clientName' => $enquiry['name'] ?: 'Valued Client',
            'headline'   => 'Response to Your Inquiry',
            'bodyHtml'   => $bodyHtml,
            'deptName'   => $deptInfo['name'],
            'deptEmail'  => $deptInfo['email'],
            'ctaText'    => 'Visit Vivadoxa Website',
            'ctaUrl'     => 'https://www.vivadoxamusic.com',
        ]);

        $emailResult = sendSystemEmail($clientEmail, $subject, $emailContent, $settings, $dept, true);

        // Update database record with the reply details and set is_read = 1
        $now = date('Y-m-d H:i:s');
        $updateStmt = $pdo->prepare("
            UPDATE `enquiries`
            SET `is_read` = 1,
                `reply_message` = :reply,
                `replied_at` = :replied_at,
                `replied_by` = :replied_by
            WHERE `id` = :id
        ");
        $updateStmt->execute([
            ':reply'      => $replyText,
            ':replied_at' => $now,
            ':replied_by' => $repliedBy,
            ':id'         => $id,
        ]);

        jsonResponse([
            'success'       => true,
            'message'       => "Reply successfully sent to {$clientEmail}.",
            'email_status'  => $emailResult,
            'reply_message' => $replyText,
            'replied_at'    => $now,
            'replied_by'    => $repliedBy,
        ]);
    }

    // ── Action: Submit public enquiry (Contact / Store / Rentals / General) ──
    $name    = trim($input['fullName'] ?? $input['name'] ?? '');
    $email   = trim($input['email'] ?? '');
    $phone   = trim($input['phone'] ?? '');
    $subject = trim($input['subject'] ?? 'General Enquiry');
    $source  = trim($input['source'] ?? 'contact'); // 'contact' | 'store' | 'rentals' | 'general'
    $type    = trim($input['type']   ?? 'general'); // 'quote' | 'reservation' | 'contact' | 'general'

    // Build the message body from either a pre-built message or individual fields
    $message = trim($input['message'] ?? '');

    // For Store / Rentals that pass structured fields, compose a coherent message if none provided
    if (empty($message)) {
        $parts = [];
        $equipList = $input['equipmentList'] ?? $input['equipment_list'] ?? $input['items'] ?? null;
        if ($equipList) {
            $listStr = is_array($equipList) ? implode(', ', $equipList) : $equipList;
            $parts[] = "• Requested Equipment: $listStr";
        }
        foreach (['duration','intake','intakeMethod','collectionMethod','budget','instrumentPlayed',
                  'instrumentNeeded','clientType','notes','additionalNotes','address','pickupAddress'] as $fld) {
            $val = trim($input[$fld] ?? '');
            if ($val !== '') {
                $label = ucfirst(preg_replace('/(?<!^)[A-Z]/', ' $0', $fld));
                $parts[] = "• $label: $val";
            }
        }
        $message = implode("\n", $parts);
    }

    // Require at minimum a name and either email or phone
    if (empty($name)) {
        jsonResponse(['success' => false, 'error' => 'Please provide your name.'], 400);
    }
    if (empty($email) && empty($phone)) {
        jsonResponse(['success' => false, 'error' => 'Please provide at least a phone number or email address.'], 400);
    }
    if (empty($message)) {
        jsonResponse(['success' => false, 'error' => 'Please describe your enquiry or requirements.'], 400);
    }

    // Ensure `source` and `type` columns exist (idempotent migration)
    try {
        $pdo->exec("ALTER TABLE `enquiries` ADD COLUMN `source` VARCHAR(50) NOT NULL DEFAULT 'contact'");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `enquiries` ADD COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'general'");
    } catch (Exception $e) {}

    $stmt = $pdo->prepare("
        INSERT INTO `enquiries` (`name`, `email`, `phone`, `subject`, `message`, `source`, `type`, `is_read`)
        VALUES (:name, :email, :phone, :subj, :msg, :src, :typ, 0)
    ");
    $stmt->execute([
        ':name'  => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':subj'  => $subject,
        ':msg'   => $message,
        ':src'   => $source,
        ':typ'   => $type,
    ]);

    // Send automated branded email confirmation
    try {
        $settings = getGeneralSettingsConfig();
        $dept = 'contact';
        if (in_array($source, ['store', 'rentals', 'repairs', 'academy'], true)) {
            $dept = $source;
        }
        $deptInfo = getDepartmentSender($dept, $settings);

        $enqHtml = "
            <p style='margin: 0 0 16px; font-size: 15px; color: #333;'>Thank you for reaching out to Vivadoxa Music. We have received your inquiry and our desk team is on it.</p>
            
            <div style='background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px; padding: 16px; margin: 18px 0; font-size: 13px;'>
                <p style='margin: 0 0 8px;'><strong>Subject:</strong> " . htmlspecialchars($subject) . "</p>
                <p style='margin: 0 0 8px;'><strong>Inquiry Department:</strong> " . htmlspecialchars($deptInfo['name']) . "</p>
                <p style='margin: 0;'><strong>Your Message:</strong><br><em style='white-space: pre-line; color: #555; display: block; margin-top: 4px;'>" . htmlspecialchars($message) . "</em></p>
            </div>

            <p style='font-size: 14px; color: #444; margin-top: 18px;'>A member of our team will review your message and reply via email or phone/WhatsApp at <strong>" . htmlspecialchars($phone ?: $email) . "</strong> shortly.</p>
        ";

        if (!empty($email)) {
            $customerEmailBody = buildBrandedEmailTemplate([
                'title'      => 'Inquiry Received',
                'badge'      => $deptInfo['badge'],
                'clientName' => $name,
                'headline'   => 'Message Received',
                'bodyHtml'   => $enqHtml,
                'deptName'   => $deptInfo['name'],
                'deptEmail'  => $deptInfo['email'],
                'ctaText'    => 'Visit Vivadoxa Music',
                'ctaUrl'     => 'https://www.vivadoxamusic.com',
            ]);
            sendSystemEmail($email, "Vivadoxa — We received your inquiry [{$subject}]", $customerEmailBody, $settings, $dept);
        }

        // Notify Admin Desk
        $adminRecipient = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
        $adminEmailBody = buildBrandedEmailTemplate([
            'title'      => 'New Website Enquiry',
            'badge'      => 'Desk Alert',
            'clientName' => 'Team Desk',
            'headline'   => "New Inquiry from {$name} ({$source})",
            'bodyHtml'   => "
                <p>A new enquiry has been submitted on the website:</p>
                <p><strong>Name:</strong> " . htmlspecialchars($name) . "<br>
                   <strong>Email:</strong> " . htmlspecialchars($email ?: 'Not provided') . "<br>
                   <strong>Phone:</strong> " . htmlspecialchars($phone ?: 'Not provided') . "<br>
                   <strong>Source:</strong> " . htmlspecialchars($source) . " (" . htmlspecialchars($type) . ")</p>
                {$enqHtml}
            ",
            'deptName'   => $deptInfo['name'],
            'deptEmail'  => $deptInfo['email'],
            'ctaText'    => 'Open Enquiries in Admin',
            'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
        ]);
        sendSystemEmail($adminRecipient, "New Enquiry: {$subject} — {$name}", $adminEmailBody, $settings, $dept);
        $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
        if (!empty($officialGmail) && strcasecmp($adminRecipient, $officialGmail) !== 0) {
            sendSystemEmail($officialGmail, "New Enquiry: {$subject} — {$name}", $adminEmailBody, $settings, $dept);
        }

    } catch (Exception $mailEx) {}

    jsonResponse([
        'success' => true,
        'message' => 'Your enquiry has been received. The Vivadoxa team will be in touch shortly.',
    ], 201);

} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
