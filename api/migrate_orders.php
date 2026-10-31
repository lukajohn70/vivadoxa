<?php
// ─── Vivadoxa: Orders Table Migration ────────────────────────────────────────
// Run this ONCE on the live server to create the `orders` table.
// The script deletes itself on success for security.
// Access: https://vivadoxa.com/api/migrate_orders.php  (or /Vivadoxa/api/...)

require_once __DIR__ . '/db.php';
header('Content-Type: text/plain; charset=utf-8');

try {
    $pdo = getDb();

    $sql = "
    CREATE TABLE IF NOT EXISTS `orders` (
        `id`               INT AUTO_INCREMENT PRIMARY KEY,
        `order_ref`        VARCHAR(50)  NOT NULL UNIQUE,
        `type`             ENUM('store','rentals') NOT NULL DEFAULT 'store',
        `customer_name`    VARCHAR(150) NOT NULL,
        `customer_phone`   VARCHAR(50)  NOT NULL,
        `customer_email`   VARCHAR(191) NOT NULL DEFAULT '',
        `items`            LONGTEXT     NOT NULL COMMENT 'JSON array of ordered items',
        `intake_method`    ENUM('pickup','delivery') NOT NULL DEFAULT 'pickup',
        `duration`         VARCHAR(100) NULL COMMENT 'For rentals only',
        `delivery_address` TEXT         NULL,
        `notes`            TEXT         NULL,
        `status`           ENUM('pending','confirmed','processing','ready','completed','cancelled')
                           NOT NULL DEFAULT 'pending',
        `whatsapp_sent`    TINYINT(1)   NOT NULL DEFAULT 0,
        `created_at`       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        `updated_at`       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    $pdo->exec($sql);

    echo "✅ SUCCESS: `orders` table created (or already exists).\n";
    echo "   Order reference format: ORD-YYYY-NNN\n";
    echo "   Columns: id, order_ref, type, customer_name, customer_phone, customer_email,\n";
    echo "            items (JSON), intake_method, duration, delivery_address, notes,\n";
    echo "            status, whatsapp_sent, created_at, updated_at\n\n";

    // Self-destruct for security
    $self = __FILE__;
    if (@unlink($self)) {
        echo "🔒 SECURITY: This migration file has been automatically deleted.\n";
    } else {
        echo "⚠️  WARNING: Could not delete this file automatically.\n";
        echo "   Please delete /api/migrate_orders.php manually from your server!\n";
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "   Check your database credentials in .env and ensure the user has CREATE TABLE privileges.\n";
}
