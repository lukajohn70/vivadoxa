<?php
/**
 * Vivadoxa Music Academy - Automated Database Installer & Self-Destruct Script
 *
 * This script initializes all database tables, seeds initial administrative
 * data and course programs, generates the production .env configuration,
 * and securely self-destructs upon completion.
 */

// Error handling & headers
error_reporting(E_ALL);
ini_set('display_errors', '0');

$isCli = (php_sapi_name() === 'cli');
$results = [];
$error = null;
$completed = false;
$selfDestructed = false;

// Helper: load existing .env if present
function readExistingEnv(): array {
    $envPath = __DIR__ . '/.env';
    $vars = [];
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line && $line[0] !== '#' && strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                $vars[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
            }
        }
    }
    return $vars;
}

$existingEnv = readExistingEnv();
$defaultHost = $existingEnv['DB_HOST'] ?? 'localhost';
$defaultPort = $existingEnv['DB_PORT'] ?? '3306';
$defaultName = $existingEnv['DB_NAME'] ?? '';
$defaultUser = $existingEnv['DB_USER'] ?? '';
$defaultPass = $existingEnv['DB_PASS'] ?? '';

// Form processing
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $isCli) {
    if ($isCli) {
        $dbHost = $defaultHost ?: '127.0.0.1';
        $dbPort = (int)($defaultPort ?: 3306);
        $dbName = $defaultName ?: 'vivadoxa';
        $dbUser = $defaultUser ?: 'root';
        $dbPass = $defaultPass ?: 'root';
        $adminEmail = 'admin@vivadoxa.ng';
        $adminPass = 'VivadoxaAdmin2025!';
        $adminName = 'Artistic Director';
        $doSelfDestruct = false; // keep in CLI unless specified
    } else {
        $dbHost = trim($_POST['db_host'] ?? 'localhost');
        $dbPort = (int)($_POST['db_port'] ?? 3306);
        $dbName = trim($_POST['db_name'] ?? '');
        $dbUser = trim($_POST['db_user'] ?? '');
        $dbPass = $_POST['db_pass'] ?? '';
        $adminEmail = trim($_POST['admin_email'] ?? 'admin@vivadoxa.ng');
        $adminPass = trim($_POST['admin_pass'] ?? 'VivadoxaAdmin2025!');
        $adminName = trim($_POST['admin_name'] ?? 'Artistic Director');
        $doSelfDestruct = isset($_POST['self_destruct']);
    }

    if (empty($dbName) || empty($dbUser)) {
        $error = "Please provide both Database Name and Database User.";
    } else {
        try {
            $pdoOptions = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            // Step 1: Connect to database (or connect to server and create db)
            $pdo = null;
            try {
                // Try connecting directly to the target database
                $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, $pdoOptions);
                $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
                $results[] = "Successfully connected to database `{$dbName}`.";
            } catch (PDOException $e) {
                // If database doesn't exist yet, connect to MySQL server root and create it
                try {
                    $serverPdo = new PDO("mysql:host={$dbHost};port={$dbPort};charset=utf8mb4", $dbUser, $dbPass, $pdoOptions);
                    $serverPdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
                    $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                    $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, $pdoOptions);
                    $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
                    $results[] = "Database `{$dbName}` created and connected successfully.";
                } catch (PDOException $createEx) {
                    throw new Exception("Could not connect to database `{$dbName}`. Note: On cPanel, please ensure you create the database and user first under cPanel -> 'MySQL Databases', then run this installer again. (Original error: " . $e->getMessage() . ")");
                }
            }

            // Step 2: Create all database tables
            $tablesSql = [
                'users' => "
                    CREATE TABLE IF NOT EXISTS `users` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `email` VARCHAR(191) NOT NULL UNIQUE,
                        `phone` VARCHAR(50) NOT NULL,
                        `password_hash` VARCHAR(255) NOT NULL,
                        `full_name` VARCHAR(150) NOT NULL,
                        `role` ENUM('student', 'client', 'all') NOT NULL DEFAULT 'student',
                        `avatar` VARCHAR(255) NULL,
                        `address` TEXT NULL,
                        `guardian_name` VARCHAR(150) NULL,
                        `guardian_phone` VARCHAR(50) NULL,
                        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                        `last_login` DATETIME NULL,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'admins' => "
                    CREATE TABLE IF NOT EXISTS `admins` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `email` VARCHAR(191) NOT NULL UNIQUE,
                        `password_hash` VARCHAR(255) NOT NULL,
                        `name` VARCHAR(100) NOT NULL,
                        `role` VARCHAR(50) NOT NULL DEFAULT 'superadmin',
                        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                        `last_login` DATETIME NULL,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'applications' => "
                    CREATE TABLE IF NOT EXISTS `applications` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `application_no` VARCHAR(50) NOT NULL UNIQUE,
                        `first_name` VARCHAR(100) NOT NULL,
                        `last_name` VARCHAR(100) NOT NULL,
                        `email` VARCHAR(191) NOT NULL,
                        `phone` VARCHAR(50) NOT NULL,
                        `program` VARCHAR(100) NOT NULL,
                        `study_mode` VARCHAR(50) NOT NULL,
                        `skill_level` VARCHAR(50) NOT NULL DEFAULT 'Beginner',
                        `dob` DATE NULL,
                        `gender` VARCHAR(20) NULL,
                        `guardian_name` VARCHAR(100) NULL,
                        `guardian_phone` VARCHAR(50) NULL,
                        `address` TEXT NULL,
                        `status` ENUM('pending', 'reviewing', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
                        `tuition_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'payments' => "
                    CREATE TABLE IF NOT EXISTS `payments` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `reference` VARCHAR(100) NOT NULL UNIQUE,
                        `application_no` VARCHAR(50) NULL,
                        `payer_name` VARCHAR(150) NOT NULL,
                        `payer_email` VARCHAR(191) NOT NULL,
                        `amount` DECIMAL(12, 2) NOT NULL,
                        `method` VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
                        `status` ENUM('pending', 'verified', 'declined') NOT NULL DEFAULT 'pending',
                        `notes` TEXT NULL,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        `verified_at` DATETIME NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'repairs' => "
                    CREATE TABLE IF NOT EXISTS `repairs` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `tracking_code` VARCHAR(50) NOT NULL UNIQUE,
                        `customer_name` VARCHAR(100) NOT NULL,
                        `customer_email` VARCHAR(191) NOT NULL,
                        `customer_phone` VARCHAR(50) NOT NULL,
                        `instrument` VARCHAR(100) NOT NULL,
                        `issue` TEXT NOT NULL,
                        `intake_method` ENUM('dropoff', 'pickup') NOT NULL DEFAULT 'dropoff',
                        `pickup_address` TEXT NULL,
                        `status` ENUM('received', 'assessing', 'in_progress', 'ready', 'collected') NOT NULL DEFAULT 'received',
                        `estimated_cost` DECIMAL(12, 2) NULL,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'enquiries' => "
                    CREATE TABLE IF NOT EXISTS `enquiries` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `name` VARCHAR(100) NOT NULL,
                        `email` VARCHAR(191) NOT NULL,
                        `phone` VARCHAR(50) NULL,
                        `subject` VARCHAR(191) NULL,
                        `message` TEXT NOT NULL,
                        `is_read` TINYINT(1) NOT NULL DEFAULT 0,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'programs' => "
                    CREATE TABLE IF NOT EXISTS `programs` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `name` VARCHAR(150) NOT NULL UNIQUE,
                        `category` VARCHAR(50) NOT NULL,
                        `tag` VARCHAR(50) NOT NULL DEFAULT 'Popular',
                        `fee` VARCHAR(50) NOT NULL DEFAULT '85,000',
                        `fee_amount` DECIMAL(12, 2) NOT NULL DEFAULT 85000.00,
                        `duration` VARCHAR(50) NOT NULL DEFAULT '12 weeks',
                        `modes` VARCHAR(100) NOT NULL DEFAULT 'Onsite + Online',
                        `desc` TEXT NOT NULL,
                        `age_group` VARCHAR(100) NOT NULL DEFAULT 'All Ages',
                        `level` VARCHAR(50) NOT NULL DEFAULT 'Beginner',
                        `image` VARCHAR(255) NULL,
                        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'instructors' => "
                    CREATE TABLE IF NOT EXISTS `instructors` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `name` VARCHAR(100) NOT NULL UNIQUE,
                        `title` VARCHAR(100) NOT NULL,
                        `specialization` VARCHAR(150) NOT NULL,
                        `location` VARCHAR(100) NOT NULL DEFAULT 'Kaduna Studio',
                        `email` VARCHAR(191) NULL,
                        `phone` VARCHAR(50) NULL,
                        `bio` TEXT NULL,
                        `image` VARCHAR(255) NULL,
                        `is_director` TINYINT(1) NOT NULL DEFAULT 0,
                        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'performances' => "
                    CREATE TABLE IF NOT EXISTS `performances` (
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
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'students' => "
                    CREATE TABLE IF NOT EXISTS `students` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `student_no` VARCHAR(50) NOT NULL UNIQUE,
                        `application_no` VARCHAR(50) NULL,
                        `full_name` VARCHAR(150) NOT NULL,
                        `email` VARCHAR(191) NOT NULL,
                        `phone` VARCHAR(50) NOT NULL,
                        `program` VARCHAR(100) NOT NULL,
                        `study_mode` VARCHAR(50) NOT NULL DEFAULT 'Onsite',
                        `cohort` VARCHAR(100) NOT NULL DEFAULT 'Saturday Cohort A',
                        `status` ENUM('active', 'graduated', 'suspended') NOT NULL DEFAULT 'active',
                        `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'cohorts' => "
                    CREATE TABLE IF NOT EXISTS `cohorts` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `name` VARCHAR(100) NOT NULL UNIQUE,
                        `time_slot` VARCHAR(100) NOT NULL,
                        `room` VARCHAR(100) NOT NULL,
                        `status` VARCHAR(50) NOT NULL DEFAULT 'Active'
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'schedule_requests' => "
                    CREATE TABLE IF NOT EXISTS `schedule_requests` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `student_id` INT NULL,
                        `user_id` INT NULL,
                        `student_name` VARCHAR(150) NOT NULL,
                        `student_email` VARCHAR(191) NOT NULL,
                        `student_phone` VARCHAR(50) NOT NULL,
                        `program` VARCHAR(150) NOT NULL,
                        `request_type` ENUM('absence_travel', 'one_off_reschedule', 'permanent_change') NOT NULL DEFAULT 'absence_travel',
                        `current_schedule` VARCHAR(150) NOT NULL,
                        `affected_date` DATE NULL,
                        `return_date` DATE NULL,
                        `reason` VARCHAR(100) NOT NULL,
                        `makeup_requested` TINYINT(1) NOT NULL DEFAULT 1,
                        `preferred_makeup_slot` VARCHAR(150) NULL,
                        `notes` TEXT NULL,
                        `status` ENUM('pending', 'approved', 'declined', 'completed') NOT NULL DEFAULT 'pending',
                        `allocated_makeup_date` DATETIME NULL,
                        `allocated_room` VARCHAR(50) NULL,
                        `staff_notes` TEXT NULL,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'system_settings' => "
                    CREATE TABLE IF NOT EXISTS `system_settings` (
                        `setting_key` VARCHAR(100) PRIMARY KEY,
                        `setting_value` MEDIUMTEXT NOT NULL,
                        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
                'system_notifications' => "
                    CREATE TABLE IF NOT EXISTS `system_notifications` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `channel` ENUM('email', 'whatsapp') NOT NULL,
                        `recipient` VARCHAR(191) NOT NULL,
                        `subject` VARCHAR(255) NOT NULL,
                        `message` TEXT NOT NULL,
                        `status` ENUM('sent', 'failed', 'logged') NOT NULL DEFAULT 'sent',
                        `error_message` TEXT NULL,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                ",
            ];

            foreach ($tablesSql as $tName => $tSql) {
                $pdo->exec($tSql);
            }
            $results[] = "Created 14 core database tables & indexes.";

            // Step 3: Seed Administrator
            $adminHash = password_hash($adminPass, PASSWORD_BCRYPT);
            $upsertAdmin = $pdo->prepare("
                INSERT INTO `admins` (`email`, `password_hash`, `name`, `role`, `is_active`)
                VALUES (:email, :hash, :name, 'superadmin', 1)
                ON DUPLICATE KEY UPDATE
                    `password_hash` = VALUES(`password_hash`),
                    `name` = VALUES(`name`),
                    `role` = 'superadmin',
                    `is_active` = 1
            ");
            $upsertAdmin->execute([
                ':email' => $adminEmail,
                ':hash' => $adminHash,
                ':name' => $adminName,
            ]);
            $results[] = "Superadmin account ready: `{$adminEmail}`.";

            // Step 4: Seed Programs if empty
            $progCount = (int)$pdo->query("SELECT COUNT(*) FROM `programs`")->fetchColumn();
            if ($progCount === 0) {
                $seedPrograms = [
                    ['Piano & Keyboard Mastery', 'Instruments', 'Classical, Contemporary & Jazz', '₦85,000', 85000.00, 'Comprehensive keyboard foundation and improvisation.'],
                    ['Acoustic & Electric Guitar', 'Instruments', 'Chords, Solos & Technique', '₦75,000', 75000.00, 'From foundational chords to advanced guitar fretboard mastery.'],
                    ['Contemporary Drums', 'Instruments', 'Grooves, Timing & Ensembles', '₦80,000', 80000.00, 'Rhythm, coordination, timing, and dynamic live ensemble performance.'],
                    ['Vocal Artistry & Performance', 'Vocals', 'Breathing, Pitch & Stagecraft', '₦75,000', 75000.00, 'Develop your vocal range, breath control, and professional performance.'],
                    ['Music Production & Audio Tech', 'Music Production', 'DAWs, Mixing & Recording', '₦120,000', 120000.00, 'Hands-on sound engineering, digital audio workstations, and mixing.'],
                    ['Violin & Strings', 'Instruments', 'Classical Technique & Posture', '₦85,000', 85000.00, 'Tone production, bowing technique, intonation, and chamber music.'],
                ];
                $insProg = $pdo->prepare("INSERT INTO `programs` (`name`, `category`, `tag`, `fee`, `fee_amount`, `desc`) VALUES (?, ?, ?, ?, ?, ?)");
                foreach ($seedPrograms as $p) {
                    $insProg->execute($p);
                }
                $results[] = "Seeded core music academy programs.";
            }

            // Step 5: Seed Instructors if empty
            $instCount = (int)$pdo->query("SELECT COUNT(*) FROM `instructors`")->fetchColumn();
            if ($instCount === 0) {
                $seedInstructors = [
                    ['Tosin Adewale', 'Founder & Artistic Director', 'Classical, Contemporary & Jazz', 'Kaduna Studio', 'tosin@vivadoxa.ng', '08031110001', 1, 'Concert pianist, composer, and pedagogue with over 15 years guiding aspiring instrumentalists, church music leaders, and conservatory candidates across West Africa.'],
                    ['David Eze', 'Guitar & Production Instructor', 'Acoustic, Electric & DAWs', 'Kaduna Studio', 'david@vivadoxa.ng', '08031110002', 0, 'Professional guitarist and sound engineer.'],
                    ['Morenike Bello', 'Vocal Performance Lead', 'Breathing, Pitch & Stagecraft', 'Kaduna Studio', 'morenike@vivadoxa.ng', '08031110003', 0, 'Soprano and master vocal clinician.'],
                ];
                $insInst = $pdo->prepare("INSERT INTO `instructors` (`name`, `title`, `specialization`, `location`, `email`, `phone`, `is_director`, `bio`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($seedInstructors as $ins) {
                    $insInst->execute($ins);
                }
                $results[] = "Seeded academy faculty & Director profile.";
            }

            // Step 6: Seed Cohorts if empty
            $cohortCount = (int)$pdo->query("SELECT COUNT(*) FROM `cohorts`")->fetchColumn();
            if ($cohortCount === 0) {
                $seedCohorts = [
                    ['Saturday Cohort A', 'Morning 9:00am - 12:00pm', 'Piano & Guitar Rooms', 'Active'],
                    ['Saturday Cohort B', 'Afternoon 1:00pm - 4:00pm', 'Vocal & Drum Rooms', 'Active'],
                    ['Weekday Evenings', 'Tue & Thu 5:00pm - 7:00pm', 'Production Studio', 'Active'],
                ];
                $insCoh = $pdo->prepare("INSERT INTO `cohorts` (`name`, `time_slot`, `room`, `status`) VALUES (?, ?, ?, ?)");
                foreach ($seedCohorts as $c) {
                    $insCoh->execute($c);
                }
                $results[] = "Seeded academic cohorts & timetable.";
            }

            // Step 7: Seed System & Banking Settings
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
                'fromEmail' => 'admissions@vivadoxa.ng',
                'fromName' => 'Vivadoxa Music Academy Admissions',
            ];
            $defaultBank = [
                'bankName' => 'Access Bank',
                'accountNumber' => '1906950275',
                'accountName' => 'Fredrerick Chysantus',
                'branch' => 'Angwan Sunday, Kaduna',
                'enablePaystack' => true,
                'currency' => 'NGN',
                'defaultTuitionFee' => 20000,
            ];

            $stmtSetting = $pdo->prepare("
                INSERT INTO `system_settings` (`setting_key`, `setting_value`)
                VALUES (:k, :v)
                ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)
            ");
            $stmtSetting->execute([':k' => 'general_settings', ':v' => json_encode($defaultGeneral, JSON_UNESCAPED_UNICODE)]);
            $stmtSetting->execute([':k' => 'bank_settings', ':v' => json_encode($defaultBank, JSON_UNESCAPED_UNICODE)]);
            $results[] = "Configured system notification & Access Bank payment defaults.";

            // Step 8: Write / Update .env file
            $envPath = __DIR__ . '/.env';
            $envContent = "# Vivadoxa Production Environment Configuration\n";
            $envContent .= "# Auto-generated by Installer on " . date('Y-m-d H:i:s') . "\n\n";
            $envContent .= "DB_HOST={$dbHost}\n";
            $envContent .= "DB_PORT={$dbPort}\n";
            $envContent .= "DB_NAME={$dbName}\n";
            $envContent .= "DB_USER={$dbUser}\n";
            $envContent .= "DB_PASS={$dbPass}\n\n";
            $envContent .= "VITE_API_URL=/api\n";
            $envContent .= "APP_ENV=production\n";

            file_put_contents($envPath, $envContent);
            @chmod($envPath, 0644);
            $results[] = "Successfully written `.env` database configuration file.";

            $completed = true;

            // Step 9: Self-Destruct
            if ($doSelfDestruct) {
                if (@unlink(__FILE__)) {
                    $selfDestructed = true;
                    $results[] = "Self-destruct complete: `install.php` has been securely deleted from the server.";
                } else {
                    $results[] = "Notice: Could not automatically delete `install.php` due to file permissions. Please delete `install.php` manually via cPanel File Manager.";
                }
            }

        } catch (Exception $ex) {
            $error = $ex->getMessage();
        }
    }
}

