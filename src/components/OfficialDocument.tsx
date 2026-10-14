import { Logo, Button, Icon } from "@/components/ui"

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
  }
  onClose: () => void
}

interface PaymentReceiptProps {
  data: {
    reference: string
    application_no?: string
    payer_name: string
    payer_email?: string
    amount: number | string
    method?: string
    created_at?: string
    notes?: string
  }
  onClose: () => void
}

export function AdmissionLetterModal({ data, onClose }: AdmissionLetterProps) {
  const studentName =
    data.fullName ||
    `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
    "Prospective Student"
  const refNo = data.application_no || "VDX-ADM-OFFICIAL"
  const program = data.program || "Piano & Keyboard Performance"
  const studyMode = data.study_mode || "Onsite Studio Lessons"
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
      <div style={{ width: "min(750px, 100%)", margin: "auto" }}>
        <div
          className="doc-sheet"
          role="region"
          aria-label="Printed Admission Letter"
        >
          <div className="doc-watermark" aria-hidden="true">
            VIVADOXA
          </div>

          <div className="doc-header">
            <div>
              <Logo />
              <p style={{ marginTop: 8 }}>
                Vivadoxa Music School · U/Sunday, Television, Kaduna, Nigeria
                <br />
                Telephone: +234 803 130 8881 · Email: admissions@vivadoxa.ng
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  background: "var(--navy)",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 4,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Official Admission Offer
              </span>
              <p style={{ marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                Ref: <strong>{refNo}</strong>
                <br />
                Date: {dateStr}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <small style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>
              To the Candidate:
            </small>
            <h3 style={{ margin: "4px 0 0", fontSize: 20, color: "var(--navy)" }}>
              {studentName}
            </h3>
          </div>

          <p style={{ fontSize: 13, lineHeight: 1.7, color: "#222" }}>
            The Academic Board and Faculty of <strong>Vivadoxa Music School</strong> are
            pleased to formally offer you admission for the upcoming term in our
            accredited music performance curriculum.
          </p>

          <div className="doc-grid">
            <div>
              <small>Course of Study</small>
              <strong>{program}</strong>
            </div>
            <div>
              <small>Study Mode</small>
              <strong>{studyMode}</strong>
            </div>
            <div>
              <small>Term Duration</small>
              <strong>12 Weeks Intensive (Practical & Theory)</strong>
            </div>
            <div>
              <small>Class Campus</small>
              <strong>Vivadoxa Studio, U/Sunday, Television, Kaduna</strong>
            </div>
          </div>

          <div style={{ fontSize: 12, lineHeight: 1.6, color: "#444", marginTop: 15 }}>
            <strong style={{ display: "block", color: "var(--navy)", marginBottom: 4 }}>
              Orientation & Induction Requirements:
            </strong>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                Please arrive at the studio 15 minutes prior to your allocated
                cohort time for studio instrument assignment.
              </li>
              <li>
                Present this official admission letter alongside your payment
                verification receipt at the front desk.
              </li>
              <li>
                For home lessons or online students, your lead instructor will
                contact you to finalize weekly schedule slots.
              </li>
            </ul>
          </div>

          <div className="doc-sign-block">
            <div>
              <div style={{ height: 35, display: "flex", alignItems: "flex-end", fontStyle: "italic", fontFamily: "serif", fontSize: 18, color: "var(--navy)" }}>
                Tomi Adeyemi
              </div>
              <div style={{ borderTop: "1px solid #aaa", width: 180, paddingTop: 4, marginTop: 4 }}>
                <strong style={{ display: "block", fontSize: 11 }}>Director of Admissions</strong>
                <small style={{ fontSize: 9, color: "var(--muted)" }}>Vivadoxa Music School</small>
              </div>
            </div>

            <div className="doc-seal">
              OFFICIAL
              <br />
              SEAL
              <br />
              VIVADOXA
            </div>
          </div>
        </div>

        {/* Modal action bar (Hidden when printed) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            background: "rgba(0,0,0,0.8)",
            padding: "12px 18px",
            borderRadius: 8,
          }}
          className="no-print"
        >
          <Button variant="ghost" onClick={onClose} style={{ color: "white" }}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Icon name="copy" /> Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PaymentReceiptModal({ data, onClose }: PaymentReceiptProps) {
  const refNo = data.reference || "REF-VDX-PAYMENT"
  const appNo = data.application_no || "VDX-STUDENT"
  const payer = data.payer_name || "Applicant / Sponsor"
  const amountNum = Number(data.amount) || 0
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
      <div style={{ width: "min(750px, 100%)", margin: "auto" }}>
        <div
          className="doc-sheet"
          role="region"
          aria-label="Printed Payment Receipt"
        >
          <div className="doc-watermark" aria-hidden="true">
            PAID
          </div>

          <div className="doc-header">
            <div>
              <Logo />
              <p style={{ marginTop: 8 }}>
                Vivadoxa Music School · Official Accounts & Ledger
                <br />
                Guaranty Trust Bank (GTBank) · A/C: 0123456789
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  background: "#157054",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 4,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Payment Verified
              </span>
              <p style={{ marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                Receipt No: <strong>{refNo}</strong>
                <br />
                Date: {dateStr}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <small style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>
              Received From:
            </small>
            <h3 style={{ margin: "4px 0 0", fontSize: 18, color: "var(--navy)" }}>
              {payer}
            </h3>
            {data.payer_email && (
              <small style={{ color: "var(--muted)" }}>{data.payer_email}</small>
            )}
          </div>

          <div className="doc-grid">
            <div>
              <small>Application Number</small>
              <strong>{appNo}</strong>
            </div>
            <div>
              <small>Payment Channel</small>
              <strong>{data.method || "Bank Transfer"}</strong>
            </div>
            <div>
              <small>Tuition Purpose</small>
              <strong>Music Term Enrollment & Instruction Fee</strong>
            </div>
            <div>
              <small>Settlement Status</small>
              <strong style={{ color: "#157054" }}>Full Payment Confirmed</strong>
            </div>
          </div>

          <div
            style={{
              background: "#f4f3ef",
              padding: "16px 20px",
              borderRadius: 6,
              margin: "20px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <small style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase" }}>
                Total Amount Received
              </small>
              <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>
                Official school ledger confirmation
              </div>
            </div>
            <strong style={{ fontSize: 24, color: "var(--navy)" }}>
              ₦{amountNum.toLocaleString("en-NG")}.00
            </strong>
          </div>

          <div className="doc-sign-block">
            <div>
              <div style={{ height: 35, display: "flex", alignItems: "flex-end", fontStyle: "italic", fontFamily: "serif", fontSize: 18, color: "var(--navy)" }}>
                Bursary Accounts
              </div>
              <div style={{ borderTop: "1px solid #aaa", width: 180, paddingTop: 4, marginTop: 4 }}>
                <strong style={{ display: "block", fontSize: 11 }}>Finance & Accounts Office</strong>
                <small style={{ fontSize: 9, color: "var(--muted)" }}>Vivadoxa Music School</small>
              </div>
            </div>

            <div
              className="doc-seal"
              style={{ borderColor: "#157054", color: "#157054" }}
            >
              PAID &
              <br />
              VERIFIED
              <br />
              VIVADOXA
            </div>
          </div>
        </div>

        {/* Modal action bar (Hidden when printed) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            background: "rgba(0,0,0,0.8)",
            padding: "12px 18px",
            borderRadius: 8,
          }}
          className="no-print"
        >
          <Button variant="ghost" onClick={onClose} style={{ color: "white" }}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Icon name="copy" /> Print / Save as PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
