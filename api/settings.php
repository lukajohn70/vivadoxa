<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

$defaultGeneral = [
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
        $stmt = $pdo->query("SELECT * FROM `system_notifications` ORDER BY `created_at` DESC LIMIT 30");
        jsonResponse([
            'success' => true,
            'logs' => $stmt->fetchAll(),
        ]);
    }

    $savedGeneral = getSystemSetting('general_settings', []);
    $savedBank = getSystemSetting('bank_settings', []);

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
        ]);
    }
} elseif ($method === 'POST') {
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
    } elseif ($action === 'test_email') {
        $recipient = trim($input['recipient'] ?? $input['schoolEmail'] ?? 'vivadoxa@gmail.com');
        $subject = "🎵 Vivadoxa Academy — Email Notification Test";
        $html = "
        <div style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2ded8; border-radius: 12px; overflow: hidden;'>
            <div style='background: #0b0b0b; padding: 24px; text-align: center;'>
                <h1 style='color: #e9a16f; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 1px;'>VIVADOXA MUSIC ACADEMY</h1>
                <p style='color: #a0aec0; margin: 6px 0 0; font-size: 13px;'>Admissions & System Notification Engine</p>
            </div>
            <div style='padding: 30px 24px; color: #191715; line-height: 1.6;'>
                <h2 style='margin-top: 0; color: #0b0b0b; font-size: 18px;'>Email Dispatch Verification</h2>
                <p>Hello Administrator,</p>
                <p>This is a real-time verification email dispatched from your <strong>Vivadoxa Academy System Settings</strong>.</p>
                <div style='background: #f7f5f0; border-left: 4px solid #157054; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0;'>
                    <p style='margin: 0; font-weight: 600; color: #157054;'>✓ Notification Channel Status: Active & Operational</p>
                    <p style='margin: 6px 0 0; font-size: 12px; color: #5c5954;'>Timestamp: " . date('Y-m-d H:i:s') . " (WAT)</p>
                </div>
                <p>When students submit admission applications, upload payment receipts, or request instrument repairs, automatic alerts will be dispatched through this pipeline.</p>
                <hr style='border: none; border-top: 1px solid #e2ded8; margin: 24px 0;' />
                <p style='margin: 0; font-size: 12px; color: #718096; text-align: center;'>Vivadoxa Music Academy & Studio · Kaduna, Nigeria</p>
            </div>
        </div>
        ";

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

        // Check if Paystack secret key exists in saved bank settings or input
        $savedBank = getSystemSetting('bank_settings', []);
        $sk = trim($input['paystackSecretKey'] ?? $savedBank['paystackSecretKey'] ?? '');

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
                    $resolvedName = $resData['data']['account_name'];
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

        // Account is authentic if verified via Paystack API or passes CBN NUBAN checksum
        if ($isLiveVerified && $resolvedName) {
            jsonResponse([
                'success' => true,
                'verified' => true,
                'method' => 'live_paystack',
                'account_name' => $resolvedName,
                'account_number' => $accNo,
                'bank_name' => $bankName,
                'message' => "Bank account verified successfully on NIBSS network: {$resolvedName}",
            ]);
        } elseif ($nubanValid) {
            // Algorithmic CBN check passed
            $defaultAccountName = trim($input['account_name'] ?? $savedBank['accountName'] ?? 'Vivadoxa Music School');
            jsonResponse([
                'success' => true,
                'verified' => true,
                'method' => 'nuban_algorithm',
                'account_name' => $defaultAccountName,
                'account_number' => $accNo,
                'bank_name' => $bankName,
                'message' => "Valid NUBAN format verified for {$bankName}.",
            ]);
        } else {
            jsonResponse([
                'success' => false,
                'verified' => false,
                'error' => "Account number {$accNo} failed CBN NUBAN check digit validation for {$bankName}. Please check and correct the digits.",
            ], 422);
        }
    } elseif ($action === 'clear_logs') {
        $pdo->exec("TRUNCATE TABLE `system_notifications`");
        jsonResponse(['success' => true, 'message' => 'Notification audit log cleared.']);
    } else {
        jsonResponse(['success' => false, 'error' => 'Unknown action.'], 400);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
