<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];
$type = trim($_GET['type'] ?? 'programs');

function ensureCatalogTables(PDO $pdo): void {
    // 1. Programs
    $pCount = (int)$pdo->query("SELECT COUNT(*) FROM `programs`")->fetchColumn();
    if ($pCount === 0) {
        $programs = [
            ['Piano & Keyboard Mastery', 'Instruments', 'Popular', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Foundational posture, classical finger dexterity, reading sheet music, chord voicings, and contemporary hymnody.', 'All Ages', 'Beginner'],
            ['Acoustic Guitar Foundations', 'Instruments', 'Popular', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Open chords, fingerstyle patterns, rhythmic strumming, bar chords, and solo accompaniment.', 'All Ages', 'Beginner'],
            ['Lead & Electric Guitar', 'Instruments', 'Core', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Scale mastery, pentatonic improvisation, pick control, tone sculpting, and stage presence.', 'All Ages', 'Intermediate'],
            ['Bass Guitar Groove & Harmony', 'Instruments', 'Core', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Root note timing, slap and fingerstyle technique, rhythmic locked-in pocket, and bassline construction.', 'All Ages', 'Beginner'],
            ['Violin & Classical Strings', 'Instruments', 'Core', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Bow grip, intonation, ear training, dynamic vibrato, and graded recital repertoire.', 'All Ages', 'Beginner'],
            ['Saxophone (Alto & Tenor)', 'Instruments', 'Popular', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Embouchure control, breath support, tone projection, jazz articulation, and expressive soloing.', 'All Ages', 'Beginner'],
            ['Trumpet & Brass Fundamentals', 'Instruments', 'Core', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Lip buzz resonance, valve dexterity, fanfare articulation, and breath conservation.', 'All Ages', 'Beginner'],
            ['Euphonium & Low Brass', 'Instruments', 'Specialty', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Warm melodic tone, compensating valve navigation, brass choir harmonization, and sight-reading.', 'All Ages', 'Beginner'],
            ['Clarinet & Woodwinds', 'Instruments', 'Core', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Single-reed embouchure, smooth register transitions, throat tone correction, and orchestral phrasing.', 'All Ages', 'Beginner'],
            ['Concert Flute', 'Instruments', 'Core', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Clear embouchure aperture, tone focus, octave overblowing control, and lyrical phrasing.', 'All Ages', 'Beginner'],
            ['Contemporary Drum Kit', 'Instruments', 'Popular', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons', 'Limb independence, rudiment articulation, metronome precision, groove pocket, and dynamic live accompaniment.', 'All Ages', 'Beginner'],
            ['Talking Drums & Traditional Percussion', 'Instruments', 'Heritage', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons', 'Indigenous Nigerian percussion technique, pitch modulation via leather tension cords, and cultural praise rhythms.', 'All Ages', 'Beginner'],
            ['Voice Training & Vocal Stagecraft', 'Vocals', 'Popular', '₦20,000 / month', 20000.00, '1–12 Months', 'Studio · Home Lessons · Online', 'Diaphragmatic breath support, vocal register blend, pitch accuracy, vibrato control, and stagecraft.', 'All Ages', 'Beginner'],
        ];
        $ins = $pdo->prepare("
            INSERT INTO `programs` (`name`, `category`, `tag`, `fee`, `fee_amount`, `duration`, `modes`, `desc`, `age_group`, `level`, `is_active`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        foreach ($programs as $p) {
            $ins->execute($p);
        }
    }

    // 2. Instructors
    $iCount = (int)$pdo->query("SELECT COUNT(*) FROM `instructors`")->fetchColumn();
    if ($iCount === 0) {
        $instructors = [
            ['Frederick Chrysantus', 'Founder & Artistic Director', 'Concert Piano, Conducting & Music Theory', 'Kaduna Studio', 'Pianist, composer, and educator with over 15 years cultivating musical excellence and mentoring musicians across Nigeria.', 1],
            ['David Eze', 'Guitar & Production Instructor', 'Acoustic, Electric Guitar & Audio Engineering', 'Kaduna Studio', 'Multi-instrumentalist and session guitarist specializing in contemporary fingerstyle, jazz harmony, and audio engineering.', 0],
            ['Morenike Bello', 'Vocal Performance Lead', 'Voice Training, Breath Mechanics & Stagecraft', 'Kaduna Studio', 'Classically trained vocal coach helping students expand their range, overcome vocal fatigue, and command the stage.', 0],
            ['Samuel Oche', 'Brass & Woodwind Lead', 'Saxophone, Trumpet, Clarinet & Flute', 'Kaduna Studio', 'Brass and wind specialist with extensive conservatory orchestral experience and church music leadership.', 0],
        ];
        $ins = $pdo->prepare("
            INSERT INTO `instructors` (`name`, `title`, `specialization`, `location`, `bio`, `is_director`, `is_active`)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        ");
        foreach ($instructors as $inst) {
            $ins->execute($inst);
        }
    }

    // 3. Cohorts
    $cCount = (int)$pdo->query("SELECT COUNT(*) FROM `cohorts`")->fetchColumn();
    if ($cCount === 0) {
        $cohorts = [
            ['Saturday Cohort A (Morning)', 'Saturdays 9:00 AM – 12:00 PM', 'Studio Hall 1 & Piano Lab', 'Active'],
            ['Saturday Cohort B (Afternoon)', 'Saturdays 1:00 PM – 4:00 PM', 'Studio Hall 2 & Ensemble Room', 'Active'],
            ['Weekday Cohort (Tue & Thu)', 'Tue & Thu 5:00 PM – 7:00 PM', 'Studio Hall 1', 'Active'],
            ['Private Home Lessons', 'Flexible (Scheduled with Instructor)', 'Student Residence (Kaduna)', 'Active'],
            ['Online Virtual Studio', 'Flexible (1-on-1 Video Session)', 'Remote Classroom', 'Active'],
        ];
        $ins = $pdo->prepare("
            INSERT INTO `cohorts` (`name`, `time_slot`, `room`, `status`)
            VALUES (?, ?, ?, ?)
        ");
        foreach ($cohorts as $c) {
            $ins->execute($c);
        }
    }

    // 4. Performances
    $perfCount = (int)$pdo->query("SELECT COUNT(*) FROM `performances`")->fetchColumn();
    if ($perfCount === 0) {
        $performances = [
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
        $ins = $pdo->prepare("
            INSERT INTO `performances` (`title`, `performer`, `program`, `category`, `youtube_id`, `duration`, `date_label`, `description`, `is_featured`, `is_short`, `is_active`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        foreach ($performances as $pf) {
            $ins->execute($pf);
        }
    }
}

if ($method === 'GET') {
    ensureCatalogTables($pdo);

    if ($type === 'instructors') {
        $includeAll = !empty($_GET['all']) || !empty($_GET['admin']);
        $sql = $includeAll
            ? "SELECT * FROM `instructors` ORDER BY `is_director` DESC, id ASC"
            : "SELECT * FROM `instructors` WHERE `is_active` = 1 ORDER BY `is_director` DESC, id ASC";
        $stmt = $pdo->query($sql);
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    } elseif ($type === 'students') {
        $stmt = $pdo->query("SELECT * FROM `students` ORDER BY enrolled_at DESC");
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    } elseif ($type === 'cohorts') {
        $stmt = $pdo->query("SELECT * FROM `cohorts` ORDER BY id ASC");
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    } elseif ($type === 'performances') {
        $stmt = $pdo->query("SELECT * FROM `performances` WHERE `is_active` = 1 ORDER BY `is_featured` DESC, id ASC");
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    } else {
        // Programs / Courses default
        $stmt = $pdo->query("SELECT * FROM `programs` WHERE `is_active` = 1 ORDER BY id ASC");
        jsonResponse(['success' => true, 'data' => $stmt->fetchAll()]);
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? 'add');

    if ($type === 'programs') {
        $id = (int)($input['id'] ?? 0);

        if ($action === 'delete') {
            if ($id > 0) {
                $stmt = $pdo->prepare("UPDATE `programs` SET `is_active` = 0 WHERE id = :id");
                $stmt->execute([':id' => $id]);
                jsonResponse(['success' => true, 'message' => 'Course deactivated successfully.']);
            }
            jsonResponse(['success' => false, 'error' => 'Valid ID required.'], 400);
        }

        $name = trim($input['name'] ?? '');
        $category = trim($input['category'] ?? 'Instruments');
        $tag = trim($input['tag'] ?? 'Featured');
        $fee = trim($input['fee'] ?? '₦20,000 / month');
        $desc = trim($input['desc'] ?? '');
        $ageGroup = trim($input['age_group'] ?? 'All Ages');
        $level = trim($input['level'] ?? 'Beginner');
        $image = trim($input['image'] ?? '');

        if (empty($name)) {
            jsonResponse(['success' => false, 'error' => 'Program name is required.'], 400);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE `programs`
                SET `name` = :name, `category` = :cat, `tag` = :tag, `fee` = :fee, `desc` = :desc,
                    `age_group` = :ag, `level` = :lvl, `image` = CASE WHEN :img != '' THEN :img ELSE `image` END, `is_active` = 1
                WHERE id = :id
            ");
            $stmt->execute([
                ':name' => $name,
                ':cat' => $category,
                ':tag' => $tag,
                ':fee' => $fee,
                ':desc' => $desc,
                ':ag' => $ageGroup,
                ':lvl' => $level,
                ':img' => $image,
                ':id' => $id,
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO `programs` (`name`, `category`, `tag`, `fee`, `desc`, `age_group`, `level`, `image`, `is_active`)
                VALUES (:name, :cat, :tag, :fee, :desc, :ag, :lvl, :img, 1)
                ON DUPLICATE KEY UPDATE
                    `category` = VALUES(`category`),
                    `tag` = VALUES(`tag`),
                    `fee` = VALUES(`fee`),
                    `desc` = VALUES(`desc`),
                    `age_group` = VALUES(`age_group`),
                    `level` = VALUES(`level`),
                    `image` = CASE WHEN VALUES(`image`) != '' THEN VALUES(`image`) ELSE `image` END,
                    `is_active` = 1
            ");
            $stmt->execute([
                ':name' => $name,
                ':cat' => $category,
                ':tag' => $tag,
                ':fee' => $fee,
                ':desc' => $desc,
                ':ag' => $ageGroup,
                ':lvl' => $level,
                ':img' => $image,
            ]);
        }

        jsonResponse(['success' => true, 'message' => 'Program saved successfully.']);
    } elseif ($type === 'instructors') {
        $id = (int)($input['id'] ?? 0);

        if ($action === 'delete' || $action === 'toggle_status') {
            if ($id > 0) {
                $curr = $pdo->prepare("SELECT `is_active` FROM `instructors` WHERE id = :id");
                $curr->execute([':id' => $id]);
                $curActive = (int)$curr->fetchColumn();
                $newActive = $curActive === 1 ? 0 : 1;

                $stmt = $pdo->prepare("UPDATE `instructors` SET `is_active` = :st WHERE id = :id");
                $stmt->execute([':st' => $newActive, ':id' => $id]);
                jsonResponse([
                    'success' => true,
                    'is_active' => $newActive,
                    'message' => $newActive === 1 ? 'Instructor profile activated.' : 'Instructor profile deactivated (profile preserved).'
                ]);
            }
            jsonResponse(['success' => false, 'error' => 'Valid ID required.'], 400);
        }

        $name = trim($input['name'] ?? '');
        $title = trim($input['title'] ?? 'Instructor');
        $specialization = trim($input['specialization'] ?? '');
        $location = trim($input['location'] ?? 'Kaduna Studio');
        $bio = trim($input['bio'] ?? '');
        $image = trim($input['image'] ?? '');
        $isDirector = !empty($input['is_director']) ? 1 : 0;

        if (empty($name)) {
            jsonResponse(['success' => false, 'error' => 'Instructor name is required.'], 400);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE `instructors`
                SET `name` = :name, `title` = :title, `specialization` = :spec, `location` = :loc,
                    `bio` = :bio, `image` = CASE WHEN :img != '' THEN :img ELSE `image` END,
                    `is_director` = :is_dir, `is_active` = 1
                WHERE id = :id
            ");
            $stmt->execute([
                ':name' => $name,
                ':title' => $title,
                ':spec' => $specialization,
                ':loc' => $location,
                ':bio' => $bio,
                ':img' => $image,
                ':is_dir' => $isDirector,
                ':id' => $id,
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO `instructors` (`name`, `title`, `specialization`, `location`, `bio`, `image`, `is_director`, `is_active`)
                VALUES (:name, :title, :spec, :loc, :bio, :img, :is_dir, 1)
                ON DUPLICATE KEY UPDATE
                    `title` = VALUES(`title`),
                    `specialization` = VALUES(`specialization`),
                    `location` = VALUES(`location`),
                    `bio` = VALUES(`bio`),
                    `image` = CASE WHEN VALUES(`image`) != '' THEN VALUES(`image`) ELSE `image` END,
                    `is_director` = VALUES(`is_director`),
                    `is_active` = 1
            ");
            $stmt->execute([
                ':name' => $name,
                ':title' => $title,
                ':spec' => $specialization,
                ':loc' => $location,
                ':bio' => $bio,
                ':img' => $image,
                ':is_dir' => $isDirector,
            ]);
        }

        jsonResponse(['success' => true, 'message' => 'Instructor profile saved.']);
    } elseif ($type === 'performances') {
        $id = (int)($input['id'] ?? 0);

        if ($action === 'batch_delete') {
            $ids = is_array($input['ids'] ?? null) ? array_map('intval', $input['ids']) : [];
            $validIds = array_filter($ids, function($i) { return $i > 0; });
            if (!empty($validIds)) {
                $placeholders = implode(',', array_fill(0, count($validIds), '?'));
                $stmt = $pdo->prepare("UPDATE `performances` SET `is_active` = 0 WHERE id IN ($placeholders)");
                $stmt->execute(array_values($validIds));
                jsonResponse(['success' => true, 'count' => count($validIds), 'message' => count($validIds) . ' recital videos removed successfully.']);
            }
            jsonResponse(['success' => false, 'error' => 'No valid IDs provided for batch deletion.'], 400);
        }

        if ($action === 'delete') {
            if ($id > 0) {
                $stmt = $pdo->prepare("UPDATE `performances` SET `is_active` = 0 WHERE id = :id");
                $stmt->execute([':id' => $id]);
                jsonResponse(['success' => true, 'message' => 'Performance video removed.']);
            }
            jsonResponse(['success' => false, 'error' => 'Valid ID required.'], 400);
        }

        $title = trim($input['title'] ?? '');
        $performer = trim($input['performer'] ?? 'Vivadoxa Ensemble');
        $program = trim($input['program'] ?? 'General Performance');
        $category = trim($input['category'] ?? 'Concert');
        $youtubeId = trim($input['youtube_id'] ?? '');
        $duration = trim($input['duration'] ?? '3:30');
        $dateLabel = trim($input['date_label'] ?? 'Annual Recital');
        $description = trim($input['description'] ?? '');
        $isFeatured = !empty($input['is_featured']) ? 1 : 0;
        $isShort = !empty($input['is_short']) ? 1 : 0;

        if (empty($title) || empty($youtubeId)) {
            jsonResponse(['success' => false, 'error' => 'Title and YouTube video ID are required.'], 400);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE `performances`
                SET `title` = :title, `performer` = :performer, `program` = :program, `category` = :category,
                    `youtube_id` = :yid, `duration` = :dur, `date_label` = :dt, `description` = :desc,
                    `is_featured` = :feat, `is_short` = :short, `is_active` = 1
                WHERE id = :id
            ");
            $stmt->execute([
                ':title' => $title,
                ':performer' => $performer,
                ':program' => $program,
                ':category' => $category,
                ':yid' => $youtubeId,
                ':dur' => $duration,
                ':dt' => $dateLabel,
                ':desc' => $description,
                ':feat' => $isFeatured,
                ':short' => $isShort,
                ':id' => $id,
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO `performances` (`title`, `performer`, `program`, `category`, `youtube_id`, `duration`, `date_label`, `description`, `is_featured`, `is_short`, `is_active`)
                VALUES (:title, :performer, :program, :category, :yid, :dur, :dt, :desc, :feat, :short, 1)
            ");
            $stmt->execute([
                ':title' => $title,
                ':performer' => $performer,
                ':program' => $program,
                ':category' => $category,
                ':yid' => $youtubeId,
                ':dur' => $duration,
                ':dt' => $dateLabel,
                ':desc' => $description,
                ':feat' => $isFeatured,
                ':short' => $isShort,
            ]);
        }

        jsonResponse(['success' => true, 'message' => 'Performance video saved successfully.']);
    } elseif ($type === 'students') {
        if ($action === 'enroll') {
            $appNo = trim($input['application_no'] ?? '');
            $fullName = trim($input['full_name'] ?? '');
            $email = trim($input['email'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $program = trim($input['program'] ?? 'Piano Performance');
            $cohort = trim($input['cohort'] ?? 'Saturday Cohort A');

            if (empty($fullName) || empty($email)) {
                jsonResponse(['success' => false, 'error' => 'Student name and email are required.'], 400);
            }

            $studentNo = 'VD-' . date('Y') . '-' . str_pad((string)rand(10, 999), 3, '0', STR_PAD_LEFT);

            $stmt = $pdo->prepare("
                INSERT INTO `students` (`student_no`, `application_no`, `full_name`, `email`, `phone`, `program`, `cohort`, `status`)
                VALUES (:sno, :ano, :name, :email, :phone, :prog, :cohort, 'active')
            ");
            $stmt->execute([
                ':sno' => $studentNo,
                ':ano' => $appNo,
                ':name' => $fullName,
                ':email' => $email,
                ':phone' => $phone,
                ':prog' => $program,
                ':cohort' => $cohort,
            ]);

            // If linked to an application, ensure application is marked approved
            if (!empty($appNo)) {
                $upApp = $pdo->prepare("UPDATE `applications` SET `status` = 'approved' WHERE `application_no` = :no");
                $upApp->execute([':no' => $appNo]);
            }

            jsonResponse([
                'success' => true,
                'student_no' => $studentNo,
                'message' => 'Student enrolled successfully.',
            ], 201);
        } elseif ($action === 'update') {
            $id = (int)($input['id'] ?? 0);
            $studentNo = trim($input['student_no'] ?? '');
            $status = trim($input['status'] ?? 'active');
            $cohort = trim($input['cohort'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $email = trim($input['email'] ?? '');
            $program = trim($input['program'] ?? '');

            if ($id <= 0 && empty($studentNo)) {
                jsonResponse(['success' => false, 'error' => 'Student ID or student number is required.'], 400);
            }

            $stmt = $pdo->prepare("
                UPDATE `students`
                SET `status` = :st,
                    `cohort` = CASE WHEN :coh != '' THEN :coh ELSE `cohort` END,
                    `phone` = CASE WHEN :ph != '' THEN :ph ELSE `phone` END,
                    `email` = CASE WHEN :em != '' THEN :em ELSE `email` END,
                    `program` = CASE WHEN :pr != '' THEN :pr ELSE `program` END
                WHERE `id` = :id OR `student_no` = :sno
            ");
            $stmt->execute([
                ':st' => $status,
                ':coh' => $cohort,
                ':ph' => $phone,
                ':em' => $email,
                ':pr' => $program,
                ':id' => $id,
                ':sno' => $studentNo,
            ]);

            jsonResponse(['success' => true, 'message' => 'Student record updated successfully.']);
        } elseif ($action === 'delete') {
            $id = (int)($input['id'] ?? 0);
            if ($id > 0) {
                $stmt = $pdo->prepare("DELETE FROM `students` WHERE id = :id");
                $stmt->execute([':id' => $id]);
                jsonResponse(['success' => true, 'message' => 'Student record removed.']);
            }
            jsonResponse(['success' => false, 'error' => 'Valid student ID required.'], 400);
        }
    } elseif ($type === 'cohorts') {
        $id = (int)($input['id'] ?? 0);

        if ($action === 'delete') {
            if ($id > 0) {
                $stmt = $pdo->prepare("DELETE FROM `cohorts` WHERE id = :id");
                $stmt->execute([':id' => $id]);
                jsonResponse(['success' => true, 'message' => 'Cohort slot deleted.']);
            }
            jsonResponse(['success' => false, 'error' => 'Valid cohort ID required.'], 400);
        }

        $name = trim($input['name'] ?? '');
        $timeSlot = trim($input['time_slot'] ?? '');
        $room = trim($input['room'] ?? 'Studio Room 1');
        $status = trim($input['status'] ?? 'Active');

        if (empty($name) || empty($timeSlot)) {
            jsonResponse(['success' => false, 'error' => 'Cohort name and time slot are required.'], 400);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE `cohorts`
                SET `name` = :name, `time_slot` = :ts, `room` = :rm, `status` = :st
                WHERE `id` = :id
            ");
            $stmt->execute([
                ':name' => $name,
                ':ts' => $timeSlot,
                ':rm' => $room,
                ':st' => $status,
                ':id' => $id,
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO `cohorts` (`name`, `time_slot`, `room`, `status`)
                VALUES (:name, :ts, :rm, :st)
                ON DUPLICATE KEY UPDATE
                    `time_slot` = VALUES(`time_slot`),
                    `room` = VALUES(`room`),
                    `status` = VALUES(`status`)
            ");
            $stmt->execute([
                ':name' => $name,
                ':ts' => $timeSlot,
                ':rm' => $room,
                ':st' => $status,
            ]);
        }

        jsonResponse(['success' => true, 'message' => 'Cohort saved successfully.']);
    }

    jsonResponse(['success' => false, 'error' => 'Invalid academic operation.'], 400);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
