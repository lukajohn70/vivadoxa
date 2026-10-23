<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];
$type = trim($_GET['type'] ?? 'programs');

if ($method === 'GET') {
    if ($type === 'instructors') {
        $stmt = $pdo->query("SELECT * FROM `instructors` WHERE `is_active` = 1 ORDER BY `is_director` DESC, id ASC");
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
        $fee = trim($input['fee'] ?? '₦35,000 / month');
        $desc = trim($input['desc'] ?? '');
        $ageGroup = trim($input['age_group'] ?? 'All Ages');
        $level = trim($input['level'] ?? 'Beginner');

        if (empty($name)) {
            jsonResponse(['success' => false, 'error' => 'Program name is required.'], 400);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE `programs`
                SET `name` = :name, `category` = :cat, `tag` = :tag, `fee` = :fee, `desc` = :desc,
                    `age_group` = :ag, `level` = :lvl, `is_active` = 1
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
                ':id' => $id,
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO `programs` (`name`, `category`, `tag`, `fee`, `desc`, `age_group`, `level`, `is_active`)
                VALUES (:name, :cat, :tag, :fee, :desc, :ag, :lvl, 1)
                ON DUPLICATE KEY UPDATE
                    `category` = VALUES(`category`),
                    `tag` = VALUES(`tag`),
                    `fee` = VALUES(`fee`),
                    `desc` = VALUES(`desc`),
                    `age_group` = VALUES(`age_group`),
                    `level` = VALUES(`level`),
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
            ]);
        }

        jsonResponse(['success' => true, 'message' => 'Program saved successfully.']);
    } elseif ($type === 'instructors') {
        $id = (int)($input['id'] ?? 0);

        if ($action === 'delete') {
            if ($id > 0) {
                $stmt = $pdo->prepare("UPDATE `instructors` SET `is_active` = 0 WHERE id = :id");
                $stmt->execute([':id' => $id]);
                jsonResponse(['success' => true, 'message' => 'Instructor profile deactivated.']);
            }
            jsonResponse(['success' => false, 'error' => 'Valid ID required.'], 400);
        }

        $name = trim($input['name'] ?? '');
        $title = trim($input['title'] ?? 'Instructor');
        $specialization = trim($input['specialization'] ?? '');
        $location = trim($input['location'] ?? 'Kaduna Studio');
        $bio = trim($input['bio'] ?? '');
        $isDirector = !empty($input['is_director']) ? 1 : 0;

        if (empty($name)) {
            jsonResponse(['success' => false, 'error' => 'Instructor name is required.'], 400);
        }

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE `instructors`
                SET `name` = :name, `title` = :title, `specialization` = :spec, `location` = :loc,
                    `bio` = :bio, `is_director` = :is_dir, `is_active` = 1
                WHERE id = :id
            ");
            $stmt->execute([
                ':name' => $name,
                ':title' => $title,
                ':spec' => $specialization,
                ':loc' => $location,
                ':bio' => $bio,
                ':is_dir' => $isDirector,
                ':id' => $id,
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO `instructors` (`name`, `title`, `specialization`, `location`, `bio`, `is_director`, `is_active`)
                VALUES (:name, :title, :spec, :loc, :bio, :is_dir, 1)
                ON DUPLICATE KEY UPDATE
                    `title` = VALUES(`title`),
                    `specialization` = VALUES(`specialization`),
                    `location` = VALUES(`location`),
                    `bio` = VALUES(`bio`),
                    `is_director` = VALUES(`is_director`),
                    `is_active` = 1
            ");
            $stmt->execute([
                ':name' => $name,
                ':title' => $title,
                ':spec' => $specialization,
                ':loc' => $location,
                ':bio' => $bio,
                ':is_dir' => $isDirector,
            ]);
        }

        jsonResponse(['success' => true, 'message' => 'Instructor profile saved.']);
    } elseif ($type === 'performances') {
        $id = (int)($input['id'] ?? 0);

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
