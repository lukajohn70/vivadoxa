<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notifier.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure bulletin tables exist
function ensureBulletinTables(PDO $pdo): void {
    static $done = false;
    if ($done) return;

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `bulletins` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `edition` VARCHAR(100) NOT NULL,
                `category` VARCHAR(100) NOT NULL DEFAULT 'Weekly Bulletin',
                `summary` TEXT NULL,
                `content_html` LONGTEXT NOT NULL,
                `cover_image` VARCHAR(500) NULL,
                `target_audience` VARCHAR(100) NOT NULL DEFAULT 'all',
                `status` ENUM('draft', 'published', 'sent') NOT NULL DEFAULT 'draft',
                `recipients_count` INT NOT NULL DEFAULT 0,
                `sent_at` DATETIME NULL,
                `created_by` VARCHAR(150) NULL,
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {}

    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `email` VARCHAR(191) NOT NULL UNIQUE,
                `full_name` VARCHAR(150) NULL,
                `status` ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
                `source` VARCHAR(100) NOT NULL DEFAULT 'website',
                `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
    } catch (Exception $e) {}

    // Seed sample bulletin if empty
    try {
        $count = (int)$pdo->query("SELECT COUNT(*) FROM `bulletins`")->fetchColumn();
        if ($count === 0) {
            $sampleTitle = "Vivadoxa Weekly Bulletin: Mid-Term Rehearsals, Piano Workshop & Stagecraft";
            $sampleEdition = "Week 46 · Nov 2026";
            $sampleHtml = "
                <p>Welcome to this week's official <strong>Vivadoxa Weekly Bulletin</strong> — your curated dispatch covering studio rehearsals, faculty notes, upcoming concert dates, and masterclass opportunities.</p>
                
                <h3 style='color: #a24a18; border-bottom: 2px solid #ede8e0; padding-bottom: 6px; margin-top: 24px;'>1. Studio Cohort Rehearsal Times</h3>
                <p>All Saturday cohort students are reminded to arrive <strong>15 minutes prior</strong> to allocated rehearsal slots. Studio Hall 1 (Piano Lab) and Studio Hall 2 (Acoustic Strings & Ensemble Room) have been pre-tuned for ensemble play.</p>
                
                <div style='background: #fff8f3; border-left: 4px solid #c96b32; padding: 14px 18px; margin: 18px 0; border-radius: 0 8px 8px 0;'>
                    <strong style='color: #0b0b0b;'>Artistic Director's Rehearsal Note:</strong>
                    <p style='margin: 4px 0 0; font-size: 13.5px; color: #5c5954;'>Sight-reading candidates for Grade 3–5 ABRSM examinations should review harmonic minor scales and dynamic articulation before Thursday evening coaching.</p>
                </div>

                <h3 style='color: #a24a18; border-bottom: 2px solid #ede8e0; padding-bottom: 6px; margin-top: 24px;'>2. Luthier Workshop Update</h3>
                <p>Our workshop team completed seasonal bridge adjustments and fret leveling on 14 stringed instruments this week. Remember that acoustic guitars and violins require regulated room humidity to prevent soundboard tension.</p>

                <h3 style='color: #a24a18; border-bottom: 2px solid #ede8e0; padding-bottom: 6px; margin-top: 24px;'>3. Student Spotlight of the Week</h3>
                <p>Congratulations to <strong>David Kalu</strong> (Acoustic Fingerstyle & Lead Guitar) for completing the 12-week Foundation Term with highest performance merit marks!</p>
            ";
            $ins = $pdo->prepare("
                INSERT INTO `bulletins` (`title`, `edition`, `category`, `summary`, `content_html`, `target_audience`, `status`, `created_by`)
                VALUES (:t, :ed, 'Weekly Bulletin', 'Mid-Term Rehearsals, Sight-Reading Masterclasses and Luthier Clinic notes.', :h, 'all', 'published', 'Admissions Desk')
            ");
            $ins->execute([
                ':t' => $sampleTitle,
                ':ed' => $sampleEdition,
                ':h' => $sampleHtml,
            ]);
        }
    } catch (Exception $e) {}

    $done = true;
}

ensureBulletinTables($pdo);

// Unsubscribe signature generator & URL helpers
function getUnsubscribeToken(string $email): string {
    return hash_hmac('sha256', strtolower(trim($email)), 'vdx_bulletin_salt_2026');
}

function getBaseSiteUrl(): string {
    $host = $_SERVER['HTTP_HOST'] ?? 'www.vivadoxamusic.com';
    $isLocal = strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false;
    if ($isLocal) {
        $port = $_SERVER['SERVER_PORT'] ?? '80';
        $portPart = ($port && $port != '80' && $port != '443') ? ":{$port}" : '';
        return "http://localhost{$portPart}/Vivadoxa";
    }
    $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'https://';
    return "{$proto}{$host}";
}

function getUnsubscribeUrl(string $email): string {
    $token = getUnsubscribeToken($email);
    $base = getBaseSiteUrl();
    return "{$base}/api/bulletins.php?action=unsubscribe&email=" . urlencode(strtolower(trim($email))) . "&token=" . $token;
}

function getResubscribeUrl(string $email): string {
    $token = getUnsubscribeToken($email);
    $base = getBaseSiteUrl();
    return "{$base}/api/bulletins.php?action=resubscribe&email=" . urlencode(strtolower(trim($email))) . "&token=" . $token;
}

function renderUnsubscribeHtml(string $title, string $message, bool $isSuccess = true, ?string $resubUrl = null, string $email = '', bool $isResubscribed = false): void {
    header('Content-Type: text/html; charset=utf-8');
    $siteUrl = getBaseSiteUrl();
    $accentColor = $isSuccess ? '#c96b32' : '#dc2626';
    $icon = $isSuccess ? '✓' : '⚠️';
    $resubButtonHtml = '';
    if ($resubUrl && !$isResubscribed) {
        $resubButtonHtml = "
            <a href='" . htmlspecialchars($resubUrl) . "' style='display: inline-block; background: #c96b32; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: 700; font-size: 13px; margin: 10px 6px;'>
                Resubscribe to Bulletin
            </a>
        ";
    }
    echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{$title} — Vivadoxa Music</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background-color: #0b1a2c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { background: #ffffff; color: #1e293b; max-width: 540px; width: 92%; margin: 30px auto; padding: 40px 32px; border-radius: 14px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); text-align: center; }
        .logo { max-height: 48px; margin-bottom: 24px; }
        .icon-circle { width: 56px; height: 56px; border-radius: 50%; background: #fef3c7; color: {$accentColor}; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px; }
        h1 { margin: 0 0 12px; font-size: 22px; color: #0b1a2c; }
        p { margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569; }
        .actions { margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; }
        .btn-home { display: inline-block; background: #f1f5f9; color: #0b1a2c; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: 600; font-size: 13px; margin: 10px 6px; }
        .btn-home:hover { background: #e2e8f0; }
        .footer-note { font-size: 11px; color: #94a3b8; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
    </style>
</head>
<body>
    <div class='card'>
        <a href='{$siteUrl}'>
            <img src='https://www.vivadoxamusic.com/vivadoxa-logo.png' alt='Vivadoxa Music Academy' class='logo' onerror=\"this.style.display='none'\">
        </a>
        <div class='icon-circle'>{$icon}</div>
        <h1>{$title}</h1>
        <p>{$message}</p>
        <div class='actions'>
            {$resubButtonHtml}
            <a href='{$siteUrl}' class='btn-home'>Return to Vivadoxa Website</a>
        </div>
        <div class='footer-note'>
            Vivadoxa Music Academy &middot; 49B Umaru Ibrahim Street, Kaduna, Nigeria
        </div>
    </div>
</body>
</html>";
    exit;
}

if ($method === 'GET') {
    $action = trim($_GET['action'] ?? 'list');

    try {
        if ($action === 'unsubscribe') {
            $email = strtolower(trim($_GET['email'] ?? ''));
            $token = trim($_GET['token'] ?? '');
            $expectedToken = getUnsubscribeToken($email);

            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                renderUnsubscribeHtml('Invalid Request', 'Please provide a valid subscriber email address to unsubscribe.', false);
                exit;
            }

            if (!empty($token) && !hash_equals($expectedToken, $token)) {
                renderUnsubscribeHtml('Security Verification Failed', 'The unsubscribe link signature is invalid or expired. Please click the link directly from your latest Vivadoxa email.', false);
                exit;
            }

            // Update subscriber status
            $stmt = $pdo->prepare("UPDATE `newsletter_subscribers` SET `status` = 'unsubscribed' WHERE `email` = :em");
            $stmt->execute([':em' => $email]);

            $resubUrl = getResubscribeUrl($email);
            renderUnsubscribeHtml(
                'Unsubscribed Successfully',
                "You have been successfully unsubscribed from the <strong>Vivadoxa Weekly Bulletin</strong>. You will no longer receive weekly dispatches at <strong>" . htmlspecialchars($email) . "</strong>.",
                true,
                $resubUrl,
                $email
            );
            exit;
        } elseif ($action === 'resubscribe') {
            $email = strtolower(trim($_GET['email'] ?? ''));
            $token = trim($_GET['token'] ?? '');
            $expectedToken = getUnsubscribeToken($email);

            if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL) && hash_equals($expectedToken, $token)) {
                $stmt = $pdo->prepare("UPDATE `newsletter_subscribers` SET `status` = 'active' WHERE `email` = :em");
                $stmt->execute([':em' => $email]);
                renderUnsubscribeHtml(
                    'Welcome Back!',
                    "Your subscription has been successfully reactivated for <strong>" . htmlspecialchars($email) . "</strong>. You will continue to receive our weekly dispatches.",
                    true,
                    null,
                    $email,
                    true
                );
                exit;
            } else {
                renderUnsubscribeHtml('Invalid Link', 'The reactivation link was invalid. You can subscribe again directly on the Vivadoxa homepage.', false);
                exit;
            }
        } elseif ($action === 'list') {
            $stmt = $pdo->query("
                SELECT id, title, edition, category, summary, target_audience, status, recipients_count, sent_at, created_by, created_at, updated_at
                FROM `bulletins`
                ORDER BY created_at DESC
            ");
            $bulletins = $stmt->fetchAll();
            jsonResponse(['success' => true, 'bulletins' => $bulletins]);
        } elseif ($action === 'get') {
            $id = (int)($_GET['id'] ?? 0);
            $stmt = $pdo->prepare("SELECT * FROM `bulletins` WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $b = $stmt->fetch();
            if (!$b) {
                jsonResponse(['success' => false, 'error' => 'Bulletin not found.'], 404);
            }
            jsonResponse(['success' => true, 'bulletin' => $b]);
        } elseif ($action === 'subscribers') {
            $stmt = $pdo->query("SELECT id, email, full_name, status, source, created_at FROM `newsletter_subscribers` ORDER BY created_at DESC");
            $subscribers = $stmt->fetchAll();
            jsonResponse([
                'success' => true,
                'subscribers' => $subscribers,
                'count' => count($subscribers),
            ]);
        } elseif ($action === 'logs' || $action === 'dispatch_logs') {
            $limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));
            $stmt = $pdo->prepare("
                SELECT id, channel, recipient, subject, status, error_message, created_at
                FROM `system_notifications`
                WHERE `channel` = 'email'
                ORDER BY id DESC
                LIMIT :lim
            ");
            $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $logs = $stmt->fetchAll();
            jsonResponse([
                'success' => true,
                'logs' => $logs,
                'count' => count($logs),
            ]);
        } else {
            jsonResponse(['success' => false, 'error' => 'Unknown GET action.'], 400);
        }
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
} elseif ($method === 'POST') {
    $input = getJsonInput();
    $action = trim($input['action'] ?? '');

    try {
        // Unsubscribe API
        if ($action === 'unsubscribe') {
            $email = strtolower(trim($input['email'] ?? ''));
            if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $stmt = $pdo->prepare("UPDATE `newsletter_subscribers` SET `status` = 'unsubscribed' WHERE `email` = :em");
                $stmt->execute([':em' => $email]);
                jsonResponse(['success' => true, 'message' => "Successfully unsubscribed {$email}."]);
            }
            jsonResponse(['success' => false, 'error' => 'Valid email address required.'], 400);
        }

        // Public subscription + Welcome Email
        if ($action === 'subscribe') {
            $email = strtolower(trim($input['email'] ?? ''));
            $name = trim($input['name'] ?? $input['full_name'] ?? '');
            $source = trim($input['source'] ?? 'website');

            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                jsonResponse(['success' => false, 'error' => 'Please provide a valid email address.'], 400);
            }

            $stmt = $pdo->prepare("
                INSERT INTO `newsletter_subscribers` (`email`, `full_name`, `status`, `source`)
                VALUES (:em, :fn, 'active', :src)
                ON DUPLICATE KEY UPDATE `status` = 'active', `full_name` = COALESCE(NULLIF(VALUES(`full_name`), ''), `full_name`)
            ");
            $stmt->execute([
                ':em' => $email,
                ':fn' => $name,
                ':src' => $source,
            ]);

            // Build personalized unsubscribe link
            $unsubUrl = getUnsubscribeUrl($email);
            $subscriberName = !empty($name) ? $name : 'Music Lover';
            $subject = "🎼 Welcome to Vivadoxa Academy Dispatches — You're Subscribed!";

            $welcomeBodyHtml = "
                <p style='font-size: 15px; color: #191715; line-height: 1.7;'>
                    Thank you for subscribing to the official <strong>Vivadoxa Music Weekly Bulletin</strong>! You have been successfully added to our community dispatch list.
                </p>

                <p style='font-size: 14px; color: #444; line-height: 1.7;'>
                    Every week, our editorial desk and academy faculty curate practical resources to elevate your musical journey:
                </p>

                <table style='width: 100%; border-collapse: collapse; margin: 18px 0;'>
                    <tr>
                        <td style='padding: 12px 14px; background: #faf8f5; border-left: 3px solid #c96b32; border-bottom: 4px solid #fff;'>
                            <strong style='color: #0b1a2c; font-size: 13.5px;'>🎵 Rehearsal Guides & Repertoire Notes:</strong>
                            <p style='margin: 4px 0 0; font-size: 12.5px; color: #5c5954;'>Sight-reading tips, dynamic articulation exercises, and faculty coaching notes.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 12px 14px; background: #faf8f5; border-left: 3px solid #c96b32; border-bottom: 4px solid #fff;'>
                            <strong style='color: #0b1a2c; font-size: 13.5px;'>🛠️ Instrument Clinic & Care Spotlights:</strong>
                            <p style='margin: 4px 0 0; font-size: 12.5px; color: #5c5954;'>Seasonal wood humidity preservation, string setup guides, and luthier workshop updates.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 12px 14px; background: #faf8f5; border-left: 3px solid #c96b32; border-bottom: 4px solid #fff;'>
                            <strong style='color: #0b1a2c; font-size: 13.5px;'>🎹 Recitals, Masterclasses & Early Admissions:</strong>
                            <p style='margin: 4px 0 0; font-size: 12.5px; color: #5c5954;'>Student recital premieres, masterclass dates, and priority registration notices.</p>
                        </td>
                    </tr>
                </table>

                <div style='background: #faf8f5; border: 1px dashed #dfdad0; border-radius: 8px; padding: 14px 18px; margin-top: 26px; font-size: 12px; color: #78716c;'>
                    <p style='margin: 0;'><strong>Vivadoxa Community Bulletin Desk</strong></p>
                    <p style='margin: 4px 0 0;'>You are receiving this official academy newsletter because you subscribed at vivadoxamusic.com.</p>
                    <p style='margin: 10px 0 0; padding-top: 8px; border-top: 1px solid #ede8e0; font-size: 11px; color: #a8a29e;'>
                        Don't want to receive these emails? <a href='{$unsubUrl}' style='color: #c96b32; font-weight: 600; text-decoration: underline;'>Unsubscribe from this list</a> at any time.
                    </p>
                </div>
            ";

            $emailHtml = buildBrandedEmailTemplate([
                'title'          => "Welcome to Vivadoxa Academy Dispatches",
                'badge'          => "Weekly Bulletin",
                'headerBadge'    => "Weekly Academy Bulletin",
                'category'       => "Weekly Bulletin",
                'headline'       => "You're in Tune with Vivadoxa!",
                'clientName'     => $subscriberName,
                'bodyHtml'       => $welcomeBodyHtml,
                'ctaText'        => "Visit Vivadoxa Website",
                'ctaUrl'         => "https://www.vivadoxamusic.com/",
                'deptName'       => "Vivadoxa Music Weekly Bulletin",
                'deptEmail'      => "info@vivadoxamusic.com",
                'unsubscribeUrl' => $unsubUrl,
            ]);

            $mailResult = sendSystemEmail(
                $email,
                $subject,
                $emailHtml,
                null,
                'newsletter',
                false
            );

            jsonResponse([
                'success' => true,
                'message' => 'Thank you for subscribing to Vivadoxa Dispatches.',
                'email_dispatched' => !empty($mailResult['success']),
                'delivery_status' => $mailResult['message'] ?? 'Dispatched',
            ]);
        }

        // Save / Update Bulletin Draft
        if ($action === 'save') {
            $id = (int)($input['id'] ?? 0);
            $title = trim($input['title'] ?? '');
            $edition = trim($input['edition'] ?? ('Week ' . date('W') . ' · ' . date('M Y')));
            $category = trim($input['category'] ?? 'Weekly Bulletin');
            $summary = trim($input['summary'] ?? '');
            $contentHtml = trim($input['content_html'] ?? $input['content'] ?? '');
            $coverImage = trim($input['cover_image'] ?? '');
            $targetAudience = trim($input['target_audience'] ?? 'all');
            $status = trim($input['status'] ?? 'draft');
            $createdBy = trim($_SESSION['admin_user']['name'] ?? 'Editorial Desk');

            if (empty($title)) {
                jsonResponse(['success' => false, 'error' => 'Bulletin title is required.'], 400);
            }

            if (empty($contentHtml)) {
                jsonResponse(['success' => false, 'error' => 'Bulletin content cannot be empty.'], 400);
            }

            if ($id > 0) {
                $stmt = $pdo->prepare("
                    UPDATE `bulletins`
                    SET `title` = :t,
                        `edition` = :ed,
                        `category` = :cat,
                        `summary` = :sm,
                        `content_html` = :ch,
                        `cover_image` = :ci,
                        `target_audience` = :ta,
                        `status` = :st
                    WHERE id = :id
                ");
                $stmt->execute([
                    ':t' => $title,
                    ':ed' => $edition,
                    ':cat' => $category,
                    ':sm' => $summary,
                    ':ch' => $contentHtml,
                    ':ci' => $coverImage,
                    ':ta' => $targetAudience,
                    ':st' => $status,
                    ':id' => $id,
                ]);
                $bulletinId = $id;
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO `bulletins` (`title`, `edition`, `category`, `summary`, `content_html`, `cover_image`, `target_audience`, `status`, `created_by`)
                    VALUES (:t, :ed, :cat, :sm, :ch, :ci, :ta, :st, :cb)
                ");
                $stmt->execute([
                    ':t' => $title,
                    ':ed' => $edition,
                    ':cat' => $category,
                    ':sm' => $summary,
                    ':ch' => $contentHtml,
                    ':ci' => $coverImage,
                    ':ta' => $targetAudience,
                    ':st' => $status,
                    ':cb' => $createdBy,
                ]);
                $bulletinId = (int)$pdo->lastInsertId();
            }

            jsonResponse([
                'success' => true,
                'id' => $bulletinId,
                'message' => "Weekly Bulletin '{$title}' saved successfully.",
            ]);
        }

        // Broadcast / Send Bulletin
        if ($action === 'send') {
            $id = (int)($input['id'] ?? 0);
            $testEmail = trim($input['test_email'] ?? '');
            $targetAudience = trim($input['target_audience'] ?? 'all');

            if ($id <= 0) {
                jsonResponse(['success' => false, 'error' => 'Valid bulletin ID required.'], 400);
            }

            $stmt = $pdo->prepare("SELECT * FROM `bulletins` WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $bulletin = $stmt->fetch();

            if (!$bulletin) {
                jsonResponse(['success' => false, 'error' => 'Bulletin not found.'], 404);
            }

            // Gather recipient list
            $recipients = [];

            if (!empty($testEmail)) {
                // Test send
                $recipients[] = ['email' => $testEmail, 'name' => 'Vivadoxa Administrator'];
            } else {
                if ($targetAudience === 'subscribers' || $targetAudience === 'all') {
                    $subStmt = $pdo->query("SELECT email, full_name as name FROM `newsletter_subscribers` WHERE status = 'active'");
                    while ($r = $subStmt->fetch()) {
                        if (!empty($r['email'])) {
                            $recipients[strtolower(trim($r['email']))] = ['email' => trim($r['email']), 'name' => $r['name'] ?: 'Valued Subscriber'];
                        }
                    }
                }

                if ($targetAudience === 'students' || $targetAudience === 'all') {
                    $studStmt = $pdo->query("SELECT email, full_name as name FROM `students` WHERE status = 'active'");
                    while ($r = $studStmt->fetch()) {
                        if (!empty($r['email'])) {
                            $recipients[strtolower(trim($r['email']))] = ['email' => trim($r['email']), 'name' => $r['name'] ?: 'Enrolled Student'];
                        }
                    }

                    $appStmt = $pdo->query("SELECT email, CONCAT(first_name, ' ', last_name) as name FROM `applications` WHERE email IS NOT NULL AND email != ''");
                    while ($r = $appStmt->fetch()) {
                        if (!empty($r['email'])) {
                            $key = strtolower(trim($r['email']));
                            if (!isset($recipients[$key])) {
                                $recipients[$key] = ['email' => trim($r['email']), 'name' => $r['name'] ?: 'Academy Candidate'];
                            }
                        }
                    }
                }
                $recipients = array_values($recipients);
            }

            if (empty($recipients)) {
                jsonResponse(['success' => false, 'error' => 'No active recipients found for selected audience.'], 400);
            }

            // Send to each recipient
            $sentCount = 0;
            $failedCount = 0;
            $lastError = null;
            $deliveredRecipients = [];

            $serviceCtasHtml = "
                <div style='margin-top: 26px; padding-top: 18px; border-top: 1px solid #e7e2d9;'>
                    <div style='font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8a847c; margin-bottom: 10px;'>
                        Vivadoxa Services &amp; Programs
                    </div>

                    <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='font-size: 12px; color: #44403c;'>
                        <tr>
                            <td width='50%' style='padding: 5px 10px 5px 0; border-bottom: 1px solid #f2ede4; vertical-align: top;'>
                                <span style='font-weight: 700; color: #0b0b0b;'>Music Academy</span> &middot; 17 Cohorts
                                <div style='margin-top: 2px;'><a href='https://www.vivadoxamusic.com/apply' target='_blank' style='color: #c96b32; text-decoration: none; font-size: 11px; font-weight: 600;'>Apply / Enroll &rarr;</a></div>
                            </td>
                            <td width='50%' style='padding: 5px 0 5px 10px; border-bottom: 1px solid #f2ede4; vertical-align: top;'>
                                <span style='font-weight: 700; color: #0b0b0b;'>Instrument Clinic</span> &middot; Luthier Care
                                <div style='margin-top: 2px;'><a href='https://www.vivadoxamusic.com/repairs' target='_blank' style='color: #c96b32; text-decoration: none; font-size: 11px; font-weight: 600;'>Book Repair &rarr;</a></div>
                            </td>
                        </tr>
                        <tr>
                            <td width='50%' style='padding: 5px 10px 5px 0; border-bottom: 1px solid #f2ede4; vertical-align: top;'>
                                <span style='font-weight: 700; color: #0b0b0b;'>Rentals &amp; Backline</span> &middot; Concert Fleet
                                <div style='margin-top: 2px;'><a href='https://www.vivadoxamusic.com/rentals' target='_blank' style='color: #c96b32; text-decoration: none; font-size: 11px; font-weight: 600;'>Browse Rentals &rarr;</a></div>
                            </td>
                            <td width='50%' style='padding: 5px 0 5px 10px; border-bottom: 1px solid #f2ede4; vertical-align: top;'>
                                <span style='font-weight: 700; color: #0b0b0b;'>Music Store</span> &middot; Instruments &amp; Supplies
                                <div style='margin-top: 2px;'><a href='https://www.vivadoxamusic.com/store' target='_blank' style='color: #c96b32; text-decoration: none; font-size: 11px; font-weight: 600;'>Shop Catalog &rarr;</a></div>
                            </td>
                        </tr>
                        <tr>
                            <td width='50%' style='padding: 5px 10px 5px 0; vertical-align: top;'>
                                <span style='font-weight: 700; color: #0b0b0b;'>Studio &amp; Rehearsal</span> &middot; Live Room
                                <div style='margin-top: 2px;'><a href='https://www.vivadoxamusic.com/studio' target='_blank' style='color: #c96b32; text-decoration: none; font-size: 11px; font-weight: 600;'>Book Studio &rarr;</a></div>
                            </td>
                            <td width='50%' style='padding: 5px 0 5px 10px; vertical-align: top;'>
                                <span style='font-weight: 700; color: #0b0b0b;'>Client Concierge</span> &middot; WhatsApp
                                <div style='margin-top: 2px;'><a href='https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Music%2C%20I%20am%20enquiring%20about%20your%20services' target='_blank' style='color: #16a34a; text-decoration: none; font-size: 11px; font-weight: 600;'>Chat with Desk &rarr;</a></div>
                            </td>
                        </tr>
                    </table>
                </div>
            ";

            foreach ($recipients as $rec) {
                $name = $rec['name'];
                $toEmail = $rec['email'];
                $subscriberUnsubUrl = getUnsubscribeUrl($toEmail);

                $bodyHtml = "
                    <div style='background: #f7f5f0; border: 1px solid #dfdad0; border-radius: 8px; padding: 12px 18px; margin-bottom: 22px; display: inline-block;'>
                        <span style='font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #a24a18; font-weight: 700;'>{$bulletin['edition']}</span>
                        <span style='color: #78716c; margin: 0 6px;'>·</span>
                        <span style='font-size: 11.5px; color: #5c5954; font-weight: 600;'>{$bulletin['category']}</span>
                    </div>

                    <div style='font-size: 15px; color: #191715; line-height: 1.7;'>
                        {$bulletin['content_html']}
                    </div>

                    {$serviceCtasHtml}

                    <div style='background: #faf8f5; border: 1px dashed #dfdad0; border-radius: 8px; padding: 14px 18px; margin-top: 30px; font-size: 12px; color: #78716c;'>
                        <p style='margin: 0;'><strong>Vivadoxa Community Bulletin Desk</strong></p>
                        <p style='margin: 4px 0 0;'>You are receiving this official academy newsletter because you are an active student, applicant, or subscribed patron of Vivadoxa Music.</p>
                        <p style='margin: 10px 0 0; padding-top: 8px; border-top: 1px solid #ede8e0; font-size: 11px; color: #a8a29e;'>
                            Don't want to receive these emails? <a href='{$subscriberUnsubUrl}' style='color: #c96b32; font-weight: 600; text-decoration: underline;'>Unsubscribe from this list</a> at any time.
                        </p>
                    </div>
                ";

                $emailHtml = buildBrandedEmailTemplate([
                    'title'          => $bulletin['title'],
                    'badge'          => $bulletin['edition'],
                    'headerBadge'    => $bulletin['category'] ?: 'Weekly Bulletin',
                    'category'       => $bulletin['category'] ?: 'Weekly Bulletin',
                    'headline'       => $bulletin['title'],
                    'clientName'     => $name,
                    'bodyHtml'       => $bodyHtml,
                    'ctaText'        => 'Visit Vivadoxa Portal',
                    'ctaUrl'         => 'https://www.vivadoxamusic.com/portal',
                    'deptName'       => 'Vivadoxa Music Weekly Bulletin',
                    'deptEmail'      => 'info@vivadoxamusic.com',
                    'unsubscribeUrl' => $subscriberUnsubUrl,
                ]);

                $res = sendSystemEmail(
                    $toEmail,
                    $bulletin['title'],
                    $emailHtml,
                    null,
                    'newsletter',
                    false
                );

                if ($res['success']) {
                    $sentCount++;
                    $deliveredRecipients[] = [
                        'email' => $toEmail,
                        'name' => $name,
                        'status' => 'delivered',
                    ];
                } else {
                    $failedCount++;
                    $lastError = $res['error'] ?? 'Delivery failed.';
                }
            }

            // If test send or real broadcast completely failed
            if ($sentCount === 0) {
                jsonResponse([
                    'success' => false,
                    'sent_count' => 0,
                    'failed_count' => $failedCount,
                    'error' => !empty($lastError) ? $lastError : 'Failed to deliver bulletin to recipient.',
                ], 500);
            }

            // Update bulletin status
            if (empty($testEmail)) {
                $up = $pdo->prepare("
                    UPDATE `bulletins`
                    SET `status` = 'sent',
                        `recipients_count` = :rc,
                        `sent_at` = NOW()
                    WHERE id = :id
                ");
                $up->execute([
                    ':rc' => $sentCount,
                    ':id' => $id,
                ]);
            }

            jsonResponse([
                'success' => true,
                'sent_count' => $sentCount,
                'failed_count' => $failedCount,
                'sender' => 'info@vivadoxamusic.com',
                'sender_name' => 'Vivadoxa Music Weekly Bulletin',
                'target' => !empty($testEmail) ? $testEmail : $targetAudience,
                'recipients' => $deliveredRecipients,
                'dispatched_at' => date('Y-m-d H:i:s'),
                'is_test' => !empty($testEmail),
                'message' => !empty($testEmail)
                    ? "Test bulletin dispatched successfully to {$testEmail} from info@vivadoxamusic.com."
                    : "Weekly Bulletin successfully broadcast to {$sentCount} recipient(s) from info@vivadoxamusic.com.",
            ]);
        }

        // Delete bulletin
        if ($action === 'delete') {
            $id = (int)($input['id'] ?? 0);
            if ($id <= 0) {
                jsonResponse(['success' => false, 'error' => 'Valid bulletin ID required.'], 400);
            }

            $del = $pdo->prepare("DELETE FROM `bulletins` WHERE id = :id");
            $del->execute([':id' => $id]);

            jsonResponse(['success' => true, 'message' => 'Bulletin removed successfully.']);
        }

        jsonResponse(['success' => false, 'error' => 'Unknown action: ' . htmlspecialchars($action)], 400);
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not allowed.'], 405);
}
