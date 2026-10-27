import React from "react"
import { PageHero, Icon, WhatsAppIcon } from "@/components/ui"
import { SEO } from "@/components/SEO"
import { LegalNav } from "./LegalNav"
import { WHATSAPP_URL } from "@/lib/utils"
import { openCookiePreferences } from "@/lib/cookieConsent"
import type { Page } from "@/types"

export function Privacy({ go }: { go: (p: Page | string) => void }) {
  return (
    <>
      <SEO
        title="Privacy Policy & NDPA Compliance — Vivadoxa Music School"
        description="Vivadoxa Music School's privacy policy and personal data protection standards in compliance with the Nigeria Data Protection Act (NDPA 2023)."
        canonicalUrl="/privacy"
      />
      <PageHero
        badge="Regulatory Compliance"
        title="Privacy Policy & Data Protection"
        lead="How Vivadoxa Music School collects, protects, and handles personal data in strict compliance with the Nigeria Data Protection Act (NDPA 2023) and Child Rights legislation."
      />

      <section
        className="section bg-[var(--cream)]"
        style={{ minHeight: "80vh" }}
      >
        <div className="container" style={{ maxWidth: 960 }}>
          <LegalNav currentPage="privacy" go={go} lastUpdated="October 2026" />

          {/* Quick Notice Banner */}
          <div
            className="p-5 rounded-2xl mb-8 border border-[var(--gold)]/30"
            style={{ background: "rgba(201,107,50,0.06)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "var(--gold)", color: "white" }}
              >
                <Icon name="check" size={16} />
              </div>
              <div className="text-xs text-[var(--ink)] leading-relaxed">
                <strong className="block text-sm font-bold text-[var(--navy)] mb-1">
                  NDPA 2023 &amp; Child Protection Commitment
                </strong>
                Vivadoxa Music School ("Vivadoxa", "we", "us", or "our")
                respects the fundamental right to privacy of every student,
                parent, guardian, and visitor. We strictly adhere to the{" "}
                <strong>Nigeria Data Protection Act (NDPA 2023)</strong>, the{" "}
                <strong>Nigeria Data Protection Regulation (NDPR)</strong>, and
                national safeguarding frameworks governing minor learners.
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-white p-6 rounded-2xl border border-[var(--line)] mb-10 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)] mb-3">
              Table of Contents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="#controller"
                className="hover:text-[var(--gold)] transition-colors"
              >
                1. Data Controller Identity
              </a>
              <a
                href="#data-collected"
                className="hover:text-[var(--gold)] transition-colors"
              >
                2. Information We Collect
              </a>
              <a
                href="#child-data"
                className="hover:text-[var(--gold)] transition-colors"
              >
                3. Special Provisions for Minors &amp; Children
              </a>
              <a
                href="#lawful-basis"
                className="hover:text-[var(--gold)] transition-colors"
              >
                4. Lawful Bases for Processing
              </a>
              <a
                href="#use-of-data"
                className="hover:text-[var(--gold)] transition-colors"
              >
                5. How We Use Your Information
              </a>
              <a
                href="#media-policy"
                className="hover:text-[var(--gold)] transition-colors"
              >
                6. Photography, Video &amp; Recital Media
              </a>
              <a
                href="#sharing"
                className="hover:text-[var(--gold)] transition-colors"
              >
                7. Third-Party Sharing &amp; Processors
              </a>
              <a
                href="#cookies-tracking"
                className="hover:text-[var(--gold)] transition-colors"
              >
                8. Cookies, Storage &amp; Tracking Notice
              </a>
              <a
                href="#retention-security"
                className="hover:text-[var(--gold)] transition-colors"
              >
                9. Retention &amp; Security Safeguards
              </a>
              <a
                href="#subject-rights"
                className="hover:text-[var(--gold)] transition-colors"
              >
                10. Your Rights Under NDPA 2023 &amp; GDPR
              </a>
              <a
                href="#dpo-contact"
                className="hover:text-[var(--gold)] transition-colors"
              >
                11. Contacting our Data Protection Officer
              </a>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="space-y-10 text-sm leading-relaxed text-[#3d3935]">
            {/* Section 1 */}
            <article
              id="controller"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                1. Data Controller Identity
              </h2>
              <p className="mb-3">
                The Data Controller responsible for the processing of your
                personal information collected through this website (
                <strong>vivadoxa.ng</strong>), offline registration forms,
                studio enrollment portals, and customer care channels is:
              </p>
              <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)] text-xs space-y-1">
                <p>
                  <strong>Vivadoxa Music School</strong>
                </p>
                <p>
                  No. 49B Umaru Ibrahim Street, off Super Market Street beside
                  Angwan Sunday Market, Angwan Sunday, Kaduna, Nigeria
                </p>
                <p>
                  Registration: RC 3184525 (Corporate Affairs Commission,
                  Federal Republic of Nigeria)
                </p>
                <p>
                  Official Contact:{" "}
                  <a
                    href="mailto:vivadoxa@gmail.com"
                    className="text-[var(--gold)] font-semibold underline"
                  >
                    vivadoxa@gmail.com
                  </a>{" "}
                  /{" "}
                  <a
                    href="tel:09075330330"
                    className="text-[var(--gold)] font-semibold underline"
                  >
                    09075330330
                  </a>
                  ,{" "}
                  <a
                    href="tel:09010267234"
                    className="text-[var(--gold)] font-semibold underline"
                  >
                    09010267234
                  </a>
                </p>
              </div>
            </article>

            {/* Section 2 */}
            <article
              id="data-collected"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                2. Information We Collect
              </h2>
              <p className="mb-3">
                We collect personal information necessary to deliver premier
                music tuition, manage student admissions, maintain studio
                safety, and fulfill statutory educational obligations:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Applicant &amp; Student Identifiers:</strong> Full
                  legal name, date of birth, gender, home residential address,
                  email address, and direct telephone numbers.
                </li>
                <li>
                  <strong>
                    Parent &amp; Guardian Information (Mandatory for Minors):
                  </strong>{" "}
                  Full name of parent/legal guardian, relationship to student,
                  emergency contact telephone number, residential address, and
                  authorized pick-up personnel details.
                </li>
                <li>
                  <strong>Academic &amp; Musical History:</strong> Instrument(s)
                  of interest, current grade level, prior instruction records,
                  audition video or audio recordings, practice journals, and
                  grade exam registration numbers (e.g., ABRSM, MUSON where
                  applicable).
                </li>
                <li>
                  <strong>Payment &amp; Financial Documentation:</strong>{" "}
                  Transaction reference codes, payment receipts,
                  proof-of-transfer uploads, bank depositor names, and tuition
                  billing history.{" "}
                  <em>
                    (Note: We do not store raw credit/debit card PINs or CVV
                    codes; all digital payments are handled by PCI-DSS certified
                    payment processors.)
                  </em>
                </li>
                <li>
                  <strong>Technical &amp; Site Usage Logs:</strong> IP
                  addresses, browser types, session activity, device indicators,
                  and cookie tokens strictly utilized for session security and
                  server optimization.
                </li>
              </ul>
            </article>

            {/* Section 3 */}
            <article
              id="child-data"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-gold !py-0.5 !px-2 text-[10px] uppercase font-bold">
                  Priority Safeguard
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                3. Special Provisions for Minors &amp; Children (NDPA Section
                31)
              </h2>
              <p className="mb-3">
                Given that Vivadoxa instructs young learners (aged 4 to 17), we
                maintain the highest standards of data protection for minors:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Explicit Parental Consent:</strong> We do not accept
                  applications, collect personal data, or commence instruction
                  for any candidate under 18 years of age without explicit,
                  verifiable authorization from a parent or legal guardian.
                </li>
                <li>
                  <strong>
                    No Automated Profiling or Behavioral Marketing:
                  </strong>{" "}
                  Children's data is never processed for commercial marketing,
                  automated algorithmic profiling, or behavioral advertising.
                </li>
                <li>
                  <strong>Access &amp; Supervision:</strong> Parents have the
                  unreserved right to inspect all personal files, attendance
                  logs, and performance assessments held concerning their child
                  at any time.
                </li>
                <li>
                  <strong>Guardian Communications:</strong> All notifications,
                  invoices, and scheduling communications regarding minors are
                  routed solely through verified parent/guardian telephone
                  numbers and emails.
                </li>
              </ul>
            </article>

            {/* Section 4 */}
            <article
              id="lawful-basis"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                4. Lawful Bases for Processing
              </h2>
              <p className="mb-3">
                In compliance with Section 25 of the Nigeria Data Protection Act
                2023, Vivadoxa processes personal data exclusively under the
                following recognized legal grounds:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">
                    Contractual Necessity
                  </strong>
                  Processing required to execute the student enrollment
                  agreement, schedule masterclasses, administer exams, and issue
                  certificates.
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">
                    Legal &amp; Regulatory Duty
                  </strong>
                  Maintaining financial, tax, and student registers in
                  accordance with federal and Kaduna State statutory education
                  laws.
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">
                    Legitimate Interest
                  </strong>
                  Ensuring studio physical safety, instrument security,
                  emergency medical response, and academic quality auditing.
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">
                    Explicit Consent
                  </strong>
                  For recital broadcasts, social media student spotlights,
                  newsletter updates, or marketing features (always revocable).
                </div>
              </div>
            </article>

            {/* Section 5 */}
            <article
              id="use-of-data"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                5. How We Use Your Information
              </h2>
              <p className="mb-3">
                Your information is deployed strictly for institutional and
                academic operations:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  Processing enrollment applications, intake auditions, and
                  diagnostic instrument assessments.
                </li>
                <li>
                  Coordinating weekly lesson timetables, studio room
                  assignments, and tutor schedules.
                </li>
                <li>
                  Generating student progress reports, curriculum pacing guides,
                  and graduation certifications.
                </li>
                <li>
                  Dispatching official administrative announcements, fee
                  invoices, receipts, and studio calendar updates.
                </li>
                <li>
                  Managing instrument clinic diagnostic logs, courier
                  dispatches, and repair status tracking.
                </li>
                <li>
                  Responding to admissions questions, phone inquiries, and
                  official WhatsApp desk chats.
                </li>
              </ul>
            </article>

            {/* Section 6 */}
            <article
              id="media-policy"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                6. Photography, Video &amp; Recital Media Policy
              </h2>
              <p className="mb-3">
                Music performance is inherently public and communal. Vivadoxa
                regularly hosts recitals, orchestra rehearsals, and
                masterclasses where high-definition photography and videography
                occur:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Studio Recitals &amp; Public Concerts:</strong>{" "}
                  General stage recordings are captured for archival, student
                  feedback, and academy showcase purposes.
                </li>
                <li>
                  <strong>Opt-Out Protocol for Minors:</strong> If you prefer
                  that your child's photograph or performance video not be
                  published on Vivadoxa's public website, YouTube, or social
                  media pages, you may submit an Opt-Out Notice during
                  enrollment or anytime via email to{" "}
                  <a
                    href="mailto:safeguarding@vivadoxa.ng"
                    className="text-[var(--gold)] font-semibold underline"
                  >
                    safeguarding@vivadoxa.ng
                  </a>
                  .
                </li>
                <li>
                  <strong>No Private Name Disclosures:</strong> In public media,
                  children are identified solely by first name or ensemble title
                  to prevent unauthorized identification.
                </li>
              </ul>
            </article>

            {/* Section 7 */}
            <article
              id="sharing"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                7. Third-Party Sharing &amp; Processors
              </h2>
              <p className="mb-3">
                <strong>
                  Vivadoxa does not sell, lease, rent, or trade student or
                  guardian personal information to any third party for
                  commercial gain.
                </strong>
              </p>
              <p className="mb-2">
                We engage only reputable, contractually bound data processors
                for operational fulfillment:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  <strong>Payment Processors &amp; Commercial Banks:</strong>{" "}
                  For tuition verification, bank reconciliation, and automated
                  receipts (e.g., Paystack, Flutterwave, Zenith Bank, Access
                  Bank).
                </li>
                <li>
                  <strong>Communication Infrastructure:</strong> WhatsApp
                  Business API and secure email gateways for delivery of
                  invoices, attendance confirmations, and studio updates.
                </li>
                <li>
                  <strong>Examination Boards (Optional):</strong> Upon
                  student/parent request, registration details are forwarded to
                  accredited examination bodies (ABRSM, MUSON) for external
                  grading.
                </li>
                <li>
                  <strong>Legal Disclosures:</strong> We may disclose records if
                  required by lawful court order, subpoena, or relevant law
                  enforcement authority under Nigerian jurisdiction.
                </li>
              </ul>
            </article>

            {/* Section 8 */}
            <article
              id="cookies-tracking"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-gold !py-0.5 !px-2 text-[10px] uppercase font-bold">
                  ePrivacy &amp; NDPA
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Consent &amp; Storage
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                8. Cookies, Browser Storage &amp; Tracking Notice
              </h2>
              <p className="mb-3">
                In strict conformity with the{" "}
                <strong>Nigeria Data Protection Act (NDPA 2023)</strong>, the{" "}
                <strong>ePrivacy Directive (2002/58/EC)</strong>, and global
                data privacy standards, Vivadoxa Music School regulates all
                client-side storage technologies deployed on our website:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm mb-4">
                <li>
                  <strong>Strictly Necessary Storage:</strong> We use encrypted
                  session storage and local tokens strictly required for portal
                  user authentication, CSRF security, admission order caching,
                  and remembering your consent state. These cannot be disabled
                  as the portal cannot function securely without them.
                </li>
                <li>
                  <strong>Prior Affirmative Consent:</strong> No non-essential
                  cookies (such as analytics, functional UI preferences, or
                  external media embeds) are activated on your browser without
                  your explicit, freely given permission.
                </li>
                <li>
                  <strong>No Behavioral Profiling of Children:</strong> In
                  accordance with Section 31 of the NDPA 2023, under no
                  circumstances do we deploy behavioral advertising trackers,
                  pixel beacons, or tracking cookies targeting minor students.
                </li>
                <li>
                  <strong>Complete Cookie Inventory &amp; Audit:</strong> To
                  view the itemized table of every cookie key, provider,
                  purpose, and retention duration, review our official{" "}
                  <a
                    href="/cookies"
                    className="text-[var(--gold)] font-semibold underline"
                  >
                    Cookie &amp; Tracking Policy
                  </a>
                  .
                </li>
              </ul>

              <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="block text-[var(--navy)] font-semibold">
                    Manage Your Cookie Preferences
                  </strong>
                  <span className="text-[var(--muted)]">
                    You can update or withdraw your consent at any time.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="btn btn-secondary !min-h-[36px] !py-1 !px-3.5 !text-xs font-semibold !text-[var(--gold-text)] !border-[var(--gold)]/40 hover:!bg-[var(--gold)]/10 shrink-0"
                >
                  <Icon name="settings" size={13} />
                  <span>Open Cookie Settings</span>
                </button>
              </div>
            </article>

            {/* Section 9 */}
            <article
              id="retention-security"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                9. Retention &amp; Security Safeguards
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Data Security:</strong> All digital student records
                  are secured behind encrypted databases (TLS 1.3 / AES-256),
                  with multi-factor authentication restricted strictly to
                  authorized administrative staff.
                </li>
                <li>
                  <strong>Physical Safeguards:</strong> Hardcopy admission
                  archives and emergency medical consent sheets are locked in
                  climate-controlled administrative registry filing cabinets at
                  the Kaduna studio.
                </li>
                <li>
                  <strong>Retention Period:</strong> Active student profiles are
                  maintained throughout the study duration plus{" "}
                  <strong>7 years</strong> following graduation to allow alumni
                  verification of diplomas and transcripts. Financial audit
                  records are maintained for 6 years in compliance with Nigerian
                  tax regulations.
                </li>
              </ul>
            </article>

            {/* Section 10 */}
            <article
              id="subject-rights"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                10. Your Rights Under NDPA 2023 &amp; GDPR
              </h2>
              <p className="mb-3">
                As a data subject or lawful guardian under Nigerian and
                international privacy law, you possess enforceable rights:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold">
                    Right of Access
                  </strong>
                  Request a certified copy of all personal records we hold
                  concerning you or your child.
                </div>
                <div className="p-3 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold">
                    Right to Rectification
                  </strong>
                  Correct inaccurate or incomplete contact, guardian, or musical
                  history records.
                </div>
                <div className="p-3 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold">
                    Right to Erasure
                  </strong>
                  Request deletion of personal records where there is no longer
                  a legal or statutory ground for retention.
                </div>
                <div className="p-3 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold">
                    Right to Object / Restrict
                  </strong>
                  Opt out of marketing communications or restrict processing for
                  specific ancillary purposes.
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--muted)]">
                You also have the statutory right to lodge an administrative
                grievance with the{" "}
                <strong>Nigeria Data Protection Commission (NDPC)</strong>{" "}
                (ndpc.gov.ng) if you consider that our processing violates the
                NDPA 2023.
              </p>
            </article>

            {/* Section 11 */}
            <article
              id="dpo-contact"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                11. Contacting Our Data Protection Officer (DPO)
              </h2>
              <p className="mb-4">
                To exercise any of your statutory rights, submit a privacy
                query, or update your child's data preferences, please contact
                our designated office:
              </p>
              <div className="p-5 rounded-2xl bg-[var(--navy)] text-white text-xs space-y-2">
                <p className="text-sm font-semibold text-[var(--gold2)]">
                  Office of the Data Protection Officer (DPO)
                </p>
                <p>Vivadoxa Music School Legal &amp; Compliance Unit</p>
                <p>
                  No. 49B Umaru Ibrahim Street, off Super Market Street beside
                  Angwan Sunday Market, Angwan Sunday, Kaduna, Nigeria
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:vivadoxa@gmail.com"
                    className="text-[var(--gold2)] underline font-mono"
                  >
                    vivadoxa@gmail.com
                  </a>
                </p>
                <p>
                  Telephone: 09075330330 / 09010267234 (Mon–Fri, 9:00 AM – 5:00
                  PM WAT)
                </p>
              </div>
            </article>
          </div>

          {/* Bottom Back Button & WhatsApp */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--line)]">
            <button
              onClick={() => go("home")}
              className="btn btn-secondary inline-flex items-center gap-2 text-xs"
            >
              <Icon name="arrow" size={14} className="rotate-180" />
              <span>Return to Home</span>
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex items-center gap-2 text-xs"
            >
              <WhatsAppIcon size={16} />
              <span>Contact Admissions on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
