<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

$defaultStoreProducts = [
    [
        'id' => 'yamaha-acoustic-guitar',
        'name' => 'Yamaha F310 Natural Dreadnought Acoustic Guitar',
        'category' => 'Guitars',
        'image' => '/media/programs/guitar-acoustic-recital.jpeg',
        'brand' => 'Yamaha',
        'badge' => 'Bestseller',
        'inStock' => true,
        'setupNote' => 'Fret leveling, low-action string tension adjustment completed',
        'specs' => ['Spruce top with rosewood fretboard', 'Die-cast chrome tuners', 'Includes padded gig bag & 3 plectrums'],
    ],
    [
        'id' => 'fender-strat-pack',
        'name' => 'Squier by Fender Affinity Stratocaster Electric Guitar',
        'category' => 'Guitars',
        'image' => '/media/programs/guitar-stage-live.jpeg',
        'brand' => 'Fender',
        'badge' => '',
        'inStock' => true,
        'setupNote' => 'Truss rod calibrated, intonation set to standard E tuning',
        'specs' => ['Triple single-coil ceramic pickups', 'Synchronized tremolo bridge', 'Shielded 3-meter instrument cable included'],
    ],
    [
        'id' => 'conservatory-violin-outfit',
        'name' => 'Vivadoxa Master Handcrafted Soloist Violin (4/4 & 3/4)',
        'category' => 'Strings',
        'image' => '/media/programs/violin-solo-rainbow.jpeg',
        'brand' => 'Vivadoxa Atelier',
        'badge' => 'Faculty Choice',
        'inStock' => true,
        'setupNote' => 'Bridge carved to correct radius, ebony pegs lubricated with Hill compound',
        'specs' => ['Seasoned spruce soundboard & flamed maple back', 'Brazilwood octagonal horsehair bow', 'Lightweight triangular foam case with hygrometer'],
    ],
    [
        'id' => 'yamaha-psr-keyboard',
        'name' => 'Yamaha PSR-E373 61-Key Touch-Sensitive Portable Keyboard',
        'category' => 'Keys',
        'image' => '/media/programs/piano-recital-mastery.jpeg',
        'brand' => 'Yamaha',
        'badge' => 'Popular',
        'inStock' => true,
        'setupNote' => 'Firmware updated, power adapter & key contacts verified',
        'specs' => ['622 authentic instrument voices with Super Articulation Lite', 'Keys touch response for expressive dynamics', 'USB-to-HOST audio & MIDI recording interface'],
    ],
    [
        'id' => 'eb-alto-sax',
        'name' => 'Jean Paul USA / Vivadoxa Eb Intermediate Alto Saxophone',
        'category' => 'Woodwinds',
        'image' => '/media/programs/saxophone-solo-stage.jpeg',
        'brand' => 'Jean Paul / Vivadoxa',
        'badge' => 'Conservatory Grade',
        'inStock' => true,
        'setupNote' => 'All pads vacuum tested for 100% airtight seal; key heights regulated',
        'specs' => ['Golden brass lacquered body with engraved bell', 'Rico 2.5 reed starter pack & neck strap', 'Deluxe contoured hard case with backpack straps'],
    ],
    [
        'id' => 'silver-flute',
        'name' => 'Eastman / Vivadoxa Nickel Silver C Flute with Split-E',
        'category' => 'Woodwinds',
        'image' => '/media/programs/flute-practice-hall.jpeg',
        'brand' => 'Eastman',
        'badge' => '',
        'inStock' => true,
        'setupNote' => 'Headjoint cork seal tested and adjusted for effortless upper octave',
        'specs' => ['Closed-hole plateau keys with Italian leather pads', 'Split-E mechanism for easier high E resonance', 'Includes French plush case and wood cleaning rod'],
    ],
    [
        'id' => 'student-trumpet-bb',
        'name' => 'Bach Prelude Bb Student Brass Trumpet',
        'category' => 'Brass',
        'image' => '/media/programs/trumpet-brass-mastery.jpeg',
        'brand' => 'Bach Prelude',
        'badge' => '',
        'inStock' => true,
        'setupNote' => 'Monel valves hand-lapped with fast valve oil; slides aligned',
        'specs' => ['0.459" medium-large bore with yellow brass bell', 'Genuine Vincent Bach 7C mouthpiece', 'Heavy-duty canvas molded protective case'],
    ],
    [
        'id' => 'tama-stage-drums',
        'name' => 'TAMA Imperialstar 5-Piece Complete Drum Kit',
        'category' => 'Percussion',
        'image' => '/media/programs/drums-contemporary-groove.jpeg',
        'brand' => 'TAMA',
        'badge' => '',
        'inStock' => true,
        'setupNote' => 'Bearing edges checked, heads seated and tuned to pitch',
        'specs' => ['100% poplar shells with Stage Master double-braced hardware', 'Meinl HCS German brass cymbal set (14" HH, 16" Crash, 20" Ride)', 'Iron Cobra 200 bass drum pedal and drum throne included'],
    ],
    [
        'id' => 'yoruba-talking-drum',
        'name' => 'Authentic Hand-Carved Nigerian Gangan Talking Drum',
        'category' => 'Percussion',
        'image' => '/media/programs/talking-drums-heritage.jpeg',
        'brand' => 'Heritage Art',
        'badge' => '',
        'inStock' => true,
        'setupNote' => 'Goat skin heads tensioned with genuine leather tuning thongs',
        'specs' => ['Solid hardwood shell with high pitch flexibility', 'Includes curved traditional wooden beater', 'Carrying shoulder strap'],
    ],
    [
        'id' => 'daddario-strings-pack',
        'name' => "D'Addario EJ16 Phosphor Bronze Acoustic Guitar Strings",
        'category' => 'Accessories',
        'image' => '/media/programs/guitar-acoustic-recital.jpeg',
        'brand' => "D'Addario USA",
        'badge' => 'Essential',
        'inStock' => true,
        'setupNote' => 'Factory sealed in corrosion-intercept foil pack',
        'specs' => ['Light gauge (12-53) for balanced warm acoustic tone', 'Corrosion resistant packaging', 'Preferred by Vivadoxa guitar faculty'],
    ],
    [
        'id' => 'vandoren-reeds-sax',
        'name' => 'Vandoren Traditional Eb Alto Saxophone Reeds (Box of 10)',
        'category' => 'Accessories',
        'image' => '/media/programs/saxophone-solo-stage.jpeg',
        'brand' => 'Vandoren Paris',
        'badge' => 'French Import',
        'inStock' => true,
        'setupNote' => "Individually sealed in humidity-controlled 'Flow Pack'",
        'specs' => ['Strength 2.0 / 2.5 / 3.0 available', 'Excellent response in all registers', 'Pure tone and flexibility'],
    ],
    [
        'id' => 'pirastro-rosin',
        'name' => 'Pirastro Goldflex Violin Rosin with Gold Spec Particles',
        'category' => 'Accessories',
        'image' => '/media/programs/violin-solo-rainbow.jpeg',
        'brand' => 'Pirastro Germany',
        'badge' => '',
        'inStock' => true,
        'setupNote' => 'Mounted on satin cloth with plastic grip',
        'specs' => ['Infused with fine gold powder for smooth grip', 'Reduces dust emission and enhances bow clarity', 'Suitable for violin, viola, and cello'],
    ],
];

