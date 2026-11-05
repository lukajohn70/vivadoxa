<?php
// ─── Vivadoxa Orders API ──────────────────────────────────────────────────────
// Handles store purchase orders and rental reservations.
// POST action="submit"        — create new order + line items
// POST action="update_status" — admin updates order status
// POST action="delete"        — admin deletes an order
// GET                         — list orders (admin)

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$pdo    = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure orders table exists (self-healing)
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `orders` (
            `id`               INT AUTO_INCREMENT PRIMARY KEY,
            `order_ref`        VARCHAR(50)  NOT NULL UNIQUE,
            `type`             ENUM('store','rentals') NOT NULL DEFAULT 'store',
            `customer_name`    VARCHAR(150) NOT NULL,
            `customer_phone`   VARCHAR(50)  NOT NULL,
            `customer_email`   VARCHAR(191) NOT NULL DEFAULT '',
            `items`            LONGTEXT     NOT NULL,
            `intake_method`    ENUM('pickup','delivery') NOT NULL DEFAULT 'pickup',
            `duration`         VARCHAR(100) NULL,
            `delivery_address` TEXT         NULL,
            `notes`            TEXT         NULL,
            `status`           ENUM('pending','confirmed','processing','ready','completed','cancelled')
                               NOT NULL DEFAULT 'pending',
            `whatsapp_sent`    TINYINT(1)   NOT NULL DEFAULT 0,
            `created_at`       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            `updated_at`       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
} catch (Exception $e) {}

// ── GET: list orders ─────────────────────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query(
        "SELECT * FROM `orders` ORDER BY `created_at` DESC LIMIT 500"
    );
    $rows = $stmt->fetchAll();
    jsonResponse(['success' => true, 'data' => $rows, 'orders' => $rows]);
}

