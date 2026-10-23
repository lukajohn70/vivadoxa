<?php
require_once __DIR__ . '/db.php';

function getSystemSetting(string $key, $default = null) {
    try {
        $pdo = getDb();
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
        'schoolAddress' => 'Kaduna Studio, Kaduna State, Nigeria',
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
        'fromEmail' => 'admissions@vivadoxa.ng',
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

function sendSmtpEmail(array $smtp, string $to, string $subject, string $htmlBody, string $fromEmail, string $fromName): array {
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

    // Sender & recipient
    $mailFrom = $sendCommand("MAIL FROM: <$fromEmail>");
    if (substr($mailFrom, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "MAIL FROM failed: $mailFrom"];
    }

    $rcptTo = $sendCommand("RCPT TO: <$to>");
    if (substr($rcptTo, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "RCPT TO failed: $rcptTo"];
    }

    $dataResp = $sendCommand("DATA");
    if (substr($dataResp, 0, 3) !== '354') {
        fclose($socket);
        return ['success' => false, 'error' => "DATA handshake failed: $dataResp"];
    }

    // Build MIME message
    $headers = [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <$fromEmail>",
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

function sendSystemEmail(string $to, string $subject, string $htmlBody, ?array $overrideSettings = null): array {
    $settings = $overrideSettings ?: getSystemSetting('general_settings', [
        'schoolPhone' => '09075330330',
        'schoolEmail' => 'vivadoxa@gmail.com',
        'emailAlerts' => true,
        'whatsappAlerts' => true,
        'smtpHost' => '',
        'smtpPort' => 587,
        'smtpUser' => '',
        'smtpPass' => '',
        'smtpEncryption' => 'tls',
        'fromEmail' => 'admissions@vivadoxa.ng',
        'fromName' => 'Vivadoxa Music Academy',
    ]);

    if (empty($settings['emailAlerts'])) {
        logNotification('email', $to, $subject, $htmlBody, 'logged', 'Email alerts currently toggled off');
        return ['success' => false, 'error' => 'Email alerts are disabled in System Settings.'];
    }

    $fromEmail = !empty($settings['fromEmail']) ? $settings['fromEmail'] : 'admissions@vivadoxa.ng';
    $fromName = !empty($settings['fromName']) ? $settings['fromName'] : 'Vivadoxa Music Academy';

    // 1. If SMTP is configured, attempt SMTP
    if (!empty($settings['smtpHost']) && !empty($settings['smtpUser'])) {
        $smtpConfig = [
            'host' => $settings['smtpHost'],
            'port' => $settings['smtpPort'] ?? 587,
            'user' => $settings['smtpUser'],
            'pass' => $settings['smtpPass'] ?? '',
            'encryption' => $settings['smtpEncryption'] ?? 'tls',
        ];
        $res = sendSmtpEmail($smtpConfig, $to, $subject, $htmlBody, $fromEmail, $fromName);
        if ($res['success']) {
            logNotification('email', $to, $subject, $htmlBody, 'sent', 'Delivered via SMTP (' . $settings['smtpHost'] . ')');
            return $res;
        }
        // Fallback or log error
        $errorMsg = $res['error'] ?? 'SMTP Error';
        logNotification('email', $to, $subject, $htmlBody, 'failed', $errorMsg);
        return $res;
    }

    // 2. Try PHP mail()
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: $fromName <$fromEmail>",
        "Reply-To: " . ($settings['schoolEmail'] ?? $fromEmail),
        'X-Mailer: PHP/' . phpversion(),
    ];
    $mailSent = @mail($to, $subject, $htmlBody, implode("\r\n", $headers));

    if ($mailSent) {
        logNotification('email', $to, $subject, $htmlBody, 'sent', 'Sent via server mail()');
        return ['success' => true, 'message' => 'Email delivered via PHP mail().'];
    }

    // 3. If local environment (e.g., MAMP without configured MTA), record in notification log
    logNotification('email', $to, $subject, $htmlBody, 'logged', 'Server MTA not active on localhost. Logged to system records.');
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
