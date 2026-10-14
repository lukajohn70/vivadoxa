<?php
// ─── Database Setup and Migration Script for Vivadoxa ─────────────────────────
header('Content-Type: application/json');

$host = '127.0.0.1';
$port = 3306;
$user = 'root';
$pass = 'root';

try {
    // 1. Connect without database to create it
    $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // 2. Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `vivadoxa` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `vivadoxa`;");

    // 3. Create tables
    $pdo->exec("
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
        ) ENGINE=InnoDB;
    ");

    $pdo->exec("
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
        ) ENGINE=InnoDB;
    ");

    $pdo->exec("
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
        ) ENGINE=InnoDB;
    ");

    $pdo->exec("
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
        ) ENGINE=InnoDB;
    ");

    // Migration in case repairs table existed without intake_method or pickup_address
    try {
        $pdo->exec("ALTER TABLE `repairs` ADD COLUMN `intake_method` ENUM('dropoff', 'pickup') NOT NULL DEFAULT 'dropoff'");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `repairs` ADD COLUMN `pickup_address` TEXT NULL");
    } catch (Exception $e) {}

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `enquiries` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `email` VARCHAR(191) NOT NULL,
            `phone` VARCHAR(50) NULL,
            `subject` VARCHAR(191) NULL,
            `message` TEXT NOT NULL,
            `is_read` TINYINT(1) NOT NULL DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ");

    // ── Programs & Courses ────────────────────────────────────────────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `programs` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(150) NOT NULL UNIQUE,
            `category` VARCHAR(50) NOT NULL,
            `tag` VARCHAR(50) NOT NULL DEFAULT 'Popular',
            `fee` VARCHAR(50) NOT NULL DEFAULT '₦85,000',
            `fee_amount` DECIMAL(12, 2) NOT NULL DEFAULT 85000.00,
            `duration` VARCHAR(50) NOT NULL DEFAULT '12 weeks',
            `modes` VARCHAR(100) NOT NULL DEFAULT 'Onsite + Online',
            `desc` TEXT NOT NULL,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ");

    // Migration for programs table
    try {
        $pdo->exec("ALTER TABLE `programs` ADD COLUMN `age_group` VARCHAR(100) NOT NULL DEFAULT 'All Ages'");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `programs` ADD COLUMN `level` VARCHAR(50) NOT NULL DEFAULT 'Beginner'");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `programs` ADD COLUMN `image` VARCHAR(255) NULL");
    } catch (Exception $e) {}

    // ── Instructors ───────────────────────────────────────────────────────────
    $pdo->exec("
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
        ) ENGINE=InnoDB;
    ");

    // Migration for instructors table
    try {
        $pdo->exec("ALTER TABLE `instructors` ADD COLUMN `bio` TEXT NULL");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `instructors` ADD COLUMN `image` VARCHAR(255) NULL");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE `instructors` ADD COLUMN `is_director` TINYINT(1) NOT NULL DEFAULT 0");
    } catch (Exception $e) {}

    // ── Student Performances & Recitals (Parara parity) ───────────────────────
    $pdo->exec("
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
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ");

    // ── Enrolled Students ─────────────────────────────────────────────────────
    $pdo->exec("
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
        ) ENGINE=InnoDB;
    ");

    // ── Class Cohorts & Schedule ──────────────────────────────────────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `cohorts` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL UNIQUE,
            `time_slot` VARCHAR(100) NOT NULL,
            `room` VARCHAR(100) NOT NULL,
            `status` VARCHAR(50) NOT NULL DEFAULT 'Active'
        ) ENGINE=InnoDB;
    ");


    // 4. Seed admins
    $adminsToSeed = [
        [
            'email' => 'admin@vivadoxa.ng',
            'name' => 'Tomi Adeyemi',
            'role' => 'superadmin',
            'pass' => 'VivadoxaAdmin2025!',
        ],
        [
            'email' => 'staff@vivadoxa.ng',
            'name' => 'Admissions Staff',
            'role' => 'staff',
            'pass' => 'StaffPass2025!',
        ],
    ];

    $upsertAdmin = $pdo->prepare("
        INSERT INTO `admins` (`email`, `password_hash`, `name`, `role`, `is_active`)
        VALUES (:email, :hash, :name, :role, 1)
        ON DUPLICATE KEY UPDATE
            `password_hash` = VALUES(`password_hash`),
            `name` = VALUES(`name`),
            `role` = VALUES(`role`),
            `is_active` = 1
    ");

    foreach ($adminsToSeed as $adm) {
        $hash = password_hash($adm['pass'], PASSWORD_BCRYPT);
        $upsertAdmin->execute([
            ':email' => $adm['email'],
            ':hash' => $hash,
            ':name' => $adm['name'],
            ':role' => $adm['role'],
        ]);
    }

    // 5. Seed Programs if empty
    $progCount = $pdo->query("SELECT COUNT(*) FROM `programs`")->fetchColumn();
    if ($progCount == 0) {
        $seedPrograms = [
            ['Piano & Keyboard Mastery', 'Instruments', 'Classical, Contemporary & Jazz', '₦85,000', 85000.00, 'Comprehensive keyboard foundation and improvisation.'],
            ['Acoustic & Electric Guitar', 'Instruments', 'Chords, Solos & Technique', '₦75,000', 75000.00, 'From foundational chords to advanced guitar fretboard mastery.'],
            ['Contemporary Drums', 'Instruments', 'Grooves, Timing & Ensembles', '₦80,000', 80000.00, 'Rhythm, coordination, timing, and dynamic live ensemble performance.'],
            ['Vocal Artistry & Performance', 'Vocals', 'Breathing, Pitch & Stagecraft', '₦75,000', 75000.00, 'Develop your vocal range, breath control, and professional performance.'],
            ['Music Production & Audio Tech', 'Music Production', 'DAWs, Mixing & Recording', '₦120,000', 120000.00, 'Hands-on sound engineering, digital audio workstations, and mixing.'],
            ['Violin & Strings', 'Instruments', 'Classical Technique & Posture', '₦85,000', 85000.00, 'Tone production, bowing technique, intonation, and chamber music.'],
        ];

        $insProg = $pdo->prepare("
            INSERT INTO `programs` (`name`, `category`, `tag`, `fee`, `fee_amount`, `desc`)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($seedPrograms as $p) {
            $insProg->execute($p);
        }
    }

    // 6. Seed Instructors if empty
    $instCount = $pdo->query("SELECT COUNT(*) FROM `instructors`")->fetchColumn();
    if ($instCount == 0) {
        $seedInstructors = [
            ['Tosin Adewale', 'Head of Piano & Composition', 'Classical, Contemporary & Jazz', 'Kaduna Studio', 'tosin@vivadoxa.ng', '08031110001'],
            ['David Eze', 'Guitar & Production Instructor', 'Acoustic, Electric & DAWs', 'Kaduna Studio', 'david@vivadoxa.ng', '08031110002'],
            ['Morenike Bello', 'Vocal Performance Lead', 'Breathing, Pitch & Stagecraft', 'Kaduna Studio', 'morenike@vivadoxa.ng', '08031110003'],
        ];

        $insInst = $pdo->prepare("
            INSERT INTO `instructors` (`name`, `title`, `specialization`, `location`, `email`, `phone`)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($seedInstructors as $ins) {
            $insInst->execute($ins);
        }
    }

    // 7. Seed Students if empty
    $studCount = $pdo->query("SELECT COUNT(*) FROM `students`")->fetchColumn();
    if ($studCount == 0) {
        $seedStudents = [
            ['VD-2025-001', 'VDX-2025-001', 'Chinedu Okafor', 'chinedu@example.com', '08031112233', 'Piano Performance', 'Onsite', 'Saturday Cohort A'],
            ['VD-2025-002', 'VDX-2025-003', 'David Kalu', 'david.kalu@example.com', '08099998877', 'Guitar Mastery', 'Online', 'Saturday Cohort B'],
            ['VD-2025-003', 'VDX-2025-002', 'Amina Bello', 'amina.bello@example.com', '08022223344', 'Vocal Artistry', 'Onsite', 'Weekday Evenings'],
        ];

        $insStud = $pdo->prepare("
            INSERT INTO `students` (`student_no`, `application_no`, `full_name`, `email`, `phone`, `program`, `study_mode`, `cohort`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($seedStudents as $s) {
            $insStud->execute($s);
        }
    }

    // 8. Seed Cohorts if empty
    $cohortCount = $pdo->query("SELECT COUNT(*) FROM `cohorts`")->fetchColumn();
    if ($cohortCount == 0) {
        $seedCohorts = [
            ['Saturday Cohort A', 'Morning 9:00am - 12:00pm', 'Piano & Guitar Rooms', 'Active'],
            ['Saturday Cohort B', 'Afternoon 1:00pm - 4:00pm', 'Vocal & Drum Rooms', 'Active'],
            ['Weekday Evenings', 'Tue & Thu 5:00pm - 7:00pm', 'Production Studio', 'Active'],
        ];

        $insCoh = $pdo->prepare("
            INSERT INTO `cohorts` (`name`, `time_slot`, `room`, `status`)
            VALUES (?, ?, ?, ?)
        ");
        foreach ($seedCohorts as $c) {
            $insCoh->execute($c);
        }
    }

    // 9. Seed Performances if empty
    $perfCount = $pdo->query("SELECT COUNT(*) FROM `performances`")->fetchColumn();
    if ($perfCount == 0) {
        $seedPerformances = [
            ['Chamber Strings & Piano Recital', 'Vivadoxa Youth Ensemble', 'Violin & Piano', 'Concert', 'FbnNOOE3ET4', '4:15', 'Annual Mid-Term Showcase', 'Our intermediate violin and keyboard candidates perform an uplifting chamber medley at the Kaduna studio recital hall.', 1],
            ['Contemporary Keyboard Rendition', 'Junior Recitalists (Ages 7–11)', 'Piano & Keyboard', 'Recital', 'olo4Ax3HPv8', '3:40', 'Junior Music Festival', 'Young learners demonstrate two-hand coordination, dynamic phrasing, and sight-reading after their 12-week foundation term.', 0],
            ['Acoustic Fingerstyle & Rhythm Ensemble', 'David O. & Teen Guitarists', 'Guitar', 'Recital', '47Ina4YxXnY', '3:10', 'Kaduna Youth Recital', 'Clean fretboard transitions, chord melodies, and rhythmic syncopation performed live on acoustic guitars.', 0],
            ['Student Band Live Performance — Believer', 'Vivadoxa Senior Student Band', 'Drums, Bass & Vocals', 'Student Band', 'JGUCSB0q0nE', '4:30', 'End of Year Concert', 'High-octane ensemble performance showcasing stage discipline, tight pocket drumming, and dynamic vocal delivery.', 0],
        ];

        $insPerf = $pdo->prepare("
            INSERT INTO `performances` (`title`, `performer`, `program`, `category`, `youtube_id`, `duration`, `date_label`, `description`, `is_featured`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($seedPerformances as $pf) {
            $insPerf->execute($pf);
        }
    }

    // Set Director flag on Tosin Adewale
    $pdo->exec("
        UPDATE `instructors`
        SET `is_director` = 1,
            `title` = 'Founder & Artistic Director',
            `bio` = 'Concert pianist, composer, and pedagogue with over 15 years guiding aspiring instrumentalists, church music leaders, and conservatory candidates across West Africa.'
        WHERE `name` LIKE '%Tosin%'
    ");

    echo json_encode([
        'success' => true,
        'message' => 'Vivadoxa database updated with academic tables, performances, director profile, and pickup logistics!',
        'tables' => ['admins', 'applications', 'payments', 'repairs', 'enquiries', 'programs', 'instructors', 'students', 'cohorts', 'performances'],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}

