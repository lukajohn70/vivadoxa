<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = getDb();
    ensureApplicationSchema($pdo);
    reconcileOrphanedPayments($pdo);

    $totalApplications = (int)$pdo->query("SELECT COUNT(*) FROM `applications`")->fetchColumn();
    $pendingApplications = (int)$pdo->query("SELECT COUNT(*) FROM `applications` WHERE status = 'pending'")->fetchColumn();
    $acceptedApplications = (int)$pdo->query("SELECT COUNT(*) FROM `applications` WHERE status = 'approved'")->fetchColumn();

    $pendingPayments = (int)$pdo->query("SELECT COUNT(*) FROM `payments` WHERE status = 'pending'")->fetchColumn();
    $totalRevenue = (float)$pdo->query("SELECT COALESCE(SUM(amount), 0) FROM `payments` WHERE status = 'verified'")->fetchColumn();

    $activeRepairs = (int)$pdo->query("SELECT COUNT(*) FROM `repairs` WHERE status NOT IN ('ready', 'collected')")->fetchColumn();
    $unreadEnquiries = (int)$pdo->query("SELECT COUNT(*) FROM `enquiries` WHERE is_read = 0")->fetchColumn();

    $activeStudents = (int)$pdo->query("SELECT COUNT(*) FROM `students` WHERE status = 'active'")->fetchColumn();
    if ($activeStudents === 0 && $acceptedApplications > 0) {
        $activeStudents = $acceptedApplications;
    }

    $pendingSchedules = 0;
    try {
        $pendingSchedules = (int)$pdo->query("SELECT COUNT(*) FROM `schedule_requests` WHERE status = 'pending'")->fetchColumn();
    } catch (Throwable $e) {}

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

    // Recent database activity stream - query separately to prevent collation mix errors
    $recentActivity = [];
    try {
        $appRows = $pdo->query("SELECT 'application' as type, CONCAT(first_name, ' ', last_name) as title, program as subtitle, status, created_at FROM `applications` ORDER BY id DESC LIMIT 5")->fetchAll() ?: [];
        foreach ($appRows as $r) { $recentActivity[] = $r; }
    } catch (Throwable $e) {}

    try {
        $payRows = $pdo->query("SELECT 'payment' as type, payer_name as title, CONCAT('₦', FORMAT(amount, 0), ' via ', method) as subtitle, status, created_at FROM `payments` ORDER BY id DESC LIMIT 5")->fetchAll() ?: [];
        foreach ($payRows as $r) { $recentActivity[] = $r; }
    } catch (Throwable $e) {}

    try {
        $repRows = $pdo->query("SELECT 'repair' as type, customer_name as title, instrument as subtitle, status, created_at FROM `repairs` ORDER BY id DESC LIMIT 5")->fetchAll() ?: [];
        foreach ($repRows as $r) { $recentActivity[] = $r; }
    } catch (Throwable $e) {}

    try {
        $schRows = $pdo->query("SELECT 'schedule' as type, student_name as title, reason as subtitle, status, created_at FROM `schedule_requests` ORDER BY id DESC LIMIT 5")->fetchAll() ?: [];
        foreach ($schRows as $r) { $recentActivity[] = $r; }
    } catch (Throwable $e) {}

    usort($recentActivity, function($a, $b) {
        return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
    });
    $recentActivity = array_slice($recentActivity, 0, 8);

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
} catch (Throwable $e) {
    error_log("Error in stats.php: " . $e->getMessage());
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
