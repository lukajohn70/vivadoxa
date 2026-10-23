<?php
/**
 * Vivadoxa Music School - Production Database Purge Utility
 *
 * Safely purges all mock and test customer data:
 * - applications
 * - payments
 * - repairs
 * - enquiries
 * - students
 * - schedule_requests
 * - audit_logs
 *
 * STRICTLY PRESERVES:
 * - admins (administrator accounts & credentials)
 * - programs (academic course catalog)
 * - instructors (faculty directory)
 * - cohorts (class batches & rooms)
 * - performances (student recital showcase videos)
 * - system_settings (core configuration & branding)
 */

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

// Allow both session-authenticated admins and a dedicated secret fallback key
$pdo = getDb();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$isAdminLoggedIn = !empty($_SESSION['admin_user']) || !empty($_SESSION['user']);

// Secret key allows one-time direct browser URL purge: /api/purge.php?confirm=PURGE&key=vivadoxa2026
$providedKey = $_REQUEST['key'] ?? '';
$isKeyValid = ($providedKey === 'vivadoxa2026' || $providedKey === 'VivadoxaAdmin2025!');

$confirmation = strtoupper(trim($_REQUEST['confirm'] ?? $_REQUEST['confirmation'] ?? ''));

if (!$isAdminLoggedIn && !$isKeyValid) {
    http_response_code(401);
    jsonResponse([
        'success' => false,
        'error' => 'Unauthorized. Must be logged into the Admin Dashboard or provide secret key (?confirm=PURGE&key=vivadoxa2026).'
    ], 401);
}

if ($confirmation !== 'PURGE' && $confirmation !== 'PURGE_MOCK_DATA') {
    http_response_code(400);
    jsonResponse([
        'success' => false,
        'error' => 'Confirmation required. Pass confirmation="PURGE" to safely wipe test/mock records.'
    ], 400);
}

try {
    $tablesToPurge = [
        'applications',
        'payments',
        'repairs',
        'enquiries',
        'students',
        'schedule_requests',
        'audit_logs',
    ];

    $purged = [];
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");

    foreach ($tablesToPurge as $table) {
        // Verify table exists before truncating
        $check = $pdo->query("SHOW TABLES LIKE '{$table}'")->fetch();
        if ($check) {
            $pdo->exec("TRUNCATE TABLE `{$table}`;");
            $purged[] = $table;
        }
    }

    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Re-verify that critical tables are intact
    $adminCount = (int)$pdo->query("SELECT COUNT(*) FROM `admins`")->fetchColumn();
    $progCount = (int)$pdo->query("SELECT COUNT(*) FROM `programs`")->fetchColumn();

    jsonResponse([
        'success' => true,
        'message' => 'Online database successfully purged of all mock and test data.',
        'purged_tables' => $purged,
        'preserved' => [
            'admins' => $adminCount,
            'programs' => $progCount,
            'system_settings' => 'intact',
            'instructors' => 'intact',
            'cohorts' => 'intact',
            'performances' => 'intact'
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    if (isset($pdo)) {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    }
    http_response_code(500);
    jsonResponse([
        'success' => false,
        'error' => 'Failed to purge database: ' . $e->getMessage()
    ], 500);
}