$defaultRentalItems = [
    [
        'id' => 'violin',
        'name' => 'Student Conservatory Violin Outfit (1/2, 3/4, 4/4)',
        'category' => 'Strings',
        'type' => 'student',
        'image' => '/media/programs/violin-solo-rainbow.jpeg',
        'recommendedFor' => 'Beginner & Intermediate strings scholars',
        'inStock' => true,
        'inclusions' => [
            'Fitted wooden bow & organic rosin',
            'Padded lightweight hard foam case with backpack straps',
            'Shoulder rest & fine-tuners on all 4 strings',
            'Pre-delivery bridge inspection & peg lubrication',
        ],
    ],
    [
        'id' => 'keyboard',
        'name' => '61-Key Touch-Sensitive Student Keyboard',
        'category' => 'Keys',
        'type' => 'student',
        'image' => '/media/programs/piano-recital-mastery.jpeg',
        'recommendedFor' => 'Piano syllabus practice, ear training & theory',
        'inStock' => true,
        'inclusions' => [
            'Sturdy X-frame foldable keyboard stand',
            'Heavy-duty power adapter & music rest',
            'Sustain pedal unit included',
            'Headphone output jack for quiet home practice',
        ],
    ],
    [
        'id' => 'acoustic-guitar',
        'name' => 'Classical Nylon & Folk Acoustic Guitar',
        'category' => 'Guitars',
        'type' => 'student',
        'image' => '/media/programs/guitar-acoustic-recital.jpeg',
        'recommendedFor' => 'Fingerpicking, classical posture & pop chords',
        'inStock' => true,
        'inclusions' => [
            'Water-resistant padded gig bag',
            'Digital clip-on chromatic tuner',
            'Spare high-E string & guitar plectrums',
            'Low-action fret setup for comfortable learning',
        ],
    ],
    [
        'id' => 'alto-sax',
        'name' => 'Eb Alto Saxophone (Lacquered Brass)',
        'category' => 'Woodwinds',
        'type' => 'student',
        'image' => '/media/programs/saxophone-solo-stage.jpeg',
        'recommendedFor' => 'Wind players, band members & soloists',
        'inStock' => true,
        'inclusions' => [
            'Ergonomic mouthpiece, ligature & protective cap',
            'Padded neck strap & cork grease tube',
            'Cleaning pull-through swab & reeds starter pack',
            'Hard flight case with plush velvet lining',
        ],
    ],
    [
        'id' => 'flute',
        'name' => 'C Concert Concert Flute (Silver Plated)',
        'category' => 'Woodwinds',
        'type' => 'student',
        'image' => '/media/programs/flute-practice-hall.jpeg',
        'recommendedFor' => 'Classical repertoire, breath control & orchestra',
        'inStock' => true,
        'inclusions' => [
            'Precision-aligned split-E mechanism & offset-G key',
            'Hard protective case & cleaning rod',
            'Microfiber polishing cloth',
            'Pad leak test and lubrication completed',
        ],
    ],
    [
        'id' => 'trumpet',
        'name' => 'Bb Standard Student Trumpet',
        'category' => 'Brass',
        'type' => 'student',
        'image' => '/media/programs/trumpet-brass-mastery.jpeg',
        'recommendedFor' => 'Brass fundamentals, embouchure & ensemble playing',
        'inStock' => true,
        'inclusions' => [
            'Standard 7C brass mouthpiece',
            'Smooth Monel piston valves with valve oil bottle',
            'Durable molded case with dual carry handles',
            'Slide tuning grease and maintenance guide',
        ],
    ],
    [
        'id' => 'pa-system',
        'name' => 'Active Concert PA System (2x Tops + Subwoofer)',
        'category' => 'PA & Sound',
        'type' => 'event',
        'image' => '/media/programs/studio-mixing-console.jpeg',
        'recommendedFor' => 'Church crusades, live outdoor concerts, wedding banquets',
        'inStock' => true,
        'inclusions' => [
            'Up to 2,000 Watts RMS clean sound dispersion',
            'Bluetooth & XLR/TRS multi-channel live mixer included',
            'Heavy-duty tripod speaker stands & power distribution cabling',
            'On-site sound technician setup available on request',
        ],
    ],
    [
        'id' => 'drum-kit',
        'name' => '5-Piece Stage Drum Kit & Heavy Hardware Pack',
        'category' => 'Backline',
        'type' => 'event',
        'image' => '/media/programs/drums-contemporary-groove.jpeg',
        'recommendedFor' => 'Concerts, youth rallies, music video shoots & recitals',
        'inStock' => true,
        'inclusions' => [
            'Bass drum, 2 rack toms, 1 floor tom, 14-inch snare drum',
            'Complete cymbal set: 14" hi-hats, 16" crash, 20" ride',
            'Heavy double-braced boom stands, kick pedal & drum throne',
            'Acoustic dampening gel rings for balanced live tone',
        ],
    ],
    [
        'id' => 'bass-amp',
        'name' => '300W Bass Combo & Stage Guitar Amplifier Rig',
        'category' => 'Backline',
        'type' => 'event',
        'image' => '/media/programs/bass-groove-mastery.jpeg',
        'recommendedFor' => 'Ensemble rehearsals, church guest bands & stage live backline',
        'inStock' => true,
        'inclusions' => [
            'Punchy 15-inch neodymium speaker with balanced XLR direct out',
            '4-band active EQ with ultra-low & bright boost switches',
            'Road-ready reinforced cabinet with recessed carry handles',
            'Instrument shielded patch cables included',
        ],
    ],
    [
        'id' => 'stage-piano',
        'name' => '88-Key Weighted Action Stage Piano & Synthesizer',
        'category' => 'Keys',
        'type' => 'event',
        'image' => '/media/programs/piano-recital-mastery.jpeg',
        'recommendedFor' => 'Classical recitals, worship conferences & corporate galas',
        'inStock' => true,
        'inclusions' => [
            'Graded hammer action keys replicating acoustic grand touch',
            'Stereo balanced outputs, expression & sustain pedal unit',
            'Double-X heavy duty stage stand & padded flight transport case',
            'Preloaded concert grand, electric pianos, strings & organ patches',
        ],
    ],
];

