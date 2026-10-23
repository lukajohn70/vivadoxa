import { useState, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  Logo,
  Button,
  Icon,
  Badge,
  Field,
  UploadZone,
  Success,
} from "@/components/ui"
import {
  BANK_NAME,
  BANK_ACCOUNT_NO,
  BANK_ACCOUNT_NAME,
} from "@/lib/utils"
import { submitPaymentProof } from "@/lib/api"
import type { Page } from "@/types"

interface PaymentProofForm {
  payerName: string
  payerEmail: string
  paymentDate: string
  amountPaid: string
  transactionRef: string
  receiptFile: FileList | null
}

export function Payment({ go }: { go: (p: Page | string) => void }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const refParam = searchParams.get("ref")
  const amountParam = searchParams.get("amount")

  const appRef = useMemo(() => {
    return (
      refParam ||
      sessionStorage.getItem("vdx_current_ref") ||
      "VDX-" + new Date().getFullYear() + "-0101"
    )
  }, [refParam])

  const defaultAmount = useMemo(() => {
    const raw =
      amountParam || sessionStorage.getItem("vdx_current_amount") || "35000"
    return Number(raw) || 35000
  }, [amountParam])

  const studentName = useMemo(() => {
    return sessionStorage.getItem("vdx_current_name") || ""
  }, [])

  const studentEmail = useMemo(() => {
    return sessionStorage.getItem("vdx_current_email") || ""
  }, [])

  const studentProgram = useMemo(() => {
    return (
      sessionStorage.getItem("vdx_current_program") || "Piano & Keyboard"
    )
  }, [])

  const [method, setMethod] = useState<"bank" | "online">("bank")
  const [proof, setProof] = useState<PaymentProofForm>({
    payerName: studentName,
    payerEmail: studentEmail,
    paymentDate: new Date().toISOString().split("T")[0],
    amountPaid: String(defaultAmount),
    transactionRef: "",
    receiptFile: null,
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof PaymentProofForm, string>>
  >({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [sent, setSent] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState(false)

  function setP<K extends keyof PaymentProofForm>(
    k: K,
    v: PaymentProofForm[K],
  ) {
    setProof((p) => ({ ...p, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
    setSubmitError("")
  }

  function validateProof(): boolean {
    const e: typeof errors = {}
    if (!proof.payerName.trim()) e.payerName = "Payer name is required."
    if (!proof.paymentDate) e.paymentDate = "Payment date is required."
    if (!proof.amountPaid.trim() || Number(proof.amountPaid) <= 0)
      e.amountPaid = "Valid amount is required."
    if (!proof.transactionRef.trim())
      e.transactionRef = "Bank transaction reference/narration is required."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateProof()) return

    setSubmitting(true)
    setSubmitError("")

    try {
      const res = await submitPaymentProof({
        applicationNo: appRef,
        payerName: proof.payerName,
        payerEmail: proof.payerEmail || studentEmail,
        amountPaid: Number(proof.amountPaid),
        transactionRef: proof.transactionRef,
        paymentDate: proof.paymentDate,
        method: "Bank Transfer",
      })

      if (res && res.success) {
        setSent(true)
      } else {
        setSubmitError(
          res.error ||
            "Unable to log payment proof. Please check your details and try again.",
        )
      }
    } catch {
      setSubmitError(
        "Network communication error. Please check your connection.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  function copyBankDetails() {
    navigator.clipboard.writeText(BANK_ACCOUNT_NO).catch(() => {})
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2500)
  }

  if (sent) {
    return (
      <main className="confirmation">
        <Success
          title="Payment logged. Verification in progress."
          body="Your transfer proof has been recorded in our admissions and accounts ledger. Our financial department will verify the transaction and notify you via email."
          extra={`Application reference: ${appRef}`}
          onReset={() => go(`/status?ref=${appRef}`)}
          action="Check admission & payment status"
        />
      </main>
    )
  }

  return (
    <main className="payment-page">
      <div className="container">
        <div className="payment-head">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) navigate(-1)
                else go("apply")
              }}
              className="btn btn-secondary !min-h-[36px] !py-1 !px-3 !text-xs inline-flex items-center gap-1.5 cursor-pointer"
              title="Return to application"
              aria-label="Go back to previous page"
            >
              <Icon name="arrow" size={13} className="rotate-180" />
              <span>Back</span>
            </button>
            <button
              className="logo-button"
              onClick={() => go("home")}
              aria-label="Go to homepage"
            >
              <Logo />
            </button>
          </div>
          <Badge tone="green">Verified payment channel</Badge>
        </div>

        <div className="pay-grid">
          <section>
            <span className="eyebrow">Tuition Payment</span>
            <h1>Secure your admission</h1>
            <p>
              Transfer tuition into the Vivadoxa school account below, then submit
              your payment reference for immediate ledger matching.
            </p>

            {/* Method tabs */}
            <div
              className="payment-tabs"
              role="tablist"
              aria-label="Payment method"
            >
              <button
                role="tab"
                aria-selected={method === "bank"}
                className={method === "bank" ? "active" : ""}
                onClick={() => setMethod("bank")}
              >
                <i aria-hidden="true" />
                <div>
                  <strong>Official Bank Transfer</strong>
                  <small>Direct ledger confirmation</small>
                </div>
                <Badge tone="green">Available</Badge>
              </button>
              <button
                role="tab"
                aria-selected={method === "online"}
                className={method === "online" ? "active" : ""}
                onClick={() => setMethod("online")}
              >
                <i aria-hidden="true" />
                <div>
                  <strong>Online Card / USSD</strong>
                  <small>Instant automated checkout</small>
                </div>
                <Badge tone="gold">Available soon</Badge>
              </button>
            </div>

            {method === "bank" ? (
              <div className="bank-card">
                {/* Account details */}
                <div className="bank-title">
                  <div
                    className="bank-logo"
                    style={{ background: "#00b875", color: "white", fontWeight: 800, fontSize: 18 }}
                    aria-hidden="true"
                  >
                    O
                  </div>
                  <div>
                    <strong>{BANK_NAME}</strong>
                    <span>
                      Transfer exactly ₦{defaultAmount.toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>
                <div className="account-number" style={{ background: "var(--navy)", borderRadius: 12, padding: "20px 24px" }}>
                  <div>
                    <small style={{ color: "#9dacb8", letterSpacing: "1px", textTransform: "uppercase", fontSize: 10, fontWeight: 700 }}>
                      Official Tuition Account ({BANK_NAME})
                    </small>
                    <strong style={{ fontSize: "clamp(20px, 6vw, 28px)", letterSpacing: "2px", fontFamily: "monospace", color: "white" }}>
                      {BANK_ACCOUNT_NO}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={copyBankDetails}
                    aria-label="Copy account number"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "white",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Icon name="copy" /> {copiedAccount ? "Copied!" : "Copy"}
                  </button>
                </div>
                <dl>
                  <div>
                    <dt>Account Name</dt>
                    <dd>{BANK_ACCOUNT_NAME}</dd>
                  </div>
                  <div>
                    <dt>Transfer Reference / Narration</dt>
                    <dd className="ref-highlight">{appRef}</dd>
                  </div>
                </dl>

                {/* Proof of payment form */}
                <div className="proof">
                  <h3>Submit transfer verification details</h3>
                  <p>
                    Please provide your transfer details below so our accounts
                    team can match your payment.
                  </p>
                  <form onSubmit={handlePaymentSubmit} noValidate>
                    <div className="form-grid">
                      <Field
                        id="pay-payer"
                        label="Payer full name"
                        placeholder="Name on bank account used"
                        value={proof.payerName}
                        onChange={(v) => setP("payerName", v)}
                        required
                        error={errors.payerName}
                      />
                      <Field
                        id="pay-email"
                        label="Payer email address"
                        type="email"
                        placeholder="you@example.com"
                        value={proof.payerEmail}
                        onChange={(v) => setP("payerEmail", v)}
                      />
                      <Field
                        id="pay-date"
                        label="Payment date"
                        type="date"
                        value={proof.paymentDate}
                        onChange={(v) => setP("paymentDate", v)}
                        required
                        error={errors.paymentDate}
                      />
                      <Field
                        id="pay-amount"
                        label="Amount paid (₦)"
                        placeholder={defaultAmount.toLocaleString("en-NG")}
                        value={proof.amountPaid}
                        onChange={(v) => setP("amountPaid", v)}
                        required
                        error={errors.amountPaid}
                      />
                      <Field
                        id="pay-ref"
                        label="Bank transaction reference / narration"
                        placeholder="Session ID or transfer narration"
                        value={proof.transactionRef}
                        onChange={(v) => setP("transactionRef", v)}
                        required
                        error={errors.transactionRef}
                      />
                    </div>
                    <UploadZone
                      label="Upload transfer receipt (optional)"
                      hint="JPG, PNG or PDF · Max 10MB"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(files) => setP("receiptFile", files)}
                      fileName={proof.receiptFile?.[0]?.name}
                    />

                    {submitError && (
                      <div
                        className="login-error"
                        role="alert"
                        style={{ marginTop: 16 }}
                      >
                        <Icon name="warning" size={16} />
                        {submitError}
                      </div>
                    )}

                    <Button type="submit" disabled={submitting} fullWidth>
                      {submitting ? (
                        "Submitting verification…"
                      ) : (
                        <>
                          Confirm & submit proof of payment{" "}
                          <Icon name="arrow" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="coming-card">
                <div className="lock" aria-hidden="true">
                  ◇
                </div>
                <h3>Online automated payments</h3>
                <p>
                  Direct debit card and bank USSD payment processing via
                  Paystack is currently undergoing final settlement setup. Please
                  use our direct bank transfer channel above for immediate
                  enrollment.
                </p>
                <Button onClick={() => setMethod("bank")}>
                  Pay via Bank Transfer
                </Button>
              </div>
            )}
          </section>

          {/* Order summary sidebar */}
          <aside className="order-card">
            <h3>Admission summary</h3>
            <div className="applicant">
              <span aria-hidden="true">
                {(studentName || "ST").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{studentName || "Applicant"}</strong>
                <small>{appRef}</small>
              </div>
            </div>
            <dl>
              <div>
                <dt>Program</dt>
                <dd>{studentProgram}</dd>
              </div>
              <div>
                <dt>Billing</dt>
                <dd>Monthly tuition schedule (4 weeks)</dd>
              </div>
              <div>
                <dt>Campus</dt>
                <dd>Vivadoxa Kaduna</dd>
              </div>
            </dl>
            <div className="amount">
              <span>Tuition amount due</span>
              <strong>₦{defaultAmount.toLocaleString("en-NG")}</strong>
              <small>Includes student admission & course materials</small>
            </div>
            <p>
              <Icon name="check" size={16} /> Official receipt issued upon
              verification.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default Payment
