import brandLogo from "@/assets/vivadoxa-logo.png"
import { Button, Icon } from "@/components/ui"
import {
  SCHOOL_ADDRESS,
  SCHOOL_PHONE,
  SCHOOL_PHONE_2,
  SCHOOL_WHATSAPP,
  SCHOOL_EMAIL,
  BANK_NAME,
  BANK_ACCOUNT_NO,
  BANK_ACCOUNT_NAME,
} from "@/lib/utils"

interface AdmissionLetterProps {
  data: {
    first_name?: string
    last_name?: string
    fullName?: string
    application_no?: string
    program?: string
    study_mode?: string
    tuition_fee?: number | string
    created_at?: string
    schedule?: string
    planTier?: string
    email?: string
    phone?: string
  }
  onClose: () => void
}

interface PaymentReceiptProps {
  data: {
    reference?: string
    payment_reference?: string
    application_no?: string
    payer_name?: string
    fullName?: string
    payer_email?: string
    email?: string
    amount?: number | string
    method?: string
    payment_method?: string
    created_at?: string
    notes?: string
    program?: string
    status?: string
  }
  onClose: () => void
}

// ── Official Conservatory Academic Seal ──────────────────────────────────────
function AcademicSeal({
  color = "#c96b32",
  size = 96,
  title = "ADMISSIONS APPROVED",
}: {
  color?: string
  size?: number
  title?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: "block", margin: "auto" }}
      aria-label="Official Vivadoxa Academic Seal"
    >
      {/* Outer decorative ring */}
      <circle cx="50" cy="50" r="47.5" fill="none" stroke={color} strokeWidth="1.5" />
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke={color}
        strokeWidth="0.9"
        strokeDasharray="2 1.5"
      />
      <circle cx="50" cy="50" r="34" fill="none" stroke={color} strokeWidth="1" />

      {/* Text on circular path */}
      <path id="seal-text-top" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
      <text fontSize="5.3" fontWeight="bold" fill={color} letterSpacing="0.9">
        <textPath href="#seal-text-top" startOffset="50%" textAnchor="middle">
          VIVADOXA MUSIC SCHOOL
        </textPath>
      </text>

      <path id="seal-text-bottom" d="M 84,50 A 34,34 0 0,1 16,50" fill="none" />
      <text fontSize="4.6" fontWeight="bold" fill={color} letterSpacing="0.8">
        <textPath href="#seal-text-bottom" startOffset="50%" textAnchor="middle">
          ★ RC 3184525 · KADUNA ★
        </textPath>
      </text>

      {/* Center Shield & Emblem */}
      <circle cx="50" cy="50" r="23" fill="rgba(201,107,50,0.06)" stroke={color} strokeWidth="0.8" />
      <text
        x="50"
        y="45"
        textAnchor="middle"
        fontSize="6.2"
        fontWeight="800"
        fill={color}
        letterSpacing="1.2"
      >
        OFFICIAL
      </text>
      <text
        x="50"
        y="53"
        textAnchor="middle"
        fontSize="5.8"
        fontWeight="800"
        fill={color}
        letterSpacing="1"
      >
        SEAL
      </text>
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontSize="4.2"
        fontWeight="700"
        fill={color}
        letterSpacing="0.8"
      >
        {title}
      </text>

      {/* Stars on sides */}
      <circle cx="15.5" cy="50" r="1.3" fill={color} />
      <circle cx="84.5" cy="50" r="1.3" fill={color} />
    </svg>
  )
}