// In CLI mode, output text and exit
if ($isCli) {
    echo "\n=== Vivadoxa Database Installer ===\n\n";
    if ($error) {
        echo "[ERROR] " . $error . "\n\n";
        exit(1);
    }
    foreach ($results as $res) {
        echo " ✓ " . $res . "\n";
    }
    echo "\nInstallation complete!\n\n";
    exit(0);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vivadoxa Database Installer & Setup</title>
  <style>
    :root {
      --primary: #157054;
      --primary-hover: #105a43;
      --accent: #c96b32;
      --dark: #121820;
      --bg: #f8f9fa;
      --card-bg: #ffffff;
      --line: #e2e8f0;
      --text: #2d3748;
      --muted: #64748b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #0f172a;
      background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 100%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .installer-box {
      background: var(--card-bg);
      width: 100%;
      max-width: 580px;
      border-radius: 14px;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.4);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .header {
      background: linear-gradient(135deg, #101c2c 0%, #18283d 100%);
      color: white;
      padding: 28px 32px;
      text-align: center;
      border-bottom: 3px solid var(--accent);
    }
    .header h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    .header p {
      font-size: 13px;
      color: #94a3b8;
    }
    .content {
      padding: 28px 32px;
    }
    .alert {
      padding: 14px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .step-log {
      list-style: none;
      margin: 16px 0;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid var(--line);
    }
    .step-log li {
      padding: 6px 0;
      font-size: 13px;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .step-log li svg {
      flex-shrink: 0;
      color: var(--primary);
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .form-row {
      display: flex;
      gap: 12px;
    }
    .form-row .form-group {
      flex: 1;
    }
    .input-control {
      width: 100%;
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid var(--line);
      font-size: 14px;
      background: #ffffff;
      color: var(--dark);
      transition: border-color 0.15s ease;
    }
    .input-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(21, 112, 84, 0.15);
    }
    .checkbox-group {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      padding: 12px 14px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .checkbox-group input {
      margin-top: 3px;
      cursor: pointer;
      width: 16px;
      height: 16px;
      accent-color: var(--accent);
    }
    .checkbox-group label {
      font-size: 13px;
      color: #92400e;
      line-height: 1.4;
      cursor: pointer;
    }
    .btn-submit {
      width: 100%;
      padding: 13px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.05s ease;
    }
    .btn-submit:hover {
      background: var(--primary-hover);
    }
    .btn-submit:active {
      transform: scale(0.99);
    }
    .btn-home {
      display: inline-block;
      text-align: center;
      width: 100%;
      padding: 13px;
      background: #0f172a;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 10px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      background: #e2e8f0;
      color: #475569;
      border-radius: 4px;
      margin-left: 6px;
    }
  </style>
</head>
<body>

  <div class="installer-box">
    <div class="header">
      <h1>Vivadoxa Music Academy</h1>
      <p>Automated Database Installer & Environment Setup</p>
    </div>

    <div class="content">
      <?php if ($completed): ?>
        <div class="alert alert-success">
          <strong>Database & System Initialized Successfully!</strong>
        </div>

        <ul class="step-log">
          <?php foreach ($results as $res): ?>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <?= htmlspecialchars($res) ?>
            </li>
          <?php endforeach; ?>
        </ul>

        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
          <div style="font-weight: 700; color: #1e293b; margin-bottom: 6px;">Superadmin Credentials:</div>
          <div><strong>Email:</strong> <?= htmlspecialchars($adminEmail) ?></div>
          <div><strong>Password:</strong> <?= htmlspecialchars($adminPass) ?></div>
        </div>

        <?php if ($selfDestructed): ?>
          <div style="font-size: 12px; color: #15803d; text-align: center; margin-bottom: 12px;">
            🔒 <strong>Self-destruct active:</strong> This script (<code>install.php</code>) has been completely erased from the server.
          </div>
        <?php endif; ?>

        <a href="/" class="btn-submit" style="display:block; text-align:center; text-decoration:none;">Go to Homepage</a>
        <a href="/#admin" class="btn-home">Open Admissions & Admin Portal</a>

      <?php else: ?>

        <?php if ($error): ?>
          <div class="alert alert-error">
            <strong>Installation Error:</strong><br>
            <?= nl2br(htmlspecialchars($error)) ?>
          </div>
        <?php endif; ?>

        <form method="POST">
          <div class="form-row">
            <div class="form-group" style="flex: 2;">
              <label>Database Host</label>
              <input type="text" name="db_host" class="input-control" value="<?= htmlspecialchars($defaultHost) ?>" required>
            </div>
            <div class="form-group" style="flex: 1;">
              <label>Port</label>
              <input type="number" name="db_port" class="input-control" value="<?= htmlspecialchars($defaultPort) ?>" required>
            </div>
          </div>

          <div class="form-group">
            <label>Database Name <span class="badge">from cPanel</span></label>
            <input type="text" name="db_name" class="input-control" placeholder="e.g. vivadoxa_db" value="<?= htmlspecialchars($defaultName) ?>" required autofocus>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Database User</label>
              <input type="text" name="db_user" class="input-control" placeholder="e.g. vivadoxa_user" value="<?= htmlspecialchars($defaultUser) ?>" required>
            </div>
            <div class="form-group">
              <label>Database Password</label>
              <input type="password" name="db_pass" class="input-control" placeholder="Database password" value="<?= htmlspecialchars($defaultPass) ?>">
            </div>
          </div>

          <div style="border-top: 1px solid var(--line); margin: 20px 0 16px 0; padding-top: 16px;">
            <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 12px; text-transform: uppercase;">Superadmin Account Setup</div>
            <div class="form-row">
              <div class="form-group">
                <label>Admin Email</label>
                <input type="email" name="admin_email" class="input-control" value="admin@vivadoxa.ng" required>
              </div>
              <div class="form-group">
                <label>Admin Password</label>
                <input type="text" name="admin_pass" class="input-control" value="VivadoxaAdmin2025!" required>
              </div>
            </div>
          </div>

          <div class="checkbox-group">
            <input type="checkbox" name="self_destruct" id="self_destruct" value="1" checked>
            <label for="self_destruct">
              <strong>Self-destruct this script upon completion (Recommended)</strong><br>
              Automatically deletes <code>install.php</code> once the database is initialized so that setup details are never exposed to the public.
            </label>
          </div>

          <button type="submit" class="btn-submit">Initialize Database & Launch</button>
        </form>

      <?php endif; ?>
    </div>
  </div>

</body>
</html>
