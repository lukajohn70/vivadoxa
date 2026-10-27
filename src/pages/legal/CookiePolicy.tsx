import React from "react"
import { PageHero, Icon, WhatsAppIcon } from "@/components/ui"
import { LegalNav } from "./LegalNav"
import { WHATSAPP_URL } from "@/lib/utils"
import { openCookiePreferences, COOKIE_INVENTORY } from "@/lib/cookieConsent"
import type { Page } from "@/types"

export function CookiePolicy({ go }: { go: (p: Page | string) => void }) {
  return (
    <>
      <PageHero
        badge="Statutory Disclosure"
        title="Cookie & Tracking Technology Policy"
        lead="A comprehensive audit of all cookies, local storage mechanisms, and cryptographic session tokens deployed across Vivadoxa Music School's digital ecosystem in strict compliance with the Nigeria Data Protection Act (NDPA 2023), GDPR, and ePrivacy standards."
      />

      <section
        className="section bg-[var(--cream)]"
        style={{ minHeight: "80vh" }}
      >
        <div className="container" style={{ maxWidth: 960 }}>
          <LegalNav currentPage="cookies" go={go} lastUpdated="October 2026" />

          {/* Quick Notice Banner with Direct Action */}
          <div
            className="p-5 sm:p-6 rounded-2xl mb-8 border border-[var(--gold)]/30 shadow-sm"
            style={{ background: "rgba(201,107,50,0.06)" }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--gold)", color: "white" }}
                  aria-hidden="true"
                >
                  <Icon name="check" size={18} />
                </div>
                <div className="text-xs text-[var(--ink)] leading-relaxed">
                  <strong className="block text-sm font-bold text-[var(--navy)] mb-1">
                    Your Privacy Rights &amp; Cookie Sovereignty
                  </strong>
                  Vivadoxa Music School ("Vivadoxa", "we", "us", or "our") uses
                  cookies and browser local storage strictly to ensure portal
                  security, student registration accuracy, and site reliability.{" "}
                  <strong>
                    We do not sell personal data, run invasive third-party ad
                    trackers, or perform commercial behavioral profiling on
                    minor students.
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={openCookiePreferences}
                className="btn btn-primary !min-h-[40px] !py-2 !px-4 !text-xs font-bold whitespace-nowrap shrink-0 shadow-sm w-full sm:w-auto"
              >
                <span>Manage Cookie Preferences</span>
                <Icon name="arrow" size={13} />
              </button>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-white p-6 rounded-2xl border border-[var(--line)] mb-10 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)] mb-3">
              Policy Table of Contents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="#what-are-cookies"
                className="hover:text-[var(--gold)] transition-colors"
              >
                1. What Are Cookies &amp; Local Storage?
              </a>
              <a
                href="#why-we-use-them"
                className="hover:text-[var(--gold)] transition-colors"
              >
                2. Why Vivadoxa Uses Cookies
              </a>
              <a
                href="#cookie-categories"
                className="hover:text-[var(--gold)] transition-colors"
              >
                3. Cookie Categories &amp; Legal Bases
              </a>
              <a
                href="#cookie-inventory"
                className="hover:text-[var(--gold)] transition-colors"
              >
                4. Complete Cookie &amp; Storage Audit Matrix
              </a>
              <a
                href="#minors-protection"
                className="hover:text-[var(--gold)] transition-colors"
              >
                5. Protection of Minor Learners (NDPA Section 31)
              </a>
              <a
                href="#third-party"
                className="hover:text-[var(--gold)] transition-colors"
              >
                6. Third-Party Integrations &amp; Embedded Media
              </a>
              <a
                href="#browser-controls"
                className="hover:text-[var(--gold)] transition-colors"
              >
                7. Browser Controls: Blocking &amp; Deleting Cookies
              </a>
              <a
                href="#dpo-inquiries"
                className="hover:text-[var(--gold)] transition-colors"
              >
                8. Policy Governance &amp; DPO Inquiries
              </a>
            </div>
          </div>

          {/* Legal Articles */}
          <div className="space-y-10 text-sm leading-relaxed text-[#3d3935]">
            {/* Section 1 */}
            <article
              id="what-are-cookies"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                1. What Are Cookies &amp; Local Storage?
              </h2>
              <p className="mb-3">
                A <strong>cookie</strong> is a compact text file stored on your
                computer, smartphone, or tablet when you browse a website.
                Cookies permit web servers to recognize your device across
                multiple page visits, maintain active logins, and preserve
                shopping cart or registration states.
              </p>
              <p className="mb-3">
                Modern web applications also utilize{" "}
                <strong>
                  Web Storage technologies (HTML5 Local Storage and Session
                  Storage)
                </strong>
                . These operate similarly to cookies by saving key-value strings
                directly inside your browser cache. Unlike cookies, HTML5
                storage items do not travel in every HTTP request header,
                ensuring superior cryptographic performance, reduced data
                consumption, and increased security against network
                interception.
              </p>
              <p className="text-xs text-[var(--muted)]">
                Throughout this policy, references to "cookies" collectively
                encompass HTTP cookies, browser local storage, session storage
                tokens, and related client-side caching mechanisms.
              </p>
            </article>

            {/* Section 2 */}
            <article
              id="why-we-use-them"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                2. Why Vivadoxa Music School Uses Cookies
              </h2>
              <p className="mb-3">
                Vivadoxa Music School deploys client-side storage technologies
                strictly for legitimate academic, operational, and security
                requirements:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Authentication &amp; Session Continuity:</strong>{" "}
                  Verifying authenticated logins for registered music students,
                  parents, faculty tutors, and administrative managers accessing
                  confidential academic portals.
                </li>
                <li>
                  <strong>Admission Application Workflow:</strong> Retaining
                  candidate registration references, selected instrument
                  disciplines, lesson formats (Studio vs. Online vs. Home), and
                  tuition invoices during checkout so applicants do not lose
                  progress if their network fluctuates.
                </li>
                <li>
                  <strong>Statutory Privacy Recording:</strong> Remembering your
                  affirmative cookie preferences and ensuring we honor your
                  consent decisions across browsing sessions.
                </li>
                <li>
                  <strong>System Diagnostics &amp; Latency Auditing:</strong>{" "}
                  Detecting broken registration links, tracking portal error
                  states, and monitoring server response times across Nigerian
                  telecommunications networks (MTN, Airtel, Glo, Starlink).
                </li>
              </ul>
            </article>

            {/* Section 3 */}
            <article
              id="cookie-categories"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                3. Cookie Categories &amp; Lawful Bases
              </h2>
              <p className="mb-4">
                Under the{" "}
                <strong>Nigeria Data Protection Act (NDPA 2023)</strong>, the{" "}
                <strong>EU General Data Protection Regulation (GDPR)</strong>,
                and the{" "}
                <strong>ePrivacy Directive (Directive 2002/58/EC)</strong>,
                cookies are classified into four transparent categories:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Category 1 */}
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm font-bold text-emerald-950">
                      Strictly Necessary
                    </strong>
                    <span className="badge badge-green !py-0.5 !px-2 text-[9px] uppercase font-bold">
                      Always Active
                    </span>
                  </div>
                  <p className="text-emerald-900/90 mb-2">
                    Required for the technical functioning of the website,
                    session security, fraud mitigation, and admission payments.
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    <em>Lawful Basis:</em> Contractual Necessity (NDPA 2023
                    Section 25(1)(b) &amp; GDPR Art. 6(1)(b)) and Statutory
                    Exemption under ePrivacy Art. 5(3).
                  </p>
                </div>

                {/* Category 2 */}
                <div className="p-4 rounded-xl border border-[var(--line)] bg-[#fbfaf7]">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm font-bold text-[var(--navy)]">
                      Functional &amp; Experience
                    </strong>
                    <span className="badge badge-gold !py-0.5 !px-2 text-[9px] uppercase font-bold">
                      Consent-Based
                    </span>
                  </div>
                  <p className="text-zinc-600 mb-2">
                    Preserves user preferences such as instrument catalog
                    filters, audio volume defaults, and temporary form
                    auto-save.
                  </p>
                  <p className="text-[11px] text-[var(--muted)] font-medium">
                    <em>Lawful Basis:</em> Explicit Consent (NDPA 2023 Section
                    25(1)(a) &amp; GDPR Art. 6(1)(a)).
                  </p>
                </div>

                {/* Category 3 */}
                <div className="p-4 rounded-xl border border-[var(--line)] bg-[#fbfaf7]">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm font-bold text-[var(--navy)]">
                      Performance &amp; Analytics
                    </strong>
                    <span className="badge badge-gold !py-0.5 !px-2 text-[9px] uppercase font-bold">
                      Consent-Based
                    </span>
                  </div>
                  <p className="text-zinc-600 mb-2">
                    Collects aggregated, strictly non-personally identifiable
                    metrics on page load times, device capabilities, and server
                    errors.
                  </p>
                  <p className="text-[11px] text-[var(--muted)] font-medium">
                    <em>Lawful Basis:</em> Explicit Consent (NDPA 2023 Section
                    25(1)(a) &amp; GDPR Art. 6(1)(a)).
                  </p>
                </div>

                {/* Category 4 */}
                <div className="p-4 rounded-xl border border-[var(--line)] bg-[#fbfaf7]">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-sm font-bold text-[var(--navy)]">
                      Media Embeds &amp; Interactive
                    </strong>
                    <span className="badge badge-gold !py-0.5 !px-2 text-[9px] uppercase font-bold">
                      Consent-Based
                    </span>
                  </div>
                  <p className="text-zinc-600 mb-2">
                    Permits external media engines (YouTube recital video
                    demonstrations) and Google Maps studio navigation to render
                    seamlessly.
                  </p>
                  <p className="text-[11px] text-[var(--muted)] font-medium">
                    <em>Lawful Basis:</em> Explicit Consent (NDPA 2023 Section
                    25(1)(a) &amp; GDPR Art. 6(1)(a)).
                  </p>
                </div>
              </div>
            </article>

            {/* Section 4 */}
            <article
              id="cookie-inventory"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-gold !py-0.5 !px-2 text-[10px] uppercase font-bold">
                  Audited Registry
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Updated October 2026
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                4. Complete Cookie &amp; Storage Audit Matrix
              </h2>
              <p className="mb-4">
                Below is the exhaustive, transparent inventory of every
                client-side token, cookie, and storage key utilized across
                Vivadoxa Music School's public website and student portal:
              </p>

              <div className="overflow-x-auto rounded-xl border border-[var(--line)] text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#f7f5f0] border-b border-[var(--line)] text-[var(--navy)] font-bold">
                    <tr>
                      <th className="py-3 px-3">Storage Key / Cookie</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Provider</th>
                      <th className="py-3 px-3">Lifespan</th>
                      <th className="py-3 px-3">Functional Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {COOKIE_INVENTORY.map((item) => (
                      <tr
                        key={item.name}
                        className="hover:bg-[#fcfbf9] transition-colors"
                      >
                        <td className="py-3 px-3 font-mono text-[11px] font-bold text-[var(--navy)]">
                          {item.name}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.category === "necessary"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.category === "functional"
                                  ? "bg-blue-100 text-blue-800"
                                  : item.category === "analytics"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-700">
                          {item.provider}
                        </td>
                        <td className="py-3 px-3 text-zinc-600 font-mono text-[11px]">
                          {item.expiry}
                        </td>
                        <td className="py-3 px-3 text-zinc-700 leading-snug">
                          {item.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span>
                  Want to modify which cookies are active on your browser right
                  now?
                </span>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="btn btn-secondary !min-h-[36px] !py-1 !px-3 !text-xs font-semibold !text-[var(--gold-text)] !border-[var(--gold)]/40 hover:!bg-[var(--gold)]/10"
                >
                  Open Cookie Preferences
                </button>
              </div>
            </article>

            {/* Section 5 */}
            <article
              id="minors-protection"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-gold !py-0.5 !px-2 text-[10px] uppercase font-bold">
                  Child Safeguarding
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                5. Protection of Minor Learners (NDPA Section 31 &amp; Child
                Rights Act)
              </h2>
              <p className="mb-3">
                Vivadoxa Music School provides specialized music instruction to
                hundreds of young children and adolescents aged 4 to 17 across
                Kaduna State and Nigeria. In adherence to{" "}
                <strong>
                  Section 31 of the Nigeria Data Protection Act 2023
                </strong>{" "}
                and the <strong>Child Rights Act (2003)</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Absolute Ban on Behavioral Profiling:</strong> We
                  strictly prohibit behavioral ad tracking, programmatic
                  commercial profiling, or algorithmic targeting directed at
                  minor students.
                </li>
                <li>
                  <strong>Zero Commercial Sale of Child Data:</strong> Student
                  registration details, audition media, practice logs, and child
                  photographs are never sold, rented, or leased to marketing
                  brokers or commercial advertising entities.
                </li>
                <li>
                  <strong>Verifiable Guardian Authority:</strong> All
                  applications, admissions agreements, tuition invoices, and
                  data management rights for minors are exercised exclusively
                  through verified parents and legal guardians.
                </li>
              </ul>
            </article>

            {/* Section 6 */}
            <article
              id="third-party"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                6. Third-Party Integrations &amp; Embedded Media
              </h2>
              <p className="mb-3">
                To deliver a premier, interactive educational web experience,
                Vivadoxa integrates select reputable third-party services:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>
                    YouTube Privacy-Enhanced Video Players
                    (youtube-nocookie.com):
                  </strong>{" "}
                  Recital performances and faculty masterclasses are embedded
                  using YouTube's official privacy-enhanced mode (
                  <code>youtube-nocookie.com</code>). This protocol ensures
                  YouTube does not store cookies to personalize ads unless the
                  user explicitly interacts with the video player.
                </li>
                <li>
                  <strong>Google Maps Studio Locator:</strong> An interactive
                  map embed enables students and prospective families to obtain
                  verified turn-by-turn navigation to our physical studio campus
                  in Angwan Sunday, Kaduna.
                </li>
                <li>
                  <strong>PCI-DSS Certified Payment Gateways:</strong> Digital
                  tuition collections are processed securely via accredited
                  payment gateways (Paystack, Flutterwave, and direct bank
                  transfer channels). These partners comply with international
                  PCI-DSS Level 1 security standards and manage payment
                  verification tokens under their respective privacy safeguards.
                </li>
              </ul>
            </article>

            {/* Section 7 */}
            <article
              id="browser-controls"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                7. Browser Controls: Blocking &amp; Deleting Cookies
              </h2>
              <p className="mb-3">
                In addition to using our interactive Cookie Preferences Modal,
                you possess full sovereignty to block, inspect, or delete
                cookies directly within your internet browser settings:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-bold mb-1">
                    Google Chrome (Desktop &amp; Android)
                  </strong>
                  <span>
                    Settings → Privacy and Security → Third-party cookies →
                    Block third-party cookies or Clear browsing data.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-bold mb-1">
                    Apple Safari (macOS &amp; iOS)
                  </strong>
                  <span>
                    Settings → Safari → Privacy &amp; Security → Prevent
                    Cross-Site Tracking and Block All Cookies.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-bold mb-1">
                    Mozilla Firefox
                  </strong>
                  <span>
                    Settings → Privacy &amp; Security → Enhanced Tracking
                    Protection → Select Strict or Custom.
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-bold mb-1">
                    Microsoft Edge
                  </strong>
                  <span>
                    Settings → Cookies and Site Permissions → Manage and delete
                    cookies and site data.
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--muted)]">
                <em>Note:</em> Disabling strictly necessary storage may impair
                essential features such as maintaining your login session inside
                the Vivadoxa Student Portal or processing tuition checkout.
              </p>
            </article>

            {/* Section 8 */}
            <article
              id="dpo-inquiries"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                8. Policy Governance &amp; DPO Inquiries
              </h2>
              <p className="mb-3">
                This Cookie Policy is reviewed periodically to reflect statutory
                changes introduced by the Nigeria Data Protection Commission
                (NDPC) or technological enhancements to our portal. Any material
                adjustments will be updated on this page with a revised "Last
                Updated" timestamp.
              </p>
              <div className="p-5 rounded-2xl bg-[var(--navy)] text-white text-xs space-y-2">
                <p className="text-sm font-semibold text-[var(--gold2)]">
                  Office of the Data Protection Officer (DPO)
                </p>
                <p>
                  Vivadoxa Music School Legal &amp; Regulatory Compliance Unit
                </p>
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
                  Telephone: 09075330330 / 09010267234 (Monday – Friday, 9:00 AM
                  – 5:00 PM WAT)
                </p>
              </div>
            </article>
          </div>

          {/* Bottom Navigation */}
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

export default CookiePolicy
