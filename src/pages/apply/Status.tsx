import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlRef =
    searchParams.get("ref") ||
    searchParams.get("application_no") ||
    searchParams.get("reference") ||
    searchParams.get("code") ||
    searchParams.get("app") ||
    searchParams.get("q") ||
    ""
  const urlEmail = searchParams.get("email") || ""

  const [email, setEmail] = useState(urlEmail)
  const [refInput, setRefInput] = useState(urlRef)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [searched, setSearched] = useState(false)
  const [application, setApplication] = useState<any | null>(null)
  const [payment, setPayment] = useState<any | null>(null)
  const [student, setStudent] = useState<any | null>(null)
  const [applicationsList, setApplicationsList] = useState<any[]>([])

  const [showSlip, setShowSlip] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  // Auto-search if ref or email is in URL, or show preview if requested
  useEffect(() => {
    if (searchParams.get("previewSlip") === "1") {
      setApplication({
        fullName: "Chinedu Emmanuel Okonkwo",
        first_name: "Chinedu",
        last_name: "Okonkwo",
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
        fullName: "John Adamu",
        first_name: "John",
        last_name: "Adamu",
        application_no: "VM/ADM20260026",
        admission_no: "VM/ADM20260026",
        program: "Piano Studies",
        planTier: "6-months",
        study_mode: "Onsite",
        schedule: "Weekdays (3 days per week)",
        tuition_fee: 100000,
        email: "john.adamu@example.com",
        phone: "08031234567",
        status: "approved",
        letter_released: 1,
        created_at: "2026-11-09T10:00:00",
      })
      setShowLetter(true)
    } else if (searchParams.get("previewReceipt") === "1") {
      setPayment({
        reference: "VDX-PAY-2026-8819",
        application_no: "VDX-2026-0842",
        payer_name: "Chinedu Emmanuel Okonkwo",
        payer_email: "c.okonkwo@example.com",
        amount: 100000,
        currency: "NGN",
        method: "Bank Transfer (Direct)",
        status: "verified",
        program: "6 Months Program — Piano & Keyboard Mastery",
        created_at: new Date().toISOString(),
      })
      setShowReceipt(true)
    } else if (urlRef || urlEmail) {
      performLookup(urlRef, urlEmail)
    }
  }, [urlRef, urlEmail, searchParams])

  async function performLookup(refToFind: string, emailToFind: string) {
    const cleanRef = refToFind.trim()
    const cleanEmail = emailToFind.trim()

    if (!cleanRef && !cleanEmail) {
      setSearchError(
        "Please enter your Application Reference Number, registered email, or payment reference.",
      )
      return
    }

    setLoading(true)
    setSearchError("")
    setSearched(true)

    try {
      const res = await checkApplicationStatus(
        cleanRef,
        cleanEmail || undefined,
      )
      if (res && res.success && res.application) {
        setApplication(res.application)
        setPayment(res.payment || null)
        setStudent(res.student || null)
        setApplicationsList(res.applications_list || [])
      } else {
        setApplication(null)
        setPayment(null)
        setStudent(null)
        setApplicationsList([])
        setSearchError(
          res.error ||
            "No admission application found matching the provided details. Please verify your reference or email and try again.",
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
    const cleanRef = refInput.trim()
    const cleanEmail = email.trim()

    if (!cleanRef && !cleanEmail) {
      setSearchError(
        "Please enter your application reference (e.g. VDX-2026-0184) or registered email.",
      )
      return
    }

    if (cleanEmail && !isValidEmail(cleanEmail) && !cleanRef) {
      setSearchError("Please enter a valid email address.")
      return
    }

    performLookup(cleanRef, cleanEmail)
  }

  const isApproved = application?.status === "approved"
  const isTuitionVerified =
    application?.payment_status === "verified" ||
    payment?.status === "verified"

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
        body="Enter your application reference number, registered email, or transaction reference to check your admission review, tuition clearance, and official documents."
        backTo="/"
        backLabel="Back to Home"
      />

      <section className="section status-section">
        <div className="container">
          <form className="status-search" onSubmit={handleSearch} noValidate>
            <Field
              id="status-ref"
              label="Application reference or registered email"
              placeholder="e.g. VDX-2026-0184 or you@example.com"
              value={refInput}
              onChange={(v) => {
                setRefInput(v)
                setSearchError("")
              }}
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
              {/* If multiple applications exist for this candidate */}
              {applicationsList.length > 1 && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 10,
                    padding: "12px 16px",
                    marginBottom: 18,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#166534",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Multiple Applications on File ({applicationsList.length}):
                  </span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {applicationsList.map((app) => {
                      const isCurrent =
                        app.application_no === application.application_no
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => performLookup(app.application_no, "")}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            background: isCurrent ? "var(--navy)" : "white",
                            color: isCurrent ? "white" : "var(--navy)",
                            border: "1px solid var(--line)",
                          }}
                        >
                          {app.application_no} · {app.program} (
                          {app.status})
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

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
                  {student?.student_no && (
                    <div style={{ marginTop: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#15803d",
                          background: "#dcfce7",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        Enrolled Student ID: {student.student_no} ·{" "}
                        {student.cohort || "Active Cohort"}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <Badge
                    tone={
                      isApproved
                        ? "green"
                        : application.status === "rejected"
                          ? "red"
                          : "gold"
                    }
                  >
                    {isApproved
                      ? "Admission confirmed"
                      : application.status === "reviewing"
                        ? "In academic review"
                        : application.status === "rejected"
                          ? "Admission not offered"
                          : "Under review"}
                  </Badge>

                  <Badge tone={isTuitionVerified ? "green" : "gold"}>
                    {isTuitionVerified
                      ? "✓ Tuition Verified"
                      : payment
                        ? "● Payment Reconciling"
                        : "Tuition Payment Due"}
                  </Badge>
                </div>
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
                    variant={isTuitionVerified ? "secondary" : "secondary"}
                    onClick={() => {
                      if (payment || isTuitionVerified) {
                        setShowReceipt(true)
                      } else {
                        alert(
                          "Payment proof is awaiting bank ledger reconciliation. Once approved, your receipt will be unlocked.",
                        )
                      }
                    }}
                    style={{
                      justifyContent: "center",
                      fontSize: 12,
                      minHeight: 40,
                      opacity: isTuitionVerified || payment ? 1 : 0.6,
                    }}
                  >
                    <Icon name="check" size={14} />{" "}
                    {isTuitionVerified
                      ? "Payment Receipt (PDF)"
                      : payment
                        ? "Receipt Pending Verification"
                        : "No Payment Recorded"}
                  </Button>

                  <Button
                    variant={
                      isApproved
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() => {
                      if (isApproved) {
                        setShowLetter(true)
                      } else {
                        alert(
                          "Your official admission letter will be unlocked once faculty admission review is approved.",
                        )
                      }
                    }}
                    style={{
                      justifyContent: "center",
                      fontSize: 12,
                      minHeight: 40,
                      opacity: isApproved ? 1 : 0.5,
                      cursor: isApproved
                        ? "pointer"
                        : "default",
                    }}
                  >
                    <Icon name="copy" size={14} />{" "}
                    {isApproved
                      ? "Admission Letter (PDF)"
                      : "Letter Under Review"}
                  </Button>
                </div>
              </div>

              {isApproved ? (
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
                      <li>
                        Sign in to your{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/portal")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--gold)",
                            textDecoration: "underline",
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          Student &amp; Client Portal
                        </button>{" "}
                        to manage cohort timetables, makeup lesson requests, and fees.
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
                    <Button onClick={() => setShowLetter(true)}>
                      <Icon name="copy" /> Download admission letter (PDF)
                    </Button>

                    {(isTuitionVerified || payment) && (
                      <Button
                        variant="secondary"
                        onClick={() => setShowReceipt(true)}
                      >
                        <Icon name="check" /> Download payment receipt (PDF)
                      </Button>
                    )}

                    <Button
                      variant="primary"
                      onClick={() => navigate("/portal")}
                      style={{ background: "#0b0b0b", color: "#f2a900" }}
                    >
                      Open Student Portal →
                    </Button>

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
                        isTuitionVerified
                          ? `Payment confirmed (₦${Number(payment?.amount || application.tuition_fee).toLocaleString()})`
                          : payment
                            ? "Transfer proof received — awaiting ledger confirmation"
                            : "Awaiting bank transfer verification or card payment",
                        isTuitionVerified,
                      ],
                      [
                        "Academic review & placement",
                        application.status === "reviewing"
                          ? "Instructors reviewing course placement"
                          : "Pending payment reconciliation",
                        isApproved,
                      ],
                      [
                        "Admission letter & class orientation",
                        "Issued once verified by faculty",
                        isApproved,
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
                    {!isTuitionVerified && (
                      <div style={{ marginTop: 12 }}>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(
                              `/payment?ref=${application.application_no}&amount=${application.tuition_fee}&currency=${application.currency || "NGN"}`,
                            )
                          }
                          style={{ fontSize: 12 }}
                        >
                          Submit Payment Proof / Pay Tuition →
                        </Button>
                      </div>
                    )}
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
          {showReceipt && (
            <PaymentReceiptModal
              data={
                payment || {
                  reference: `VDX-PAY-${new Date().getFullYear()}-0001`,
                  application_no: application.application_no,
                  payer_name: `${application.first_name} ${application.last_name}`,
                  payer_email: application.email,
                  amount: application.tuition_fee,
                  currency: application.currency || "NGN",
                  method: "Official Bank Transfer",
                  status: isTuitionVerified ? "verified" : "pending",
                  program: application.program,
                  created_at: new Date().toISOString(),
                }
              }
              onClose={() => setShowReceipt(false)}
            />
          )}
        </div>
      </section>
    </main>
  )
}

export default Status
