import React from "react"
import { PageHero, Icon, WhatsAppIcon } from "@/components/ui"
import { SEO } from "@/components/SEO"
import { LegalNav } from "./LegalNav"
import { WHATSAPP_URL } from "@/lib/utils"
import type { Page } from "@/types"

export function TuitionPolicy({ go }: { go: (p: Page | string) => void }) {
  return (
    <>
      <SEO
        title="Tuition, Refund & Instrument Policy — Vivadoxa Music School"
        description="Official tuition rates, installment terms, studio instrument usage, refund criteria, and repair warranties at Vivadoxa Music School."
        canonicalUrl="/tuition-policy"
      />
      <PageHero
        badge="Financial Policy"
        title="Tuition, Refund & Instrument Policy"
        lead="Transparent guidance on term fees, installment schedules, instrument usage options (bringing vs. studio rental), repair warranties, and withdrawal terms."
      />

      <section
        className="section bg-[var(--cream)]"
        style={{ minHeight: "80vh" }}
      >
        <div className="container" style={{ maxWidth: 960 }}>
          <LegalNav
            currentPage="tuition-policy"
            go={go}
            lastUpdated="October 2026"
          />

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
                  Fair Billing &amp; Clear Accountability
                </strong>
                At Vivadoxa Music School, our fee structure directly funds
                world-class instructional faculty, precision-regulated
                instruments, acoustic rehearsal facilities, and student recital
                productions. All financial obligations, refund thresholds, and
                instrument options are outlined below.
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-white p-6 rounded-2xl border border-[var(--line)] mb-10 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--gold)] mb-3">
              Policy Sections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="#fee-structure"
                className="hover:text-[var(--gold)] transition-colors"
              >
                1. Fee Structure &amp; Registration
              </a>
              <a
                href="#payment-methods"
                className="hover:text-[var(--gold)] transition-colors"
              >
                2. Approved Payment Channels
              </a>
              <a
                href="#installments"
                className="hover:text-[var(--gold)] transition-colors"
              >
                3. Installment Billing Schedule
              </a>
              <a
                href="#instrument-options"
                className="hover:text-[var(--gold)] transition-colors"
              >
                4. Instrument Options: Brought vs. Studio vs. Rental
              </a>
              <a
                href="#rental-terms"
                className="hover:text-[var(--gold)] transition-colors"
              >
                5. Home Rental &amp; Courier Delivery
              </a>
              <a
                href="#clinic-warranty"
                className="hover:text-[var(--gold)] transition-colors"
              >
                6. Instrument Hospital &amp; Repair Warranties
              </a>
              <a
                href="#refund-schedule"
                className="hover:text-[var(--gold)] transition-colors"
              >
                7. Official Withdrawal &amp; Refund Schedule
              </a>
              <a
                href="#non-refundable"
                className="hover:text-[var(--gold)] transition-colors"
              >
                8. Non-Refundable Items &amp; Digital Downloads
              </a>
              <a
                href="#bursary-contact"
                className="hover:text-[var(--gold)] transition-colors"
              >
                9. Bursary &amp; Accounts Desk
              </a>
            </div>
          </div>

          {/* Policy Clauses */}
          <div className="space-y-10 text-sm leading-relaxed text-[#3d3935]">
            {/* Section 1 */}
            <article
              id="fee-structure"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                1. Official Program Tuition Schedule
              </h2>
              <p className="mb-3">
                Tuition at Vivadoxa Music School is standardized across all 17
                musical instruments, voice and audio production disciplines,
                strictly adhering to our official approved schedule:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4">
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--gold)] tracking-wider">
                    1-Month Intro Program
                  </span>
                  <strong className="block text-lg font-bold text-[var(--navy)] mt-1">
                    ₦20,000
                  </strong>
                  <small className="text-[11px] text-[var(--muted)]">
                    All instruments &amp; voice. 4 weekly hands-on coaching
                    sessions and foundational rudiments.
                  </small>
                </div>
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--gold)] tracking-wider">
                    3-Months Certificate Program
                  </span>
                  <strong className="block text-lg font-bold text-[var(--navy)] mt-1">
                    ₦55,000
                  </strong>
                  <small className="text-[11px] text-[var(--muted)]">
                    Comprehensive foundational mastery, sight-reading
                    fundamentals, and recital prep.
                  </small>
                </div>
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--gold)] tracking-wider">
                    6-Months Program
                  </span>
                  <strong className="block text-lg font-bold text-[var(--navy)] mt-1">
                    ₦100,000
                  </strong>
                  <small className="text-[11px] text-[var(--muted)]">
                    Intermediate repertoire, harmonic drills, live ensemble
                    rehearsals and stage recital.
                  </small>
                </div>
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--gold)] tracking-wider">
                    12-Months (1-Year) Program
                  </span>
                  <strong className="block text-lg font-bold text-[var(--navy)] mt-1">
                    ₦190,000
                  </strong>
                  <small className="text-[11px] text-[var(--muted)]">
                    Conservatory mastery level, advanced harmonic theory, live
                    studio tracking and solo showcase.
                  </small>
                </div>
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--gold)] tracking-wider">
                    2-Years Diploma Program
                  </span>
                  <strong className="block text-lg font-bold text-[var(--navy)] mt-1">
                    ₦500,000
                  </strong>
                  <small className="text-[11px] text-[var(--muted)]">
                    Full conservatory diploma. Virtuoso repertoire, complete
                    album recording project &amp; Vivadoxa Diploma.
                  </small>
                </div>
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)] sm:col-span-2 lg:col-span-3">
                  <span className="text-[10px] uppercase font-bold text-[var(--gold)] tracking-wider">
                    Home / Private Music Classes
                  </span>
                  <strong className="block text-lg font-bold text-[var(--navy)] mt-1">
                    ₦70,000 / month
                  </strong>
                  <small className="text-[11px] text-[var(--muted)]">
                    Dedicated home instruction by accredited faculty delivered
                    to your residence in Kaduna.
                  </small>
                </div>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>
                  <strong>Uniform Pricing Rule:</strong> Official tuition fees
                  are identical across all 17 musical instruments, voice, and
                  audio production disciplines.
                </li>
                <li>
                  <strong>Sibling Discount:</strong> Families enrolling two or
                  more children concurrently receive a{" "}
                  <strong>10% tuition discount</strong> on the second and
                  subsequent siblings.
                </li>
              </ul>
            </article>

            {/* Section 2 */}
            <article
              id="payment-methods"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                2. Approved Payment Channels
              </h2>
              <p className="mb-3">
                To guarantee financial security and fraud prevention, all
                payments must be routed strictly through official academy
                channels:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">
                    Direct Bank Wire / Instant Transfer
                  </strong>
                  <p className="font-mono text-[11px] text-[var(--ink)]">
                    Bank: Guaranty Trust Bank (GTB)
                  </p>
                  <p className="font-mono text-[11px] text-[var(--ink)]">
                    Account Number: 0236649229
                  </p>
                  <p className="font-mono text-[11px] text-[var(--ink)]">
                    Account Name: Frederick Chrysantius
                  </p>
                  <p className="text-[10px] text-[var(--muted)] mt-1">
                    Proof of transfer must be submitted via the Payment Upload
                    portal.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <strong className="block text-[var(--navy)] font-semibold mb-1">
                    Debit Card / Online Portal
                  </strong>
                  <p className="text-[11px]">
                    Instant settlement via 3D-Secure payment processor on
                    vivadoxa.ng/payment.
                  </p>
                  <p className="text-[10px] text-[var(--muted)] mt-1">
                    Instant electronic receipt issued immediately.
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                <strong>CRITICAL SECURITY NOTICE:</strong> Vivadoxa strictly
                prohibits cash handovers to individual music tutors or external
                instructors. The Academy accepts no liability for payments made
                outside official corporate bank accounts or the Kaduna bursary
                desk.
              </div>
            </article>

            {/* Section 3 */}
            <article
              id="installments"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                3. Installment Billing Schedule
              </h2>
              <p className="mb-3">
                We understand financial planning needs. Families may choose our
                two-installment plan upon written arrangement with the bursary:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <span className="badge badge-gold !py-0.5 !px-2 text-[10px] font-bold">
                    First Installment (60%)
                  </span>
                  <p className="mt-2 text-xs">
                    Due upon admission confirmation or prior to attending{" "}
                    <strong>Week 1</strong> of lessons. Secures student studio
                    schedule and tutor slot.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <span className="badge badge-gold !py-0.5 !px-2 text-[10px] font-bold">
                    Second Installment (40%)
                  </span>
                  <p className="mt-2 text-xs">
                    Due strictly before <strong>Week 5</strong> of the active
                    term. Failure to clear balance may result in temporary
                    lesson suspension.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 4 */}
            <article
              id="instrument-options"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-gold !py-0.5 !px-2 text-[10px] uppercase font-bold">
                  Equipment Protocol
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                4. Instrument Options: Brought vs. Studio-Provided vs. Rental
              </h2>
              <p className="mb-4">
                To maximize flexibility for all learners, candidates specify
                their preferred instrument arrangement during registration:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-sm text-[var(--navy)]">
                      Option A: Student Brings Their Own Instrument
                    </strong>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      No Additional Fee
                    </span>
                  </div>
                  <p className="text-xs text-[#5c5955] mb-2">
                    Applies to portable instruments: guitars (acoustic,
                    electric, bass), violins, violas, flutes, clarinets,
                    saxophones, and brass.
                  </p>
                  <ul className="list-disc pl-5 text-xs text-[#5c5955] space-y-1">
                    <li>
                      Free designated cubby storage provided on lesson days at
                      the Kaduna studio.
                    </li>
                    <li>
                      Instructors provide free tuning and intonation check at
                      the start of each session.
                    </li>
                    <li>
                      Students are responsible for their own strings, reeds, and
                      hard cases.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-sm text-[var(--navy)]">
                      Option B: Academy Studio-Provided Instruments
                    </strong>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                      Included in Studio Tuition
                    </span>
                  </div>
                  <p className="text-xs text-[#5c5955] mb-2">
                    Applies to non-portable or heavy instruments utilized
                    on-site in our rehearsal suites:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-[#5c5955] space-y-1">
                    <li>
                      Acoustic upright and baby grand pianos, weighted 88-key
                      electronic stage keyboards.
                    </li>
                    <li>
                      Full 5-piece acoustic drum kits, cymbals, studio drum
                      monitors.
                    </li>
                    <li>
                      Bass and guitar amplifiers, PA monitors, and recording
                      interface microphones.
                    </li>
                    <li>
                      Zero instrument baggage needed when arriving for your
                      scheduled studio session.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)]">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-sm text-[var(--navy)]">
                      Option C: Academy Instrument Rental (Home Take-Out)
                    </strong>
                    <span className="text-[11px] font-bold text-[var(--gold)] bg-[var(--gold)]/10 px-2 py-0.5 rounded">
                      From ₦8,000 / month
                    </span>
                  </div>
                  <p className="text-xs text-[#5c5955] mb-2">
                    For students who wish to practice at home without making an
                    immediate major purchase:
                  </p>
                  <ul className="list-disc pl-5 text-xs text-[#5c5955] space-y-1">
                    <li>
                      Student takes home a quality vetted violin, student
                      keyboard, acoustic guitar, or student saxophone.
                    </li>
                    <li>
                      Requires a <strong>refundable security deposit</strong>{" "}
                      (returned upon undamaged inspection at term conclusion).
                    </li>
                    <li>
                      Includes padded carry bag, tuner, and care starter kit.
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            {/* Section 5 */}
            <article
              id="rental-terms"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                5. Home Rental &amp; Courier Delivery / Pickup
              </h2>
              <p className="mb-3">
                For candidates selecting Option C (Rental):
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Collection &amp; Inspection:</strong> Instruments may
                  be picked up in person at the Kaduna Studio following a
                  mechanical inspection sign-off, or dispatched via insured
                  local courier directly to your residence.
                </li>
                <li>
                  <strong>Courier Dispatch:</strong> Courier pickup and delivery
                  services are coordinated by our logistics partner across
                  Kaduna metropolis for a flat nominal transit charge.
                </li>
                <li>
                  <strong>Return Condition:</strong> The renter agrees to return
                  the instrument in the same cosmetic and acoustic condition,
                  ordinary string/pad wear excepted.
                </li>
              </ul>
            </article>

            {/* Section 6 */}
            <article
              id="clinic-warranty"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                6. Instrument Hospital &amp; Repair Warranties
              </h2>
              <p className="mb-3">
                All maintenance, setups, and restorations executed through the
                Vivadoxa Instrument Hospital carry our certified guarantee:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>30-Day Workmanship Warranty:</strong> Fret leveling,
                  electronic wiring rewiring, brass ultrasonic valve overhaul,
                  and bridge repairs are warranted against defective workmanship
                  for 30 days post-collection.
                </li>
                <li>
                  <strong>Diagnostic Estimates:</strong> Physical inspection and
                  quotes are provided before any billable work begins. No work
                  proceeds without prior customer approval.
                </li>
                <li>
                  <strong>Unclaimed Instruments:</strong> Repaired instruments
                  unclaimed 60 days following completion notice are subject to a
                  ₦500/week storage fee. Instruments unclaimed after 180 days
                  may be liquidated to offset storage and repair debts.
                </li>
              </ul>
            </article>

            {/* Section 7 */}
            <article
              id="refund-schedule"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                7. Official Withdrawal &amp; Monthly Refund Schedule
              </h2>
              <p className="mb-4">
                Because faculty schedules and studio suites are reserved
                exclusively for each student for the monthly cycle (4 weekly
                lessons), withdrawals are computed according to the following
                schedule:
              </p>

              <div className="hidden sm:block overflow-x-auto no-scrollbar">
                <table className="w-full text-xs text-left border border-[var(--line)] rounded-xl overflow-hidden">
                  <thead className="bg-[#fbfaf7] border-b border-[var(--line)] text-[var(--navy)] font-bold">
                    <tr>
                      <th className="p-3">Time of Written Notice</th>
                      <th className="p-3">Refund Eligibility</th>
                      <th className="p-3">Terms &amp; Deductions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    <tr>
                      <td className="p-3 font-semibold">
                        &gt; 7 days before month begins
                      </td>
                      <td className="p-3 text-emerald-700 font-bold">
                        90% of Monthly Fee
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        10% administrative processing charge
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">
                        1 to 7 days before month begins
                      </td>
                      <td className="p-3 text-emerald-700 font-bold">
                        75% of Monthly Fee
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        25% late cancellation retainer
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">
                        During Week 1 of monthly lessons
                      </td>
                      <td className="p-3 text-amber-700 font-bold">
                        50% of Monthly Fee
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        50% studio and tutor allocation
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">
                        After completion of Week 1
                      </td>
                      <td className="p-3 text-red-600 font-bold">
                        0% for Current Month
                      </td>
                      <td className="p-3 text-[var(--muted)]">
                        Subsequent months cancelled at zero cost
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards (No Sideways Scroll) */}
              <div className="block sm:hidden space-y-3">
                <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[#fbfaf7] space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-[var(--navy)]">
                      &gt; 7 days before month begins
                    </span>
                    <span className="text-emerald-700 font-extrabold whitespace-nowrap">
                      90% Refund
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-[11px] m-0">
                    10% administrative processing charge
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[#fbfaf7] space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-[var(--navy)]">
                      1 to 7 days before month begins
                    </span>
                    <span className="text-emerald-700 font-extrabold whitespace-nowrap">
                      75% Refund
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-[11px] m-0">
                    25% late cancellation retainer
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[#fbfaf7] space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-[var(--navy)]">
                      During Week 1 of lessons
                    </span>
                    <span className="text-amber-700 font-extrabold whitespace-nowrap">
                      50% Refund
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-[11px] m-0">
                    50% studio and tutor allocation
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[#fbfaf7] space-y-1.5 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-[var(--navy)]">
                      After completion of Week 1
                    </span>
                    <span className="text-red-600 font-extrabold whitespace-nowrap">
                      0% Refund
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-[11px] m-0">
                    Subsequent months cancelled at zero cost
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)] text-xs">
                <strong>Medical or Relocation Exemption:</strong> In the event
                of documented medical incapacitation or compulsory
                corporate/military relocation, tuition cannot be refunded as
                cash, but a <strong>Tuition Credit Note</strong> valid for up to{" "}
                <strong>six (6) months</strong> may be issued upon Artistic
                Director approval.
              </div>
            </article>

            {/* Section 8 */}
            <article
              id="non-refundable"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                8. Non-Refundable Items &amp; Digital Downloads
              </h2>
              <p className="mb-2">
                The following fees and purchases are strictly non-refundable
                under all circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>One-time Application &amp; Registration Fee (₦5,000).</li>
                <li>
                  Digital masterclasses, video tutorials, or downloadable PDF
                  workbooks once accessed or downloaded.
                </li>
                <li>
                  Consumable accessory items (reeds, strings, rosin, drumsticks,
                  valve oil).
                </li>
                <li>
                  External exam board fees (ABRSM, MUSON) forwarded directly to
                  testing bodies.
                </li>
              </ul>
            </article>

            {/* Section 9 */}
            <article
              id="bursary-contact"
              className="bg-white p-7 sm:p-9 rounded-2xl border border-[var(--line)] shadow-sm"
            >
              <h2 className="text-xl font-bold font-serif text-[var(--navy)] mb-4">
                9. Bursary &amp; Accounts Desk
              </h2>
              <p className="mb-4">
                For questions regarding invoices, bank transfer reconciliation,
                receipts, or refund requests:
              </p>
              <div className="p-5 rounded-2xl bg-[var(--navy)] text-white text-xs space-y-2">
                <p className="text-sm font-semibold text-[var(--gold2)]">
                  Vivadoxa Bursary &amp; Student Accounts
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
                  Phone: 09075330330 / 09010267234 · WhatsApp: 08031308881
                  (Office Hours: Mon–Fri, 9am–5pm WAT)
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
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
