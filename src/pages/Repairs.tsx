import { useState } from "react"
import {
  Button,
  Field,
  Icon,
  PageHero,
  SectionHead,
  SelectField,
  Success,
  Textarea,
  UploadZone,
  Badge,
  WhatsAppIcon,
} from "@/components/ui"
import { trumpetImg } from "@/lib/data"
import { isValidEmail } from "@/lib/utils"
import { submitRepairRequest, fetchRepairByCode } from "@/lib/api"

interface RepairForm {
  fullName: string
  phone: string
  email: string
  instrumentType: string
  issue: string
  intakeMethod: "dropoff" | "pickup"
  pickupAddress: string
  photos: FileList | null
}

const emptyRepair: RepairForm = {
  fullName: "",
  phone: "",
  email: "",
  instrumentType: "Piano / Keyboard",
  issue: "",
  intakeMethod: "dropoff",
  pickupAddress: "",
  photos: null,
}

export function Repairs() {
  const [form, setForm] = useState<RepairForm>(emptyRepair)
  const [errors, setErrors] = useState<
    Partial<Record<keyof RepairForm, string>>
  >({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")
  const [sentCode, setSentCode] = useState<string | null>(null)
  const [sentMethod, setSentMethod] = useState<string>("dropoff")

  // Public Repair Tracker State
  const [trackCode, setTrackCode] = useState("")
  const [trackLoading, setTrackLoading] = useState(false)
  const [trackError, setTrackError] = useState("")
  const [trackedRecord, setTrackedRecord] = useState<any | null>(null)

  function set<K extends keyof RepairForm>(k: K, v: RepairForm[K]) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
    setServerError("")
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.fullName.trim()) e.fullName = "Full name is required."
    if (!form.phone.trim()) e.phone = "Phone number is required."
    if (!form.email.trim()) e.email = "Email is required."
    else if (!isValidEmail(form.email))
      e.email = "Enter a valid email address."
    if (!form.instrumentType)
      e.instrumentType = "Please select an instrument type."
    if (!form.issue.trim()) e.issue = "Please describe the issue."
    if (form.intakeMethod === "pickup" && !form.pickupAddress.trim()) {
      e.pickupAddress = "Please provide your pickup address and landmark."
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError("")

    try {
      const res = await submitRepairRequest({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        instrumentType: form.instrumentType,
        issue: form.issue,
        intakeMethod: form.intakeMethod,
        pickupAddress: form.pickupAddress,
      })

      if (res && res.success) {
        setSentCode(res.tracking_code || "REP-RECEIVED")
        setSentMethod(form.intakeMethod)
      } else {
        setServerError(
          res.error || "Failed to submit repair request. Please try again.",
        )
      }
    } catch {
      setServerError(
        "Network connection error. Please verify your connection.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (!trackCode.trim()) {
      setTrackError("Please enter your repair tracking code (e.g. REP-2026-042).")
      return
    }

    setTrackLoading(true)
    setTrackError("")
    setTrackedRecord(null)

    try {
      const res = await fetchRepairByCode(trackCode.trim())
      if (res && res.success && res.data) {
        setTrackedRecord(res.data)
      } else {
        setTrackError(
          res.error || "No repair order found matching this tracking code.",
        )
      }
    } catch {
      setTrackError("Unable to retrieve repair status. Please try again.")
    } finally {
      setTrackLoading(false)
    }
  }

  if (sentCode) {
    return (
      <main>
        <PageHero
          eyebrow="Repairs & maintenance"
          title="Give your instrument its voice back."
          body="Careful diagnostics, expert repairs and transparent pricing for the instruments you love."
          image={trumpetImg}
        />
        <section className="section">
          <div className="container">
            <div className="form-shell">
              <Success
                title="Repair request logged successfully"
                body={
                  sentMethod === "pickup"
                    ? "Your repair request has been logged. Our logistics team will call your phone number to coordinate pickup at your specified address."
                    : "Your repair order has been logged. Please bring your instrument to our Kaduna studio (U/Sunday, Television) during opening hours."
                }
                extra={`Tracking code: ${sentCode}`}
                onReset={() => {
                  setSentCode(null)
                  setForm(emptyRepair)
                }}
                action="Book another repair"
              />

              <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <a
                  href={`https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Workshop,%20I%20just%20logged%20a%20repair%20request%20for%20my%20instrument.%20Tracking%20Code:%20${encodeURIComponent(sentCode)}.%20Intake%20Method:%20${sentMethod}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary inline-flex items-center gap-2"
                  style={{ borderColor: "rgba(37,211,102,0.4)", color: "#128C7E", background: "#f0fdf4", textDecoration: "none" }}
                >
                  <WhatsAppIcon size={16} /> Send Code via WhatsApp
                </a>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const code = sentCode
                    setSentCode(null)
                    setTrackCode(code)
                    fetchRepairByCode(code).then((res) => {
                      if (res && res.success && res.data) {
                        setTrackedRecord(res.data)
                      }
                    })
                  }}
                >
                  Track This Order Now
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      <PageHero
        eyebrow="Repairs & maintenance"
        title="Give your instrument its voice back."
        body="Careful diagnostics, expert repairs and transparent pricing for the instruments you love."
        image={trumpetImg}
      />

      <section className="section">
        <div className="container">
          {/* Tracking lookup section */}
          <div
            style={{
              background: "white",
              padding: "32px",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow)",
              marginBottom: "50px",
            }}
          >
            <div style={{ maxWidth: 600 }}>
              <span className="eyebrow">Customer Tracking</span>
              <h2 style={{ fontSize: 28, margin: "6px 0 10px" }}>
                Track your repair progress
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                Already booked a service? Enter your repair tracking code to check
                diagnostic findings, repair stages, and collection readiness.
              </p>
            </div>

            <form
              onSubmit={handleTrack}
              style={{
                display: "flex",
                gap: 12,
                marginTop: 20,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <input
                  id="track-input"
                  placeholder="e.g. REP-2026-042"
                  value={trackCode}
                  onChange={(e) => {
                    setTrackCode(e.target.value)
                    setTrackError("")
                  }}
                  style={{
                    width: "100%",
                    minHeight: 48,
                    padding: "0 16px",
                    border: "1px solid #cbd4d9",
                    borderRadius: 8,
                  }}
                  aria-label="Repair tracking code"
                />
              </div>
              <Button type="submit" disabled={trackLoading}>
                {trackLoading ? "Searching…" : "Track Instrument"}
              </Button>
            </form>

            {trackError && (
              <p
                className="field-hint error"
                role="alert"
                style={{ marginTop: 12 }}
              >
                {trackError}
              </p>
            )}

            {trackedRecord && (
              <div
                style={{
                  marginTop: 24,
                  padding: 24,
                  background: "var(--cream)",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <span className="eyebrow">{trackedRecord.tracking_code}</span>
                    <h3 style={{ margin: "4px 0", fontSize: 22 }}>
                      {trackedRecord.instrument}
                    </h3>
                    <p style={{ margin: 0, color: "var(--muted)", fontSize: 12 }}>
                      Customer: {trackedRecord.customer_name} · Service:{" "}
                      {trackedRecord.intake_method === "pickup"
                        ? "Home/Studio Pickup"
                        : "Studio Drop-off"}
                    </p>
                  </div>
                  <Badge
                    tone={
                      trackedRecord.status === "ready" ||
                      trackedRecord.status === "collected"
                        ? "green"
                        : "gold"
                    }
                  >
                    {trackedRecord.status === "ready"
                      ? "Ready for Pickup"
                      : trackedRecord.status === "in_progress"
                        ? "Repair Underway"
                        : trackedRecord.status === "assessing"
                          ? "Technician Assessment"
                          : trackedRecord.status === "collected"
                            ? "Service Completed"
                            : "Order Received"}
                  </Badge>
                </div>

                <div
                  className="doc-grid"
                  style={{ marginTop: 16, marginBottom: 12 }}
                >
                  <div>
                    <small>Reported Issue</small>
                    <strong>{trackedRecord.issue}</strong>
                  </div>
                  <div>
                    <small>Estimated Repair Cost</small>
                    <strong style={{ color: "var(--navy)" }}>
                      {trackedRecord.estimated_cost
                        ? `₦${Number(trackedRecord.estimated_cost).toLocaleString()}`
                        : "Quotation in progress"}
                    </strong>
                  </div>
                  {trackedRecord.intake_method === "pickup" &&
                    trackedRecord.pickup_address && (
                      <div style={{ gridColumn: "1/-1" }}>
                        <small>Collection / Delivery Address</small>
                        <strong>{trackedRecord.pickup_address}</strong>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          <div className="service-grid">
            {[
              "Professional tuning",
              "String replacement",
              "Full servicing",
              "Careful restoration",
              "Deep cleaning",
            ].map((x, i) => (
              <div className="service-card" key={x}>
                <span>0{i + 1}</span>
                <h3>{x}</h3>
                <p>
                  Expert care, quality parts and a clear estimate before work
                  begins.
                </p>
              </div>
            ))}
          </div>

          <div className="form-shell">
            <SectionHead
              eyebrow="Request a repair"
              title="Tell us what is happening"
            />
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <Field
                  id="repair-name"
                  label="Full name"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={(v) => set("fullName", v)}
                  required
                  error={errors.fullName}
                />
                <Field
                  id="repair-phone"
                  label="Phone number"
                  placeholder="+234"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  required
                  error={errors.phone}
                />
                <Field
                  id="repair-email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  required
                  error={errors.email}
                />
                <SelectField
                  id="repair-instrument"
                  label="Instrument type"
                  value={form.instrumentType}
                  onChange={(v) => set("instrumentType", v)}
                  required
                >
                  <option value="Piano / Keyboard">Piano / Keyboard</option>
                  <option value="Guitar">Guitar</option>
                  <option value="Brass">Brass</option>
                  <option value="Drums">Drums</option>
                  <option value="Strings">Strings</option>
                  <option value="Other">Other</option>
                </SelectField>

                {/* Intake Method Option: Drop-off vs Pickup */}
                <div className="full">
                  <span className="field-label">
                    Instrument Delivery / Intake Method{" "}
                    <span className="required-star" aria-hidden="true">
                      *
                    </span>
                  </span>
                  <div
                    className="radio-cards"
                    role="radiogroup"
                    aria-label="Instrument intake method"
                  >
                    <label>
                      <input
                        type="radio"
                        name="intake"
                        value="dropoff"
                        checked={form.intakeMethod === "dropoff"}
                        onChange={() => set("intakeMethod", "dropoff")}
                      />
                      <span>
                        <strong>I will bring it to the studio</strong>
                        <small>
                          Drop off at Vivadoxa Studio (U/Sunday, Television,
                          Kaduna)
                        </small>
                      </span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="intake"
                        value="pickup"
                        checked={form.intakeMethod === "pickup"}
                        onChange={() => set("intakeMethod", "pickup")}
                      />
                      <span>
                        <strong>Request courier pickup</strong>
                        <small>
                          Vivadoxa team will collect the instrument from your
                          address
                        </small>
                      </span>
                    </label>
                  </div>
                </div>

                {form.intakeMethod === "pickup" && (
                  <div className="full">
                    <Field
                      id="repair-pickup-address"
                      label="Pickup address and prominent landmark"
                      placeholder="e.g. 14 Constitution Road, near Command Junction, Kaduna"
                      value={form.pickupAddress}
                      onChange={(v) => set("pickupAddress", v)}
                      required
                      error={errors.pickupAddress}
                    />
                  </div>
                )}

                <Textarea
                  id="repair-issue"
                  label="Describe the issue"
                  placeholder="Tell us what you noticed..."
                  value={form.issue}
                  onChange={(v) => set("issue", v)}
                  required
                  error={errors.issue}
                />
                <UploadZone
                  label="Upload instrument photos (optional)"
                  hint="JPG or PNG, up to 10MB"
                  accept="image/jpeg,image/png"
                  onChange={(files) => set("photos", files)}
                  fileName={form.photos?.[0]?.name}
                />
              </div>

              {serverError && (
                <div
                  className="login-error"
                  role="alert"
                  style={{ marginTop: 16 }}
                >
                  <Icon name="warning" size={16} />
                  {serverError}
                </div>
              )}

              <div className="form-action">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    "Logging request…"
                  ) : (
                    <>
                      Submit repair request <Icon name="arrow" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Repairs
