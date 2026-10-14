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
        $stmt = $pdo->query("SELECT * FROM `performances` WHERE `is_active` = 1 ORDER BY `is_featured` DESC, id DESC");
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
        $name = trim($input['name'] ?? '');
        $category = trim($input['category'] ?? 'Instruments');
        $tag = trim($input['tag'] ?? 'Featured');
        $fee = trim($input['fee'] ?? '₦85,000 / term');
        $desc = trim($input['desc'] ?? '');
        $ageGroup = trim($input['age_group'] ?? 'All Ages');
        $level = trim($input['level'] ?? 'Beginner');

        if (empty($name)) {
            jsonResponse(['success' => false, 'error' => 'Program name is required.'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `programs` (`name`, `category`, `tag`, `fee`, `desc`, `age_group`, `level`)
            VALUES (:name, :cat, :tag, :fee, :desc, :ag, :lvl)
            ON DUPLICATE KEY UPDATE
                `category` = VALUES(`category`),
                `tag` = VALUES(`tag`),
                `fee` = VALUES(`fee`),
                `desc` = VALUES(`desc`),
                `age_group` = VALUES(`age_group`),
                `level` = VALUES(`level`)
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

        jsonResponse(['success' => true, 'message' => 'Program saved successfully.']);
    } elseif ($type === 'instructors') {
        $name = trim($input['name'] ?? '');
        $title = trim($input['title'] ?? 'Instructor');
        $specialization = trim($input['specialization'] ?? '');
        $location = trim($input['location'] ?? 'Kaduna Studio');
        $bio = trim($input['bio'] ?? '');
        $isDirector = !empty($input['is_director']) ? 1 : 0;

        if (empty($name)) {
            jsonResponse(['success' => false, 'error' => 'Instructor name is required.'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `instructors` (`name`, `title`, `specialization`, `location`, `bio`, `is_director`)
            VALUES (:name, :title, :spec, :loc, :bio, :is_dir)
            ON DUPLICATE KEY UPDATE
                `title` = VALUES(`title`),
                `specialization` = VALUES(`specialization`),
                `location` = VALUES(`location`),
                `bio` = VALUES(`bio`),
                `is_director` = VALUES(`is_director`)
        ");
        $stmt->execute([
            ':name' => $name,
            ':title' => $title,
            ':spec' => $specialization,
            ':loc' => $location,
            ':bio' => $bio,
            ':is_dir' => $isDirector,
        ]);

        jsonResponse(['success' => true, 'message' => 'Instructor profile saved.']);
    } elseif ($type === 'performances') {
        if ($action === 'delete') {
            $id = (int)($input['id'] ?? 0);
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

        if (empty($title) || empty($youtubeId)) {
            jsonResponse(['success' => false, 'error' => 'Title and YouTube video ID are required.'], 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO `performances` (`title`, `performer`, `program`, `category`, `youtube_id`, `duration`, `date_label`, `description`, `is_featured`, `is_active`)
            VALUES (:title, :performer, :program, :category, :yid, :dur, :dt, :desc, :feat, 1)
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
        ]);

        jsonResponse(['success' => true, 'message' => 'Performance video added successfully.']);
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
        }
    }

    jsonResponse(['success' => false, 'error' => 'Invalid academic operation.'], 400);
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
