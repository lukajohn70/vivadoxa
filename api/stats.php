<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();

try {
    $totalApplications = (int)$pdo->query("SELECT COUNT(*) FROM `applications`")->fetchColumn();
    $pendingApplications = (int)$pdo->query("SELECT COUNT(*) FROM `applications` WHERE status = 'pending'")->fetchColumn();
    $acceptedApplications = (int)$pdo->query("SELECT COUNT(*) FROM `applications` WHERE status = 'approved'")->fetchColumn();

    $pendingPayments = (int)$pdo->query("SELECT COUNT(*) FROM `payments` WHERE status = 'pending'")->fetchColumn();
    $totalRevenue = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM `payments` WHERE status = 'verified'")->fetchColumn();

    $activeRepairs = (int)$pdo->query("SELECT COUNT(*) FROM `repairs` WHERE status NOT IN ('ready', 'collected')")->fetchColumn();
    $unreadEnquiries = (int)$pdo->query("SELECT COUNT(*) FROM `enquiries` WHERE is_read = 0")->fetchColumn();

    jsonResponse([
        'success' => true,
        'stats' => [
            'total_applications' => $totalApplications,
            'pending_applications' => $pendingApplications,
            'accepted_applications' => $acceptedApplications,
            'pending_payments' => $pendingPayments,
            'total_revenue' => $totalRevenue,
            'formatted_revenue' => '₦' . number_format($totalRevenue, 2),
            'active_repairs' => $activeRepairs,
            'unread_enquiries' => $unreadEnquiries,
        ],
    ]);
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
