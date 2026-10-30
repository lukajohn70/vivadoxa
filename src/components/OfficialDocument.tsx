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
    currency?: string
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
    currency?: string
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
      <circle
        cx="50"
        cy="50"
        r="47.5"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke={color}
        strokeWidth="0.9"
        strokeDasharray="2 1.5"
      />
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />

      {/* Text on circular path */}
      <path id="seal-text-top" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
      <text fontSize="5.3" fontWeight="bold" fill={color} letterSpacing="0.9">
        <textPath href="#seal-text-top" startOffset="50%" textAnchor="middle">
          VIVADOXA MUSIC SCHOOL
        </textPath>
      </text>

      <path id="seal-text-bottom" d="M 84,50 A 34,34 0 0,1 16,50" fill="none" />
      <text fontSize="4.6" fontWeight="bold" fill={color} letterSpacing="0.8">
        <textPath
          href="#seal-text-bottom"
          startOffset="50%"
          textAnchor="middle"
        >
          ★ RC 3184525 · KADUNA ★
        </textPath>
      </text>

      {/* Center Shield & Emblem */}
      <circle
        cx="50"
        cy="50"
        r="23"
        fill="rgba(201,107,50,0.06)"
        stroke={color}
        strokeWidth="0.8"
      />
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
function SignatureDirector({ color = "#0b0b0b" }: { color?: string }) {
  return (
    <svg
      width="145"
      height="38"
      viewBox="0 0 145 38"
      fill="none"
      style={{ display: "block" }}
    >
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

function SignatureRegistrar({ color = "#0b0b0b" }: { color?: string }) {
  return (
    <svg
      width="140"
      height="38"
      viewBox="0 0 140 38"
      fill="none"
      style={{ display: "block" }}
    >
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
  const bars = [
    2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 2, 3, 1, 2,
    4, 1, 3, 2, 1, 3, 2, 1, 4, 2,
  ]
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg
        width="150"
        height="22"
        viewBox="0 0 150 22"
        style={{ opacity: 0.8 }}
        aria-hidden="true"
      >
        {bars.map((w, i) => (
          <rect
            key={i}
            x={i * 4.2}
            y="0"
            width={w}
            height="22"
            fill="#1e293b"
          />
        ))}
      </svg>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#64748b",
          letterSpacing: "1px",
          fontWeight: 700,
        }}
      >
        {code}
      </span>
    </div>
  )
}

