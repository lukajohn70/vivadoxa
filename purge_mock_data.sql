-- =====================================================================
-- Vivadoxa Music School - Production Database Purge Script
--
-- Safely purges all mock and test customer data from MySQL:
--   - applications
--   - payments
--   - repairs
--   - enquiries
--   - students
--   - schedule_requests
--   - audit_logs
--
-- STRICTLY PRESERVES:
--   - admins (Admin accounts & passwords)
--   - programs (Academic course catalog)
--   - instructors (Faculty roster)
--   - cohorts (Batch schedules & room assignments)
--   - performances (Student recital showcase videos)
--   - system_settings (Academy settings & branding)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Wipe test admissions & applications
TRUNCATE TABLE `applications`;

-- 2. Wipe test payments, proofs, & receipts
TRUNCATE TABLE `payments`;

-- 3. Wipe test workshop instrument repairs
TRUNCATE TABLE `repairs`;

-- 4. Wipe test enquiries & contact submissions
TRUNCATE TABLE `enquiries`;

-- 5. Wipe test student enrollments
TRUNCATE TABLE `students`;

-- 6. Wipe test reschedule & attendance requests
TRUNCATE TABLE `schedule_requests`;

-- 7. Wipe test audit activity logs (if table exists)
TRUNCATE TABLE `audit_logs`;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify database state:
SELECT 'admins' AS `Table`, COUNT(*) AS `Remaining_Records` FROM `admins`
UNION ALL
SELECT 'programs', COUNT(*) FROM `programs`
UNION ALL
SELECT 'instructors', COUNT(*) FROM `instructors`
UNION ALL
SELECT 'cohorts', COUNT(*) FROM `cohorts`
UNION ALL
SELECT 'applications', COUNT(*) FROM `applications`
UNION ALL
SELECT 'payments', COUNT(*) FROM `payments`
UNION ALL
SELECT 'repairs', COUNT(*) FROM `repairs`
UNION ALL
SELECT 'students', COUNT(*) FROM `students`;