// ── POST ─────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $input  = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── Action: delete ────────────────────────────────────────────────────────
    if ($action === 'delete') {
        $id = (int)($input['id'] ?? 0);
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM `orders` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);
            jsonResponse(['success' => true, 'message' => 'Order deleted.']);
        }
        jsonResponse(['success' => false, 'error' => 'Valid order ID required.'], 400);
    }

    // ── Action: update_status ─────────────────────────────────────────────────
    if ($action === 'update_status') {
        $id     = (int)($input['id'] ?? 0);
        $status = trim($input['status'] ?? '');
        $allowed = ['pending','confirmed','processing','ready','completed','cancelled'];
        if ($id <= 0 || !in_array($status, $allowed, true)) {
            jsonResponse(['success' => false, 'error' => 'Valid order ID and status required.'], 400);
        }
        $stmt = $pdo->prepare(
            "UPDATE `orders` SET `status` = :status WHERE `id` = :id"
        );
        $stmt->execute([':status' => $status, ':id' => $id]);
        jsonResponse(['success' => true, 'message' => 'Order status updated.']);
    }

    // ── Action: submit (default) ──────────────────────────────────────────────
    $type          = trim($input['type'] ?? 'store');      // 'store' | 'rentals'
    $name          = trim($input['customer_name'] ?? $input['fullName'] ?? '');
    $phone         = trim($input['customer_phone'] ?? $input['phone'] ?? '');
    $email         = trim($input['customer_email'] ?? $input['email'] ?? '');
    $intakeMethod  = in_array($input['intake_method'] ?? '', ['pickup','delivery'])
                     ? $input['intake_method'] : 'pickup';
    $duration      = trim($input['duration'] ?? '');
    $deliveryAddr  = trim($input['delivery_address'] ?? '');
    $notes         = trim($input['notes'] ?? '');
    $itemsRaw      = $input['items'] ?? [];

    // Validation
    if (empty($name)) {
        jsonResponse(['success' => false, 'error' => 'Customer name is required.'], 400);
    }
    if (empty($phone) && empty($email)) {
        jsonResponse(['success' => false, 'error' => 'Phone or email is required.'], 400);
    }
    if (empty($itemsRaw) || !is_array($itemsRaw)) {
        jsonResponse(['success' => false, 'error' => 'No items provided.'], 400);
    }

    // Generate sequential order reference: ORD-YYYY-NNN
    $year     = date('Y');
    $cntStmt  = $pdo->query("SELECT COUNT(*) FROM `orders` WHERE YEAR(`created_at`) = $year");
    $count    = (int)$cntStmt->fetchColumn();
    $orderRef = sprintf('ORD-%s-%03d', $year, $count + 1);

    // Ensure uniqueness (unlikely collision but safe)
    $chkStmt = $pdo->prepare("SELECT id FROM `orders` WHERE `order_ref` = :ref");
    $chkStmt->execute([':ref' => $orderRef]);
    if ($chkStmt->fetch()) {
        $orderRef = sprintf('ORD-%s-%04d', $year, $count + 100 + rand(1, 50));
    }

    // Sanitize items
    $itemsSanitized = [];
    foreach ($itemsRaw as $it) {
        $itemsSanitized[] = [
            'id'       => trim($it['id']       ?? ''),
            'name'     => trim($it['name']     ?? ''),
            'category' => trim($it['category'] ?? ''),
            'brand'    => trim($it['brand']    ?? ''),
            'type'     => trim($it['type']     ?? ''),
        ];
    }
    $itemsJson = json_encode($itemsSanitized, JSON_UNESCAPED_UNICODE);

    $stmt = $pdo->prepare(
        "INSERT INTO `orders`
            (`order_ref`, `type`, `customer_name`, `customer_phone`, `customer_email`,
             `items`, `intake_method`, `duration`, `delivery_address`, `notes`,
             `status`, `whatsapp_sent`)
         VALUES
            (:ref, :type, :name, :phone, :email,
             :items, :intake, :duration, :delivery, :notes,
             'pending', 0)"
    );

    $stmt->execute([
        ':ref'      => $orderRef,
        ':type'     => ($type === 'rentals') ? 'rentals' : 'store',
        ':name'     => $name,
        ':phone'    => $phone,
        ':email'    => $email,
        ':items'    => $itemsJson,
        ':intake'   => $intakeMethod,
        ':duration' => $duration,
        ':delivery' => $deliveryAddr,
        ':notes'    => $notes,
    ]);

    // Also register an enquiry record for instant visibility in Admin Enquiries view
    try {
        $itemCount = count($itemsSanitized);
        $typeTitle = ($type === 'rentals') ? 'Rental Reservation' : 'Store Instrument Order';

        // Clean, concise subject line: e.g. "Rental Reservation [ORD-2026-001] · 4 Items (Violin, Keyboard +2)"
        if ($itemCount === 1) {
            $firstItem = $itemsSanitized[0]['name'] ?? 'Equipment Item';
            $enqSubj = "{$typeTitle} [{$orderRef}] · {$firstItem}";
        } else {
            // Strip parenthesis like (1/2, 3/4, 4/4) so subject line stays neat
            $cleanNames = array_map(function($it) {
                $n = preg_replace('/\s*\(.*?\)\s*/', ' ', $it['name'] ?? 'Item');
                return trim($n);
            }, array_slice($itemsSanitized, 0, 2));
            $overview = implode(', ', $cleanNames);
            $extraCount = $itemCount - count($cleanNames);
            $extraText = $extraCount > 0 ? " +{$extraCount} more" : "";
            $enqSubj = "{$typeTitle} [{$orderRef}] · {$itemCount} Items ({$overview}{$extraText})";
        }

        // Professional, coherent specification message
        $fulfillmentText = ($intakeMethod === 'delivery')
            ? "Courier Delivery\n  • Destination Address: " . ($deliveryAddr ?: 'To be confirmed by customer')
            : "Studio Pickup at Vivadoxa Kaduna Studio";

        $itemLines = [];
        foreach ($itemsSanitized as $idx => $it) {
            $num = $idx + 1;
            $iName = $it['name'] ?? 'Item';
            $meta = array_filter([
                $it['category'] ?? '',
                $it['brand'] ?? '',
                !empty($it['type']) ? ($it['type'] === 'event' ? 'Event Backline' : 'Student Practice') : ''
            ]);
            $metaStr = !empty($meta) ? ' (' . implode(' · ', $meta) . ')' : '';
            $itemLines[] = "  {$num}. {$iName}{$metaStr}";
        }
        $itemsBlock = implode("\n", $itemLines);

        $enqMsg = "════════════════════════════════════════════════════════\n"
            . "  " . strtoupper($typeTitle) . " SPECIFICATION\n"
            . "════════════════════════════════════════════════════════\n\n"
            . "• Order Reference  : {$orderRef}\n"
            . "• Service Category : " . ($type === 'rentals' ? 'Rental Fleet & Event Backline' : 'Music Store & Catalog Order') . "\n"
            . "• Customer Name    : {$name}\n"
            . "• Contact Phone    : {$phone}\n"
            . "• Contact Email    : " . ($email ?: 'Not provided (phone contact only)') . "\n"
            . "• Fulfillment Mode : {$fulfillmentText}\n"
            . ($type === 'rentals' && !empty($duration) ? "• Rental Period    : {$duration}\n" : "")
            . "\n"
            . "── RESERVED GEAR & EQUIPMENT ({$itemCount} item" . ($itemCount === 1 ? '' : 's') . ") ──\n"
            . "{$itemsBlock}\n\n"
            . "── SPECIAL REQUESTS & CLIENT NOTES ──\n"
            . (!empty($notes) ? "  \"{$notes}\"\n" : "  None provided.\n")
            . "\n"
            . "── ORDER STATUS ──\n"
            . "  Pending studio confirmation and inventory allocation.";

        $eStmt = $pdo->prepare("
            INSERT INTO `enquiries` (`name`, `email`, `phone`, `subject`, `message`, `source`, `type`, `is_read`)
            VALUES (:name, :email, :phone, :subj, :msg, :src, 'order', 0)
        ");
        $eStmt->execute([
            ':name'  => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':subj'  => $enqSubj,
            ':msg'   => $enqMsg,
            ':src'   => ($type === 'rentals') ? 'rentals' : 'store',
        ]);
    } catch (Exception $e) {}

    // Send automated branded email confirmation
    try {
        $settings = getGeneralSettingsConfig();
        $dept = ($type === 'rentals') ? 'rentals' : 'store';
        $deptInfo = getDepartmentSender($dept, $settings);
        $deptLabel = ($type === 'rentals') ? 'Rental Fleet Reservation' : 'Music Store Order';

        $itemsRowsHtml = '';
        foreach ($itemsSanitized as $i => $item) {
            $num = $i + 1;
            $itemName = htmlspecialchars($item['name'] ?? 'Item');
            $itemCat = htmlspecialchars($item['category'] ?? '');
            $itemBrand = htmlspecialchars($item['brand'] ?? '');
            $extra = trim($itemCat . ($itemBrand ? " · $itemBrand" : ''));
            $itemsRowsHtml .= "
                <tr>
                    <td style='padding: 10px 12px; border-bottom: 1px solid #ede8e0; font-size: 13px; font-weight: 700; color: #0b0b0b; width: 30px;'>{$num}.</td>
                    <td style='padding: 10px 12px; border-bottom: 1px solid #ede8e0; font-size: 13px; color: #191715;'>
                        <strong>{$itemName}</strong>
                        " . ($extra ? "<div style='font-size: 11px; color: #7a756f; margin-top: 2px;'>{$extra}</div>" : "") . "
                    </td>
                </tr>
            ";
        }

        $intakeLabel = ($intakeMethod === 'delivery') 
            ? "Courier Dispatch to: <strong>" . htmlspecialchars($deliveryAddr) . "</strong>" 
            : "Studio Pickup at Vivadoxa Kaduna Studio";

        $orderHtml = "
            <p style='margin: 0 0 16px; font-size: 15px; color: #333;'>Thank you for choosing Vivadoxa Music. We have received your order and reserved your selected equipment in our system.</p>
            
            <div style='background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px; margin: 18px 0; overflow: hidden;'>
                <div style='background: #0b0b0b; color: #fff; padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;'>Selected Equipment & Gear</div>
                <table width='100%' cellpadding='0' cellspacing='0' style='border-collapse: collapse;'>
                    {$itemsRowsHtml}
                </table>
            </div>

            <div style='background: #faf8f5; border: 1px solid #ede8e0; border-radius: 8px; padding: 14px 16px; margin: 18px 0; font-size: 13px;'>
                <p style='margin: 0 0 6px;'><strong>Fulfillment Method:</strong> {$intakeLabel}</p>
                " . (!empty($duration) ? "<p style='margin: 0 0 6px;'><strong>Rental Duration:</strong> " . htmlspecialchars($duration) . "</p>" : "") . "
                " . (!empty($notes) ? "<p style='margin: 0 0 6px;'><strong>Special Instructions:</strong> <em>" . htmlspecialchars($notes) . "</em></p>" : "") . "
            </div>

            <p style='font-size: 14px; color: #444; margin-top: 18px;'>Our concierge team is preparing your package. We will contact you shortly at <strong>" . htmlspecialchars($phone) . "</strong> or via WhatsApp to confirm pickup or dispatch timing.</p>
        ";

        if (!empty($email)) {
            $customerEmailBody = buildBrandedEmailTemplate([
                'title'      => $deptLabel,
                'badge'      => $deptInfo['badge'],
                'clientName' => $name,
                'headline'   => "Order Confirmed: {$orderRef}",
                'refNumber'  => $orderRef,
                'refLabel'   => 'Order Reference',
                'bodyHtml'   => $orderHtml,
                'deptName'   => $deptInfo['name'],
                'deptEmail'  => $deptInfo['email'],
                'ctaText'    => 'Visit Vivadoxa Music',
                'ctaUrl'     => 'https://www.vivadoxamusic.com',
            ]);
            sendSystemEmail($email, "Vivadoxa {$deptLabel} — Ref: {$orderRef}", $customerEmailBody, $settings, $dept);
        }

        // Send Admin Notification
        $adminRecipient = $settings['schoolEmail'] ?? 'vivadoxa@gmail.com';
        $adminEmailBody = buildBrandedEmailTemplate([
            'title'      => "New {$deptLabel}",
            'badge'      => 'Admin Alert',
            'clientName' => 'Operations Team',
            'headline'   => "New Order Received from {$name}",
            'refNumber'  => $orderRef,
            'refLabel'   => 'Order Reference',
            'bodyHtml'   => "
                <p>A new order has been submitted through the website catalog:</p>
                <p><strong>Customer:</strong> " . htmlspecialchars($name) . "<br>
                   <strong>Phone:</strong> " . htmlspecialchars($phone) . "<br>
                   <strong>Email:</strong> " . htmlspecialchars($email ?: 'Not provided') . "</p>
                {$orderHtml}
            ",
            'deptName'   => $deptInfo['name'],
            'deptEmail'  => $deptInfo['email'],
            'ctaText'    => 'Open Admin Portal',
            'ctaUrl'     => 'https://www.vivadoxamusic.com/#admin',
        ]);
        sendSystemEmail($adminRecipient, "New {$deptLabel} [{$orderRef}] — {$name}", $adminEmailBody, $settings, $dept);
        $officialGmail = trim($settings['officialGmail'] ?? 'vivadoxa@gmail.com');
        if (!empty($officialGmail) && strcasecmp($adminRecipient, $officialGmail) !== 0) {
            sendSystemEmail($officialGmail, "New {$deptLabel} [{$orderRef}] — {$name}", $adminEmailBody, $settings, $dept);
        }

    } catch (Exception $mailEx) {}

    jsonResponse([
        'success'   => true,
        'order_ref' => $orderRef,
        'message'   => "Order $orderRef submitted successfully.",
    ]);
}

jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
