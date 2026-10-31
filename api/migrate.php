<?php
/**
 * ─── Vivadoxa One-Time Database Migration Script ────────────────────────────
 * PURPOSE : Safely applies all schema additions needed for forms to work.
 * SECURITY: This file DELETES ITSELF after running successfully.
 *           Upload it, visit /api/migrate.php once, then it is gone.
 *
 * Run at: https://yourdomain.com/api/migrate.php
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

$pdo  = getDb();
$log  = [];
$errors = [];

function migrate(PDO $pdo, string $sql, string &$label, array &$log, array &$errors): void {
    try {
        $pdo->exec($sql);
        $log[] = "✔ $label";
    } catch (Exception $e) {
        $msg = $e->getMessage();
        // Duplicate column / already exists is NOT a real error — skip silently
        if (stripos($msg, 'Duplicate column') !== false || stripos($msg, 'already exists') !== false) {
            $log[] = "— $label (already exists, skipped)";
        } else {
            $errors[] = "✖ $label → $msg";
        }
    }
}

// ── 1. repairs table — make customer_email nullable (was NOT NULL) ────────────
$label = "repairs.customer_email → allow NULL / empty";
migrate($pdo, "ALTER TABLE `repairs` MODIFY COLUMN `customer_email` VARCHAR(191) NOT NULL DEFAULT ''", $label, $log, $errors);

// ── 2. repairs — extended columns ────────────────────────────────────────────
$repairCols = [
    "equipment_type"        => "VARCHAR(100) NULL",
    "brand_model"           => "VARCHAR(191) NULL",
    "serial_number"         => "VARCHAR(100) NULL",
    "accessories"           => "VARCHAR(255) NULL",
    "equipment_age"         => "VARCHAR(100) NULL",
    "problem_started"       => "VARCHAR(100) NULL",
    "previously_repaired"   => "VARCHAR(20) NULL",
    "visible_damage"        => "VARCHAR(20) NULL",
    "service_requested"     => "TEXT NULL",
    "preferred_contact"     => "VARCHAR(50) NULL",
    "best_time"             => "VARCHAR(50) NULL",
    "collection_arrangement"=> "VARCHAR(100) NULL",
    "customer_signature"    => "VARCHAR(191) NULL",
    "additional_notes"      => "TEXT NULL",
    "form_data"             => "LONGTEXT NULL",
    "intake_method"         => "ENUM('dropoff','pickup') NOT NULL DEFAULT 'dropoff'",
    "pickup_address"        => "TEXT NULL",
];
foreach ($repairCols as $col => $def) {
    $label = "repairs.$col";
    migrate($pdo, "ALTER TABLE `repairs` ADD COLUMN `$col` $def", $label, $log, $errors);
}

// ── 3. enquiries — source & type columns for Store / Rentals / Contact ───────
$enquiryCols = [
    "source" => "VARCHAR(50) NOT NULL DEFAULT 'contact'",
    "type"   => "VARCHAR(50) NOT NULL DEFAULT 'general'",
];
foreach ($enquiryCols as $col => $def) {
    $label = "enquiries.$col";
    migrate($pdo, "ALTER TABLE `enquiries` ADD COLUMN `$col` $def", $label, $log, $errors);
}

// Allow empty email in enquiries (phone-only leads from Store/Rentals)
$label = "enquiries.email → allow empty string (NOT NULL DEFAULT '')";
migrate($pdo, "ALTER TABLE `enquiries` MODIFY COLUMN `email` VARCHAR(191) NOT NULL DEFAULT ''", $label, $log, $errors);

// ── 4. applications — passport_photo & letter_released ───────────────────────
$label = "applications.passport_photo";
migrate($pdo, "ALTER TABLE `applications` ADD COLUMN `passport_photo` LONGTEXT NULL", $label, $log, $errors);

$label = "applications.letter_released";
migrate($pdo, "ALTER TABLE `applications` ADD COLUMN `letter_released` TINYINT(1) NOT NULL DEFAULT 0", $label, $log, $errors);

// ── 5. programs — age_group, level, image ────────────────────────────────────
foreach (["age_group VARCHAR(100) NOT NULL DEFAULT 'All Ages'", "level VARCHAR(50) NOT NULL DEFAULT 'Beginner'", "image VARCHAR(255) NULL"] as $colDef) {
    $col   = explode(' ', $colDef)[0];
    $label = "programs.$col";
    migrate($pdo, "ALTER TABLE `programs` ADD COLUMN $colDef", $label, $log, $errors);
}

// ── 6. instructors — bio, image, is_director ─────────────────────────────────
foreach (["bio TEXT NULL", "image VARCHAR(255) NULL", "is_director TINYINT(1) NOT NULL DEFAULT 0"] as $colDef) {
    $col   = explode(' ', $colDef)[0];
    $label = "instructors.$col";
    migrate($pdo, "ALTER TABLE `instructors` ADD COLUMN $colDef", $label, $log, $errors);
}

// ── 7. gallery table ─────────────────────────────────────────────────────────
$label = "CREATE gallery table";
migrate($pdo,
    "CREATE TABLE IF NOT EXISTS `gallery` (
        `id` VARCHAR(100) PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `category` VARCHAR(100) NOT NULL DEFAULT 'Ensembles & Bands',
        `caption` TEXT NULL,
        `image` VARCHAR(500) NOT NULL,
        `featured` TINYINT(1) NOT NULL DEFAULT 0,
        `date` VARCHAR(100) NULL,
        `sort_order` INT NOT NULL DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB",
    $label, $log, $errors
);

// ── 8. system_settings & system_notifications ─────────────────────────────────
$label = "CREATE system_settings";
migrate($pdo,
    "CREATE TABLE IF NOT EXISTS `system_settings` (
        `setting_key` VARCHAR(100) PRIMARY KEY,
        `setting_value` MEDIUMTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB",
    $label, $log, $errors
);

$label = "CREATE system_notifications";
migrate($pdo,
    "CREATE TABLE IF NOT EXISTS `system_notifications` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `channel` ENUM('email','whatsapp') NOT NULL,
        `recipient` VARCHAR(191) NOT NULL,
        `subject` VARCHAR(255) NOT NULL,
        `message` TEXT NOT NULL,
        `status` ENUM('sent','failed','logged') NOT NULL DEFAULT 'sent',
        `error_message` TEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB",
    $label, $log, $errors
);

// ── 9. performances table ─────────────────────────────────────────────────────
$label = "CREATE performances table";
migrate($pdo,
    "CREATE TABLE IF NOT EXISTS `performances` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `title` VARCHAR(255) NOT NULL,
        `performer` VARCHAR(150) NOT NULL,
        `program` VARCHAR(150) NOT NULL,
        `category` VARCHAR(50) NOT NULL DEFAULT 'Concert',
        `youtube_id` VARCHAR(50) NOT NULL,
        `duration` VARCHAR(20) NOT NULL DEFAULT '3:45',
        `date_label` VARCHAR(100) NOT NULL DEFAULT 'Annual Recital',
        `description` TEXT NOT NULL,
        `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
        `is_short` TINYINT(1) NOT NULL DEFAULT 0,
        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB",
    $label, $log, $errors
);

// ── 10. cohorts table ─────────────────────────────────────────────────────────
$label = "CREATE cohorts table";
migrate($pdo,
    "CREATE TABLE IF NOT EXISTS `cohorts` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL UNIQUE,
        `time_slot` VARCHAR(100) NOT NULL,
        `room` VARCHAR(100) NOT NULL,
        `status` VARCHAR(50) NOT NULL DEFAULT 'Active'
    ) ENGINE=InnoDB",
    $label, $log, $errors
);

// ── 11. schedule_requests table ───────────────────────────────────────────────
$label = "CREATE schedule_requests table";
migrate($pdo,
    "CREATE TABLE IF NOT EXISTS `schedule_requests` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `student_id` INT NULL,
        `user_id` INT NULL,
        `student_name` VARCHAR(150) NOT NULL,
        `student_email` VARCHAR(191) NOT NULL,
        `student_phone` VARCHAR(50) NOT NULL,
        `program` VARCHAR(150) NOT NULL,
        `request_type` ENUM('absence_travel','one_off_reschedule','permanent_change') NOT NULL DEFAULT 'absence_travel',
        `current_schedule` VARCHAR(150) NOT NULL,
        `affected_date` DATE NULL,
        `return_date` DATE NULL,
        `reason` VARCHAR(100) NOT NULL,
        `makeup_requested` TINYINT(1) NOT NULL DEFAULT 1,
        `preferred_makeup_slot` VARCHAR(150) NULL,
        `notes` TEXT NULL,
        `status` ENUM('pending','approved','declined','completed') NOT NULL DEFAULT 'pending',
        `allocated_makeup_date` DATETIME NULL,
        `allocated_room` VARCHAR(50) NULL,
        `staff_notes` TEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB",
    $label, $log, $errors
);

// ─────────────────────────────────────────────────────────────────────────────
// RESULT
// ─────────────────────────────────────────────────────────────────────────────
$success = empty($errors);

$response = [
    'success'    => $success,
    'migrations' => $log,
    'errors'     => $errors,
    'message'    => $success
        ? 'All migrations applied. This script will now self-delete.'
        : 'Migrations ran with errors. Fix errors, then re-upload and run again.',
];

// ── SELF-DESTRUCT — runs only when everything was error-free ─────────────────
if ($success) {
    @unlink(__FILE__);
    $response['deleted'] = true;
}

http_response_code($success ? 200 : 500);
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
