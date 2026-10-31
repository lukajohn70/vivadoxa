<?php
// ─── Vivadoxa Music Academy — Gallery API Endpoint ─────────────────────────────
// Supports listing, saving, updating, deleting, reordering, and uploading photos.
// Persists in MySQL (with fallback to local gallery_data.json).

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

// ── Database connection helper (graceful fallback if offline) ────────────────
function getSafeDb(): ?PDO {
    static $pdo = null;
    static $attempted = false;
    if ($attempted) return $pdo;
    $attempted = true;

    $host = getEnvVar('DB_HOST', '127.0.0.1');
    $port = (int)getEnvVar('DB_PORT', '3306');
    $dbname = getEnvVar('DB_NAME', 'vivadoxa');
    $user = getEnvVar('DB_USER', 'root');
    $pass = getEnvVar('DB_PASS', 'root');
    $socket = getEnvVar('DB_SOCKET', '/Applications/MAMP/tmp/mysql/mysql.sock');

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => true,
    ];

    try {
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $pass, $options);
        return $pdo;
    } catch (Exception $e) {
        if (file_exists($socket)) {
            try {
                $pdo = new PDO("mysql:unix_socket=$socket;dbname=$dbname;charset=utf8mb4", $user, $pass, $options);
                return $pdo;
            } catch (Exception $e2) {}
        }
    }
    return null;
}

$pdo = getSafeDb();

$dataFile = __DIR__ . '/gallery_data.json';
$uploadDir = dirname(__DIR__) . '/public/media/gallery';

$defaultGalleryItems = [
    [
        'id' => 'gal-1',
        'title' => 'Youth Alto Saxophone Soloist',
        'category' => 'Brass & Woodwinds',
        'caption' => 'Junior scholar demonstrating breath control, embouchure, and tone production on the alto saxophone during masterclass.',
        'image' => '/media/gallery/gallery-01-youth-saxophone.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 1
    ],
    [
        'id' => 'gal-2',
        'title' => 'Vocal & Yamaha Keyboard Performance',
        'category' => 'Piano & Keys',
        'caption' => 'Scholar accompanying himself on the Yamaha arranger workstation while performing contemporary vocals.',
        'image' => '/media/gallery/gallery-02-keyboard-vocals-boy.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 2
    ],
    [
        'id' => 'gal-3',
        'title' => 'Young Pianist & Vocal Soloist',
        'category' => 'Piano & Keys',
        'caption' => 'Expressive vocal recital and two-handed keyboard accompaniment showcasing melody-harmony coordination.',
        'image' => '/media/gallery/gallery-03-keyboard-vocals-girl.jpeg',
        'featured' => false,
        'date' => 'October 2026',
        'sort_order' => 3
    ],
    [
        'id' => 'gal-4',
        'title' => 'Recital Hall & Community Audience',
        'category' => 'Community & Recitals',
        'caption' => 'Proud parents, families, and music enthusiasts gathered to cheer Vivadoxa scholars at the academy recital showcase.',
        'image' => '/media/gallery/gallery-04-recital-audience-community.jpeg',
        'featured' => false,
        'date' => 'October 2026',
        'sort_order' => 4
    ],
    [
        'id' => 'gal-5',
        'title' => 'Full Live Youth Ensemble & Directing',
        'category' => 'Ensembles & Bands',
        'caption' => 'Director-led academy ensemble masterclass featuring brass, keys, drums, electric bass, and student vocalists in live unison.',
        'image' => '/media/gallery/gallery-05-full-ensemble-masterclass.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 5
    ],
    [
        'id' => 'gal-6',
        'title' => 'Saxophone Section & Groove Rhythm Section',
        'category' => 'Brass & Woodwinds',
        'caption' => 'Dual saxophone section synchronizing melodic motifs backed by solid electric bass groove and acoustic drums.',
        'image' => '/media/gallery/gallery-06-sax-and-bass-band.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 6
    ],
    [
        'id' => 'gal-7',
        'title' => 'Conservatory Violin Technique',
        'category' => 'Strings & Violin',
        'caption' => 'Scholar executing graded violin repertoire with focused bow hold, chin-rest alignment, and intonation precision.',
        'image' => '/media/gallery/gallery-07-violin-student-recital.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 7
    ],
    [
        'id' => 'gal-8',
        'title' => 'Community Worship & Vocal Showcase',
        'category' => 'Community & Recitals',
        'caption' => 'Audience and parent participation during uplifting vocal performance at the music conservatory hall.',
        'image' => '/media/gallery/gallery-08-community-vocals-showcase.jpeg',
        'featured' => false,
        'date' => 'October 2026',
        'sort_order' => 8
    ],
    [
        'id' => 'gal-9',
        'title' => 'Early Childhood Keys Lab',
        'category' => 'Piano & Keys',
        'caption' => 'Young scholar developing finger dexterity, ear training, and keyboard geography on digital workstation.',
        'image' => '/media/gallery/gallery-09-early-childhood-piano.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 9
    ],
    [
        'id' => 'gal-10',
        'title' => 'Solo Violin Recital Presentation',
        'category' => 'Strings & Violin',
        'caption' => 'Graded string candidate performing classical repertoire with poised stage confidence.',
        'image' => '/media/gallery/gallery-10-violin-solo-performance.jpeg',
        'featured' => false,
        'date' => 'October 2026',
        'sort_order' => 10
    ],
    [
        'id' => 'gal-11',
        'title' => 'Executive Adult Saxophone Masterclass',
        'category' => 'Brass & Woodwinds',
        'caption' => 'Adult learner mastering melodic phrasing and jazz embellishments in Vivadoxa\'s flexible executive program.',
        'image' => '/media/gallery/gallery-11-adult-saxophone-mastery.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 11
    ],
    [
        'id' => 'gal-12',
        'title' => 'Singer-Songwriter Acoustic Guitar Set',
        'category' => 'Guitars',
        'caption' => 'Acoustic scholar playing fingerstyle and chord progressions while delivering lead vocals before the Vivadoxa banner.',
        'image' => '/media/gallery/gallery-12-acoustic-guitar-vocalist.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 12
    ],
    [
        'id' => 'gal-13',
        'title' => 'Youth Acoustic-Electric Guitarist',
        'category' => 'Guitars',
        'caption' => 'Young guitarist demonstrating rhythmic strumming and pick control in live workshop.',
        'image' => '/media/gallery/gallery-13-youth-guitar-performer.jpeg',
        'featured' => false,
        'date' => 'October 2026',
        'sort_order' => 13
    ],
    [
        'id' => 'gal-14',
        'title' => 'Concert Digital Piano Recital',
        'category' => 'Piano & Keys',
        'caption' => 'Young prodigy scholar delivering expressive piano solo with dynamic touch.',
        'image' => '/media/gallery/gallery-14-classical-piano-recital.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 14
    ],
    [
        'id' => 'gal-15',
        'title' => 'Drum Kit Rhythm Lab & Time-Keeping',
        'category' => 'Drums & Rhythm',
        'caption' => 'Rhythm student mastering four-way limb independence, backbeats, and dynamic groove on the Yamaha acoustic kit.',
        'image' => '/media/gallery/gallery-15-drum-kit-rhythm-lab.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 15
    ],
    [
        'id' => 'gal-16',
        'title' => 'Synchronized Keyboard Lab Class',
        'category' => 'Piano & Keys',
        'caption' => 'Group keyboard laboratory where scholars learn sight-reading, scale drills, and multi-part ensemble arrangements.',
        'image' => '/media/gallery/gallery-16-keyboard-lab-group-class.jpeg',
        'featured' => true,
        'date' => 'October 2026',
        'sort_order' => 16
    ]
];