// ── Realistic Calligraphic Signatures ────────────────────────────────────────
function SignatureDirector({ color = "#0b1a29" }: { color?: string }) {
  return (
    <svg width="145" height="38" viewBox="0 0 145 38" fill="none" style={{ display: "block" }}>
      <path
        d="M 12 28 Q 24 6 36 16 T 52 26 Q 66 10 78 20 T 98 16 Q 112 8 132 18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 28 32 Q 62 28 118 30"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 40 16 Q 46 6 52 20"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function SignatureRegistrar({ color = "#0b1a29" }: { color?: string }) {
  return (
    <svg width="140" height="38" viewBox="0 0 140 38" fill="none" style={{ display: "block" }}>
      <path
        d="M 14 26 Q 30 8 44 20 T 64 16 Q 82 8 100 24 T 124 16"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 22 32 Q 68 29 116 31"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

// ── Security Barcode Strip ───────────────────────────────────────────────────
function SecurityBarcode({ code }: { code: string }) {
  const bars = [2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2, 1, 4, 2]
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width="150" height="22" viewBox="0 0 150 22" style={{ opacity: 0.8 }} aria-hidden="true">
        {bars.map((w, i) => (
          <rect key={i} x={i * 4.2} y="0" width={w} height="22" fill="#1e293b" />
        ))}
      </svg>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", letterSpacing: "1px", fontWeight: 700 }}>
        {code}
      </span>
    </div>
  )
}

// ── Official Admission Letter ────────────────────────────────────────────────
export function AdmissionLetterModal({ data, onClose }: AdmissionLetterProps) {
  const studentName =
    data.fullName ||
    `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
    "Prospective Student"
  const refNo = data.application_no || "VDX-ADM-2026-OFFICIAL"
  const program = data.program || "Piano & Keyboard Performance"

  const trackName =
    data.planTier === "1-month"
      ? "1 Month Intensive Foundation Track"
      : data.planTier === "6-months"
        ? "6 Months Diploma Program (Accredited)"
        : data.planTier === "1-year"
          ? "1 Year Advance Diploma (Mastery Level)"
          : data.planTier === "home-lessons"
            ? "Private Home Lessons Track (1-on-1 at Residence)"
            : "3 Months Certificate Program (Comprehensive)"

  const studyModeLabel =
    data.study_mode === "Home Lessons"
      ? "Private Home Lessons (1-on-1 Coaching at Residence)"
      : data.study_mode === "Online"
        ? "Live Interactive Video Coaching"
        : "Onsite Conservatory Studio Practice"

  const scheduleText = data.schedule || "Weekday Evenings & Weekend Masterclasses"

  const tuitionNum =
    Number(data.tuition_fee) ||
    (data.planTier === "1-month"
      ? 20000
      : data.planTier === "6-months"
        ? 95000
        : data.planTier === "1-year"
          ? 185000
          : data.planTier === "home-lessons"
            ? 50000
            : 55000)

  const dateStr = data.created_at
    ? new Date(data.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Official Admission Letter"
    >
      <div style={{ width: "min(780px, 100%)", margin: "auto" }}>
        <div
          className="doc-sheet"
          role="region"
          aria-label="Printed Admission Letter"
        >
          {/* Subtle Watermark */}
          <div className="doc-watermark" aria-hidden="true">
            VIVADOXA
          </div>

          {/* Academic Letterhead Masthead */}
          <div className="doc-header">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  background: "#000000",
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid rgba(201, 107, 50, 0.4)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={brandLogo}
                  alt="Vivadoxa Music School Logo"
                  style={{ height: 42, width: "auto", display: "block" }}
                />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--navy, #0b1a29)",
                    letterSpacing: "0.5px",
                    lineHeight: 1.15,
                  }}
                >
                  VIVADOXA MUSIC SCHOOL
                </h1>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "var(--gold-text, #a24a18)",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  Conservatory of Music &amp; Performing Arts · RC 3184525
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: "var(--muted, #64748b)",
                    marginTop: 2,
                    fontStyle: "italic",
                  }}
                >
                  Motto: &ldquo;Actualize your passion&rdquo; · Kaduna, Nigeria
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  background: "var(--navy, #0b1a29)",
                  color: "white",
                  fontSize: 9.5,
                  fontWeight: 700,
                  borderRadius: 4,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  border: "1px solid var(--gold, #c96b32)",
                }}
              >
                Official Admission Offer
              </span>
              <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--muted, #64748b)", lineHeight: 1.45 }}>
                Ref: <strong style={{ color: "var(--navy, #0b1a29)", fontFamily: "monospace" }}>{refNo}</strong>
                <br />
                Date: <strong style={{ color: "var(--navy, #0b1a29)" }}>{dateStr}</strong>
                <br />
                Session: <strong>2026 / 2027</strong>
              </div>
            </div>
          </div>

          {/* Registry Address Bar */}
          <div
            style={{
              fontSize: 10,
              color: "#64748b",
              lineHeight: 1.4,
              borderBottom: "1px solid var(--line, #e2ded8)",
              paddingBottom: 10,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <span>
              <strong>Campus:</strong> {SCHOOL_ADDRESS}
            </span>
            <span>
              <strong>Admissions Registry:</strong> {SCHOOL_PHONE} · {SCHOOL_EMAIL}
            </span>
          </div>

          {/* Candidate Clearance Banner */}
          <div
            style={{
              background: "linear-gradient(to right, #fcfbf9, #ffffff)",
              border: "1px solid var(--line, #e2ded8)",
              borderLeft: "4px solid var(--gold, #c96b32)",
              borderRadius: 6,
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 9.5,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 700,
                  color: "var(--gold-text, #a24a18)",
                }}
              >
                Admitted Candidate:
              </span>
              <h2
                style={{
                  margin: "2px 0 0",
                  fontSize: 20,
                  color: "var(--navy, #0b1a29)",
                  fontFamily: "serif",
                  fontWeight: 700,
                }}
              >
                {studentName}
              </h2>
              {(data.email || data.phone) && (
                <div style={{ fontSize: 10.5, color: "var(--muted, #64748b)", marginTop: 2 }}>
                  {data.email} {data.email && data.phone && "·"} {data.phone}
                </div>
              )}
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: 9.5,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--muted, #64748b)",
                  display: "block",
                }}
              >
                Matriculation Clearance
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "var(--green, #157054)",
                  background: "rgba(21, 112, 84, 0.08)",
                  border: "1px solid rgba(21, 112, 84, 0.25)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  marginTop: 2,
                }}
              >
                ● Provisionally Cleared
              </span>
            </div>
          </div>

          {/* Formal Body Text */}
          <div style={{ fontSize: 12.5, lineHeight: 1.65, color: "#2d3748", marginBottom: 16 }}>
            <p style={{ margin: 0 }}>
              On behalf of the <strong>Academic Board of Governors, Faculty Council, and Directorate of Admissions</strong> of Vivadoxa Music School, we are pleased to convey official provisional admission into the Vivadoxa Music Conservatory for the upcoming academic session.
            </p>
            <p style={{ margin: "6px 0 0" }}>
              Following formal appraisal of your application profile, you have been accepted into our specialized performance curriculum designed to cultivate technical facility, repertoire musicianship, and artistic stagecraft under certified conservatory instructors.
            </p>
          </div>

          {/* Matriculation Particulars Ledger */}
          <div className="doc-grid" style={{ margin: "14px 0 16px" }}>
            <div>
              <small>Major Discipline / Instrument</small>
              <strong>{program}</strong>
            </div>
            <div>
              <small>Program Track &amp; Credential</small>
              <strong>{trackName}</strong>
            </div>
            <div>
              <small>Study Mode &amp; Arrangement</small>
              <strong>{studyModeLabel}</strong>
            </div>
            <div>
              <small>Cohort Schedule</small>
              <strong>{scheduleText}</strong>
            </div>
            <div>
              <small>Conservatory Campus</small>
              <strong>Vivadoxa Main Studio, 49B Umaru Ibrahim St., Kaduna</strong>
            </div>
            <div>
              <small>Tuition Assessment</small>
              <strong style={{ color: "var(--gold-text, #a24a18)" }}>
                ₦{tuitionNum.toLocaleString("en-NG")}
              </strong>
            </div>
          </div>

          {/* Mandatory Directives & Orientation Protocol */}
          <div
            style={{
              fontSize: 11,
              lineHeight: 1.55,
              color: "#334155",
              background: "#faf9f6",
              border: "1px solid var(--line, #e2ded8)",
              borderRadius: 6,
              padding: "12px 16px",
              marginTop: 12,
            }}
          >
            <strong
              style={{
                display: "block",
                color: "var(--navy, #0b1a29)",
                fontSize: 11,
                marginBottom: 5,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Orientation &amp; Enrollment Directives:
            </strong>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li style={{ marginBottom: 3 }}>
                <strong>Studio Instrument Allocation:</strong> Arrive at the Vivadoxa Studio 15 minutes prior to your allocated cohort time for rehearsal room orientation and instrument assignment.
              </li>
              <li style={{ marginBottom: 3 }}>
                <strong>Academy Study Kit &amp; Texts:</strong> Enrolled certificate and diploma candidates will receive their official Vivadoxa Academy course textbooks and practice scorebooks during the first orientation session.
              </li>
              <li>
                <strong>Recital Eligibility:</strong> A minimum studio attendance rate of 80% is mandatory to qualify for the end-of-term Public Ensemble Recital and formal award of the diploma/certificate.
              </li>
            </ul>
          </div>

          {/* Dual Signatures & Official Academic Seal */}
          <div
            className="doc-sign-block"
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1.5px solid var(--line, #e2ded8)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            {/* Left: Director */}
            <div>
              <SignatureDirector color="var(--navy, #0b1a29)" />
              <div style={{ borderTop: "1.5px solid #64748b", width: 175, paddingTop: 4, marginTop: 2 }}>
                <strong style={{ display: "block", fontSize: 11, color: "var(--navy, #0b1a29)" }}>
                  Tomi Adeyemi, M.Mus.
                </strong>
                <div style={{ fontSize: 9.5, color: "var(--muted, #64748b)" }}>Director of Academic Admissions</div>
                <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>Vivadoxa Music School Conservatory</div>
              </div>
            </div>

            {/* Center: Official Seal */}
            <div style={{ textAlign: "center" }}>
              <AcademicSeal color="#c96b32" size={90} title="ADMISSIONS APPROVED" />
            </div>

            {/* Right: Registrar */}
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", textAlign: "left" }}>
                <SignatureRegistrar color="var(--navy, #0b1a29)" />
                <div style={{ borderTop: "1.5px solid #64748b", width: 175, paddingTop: 4, marginTop: 2 }}>
                  <strong style={{ display: "block", fontSize: 11, color: "var(--navy, #0b1a29)" }}>
                    Academic Board of Studies
                  </strong>
                  <div style={{ fontSize: 9.5, color: "var(--muted, #64748b)" }}>Registrar &amp; Records Division</div>
                  <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>Admissions Verification Unit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Verification Footer */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 10,
              borderTop: "1px dashed var(--line, #e2ded8)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 8.5, color: "#64748b", maxWidth: 460, lineHeight: 1.4 }}>
              <strong>OFFICIAL ELECTRONIC CREDENTIAL:</strong> Issued under the statutory authority of Vivadoxa Music School (RC 3184525). Any unauthorized alteration invalidates this document. Verification of authenticity can be performed online at <u>vivadoxa.ng/status</u> with Reference: <strong>{refNo}</strong>.
            </div>
            <SecurityBarcode code={refNo} />
          </div>
        </div>

        {/* Modal Action Bar (Hidden when printed) */}
        <div
          className="no-print flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-3.5 bg-[rgba(11,26,41,0.95)] backdrop-blur-md p-2.5 sm:p-3 rounded-lg shadow-xl"
        >
          <Button variant="ghost" onClick={onClose} style={{ color: "white" }} className="w-full sm:w-auto justify-center">
            Close
          </Button>
          <Button onClick={() => window.print()} className="btn-primary w-full sm:w-auto justify-center">
            <Icon name="copy" /> Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Official Payment Receipt & Settlement Clearance ─────────────────────────
export function PaymentReceiptModal({ data, onClose }: PaymentReceiptProps) {
  const refNo = data.reference || data.payment_reference || "REF-VDX-PAYMENT"
  const appNo = data.application_no || "VDX-STUDENT"
  const payer = data.payer_name || data.fullName || "Applicant / Sponsor"
  const amountNum = Number(data.amount) || 0
  const payerEmail = data.payer_email || data.email || ""
  const method = data.method || data.payment_method || "Bank Transfer"
  const program = data.program || "Music Term Enrollment & Instruction"

  const dateStr = data.created_at
    ? new Date(data.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Official Payment Receipt"
    >
      <div style={{ width: "min(780px, 100%)", margin: "auto" }}>
        <div
          className="doc-sheet"
          role="region"
          aria-label="Printed Payment Receipt"
        >
          {/* Subtle Watermark */}
          <div className="doc-watermark" aria-hidden="true" style={{ color: "rgba(21, 112, 84, 0.04)" }}>
            PAID
          </div>

          {/* Header */}
          <div className="doc-header" style={{ borderBottomColor: "#157054" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  background: "#000000",
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid rgba(21, 112, 84, 0.5)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={brandLogo}
                  alt="Vivadoxa Music School Logo"
                  style={{ height: 42, width: "auto", display: "block" }}
                />
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--navy, #0b1a29)",
                    letterSpacing: "0.5px",
                    lineHeight: 1.15,
                  }}
                >
                  VIVADOXA MUSIC SCHOOL
                </h1>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#157054",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  Bursary Directorate · Accounts &amp; Revenue Division
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: "var(--muted, #64748b)",
                    marginTop: 2,
                    fontStyle: "italic",
                  }}
                >
                  RC 3184525 · Official Financial Ledger Voucher
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  background: "#157054",
                  color: "white",
                  fontSize: 9.5,
                  fontWeight: 700,
                  borderRadius: 4,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  border: "1px solid #10b981",
                }}
              >
                Payment Verified
              </span>
              <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--muted, #64748b)", lineHeight: 1.45 }}>
                Receipt: <strong style={{ color: "var(--navy, #0b1a29)", fontFamily: "monospace" }}>{refNo}</strong>
                <br />
                Date: <strong style={{ color: "var(--navy, #0b1a29)" }}>{dateStr}</strong>
                <br />
                Ledger: <strong>Reconciled</strong>
              </div>
            </div>
          </div>

          {/* School Banking Particulars */}
          <div
            style={{
              fontSize: 10,
              color: "#64748b",
              lineHeight: 1.4,
              borderBottom: "1px solid var(--line, #e2ded8)",
              paddingBottom: 10,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <span>
              <strong>Designated Depository:</strong> {BANK_NAME} · A/C: <strong>{BANK_ACCOUNT_NO}</strong> ({BANK_ACCOUNT_NAME})
            </span>
            <span>
              <strong>Registry:</strong> {SCHOOL_PHONE} · {SCHOOL_EMAIL}
            </span>
          </div>

          {/* Payer Particulars Banner */}
          <div
            style={{
              background: "linear-gradient(to right, #f4fbf7, #ffffff)",
              border: "1px solid #d1fae5",
              borderLeft: "4px solid #157054",
              borderRadius: 6,
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 9.5,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 700,
                  color: "#157054",
                }}
              >
                Payer / Student Record:
              </span>
              <h2
                style={{
                  margin: "2px 0 0",
                  fontSize: 20,
                  color: "var(--navy, #0b1a29)",
                  fontFamily: "serif",
                  fontWeight: 700,
                }}
              >
                {payer}
              </h2>
              {payerEmail && (
                <div style={{ fontSize: 10.5, color: "var(--muted, #64748b)", marginTop: 2 }}>
                  {payerEmail}
                </div>
              )}
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: 9.5,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--muted, #64748b)",
                  display: "block",
                }}
              >
                Settlement Status
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#157054",
                  background: "rgba(21, 112, 84, 0.12)",
                  border: "1px solid rgba(21, 112, 84, 0.3)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  marginTop: 2,
                }}
              >
                ✓ Full Payment Confirmed
              </span>
            </div>
          </div>

          {/* Ledger Particulars */}
          <div className="doc-grid" style={{ margin: "14px 0 16px" }}>
            <div>
              <small>Student Application Ref</small>
              <strong>{appNo}</strong>
            </div>
            <div>
              <small>Payment Channel</small>
              <strong>{method}</strong>
            </div>
            <div>
              <small>Tuition Purpose</small>
              <strong>{program}</strong>
            </div>
            <div>
              <small>Academic Session</small>
              <strong>2026 / 2027 Term Matriculation</strong>
            </div>
          </div>

          {/* Amount Paid Callout */}
          <div
            style={{
              background: "linear-gradient(135deg, #0b1a29, #172a3a)",
              color: "white",
              padding: "16px 20px",
              borderRadius: 8,
              margin: "18px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 14px rgba(11, 26, 41, 0.15)",
            }}
          >
            <div>
              <span style={{ color: "#c96b32", fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>
                Total Amount Received
              </span>
              <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>
                Official school treasury ledger credit confirmation
              </div>
            </div>
            <strong style={{ fontSize: 26, color: "#ffffff", fontFamily: "serif", letterSpacing: "0.5px" }}>
              ₦{amountNum.toLocaleString("en-NG")}.00
            </strong>
          </div>

          {/* Signatures & Bursar Seal */}
          <div
            className="doc-sign-block"
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop: "1.5px solid var(--line, #e2ded8)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            {/* Left: Accounts */}
            <div>
              <SignatureDirector color="#157054" />
              <div style={{ borderTop: "1.5px solid #64748b", width: 175, paddingTop: 4, marginTop: 2 }}>
                <strong style={{ display: "block", fontSize: 11, color: "var(--navy, #0b1a29)" }}>
                  Bursary Accounts Unit
                </strong>
                <div style={{ fontSize: 9.5, color: "var(--muted, #64748b)" }}>Directorate of Financial Services</div>
                <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>Vivadoxa Music School</div>
              </div>
            </div>

            {/* Center: Official Seal */}
            <div style={{ textAlign: "center" }}>
              <AcademicSeal color="#157054" size={90} title="PAYMENT VERIFIED" />
            </div>

            {/* Right: Internal Audit */}
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", textAlign: "left" }}>
                <SignatureRegistrar color="#157054" />
                <div style={{ borderTop: "1.5px solid #64748b", width: 175, paddingTop: 4, marginTop: 2 }}>
                  <strong style={{ display: "block", fontSize: 11, color: "var(--navy, #0b1a29)" }}>
                    Internal Audit &amp; Revenue
                  </strong>
                  <div style={{ fontSize: 9.5, color: "var(--muted, #64748b)" }}>Treasury Ledger Reconciliation</div>
                  <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>Kaduna Main Campus</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Verification Footer */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 10,
              borderTop: "1px dashed var(--line, #e2ded8)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 8.5, color: "#64748b", maxWidth: 460, lineHeight: 1.4 }}>
              <strong>ACCOUNTS LEDGER VOUCHER:</strong> Electronic payment confirmation issued by Vivadoxa Music School (RC 3184525). Present this voucher alongside your Admission Letter at the Admissions Desk.
            </div>
            <SecurityBarcode code={refNo} />
          </div>
        </div>

        {/* Modal Action Bar (Hidden when printed) */}
        <div
          className="no-print flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-3.5 bg-[rgba(11,26,41,0.95)] backdrop-blur-md p-2.5 sm:p-3 rounded-lg shadow-xl"
        >
          <Button variant="ghost" onClick={onClose} style={{ color: "white" }} className="w-full sm:w-auto justify-center">
            Close
          </Button>
          <Button onClick={() => window.print()} className="btn-primary w-full sm:w-auto justify-center">
            <Icon name="copy" /> Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
