<?php
// ─── Database Setup and Migration Script for Vivadoxa ─────────────────────────
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();

    // 3. Create tables
    $pdo->exec("
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
        ) ENGINE=InnoDB;
    ");

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
            `fee` VARCHAR(50) NOT NULL DEFAULT '85,000',
            `fee_amount` DECIMAL(12, 2) NOT NULL DEFAULT 85000.00,
            `duration` VARCHAR(50) NOT NULL DEFAULT '12 weeks',
            `modes` VARCHAR(100) NOT NULL DEFAULT 'Onsite + Online',
            `desc` TEXT NOT NULL,
            `is_active` TINYINT(1) NOT NULL DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
            `is_short` TINYINT(1) NOT NULL DEFAULT 0,
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

    // ── Student Schedule, Absence & Reschedule Requests ───────────────────────
    $pdo->exec("
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
        ) ENGINE=InnoDB;
    ");

    // ── System Settings & Notification Logs ──────────────────────────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `system_settings` (
            `setting_key` VARCHAR(100) PRIMARY KEY,
            `setting_value` MEDIUMTEXT NOT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `system_notifications` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `channel` ENUM('email', 'whatsapp') NOT NULL,
            `recipient` VARCHAR(191) NOT NULL,
            `subject` VARCHAR(255) NOT NULL,
            `message` TEXT NOT NULL,
            `status` ENUM('sent', 'failed', 'logged') NOT NULL DEFAULT 'sent',
            `error_message` TEXT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // 9. Seed Performances if empty or containing stale placeholders
    $pdo->exec("DELETE FROM `performances` WHERE `youtube_id` IN ('FbnNOOE3ET4', 'olo4Ax3HPv8', '47Ina4YxXnY', 'JGUCSB0q0nE')");
    $perfCount = $pdo->query("SELECT COUNT(*) FROM `performances`")->fetchColumn();
    if ($perfCount == 0) {
        $seedPerformances = [
            ['Vivadoxa Music Worship Session featuring Min. Uche', 'Min. Uche & Vivadoxa Live Ensemble', 'Vocal & Instrumental Ensemble', 'Concert', '-IcdMT9uCLU', 'Live Session', 'Live Studio Session', 'An inspiring live worship and vocal ensemble session featuring Min. Uche and Vivadoxa student instrumentalists live in the Kaduna studio.', 1, 0],
            ['Students Praise Session & Live Band Recital', 'Vivadoxa Student Ensemble', 'Drums, Bass & Keyboard', 'Student Band', 'XU917wI9sDg', 'Live Band', 'Student Praise Showcase', 'Vivadoxa candidates unite for an authentic praise session and live band showcase, demonstrating tempo lock, group dynamics, and rhythm control.', 0, 1],
            ['Multi-Instrument Showcase: Bringing Musical Passions to Life', 'Vivadoxa Instructors & Students', 'Multi-Disciplinary Ensemble', 'Concert', 'FZydqxYOpF0', 'Academy Showcase', 'Kaduna Studio Showcase', 'Highlighting the comprehensive range of musical disciplines taught at Vivadoxa Music Kaduna, from keyboard and strings to percussion.', 0, 1],
            ['Acoustic Guitar Foundations & Worship Chord Melody', 'Vivadoxa Guitar Faculty & Students', 'Acoustic Guitar', 'Recital', 'vjVEDq9oITE', 'Guitar Recital', 'Guitar Studio Showcase', 'Practical acoustic guitar demonstration playing worship songs, showing smooth open chord changes and rhythmic strumming dynamics.', 0, 1],
            ['Electric Bass Guitar Groove & Harmony Masterclass', 'Vivadoxa Bass Faculty', 'Bass Guitar', 'Recital', 'G4c81H_UeXM', 'Bass Workshop', 'Fretboard Workshop', 'In-depth electric bass groove training, fretboard positioning, root-fifth-octave pocket playing, and gospel bass foundation.', 0, 1],
            ['Makossa & African Highlife Bass Groove Showcase', 'Vivadoxa Rhythm Section', 'Bass Guitar & Percussion', 'Student Band', 'Adt0rd5uGaM', 'Groove Lab', 'Live Rhythm Lab', 'High-energy Makossa and African Highlife syncopated bass grooves, demonstrating finger dexterity, slap-pop nuances, and pocket timing.', 0, 1],
            ['Highlife Piano & African Praise Phrasing', 'Vivadoxa Keyboard Department', 'Piano & Keyboard', 'Recital', 'hH8frv6klc4', 'African Praise', 'Keyboard Studio', 'Authentic African Highlife keyboard chord voicings, rhythmic syncopation, and praise progression improvisation.', 0, 1],
            ['Makossa & Soukous Keyboard Rhythms', 'Vivadoxa Keyboard Students', 'Piano & Keyboard', 'Recital', 'Clu5E2abMgU', 'Studio Recital', 'Contemporary Keyboard Lab', 'Dynamic Makossa and Soukous rhythmic accompaniment patterns on piano, mastering two-hand independent rhythmic timing.', 0, 1],
            ['1-4-5 Chord Progressions & Harmonic Theory for Beginners', 'Vivadoxa Foundation Learners', 'Piano & Keyboard', 'Recital', 'aokYxYryN_8', 'Theory & Recital', 'Foundation Class', 'Demystifying fundamental 1-4-5 harmonic progressions on piano, voice leading, and cadence resolution for aspiring accompanists.', 0, 0],
            ['Beginner Piano: Playing Your First Song', 'Vivadoxa Foundation Learners', 'Piano & Keyboard', 'Recital', 'SHQFEIvnFXc', 'Early Milestone', 'Early Learner Showcase', 'Encouraging early music education milestone: building hand posture, finger numbers, and completing your first song melody.', 0, 0],
            ['Guitar Foundations: Playing Simple Songs & Strumming', 'Vivadoxa Guitar Department', 'Acoustic Guitar', 'Recital', 'Hpx3BJ7C3QA', 'Acoustic Session', 'Kaduna Studio', 'Step-by-step guitar chord changes, rhythm timing, and playing your first full song with acoustic confidence.', 0, 1],
            ['Heartfelt Recital Milestone: Student Breakthrough Showcase', 'Junior Student Recitalist', 'Piano & Keyboard', 'Recital', 'biosC5ZXQgI', 'Milestone Recital', 'Studio Recital', 'An emotional milestone performance celebrating student breakthrough, musical expression, and dedication to practice.', 0, 1],
            ['Simple Piano Lesson & Melodic Phrasing', 'Vivadoxa Keyboard Department', 'Piano & Keyboard', 'Recital', 'teoKQmcuMZw', 'Piano Lesson', 'Keyboard Studio', 'Accessible foundation piano lesson breaking down melody phrasing, hand posture, and key navigation.', 0, 0],
            ['Makossa Praise Groove & Syncopation', 'Vivadoxa Keyboard Students', 'Piano & Keyboard', 'Recital', 'Lxiwngf0YBQ', 'Praise Groove', 'Kaduna Studio', 'High-energy praise rhythm syncopation, upbeat comping, and authentic African gospel keyboard groove.', 0, 1],
            ['Melodic Solo Expression on the Piano', 'Advanced Piano Students', 'Piano & Keyboard', 'Recital', 'hSRbektpiTQ', 'Solo Phrasing', 'Masterclass Showcase', 'Techniques for playing lyrical solo melodies on keyboard with dynamic touch and expressive ornamentation.', 0, 1],
        ];

        $insPerf = $pdo->prepare("
            INSERT INTO `performances` (`title`, `performer`, `program`, `category`, `youtube_id`, `duration`, `date_label`, `description`, `is_featured`, `is_short`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    // Seed enquiries if empty
    $enqCount = (int)$pdo->query("SELECT COUNT(*) FROM `enquiries`")->fetchColumn();
    if ($enqCount === 0) {
        $stmt = $pdo->prepare("
            INSERT INTO `enquiries` (`name`, `email`, `phone`, `subject`, `message`, `is_read`, `created_at`)
            VALUES 
            ('Rev. Bulus Danjuma', 'bulus.d@faithchapel.org', '08032221144', 'Choir Workshop & Vocal Training', 'Good day Vivadoxa team. Our church choir in Barnawa is planning a 3-day vocal masterclass next month. Can we schedule an instructor consultation?', 0, '2026-10-21 11:15:00'),
            ('Zainab Mohammed', 'zainab.m@gmail.com', '08053334422', 'Kids Piano Lessons in Kaduna', 'Hello, do you offer Saturday morning piano lessons for an 8-year-old beginner? We reside in Malali.', 0, '2026-10-21 12:40:00'),
            ('Peter Akpan', 'peter.akpan@yahoo.com', '08078889900', 'Guitar Setup & Electronics Repair', 'I have a Fender Stratocaster with heavy ground hum and high string action. What is your turnaround time at the Kaduna workshop?', 1, '2026-10-20 16:30:00'),
            ('Mrs. Grace Adebayo', 'grace.adebayo@outlook.com', '08031308881', 'Private Home Lessons Inquiry', 'Inquiring about home lesson availability for 2 siblings (Violin and Keyboard) twice weekly.', 0, '2026-10-21 14:10:00')
        ");
        $stmt->execute();
    }

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

