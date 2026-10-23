import React from "react"
import { PageHero, Icon, WhatsAppIcon } from "@/components/ui"
import { LegalNav } from "./LegalNav"
import { WHATSAPP_URL } from "@/lib/utils"
import type { Page } from "@/types"

export function Terms({ go }: { go: (p: Page | string) => void }) {
  return (
    <>
      <PageHero
        badge="Enrollment Agreement"
        title="Terms of Service & Studio Agreement"
        lead="The legal agreement governing student enrollment, studio etiquette, attendance, instrument care, and code of conduct at Vivadoxa Music School."
      />

      <section className="section bg-[var(--cream)]" style={{ minHeight: "80vh" }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <LegalNav currentPage="terms" go={go} lastUpdated="October 2026" />

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
                  Legally Binding Enrollment Contract
                </strong>
                By submitting an admission application, paying tuition or registration fees, or attending private/group lessons at Vivadoxa Music School (in-person at our Kaduna studio or live online), you (or your parent/guardian if under 18) enter into a binding agreement governed by these Terms.
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-white p-6 rounded-2xl border border-[var(--line)] mb-10 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)] mb-3">
              Document Contents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a href="#acceptance" className="hover:text-[var(--gold)] transition-colors">
                1. Acceptance &amp; Scope of Service
              </a>
              <a href="#enrollment" className="hover:text-[var(--gold)] transition-colors">
                2. Enrollment, Registration &amp; Cohorts
              </a>
              <a href="#studio-conduct" className="hover:text-[var(--gold)] transition-colors">
                3. Studio Etiquette &amp; Code of Conduct
              </a>
              <a href="#attendance" className="hover:text-[var(--gold)] transition-colors">
                4. Attendance, Punctuality &amp; Make-Up Lessons
              </a>
              <a href="#instrument-care" className="hover:text-[var(--gold)] transition-colors">
                5. Academy Equipment &amp; Instrument Handling
              </a>
              <a href="#personal-property" className="hover:text-[var(--gold)] transition-colors">
                6. Personal Instruments &amp; Liability
              </a>
              <a href="#online-lessons" className="hover:text-[var(--gold)] transition-colors">
                7. Virtual &amp; Hybrid Learning Guidelines
              </a>
              <a href="#intellectual-property" className="hover:text-[var(--gold)] transition-colors">
                8. Intellectual Property &amp; Curriculum Materials
              </a>
              <a href="#suspension" className="hover:text-[var(--gold)] transition-colors">
                9. Suspension &amp; Expulsion Policy
              </a>
              <a href="#governing-law" className="hover:text-[var(--gold)] transition-colors">
                10. Governing Law &amp; Dispute Resolution
              </a>
            </div>
          </div>

          {/* Clauses */}
          <div className="space-y-10 text-sm leading-relaxed text-[#3d3935]">
            {/* Section 1 */}
            <article id="acceptance" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                1. Acceptance &amp; Scope of Service
              </h2>
              <p className="mb-3">
                These Terms of Service ("Terms") constitute a legally enforceable contract between <strong>Vivadoxa Music School (RC 3184525)</strong> ("Vivadoxa", "the Academy", "we") and the enrolled candidate, parent, or legal guardian ("Student", "Guardian", "you").
              </p>
              <p>
                Our services encompass instrumental and vocal instruction, music theory coaching, live masterclasses, digital self-paced courses, instrument repair and clinic maintenance, and ensemble recitals across all academic terms.
              </p>
            </article>

            {/* Section 2 */}
            <article id="enrollment" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                2. Enrollment, Registration &amp; Cohorts
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Admission Confirmation:</strong> A place in any program, cohort, or private studio slot is only secured once the official registration application has been processed, the registration fee paid, and initial tuition cleared.
                </li>
                <li>
                  <strong>Diagnostic Evaluation:</strong> All intermediate and advanced students participate in an initial placement assessment to determine appropriate syllabus level and tutor assignment.
                </li>
                <li>
                  <strong>Monthly Cohort Calendar:</strong> Vivadoxa operates on continuous monthly lesson cohorts (4 sessions per month), scheduled in harmony with the academic year and supplemented by intensive holiday masterclasses.
                </li>
              </ul>
            </article>

            {/* Section 3 */}
            <article id="studio-conduct" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                3. Studio Etiquette &amp; Code of Conduct
              </h2>
              <p className="mb-3">
                Vivadoxa is dedicated to cultivating an atmosphere of artistic discipline, dignity, and creative focus. All attendees must adhere to the following:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Acoustic Decorum:</strong> Shouting, loud disruptions, or unnecessary noise in the corridors and waiting lounges is prohibited to protect active recording and practice sessions.
                </li>
                <li>
                  <strong>Mobile Device Policy:</strong> Mobile phones must be switched to silent or flight mode during lessons and recitals, except when explicitly used as a metronome, tuner, or backing track tool under instructor direction.
                </li>
                <li>
                  <strong>Food &amp; Beverage Restrictions:</strong> No open drinks, beverages, or meals are permitted inside practice suites, keyboard labs, or recording booths. Bottled water with secure screw caps is permitted only away from electronic gear.
                </li>
                <li>
                  <strong>Mutual Respect &amp; Zero Tolerance:</strong> Profanity, physical intimidation, bullying, harassment of tutors, students, or staff will result in immediate suspension without refund.
                </li>
              </ul>
            </article>

            {/* Section 4 */}
            <article id="attendance" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                4. Attendance, Punctuality &amp; Make-Up Lessons
              </h2>
              <p className="mb-3">
                Regular attendance and punctual arrival are essential to musical mastery:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Punctuality:</strong> Lessons begin and conclude strictly at the scheduled time. If a student arrives late, the lesson will still end at the scheduled conclusion time to avoid delaying subsequent students.
                </li>
                <li>
                  <strong>Student Absence &amp; Notice (Private Lessons):</strong> To qualify for a make-up lesson credit, written notice must be submitted to the Admissions Desk at least <strong>48 hours</strong> prior to the scheduled lesson. Absences reported with less than 48 hours notice (excluding documented emergency hospitalizations) are forfeited.
                </li>
                <li>
                  <strong>Make-Up Lesson Cap:</strong> A maximum of <strong>one (1)</strong> make-up lesson may be scheduled per monthly billing cycle (maximum two per calendar quarter). Make-up credits expire at the end of the active month and cannot be rolled over indefinitely or converted into cash.
                </li>
                <li>
                  <strong>Group &amp; Ensemble Classes:</strong> Because ensemble and band rehearsals depend on group dynamics, missed group classes cannot be individually rescheduled or refunded.
                </li>
                <li>
                  <strong>Tutor Absence:</strong> If an instructor is absent due to illness or performance engagement, Vivadoxa will provide an equally qualified senior substitute or reschedule the lesson at no penalty to the student.
                </li>
              </ul>
            </article>

            {/* Section 5 */}
            <article id="instrument-care" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                5. Academy Equipment &amp; Instrument Handling
              </h2>
              <p className="mb-3">
                Our studios house delicate acoustic grand pianos, valve brass instruments, orchestral woodwinds, professional drum kits, and audio engineering hardware:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>Students must wash and dry hands before touching grand pianos, keyboards, and acoustic instruments.</li>
                <li>Instruments must be handled strictly with the posture and mechanical discipline taught by the instructor.</li>
                <li>
                  <strong>Damage Liability:</strong> While normal wear and tear (such as expected guitar string fatigue or drumstick wear) is covered by Vivadoxa, damage caused by gross negligence, misuse, dropping, spills, or willful vandalism will be billed directly to the student or guardian at replacement or certified repair cost.
                </li>
              </ul>
            </article>

            {/* Section 6 */}
            <article id="personal-property" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                6. Personal Instruments &amp; Liability
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>Students who bring their own guitars, violins, brass, or flutes must ensure their instrument cases are clearly labeled with their full name and telephone number.</li>
                <li>
                  Vivadoxa provides designated instrument storage racks during lesson days as a courtesy. However, <strong>Vivadoxa does not accept liability for loss, theft, or damage to personal musical instruments, laptops, or personal valuables left unattended on school premises</strong>. We strongly recommend that high-value instruments be independently insured by their owners.
                </li>
              </ul>
            </article>

            {/* Section 7 */}
            <article id="online-lessons" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                7. Virtual &amp; Hybrid Learning Guidelines
              </h2>
              <p className="mb-3">For students enrolled in our Live Online or Hybrid modalities:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>Students must ensure a stable broadband internet connection, working webcam, microphone, and a quiet, well-lit practice room.</li>
                <li>Lesson camera angles must clearly show both the student's face, hands, and the instrument posture (e.g. keyboard view, fretboard view).</li>
                <li>For students under 13 years of age, a parent or adult guardian must remain within earshot throughout the virtual session.</li>
              </ul>
            </article>

            {/* Section 8 */}
            <article id="intellectual-property" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                8. Intellectual Property &amp; Curriculum Materials
              </h2>
              <p className="mb-3">
                All customized arrangements, pedagogical worksheets, scale sheets, audio backing tracks, and video masterclasses provided by Vivadoxa remain the exclusive intellectual property of Vivadoxa Music School or their respective copyright holders.
              </p>
              <p className="text-xs sm:text-sm">
                Materials are licensed solely for the personal, non-commercial educational use of the enrolled student. Unauthorized copying, distribution, digital resale, or public broadcasting of Vivadoxa curriculum documents is strictly prohibited.
              </p>
            </article>

            {/* Section 9 */}
            <article id="suspension" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                9. Suspension &amp; Expulsion Policy
              </h2>
              <p className="mb-3">
                Vivadoxa reserves the right to immediately suspend or permanently dismiss any student or family from the academy under the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Repeated non-payment of tuition beyond the official grace period.</li>
                <li>Verbal abuse, intimidation, or physical threats directed toward instructors, students, or staff.</li>
                <li>Intentional destruction of studio property or theft.</li>
                <li>Consistent violation of Child Safeguarding protocols.</li>
              </ul>
              <p className="mt-2 text-xs text-[var(--muted)]">
                In cases of expulsion resulting from gross misconduct, all remaining tuition fees are forfeited and no refund shall be issued.
              </p>
            </article>

            {/* Section 10 */}
            <article id="governing-law" className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm">
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                10. Governing Law &amp; Dispute Resolution
              </h2>
              <p className="mb-3">
                These Terms shall be interpreted, construed, and enforced in accordance with the substantive <strong>Laws of Kaduna State</strong> and the <strong>Federal Republic of Nigeria</strong>.
              </p>
              <p className="text-xs sm:text-sm">
                In the event of any disagreement or dispute arising out of or in connection with these Terms or student enrollment, the parties shall first attempt to resolve the matter amicably through direct conference with the Artistic Director. If unresolved within twenty-one (21) days, the matter shall be submitted to the <strong>Kaduna Multi-Door Courthouse (KMDC)</strong> for mediation before resorting to formal litigation.
              </p>
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
              <span>Contact Registrar on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
