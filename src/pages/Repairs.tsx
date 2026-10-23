import { useState, useEffect } from "react"
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
import { repairSaxImg, repairElectronicsImg } from "@/lib/data"
import { isValidEmail } from "@/lib/utils"
import { submitRepairRequest, fetchRepairByCode, checkUserSession } from "@/lib/api"

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
  const [autofilled, setAutofilled] = useState(false)

  // Autofill authenticated user details if logged in
  useEffect(() => {
    checkUserSession()
      .then((user) => {
        if (user) {
          setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || user.full_name || "",
            email: prev.email || user.email || "",
            phone: prev.phone || user.phone || "",
            pickupAddress: prev.pickupAddress || user.address || "",
          }))
          setAutofilled(true)
        }
      })
      .catch(() => {})
  }, [])

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
          image={repairSaxImg}
        />
        <section className="section">
          <div className="container">
            <div className="form-shell">
              <Success
                title="Repair request logged successfully"
                body={
                  sentMethod === "pickup"
                    ? "Your repair request has been logged. Our logistics team will call your phone number to coordinate pickup at your specified address."
                    : "Your repair order has been logged. Please bring your instrument to Vivadoxa Music at No. 49B Umaru Ibrahim Street, off Super Market Street beside Angwan Sunday Market, Angwan Sunday, Kaduna during opening hours."
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
        image={repairSaxImg}
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
              <div className="flex-1 w-full min-w-0">
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

          {/* Workshop Craftsmanship & Electronics Showcase */}
          <div style={{ margin: "60px 0 65px" }}>
            <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 28px" }}>
              <span className="eyebrow">Inside the Vivadoxa Workshop</span>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", margin: "8px 0 10px", color: "var(--navy)" }}>
                Precision Acoustic, Electrical &amp; Mechanical Restoration
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                Every instrument brought to our Kaduna clinic undergoes systematic diagnostic inspection by experienced technicians using dedicated precision tools, leak-lights, and digital multimeters.
              </p>
            </div>

            {/* Crucial Scope Clarification Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(201,107,50,0.1) 0%, rgba(10,25,47,0.04) 100%)",
                border: "1.5px solid rgba(201,107,50,0.35)",
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 32,
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--gold)",
                  color: "var(--navy)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                  flexShrink: 0,
                  fontWeight: 700,
                }}
              >
                <Icon name="tool" size={20} className="text-amber-800" />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 15, color: "var(--navy)", display: "block", marginBottom: 4 }}>
                  Comprehensive Repair Coverage Across All Instruments &amp; Accessories
                </strong>
                <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.6 }}>
                  <strong>Please note:</strong> The workshop photos below feature our saxophone overhaul and keyboard synthesizer benches as illustrative showcases of our craftsmanship. Our repair services cover a <strong>wide, comprehensive spectrum of musical instruments and accessories</strong>—including Trumpets, Euphoniums, Flutes, Clarinets, Guitars, Bass, Violins, Full Drum Sets, African Talking Drums, and Audio Cables &amp; Hardware!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Workshop Card 1: Brass & Woodwinds */}
              <div
                style={{
                  background: "white",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  boxShadow: "var(--shadow)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="h-56 sm:h-72 md:h-80 overflow-hidden relative bg-[#0a192f]">
                  <img
                    src={repairSaxImg}
                    alt="Vivadoxa master technician repairing a golden brass saxophone at the workbench"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      background: "rgba(10, 25, 47, 0.88)",
                      backdropFilter: "blur(4px)",
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(201,107,50,0.4)",
                    }}
                  >
                    <span style={{ color: "var(--gold2)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Acoustic &amp; Brass Bench
                    </span>
                  </div>
                </div>
                <div style={{ padding: "26px 28px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: 20, color: "var(--navy)", margin: "0 0 10px", fontFamily: "'DM Serif Display', serif" }}>
                      Brass, Woodwinds &amp; String Overhauls
                    </h3>
                    <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>
                      Precision pad seating, key regulation, cork replacement, valve alignment, leak-light inspection, and fretboard restoration for saxophones, flutes, trumpets, violins, and guitars.
                    </p>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                    <li style={{ fontSize: 12, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span> Pad leveling &amp; acoustic leak sealing
                    </li>
                    <li style={{ fontSize: 12, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span> Fret dressing, action lowering &amp; bridge setup
                    </li>
                  </ul>
                </div>
              </div>

              {/* Workshop Card 2: Electronics & Keyboards */}
              <div
                style={{
                  background: "white",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  boxShadow: "var(--shadow)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="h-56 sm:h-72 md:h-80 overflow-hidden relative bg-[#0a192f]">
                  <img
                    src={repairElectronicsImg}
                    alt="Vivadoxa electronics technician using multimeter diagnosing synthesizer keyboard circuit board"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      background: "rgba(10, 25, 47, 0.88)",
                      backdropFilter: "blur(4px)",
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid rgba(201,107,50,0.4)",
                    }}
                  >
                    <span style={{ color: "var(--gold2)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Electronics &amp; Circuit Bench
                    </span>
                  </div>
                </div>
                <div style={{ padding: "26px 28px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: 20, color: "var(--navy)", margin: "0 0 10px", fontFamily: "'DM Serif Display', serif" }}>
                      Digital Keyboards &amp; Audio Circuit Diagnostics
                    </h3>
                    <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>
                      Multimeter component testing, PCB circuit repairs, key contact strip replacement, power supply diagnostics, audio jack soldering, and speaker reconing for workstations and synthesizers.
                    </p>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                    <li style={{ fontSize: 12, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span> Sticky keys &amp; rubber contact strip replacement
                    </li>
                    <li style={{ fontSize: 12, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span> Power circuit, fuse &amp; audio output restoration
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Full Instrument Family Repair Matrix */}
            <div
              style={{
                marginTop: 36,
                background: "var(--cream)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "28px 30px",
              }}
            >
              <div style={{ maxWidth: 700, marginBottom: 20 }}>
                <span className="eyebrow">Comprehensive Clinic Services</span>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "var(--navy)", margin: "4px 0 6px" }}>
                  What We Service Across All Musical Disciplines
                </h3>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                  From individual student instruments to church sound equipment and school fleets across Kaduna:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div style={{ background: "white", padding: "16px 18px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  <strong style={{ fontSize: 14, color: "var(--navy)", display: "block", marginBottom: 4 }}>
                    Woodwinds &amp; Reeds
                  </strong>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.4 }}>
                    Alto, Tenor, Soprano &amp; Baritone Saxophones, Flutes, Clarinets &amp; Piccolos.
                  </p>
                  <small style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>
                    Pad reseating • Leak sealing • Key regulation • Tenon corks
                  </small>
                </div>

                <div style={{ background: "white", padding: "16px 18px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  <strong style={{ fontSize: 14, color: "var(--navy)", display: "block", marginBottom: 4 }}>
                    Brass &amp; Horns
                  </strong>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.4 }}>
                    Trumpets, Euphoniums, Trombones, Baritones &amp; Tubas.
                  </p>
                  <small style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>
                    Valve alignment • Ultrasonic wash • Slide tuning • Dent rolling
                  </small>
                </div>

                <div style={{ background: "white", padding: "16px 18px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  <strong style={{ fontSize: 14, color: "var(--navy)", display: "block", marginBottom: 4 }}>
                    Keyboards &amp; Workstations
                  </strong>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.4 }}>
                    Yamaha, Roland, Korg, Casio, Kurzweil &amp; MIDI controllers.
                  </p>
                  <small style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>
                    Rubber contact strips • Sticky keys • PCB circuit repair • Jacks
                  </small>
                </div>

                <div style={{ background: "white", padding: "16px 18px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  <strong style={{ fontSize: 14, color: "var(--navy)", display: "block", marginBottom: 4 }}>
                    Fretted &amp; Bowed Strings
                  </strong>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.4 }}>
                    Acoustic, Electric, Bass Guitars, Violins, Violas &amp; Cellos.
                  </p>
                  <small style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>
                    Fret leveling • Intonation • Pickup wiring • Bridge &amp; soundpost
                  </small>
                </div>

                <div style={{ background: "white", padding: "16px 18px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  <strong style={{ fontSize: 14, color: "var(--navy)", display: "block", marginBottom: 4 }}>
                    Percussion &amp; Drums
                  </strong>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.4 }}>
                    Acoustic Drum Kits, Snare Drums, Cymbals &amp; African Talking Drums.
                  </p>
                  <small style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>
                    Head tuning • Lug tightening • Pedal linkage • Goatskin lacing
                  </small>
                </div>

                <div style={{ background: "white", padding: "16px 18px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  <strong style={{ fontSize: 14, color: "var(--navy)", display: "block", marginBottom: 4 }}>
                    Audio Gear &amp; Accessories
                  </strong>
                  <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.4 }}>
                    Instrument cables, microphone jacks, stage snakes, pedals &amp; stands.
                  </p>
                  <small style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700 }}>
                    XLR/TRS soldering • Switchcraft jacks • Amp grounding • Stands
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="form-shell">
            <SectionHead
              eyebrow="Request a repair"
              title="Tell us what is happening"
            />
            <form onSubmit={handleSubmit} noValidate>
              {autofilled && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(21, 112, 84, 0.08)",
                    border: "1px solid rgba(21, 112, 84, 0.25)",
                    color: "#157054",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icon name="check" size={14} />
                  <span>Signed in as <strong>{form.fullName || form.email}</strong> — contact details autofilled automatically.</span>
                </div>
              )}
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
                  <option value="Piano / Digital Keyboard / Synthesizer">Piano / Digital Keyboard / Synthesizer</option>
                  <option value="Saxophone (Alto / Tenor / Soprano)">Saxophone (Alto / Tenor / Soprano)</option>
                  <option value="Trumpet, Euphonium & Brass Horns">Trumpet, Euphonium & Brass Horns</option>
                  <option value="Flute, Clarinet & Woodwinds">Flute, Clarinet & Woodwinds</option>
                  <option value="Acoustic & Classical Guitar">Acoustic & Classical Guitar</option>
                  <option value="Electric & Bass Guitar">Electric & Bass Guitar</option>
                  <option value="Violin & Bowed Strings">Violin & Bowed Strings</option>
                  <option value="Drum Kit & Percussion Hardware">Drum Kit & Percussion Hardware</option>
                  <option value="African Talking Drums">African Talking Drums</option>
                  <option value="Audio Cables, Pedals & Accessories">Audio Cables, Pedals & Accessories</option>
                  <option value="Other Instrument / Gear">Other Instrument / Gear</option>
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
                          Drop off at Vivadoxa Music (No. 49B Umaru Ibrahim St., beside Angwan Sunday Market, Kaduna)
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