export function printDocumentElement(elementId: string) {
  const target = document.getElementById(elementId)
  if (!target) {
    window.print()
    return
  }

  try {
    const existingFrame = document.getElementById("vdx-print-frame")
    if (existingFrame) existingFrame.remove()

    const iframe = document.createElement("iframe")
    iframe.id = "vdx-print-frame"
    iframe.style.position = "fixed"
    iframe.style.top = "0"
    iframe.style.left = "0"
    iframe.style.width = "210mm"
    iframe.style.height = "297mm"
    iframe.style.border = "none"
    iframe.style.zIndex = "-9999"
    iframe.style.opacity = "0.01"
    iframe.style.pointerEvents = "none"
    iframe.setAttribute("aria-hidden", "true")
    document.body.appendChild(iframe)

    const frameDoc = iframe.contentWindow?.document
    if (!frameDoc) {
      window.print()
      return
    }

    const headNodes = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((node) => node.outerHTML)
      .join("\n")

    frameDoc.open()
    frameDoc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${document.title || "Vivadoxa Official Document"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${headNodes}
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
    }
    * {
      box-sizing: border-box !important;
    }
    html, body {
      background: #ffffff !important;
      color: #1a1918 !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .no-print { display: none !important; }
    .doc-sheet {
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      margin: 0 auto !important;
      width: 100% !important;
      max-width: 190mm !important;
      padding: 0 !important;
      position: relative !important;
      overflow: visible !important;
      box-sizing: border-box !important;
    }
  </style>
</head>
<body>
  <div style="margin: 0 auto; width: 100%; max-width: 190mm;">
    ${target.outerHTML}
  </div>
</body>
</html>`)
    frameDoc.close()

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch {
        window.print()
      }
    }, 450)
  } catch {
    window.print()
  }
}

export function downloadDocumentHtml(
  elementId: string,
  filename: string,
  title: string,
) {
  const target = document.getElementById(elementId)
  if (!target) return

  const headNodes = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((node) => node.outerHTML)
    .join("\n")

  const cleanFilename = (filename || "Vivadoxa-Official-Document").replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  )

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · Vivadoxa Music School</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  ${headNodes}
  <style>
    :root {
      --gold: #c96b32;
      --gold2: #b35a24;
      --gold-text: #964a1a;
      --gold-text-dark: #e88c52;
      --navy: #0b1a29;
      --navy2: #14283d;
      --ink: #1a1918;
      --muted: #6b6964;
      --line: #e6e4dc;
      --cream: #faf9f5;
    }
    * {
      box-sizing: border-box !important;
    }
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
    }
    html, body {
      background: #f4f2eb;
      color: #1a1918;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .screen-wrapper {
      padding: 24px 16px 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .download-action-bar {
      width: 100%;
      max-width: 190mm;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0b1a29;
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    .download-action-bar button {
      background: #c96b32;
      color: white;
      border: none;
      padding: 8px 18px;
      font-weight: 600;
      font-size: 13px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .download-action-bar button:hover { background: #b35a24; }
    
    .sheet-wrapper {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
    }
    .doc-sheet {
      background: #ffffff !important;
      width: 100% !important;
      max-width: 190mm !important;
      margin: 0 auto !important;
      border: 1px solid #d4cebe !important;
      border-radius: 6px !important;
      padding: 24px 28px !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
      position: relative !important;
      overflow: visible !important;
      box-sizing: border-box !important;
    }
    
    @media print {
      html, body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .screen-wrapper {
        padding: 0 !important;
        display: block !important;
      }
      .no-print, .download-action-bar {
        display: none !important;
      }
      .sheet-wrapper {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
      }
      .doc-sheet {
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 190mm !important;
      }
    }
  </style>
</head>
<body>
  <div class="screen-wrapper">
    <div class="download-action-bar no-print">
      <div>
        <strong style="display:block;font-size:14px;">${title}</strong>
        <span style="font-size:12px;opacity:0.8;">Vivadoxa Music School · Standard A4 Document</span>
      </div>
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>
    <div class="sheet-wrapper">
      ${target.outerHTML}
    </div>
  </div>
</body>
</html>`

  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${cleanFilename}.html`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 300)
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

  const scheduleText =
    data.schedule || "Weekdays (3 days per week) / Weekends (Friday & Saturday)"

  const isUSD =
    data.currency === "USD" ||
    String(data.tuition_fee || "").includes("$") ||
    String(data.schedule || "")
      .toLowerCase()
      .includes("diaspora")
  const currSymbol = isUSD ? "$" : "₦"

  const tuitionNum =
    Number(data.tuition_fee) ||
    (data.planTier === "1-month"
      ? isUSD
        ? 25
        : 20000
      : data.planTier === "3-months"
        ? isUSD
          ? 70
          : 55000
        : data.planTier === "6-months"
          ? isUSD
            ? 125
            : 100000
          : data.planTier === "1-year"
            ? isUSD
              ? 240
              : 195000
            : data.planTier === "2-years"
              ? isUSD
                ? 600
                : 500000
              : data.planTier === "home-lessons"
                ? isUSD
                  ? 90
                  : 70000
                : isUSD
                  ? 70
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
          id="admission-letter-doc"
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
                    color: "var(--navy, #0b0b0b)",
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
                  background: "var(--navy, #0b0b0b)",
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
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10.5,
                  color: "var(--muted, #64748b)",
                  lineHeight: 1.45,
                }}
              >
                Ref:{" "}
                <strong
                  style={{
                    color: "var(--navy, #0b0b0b)",
                    fontFamily: "monospace",
                  }}
                >
                  {refNo}
                </strong>
                <br />
                Date:{" "}
                <strong style={{ color: "var(--navy, #0b0b0b)" }}>
                  {dateStr}
                </strong>
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
              <strong>Admissions Registry:</strong> {SCHOOL_PHONE} ·{" "}
              {SCHOOL_EMAIL}
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
                  color: "var(--navy, #0b0b0b)",
                  fontFamily: "serif",
                  fontWeight: 700,
                }}
              >
                {studentName}
              </h2>
              {(data.email || data.phone) && (
                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--muted, #64748b)",
                    marginTop: 2,
                  }}
                >
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
          <div
            style={{
              fontSize: 12.5,
              lineHeight: 1.65,
              color: "#2d3748",
              marginBottom: 16,
            }}
          >
            <p style={{ margin: 0 }}>
              On behalf of the{" "}
              <strong>
                Academic Board of Governors, Faculty Council, and Directorate of
                Admissions
              </strong>{" "}
              of Vivadoxa Music School, we are pleased to convey official
              provisional admission into the Vivadoxa Music Conservatory for the
              upcoming academic session.
            </p>
            <p style={{ margin: "6px 0 0" }}>
              Following formal appraisal of your application profile, you have
              been accepted into our specialized performance curriculum designed
              to cultivate technical facility, repertoire musicianship, and
              artistic stagecraft under certified conservatory instructors.
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
              <small>Study Mode</small>
              <strong>{studyModeLabel}</strong>
            </div>
            <div>
              <small>Cohort Schedule</small>
              <strong>{scheduleText}</strong>
            </div>
            <div>
              <small>Conservatory Campus</small>
              <strong>
                Vivadoxa Main Studio, 49B Umaru Ibrahim St., Kaduna
              </strong>
            </div>
            <div>
              <small>Tuition Assessment</small>
              <strong style={{ color: "var(--gold-text, #a24a18)" }}>
                {currSymbol}
                {tuitionNum.toLocaleString(isUSD ? "en-US" : "en-NG")}
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
                color: "var(--navy, #0b0b0b)",
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
                <strong>Studio Instrument Allocation:</strong> Arrive at the
                Vivadoxa Studio 15 minutes prior to your allocated cohort time
                for rehearsal room orientation and instrument assignment.
              </li>
              <li style={{ marginBottom: 3 }}>
                <strong>Curriculum &amp; Syllabus:</strong> Enrolled candidates
                will receive their syllabus orientation and digital learning
                guides during the first orientation session.
              </li>
              <li>
                <strong>Recital Eligibility:</strong> A minimum studio
                attendance rate of 80% is mandatory to qualify for the
                end-of-term Public Ensemble Recital and formal award of the
                diploma/certificate.
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
              <SignatureDirector color="var(--navy, #0b0b0b)" />
              <div
                style={{
                  borderTop: "1.5px solid #64748b",
                  width: 175,
                  paddingTop: 4,
                  marginTop: 2,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "var(--navy, #0b0b0b)",
                  }}
                >
                  Frederick Chrysantius
                </strong>
                <div style={{ fontSize: 9.5, color: "var(--muted, #64748b)" }}>
                  Founder &amp; Artistic Director
                </div>
                <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>
                  Vivadoxa Music School Conservatory
                </div>
              </div>
            </div>

            {/* Center: Official Seal */}
            <div style={{ textAlign: "center" }}>
              <AcademicSeal
                color="#c96b32"
                size={90}
                title="ADMISSIONS APPROVED"
              />
            </div>

            {/* Right: Registrar */}
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", textAlign: "left" }}>
                <SignatureRegistrar color="var(--navy, #0b0b0b)" />
                <div
                  style={{
                    borderTop: "1.5px solid #64748b",
                    width: 175,
                    paddingTop: 4,
                    marginTop: 2,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "var(--navy, #0b0b0b)",
                    }}
                  >
                    Academic Board of Studies
                  </strong>
                  <div
                    style={{ fontSize: 9.5, color: "var(--muted, #64748b)" }}
                  >
                    Registrar &amp; Records Division
                  </div>
                  <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>
                    Admissions Verification Unit
                  </div>
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
            <div
              style={{
                fontSize: 8.5,
                color: "#64748b",
                maxWidth: 460,
                lineHeight: 1.4,
              }}
            >
              <strong>OFFICIAL ELECTRONIC CREDENTIAL:</strong> Issued under the
              statutory authority of Vivadoxa Music School (RC 3184525). Any
              unauthorized alteration invalidates this document. Verification of
              authenticity can be performed online at <u>vivadoxa.ng/status</u>{" "}
              with Reference: <strong>{refNo}</strong>.
            </div>
            <SecurityBarcode code={refNo} />
          </div>
        </div>

        {/* Modal Action Bar (Hidden when printed) */}
        <div className="no-print flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-3.5 bg-[rgba(11,26,41,0.95)] backdrop-blur-md p-2.5 sm:p-3 rounded-lg shadow-xl">
          <Button
            variant="ghost"
            onClick={onClose}
            style={{ color: "white" }}
            className="w-full sm:w-auto justify-center"
          >
            Close
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() =>
                downloadDocumentHtml(
                  "admission-letter-doc",
                  `Vivadoxa-Admission-Letter-${refNo}`,
                  "Official Admission Letter",
                )
              }
              variant="secondary"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.25)" }}
              className="w-full sm:w-auto justify-center"
            >
              <Icon name="copy" /> Download Letter
            </Button>
            <Button
              onClick={() => printDocumentElement("admission-letter-doc")}
              className="btn-primary w-full sm:w-auto justify-center"
            >
              <Icon name="copy" /> Print / Save as PDF
            </Button>
          </div>
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

  const isUSD =
    data.currency === "USD" ||
    String(data.amount || "").includes("$") ||
    String(data.method || "")
      .toLowerCase()
      .includes("usd") ||
    String(data.method || "")
      .toLowerCase()
      .includes("flutterwave")
  const currSymbol = isUSD ? "$" : "₦"

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
          id="payment-receipt-doc"
          className="doc-sheet"
          role="region"
          aria-label="Printed Payment Receipt"
        >
          {/* Subtle Watermark */}
          <div
            className="doc-watermark"
            aria-hidden="true"
            style={{ color: "rgba(21, 112, 84, 0.04)" }}
          >
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
                    color: "var(--navy, #0b0b0b)",
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
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10.5,
                  color: "var(--muted, #64748b)",
                  lineHeight: 1.45,
                }}
              >
                Receipt:{" "}
                <strong
                  style={{
                    color: "var(--navy, #0b0b0b)",
                    fontFamily: "monospace",
                  }}
                >
                  {refNo}
                </strong>
                <br />
                Date:{" "}
                <strong style={{ color: "var(--navy, #0b0b0b)" }}>
                  {dateStr}
                </strong>
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
              <strong>Designated Depository:</strong> {BANK_NAME} · A/C:{" "}
              <strong>{BANK_ACCOUNT_NO}</strong> ({BANK_ACCOUNT_NAME})
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
                  color: "var(--navy, #0b0b0b)",
                  fontFamily: "serif",
                  fontWeight: 700,
                }}
              >
                {payer}
              </h2>
              {payerEmail && (
                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--muted, #64748b)",
                    marginTop: 2,
                  }}
                >
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
              background: "linear-gradient(135deg, #0b0b0b, #24201d)",
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
              <span
                style={{
                  color: "#c96b32",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 700,
                }}
              >
                Total Amount Received
              </span>
              <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>
                Official school treasury ledger credit confirmation
              </div>
            </div>
            <strong
              style={{
                fontSize: 26,
                color: "#ffffff",
                fontFamily: "serif",
                letterSpacing: "0.5px",
              }}
            >
              {currSymbol}
              {amountNum.toLocaleString(isUSD ? "en-US" : "en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
              <div
                style={{
                  borderTop: "1.5px solid #64748b",
                  width: 175,
                  paddingTop: 4,
                  marginTop: 2,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "var(--navy, #0b0b0b)",
                  }}
                >
                  Bursary Accounts Unit
                </strong>
                <div style={{ fontSize: 9.5, color: "var(--muted, #64748b)" }}>
                  Directorate of Financial Services
                </div>
                <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>
                  Vivadoxa Music School
                </div>
              </div>
            </div>

            {/* Center: Official Seal */}
            <div style={{ textAlign: "center" }}>
              <AcademicSeal
                color="#157054"
                size={90}
                title="PAYMENT VERIFIED"
              />
            </div>

            {/* Right: Internal Audit */}
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", textAlign: "left" }}>
                <SignatureRegistrar color="#157054" />
                <div
                  style={{
                    borderTop: "1.5px solid #64748b",
                    width: 175,
                    paddingTop: 4,
                    marginTop: 2,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "var(--navy, #0b0b0b)",
                    }}
                  >
                    Internal Audit &amp; Revenue
                  </strong>
                  <div
                    style={{ fontSize: 9.5, color: "var(--muted, #64748b)" }}
                  >
                    Treasury Ledger Reconciliation
                  </div>
                  <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>
                    Kaduna Main Campus
                  </div>
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
            <div
              style={{
                fontSize: 8.5,
                color: "#64748b",
                maxWidth: 460,
                lineHeight: 1.4,
              }}
            >
              <strong>ACCOUNTS LEDGER VOUCHER:</strong> Electronic payment
              confirmation issued by Vivadoxa Music School (RC 3184525). Present
              this voucher alongside your Admission Letter at the Admissions
              Desk.
            </div>
            <SecurityBarcode code={refNo} />
          </div>
        </div>

        {/* Modal Action Bar (Hidden when printed) */}
        <div className="no-print flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-3.5 bg-[rgba(11,26,41,0.95)] backdrop-blur-md p-2.5 sm:p-3 rounded-lg shadow-xl">
          <Button
            variant="ghost"
            onClick={onClose}
            style={{ color: "white" }}
            className="w-full sm:w-auto justify-center"
          >
            Close
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() =>
                downloadDocumentHtml(
                  "payment-receipt-doc",
                  `Vivadoxa-Payment-Receipt-${refNo}`,
                  "Official Payment Receipt",
                )
              }
              variant="secondary"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.25)" }}
              className="w-full sm:w-auto justify-center"
            >
              <Icon name="check" /> Download Receipt
            </Button>
            <Button
              onClick={() => printDocumentElement("payment-receipt-doc")}
              className="btn-primary w-full sm:w-auto justify-center"
            >
              <Icon name="copy" /> Print / Save as PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Official Application Slip Modal ──────────────────────────────────────────
export interface ApplicationSlipProps {
  data: {
    first_name?: string
    last_name?: string
    fullName?: string
    application_no?: string
    program?: string
    study_mode?: string
    skill_level?: string
    tuition_fee?: number | string
    amount?: number | string
    currency?: string
    created_at?: string
    schedule?: string
    planTier?: string
    email?: string
    phone?: string
    dateOfBirth?: string
    dob?: string
    gender?: string
    address?: string
    residentialAddress?: string
    guardianName?: string
    guardianPhone?: string
    guardianRelationship?: string
    sponsor?: string
    status?: string
    class_type?: string
    classType?: string
    state_of_origin?: string
    stateOfOrigin?: string
    state?: string
    marital_status?: string
    maritalStatus?: string
    nationality?: string
    occupation?: string
    session_time?: string
    sessionTime?: string
    duration?: string
    passportPhoto?: string
    signature?: string
  }
  onClose: () => void
}

export function ApplicationSlipModal({ data, onClose }: ApplicationSlipProps) {
  const applicantName =
    data.fullName ||
    `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
    "Applicant"

  const refNo = data.application_no || "VDX-APP-2026-OFFICIAL"
  const program = data.program || "Piano/keyboard"

  const classType =
    data.class_type ||
    data.classType ||
    (data.study_mode === "Home Lessons" ? "Private classes" : "Regular classes")

  const dobStr = data.dob || data.dateOfBirth || "On File"
  const stateOriginStr =
    data.state_of_origin || data.stateOfOrigin || data.state || "Kaduna"
  const maritalStr = data.marital_status || data.maritalStatus || "Single"
  const nationalityStr = data.nationality || "Nigerian"
  const genderStr = data.gender || "Female"
  const occupationStr = data.occupation || "Student"
  const addressStr =
    data.residentialAddress || data.address || "Kaduna, Nigeria"
  const sponsorStr = data.sponsor || data.guardianName || "Self-Sponsored"
  const phoneStr = data.phone || "On File"
  const emailStr = data.email || "On File"

  const sessionTimeStr =
    data.session_time ||
    data.sessionTime ||
    (data.schedule?.toLowerCase().includes("afternoon")
      ? "Afternoon Section (1 PM-4 PM)"
      : data.schedule?.toLowerCase().includes("evening")
        ? "Evening Section (4 PM-7 PM)"
        : "Morning Section (10 AM-1 PM)")

  const durationStr =
    data.duration ||
    (data.planTier === "1-month"
      ? "1 Month"
      : data.planTier === "6-months"
        ? "6 Months"
        : data.planTier === "1-year"
          ? "1 Year"
          : data.planTier === "2-years"
            ? "Special (2 Years Diploma)"
            : data.planTier === "home-lessons"
              ? "Special (Private Classes)"
              : "3 Months")

  const isUSD =
    data.currency === "USD" ||
    String(data.tuition_fee || data.amount || "").includes("$") ||
    String(data.schedule || "")
      .toLowerCase()
      .includes("diaspora")
  const currSymbol = isUSD ? "$" : "₦"

  const tuitionNum =
    Number(data.tuition_fee || data.amount) ||
    (data.planTier === "1-month"
      ? isUSD
        ? 25
        : 20000
      : data.planTier === "3-months"
        ? isUSD
          ? 70
          : 55000
        : data.planTier === "6-months"
          ? isUSD
            ? 125
            : 100000
          : data.planTier === "1-year"
            ? isUSD
              ? 240
              : 195000
            : data.planTier === "2-years"
              ? isUSD
                ? 600
                : 500000
              : data.planTier === "home-lessons"
                ? isUSD
                  ? 90
                  : 70000
                : isUSD
                  ? 70
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

  // Official Section B Interest List from official form docx & updated 17 instrument roster
  const interests = [
    "Alto saxophone",
    "Soprano saxophone",
    "Euphonium",
    "Trumpet",
    "Clarinet",
    "Flute",
    "Piano/keyboard",
    "Bass guitar",
    "Lead guitar",
    "Acoustic guitar",
    "Talking drums",
    "Set drum",
    "Voice training",
    "Studio engineering",
    "Sound engineering",
    "Violin",
    "Ukulele",
    "Intermediate Piano",
  ]

  // Detect whether program matches standard 17 or is custom/other
  const progLower = program.toLowerCase().trim()
  const isInterestMatched = (item: string) => {
    const itemLower = item.toLowerCase().trim()
    if (progLower === itemLower) return true
    if (
      (itemLower.includes("piano") || itemLower.includes("keyboard")) &&
      (progLower.includes("piano") || progLower.includes("keyboard"))
    ) {
      if (
        itemLower.includes("intermediate") &&
        progLower.includes("intermediate")
      )
        return true
      if (
        !itemLower.includes("intermediate") &&
        !progLower.includes("intermediate")
      )
        return true
    }
    if (itemLower.includes("sax") && progLower.includes("sax")) {
      if (itemLower.includes("alto") && progLower.includes("alto")) return true
      if (itemLower.includes("soprano") && progLower.includes("soprano"))
        return true
      if (
        !progLower.includes("alto") &&
        !progLower.includes("soprano") &&
        itemLower === "alto saxophone"
      )
        return true
    }
    if (
      (itemLower === "set drum" || itemLower === "drums") &&
      progLower.includes("drum") &&
      !progLower.includes("talking")
    )
      return true
    return progLower.includes(itemLower) || itemLower.includes(progLower)
  }

  const isOther = !interests.some(isInterestMatched)

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Official Student Application Slip"
    >
      <div style={{ width: "min(820px, 100%)", margin: "auto" }}>
        <div
          id="application-slip-doc"
          className="doc-sheet"
          role="region"
          aria-label="Printed Student Application Slip"
          style={{ padding: "26px 30px" }}
        >
          {/* Subtle Watermark */}
          <div className="doc-watermark" aria-hidden="true">
            VIVADOXA
          </div>

          {/* Top Class Types Selection Bar (Official Form Header) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 12px",
              background: "#faf9f6",
              border: "1px solid var(--line, #e2ded8)",
              borderRadius: 6,
              marginBottom: 14,
              fontSize: 11,
              fontWeight: 600,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {[
              "Regular classes",
              "Private classes",
              "Group classes",
              "Scholarship",
            ].map((t) => {
              const checked = classType
                .toLowerCase()
                .includes(t.toLowerCase().split(" ")[0])
              return (
                <div
                  key={t}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: checked
                        ? "1.5px solid var(--navy, #0b0b0b)"
                        : "1.5px solid #94a3b8",
                      background: checked ? "var(--navy, #0b0b0b)" : "white",
                      color: "white",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span
                    style={{
                      color: checked ? "var(--navy, #0b0b0b)" : "#64748b",
                    }}
                  >
                    {t}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Academic Letterhead Masthead + Passport Photo Box */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              borderBottom: "2px solid var(--navy, #0b0b0b)",
              paddingBottom: 12,
              marginBottom: 12,
            }}
          >
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
                  alt="Vivadoxa Official Crest"
                  style={{
                    width: "auto",
                    height: 44,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 22,
                    lineHeight: 1.1,
                    letterSpacing: "-0.5px",
                    color: "var(--navy, #0b0b0b)",
                    margin: 0,
                  }}
                >
                  VIVADOXA MUSIC SCHOOL
                </h1>
                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                    color: "var(--gold-text, #92400e)",
                    marginTop: 2,
                  }}
                >
                  Office of Admissions &amp; Student Registry · RC 3184525
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--muted, #64748b)",
                    marginTop: 2,
                  }}
                >
                  {SCHOOL_ADDRESS} · Tel: {SCHOOL_PHONE} · {SCHOOL_EMAIL}
                </div>
              </div>
            </div>

            {/* Passport Photograph Frame */}
            <div
              style={{
                width: 88,
                height: 104,
                border: "1.5px dashed var(--gold, #c96b32)",
                borderRadius: 4,
                background: "#faf9f6",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 3,
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {data.passportPhoto ? (
                <img
                  src={data.passportPhoto}
                  alt="Student Passport"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      color: "var(--navy, #0b0b0b)",
                    }}
                  >
                    PASSPORT
                  </span>
                  <span
                    style={{
                      fontSize: 7.5,
                      color: "var(--muted, #64748b)",
                      marginTop: 3,
                      lineHeight: 1.2,
                    }}
                  >
                    Affix Recent Photograph
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Form Title & Reference Bar */}
          <div
            style={{
              background:
                "linear-gradient(90deg, var(--navy, #0b0b0b) 0%, #24201d 100%)",
              color: "white",
              padding: "7px 14px",
              borderRadius: 5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  display: "block",
                }}
              >
                APPLICATION FORM
              </span>
              <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.8)" }}>
                2026/2027 Academic Session · Official Enrollment Record
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: 8.5,
                  textTransform: "uppercase",
                  color: "var(--gold2, #e5ad35)",
                  fontWeight: 700,
                }}
              >
                Registration Ref
              </span>
              <code
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "1px",
                  display: "block",
                }}
              >
                {refNo}
              </code>
            </div>
          </div>

          {/* SECTION A (Personal Data) */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: "var(--navy, #0b0b0b)",
                borderBottom: "1.5px solid var(--gold, #c96b32)",
                paddingBottom: 3,
                marginBottom: 8,
              }}
            >
              <span>SECTION A (Personal Data)</span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  color: "var(--muted, #64748b)",
                  textTransform: "none",
                }}
              >
                Date: <strong>{dateStr}</strong>
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "5px 14px",
                fontSize: 10.5,
              }}
            >
              <div style={{ gridColumn: "span 2" }}>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  NAME:
                </span>{" "}
                <strong
                  style={{
                    fontSize: 11,
                    color: "var(--navy, #0b0b0b)",
                    textDecoration: "underline",
                  }}
                >
                  {applicantName}
                </strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  DOB:
                </span>{" "}
                <strong>{dobStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Nationality:
                </span>{" "}
                <strong>{nationalityStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  State / Province of Origin:
                </span>{" "}
                <strong>{stateOriginStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Marital Status:
                </span>{" "}
                <strong>{maritalStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Gender:
                </span>{" "}
                <strong>{genderStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Occupation:
                </span>{" "}
                <strong>{occupationStr}</strong>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Residential Address:
                </span>{" "}
                <strong>{addressStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Sponsor:
                </span>{" "}
                <strong>{sponsorStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Phone Number:
                </span>{" "}
                <strong>{phoneStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Email:
                </span>{" "}
                <strong>{emailStr}</strong>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)", fontSize: 9.5 }}>
                  Tuition Fee:
                </span>{" "}
                <strong style={{ color: "var(--gold-text, #92400e)" }}>
                  {currSymbol}
                  {tuitionNum.toLocaleString(isUSD ? "en-US" : "en-NG")}
                </strong>
              </div>
            </div>
          </div>

          {/* SECTION B (Interest) */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: "var(--navy, #0b0b0b)",
                borderBottom: "1.5px solid var(--gold, #c96b32)",
                paddingBottom: 3,
                marginBottom: 8,
              }}
            >
              SECTION B (Interest)
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "5px 10px",
                fontSize: 10,
              }}
            >
              {interests.map((item) => {
                const checked = isInterestMatched(item)
                return (
                  <div
                    key={item}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        border: checked
                          ? "1.5px solid var(--navy, #0b0b0b)"
                          : "1px solid #94a3b8",
                        background: checked ? "var(--navy, #0b0b0b)" : "white",
                        color: "white",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8.5,
                        fontWeight: 800,
                      }}
                    >
                      {checked ? "✓" : ""}
                    </span>
                    <span
                      style={{
                        fontWeight: checked ? 700 : 400,
                        color: checked ? "var(--navy, #0b0b0b)" : "#334155",
                      }}
                    >
                      {item}
                    </span>
                  </div>
                )
              })}
              <div
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    border: isOther
                      ? "1.5px solid var(--navy, #0b0b0b)"
                      : "1px solid #94a3b8",
                    background: isOther ? "var(--navy, #0b0b0b)" : "white",
                    color: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 8.5,
                    fontWeight: 800,
                  }}
                >
                  {isOther ? "✓" : ""}
                </span>
                <span
                  style={{
                    fontWeight: isOther ? 700 : 400,
                    color: isOther ? "var(--navy, #0b0b0b)" : "#334155",
                  }}
                >
                  Others: <strong>{isOther ? program : "____________"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION C (Time) & SECTION D (Duration) side by side */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 12,
            }}
          >
            {/* SECTION C (Time) */}
            <div
              style={{
                background: "#faf9f6",
                border: "1px solid var(--line, #e2ded8)",
                borderRadius: 5,
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  color: "var(--navy, #0b0b0b)",
                  borderBottom: "1px solid var(--gold, #c96b32)",
                  paddingBottom: 2,
                  marginBottom: 6,
                }}
              >
                SECTION C (Time)
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  fontSize: 9.5,
                }}
              >
                {[
                  "Morning Section (10 AM-1 PM)",
                  "Afternoon Section (1 PM-4 PM)",
                  "Evening Section (4 PM-7 PM)",
                ].map((s) => {
                  const checked = sessionTimeStr
                    .toLowerCase()
                    .includes(s.toLowerCase().split(" ")[0])
                  return (
                    <div
                      key={s}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 2,
                          border: checked
                            ? "1.5px solid var(--navy, #0b0b0b)"
                            : "1px solid #94a3b8",
                          background: checked
                            ? "var(--navy, #0b0b0b)"
                            : "white",
                          color: "white",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 8.5,
                          fontWeight: 800,
                        }}
                      >
                        {checked ? "✓" : ""}
                      </span>
                      <span
                        style={{
                          fontWeight: checked ? 700 : 400,
                          color: checked ? "var(--navy, #0b0b0b)" : "#475569",
                        }}
                      >
                        {s}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SECTION D (Duration) */}
            <div
              style={{
                background: "#faf9f6",
                border: "1px solid var(--line, #e2ded8)",
                borderRadius: 5,
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  color: "var(--navy, #0b0b0b)",
                  borderBottom: "1px solid var(--gold, #c96b32)",
                  paddingBottom: 2,
                  marginBottom: 6,
                }}
              >
                SECTION D (Duration)
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px 10px",
                  fontSize: 9.5,
                }}
              >
                {["1 Month", "3 Months", "6 Months", "1 Year", "Special"].map(
                  (d) => {
                    const checked =
                      d === "Special"
                        ? durationStr.toLowerCase().includes("special") ||
                          durationStr.toLowerCase().includes("diploma")
                        : durationStr.toLowerCase().startsWith(d.toLowerCase())
                    return (
                      <div
                        key={d}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            border: checked
                              ? "1.5px solid var(--navy, #0b0b0b)"
                              : "1px solid #94a3b8",
                            background: checked
                              ? "var(--navy, #0b0b0b)"
                              : "white",
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 8.5,
                            fontWeight: 800,
                          }}
                        >
                          {checked ? "✓" : ""}
                        </span>
                        <span
                          style={{
                            fontWeight: checked ? 700 : 400,
                            color: checked ? "var(--navy, #0b0b0b)" : "#475569",
                          }}
                        >
                          {d}
                        </span>
                      </div>
                    )
                  },
                )}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 8.5,
                  color: "var(--muted, #64748b)",
                }}
              >
                Track: <strong>{durationStr}</strong> ({currSymbol}
                {tuitionNum.toLocaleString(isUSD ? "en-US" : "en-NG")} · Fixed
                for any instrument chosen)
              </div>
            </div>
          </div>

          {/* DECLARATION (Exact Wording from vivadoxa APPLICATION FORM.docx) */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid var(--navy, #0b0b0b)",
              borderRadius: 6,
              padding: "9px 12px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: "var(--navy, #0b0b0b)",
                marginBottom: 4,
              }}
            >
              DECLARATION
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                lineHeight: 1.5,
                color: "#1e293b",
                fontStyle: "italic",
              }}
            >
              &ldquo;I <strong>{applicantName}</strong> declare that to the best
              of my Knowledge the above information is accurate and I also
              promise to abide by the rules governing the school and promise to
              be of my best behavior.&rdquo;
            </p>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                fontSize: 9.5,
                paddingTop: 4,
                borderTop: "1px dashed var(--line, #e2ded8)",
              }}
            >
              <div>
                <span style={{ color: "var(--muted, #64748b)" }}>
                  Applicant Signature:
                </span>{" "}
                <span
                  style={{
                    fontFamily: "'Brush Script MT', cursive, serif",
                    fontSize: 14,
                    color: "var(--navy, #0b0b0b)",
                  }}
                >
                  {data.signature || applicantName}
                </span>
              </div>
              <div>
                <span style={{ color: "var(--muted, #64748b)" }}>Date:</span>{" "}
                <strong>{dateStr}</strong>
              </div>
            </div>
          </div>

          {/* Dual Signatures & Official Academic Seal */}
          <div
            className="doc-sign-block"
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid var(--line, #e2ded8)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div style={{ flex: 1, minWidth: 150 }}>
              <SignatureRegistrar color="var(--navy, #0b0b0b)" />
              <div
                style={{
                  borderTop: "1.5px solid #64748b",
                  width: 175,
                  paddingTop: 4,
                  marginTop: 2,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: 10.5,
                    color: "var(--navy, #0b0b0b)",
                  }}
                >
                  B. S. Danladi
                </strong>
                <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>
                  Admissions &amp; Registrar
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AcademicSeal />
            </div>
            <div style={{ flex: 1, minWidth: 150, textAlign: "right" }}>
              <div
                style={{
                  fontSize: 8.5,
                  color: "var(--muted, #64748b)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Registry Verification
              </div>
              <strong
                style={{
                  fontSize: 10.5,
                  color: "var(--navy, #0b0b0b)",
                  display: "block",
                  marginTop: 2,
                }}
              >
                Academic Board Clearance
              </strong>
              <div style={{ fontSize: 9, color: "var(--muted, #64748b)" }}>
                Vivadoxa Music School
              </div>
            </div>
          </div>

          {/* Security Verification Footer */}
          <div
            style={{
              marginTop: 10,
              paddingTop: 6,
              borderTop: "1px dashed var(--line, #e2ded8)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 8,
                color: "#64748b",
                maxWidth: 460,
                lineHeight: 1.35,
              }}
            >
              <strong>ACADEMIC REGISTRY RECORD:</strong> Certified admission
              application filed with Vivadoxa Music School (RC 3184525). Present
              alongside payment voucher at our Kaduna campus.
            </div>
            <SecurityBarcode code={refNo} />
          </div>
        </div>

        {/* Modal Action Bar (Hidden when printed) */}
        <div className="no-print flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-3.5 bg-[rgba(11,26,41,0.95)] backdrop-blur-md p-2.5 sm:p-3 rounded-lg shadow-xl">
          <Button
            variant="ghost"
            onClick={onClose}
            style={{ color: "white" }}
            className="w-full sm:w-auto justify-center"
          >
            Close
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() =>
                downloadDocumentHtml(
                  "application-slip-doc",
                  `Vivadoxa-Application-Form-${refNo}`,
                  "Official Application Form",
                )
              }
              variant="secondary"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.25)" }}
              className="w-full sm:w-auto justify-center"
            >
              <Icon name="copy" /> Download Form
            </Button>
            <Button
              onClick={() => printDocumentElement("application-slip-doc")}
              className="btn-primary w-full sm:w-auto justify-center"
            >
              <Icon name="copy" /> Print / Save Application Form (PDF)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