// Helper to get gallery items
function getGalleryItems(array $defaults, string $dataFile): array {
    // 1. Try DB setting first if available
    try {
        $pdo = getSafeDb();
        if ($pdo) {
            $stmt = $pdo->prepare("SELECT `setting_value` FROM `system_settings` WHERE `setting_key` = 'gallery_showcase_items' LIMIT 1");
            $stmt->execute();
            $val = $stmt->fetchColumn();
            if ($val !== false && $val !== null) {
                $decoded = json_decode($val, true);
                if (is_array($decoded) && !empty($decoded)) {
                    return $decoded;
                }
            }
        }
    } catch (Exception $e) {}

    // 2. Try JSON file next
    if (file_exists($dataFile)) {
        $content = @file_get_contents($dataFile);
        if ($content) {
            $decoded = json_decode($content, true);
            if (is_array($decoded) && !empty($decoded)) {
                return $decoded;
            }
        }
    }

    // 3. Save defaults to file and system settings
    saveGalleryItems($defaults, $dataFile);
    return $defaults;
}

// Helper to save gallery items
function saveGalleryItems(array $items, string $dataFile): bool {
    // Save to JSON file
    @file_put_contents($dataFile, json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    // Also attempt saving to DB
    try {
        $pdo = getSafeDb();
        if ($pdo) {
            $stmt = $pdo->prepare("
                INSERT INTO `system_settings` (`setting_key`, `setting_value`)
                VALUES ('gallery_showcase_items', :v)
                ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)
            ");
            $stmt->execute([':v' => json_encode($items, JSON_UNESCAPED_SLASHES)]);
        }
    } catch (Exception $e) {}

    return true;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $items = getGalleryItems($defaultGalleryItems, $dataFile);
    $category = trim($_GET['category'] ?? '');
    $featured = isset($_GET['featured']) ? filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) : null;

    if ($category && strtolower($category) !== 'all') {
        $items = array_values(array_filter($items, function($item) use ($category) {
            return strcasecmp($item['category'] ?? '', $category) === 0;
        }));
    }

    if ($featured !== null) {
        $items = array_values(array_filter($items, function($item) use ($featured) {
            return !empty($item['featured']) === $featured;
        }));
    }

    jsonResponse([
        'success' => true,
        'items' => $items,
        'total' => count($items)
    ]);
} elseif ($method === 'POST') {
    // Check if multipart/form-data upload
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        $fileTmp = $_FILES['photo']['tmp_name'];
        $origName = basename($_FILES['photo']['name']);
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!in_array($ext, $allowedExts)) {
            jsonResponse(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, WEBP and GIF are allowed.'], 400);
        }

        $safeName = 'gallery-' . time() . '-' . rand(100, 999) . '.' . $ext;
        $destPath = $uploadDir . '/' . $safeName;

        if (move_uploaded_file($fileTmp, $destPath)) {
            $webUrl = '/media/gallery/' . $safeName;
            jsonResponse([
                'success' => true,
                'message' => 'Photo uploaded successfully.',
                'image_url' => $webUrl,
                'filename' => $safeName
            ]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Failed to save uploaded file.'], 500);
        }
    }

    $input = getJsonInput();
    $action = trim($input['action'] ?? 'save_item');

    $items = getGalleryItems($defaultGalleryItems, $dataFile);

    if ($action === 'save_item') {
        $item = $input['item'] ?? $input;
        if (empty($item['title'])) {
            jsonResponse(['success' => false, 'error' => 'Photo title is required.'], 400);
        }
        if (empty($item['image'])) {
            jsonResponse(['success' => false, 'error' => 'Photo image is required.'], 400);
        }

        $id = !empty($item['id']) ? trim($item['id']) : 'gal-' . time() . '-' . rand(100, 999);
        $item['id'] = $id;
        $item['category'] = !empty($item['category']) ? trim($item['category']) : 'Ensembles & Bands';
        $item['caption'] = !empty($item['caption']) ? trim($item['caption']) : '';
        $item['featured'] = !empty($item['featured']);
        $item['date'] = !empty($item['date']) ? trim($item['date']) : date('F Y');
        $item['sort_order'] = isset($item['sort_order']) ? (int)$item['sort_order'] : (count($items) + 1);

        $found = false;
        foreach ($items as $idx => $existing) {
            if ($existing['id'] === $id) {
                $items[$idx] = array_merge($existing, $item);
                $found = true;
                break;
            }
        }

        if (!$found) {
            array_unshift($items, $item);
        }

        saveGalleryItems($items, $dataFile);

        jsonResponse([
            'success' => true,
            'message' => 'Gallery photo saved successfully.',
            'item' => $item,
            'items' => $items
        ]);
    } elseif ($action === 'delete_item') {
        $id = trim($input['id'] ?? '');
        if (!$id) {
            jsonResponse(['success' => false, 'error' => 'Photo ID is required.'], 400);
        }

        $items = array_values(array_filter($items, function($item) use ($id) {
            return $item['id'] !== $id;
        }));

        saveGalleryItems($items, $dataFile);

        jsonResponse([
            'success' => true,
            'message' => 'Photo removed from gallery.',
            'items' => $items
        ]);
    } elseif ($action === 'toggle_featured') {
        $id = trim($input['id'] ?? '');
        $newVal = false;
        foreach ($items as $idx => $item) {
            if ($item['id'] === $id) {
                $items[$idx]['featured'] = empty($items[$idx]['featured']);
                $newVal = $items[$idx]['featured'];
                break;
            }
        }

        saveGalleryItems($items, $dataFile);

        jsonResponse([
            'success' => true,
            'message' => $newVal ? 'Marked as featured photo.' : 'Removed from featured.',
            'items' => $items
        ]);
    } elseif ($action === 'reorder') {
        $order = $input['order'] ?? []; // array of IDs
        if (is_array($order) && !empty($order)) {
            $indexed = [];
            foreach ($items as $item) {
                $indexed[$item['id']] = $item;
            }
            $reordered = [];
            $pos = 1;
            foreach ($order as $id) {
                if (isset($indexed[$id])) {
                    $item = $indexed[$id];
                    $item['sort_order'] = $pos++;
                    $reordered[] = $item;
                    unset($indexed[$id]);
                }
            }
            // Append any unlisted
            foreach ($indexed as $item) {
                $item['sort_order'] = $pos++;
                $reordered[] = $item;
            }
            $items = $reordered;
            saveGalleryItems($items, $dataFile);
        }

        jsonResponse([
            'success' => true,
            'message' => 'Gallery reordered successfully.',
            'items' => $items
        ]);
    } elseif ($action === 'reset_defaults') {
        saveGalleryItems($defaultGalleryItems, $dataFile);
        jsonResponse([
            'success' => true,
            'message' => 'Gallery reset to initial photos.',
            'items' => $defaultGalleryItems
        ]);
    } else {
        jsonResponse(['success' => false, 'error' => 'Unknown action: ' . $action], 400);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
