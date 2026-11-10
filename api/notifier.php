<?php
require_once __DIR__ . '/db.php';

function getSystemSetting(string $key, $default = null) {
    try {
        $pdo = function_exists('tryGetDb') ? tryGetDb() : null;
        if (!$pdo) {
            return $default;
        }
        $stmt = $pdo->prepare("SELECT `setting_value` FROM `system_settings` WHERE `setting_key` = :k LIMIT 1");
        $stmt->execute([':k' => $key]);
        $val = $stmt->fetchColumn();
        if ($val !== false && $val !== null) {
            $decoded = json_decode($val, true);
            return $decoded !== null ? $decoded : $val;
        }
    } catch (Exception $e) {}
    return $default;
}

function getGeneralSettingsConfig(): array {
    $defaults = [
        'schoolPhone' => '09075330330',
        'schoolPhone2' => '09010267234',
        'schoolWhatsapp' => '08031308881',
        'schoolEmail' => 'vivadoxa@gmail.com',
        'officialGmail' => 'vivadoxa@gmail.com',
        'copyOfficialGmail' => true,
        'schoolAddress' => 'Kaduna Studio, Kaduna State, Nigeria',
        'logoUrl' => 'https://www.vivadoxamusic.com/vivadoxa-logo.png',
        'emailAlerts' => true,
        'whatsappAlerts' => true,
        'alertOnApplication' => true,
        'alertOnPayment' => true,
        'alertOnRepair' => true,
        'alertOnEnquiry' => true,
        'studentEmailConfirmation' => true,
        'smtpHost' => '',
        'smtpPort' => 587,
        'smtpUser' => '',
        'smtpPass' => '',
        'smtpEncryption' => 'tls',
        'fromEmail' => 'academy@vivadoxamusic.com',
        'fromName' => 'Vivadoxa Music Academy Admissions',
        'whatsappMode' => 'direct',
        'whatsappGatewayUrl' => '',
        'whatsappApiToken' => '',
    ];
    $saved = getSystemSetting('general_settings', []);
    return array_merge($defaults, is_array($saved) ? $saved : []);
}

function saveSystemSetting(string $key, $value): bool {
    try {
        $pdo = getDb();
        $val = is_string($value) ? $value : json_encode($value);
        $stmt = $pdo->prepare("
            INSERT INTO `system_settings` (`setting_key`, `setting_value`)
            VALUES (:k, :v)
            ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)
        ");
        return $stmt->execute([':k' => $key, ':v' => $val]);
    } catch (Exception $e) {
        return false;
    }
}

