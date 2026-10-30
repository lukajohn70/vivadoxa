import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button, Badge, Field, Icon, PageHero } from "@/components/ui"
import { SEO } from "@/components/SEO"
import { isValidEmail, SCHOOL_PHONE } from "@/lib/utils"
import { checkApplicationStatus } from "@/lib/api"
import {
  AdmissionLetterModal,
  PaymentReceiptModal,
  ApplicationSlipModal,
} from "@/components/OfficialDocument"

export function Status() {
  const [searchParams] = useSearchParams()
  const initialRef = searchParams.get("ref") || ""

  const [email, setEmail] = useState("")
  const [refInput, setRefInput] = useState(initialRef)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [searched, setSearched] = useState(false)
  const [application, setApplication] = useState<any | null>(null)
  const [payment, setPayment] = useState<any | null>(null)
  const [showSlip, setShowSlip] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  // Auto-search if ref is in URL, or show preview if requested
  useEffect(() => {
    if (searchParams.get("previewSlip") === "1") {
      setApplication({
        fullName: "Chinedu Emmanuel Okonkwo",
        application_no: "VDX-2026-0842",
        program: "Piano/keyboard",
        planTier: "6-months",
        study_mode: "Onsite",
        schedule: "Saturday Mornings (Weekly Masterclass)",
        tuition_fee: 100000,
        email: "c.okonkwo@example.com",
        phone: "08031234567",
        address: "No. 12 Constitution Road, Kaduna",
        guardianName: "Elder Samuel Okonkwo",
        guardianPhone: "08029876543",
        guardianRelationship: "Father",
        status: "Submitted",
      })
      setShowSlip(true)
    } else if (searchParams.get("previewLetter") === "1") {
      setApplication({
        fullName: "Chinedu Emmanuel Okonkwo",
        application_no: "VDX-2026-0842",
        program: "Piano/keyboard",
        planTier: "6-months",
        study_mode: "Onsite",
        schedule: "Saturday Mornings (Weekly Masterclass)",
        tuition_fee: 100000,
        email: "c.okonkwo@example.com",
        phone: "08031234567",
        status: "Admitted",
      })
      setShowLetter(true)
    } else if (searchParams.get("previewReceipt") === "1") {
      setPayment({
        reference: "VDX-PAY-2026-8819",
        application_no: "VDX-2026-0842",
        payer_name: "Chinedu Emmanuel Okonkwo",
        payer_email: "c.okonkwo@example.com",
        amount: 100000,
        method: "Bank Transfer (Direct)",
        status: "Confirmed",
        program: "6 Months Program — Piano & Keyboard Mastery",
        created_at: new Date().toISOString(),
      })
      setShowReceipt(true)
    } else if (initialRef) {
      performLookup(initialRef, "")
    }
  }, [initialRef, searchParams])

  async function performLookup(refToFind: string, emailToFind: string) {
    if (!refToFind.trim()) {
      setSearchError("Please enter your application reference.")
      return
    }

    setLoading(true)
    setSearchError("")
    setSearched(true)

    try {
      const res = await checkApplicationStatus(
        refToFind.trim(),
        emailToFind.trim() || undefined,
      )
      if (res && res.success && res.application) {
        setApplication(res.application)
        setPayment(res.payment || null)
      } else {
        setApplication(null)
        setPayment(null)
        setSearchError(
          res.error ||
            "No application record found matching the provided details. Please verify and try again.",
        )
      }
    } catch {
      setSearchError(
        "Unable to retrieve records at this time. Please check your internet connection or contact admissions.",
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!refInput.trim()) {
      setSearchError(
        "Please enter your application reference (e.g. VDX-2026-0001).",
      )
      return
    }
    if (email.trim() && !isValidEmail(email)) {
      setSearchError("Please enter a valid email address.")
      return
    }
    performLookup(refInput, email)
  }

  return (
    <main>
      <SEO
        title="Check Application Status — Vivadoxa Music School Kaduna"
        description="Check your admission application review, audition schedule, or enrollment verification status with Vivadoxa Music School."
        canonicalUrl="/status"
      />
      <PageHero
        eyebrow="Admissions Portal"
        title="Track your application & enrollment."
        body="Enter your application reference number to check your admission review, audition scheduling, and tuition verification status."
        backTo="/"
        backLabel="Back to Home"
      />

      <section className="section status-section">
        <div className="container">
          <form className="status-search" onSubmit={handleSearch} noValidate>
            <Field
              id="status-ref"
              label="Application reference"
              placeholder="e.g. VDX-2026-0184"
              value={refInput}
              onChange={(v) => {
                setRefInput(v)
                setSearchError("")
              }}
              required
            />
            <Field
              id="status-email"
              label="Applicant email address (optional)"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v)
                setSearchError("")
              }}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Checking…" : "Check status"}
            </Button>
            {searchError && (
              <p className="field-hint error full" role="alert">
                {searchError}
              </p>
            )}
          </form>

          {searched && application && (
            <div
              className="status-result"
              role="region"
              aria-label="Application status details"
            >
              <div className="status-top">
                <div>
                  <span className="eyebrow">{application.application_no}</span>
                  <h2>
                    {application.first_name} {application.last_name}
                  </h2>
                  <p style={{ color: "var(--muted)", margin: "4px 0 0" }}>
                    {application.program} · {application.study_mode} (
                    {application.skill_level})
                  </p>
                </div>
                <Badge
                  tone={
                    application.status === "approved"
                      ? "green"
                      : application.status === "rejected"
                        ? "red"
                        : "gold"
                  }
                >
                  {application.status === "approved"
                    ? "Admission confirmed"
                    : application.status === "reviewing"
                      ? "In academic review"
                      : application.status === "rejected"
                        ? "Admission not offered"
                        : "Under review"}
                </Badge>
              </div>

              {/* ── Official Document Downloads Bar ── */}
              <div
                style={{
                  background: "#fbfaf7",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: "16px 18px",
                  margin: "18px 0 24px",
                }}
              >
                <div
                  style={{
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
                      className="eyebrow"
                      style={{ fontSize: 10.5, color: "var(--gold)" }}
                    >
                      Downloadable Website Documents
                    </span>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 14,
                        color: "var(--navy)",
                      }}
                    >
                      Official Enrollment Credentials &amp; Receipts
                    </strong>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>
                    Ref: <code>{application.application_no}</code>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Button
                    variant="secondary"
                    onClick={() => setShowSlip(true)}
                    style={{
                      justifyContent: "center",
                      fontSize: 12,
                      minHeight: 40,
                    }}
                  >
                    <Icon name="copy" size={14} /> Application Slip (PDF)
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (payment) setShowReceipt(true)
                      else
                        alert(
                          "Payment proof is still awaiting bank ledger reconciliation.",
                        )
                    }}
                    style={{
                      justifyContent: "center",
                      fontSize: 12,
                      minHeight: 40,
                    }}
                  >
                    <Icon name="check" size={14} /> Payment Receipt (PDF)
                  </Button>

                  <Button
                    variant={
                      application.status === "approved" && application.letter_released
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() => {
                      if (application.status === "approved" && application.letter_released) {
                        setShowLetter(true)
                      }
                    }}
                    style={{
                      justifyContent: "center",
                      fontSize: 12,
                      minHeight: 40,
                      opacity: application.letter_released ? 1 : 0.5,
                      cursor: application.letter_released ? "pointer" : "default",
                    }}
                  >
                    <Icon name="copy" size={14} />{" "}
                    {application.letter_released ? "Admission Letter (PDF)" : "Letter Not Yet Released"}
                  </Button>
                </div>
              </div>

              {application.status === "approved" ? (
                <div className="admitted">
                  <div className="success-icon">
                    <Icon name="check" size={30} />
                  </div>
                  <h3>Congratulations! You have been accepted to Vivadoxa.</h3>
                  <p>
                    Your admission to the <strong>{application.program}</strong>{" "}
                    course has been verified and confirmed by the academic
                    admissions board.
                  </p>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      padding: "16px 20px",
                      borderRadius: 8,
                      margin: "20px 0",
                      textAlign: "left",
                    }}
                  >
                    <strong>Next Steps for Orientation:</strong>
                    <ul
                      style={{ margin: "8px 0 0 18px", color: "var(--muted)" }}
                    >
                      <li>
                        Class schedules and instructor allocation will be
                        emailed to <strong>{application.email}</strong>.
                      </li>
                      <li>
                        Please visit Vivadoxa Music (No. 49B Umaru Ibrahim St.,
                        beside Angwan Sunday Market, Kaduna) for student
                        instrument allocation and orientation.
                      </li>
                    </ul>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      justifyContent: "center",
                      flexWrap: "wrap",
                      marginTop: 20,
                    }}
                  >
                    {application.letter_released ? (
                      <Button onClick={() => setShowLetter(true)}>
                        <Icon name="copy" /> Download admission letter (PDF)
                      </Button>
                    ) : (
                      <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                        Your official admission letter will be made available once the admissions office completes verification.
                      </p>
                    )}
                    {payment && payment.status === "verified" && (
                      <Button
                        variant="secondary"
                        onClick={() => setShowReceipt(true)}
                      >
                        <Icon name="check" /> Download payment receipt (PDF)
                      </Button>
                    )}
                    <a href={`tel:${SCHOOL_PHONE}`}>
                      <Button variant="ghost">Contact admissions desk</Button>
                    </a>
                  </div>
                </div>
              ) : application.status === "rejected" ? (
                <div className="issue">
                  <h3>Admission status update</h3>
                  <p>
                    We appreciate your interest in Vivadoxa Music School. We are
                    unable to offer an admission place for this academic cohort.
                    For counseling and future openings, please speak with our
                    team.
                  </p>
                  <a href={`tel:${SCHOOL_PHONE}`}>
                    <Button>Contact admissions</Button>
                  </a>
                </div>
              ) : (
                <>
                  <div className="timeline" role="list">
                    {[
                      [
                        "Application submitted",
                        `Registered under ref ${application.application_no}`,
                        true,
                      ],
                      [
                        "Tuition payment matching",
                        payment
                          ? payment.status === "verified"
                            ? `Payment confirmed (₦${Number(payment.amount).toLocaleString()})`
                            : "Transfer details received — accounts matching"
                          : "Awaiting bank transfer verification",
                        payment && payment.status === "verified",
                      ],
                      [
                        "Academic review & placement",
                        application.status === "reviewing"
                          ? "Instructors reviewing course placement"
                          : "Pending payment reconciliation",
                        application.status === "approved",
                      ],
                      [
                        "Admission letter & class orientation",
                        "Issued once verified by faculty",
                        application.status === "approved",
                      ],
                    ].map(([title, desc, isDone], i) => (
                      <div
                        className={isDone ? "done" : ""}
                        key={title as string}
                        role="listitem"
                      >
                        <span aria-hidden="true">
                          {isDone ? (
                            <Icon name="check" size={14} />
                          ) : (
                            String(i + 1)
                          )}
                        </span>
                        <div>
                          <strong>{title as string}</strong>
                          <small>{desc as string}</small>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="notice" role="note">
                    <strong>Payment status:</strong>
                    <p>
                      {payment ? (
                        <>
                          Transaction ref <code>{payment.reference}</code> is{" "}
                          <strong>{payment.status}</strong>. Total recorded: ₦
                          {Number(payment.amount).toLocaleString()}.
                        </>
                      ) : (
                        <>
                          If you have made your bank transfer, please ensure you
                          have submitted proof of payment on the payment page so
                          our ledger can reconcile it.
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          {/* Official Document Modals */}
          {showSlip && application && (
            <ApplicationSlipModal
              data={application}
              onClose={() => setShowSlip(false)}
            />
          )}
          {showLetter && application && (
            <AdmissionLetterModal
              data={application}
              onClose={() => setShowLetter(false)}
            />
          )}
          {showReceipt && payment && (
            <PaymentReceiptModal
              data={payment}
              onClose={() => setShowReceipt(false)}
            />
          )}
        </div>
      </section>
    </main>
  )
}

export default Status
