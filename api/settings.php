<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

$defaultGeneral = [
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
    'fromEmail' => 'admissions@vivadoxamusic.com',
    'fromName' => 'Vivadoxa Music Academy Admissions',
    'whatsappMode' => 'direct', // 'direct' or 'gateway'
    'whatsappGatewayUrl' => '',
    'whatsappApiToken' => '',
];

$defaultBank = [
    'bankName' => 'Guaranty Trust Bank (GTBank)',
    'accountNumber' => '0236649229',
    'accountName' => 'Fredrerick Chysantus',
    'branch' => '',
    // Nigerian Payments (Naira / NGN)
    'paystackPublicKey' => '',
    'paystackSecretKey' => '',
    'enablePaystack' => false,
    // Diaspora / International Payments (USD / Dollars)
    'flutterwavePublicKey' => '',
    'flutterwaveSecretKey' => '',
    'enableFlutterwave' => false,
    'currency' => 'NGN',
    'usdRate' => 1500,
    'defaultTuitionFee' => 20000,
];

if ($method === 'GET') {
    $type = trim($_GET['type'] ?? 'all');

    if ($type === 'logs') {
        $pdo = getDb();
        $stmt = $pdo->query("SELECT * FROM `system_notifications` ORDER BY `created_at` DESC LIMIT 30");
        jsonResponse([
            'success' => true,
            'logs' => $stmt->fetchAll(),
        ]);
    }

    if ($type === 'hero_slides') {
        $savedHeroSlides = getSystemSetting('homepage_hero_slides', null);
        jsonResponse([
            'success' => true,
            'slides' => $savedHeroSlides,
        ]);
    }

    $savedGeneral = getSystemSetting('general_settings', []);
    $savedBank = getSystemSetting('bank_settings', []);
    $savedHeroSlides = getSystemSetting('homepage_hero_slides', null);

    $general = array_merge($defaultGeneral, is_array($savedGeneral) ? $savedGeneral : []);
    $bank = array_merge($defaultBank, is_array($savedBank) ? $savedBank : []);

    if ($type === 'general') {
        jsonResponse(['success' => true, 'settings' => $general]);
    } elseif ($type === 'payment') {
        jsonResponse(['success' => true, 'settings' => $bank]);
    } else {
        jsonResponse([
            'success' => true,
            'general' => $general,
            'payment' => $bank,
            'hero_slides' => $savedHeroSlides,
        ]);
    }
} elseif ($method === 'POST') {
    // Check if multipart/form-data upload for hero images
    if (isset($_FILES['hero_image']) && $_FILES['hero_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = dirname(__DIR__) . '/public/media/hero';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }
        $distUploadDir = dirname(__DIR__) . '/dist/media/hero';
        if (is_dir(dirname(__DIR__) . '/dist') && !is_dir($distUploadDir)) {
            @mkdir($distUploadDir, 0755, true);
        }

        $fileTmp = $_FILES['hero_image']['tmp_name'];
        $origName = basename($_FILES['hero_image']['name']);
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!in_array($ext, $allowedExts)) {
            jsonResponse(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, WEBP and GIF are allowed.'], 400);
        }

        $safeName = 'hero-' . time() . '-' . rand(100, 999) . '.' . $ext;
        $destPath = $uploadDir . '/' . $safeName;

        if (move_uploaded_file($fileTmp, $destPath)) {
            if (is_dir($distUploadDir)) {
                @copy($destPath, $distUploadDir . '/' . $safeName);
            }
            $webUrl = '/media/hero/' . $safeName;
            jsonResponse([
                'success' => true,
                'message' => 'Hero image uploaded successfully.',
                'image_url' => $webUrl,
                'filename' => $safeName,
            ]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Failed to save uploaded file.'], 500);
        }
    }

    $input = getJsonInput();
    $action = trim($input['action'] ?? $_GET['action'] ?? 'save_general');

    if ($action === 'save_general') {
        $settings = $input['settings'] ?? $input;
        unset($settings['action']);
        saveSystemSetting('general_settings', $settings);
        jsonResponse([
            'success' => true,
            'message' => 'School communications and notification settings saved successfully.',
            'settings' => $settings,
        ]);
    } elseif ($action === 'save_payment') {
        $settings = $input['settings'] ?? $input;
        unset($settings['action']);
        saveSystemSetting('bank_settings', $settings);
        jsonResponse([
            'success' => true,
            'message' => 'Bank account & payment gateway settings saved successfully.',
            'settings' => $settings,
        ]);
    } elseif ($action === 'save_hero_slides') {
        $slides = $input['slides'] ?? [];
        if (!is_array($slides)) {
            jsonResponse(['success' => false, 'error' => 'Slides data must be an array.'], 400);
        }
        saveSystemSetting('homepage_hero_slides', $slides);
        jsonResponse([
            'success' => true,
            'message' => 'Homepage hero slideshow updated successfully.',
            'slides' => $slides,
        ]);
    } elseif ($action === 'reset_hero_slides') {
        saveSystemSetting('homepage_hero_slides', null);
        jsonResponse([
            'success' => true,
            'message' => 'Homepage hero slideshow reset to default academy slides.',
        ]);
    } elseif ($action === 'test_email') {
        $recipient = trim($input['recipient'] ?? $input['schoolEmail'] ?? 'vivadoxa@gmail.com');
        $subject = "🎵 Vivadoxa Academy — Email Notification Test";
        $testBody = "
            <p>This is a real-time verification email dispatched from your <strong>Vivadoxa Academy System Settings</strong>.</p>
            <div style='background: #f7f5f0; border-left: 4px solid #157054; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0;'>
                <p style='margin: 0; font-weight: 600; color: #157054;'>✓ Notification Channel Status: Active & Operational</p>
                <p style='margin: 6px 0 0; font-size: 12px; color: #5c5954;'>Timestamp: " . date('Y-m-d H:i:s') . " (WAT)</p>
            </div>
            <p>When students submit admission applications, upload payment receipts, or request instrument repairs, automatic alerts will be dispatched with the official Vivadoxa logo through this pipeline.</p>
        ";

        $html = buildBrandedEmailTemplate([
            'title'      => 'System Verification',
            'badge'      => 'Admissions Engine',
            'clientName' => 'Administrator',
            'headline'   => 'Email Dispatch Verification',
            'bodyHtml'   => $testBody,
            'deptName'   => 'Vivadoxa Music Academy System Desk',
            'deptEmail'  => $recipient,
            'ctaText'    => 'Open System Dashboard',
            'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
        ]);

        $res = sendSystemEmail($recipient, $subject, $html, $input['settings'] ?? null);
        jsonResponse([
            'success' => $res['success'],
            'recipient' => $recipient,
            'message' => $res['message'] ?? ($res['error'] ?? 'Notification attempted.'),
            'error' => $res['error'] ?? null,
            'simulated' => $res['simulated'] ?? false,
        ]);
    } elseif ($action === 'test_whatsapp') {
        $phone = trim($input['phone'] ?? $input['schoolWhatsapp'] ?? '08031308881');
        $msg = "🔔 *Vivadoxa Academy Notification Test*\n\nAdmissions notification channel is operational.\nTimestamp: " . date('d M Y, H:i') . "\n\nStudent applications & payment updates will be triggered instantaneously.";
        
        $res = sendSystemWhatsApp($phone, $msg, $input['settings'] ?? null);
        jsonResponse([
            'success' => true,
            'recipient' => $phone,
            'wa_link' => $res['wa_link'],
            'message' => 'WhatsApp test payload created successfully. You can open the test link to send.',
        ]);
    } elseif ($action === 'verify_bank_account') {
        $accNo = preg_replace('/\D/', '', trim($input['account_number'] ?? ''));
        $bankCode = trim($input['bank_code'] ?? '058'); // default GTBank
        $bankName = trim($input['bank_name'] ?? 'Guaranty Trust Bank (GTBank)');

        if (strlen($accNo) !== 10) {
            jsonResponse([
                'success' => false,
                'verified' => false,
                'error' => 'A valid Nigerian bank account number must be exactly 10 digits (NUBAN standard).',
            ], 422);
        }

        // Check if Paystack or Flutterwave secret key exists in input, saved settings, or .env
        $savedBank = function_exists('getSystemSetting') ? getSystemSetting('bank_settings', []) : [];
        $sk = trim($input['paystackSecretKey'] ?? ($savedBank['paystackSecretKey'] ?? getEnvVar('PAYSTACK_SECRET_KEY', '')));
        $flwSk = trim($input['flutterwaveSecretKey'] ?? ($savedBank['flutterwaveSecretKey'] ?? getEnvVar('FLUTTERWAVE_SECRET_KEY', '')));

        $resolvedName = null;
        $isLiveVerified = false;

        if (!empty($sk) && strpos($sk, 'sk_') === 0 && !empty($bankCode)) {
            // Call official Paystack bank resolution endpoint
            $url = "https://api.paystack.co/bank/resolve?account_number=" . urlencode($accNo) . "&bank_code=" . urlencode($bankCode);
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $sk,
                "Cache-Control: no-cache",
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 8);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            $response = curl_exec($ch);
            $err = curl_error($ch);
            curl_close($ch);

            if (!$err && $response) {
                $resData = json_decode($response, true);
                if (!empty($resData['status']) && !empty($resData['data']['account_name'])) {
                    $resolvedName = strtoupper(trim($resData['data']['account_name']));
                    $isLiveVerified = true;
                }
            }
        }

        // If not resolved via Paystack, try Flutterwave
        if (!$isLiveVerified && !empty($flwSk) && strpos($flwSk, 'FLWSECK') === 0 && !empty($bankCode)) {
            $url = "https://api.flutterwave.com/v3/accounts/resolve";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'account_number' => $accNo,
                'account_bank' => $bankCode,
            ]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $flwSk,
                "Content-Type: application/json",
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 8);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            $response = curl_exec($ch);
            $err = curl_error($ch);
            curl_close($ch);

            if (!$err && $response) {
                $resData = json_decode($response, true);
                if (!empty($resData['data']['account_name'])) {
                    $resolvedName = strtoupper(trim($resData['data']['account_name']));
                    $isLiveVerified = true;
                }
            }
        }

        // Standard NUBAN Algorithm Check
        // Bank code (3 digits padded) + 9-digit serial number
        $paddedCode = str_pad(substr($bankCode, 0, 3), 3, '0', STR_PAD_LEFT);
        $serial = substr($accNo, 0, 9);
        $checkDigit = (int)substr($accNo, 9, 1);
        $weights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3];
        $combined = $paddedCode . $serial;

        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += ((int)$combined[$i]) * $weights[$i];
        }
        $calculatedCheck = (10 - ($sum % 10)) % 10;
        $nubanValid = ($calculatedCheck === $checkDigit);

        // Account is authentic if verified via Paystack/Flutterwave API or passes CBN NUBAN checksum
        if ($isLiveVerified && $resolvedName) {
            jsonResponse([
                'success' => true,
                'verified' => true,
                'method' => 'live_gateway',
                'account_name' => $resolvedName,
                'account_number' => $accNo,
                'bank_name' => $bankName,
                'message' => "Bank account verified live on NIBSS network: {$resolvedName}",
            ]);
        } elseif ($nubanValid) {
            // Algorithmic CBN check passed for selected bank (format valid)
            $existingName = trim($input['account_name'] ?? '');
            jsonResponse([
                'success' => true,
                'verified' => true,
                'method' => 'cbn_nuban',
                'account_name' => $existingName,
                'requires_gateway' => true,
                'account_number' => $accNo,
                'bank_name' => $bankName,
                'message' => "Account number format verified for {$bankName} (CBN checksum passed). Real-time account holder name enquiry requires an active Paystack or Flutterwave Secret Key.",
            ]);
        } else {
            // Check if it is an OFI/fintech with >3 digit routing code
            if (strlen($bankCode) > 3) {
                $existingName = trim($input['account_name'] ?? '');
                jsonResponse([
                    'success' => true,
                    'verified' => true,
                    'method' => 'nuban_format',
                    'account_name' => $existingName,
                    'requires_gateway' => true,
                    'account_number' => $accNo,
                    'bank_name' => $bankName,
                    'message' => "Account number format validated for {$bankName}.",
                ]);
            } else {
                jsonResponse([
                    'success' => false,
                    'verified' => false,
                    'error' => "Account number {$accNo} does not belong to {$bankName}. Check digit validation failed for bank code {$bankCode}. Please select the matching bank institution or check the digits.",
                ], 422);
            }
        }
    } elseif ($action === 'clear_logs') {
        $pdo = getDb();
        $pdo->exec("TRUNCATE TABLE `system_notifications`");
        jsonResponse(['success' => true, 'message' => 'Notification audit log cleared.']);
    } else {
        jsonResponse(['success' => false, 'error' => 'Unknown action.'], 400);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