function logNotification(string $channel, string $recipient, string $subject, string $message, string $status, ?string $error = null) {
    try {
        $pdo = getDb();
        $stmt = $pdo->prepare("
            INSERT INTO `system_notifications` (`channel`, `recipient`, `subject`, `message`, `status`, `error_message`)
            VALUES (:ch, :rc, :sb, :mg, :st, :er)
        ");
        $stmt->execute([
            ':ch' => $channel,
            ':rc' => $recipient,
            ':sb' => $subject,
            ':mg' => $message,
            ':st' => $status,
            ':er' => $error,
        ]);
    } catch (Exception $e) {}
}

/**
 * Returns departmental sender details for branded emails & routing.
 * Departmental 'From' & 'Reply-To' gives immediate recipient trust and routes replies
 * directly to the respective department inbox while sharing domain reputation.
 */
function getDepartmentSender(string $dept = 'academy', ?array $settings = null): array {
    $dept = strtolower(trim($dept));
    
    $departments = [
        'academy' => [
            'email' => 'academy@vivadoxamusic.com',
            'name'  => 'Vivadoxa Music Academy Admissions',
            'badge' => 'Academy Admissions',
        ],
        'admissions' => [
            'email' => 'academy@vivadoxamusic.com',
            'name'  => 'Vivadoxa Music Academy Admissions',
            'badge' => 'Academy Admissions',
        ],
        'store' => [
            'email' => 'store@vivadoxamusic.com',
            'name'  => 'Vivadoxa Music Store',
            'badge' => 'Store & Catalog',
        ],
        'rentals' => [
            'email' => 'rentals@vivadoxamusic.com',
            'name'  => 'Vivadoxa Rental Fleet',
            'badge' => 'Rental Fleet & Backline',
        ],
        'repairs' => [
            'email' => 'repairs@vivadoxamusic.com',
            'name'  => 'Vivadoxa Instrument Clinic & Care',
            'badge' => 'Instrument Clinic',
        ],
        'clinic' => [
            'email' => 'repairs@vivadoxamusic.com',
            'name'  => 'Vivadoxa Instrument Clinic & Care',
            'badge' => 'Instrument Clinic',
        ],
        'bursary' => [
            'email' => 'bursary@vivadoxamusic.com',
            'name'  => 'Vivadoxa Accounts & Bursary',
            'badge' => 'Accounts & Bursary',
        ],
        'payments' => [
            'email' => 'bursary@vivadoxamusic.com',
            'name'  => 'Vivadoxa Accounts & Bursary',
            'badge' => 'Accounts & Bursary',
        ],
        'contact' => [
            'email' => 'info@vivadoxamusic.com',
            'name'  => 'Vivadoxa Music Desk',
            'badge' => 'Client Desk',
        ],
        'newsletter' => [
            'email' => 'info@vivadoxamusic.com',
            'name'  => 'Vivadoxa Music Weekly Bulletin',
            'badge' => 'Weekly Bulletin',
        ],
        'bulletin' => [
            'email' => 'info@vivadoxamusic.com',
            'name'  => 'Vivadoxa Music Weekly Bulletin',
            'badge' => 'Weekly Bulletin',
        ],
        'security' => [
            'email' => 'info@vivadoxamusic.com',
            'name'  => 'Vivadoxa Security Desk',
            'badge' => 'Security Desk',
        ],
        'general' => [
            'email' => 'info@vivadoxamusic.com',
            'name'  => 'Vivadoxa Music Academy & Studio',
            'badge' => 'Studio Desk',
        ],
    ];

    $resolved = $departments[$dept] ?? $departments['general'];

    // If general_settings overrides fromEmail/fromName and no specific department was requested
    if ($settings && !empty($settings['fromEmail']) && $dept === 'general') {
        $resolved['email'] = $settings['fromEmail'];
    }
    if ($settings && !empty($settings['fromName']) && $dept === 'general') {
        $resolved['name'] = $settings['fromName'];
    }

    return $resolved;
}

/**
 * Builds a luxury, responsive HTML email matching Vivadoxa's visual identity.
 */
function buildBrandedEmailTemplate(array $params): string {
    $title       = htmlspecialchars($params['title'] ?? 'Notification');
    $badge       = htmlspecialchars($params['badge'] ?? 'Vivadoxa Music');
    $clientName  = htmlspecialchars($params['clientName'] ?? 'Valued Musician');
    $headline    = htmlspecialchars($params['headline'] ?? 'Thank you for reaching out.');
    $bodyHtml    = $params['bodyHtml'] ?? '';
    $refNumber   = htmlspecialchars($params['refNumber'] ?? '');
    $refLabel    = htmlspecialchars($params['refLabel'] ?? 'Reference Code');
    $ctaText     = htmlspecialchars($params['ctaText'] ?? '');
    $ctaUrl      = htmlspecialchars($params['ctaUrl'] ?? '');
    $deptName    = htmlspecialchars($params['deptName'] ?? 'Vivadoxa Music');
    $deptEmail   = htmlspecialchars($params['deptEmail'] ?? 'info@vivadoxamusic.com');

    // Header badge on the top right must always be a concise tag/category, never an overflowing full article title
    $headerBadge = !empty($params['headerBadge'])
        ? htmlspecialchars($params['headerBadge'])
        : (!empty($params['category'])
            ? htmlspecialchars($params['category'])
            : (!empty($params['badge']) && strlen($params['badge']) <= 25
                ? htmlspecialchars($params['badge'])
                : 'Weekly Bulletin'));

    // Official logo & portal URLs
    $settings    = getGeneralSettingsConfig();
    $logoUrl     = !empty($params['logoUrl']) ? $params['logoUrl'] : (!empty($settings['logoUrl']) ? $settings['logoUrl'] : 'https://www.vivadoxamusic.com/vivadoxa-logo.png');
    $logoUrl     = htmlspecialchars($logoUrl, ENT_QUOTES, 'UTF-8');
    $homeUrl     = 'https://www.vivadoxamusic.com';

    $refBlock = '';
    if (!empty($refNumber)) {
        $refBlock = "
        <div style='background: #f7f5f0; border: 1px solid #dfdad0; border-radius: 8px; padding: 14px 18px; margin: 20px 0; text-align: center;'>
            <div style='font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #a24a18; font-weight: 700; margin-bottom: 4px;'>{$refLabel}</div>
            <div style='font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #0b0b0b; font-family: monospace;'>{$refNumber}</div>
        </div>
        ";
    }

    $ctaBlock = '';
    if (!empty($ctaText) && !empty($ctaUrl)) {
        $ctaBlock = "
        <div style='text-align: center; margin: 28px 0 16px;'>
            <a href='{$ctaUrl}' target='_blank' style='background: #c96b32; color: #ffffff; padding: 13px 26px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(201, 107, 50, 0.3);'>{$ctaText}</a>
        </div>
        ";
    }

    return "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>{$title}</title>
    </head>
    <body style='margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color: #191715; line-height: 1.6;'>
        <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background-color: #f7f5f0; padding: 30px 12px;'>
            <tr>
                <td align='center'>
                    <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e9e4dc; box-shadow: 0 10px 30px rgba(0,0,0,0.06);'>
                        <!-- Brand Header with Official Logo -->
                        <tr>
                            <td style='background-color: #0b0b0b; padding: 22px 32px; text-align: left; border-bottom: 2px solid #c96b32;'>
                                <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0'>
                                    <tr>
                                        <td style='vertical-align: middle;'>
                                            <a href='{$homeUrl}' target='_blank' style='text-decoration: none; display: inline-block;'>
                                                <img src='{$logoUrl}' alt='Vivadoxa Music' width='155' height='60' style='display: block; max-height: 48px; width: auto; max-width: 175px; border: 0; outline: none; text-decoration: none; color: #ffffff; font-size: 18px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;' />
                                            </a>
                                            <div style='font-size: 10px; font-weight: 700; color: #f2a672; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px;'>{$badge}</div>
                                        </td>
                                        <td align='right' style='vertical-align: middle; padding-left: 14px;'>
                                            <span style='background: rgba(201, 107, 50, 0.18); border: 1px solid rgba(201, 107, 50, 0.45); color: #f2a672; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 5px 12px; border-radius: 6px; display: inline-block; white-space: nowrap;'>{$headerBadge}</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Main Body -->
                        <tr>
                            <td style='padding: 32px 32px 24px;'>
                                <h1 style='margin: 0 0 14px; font-size: 22px; font-weight: 700; color: #0b0b0b; line-height: 1.3;'>{$headline}</h1>
                                <p style='margin: 0 0 18px; font-size: 15px; color: #5c5954;'>Dear <strong>{$clientName}</strong>,</p>
                                
                                {$refBlock}

                                <div style='font-size: 14px; color: #191715; line-height: 1.6;'>
                                    {$bodyHtml}
                                </div>

                                {$ctaBlock}

                                <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0ece5; font-size: 13px; color: #5c5954;'>
                                    <p style='margin: 0;'>With excellence in sound,</p>
                                    <p style='margin: 4px 0 0; font-weight: 700; color: #0b0b0b;'>{$deptName}</p>
                                    <p style='margin: 2px 0 0; font-size: 12px; color: #a24a18;'><a href='mailto:{$deptEmail}' style='color: #c96b32; text-decoration: none;'>{$deptEmail}</a></p>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style='background-color: #faf8f5; padding: 22px 32px; border-top: 1px solid #ede8e0; text-align: center; font-size: 11px; color: #8a857e;'>
                                <p style='margin: 0 0 6px; font-weight: 600; color: #5c5954;'>Vivadoxa Music Academy & Studio · Instrument Clinic · Audio Hub</p>
                                <p style='margin: 0 0 6px;'>Kaduna Studio, Kaduna State, Nigeria · Phone: +234 907 533 0330 · WhatsApp: +234 803 130 8881</p>
                                <p style='margin: 0;'>You received this email because you submitted a request or transaction on <a href='https://www.vivadoxamusic.com' style='color: #c96b32; text-decoration: none;'>vivadoxamusic.com</a>.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    ";
}

/**
 * Backward compatibility alias for buildBrandedEmailTemplate.
 */
function buildOfficialEmailTemplate(array $params): string {
    return buildBrandedEmailTemplate($params);
}

function sendSmtpEmail(array $smtp, string $to, string $subject, string $htmlBody, string $fromEmail, string $fromName, ?string $replyTo = null, ?string $bcc = null): array {
    $host = trim($smtp['host'] ?? '');
    $port = (int)($smtp['port'] ?? 587);
    $user = trim($smtp['user'] ?? '');
    $pass = trim($smtp['pass'] ?? '');
    $encryption = strtolower(trim($smtp['encryption'] ?? 'tls')); // 'tls' or 'ssl' or 'none'

    if (empty($host) || empty($user)) {
        return ['success' => false, 'error' => 'SMTP host or username is missing.'];
    }

    $remoteHost = ($encryption === 'ssl') ? 'ssl://' . $host : $host;
    $errno = 0;
    $errstr = '';
    $socket = @fsockopen($remoteHost, $port, $errno, $errstr, 12);

    if (!$socket) {
        return ['success' => false, 'error' => "Cannot connect to SMTP server ($host:$port): $errstr ($errno)"];
    }

    stream_set_timeout($socket, 12);

    $readResponse = function() use ($socket) {
        $data = '';
        while ($line = fgets($socket, 512)) {
            $data .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        return $data;
    };

    $sendCommand = function(string $cmd) use ($socket, $readResponse) {
        fputs($socket, $cmd . "\r\n");
        return $readResponse();
    };

    $greeting = $readResponse();
    if (substr($greeting, 0, 3) !== '220') {
        fclose($socket);
        return ['success' => false, 'error' => "SMTP greeting failed: $greeting"];
    }

    $ehlo = $sendCommand("EHLO " . gethostname());

    if ($encryption === 'tls' && strpos($ehlo, 'STARTTLS') !== false) {
        $starttls = $sendCommand("STARTTLS");
        if (substr($starttls, 0, 3) === '220') {
            $crypto = stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            if (!$crypto) {
                fclose($socket);
                return ['success' => false, 'error' => 'STARTTLS negotiation failed.'];
            }
            $sendCommand("EHLO " . gethostname());
        }
    }

    // Authenticate
    if (!empty($user) && !empty($pass)) {
        $authResp = $sendCommand("AUTH LOGIN");
        if (substr($authResp, 0, 3) === '334') {
            $userResp = $sendCommand(base64_encode($user));
            if (substr($userResp, 0, 3) !== '334') {
                fclose($socket);
                return ['success' => false, 'error' => "SMTP user authentication failed: $userResp"];
            }
            $passResp = $sendCommand(base64_encode($pass));
            if (substr($passResp, 0, 3) !== '235') {
                fclose($socket);
                return ['success' => false, 'error' => "SMTP password rejected: $passResp"];
            }
        }
    }

    // Sender & recipient (try departmental fromEmail first, fallback to authenticated user if rejected)
    $mailFrom = $sendCommand("MAIL FROM: <$fromEmail>");
    if (substr($mailFrom, 0, 3) !== '250') {
        if (!empty($user) && $user !== $fromEmail) {
            $mailFrom = $sendCommand("MAIL FROM: <$user>");
        }
        if (substr($mailFrom, 0, 3) !== '250') {
            fclose($socket);
            return ['success' => false, 'error' => "MAIL FROM failed: $mailFrom"];
        }
    }

    $rcptTo = $sendCommand("RCPT TO: <$to>");
    if (substr($rcptTo, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "RCPT TO failed: $rcptTo"];
    }

    // Envelope BCC: route copy to official Gmail without exposing Bcc header to recipient
    if (!empty($bcc) && strcasecmp(trim($bcc), trim($to)) !== 0) {
        $cleanBcc = trim($bcc);
        $sendCommand("RCPT TO: <$cleanBcc>");
    }

    $dataResp = $sendCommand("DATA");
    if (substr($dataResp, 0, 3) !== '354') {
        fclose($socket);
        return ['success' => false, 'error' => "DATA handshake failed: $dataResp"];
    }

    // Build MIME message with departmental From and Reply-To
    $headers = [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$fromEmail>",
        "Reply-To: <" . ($replyTo ?: $fromEmail) . ">",
        "To: <$to>",
        "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
        "Date: " . date('r'),
        "X-Mailer: Vivadoxa Mailer 2.0",
    ];

    $messageData = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
    $sendResp = $sendCommand($messageData);
    $sendCommand("QUIT");
    fclose($socket);

    if (substr($sendResp, 0, 3) === '250') {
        return ['success' => true, 'message' => 'Email delivered successfully via SMTP.'];
    }

    return ['success' => false, 'error' => "SMTP DATA sending error: $sendResp"];
}

function sendSystemEmail(
    string $to,
    string $subject,
    string $htmlBody,
    ?array $overrideSettings = null,
    string $department = 'academy',
    bool $bccOfficialGmail = true
): array {
    $settings = $overrideSettings ?: getGeneralSettingsConfig();

    // Do not block newsletters, bulletins, or 2FA/security verification even if transactional alerts are toggled off
    $isMandatory = in_array(strtolower(trim($department)), ['newsletter', 'bulletin', 'security', '2fa']);
    if (empty($settings['emailAlerts']) && !$isMandatory) {
        logNotification('email', $to, $subject, $htmlBody, 'logged', 'Email alerts currently toggled off');
        return ['success' => false, 'error' => 'Email alerts are disabled in System Settings.'];
    }

    $deptInfo  = getDepartmentSender($department, $settings);
    $fromEmail = $deptInfo['email'];
    $fromName  = $deptInfo['name'];
    $replyTo   = $deptInfo['email'];

    // Official Gmail account: every notification/form is duplicated/BCC'd here (except newsletters/security)
    $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
    if (empty($officialGmail)) {
        $officialGmail = 'vivadoxa@gmail.com';
    }
    $bcc = ($bccOfficialGmail && strcasecmp(trim($to), $officialGmail) !== 0) ? $officialGmail : null;

    // 1. If SMTP is configured, attempt SMTP first
    if (!empty($settings['smtpHost']) && !empty($settings['smtpUser'])) {
        $smtpConfig = [
            'host' => $settings['smtpHost'],
            'port' => $settings['smtpPort'] ?? 587,
            'user' => $settings['smtpUser'],
            'pass' => $settings['smtpPass'] ?? '',
            'encryption' => $settings['smtpEncryption'] ?? 'tls',
        ];
        $res = sendSmtpEmail($smtpConfig, $to, $subject, $htmlBody, $fromEmail, $fromName, $replyTo, $bcc);
        if ($res['success']) {
            $note = "Delivered via SMTP ({$settings['smtpHost']}) from $fromEmail";
            if ($bcc) $note .= " (BCC: $bcc)";
            logNotification('email', $to, $subject, $htmlBody, 'sent', $note);
            return $res;
        }
        // If SMTP failed, log warning and fall back to PHP mail()
        $smtpError = $res['error'] ?? 'SMTP Error';
        logNotification('email', $to, $subject, $htmlBody, 'warning', "SMTP failed ($smtpError); falling back to PHP mail()");
    }

    // 2. Try PHP mail() with envelope sender (-f)
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$fromEmail>",
        "Reply-To: <$replyTo>",
        "Return-Path: <$fromEmail>",
        'X-Mailer: PHP/' . phpversion(),
    ];
    if (!empty($bcc) && strcasecmp(trim($bcc), trim($to)) !== 0) {
        $headers[] = "Bcc: <" . trim($bcc) . ">";
    }

    $headerStr = implode("\r\n", $headers);
    // Envelope sender -f is crucial for SPF/DKIM verification and prevent bounce rejection
    $mailSent = false;
    try {
        $mailSent = @mail($to, $subject, $htmlBody, $headerStr, "-f" . $fromEmail);
    } catch (Exception $e) {}

    if (!$mailSent) {
        // Fallback without 5th param if restricted by server safe_mode
        $mailSent = @mail($to, $subject, $htmlBody, $headerStr);
    }

    if ($mailSent) {
        $note = "Sent via server mail() from $fromEmail";
        if ($bcc) $note .= " (BCC: $bcc)";
        logNotification('email', $to, $subject, $htmlBody, 'sent', $note);
        return ['success' => true, 'message' => 'Email delivered via PHP mail().'];
    }

    // 3. If local environment (e.g., MAMP without configured MTA), record in notification log
    $note = "Server MTA not active on localhost. Logged to system records (from $fromEmail)";
    if ($bcc) $note .= " [Official copy: $bcc]";
    logNotification('email', $to, $subject, $htmlBody, 'logged', $note);
    return [
        'success' => true,
        'simulated' => true,
        'message' => 'Notification recorded in System Log. Configure SMTP credentials for live external inbox delivery.',
    ];
}

function sendSystemWhatsApp(string $recipientPhone, string $message, ?array $overrideSettings = null): array {
    $settings = $overrideSettings ?: getSystemSetting('general_settings', [
        'schoolWhatsapp' => '08031308881',
        'whatsappAlerts' => true,
    ]);

    if (empty($settings['whatsappAlerts'])) {
        logNotification('whatsapp', $recipientPhone, 'WhatsApp Alert (Disabled)', $message, 'logged', 'WhatsApp alerts disabled');
        return ['success' => false, 'error' => 'WhatsApp alerts are disabled in System Settings.'];
    }

    // Format phone: e.g. 08031308881 -> 2348031308881
    $cleanPhone = preg_replace('/[^0-9]/', '', $recipientPhone);
    if (strlen($cleanPhone) === 11 && substr($cleanPhone, 0, 1) === '0') {
        $cleanPhone = '234' . substr($cleanPhone, 1);
    } elseif (strlen($cleanPhone) === 10) {
        $cleanPhone = '234' . $cleanPhone;
    }

    $encodedText = rawurlencode($message);
    $waLink = "https://wa.me/{$cleanPhone}?text={$encodedText}";

    // Check if webhook / third-party gateway (Twilio / Meta) is provided
    $gatewayUrl = trim($settings['whatsappGatewayUrl'] ?? '');
    $gatewayToken = trim($settings['whatsappApiToken'] ?? '');

    $deliveryStatus = 'sent';
    $notes = 'Direct wa.me link ready';

    if (!empty($gatewayUrl)) {
        // Send webhook POST
        $ch = curl_init($gatewayUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'to' => $cleanPhone,
            'message' => $message,
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $gatewayToken,
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        $resp = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            $notes = "Delivered via WhatsApp Gateway ($gatewayUrl)";
        } else {
            $deliveryStatus = 'failed';
            $notes = "Gateway responded with HTTP $httpCode: $resp";
        }
    }

    logNotification('whatsapp', $recipientPhone, 'WhatsApp Notification', $message, $deliveryStatus, $notes);

    return [
        'success' => true,
        'phone' => $cleanPhone,
        'wa_link' => $waLink,
        'message' => 'WhatsApp notification payload generated and logged.',
    ];
}
