import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Logo, Button, Icon, Badge, Field, UploadZone } from "@/components/ui"
import { BANK_NAME, BANK_ACCOUNT_NO, BANK_ACCOUNT_NAME } from "@/lib/utils"
import {
  submitPaymentProof,
  verifyGatewayPayment,
  getBankSettings,
  fetchSettings,
} from "@/lib/api"
import {
  AdmissionLetterModal,
  PaymentReceiptModal,
  ApplicationSlipModal,
} from "@/components/OfficialDocument"
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
  const currencyParam = searchParams.get("currency")

  const appRef = useMemo(() => {
    return (
      refParam ||
      sessionStorage.getItem("vdx_current_ref") ||
      "VDX-" + new Date().getFullYear() + "-0101"
    )
  }, [refParam])

  const currency = useMemo(() => {
    const c = (
      currencyParam ||
      sessionStorage.getItem("vdx_current_currency") ||
      "NGN"
    ).toUpperCase()
    return c === "USD" ? "USD" : "NGN"
  }, [currencyParam])

  const isUSD = currency === "USD"
  const currSymbol = isUSD ? "$" : "₦"

  const defaultAmount = useMemo(() => {
    const raw =
      amountParam ||
      sessionStorage.getItem("vdx_current_amount") ||
      (isUSD ? "70" : "55000")
    return Number(raw) || (isUSD ? 70 : 55000)
  }, [amountParam, isUSD])

  const studentName = useMemo(() => {
    return sessionStorage.getItem("vdx_current_name") || ""
  }, [])

  const studentEmail = useMemo(() => {
    return sessionStorage.getItem("vdx_current_email") || ""
  }, [])

  const studentProgram = useMemo(() => {
    return sessionStorage.getItem("vdx_current_program") || "Piano/keyboard"
  }, [])

  const studentPhone = useMemo(() => {
    return sessionStorage.getItem("vdx_current_phone") || ""
  }, [])

  const studentMode = useMemo(() => {
    return sessionStorage.getItem("vdx_current_study_mode") || "Onsite"
  }, [])

  const studentSchedule = useMemo(() => {
    return (
      sessionStorage.getItem("vdx_current_schedule") ||
      "Weekdays (3 days per week) / Weekends (Friday & Saturday)"
    )
  }, [])

  const studentPlan = useMemo(() => {
    return sessionStorage.getItem("vdx_current_plan") || "3-months"
  }, [])

  const studentAddress = useMemo(() => {
    return sessionStorage.getItem("vdx_current_address") || ""
  }, [])

  // Default to online card for Diaspora USD students, bank transfer for local students
  const [method, setMethod] = useState<"bank" | "online">(
    isUSD ? "online" : "bank",
  )
  const [proof, setProof] = useState<PaymentProofForm>({
    payerName: studentName,
    payerEmail: studentEmail,
    paymentDate: new Date().toISOString().split("T")[0],
    amountPaid: String(defaultAmount),
    transactionRef: "",
    receiptFile: null,
  })
  const [errors, setErrors] =
    useState<Partial<Record<keyof PaymentProofForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [sent, setSent] = useState(false)
  const [isInstantGateway, setIsInstantGateway] = useState(false)
  const [gatewayLoading, setGatewayLoading] = useState(false)
  const [gatewayError, setGatewayError] = useState("")
  const [verifiedPayment, setVerifiedPayment] = useState<any>(null)
  const [copiedAccount, setCopiedAccount] = useState(false)

  // Document modal states
  const [showSlip, setShowSlip] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showLetter, setShowLetter] = useState(false)

  const [bankInfo, setBankInfo] = useState({
    bankName: BANK_NAME,
    accountNumber: BANK_ACCOUNT_NO,
    accountName: BANK_ACCOUNT_NAME,
    branch: "",
    paystackPublicKey: "",
    paystackSecretKey: "",
    enablePaystack: false,
    flutterwavePublicKey: "",
    flutterwaveSecretKey: "",
    enableFlutterwave: false,
  })

  useEffect(() => {
    const cached = getBankSettings()
    if (cached && cached.accountNumber) {
      setBankInfo((prev) => ({
        ...prev,
        bankName: cached.bankName || BANK_NAME,
        accountNumber: cached.accountNumber || BANK_ACCOUNT_NO,
        accountName: cached.accountName || BANK_ACCOUNT_NAME,
        branch: "",
        paystackPublicKey: cached.paystackPublicKey || "",
        flutterwavePublicKey: cached.flutterwavePublicKey || "",
        enablePaystack: Boolean(cached.enablePaystack && cached.paystackPublicKey?.trim()),
        enableFlutterwave: Boolean(cached.enableFlutterwave && cached.flutterwavePublicKey?.trim()),
      }))
    }
    fetchSettings()
      .then((res: any) => {
        if (res && res.payment && res.payment.accountNumber) {
          setBankInfo((prev) => ({
            ...prev,
            bankName: res.payment.bankName || BANK_NAME,
            accountNumber: res.payment.accountNumber || BANK_ACCOUNT_NO,
            accountName: res.payment.accountName || BANK_ACCOUNT_NAME,
            branch: "",
            paystackPublicKey: res.payment.paystackPublicKey || "",
            flutterwavePublicKey: res.payment.flutterwavePublicKey || "",
            enablePaystack: Boolean(res.payment.enablePaystack && res.payment.paystackPublicKey?.trim()),
            enableFlutterwave: Boolean(res.payment.enableFlutterwave && res.payment.flutterwavePublicKey?.trim()),
          }))
        }
      })
      .catch(() => {})
  }, [])

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
    const cleanAmt = Number(String(proof.amountPaid).replace(/[^0-9.]/g, ""))
    if (!proof.amountPaid.trim() || isNaN(cleanAmt) || cleanAmt <= 0)
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
      const cleanAmt =
        Number(String(proof.amountPaid).replace(/[^0-9.]/g, "")) ||
        defaultAmount
      const res = await submitPaymentProof({
        applicationNo: appRef,
        payerName: proof.payerName.trim(),
        payerEmail: (proof.payerEmail || studentEmail || "").trim(),
        amountPaid: cleanAmt,
        currency,
        transactionRef: proof.transactionRef.trim(),
        paymentDate: proof.paymentDate,
        method: isUSD ? "International Wire / Transfer" : "Bank Transfer",
      })

      if (res && res.success) {
        setSent(true)
        setIsInstantGateway(false)
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

  // Handle successful gateway verification
  async function handleGatewaySuccess({
    reference,
    gateway,
  }: {
    reference: string
    gateway: string
  }) {
    setGatewayLoading(true)
    setGatewayError("")
    try {
      const res = await verifyGatewayPayment({
        reference,
        applicationNo: appRef,
        payerName: studentName || "Online Applicant",
        payerEmail: studentEmail || "student@vivadoxa.ng",
        amount: defaultAmount,
        currency,
        gateway,
        notes: `Instant automated tuition payment cleared via ${gateway}`,
      })

      if (res && res.success) {
        setVerifiedPayment({
          reference: res.reference || reference,
          application_no: appRef,
          payer_name: studentName || "Online Applicant",
          payer_email: studentEmail,
          amount: defaultAmount,
          currency,
          method: gateway,
          status: "verified",
          program: studentProgram,
          created_at: new Date().toISOString(),
        })
        setIsInstantGateway(true)
        setSent(true)
      } else {
        setGatewayError(
          res.error ||
            "Unable to confirm payment verification with admissions ledger.",
        )
      }
    } catch {
      setGatewayError(
        "Network communication error confirming gateway clearance.",
      )
    } finally {
      setGatewayLoading(false)
    }
  }

  // Trigger Paystack inline popup for NGN payments
  function triggerPaystackPayment() {
    setGatewayError("")
    const pKey = bankInfo.paystackPublicKey?.trim()

    if (pKey && (window as any).PaystackPop) {
      setGatewayLoading(true)
      try {
        const handler = (window as any).PaystackPop.setup({
          key: pKey,
          email: studentEmail || "student@vivadoxa.ng",
          amount: Math.round(defaultAmount * 100), // Kobo
          currency: "NGN",
          ref: `VDX-PSK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          metadata: {
            custom_fields: [
              {
                display_name: "Application No",
                variable_name: "application_no",
                value: appRef,
              },
              {
                display_name: "Student Name",
                variable_name: "student_name",
                value: studentName || "Applicant",
              },
              {
                display_name: "Course Discipline",
                variable_name: "program",
                value: studentProgram,
              },
            ],
          },
          callback: function (response: any) {
            handleGatewaySuccess({
              reference: response.reference || response.trxref,
              gateway: "Paystack (Card/Transfer/USSD)",
            })
          },
          onClose: function () {
            setGatewayLoading(false)
          },
        })
        handler.openIframe()
      } catch (err: any) {
        setGatewayLoading(false)
        setGatewayError(
          err.message || "Failed to initialize Paystack checkout.",
        )
      }
    } else {
      setGatewayError(
        "Paystack gateway is currently offline. Please use the Official Bank Transfer method below.",
      )
    }
  }

  // Trigger Flutterwave inline popup for USD diaspora payments
  function triggerFlutterwavePayment() {
    setGatewayError("")
    const fKey = bankInfo.flutterwavePublicKey?.trim()

    if (fKey && (window as any).FlutterwaveCheckout) {
      setGatewayLoading(true)
      try {
        ;(window as any).FlutterwaveCheckout({
          public_key: fKey,
          tx_ref: `VDX-USD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          amount: defaultAmount,
          currency: "USD",
          payment_options: "card,mobilemoney,ussd",
          customer: {
            email: studentEmail || "diaspora@vivadoxa.ng",
            name: studentName || "International Student",
            phone_number: studentPhone || "0000000000",
          },
          customizations: {
            title: "Vivadoxa Music Academy",
            description: `Tuition settlement for ${studentProgram} (${currency})`,
            logo: `${window.location.origin}/vivadoxa-logo.png`,
          },
          callback: function (response: any) {
            handleGatewaySuccess({
              reference: String(response.transaction_id || response.tx_ref),
              gateway: "Flutterwave (International USD)",
            })
          },
          onclose: function () {
            setGatewayLoading(false)
          },
        })
      } catch (err: any) {
        setGatewayLoading(false)
        setGatewayError(
          err.message || "Failed to initialize Flutterwave checkout.",
        )
      }
    } else {
      setGatewayError(
        "International USD gateway is currently offline. Please use the Official Bank Transfer method below.",
      )
    }
  }

  function copyBankDetails() {
    navigator.clipboard.writeText(bankInfo.accountNumber).catch(() => {})
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2500)
  }

  // Data packages for Official Documents
  const docAppData = {
    application_no: appRef,
    fullName: studentName || "Applicant",
    email: studentEmail,
    phone: studentPhone,
    program: studentProgram,
    study_mode: studentMode,
    schedule: studentSchedule,
    planTier: studentPlan,
    tuition_fee: defaultAmount,
    currency,
    address: studentAddress,
    status: isInstantGateway ? "approved" : "submitted",
    passportPhoto: sessionStorage.getItem("vdx_current_passport") || "",
    signature:
      sessionStorage.getItem("vdx_current_signature") ||
      studentName ||
      "Applicant",
    created_at: new Date().toISOString(),
  }

  const docReceiptData = {
    reference:
      verifiedPayment?.reference ||
      proof.transactionRef ||
      `VDX-PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    application_no: appRef,
    payer_name: studentName || proof.payerName || "Applicant",
    payer_email: studentEmail || proof.payerEmail,
    amount: defaultAmount,
    currency,
    method: isInstantGateway
      ? verifiedPayment?.method ||
        (isUSD ? "International Card (USD)" : "Online Paystack Gateway")
      : "Official Bank Transfer",
    status: isInstantGateway ? "verified" : "pending_verification",
    program: studentProgram,
    created_at: new Date().toISOString(),
  }

  const hasPaystackKeys = Boolean(bankInfo.paystackPublicKey?.trim())
  const hasFlutterwaveKeys = Boolean(bankInfo.flutterwavePublicKey?.trim())
  const isPaystackActive = Boolean(bankInfo.enablePaystack && hasPaystackKeys)
  const isFlutterwaveActive = Boolean(isUSD && bankInfo.enableFlutterwave && hasFlutterwaveKeys)
  const isOnlineAvailable = isUSD ? isFlutterwaveActive : isPaystackActive

  if (sent) {
    return (
      <main
        className="confirmation"
        style={{ maxWidth: 860, margin: "40px auto", padding: "0 20px" }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid var(--line)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(21, 112, 84, 0.12)",
              color: "#157054",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            ✓
          </div>

          <span
            className="eyebrow"
            style={{
              color: "#157054",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
            }}
          >
            {isInstantGateway
              ? "Automated Gateway Clearance Verified"
              : "Payment Proof Logged & Submitted"}
          </span>

          <h1
            style={{
              margin: "8px 0 14px",
              fontSize: "clamp(24px, 4vw, 32px)",
              color: "var(--navy)",
              fontFamily: "serif",
            }}
          >
            {isInstantGateway
              ? "Admission Confirmed! Tuition Cleared."
              : "Payment logged. Verification in progress."}
          </h1>

          <p
            style={{
              maxWidth: 620,
              margin: "0 auto 24px",
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--muted)",
            }}
          >
            {isInstantGateway
              ? `Your tuition payment of ${currSymbol}${defaultAmount.toLocaleString(
                  isUSD ? "en-US" : "en-NG",
                )} has been successfully confirmed and reconciled in our conservatory admissions ledger. Your official enrollment credentials are ready for download below.`
              : `Your transfer proof for ${currSymbol}${defaultAmount.toLocaleString(
                  isUSD ? "en-US" : "en-NG",
                )} has been submitted under application reference ${appRef}. Our financial accounts team will verify the bank ledger narration and dispatch your final confirmation.`}
          </p>

          <div
            style={{
              display: "inline-block",
              background: "#f8f9fa",
              border: "1px solid var(--line)",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 32,
            }}
          >
            <span style={{ color: "var(--muted)" }}>
              Application Reference:{" "}
            </span>
            <strong
              style={{
                fontFamily: "monospace",
                color: "var(--navy)",
                letterSpacing: "1px",
              }}
            >
              {appRef}
            </strong>
          </div>

          {/* Download Official Documents Callout */}
          <div
            style={{
              background: "#faf9f6",
              border: "1.5px solid var(--line)",
              borderRadius: 12,
              padding: "24px 20px",
              textAlign: "left",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: 700,
                    color: "var(--gold)",
                  }}
                >
                  Official Website Documents
                </span>
                <strong
                  style={{
                    display: "block",
                    fontSize: 15,
                    color: "var(--navy)",
                    marginTop: 2,
                  }}
                >
                  Download Your Official Admission &amp; Payment Credentials
                </strong>
              </div>
              <Badge tone="green">Generated &amp; Signed</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSlip(true)}
                style={{
                  justifyContent: "center",
                  fontSize: 12.5,
                  minHeight: 44,
                  fontWeight: 600,
                }}
              >
                <Icon name="copy" size={14} /> Application Slip (PDF)
              </Button>

              <Button
                variant="secondary"
                onClick={() => setShowReceipt(true)}
                style={{
                  justifyContent: "center",
                  fontSize: 12.5,
                  minHeight: 44,
                  fontWeight: 600,
                }}
              >
                <Icon name="check" size={14} /> Payment Receipt (PDF)
              </Button>

              <Button
                variant="primary"
                onClick={() => setShowLetter(true)}
                style={{
                  justifyContent: "center",
                  fontSize: 12.5,
                  minHeight: 44,
                  fontWeight: 700,
                }}
              >
                <Icon name="copy" size={14} /> Admission Letter (PDF)
              </Button>
            </div>
            <p
              style={{
                fontSize: 11.5,
                color: "var(--muted)",
                margin: "12px 0 0",
                textAlign: "center",
              }}
            >
              Click any document above to view, print, or download as an
              official conservatory PDF certificate.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => go(`/status?ref=${appRef}`)}
              style={{ minHeight: 44 }}
            >
              Check Application Status Tracker →
            </Button>
            <Button
              variant="primary"
              onClick={() => go("home")}
              style={{ minHeight: 44 }}
            >
              Return to Homepage
            </Button>
          </div>
        </div>

        {/* Modal Previews for Instant Downloads */}
        {showSlip && (
          <ApplicationSlipModal
            data={docAppData}
            onClose={() => setShowSlip(false)}
          />
        )}
        {showReceipt && (
          <PaymentReceiptModal
            data={docReceiptData}
            onClose={() => setShowReceipt(false)}
          />
        )}
        {showLetter && (
          <AdmissionLetterModal
            data={docAppData}
            onClose={() => setShowLetter(false)}
          />
        )}
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
          <div className="flex items-center gap-2">
            <Badge tone={isUSD ? "gold" : "green"}>
              {isUSD
                ? "Diaspora USD Channel ($)"
                : "Nigerian Tuition Channel (₦)"}
            </Badge>
          </div>
        </div>

        <div className="pay-grid">
          <section>
            <span className="eyebrow">Tuition Payment</span>
            <h1>Secure your admission</h1>
            <p>
              {isUSD
                ? "Complete your tuition checkout in US Dollars ($) via our secure international card gateway, or transfer into our verified school account."
                : "Transfer tuition into the Vivadoxa school account below or complete your checkout instantly online for automated ledger clearance."}
            </p>

            {/* Method tabs - only shown if online gateway is configured & enabled by admin */}
            {isOnlineAvailable && (
              <div
                className="payment-tabs"
                role="tablist"
                aria-label="Payment method"
              >
                <button
                  role="tab"
                  aria-selected={method === "online"}
                  className={method === "online" ? "active" : ""}
                  onClick={() => setMethod("online")}
                >
                  <i aria-hidden="true" />
                  <div>
                    <strong>
                      {isUSD
                        ? "International Card (USD / $)"
                        : "Online Card / USSD (Paystack)"}
                    </strong>
                    <small>
                      {isUSD
                        ? "Visa, Mastercard, Amex, Apple Pay"
                        : "Instant automated clearance"}
                    </small>
                  </div>
                  <Badge tone="green">{isUSD ? "USD ($)" : "Automated"}</Badge>
                </button>

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
                  <Badge tone={isUSD ? "gold" : "green"}>
                    {isUSD ? "Naira Account" : "Available"}
                  </Badge>
                </button>
              </div>
            )}

            {isOnlineAvailable && method === "online" ? (
              /* Online Gateway View */
              <div
                className="bank-card"
                style={{
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: "28px 24px",
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontWeight: 700,
                        color: "#157054",
                      }}
                    >
                      {isUSD
                        ? "Diaspora Online Gateway (USD / $)"
                        : "Instant Online Gateway (Paystack)"}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--muted)",
                      }}
                    >
                      Application Ref: <code>{appRef}</code>
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: 20,
                      color: "var(--navy)",
                    }}
                  >
                    {isUSD
                      ? "International Tuition Checkout"
                      : "Automated Instant Checkout"}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "var(--muted)",
                      lineHeight: 1.55,
                    }}
                  >
                    {isUSD
                      ? "Pay your certified music course tuition in US Dollars ($) securely via international debit or credit card. Your payment is verified automatically upon completion."
                      : "Pay tuition in Nigerian Naira (₦) using debit card, direct bank transfer, USSD, or mobile money via Paystack. Automated verification issues your admission receipt immediately."}
                  </p>
                </div>

                {/* Amount Callout */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #0b0b0b, #24201d)",
                    borderRadius: 10,
                    padding: "20px 24px",
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 10.5,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        color: "var(--gold)",
                        fontWeight: 700,
                      }}
                    >
                      Tuition Total ({currency})
                    </span>
                    <div
                      style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}
                    >
                      {studentProgram} · {studentMode}
                    </div>
                  </div>
                  <strong
                    style={{
                      fontSize: "clamp(24px, 5vw, 32px)",
                      fontFamily: "serif",
                    }}
                  >
                    {currSymbol}
                    {defaultAmount.toLocaleString(isUSD ? "en-US" : "en-NG", {
                      minimumFractionDigits: isUSD ? 2 : 0,
                    })}
                  </strong>
                </div>

                {gatewayError && (
                  <div
                    className="login-error"
                    role="alert"
                    style={{ marginBottom: 20 }}
                  >
                    <Icon name="warning" size={16} />
                    {gatewayError}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {isUSD ? (
                    <Button
                      type="button"
                      fullWidth
                      disabled={gatewayLoading}
                      onClick={triggerFlutterwavePayment}
                      style={{
                        minHeight: 48,
                        fontSize: 14,
                        fontWeight: 700,
                        background: "var(--navy)",
                        color: "white",
                        justifyContent: "center",
                      }}
                    >
                      {gatewayLoading ? (
                        "Connecting to Secure Gateway…"
                      ) : (
                        <>
                          <Icon name="check" /> Pay {currSymbol}
                          {defaultAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                          })}{" "}
                          with Card (USD)
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      fullWidth
                      disabled={gatewayLoading}
                      onClick={triggerPaystackPayment}
                      style={{
                        minHeight: 48,
                        fontSize: 14,
                        fontWeight: 700,
                        background: "#00b875",
                        color: "white",
                        justifyContent: "center",
                      }}
                    >
                      {gatewayLoading ? (
                        "Initializing Paystack Gateway…"
                      ) : (
                        <>
                          <Icon name="check" /> Pay Online ₦
                          {defaultAmount.toLocaleString("en-NG")} (Paystack)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Bank Transfer View */
              <div className="bank-card">
                {/* Account details */}
                <div
                  className="bank-title"
                  style={{
                    padding: "20px 24px",
                    background: "#fbfaf8",
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    className="bank-logo"
                    style={{
                      background: "#e65100",
                      color: "white",
                      fontWeight: 800,
                      fontSize: 16,
                      letterSpacing: "0.5px",
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    GTB
                  </div>
                  <div>
                    <strong
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: "var(--navy)",
                        display: "block",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {bankInfo.bankName || "Guaranty Trust Bank (GTBank)"}
                    </strong>
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        marginTop: 2,
                        display: "block",
                      }}
                    >
                      {isUSD
                        ? `Tuition equivalent: $${defaultAmount} USD (${bankInfo.bankName || "Guaranty Trust Bank (GTBank)"})`
                        : `Transfer exactly ₦${defaultAmount.toLocaleString("en-NG")}`}
                    </span>
                  </div>
                </div>

                <div
                  className="account-number"
                  style={{
                    background: "var(--navy)",
                    borderRadius: 12,
                    padding: "20px 24px",
                    marginTop: 16,
                  }}
                >
                  <div>
                    <small
                      style={{
                        color: "#9dacb8",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        fontSize: 10.5,
                        fontWeight: 700,
                      }}
                    >
                      Official Tuition Account · {bankInfo.bankName || "Guaranty Trust Bank (GTBank)"}
                    </small>
                    <strong
                      style={{
                        fontSize: "clamp(22px, 6vw, 30px)",
                        letterSpacing: "2.5px",
                        fontFamily: "monospace",
                        color: "white",
                        display: "block",
                        marginTop: 4,
                      }}
                    >
                      {bankInfo.accountNumber || "0236649229"}
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
                    <dt>Bank Name</dt>
                    <dd
                      style={{
                        fontWeight: 800,
                        color: "var(--navy)",
                        fontSize: "1.05rem",
                      }}
                    >
                      {bankInfo.bankName || "Guaranty Trust Bank (GTBank)"}
                    </dd>
                  </div>
                  <div>
                    <dt>Account Name</dt>
                    <dd style={{ fontWeight: 700, color: "#1e293b" }}>
                      {bankInfo.accountName || "Fredrerick Chysantus"}
                    </dd>
                  </div>
                  <div>
                    <dt>Account Number</dt>
                    <dd
                      style={{
                        fontWeight: 800,
                        fontFamily: "monospace",
                        letterSpacing: "1.5px",
                        color: "var(--navy)",
                      }}
                    >
                      {bankInfo.accountNumber || "0236649229"}
                    </dd>
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
                        label={`Amount paid (${currSymbol})`}
                        placeholder={
                          isUSD
                            ? `$${defaultAmount}`
                            : `₦${defaultAmount.toLocaleString("en-NG")}`
                        }
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
                <dt>Discipline</dt>
                <dd>{studentProgram}</dd>
              </div>
              <div>
                <dt>Study Mode</dt>
                <dd>{studentMode}</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd style={{ fontSize: 11 }}>{studentSchedule}</dd>
              </div>
              <div>
                <dt>Billing</dt>
                <dd>
                  {isUSD
                    ? "Diaspora International ($)"
                    : "Nigerian Resident (₦)"}
                </dd>
              </div>
              <div>
                <dt>Campus</dt>
                <dd>Vivadoxa Main Studio, Kaduna</dd>
              </div>
            </dl>
            <div className="amount">
              <span>Tuition amount due</span>
              <strong>
                {currSymbol}
                {defaultAmount.toLocaleString(isUSD ? "en-US" : "en-NG", {
                  minimumFractionDigits: isUSD ? 2 : 0,
                })}
              </strong>
            </div>
            <p>
              <Icon name="check" size={16} /> Official receipt issued upon
              verification.
            </p>
            {appRef && (
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px dashed var(--line)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowSlip(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gold)] hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  <Icon name="copy" size={13} /> View &amp; Download Application
                  Slip (PDF) →
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Application Slip Modal Preview */}
      {showSlip && (
        <ApplicationSlipModal
          data={docAppData}
          onClose={() => setShowSlip(false)}
        />
      )}
    </main>
  )
}

export default Payment
