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

    $activeStudents = (int)$pdo->query("SELECT COUNT(*) FROM `students` WHERE status = 'active'")->fetchColumn();
    $pendingSchedules = (int)$pdo->query("SELECT COUNT(*) FROM `schedule_requests` WHERE status = 'pending'")->fetchColumn();

    // Real monthly revenue for last 6 months
    $monthlyRevenue = [];
    for ($i = 5; $i >= 0; $i--) {
        $mTime = strtotime("-$i months");
        $mKey = date('Y-m', $mTime);
        $mLabel = date('M', $mTime);
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) FROM `payments` WHERE status = 'verified' AND DATE_FORMAT(created_at, '%Y-%m') = :m");
        $stmt->execute([':m' => $mKey]);
        $sum = (float)$stmt->fetchColumn();
        $monthlyRevenue[] = [
            'month' => $mLabel,
            'key' => $mKey,
            'amount' => $sum,
            'formatted' => '₦' . number_format($sum),
        ];
    }

    // Recent database activity stream
    $recentStmt = $pdo->query("
        (SELECT 'application' as type, CONCAT(first_name, ' ', last_name) as title, program as subtitle, status, created_at FROM `applications`)
        UNION ALL
        (SELECT 'payment' as type, payer_name as title, CONCAT('₦', FORMAT(amount, 0), ' via ', method) as subtitle, status, created_at FROM `payments`)
        UNION ALL
        (SELECT 'repair' as type, customer_name as title, instrument as subtitle, status, created_at FROM `repairs`)
        UNION ALL
        (SELECT 'schedule' as type, student_name as title, reason as subtitle, status, created_at FROM `schedule_requests`)
        ORDER BY created_at DESC LIMIT 8
    ");
    $recentActivity = $recentStmt->fetchAll();

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
            'active_students' => $activeStudents,
            'pending_schedules' => $pendingSchedules,
            'monthly_revenue' => $monthlyRevenue,
            'recent_activity' => $recentActivity,
        ],
    ]);
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
