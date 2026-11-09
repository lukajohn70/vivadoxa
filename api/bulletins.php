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
                    <strong style='color: #0b0b0b;'>💡 Rehearsal Note from Artistic Director:</strong>
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

if ($method === 'GET') {
    $action = trim($_GET['action'] ?? 'list');

    try {
        if ($action === 'list') {
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
        // Public subscription
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

            jsonResponse([
                'success' => true,
                'message' => 'Thank you for subscribing to the Vivadoxa Weekly Bulletin!',
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

            $serviceCtasHtml = "
                <div style='margin-top: 36px; padding-top: 24px; border-top: 2px solid #ede8e0;'>
                    <div style='text-align: center; margin-bottom: 20px;'>
                        <span style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #c96b32; background: #fff5ee; padding: 4px 12px; border-radius: 20px; border: 1px solid #ffd8c0; display: inline-block;'>
                            Vivadoxa Creative Ecosystem
                        </span>
                        <h3 style='margin: 8px 0 4px; font-size: 18px; font-weight: 700; color: #0b0b0b;'>
                            Programs &amp; Professional Services
                        </h3>
                        <p style='margin: 0; font-size: 13px; color: #78716c;'>
                            Instruction, luthier clinic, concert sound fleet, and studio recording
                        </p>
                    </div>

                    <!-- Service Cards Table Grid (Universal Email Friendly) -->
                    <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='margin-bottom: 12px;'>
                        <tr>
                            <td width='48%' style='background-color: #faf8f5; border: 1px solid #ede8e0; border-radius: 10px; padding: 16px; vertical-align: top;'>
                                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #c96b32; margin-bottom: 4px;'>🎓 Music Academy</div>
                                <div style='font-size: 14px; font-weight: 700; color: #0b0b0b; margin-bottom: 6px;'>17 Instrument Cohorts</div>
                                <p style='margin: 0 0 12px; font-size: 12px; color: #5c5954; line-height: 1.45;'>Graded tuition across piano, violin, guitar, saxophone, drums, voice & theory. Onsite, home or online.</p>
                                <a href='https://www.vivadoxamusic.com/apply' target='_blank' style='display: inline-block; background-color: #c96b32; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 7px 14px; border-radius: 6px;'>Apply / Enroll &rarr;</a>
                            </td>
                            <td width='4%'>&nbsp;</td>
                            <td width='48%' style='background-color: #faf8f5; border: 1px solid #ede8e0; border-radius: 10px; padding: 16px; vertical-align: top;'>
                                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #c96b32; margin-bottom: 4px;'>🔧 Instrument Clinic</div>
                                <div style='font-size: 14px; font-weight: 700; color: #0b0b0b; margin-bottom: 6px;'>Luthier &amp; Repair Care</div>
                                <p style='margin: 0 0 12px; font-size: 12px; color: #5c5954; line-height: 1.45;'>Precision setups, fret leveling, electronics, piano tuning, brass overhaul & diagnostics.</p>
                                <a href='https://www.vivadoxamusic.com/repairs' target='_blank' style='display: inline-block; background-color: #0b0b0b; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 7px 14px; border-radius: 6px;'>Book Repair &rarr;</a>
                            </td>
                        </tr>
                        <tr><td height='12' colspan='3'></td></tr>
                        <tr>
                            <td width='48%' style='background-color: #faf8f5; border: 1px solid #ede8e0; border-radius: 10px; padding: 16px; vertical-align: top;'>
                                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #c96b32; margin-bottom: 4px;'>🔊 Sound &amp; Gear Rentals</div>
                                <div style='font-size: 14px; font-weight: 700; color: #0b0b0b; margin-bottom: 6px;'>Concert Fleet &amp; Backline</div>
                                <p style='margin: 0 0 12px; font-size: 12px; color: #5c5954; line-height: 1.45;'>Stage pianos, acoustic/electronic drum kits, powered PA line arrays, and wireless microphones.</p>
                                <a href='https://www.vivadoxamusic.com/rentals' target='_blank' style='display: inline-block; background-color: #0b0b0b; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 7px 14px; border-radius: 6px;'>Browse Rentals &rarr;</a>
                            </td>
                            <td width='4%'>&nbsp;</td>
                            <td width='48%' style='background-color: #faf8f5; border: 1px solid #ede8e0; border-radius: 10px; padding: 16px; vertical-align: top;'>
                                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #c96b32; margin-bottom: 4px;'>🛍️ Music Store</div>
                                <div style='font-size: 14px; font-weight: 700; color: #0b0b0b; margin-bottom: 6px;'>Instruments &amp; Accessories</div>
                                <p style='margin: 0 0 12px; font-size: 12px; color: #5c5954; line-height: 1.45;'>Guitars, violins, keyboards, strings, reeds, audio cables, and musician gear.</p>
                                <a href='https://www.vivadoxamusic.com/store' target='_blank' style='display: inline-block; background-color: #0b0b0b; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 7px 14px; border-radius: 6px;'>Shop Store &rarr;</a>
                            </td>
                        </tr>
                        <tr><td height='12' colspan='3'></td></tr>
                        <tr>
                            <td width='48%' style='background-color: #faf8f5; border: 1px solid #ede8e0; border-radius: 10px; padding: 16px; vertical-align: top;'>
                                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #c96b32; margin-bottom: 4px;'>🎙️ Recording &amp; Rehearsal</div>
                                <div style='font-size: 14px; font-weight: 700; color: #0b0b0b; margin-bottom: 6px;'>Acoustic Live Studio</div>
                                <p style='margin: 0 0 12px; font-size: 12px; color: #5c5954; line-height: 1.45;'>Sound-isolated band rehearsal hall, vocal booth, multi-track recording & mixing suite.</p>
                                <a href='https://www.vivadoxamusic.com/studio' target='_blank' style='display: inline-block; background-color: #0b0b0b; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 7px 14px; border-radius: 6px;'>Book Studio &rarr;</a>
                            </td>
                            <td width='4%'>&nbsp;</td>
                            <td width='48%' style='background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; vertical-align: top;'>
                                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #16a34a; margin-bottom: 4px;'>💬 WhatsApp Concierge</div>
                                <div style='font-size: 14px; font-weight: 700; color: #0b0b0b; margin-bottom: 6px;'>Direct Support Desk</div>
                                <p style='margin: 0 0 12px; font-size: 12px; color: #5c5954; line-height: 1.45;'>Chat directly with our instructors, sound engineers, or repair techs in real time.</p>
                                <a href='https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Music%2C%20I%20am%20enquiring%20about%20your%20services' target='_blank' style='display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; padding: 7px 14px; border-radius: 6px;'>Chat on WhatsApp &rarr;</a>
                            </td>
                        </tr>
                    </table>
                </div>
            ";

            foreach ($recipients as $rec) {
                $name = $rec['name'];
                $toEmail = $rec['email'];

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
                    </div>
                ";

                $emailHtml = buildBrandedEmailTemplate([
                    'title' => $bulletin['title'],
                    'badge' => $bulletin['edition'],
                    'headline' => $bulletin['title'],
                    'clientName' => $name,
                    'bodyHtml' => $bodyHtml,
                    'ctaText' => 'Visit Vivadoxa Portal',
                    'ctaUrl' => 'https://www.vivadoxamusic.com/portal',
                    'deptName' => 'Vivadoxa Music Weekly Bulletin',
                    'deptEmail' => 'info@vivadoxamusic.com',
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
                'message' => !empty($testEmail)
                    ? "Test bulletin delivered to $testEmail."
                    : "Weekly Bulletin broadcast to $sentCount recipients successfully.",
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
