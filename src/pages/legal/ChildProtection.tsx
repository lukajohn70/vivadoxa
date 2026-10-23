import React from "react"
import { PageHero, Icon, WhatsAppIcon } from "@/components/ui"
import { LegalNav } from "./LegalNav"
import { WHATSAPP_URL } from "@/lib/utils"
import type { Page } from "@/types"

export function ChildProtection({ go }: { go: (p: Page | string) => void }) {
  return (
    <>
      <PageHero
        badge="Safeguarding First"
        title="Child Safeguarding & Welfare Policy"
        lead="Our zero-compromise commitment to creating a safe, transparent, and nurturing musical environment for young learners aged 4–17, in strict compliance with the Child Rights Act."
      />

      <section className="section bg-[var(--cream)]" style={{ minHeight: "80vh" }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <LegalNav currentPage="safeguarding" go={go} lastUpdated="October 2026" />

          {/* Quick Notice */}
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
                  Child Welfare as our Highest Mandate
                </strong>
                Vivadoxa Music School believes that every child and young person, regardless of age, background, gender, or ability, has the fundamental right to learn and express music in an environment free from harm, exploitation, intimidation, or neglect. We strictly observe the <strong>Child Rights Act (2003)</strong> and Kaduna State Child Welfare guidelines.
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-white p-6 rounded-2xl border border-[var(--line)] mb-10 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)] mb-3">
              Safeguarding Framework
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a href="#principles" className="hover:text-[var(--gold)] transition-colors">
                1. Core Safeguarding Principles
              </a>
              <a href="#tutor-vetting" className="hover:text-[var(--gold)] transition-colors">
                2. Faculty Recruitment &amp; Police Vetting
              </a>
              <a href="#studio-environment" className="hover:text-[var(--gold)] transition-colors">
                3. Physical Studio Safeguards &amp; Glass Panels
              </a>
              <a href="#touch-posture" className="hover:text-[var(--gold)] transition-colors">
                4. Physical Touch &amp; Posture Adjustment Code
              </a>
              <a href="#online-safety" className="hover:text-[var(--gold)] transition-colors">
                5. Virtual / Online Lesson Safeguards
              </a>
              <a href="#anti-bullying" className="hover:text-[var(--gold)] transition-colors">
                6. Anti-Bullying &amp; Inclusivity Policy
              </a>
              <a href="#parental-presence" className="hover:text-[var(--gold)] transition-colors">
                7. Guardian Observation &amp; Studio Access
              </a>
              <a href="#reporting" className="hover:text-[var(--gold)] transition-colors">
                8. Reporting Concerns &amp; Investigation Protocol
              </a>
              <a href="#dsl-contact" className="hover:text-[var(--gold)] transition-colors">
                9. Designated Safeguarding Lead (DSL) Contact
              </a>
            </div>
          </div>

          {/* Policy Clauses */}
          <div className="space-y-10 text-sm leading-relaxed text-[#3d3935]">
            {/* Section 1 */}
            <article id="principles" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                1. Core Safeguarding Principles
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>The welfare of the child is paramount in all academic, rehearsal, and recital decisions.</li>
                <li>All children and young adults have the right to equal protection from all types of harm or abuse.</li>
                <li>Working in partnership with children, their parents, carers, and statutory agencies is essential in promoting children's musical development and well-being.</li>
                <li>Transparency is fundamental: parents must have clear visibility into how lessons are conducted, both physically and virtually.</li>
              </ul>
            </article>

            {/* Section 2 */}
            <article id="tutor-vetting" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                2. Faculty Recruitment &amp; Police Vetting
              </h2>
              <p className="mb-3">
                No tutor, teaching assistant, or studio engineer is permitted to work with students without completing our rigorous four-stage screening protocol:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">Police Character Clearance</strong>
                  Mandatory criminal record verification and character clearance obtained via the Nigeria Police Force CID.
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">Dual Academic References</strong>
                  Two independent professional reference checks from recognized universities, conservatories, or school heads.
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">National Identity Verification</strong>
                  NIN and biometric identity verification registered with our institutional registry.
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">Safeguarding Induction</strong>
                  Mandatory annual training in child rights, appropriate boundaries, and signs of distress.
                </div>
              </div>
            </article>

            {/* Section 3 */}
            <article id="studio-environment" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                3. Physical Studio Safeguards &amp; Glass Panels
              </h2>
              <p className="mb-3">
                The architecture of our Kaduna studio has been purposefully configured to maintain 100% optical visibility:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Clear Glass Panels:</strong> Every individual practice suite, ensemble room, and recording booth is equipped with an unobstructed glass viewing window. Windows must never be covered by curtains, posters, or acoustic baffling.
                </li>
                <li>
                  <strong>Open Door Policy:</strong> Studio doors remain ajar unless acoustic recording requires closure, in which case the interior remains fully visible through the glass aperture.
                </li>
                <li>
                  <strong>No Secluded One-on-One Sessions:</strong> No adult tutor may lock themselves inside a room with any student under 18 years of age.
                </li>
                <li>
                  <strong>Common Waiting Area:</strong> A designated reception and seating lounge is maintained with direct line-of-sight to teaching corridors for waiting parents.
                </li>
              </ul>
            </article>

            {/* Section 4 */}
            <article id="touch-posture" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                4. Physical Touch &amp; Posture Adjustment Code
              </h2>
              <p className="mb-3">
                Instrumental and vocal training frequently involves ergonomic adjustments—such as positioning a violin shoulder rest, curving fingers on piano keys, or demonstrating diaphragmatic breath support. Vivadoxa enforces strict parameters:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Verbal &amp; Mirror Demonstration First:</strong> Instructors must first demonstrate posture adjustments on their own instrument or invite the student to observe in a mirror.
                </li>
                <li>
                  <strong>Prior Verbal Explanation &amp; Consent:</strong> If direct hands-on guidance is required (for instance, gently guiding a student's wrist angle), the tutor must explain why it is necessary and ask the student: <em>"May I gently adjust your wrist?"</em>
                </li>
                <li>
                  <strong>Right to Decline:</strong> Any student has the unreserved right to decline physical guidance without penalty or reproach.
                </li>
                <li>
                  <strong>Strictly Non-Intimate Contact:</strong> Any touch is limited strictly to extremities necessary for musical performance (hand, wrist, elbow, forearm, or foot pedal alignment).
                </li>
              </ul>
            </article>

            {/* Section 5 */}
            <article id="online-safety" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                5. Virtual / Online Lesson Safeguards
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Parental Vicinity:</strong> For any virtual lesson involving a minor under 13, a parent or responsible adult must remain present in the room or within immediate earshot.
                </li>
                <li>
                  <strong>Authorized Channels Only:</strong> Virtual lessons take place exclusively via official Vivadoxa institutional video rooms.
                </li>
                <li>
                  <strong>No Private Messaging:</strong> Tutors are strictly prohibited from messaging minor students via private social media (Instagram, Snapchat, personal WhatsApp). All lesson summaries, sheet music, and scheduling reminders are delivered exclusively to the parent's verified contact.
                </li>
                <li>
                  <strong>Dress &amp; Setting:</strong> Both tutors and students must be fully and appropriately attired, with camera views set against neutral backgrounds (study, living room, or music room—never a private bedroom).
                </li>
              </ul>
            </article>

            {/* Section 6 */}
            <article id="anti-bullying" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                6. Anti-Bullying &amp; Inclusivity Policy
              </h2>
              <p className="mb-3">
                Musical development is deeply personal and vulnerable. Vivadoxa enforces zero tolerance for mockery, ridicule, peer exclusion, or harsh pedagogical intimidation:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Constructive, encouraging critique is taught as an artistic discipline.</li>
                <li>Neurodivergent and differently-abled students are welcomed with tailored pacing.</li>
                <li>Any instances of peer-to-peer bullying during ensemble rehearsals or student recitals are addressed immediately through parent consultation and restorative mediation.</li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="parental-presence" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                7. Guardian Observation &amp; Studio Access
              </h2>
              <p className="mb-3">
                Parents and authorized guardians are valued partners in their child's artistic education:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Parents are welcome to attend the first two private lessons of a new term to observe instructor rapport and teaching methodology.</li>
                <li>Parents may request periodic progress observation sessions with the lead instructor.</li>
                <li>Prompt pick-up is mandatory: minors must be collected within 15 minutes of lesson completion. Vivadoxa cannot provide extended childcare after operating hours.</li>
              </ul>
            </article>

            {/* Section 8 */}
            <article id="reporting" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                8. Reporting Concerns &amp; Investigation Protocol
              </h2>
              <p className="mb-3">
                If a child, parent, or staff member has any concern regarding inappropriate conduct, boundary violation, or welfare risk:
              </p>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">Step 1: Immediate Notification</strong>
                  Contact our Designated Safeguarding Lead directly at <a href="mailto:safeguarding@vivadoxa.ng" className="text-[var(--gold)] underline font-mono">safeguarding@vivadoxa.ng</a> or via the emergency line at <strong>+234 803 130 8881</strong>. All reports are treated with absolute confidentiality.
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">Step 2: Precautionary Suspension</strong>
                  In any credible allegation of misconduct toward a minor, the staff member involved is placed on immediate administrative leave pending independent investigation, without presumption of guilt.
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">Step 3: Statutory Referral</strong>
                  Where a threshold of potential child endangerment is met, Vivadoxa will immediately report the incident to the appropriate Kaduna State child protection authorities and the Nigeria Police Force.
                </div>
              </div>
            </article>

            {/* Section 9 */}
            <article id="dsl-contact" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                9. Designated Safeguarding Lead (DSL) Contact
              </h2>
              <p className="mb-4">
                Our Designated Safeguarding Lead is specifically trained to handle child protection inquiries, sensitive welfare reports, and parent concerns:
              </p>
              <div className="p-5 rounded-2xl bg-[var(--navy)] text-white text-xs space-y-2">
                <p className="text-sm font-semibold text-[var(--gold2)]">Designated Safeguarding Lead (DSL)</p>
                <p>Vivadoxa Music School Student Welfare Office</p>
                <p>No. 49B Umaru Ibrahim Street, off Super Market Street beside Angwan Sunday Market, Angwan Sunday, Kaduna, Nigeria</p>
                <p>Confidential Email: <a href="mailto:vivadoxa@gmail.com" className="text-[var(--gold2)] underline font-mono">vivadoxa@gmail.com</a></p>
                <p>Emergency Hotline: 09075330330 / 08031308881 (24/7 for urgent child welfare matters)</p>
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
              <span>Contact Safeguarding Desk</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
