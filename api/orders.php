<?php
// ─── Vivadoxa Orders API ──────────────────────────────────────────────────────
// Handles store purchase orders and rental reservations.
// POST action="submit"        — create new order + line items
// POST action="update_status" — admin updates order status
// POST action="delete"        — admin deletes an order
// GET                         — list orders (admin)

require_once __DIR__ . '/db.php';

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
        $itemTitles = array_map(function($it) {
            return ($it['name'] ?? 'Item') . (!empty($it['brand']) ? ' (' . $it['brand'] . ')' : '');
        }, $itemsSanitized);
        $summaryText = implode(', ', array_slice($itemTitles, 0, 3));
        if (count($itemTitles) > 3) {
            $summaryText .= ' +' . (count($itemTitles) - 3) . ' more';
        }

        $enqMsg = "Order Reference: $orderRef\n"
            . "Type: " . ($type === 'rentals' ? 'Rental Fleet Reservation' : 'Store Instrument Order') . "\n"
            . "Items (" . count($itemTitles) . "):\n"
            . implode("\n", array_map(function($t, $idx) { return ($idx + 1) . ". $t"; }, $itemTitles, array_keys($itemTitles))) . "\n\n"
            . "Intake: " . ($intakeMethod === 'delivery' ? "Courier Delivery to: $deliveryAddr" : "Studio Pickup (Kaduna)") . "\n"
            . ($duration ? "Duration: $duration\n" : "")
            . ($notes ? "Notes: $notes\n" : "");

        $enqSubj = ($type === 'rentals' ? 'Rental Reservation [' : 'Store Order [') . $orderRef . ']: ' . $summaryText;

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

    jsonResponse([
        'success'   => true,
        'order_ref' => $orderRef,
        'message'   => "Order $orderRef submitted successfully.",
    ]);
}

jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