// Helper to get store products from system_settings
function getCatalogStoreProducts(array $defaults): array {
    $saved = getSystemSetting('store_catalog_items', null);
    if (!is_array($saved) || empty($saved)) {
        saveSystemSetting('store_catalog_items', $defaults);
        return $defaults;
    }
    return $saved;
}

// Helper to get rental items from system_settings
function getCatalogRentalItems(array $defaults): array {
    $saved = getSystemSetting('rental_catalog_items', null);
    if (!is_array($saved) || empty($saved)) {
        saveSystemSetting('rental_catalog_items', $defaults);
        return $defaults;
    }
    return $saved;
}

if ($method === 'GET') {
    $type = trim($_GET['type'] ?? 'all');

    if ($type === 'store') {
        $products = getCatalogStoreProducts($defaultStoreProducts);
        jsonResponse(['success' => true, 'products' => $products]);
    } elseif ($type === 'rentals') {
        $rentals = getCatalogRentalItems($defaultRentalItems);
        jsonResponse(['success' => true, 'rentals' => $rentals]);
    } else {
        $products = getCatalogStoreProducts($defaultStoreProducts);
        $rentals = getCatalogRentalItems($defaultRentalItems);
        jsonResponse([
            'success' => true,
            'products' => $products,
            'rentals' => $rentals,
        ]);
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    // ── STORE MANAGEMENT ──────────────────────────────────────────
    if ($action === 'save_store_item') {
        $item = $input['item'] ?? $input;
        if (empty($item['name']) || empty($item['category'])) {
            jsonResponse(['success' => false, 'error' => 'Product name and category are required.'], 400);
        }

        $products = getCatalogStoreProducts($defaultStoreProducts);
        $id = !empty($item['id']) ? trim($item['id']) : 'item-' . time() . '-' . rand(100, 999);
        $item['id'] = $id;
        $item['inStock'] = isset($item['inStock']) ? (bool)$item['inStock'] : true;
        if (empty($item['specs']) || !is_array($item['specs'])) {
            $item['specs'] = is_string($item['specs'] ?? '') ? array_filter(array_map('trim', explode("\n", $item['specs']))) : [];
        }

        $found = false;
        foreach ($products as $idx => $p) {
            if ($p['id'] === $id) {
                $products[$idx] = array_merge($p, $item);
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($products, $item);
        }

        saveSystemSetting('store_catalog_items', $products);
        jsonResponse([
            'success' => true,
            'message' => 'Product saved successfully to shop showcase.',
            'product' => $item,
            'products' => $products,
        ]);
    } elseif ($action === 'delete_store_item') {
        $id = trim($input['id'] ?? '');
        if (!$id) {
            jsonResponse(['success' => false, 'error' => 'Product ID is required.'], 400);
        }

        $products = getCatalogStoreProducts($defaultStoreProducts);
        $filtered = array_values(array_filter($products, function($p) use ($id) {
            return $p['id'] !== $id;
        }));

        saveSystemSetting('store_catalog_items', $filtered);
        jsonResponse([
            'success' => true,
            'message' => 'Product removed from showcase.',
            'products' => $filtered,
        ]);
    } elseif ($action === 'toggle_store_stock') {
        $id = trim($input['id'] ?? '');
        $products = getCatalogStoreProducts($defaultStoreProducts);
        foreach ($products as $idx => $p) {
            if ($p['id'] === $id) {
                $products[$idx]['inStock'] = !$products[$idx]['inStock'];
                break;
            }
        }

        saveSystemSetting('store_catalog_items', $products);
        jsonResponse([
            'success' => true,
            'message' => 'Stock status updated.',
            'products' => $products,
        ]);
    }

    // ── RENTAL MANAGEMENT ─────────────────────────────────────────
    elseif ($action === 'save_rental_item') {
        $item = $input['item'] ?? $input;
        if (empty($item['name']) || empty($item['category'])) {
            jsonResponse(['success' => false, 'error' => 'Rental item name and category are required.'], 400);
        }

        $rentals = getCatalogRentalItems($defaultRentalItems);
        $id = !empty($item['id']) ? trim($item['id']) : 'rental-' . time() . '-' . rand(100, 999);
        $item['id'] = $id;
        $item['inStock'] = isset($item['inStock']) ? (bool)$item['inStock'] : true;
        if (empty($item['inclusions']) || !is_array($item['inclusions'])) {
            $item['inclusions'] = is_string($item['inclusions'] ?? '') ? array_filter(array_map('trim', explode("\n", $item['inclusions']))) : [];
        }

        $found = false;
        foreach ($rentals as $idx => $r) {
            if ($r['id'] === $id) {
                $rentals[$idx] = array_merge($r, $item);
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($rentals, $item);
        }

        saveSystemSetting('rental_catalog_items', $rentals);
        jsonResponse([
            'success' => true,
            'message' => 'Rental equipment saved successfully.',
            'rental' => $item,
            'rentals' => $rentals,
        ]);
    } elseif ($action === 'delete_rental_item') {
        $id = trim($input['id'] ?? '');
        if (!$id) {
            jsonResponse(['success' => false, 'error' => 'Rental item ID is required.'], 400);
        }

        $rentals = getCatalogRentalItems($defaultRentalItems);
        $filtered = array_values(array_filter($rentals, function($r) use ($id) {
            return $r['id'] !== $id;
        }));

        saveSystemSetting('rental_catalog_items', $filtered);
        jsonResponse([
            'success' => true,
            'message' => 'Rental gear removed from fleet.',
            'rentals' => $filtered,
        ]);
    } elseif ($action === 'toggle_rental_stock') {
        $id = trim($input['id'] ?? '');
        $rentals = getCatalogRentalItems($defaultRentalItems);
        foreach ($rentals as $idx => $r) {
            if ($r['id'] === $id) {
                $rentals[$idx]['inStock'] = !$rentals[$idx]['inStock'];
                break;
            }
        }

        saveSystemSetting('rental_catalog_items', $rentals);
        jsonResponse([
            'success' => true,
            'message' => 'Rental availability updated.',
            'rentals' => $rentals,
        ]);
    }

    // ── RESET TO DEFAULTS ─────────────────────────────────────────
    elseif ($action === 'reset_catalog') {
        saveSystemSetting('store_catalog_items', $defaultStoreProducts);
        saveSystemSetting('rental_catalog_items', $defaultRentalItems);
        jsonResponse([
            'success' => true,
            'message' => 'Catalog reset to standard showroom inventory.',
            'products' => $defaultStoreProducts,
            'rentals' => $defaultRentalItems,
        ]);
    } else {
        jsonResponse(['success' => false, 'error' => 'Invalid catalog action.'], 400);
    }
}
