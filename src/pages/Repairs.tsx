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
import { SEO } from "@/components/SEO"
import { repairSaxImg, repairElectronicsImg } from "@/lib/data"
import { isValidEmail } from "@/lib/utils"
import {
  submitRepairRequest,
  fetchRepairByCode,
  checkUserSession,
} from "@/lib/api"

interface RepairServicesSelection {
  diagnosis: boolean
  repair: boolean
  servicing: boolean
  setupTuning: boolean
  other: boolean
}

interface RepairForm {
  // 01 CUSTOMER DETAILS
  fullName: string
  phone: string
  email: string
  addressArea: string
  preferredContact: "Phone" | "WhatsApp" | "Email"
  bestTime: "Morning" | "Afternoon" | "Evening" | "Anytime"

  // 02 INSTRUMENT / EQUIPMENT DETAILS
  equipmentType: string
  brandModel: string
  serialNumber: string
  accessories: string
  equipmentAge: string

  // 03 PROBLEM DESCRIPTION
  issue: string
  problemStarted: string
  previouslyRepaired: "Yes" | "No"
  visibleDamage: "Yes" | "No"

  // 04 SERVICE REQUESTED
  services: RepairServicesSelection
  otherService: string
  additionalNotes: string

  // 05 CUSTOMER ACKNOWLEDGEMENT
  acknowledged: boolean
  customerSignature: string
  dateSubmitted: string
  collectionArrangement: "dropoff" | "pickup"
  photos: FileList | null
}

const todayFormatted = new Date().toISOString().split("T")[0]

const emptyRepair: RepairForm = {
  fullName: "",
  phone: "",
  email: "",
  addressArea: "",
  preferredContact: "WhatsApp",
  bestTime: "Morning",

  equipmentType: "Piano / Digital Keyboard",
  brandModel: "",
  serialNumber: "",
  accessories: "",
  equipmentAge: "",

  issue: "",
  problemStarted: "",
  previouslyRepaired: "No",
  visibleDamage: "No",

  services: {
    diagnosis: true,
    repair: true,
    servicing: false,
    setupTuning: false,
    other: false,
  },
  otherService: "",
  additionalNotes: "",

  acknowledged: false,
  customerSignature: "",
  dateSubmitted: todayFormatted,
  collectionArrangement: "dropoff",
  photos: null,
}

export function Repairs() {
  const [form, setForm] = useState<RepairForm>(emptyRepair)
  const [errors, setErrors] =
    useState<Partial<Record<keyof RepairForm | "services", string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")
  const [sentCode, setSentCode] = useState<string | null>(null)
  const [autofilled, setAutofilled] = useState(false)
  const [slipModalOpen, setSlipModalOpen] = useState(false)

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
            addressArea: prev.addressArea || user.address || "",
            customerSignature:
              prev.customerSignature || user.full_name || "",
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

  function toggleService(key: keyof RepairServicesSelection) {
    setForm((f) => ({
      ...f,
      services: {
        ...f.services,
        [key]: !f.services[key],
      },
    }))
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.fullName.trim()) e.fullName = "Full name is required."
    if (!form.phone.trim()) e.phone = "Phone / WhatsApp number is required."
    if (form.email.trim() && !isValidEmail(form.email)) {
      e.email = "Enter a valid email address."
    }
    if (!form.equipmentType.trim()) {
      e.equipmentType = "Please select or specify equipment type."
    }
    if (!form.issue.trim()) {
      e.issue = "Please describe the fault or symptoms observed."
    }
    if (!form.customerSignature.trim()) {
      e.customerSignature = "Please sign or enter your full name as signature."
    }
    if (!form.acknowledged) {
      e.acknowledged = "Please tick the customer acknowledgement to proceed."
    }
    if (
      form.collectionArrangement === "pickup" &&
      !form.addressArea.trim()
    ) {
      e.addressArea = "Please provide your pickup address and landmark."
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      const firstErr = document.querySelector(".field-hint.error")
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    setSubmitting(true)
    setServerError("")

    const selectedServicesList: string[] = []
    if (form.services.diagnosis)
      selectedServicesList.push("Diagnosis / fault assessment")
    if (form.services.repair) selectedServicesList.push("Repair")
    if (form.services.servicing)
      selectedServicesList.push("Servicing / maintenance")
    if (form.services.setupTuning)
      selectedServicesList.push("Setup / tuning")
    if (form.services.other && form.otherService.trim()) {
      selectedServicesList.push(`Other: ${form.otherService.trim()}`)
    }

    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      addressArea: form.addressArea.trim(),
      preferredContact: form.preferredContact,
      bestTime: form.bestTime,

      equipmentType: form.equipmentType,
      instrumentType: form.equipmentType,
      brandModel: form.brandModel.trim(),
      serialNumber: form.serialNumber.trim(),
      accessories: form.accessories.trim(),
      equipmentAge: form.equipmentAge.trim(),

      issue: form.issue.trim(),
      problemDescription: form.issue.trim(),
      problemStarted: form.problemStarted.trim(),
      previouslyRepaired: form.previouslyRepaired,
      visibleDamage: form.visibleDamage,

      serviceRequested: selectedServicesList,
      additionalNotes: form.additionalNotes.trim(),

      customerSignature: form.customerSignature.trim(),
      dateSubmitted: form.dateSubmitted,
      intakeMethod: form.collectionArrangement,
      collectionArrangement:
        form.collectionArrangement === "pickup"
          ? "Courier Pickup & Return"
          : "Studio Drop-off & Collection",
      pickupAddress: form.addressArea.trim(),
    }

    try {
      const res = await submitRepairRequest(payload)
      if (res && res.success) {
        const code = res.tracking_code || "REP-RECEIVED"
        setSentCode(code)
      } else {
        setServerError(
          res.error || "Failed to submit repair request. Please try again.",
        )
      }
    } catch {
      setServerError("Network connection error. Please verify your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (!trackCode.trim()) {
      setTrackError(
        "Please enter your repair tracking code (e.g. REP-2026-042).",
      )
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

  const repairSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Musical Instrument Repair & Maintenance",
    name: "Vivadoxa Repairs & Service Centre Kaduna",
    provider: {
      "@type": "LocalBusiness",
      name: "Vivadoxa Music Repairs & Service Centre",
      address: {
        "@type": "PostalAddress",
        streetAddress:
          "No. 49B Umaru Ibrahim Street, off Super Market Street, Beside the Market, Ungwan Sunday",
        addressLocality: "Kaduna",
        addressRegion: "Kaduna State",
        addressCountry: "NG",
      },
      telephone: "+2348031308881",
      url: "https://vivadoxa.ng/repairs",
    },
    areaServed: "Kaduna State, Nigeria",
  }

  const repairFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What musical instruments do you repair in Kaduna?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Vivadoxa Repairs & Service Centre repairs keyboards and digital pianos, drum sets and percussion, guitars and string instruments, brass and woodwind instruments, and pro audio equipment (speakers, mixers, amplifiers).",
        },
      },
      {
        "@type": "Question",
        name: "What is your repair turnaround time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Repair feasibility, turnaround time, and costs depend on the nature of the fault, spare-parts availability, and the instrument involved. Minor setups take 24 to 72 hours; comprehensive circuit repairs take 3 to 7 working days.",
        },
      },
    ],
  }

  return (
    <main>
      <SEO
        title="Vivadoxa Repairs & Service Centre — Instrument Care & Maintenance | Kaduna"
        description="Expert care for your instruments in Kaduna. Keyboard, piano, drum set, guitar, brass, and audio equipment repairs. Track your repair online."
        keywords="instrument repair, instrument repair kaduna, musical instrument repair, fix keyboard kaduna, saxophone repair kaduna, guitar setup kaduna, vivadoxa repairs"
        canonicalUrl="/repairs"
        ogImage="/media/repairs/repair-saxophone-craftsman.jpeg"
        schema={[repairSchema, repairFaqSchema]}
      />

      <PageHero
        eyebrow="Repairs &amp; Service Clinic"
        title="Expert care for your instruments."
        body="Precision diagnostic overhaul, fret leveling, electronic troubleshooting, and routine maintenance in Kaduna. Talk directly with our master technicians or book a workshop intake assessment."
        actions={
          <>
            <a href="#repair-form" className="btn btn-primary inline-flex items-center gap-2">
              Request Repair Assessment <Icon name="arrow" size={14} />
            </a>
            <a
              href={`https://wa.me/2348031308881?text=${encodeURIComponent(
                "Hello Vivadoxa Repairs & Service Centre, I would like to speak to a technician about an instrument repair.",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-concierge inline-flex items-center gap-2 !text-white !border-white/20 hover:!border-[var(--gold2)]"
            >
              <WhatsAppIcon size={16} /> Speak to a Technician
            </a>
          </>
        }
      />

      {/* ── Official Contact & Workshop Header Bar ── */}
      <section className="bg-white border-b border-[var(--line)] py-4">
        <div className="container flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)] animate-pulse" />
            <strong className="text-[var(--navy)] font-bold">
              Service Centre Lines:
            </strong>
            <span className="text-[var(--muted)]">Kaduna Workshop:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="tel:08031308881"
              className="font-bold text-[var(--navy)] hover:text-[var(--gold)]"
            >
              0803 130 8881
            </a>
            <span className="text-slate-300">|</span>
            <a
              href="tel:09097070881"
              className="font-bold text-[var(--navy)] hover:text-[var(--gold)]"
            >
              0909 707 0881
            </a>
            <span className="text-slate-300">|</span>
            <a
              href="mailto:vivadoxa@gmail.com"
              className="text-[var(--muted)] hover:text-[var(--gold)]"
            >
              vivadoxa@gmail.com
            </a>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-[var(--muted)] hidden sm:inline">
              No. 49B Umaru Ibrahim St., Ungwan Sunday, Kaduna
            </span>
          </div>
        </div>
      </section>

      {/* ── Submission Confirmation Banner if Sent ── */}
      {sentCode && (
        <section className="section bg-[var(--cream)] border-b border-[var(--gold)]/30 py-10">
          <div className="container max-w-3xl">
            <div className="form-shell !p-6 sm:!p-8 bg-white border border-[var(--gold)]/40 shadow-md">
              <Success
                title="Repair request logged successfully"
                body={
                  form.collectionArrangement === "pickup"
                    ? "Your repair request has been logged. Our logistics team will call your phone number to coordinate courier pickup at your specified address in Kaduna."
                    : "Your repair order has been logged. Please bring your instrument to Vivadoxa Music at No. 49B Umaru Ibrahim Street, off Super Market Street beside Angwan Sunday Market, Kaduna during opening hours."
                }
                extra={`Job / Ticket Reference: ${sentCode}`}
                onReset={() => {
                  setSentCode(null)
                  setForm(emptyRepair)
                }}
                action="Book another repair"
              />

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-[var(--line)]">
                <Button
                  variant="primary"
                  onClick={() => setSlipModalOpen(true)}
                  className="!py-2.5 !px-5 text-xs font-bold"
                >
                  <Icon name="doc" size={15} /> Print / View Official Repair Slip
                </Button>

                <a
                  href={`https://wa.me/2348031308881?text=${encodeURIComponent(
                    `Hello Vivadoxa Workshop, I have submitted an Instrument Repair Request.\nTicket Reference: ${sentCode}\nCustomer: ${form.fullName}\nEquipment: ${form.equipmentType} (${form.brandModel})\nIntake: ${form.collectionArrangement === "pickup" ? "Courier Pickup" : "Drop-off at Studio"}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary !py-2.5 !px-4 text-xs font-bold inline-flex items-center gap-2"
                >
                  <WhatsAppIcon size={16} /> Send Slip to WhatsApp Desk
                </a>

                <button
                  type="button"
                  className="btn btn-secondary !py-2.5 !px-4 text-xs font-bold"
                  onClick={() => {
                    const code = sentCode
                    setTrackCode(code)
                    fetchRepairByCode(code).then((res) => {
                      if (res && res.success && res.data) {
                        setTrackedRecord(res.data)
                        const el = document.getElementById("tracker-section")
                        el?.scrollIntoView({ behavior: "smooth" })
                      }
                    })
                  }}
                >
                  Track This Order Now &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Main Content Area ── */}
      <section className="section">
        <div className="container">
          {/* Tracking lookup section */}
          <div
            id="tracker-section"
            style={{
              background: "white",
              padding: "32px",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow)",
              marginBottom: "50px",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{ maxWidth: 640 }}>
              <span className="eyebrow">Customer Tracking</span>
              <h2
                style={{
                  fontSize: 26,
                  margin: "6px 0 10px",
                  color: "var(--navy)",
                  fontFamily: "'DM Serif Display', serif",
                }}
              >
                Track Your Repair Progress
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                Already submitted a request or dropped off equipment? Enter your
                job / ticket reference (e.g. REP-2026-042) to check technician
                assessment, findings, cost approval, and collection readiness.
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
                    fontSize: 14,
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
                    <span className="eyebrow">
                      Ticket #{trackedRecord.tracking_code}
                    </span>
                    <h3
                      style={{
                        margin: "4px 0",
                        fontSize: 22,
                        color: "var(--navy)",
                        fontFamily: "'DM Serif Display', serif",
                      }}
                    >
                      {trackedRecord.instrument ||
                        trackedRecord.equipment_type ||
                        "Musical Instrument"}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--muted)",
                        fontSize: 12,
                      }}
                    >
                      Customer: {trackedRecord.customer_name} · Service:{" "}
                      {trackedRecord.intake_method === "pickup"
                        ? "Courier Pickup & Return"
                        : "Studio Drop-off & Collection"}
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
                            ? "Service Completed / Collected"
                            : "Order Received"}
                  </Badge>
                </div>

                <div
                  className="doc-grid"
                  style={{ marginTop: 16, marginBottom: 12 }}
                >
                  <div>
                    <small>Reported Problem / Issue</small>
                    <strong>{trackedRecord.issue}</strong>
                  </div>
                  <div>
                    <small>Estimated Repair Cost</small>
                    <strong style={{ color: "var(--navy)" }}>
                      {trackedRecord.estimated_cost
                        ? `₦${Number(trackedRecord.estimated_cost).toLocaleString()}`
                        : "Assessment in progress"}
                    </strong>
                  </div>
                  {trackedRecord.pickup_address && (
                    <div style={{ gridColumn: "1/-1" }}>
                      <small>Collection / Delivery Address</small>
                      <strong>{trackedRecord.pickup_address}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── 1. Our Services (Standardized Breakdown) ── */}
          <div className="mb-16 sm:mb-20">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="eyebrow">Specialist Workshop</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
                Our Instrument &amp; Audio <em>Services</em>
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
                Professional diagnostics, routine servicing, and careful restoration across major musical instruments and audio electronics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {/* Service 1 */}
              <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-xs flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                    01
                  </div>
                  <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                    Keyboard and Digital Piano Repairs
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Specialist bench servicing for workstations, synthesizers, and digital uprights:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Fault diagnosis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Selected electronic and electrical repairs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Key and control troubleshooting (sticky keys, contacts)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Power-related fault assessment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>General servicing &amp; internal cleaning</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--line)]">
                  <a
                    href="#repair-form"
                    onClick={() => set("equipmentType", "Piano / Digital Keyboard")}
                    className="text-xs font-bold text-[var(--gold-text)] hover:underline flex items-center gap-1"
                  >
                    Request Keyboard Assessment &rarr;
                  </a>
                </div>
              </div>

              {/* Service 2 */}
              <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-xs flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                    02
                  </div>
                  <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                    Drum Set Servicing
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Acoustic and electronic rhythm kit maintenance for churches and gigging bands:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Hardware inspection &amp; stand stability check</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Adjustment and setup (bearing edges, head seating)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Selected component replacement (lugs, tension rods, pedals)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>General maintenance &amp; snare bed alignment</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--line)]">
                  <a
                    href="#repair-form"
                    onClick={() => set("equipmentType", "Drum Set & Percussion")}
                    className="text-xs font-bold text-[var(--gold-text)] hover:underline flex items-center gap-1"
                  >
                    Request Drum Servicing &rarr;
                  </a>
                </div>
              </div>

              {/* Service 3 */}
              <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-xs flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                    03
                  </div>
                  <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                    Guitar &amp; String Instrument Repairs
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Acoustic, classical, electric, and bass guitars, plus violins:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>General inspection and maintenance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>String replacement &amp; tension balancing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Setup and adjustment (truss rod, low action, bridge)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Selected hardware repairs (tuning pegs, nuts, jacks)</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--line)]">
                  <a
                    href="#repair-form"
                    onClick={() => set("equipmentType", "Guitar (Acoustic / Electric / Bass)")}
                    className="text-xs font-bold text-[var(--gold-text)] hover:underline flex items-center gap-1"
                  >
                    Request Guitar Setup &rarr;
                  </a>
                </div>
              </div>

              {/* Service 4 */}
              <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-xs flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                    04
                  </div>
                  <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                    Wind and Brass Instrument Servicing
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Saxophones, trumpets, flutes, clarinets, and brass horns:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Inspection and diagnostic leak check</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Maintenance and ultrasonic valve cleaning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Selected pad reseating, tenon corks &amp; springs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Depending on instrument &amp; technical expertise availability</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--line)]">
                  <a
                    href="#repair-form"
                    onClick={() => set("equipmentType", "Saxophone / Brass / Woodwind")}
                    className="text-xs font-bold text-[var(--gold-text)] hover:underline flex items-center gap-1"
                  >
                    Request Wind/Brass Check &rarr;
                  </a>
                </div>
              </div>

              {/* Service 5 */}
              <div className="bg-white p-6 rounded-2xl border border-[var(--line)] shadow-xs flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all md:col-span-2 lg:col-span-2">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                    05
                  </div>
                  <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                    Audio Equipment Repairs
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Diagnostic assessment and circuit repair for sound reinforcement equipment:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Speakers and active monitors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Power amplifiers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Audio mixers (analog &amp; digital consoles)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Selected PA equipment</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Other supported audio devices &amp; custom cables</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--line)]">
                  <a
                    href="#repair-form"
                    onClick={() => set("equipmentType", "Audio Equipment (Speaker / Amp / Mixer)")}
                    className="text-xs font-bold text-[var(--gold-text)] hover:underline flex items-center gap-1"
                  >
                    Request Audio Equipment Assessment &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Our Repair Process (5 Steps) ── */}
          <div className="mb-16 sm:mb-20 bg-white p-8 sm:p-14 rounded-3xl border border-[var(--line)] shadow-xs">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="eyebrow">Methodology &amp; Standards</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
                Our 5-Step <em>Repair Process</em>
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
                A transparent, step-by-step workflow ensuring clear communication, cost pre-approval, and thorough quality testing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)] flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-[var(--navy)] text-white text-xs font-bold flex items-center justify-center mb-3">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-[var(--navy)] mb-1">
                    Assessment
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                    We inspect the instrument or equipment and discuss the problem with you.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)] flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-[var(--navy)] text-white text-xs font-bold flex items-center justify-center mb-3">
                    2
                  </span>
                  <h4 className="font-bold text-sm text-[var(--navy)] mb-1">
                    Diagnosis
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                    We identify the likely fault and determine the appropriate repair approach.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)] flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-[var(--gold)] text-[var(--navy)] text-xs font-bold flex items-center justify-center mb-3">
                    3
                  </span>
                  <h4 className="font-bold text-sm text-[var(--navy)] mb-1">
                    Cost Approval
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                    We explain the proposed work and estimated cost before proceeding.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)] flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-[var(--navy)] text-white text-xs font-bold flex items-center justify-center mb-3">
                    4
                  </span>
                  <h4 className="font-bold text-sm text-[var(--navy)] mb-1">
                    Repair &amp; Testing
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                    We carry out the agreed work and thoroughly test the equipment where applicable.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)] flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-[var(--gold)] text-white text-xs font-bold flex items-center justify-center mb-3">
                    5
                  </span>
                  <h4 className="font-bold text-sm text-[var(--navy)] mb-1">
                    Collection
                  </h4>
                  <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                    We inform you when your equipment is ready for collection or delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Please Note:</strong> Repair feasibility, turnaround time, and costs depend on the nature of the fault, spare-parts availability, and the instrument involved. No chargeable repair will proceed without your explicit approval.
            </div>
          </div>

          {/* ── 3. Give Your Instrument a Second Life Callout ── */}
          <div
            style={{
              marginBottom: 56,
              background: "linear-gradient(135deg, #0b0b0b 0%, #1f1b18 100%)",
              borderRadius: "var(--radius)",
              padding: "48px 36px",
              textAlign: "center",
              color: "white",
              border: "1px solid var(--gold)",
            }}
          >
            <span className="eyebrow !text-[var(--gold2)] mb-2 block">
              Economic &amp; Sustainable Care
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight leading-[1.15] mb-4">
              Give Your Instrument a <em>Second Life</em>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-6">
              Do not replace an instrument before exploring whether it can be repaired economically. Our certified clinic restores tone, action, and durability at a fraction of replacement cost.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <a href="#repair-form" className="btn btn-primary">
                Request a Repair Assessment <Icon name="arrow" size={14} />
              </a>
              <a
                href={`https://wa.me/2348031308881?text=${encodeURIComponent(
                  "Hello Vivadoxa Repairs, I would like to speak to a technician about repairing my instrument.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 inline-flex items-center gap-2"
              >
                <WhatsAppIcon size={16} /> Speak to a Technician
              </a>
            </div>
            <p className="text-xs uppercase font-extrabold tracking-widest text-[var(--gold2)] m-0">
              Reliable service. Careful workmanship. Better musical performance.
            </p>
          </div>

          {/* ── 4. Official Instrument Repair Request Form (From Attached Document) ── */}
          <div
            id="repair-form"
            className="form-shell"
            style={{
              background: "white",
              border: "1.5px solid var(--line)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              borderRadius: "var(--radius)",
              padding: "36px 32px",
            }}
          >
            {/* Form Header matching PDF */}
            <div className="border-b border-[var(--line)] pb-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-[var(--gold)] block">
                  Official Intake Document
                </span>
                <h2
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "clamp(24px, 3vw, 32px)",
                    color: "var(--navy)",
                    margin: "4px 0 6px",
                  }}
                >
                  INSTRUMENT REPAIR REQUEST
                </h2>
                <p className="text-xs text-[var(--muted)] m-0 leading-relaxed max-w-xl">
                  Tell us what needs attention. Complete the details below so our technicians can assess your instrument and contact you with the next steps.
                </p>
              </div>

              <div className="text-right shrink-0 hidden md:block">
                <span className="text-[11px] font-bold text-[var(--navy)] block">
                  REPAIRS &amp; SERVICE CENTRE
                </span>
                <span className="text-[10px] text-[var(--muted)] block">
                  0803 130 8881 | 0909 707 0881
                </span>
                <span className="text-[10px] text-[var(--muted)] block">
                  vivadoxa@gmail.com
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {autofilled && (
                <div
                  style={{
                    marginBottom: 24,
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
                  <span>
                    Logged in as <strong>{form.fullName || form.email}</strong>{" "}
                    — contact details autofilled automatically.
                  </span>
                </div>
              )}

              {/* ── 01 CUSTOMER DETAILS ── */}
              <div className="mb-8">
                <div className="bg-[var(--navy)] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>01 CUSTOMER DETAILS</span>
                  <span className="text-[10px] text-slate-300 font-normal">
                    * Required fields
                  </span>
                </div>

                <div className="form-grid">
                  <Field
                    id="repair-name"
                    label="Full name"
                    placeholder="Your full name *"
                    value={form.fullName}
                    onChange={(v) => set("fullName", v)}
                    required
                    error={errors.fullName}
                  />

                  <Field
                    id="repair-phone"
                    label="Phone / WhatsApp *"
                    placeholder="0803 130 8881"
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
                    error={errors.email}
                  />

                  <Field
                    id="repair-address"
                    label="Address / Area"
                    placeholder="e.g. Ungwan Sunday / Barnawa / Malali, Kaduna"
                    value={form.addressArea}
                    onChange={(v) => set("addressArea", v)}
                    error={errors.addressArea}
                  />

                  <div>
                    <label
                      htmlFor="preferred-contact"
                      className="field-label block text-xs font-bold text-[var(--navy)] mb-1"
                    >
                      Preferred contact method
                    </label>
                    <select
                      id="preferred-contact"
                      value={form.preferredContact}
                      onChange={(e) =>
                        set(
                          "preferredContact",
                          e.target.value as RepairForm["preferredContact"],
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--line)] bg-white text-[var(--navy)]"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone">Phone call</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="best-time"
                      className="field-label block text-xs font-bold text-[var(--navy)] mb-1"
                    >
                      Best time to reach you
                    </label>
                    <select
                      id="best-time"
                      value={form.bestTime}
                      onChange={(e) =>
                        set("bestTime", e.target.value as RepairForm["bestTime"])
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--line)] bg-white text-[var(--navy)]"
                    >
                      <option value="Morning">Morning (8am – 12pm)</option>
                      <option value="Afternoon">Afternoon (12pm – 4pm)</option>
                      <option value="Evening">Evening (4pm – 7pm)</option>
                      <option value="Anytime">Anytime during work hours</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── 02 INSTRUMENT / EQUIPMENT DETAILS ── */}
              <div className="mb-8">
                <div className="bg-[var(--navy)] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>02 INSTRUMENT / EQUIPMENT DETAILS</span>
                  <span className="text-[10px] text-slate-300 font-normal">
                    * Required fields
                  </span>
                </div>

                <div className="form-grid">
                  <SelectField
                    id="repair-equipment-type"
                    label="Equipment type *"
                    value={form.equipmentType}
                    onChange={(v) => set("equipmentType", v)}
                    required
                    error={errors.equipmentType}
                  >
                    <option value="Piano / Digital Keyboard">
                      Piano / Digital Keyboard / Synthesizer
                    </option>
                    <option value="Acoustic Drum Set">Acoustic Drum Set</option>
                    <option value="Electronic Drums">Electronic Drums</option>
                    <option value="Acoustic / Classical Guitar">
                      Acoustic / Classical Guitar
                    </option>
                    <option value="Electric / Bass Guitar">
                      Electric / Bass Guitar
                    </option>
                    <option value="Violin / Bowed String">
                      Violin / Bowed String
                    </option>
                    <option value="Saxophone (Alto / Tenor / Soprano)">
                      Saxophone (Alto / Tenor / Soprano)
                    </option>
                    <option value="Trumpet / Cornet / Brass">
                      Trumpet / Cornet / Brass Horn
                    </option>
                    <option value="Flute / Clarinet / Woodwind">
                      Flute / Clarinet / Woodwind
                    </option>
                    <option value="Audio Speaker / PA System">
                      Audio Speaker / PA System
                    </option>
                    <option value="Audio Mixer / Sound Console">
                      Audio Mixer / Sound Console
                    </option>
                    <option value="Audio Amplifier">Audio Amplifier</option>
                    <option value="Other Equipment">
                      Other Equipment / Gear
                    </option>
                  </SelectField>

                  <Field
                    id="repair-brand-model"
                    label="Brand and model"
                    placeholder="e.g. Yamaha PSR-E373 / Fender Stratocaster"
                    value={form.brandModel}
                    onChange={(v) => set("brandModel", v)}
                  />

                  <Field
                    id="repair-serial"
                    label="Serial number (if available)"
                    placeholder="Located on rear or soundboard sticker"
                    value={form.serialNumber}
                    onChange={(v) => set("serialNumber", v)}
                  />

                  <Field
                    id="repair-accessories"
                    label="Accessories included"
                    placeholder="e.g. Power adapter, gig bag, cables, pedal"
                    value={form.accessories}
                    onChange={(v) => set("accessories", v)}
                  />

                  <Field
                    id="repair-age"
                    label="Approx. age / purchase date"
                    placeholder="e.g. 2 years old / Purchased 2024"
                    value={form.equipmentAge}
                    onChange={(v) => set("equipmentAge", v)}
                  />
                </div>
              </div>

              {/* ── 03 PROBLEM DESCRIPTION ── */}
              <div className="mb-8">
                <div className="bg-[var(--navy)] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>03 PROBLEM DESCRIPTION</span>
                  <span className="text-[10px] text-slate-300 font-normal">
                    * Required fields
                  </span>
                </div>

                <div className="form-grid">
                  <div className="full">
                    <Textarea
                      id="repair-fault-desc"
                      label="Describe the fault. When did it start? Include unusual sounds, error messages, or other symptoms *"
                      placeholder="Give as much detail as possible (e.g. Key F#3 does not trigger sound, buzzer noise when turning on, air leaking from C# pad...)"
                      value={form.issue}
                      onChange={(v) => set("issue", v)}
                      required
                      error={errors.issue}
                      rows={4}
                    />
                  </div>

                  <Field
                    id="repair-when-started"
                    label="When did the problem begin?"
                    placeholder="e.g. Last week after a rehearsal / Gradually over 2 months"
                    value={form.problemStarted}
                    onChange={(v) => set("problemStarted", v)}
                  />

                  <div>
                    <label className="field-label block text-xs font-bold text-[var(--navy)] mb-1">
                      Previously repaired?
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="previouslyRepaired"
                          value="Yes"
                          checked={form.previouslyRepaired === "Yes"}
                          onChange={() => set("previouslyRepaired", "Yes")}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="previouslyRepaired"
                          value="No"
                          checked={form.previouslyRepaired === "No"}
                          onChange={() => set("previouslyRepaired", "No")}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="field-label block text-xs font-bold text-[var(--navy)] mb-1">
                      Visible damage?
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="visibleDamage"
                          value="Yes"
                          checked={form.visibleDamage === "Yes"}
                          onChange={() => set("visibleDamage", "Yes")}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="visibleDamage"
                          value="No"
                          checked={form.visibleDamage === "No"}
                          onChange={() => set("visibleDamage", "No")}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div className="full">
                    <UploadZone
                      label="Upload photos of equipment or fault (optional)"
                      hint="JPG or PNG, up to 10MB"
                      accept="image/jpeg,image/png"
                      onChange={(files) => set("photos", files)}
                      fileName={form.photos?.[0]?.name}
                    />
                  </div>
                </div>
              </div>

              {/* ── 04 SERVICE REQUESTED ── */}
              <div className="mb-8">
                <div className="bg-[var(--navy)] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>04 SERVICE REQUESTED</span>
                  <span className="text-[10px] text-slate-300 font-normal">
                    Select all that apply
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--line)] bg-[#faf8f5] text-xs font-semibold text-[var(--navy)] cursor-pointer hover:border-[var(--gold)]">
                    <input
                      type="checkbox"
                      checked={form.services.diagnosis}
                      onChange={() => toggleService("diagnosis")}
                    />
                    <span>Diagnosis / fault assessment</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--line)] bg-[#faf8f5] text-xs font-semibold text-[var(--navy)] cursor-pointer hover:border-[var(--gold)]">
                    <input
                      type="checkbox"
                      checked={form.services.repair}
                      onChange={() => toggleService("repair")}
                    />
                    <span>Repair</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--line)] bg-[#faf8f5] text-xs font-semibold text-[var(--navy)] cursor-pointer hover:border-[var(--gold)]">
                    <input
                      type="checkbox"
                      checked={form.services.servicing}
                      onChange={() => toggleService("servicing")}
                    />
                    <span>Servicing / maintenance</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--line)] bg-[#faf8f5] text-xs font-semibold text-[var(--navy)] cursor-pointer hover:border-[var(--gold)]">
                    <input
                      type="checkbox"
                      checked={form.services.setupTuning}
                      onChange={() => toggleService("setupTuning")}
                    />
                    <span>Setup / tuning</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--line)] bg-[#faf8f5] text-xs font-semibold text-[var(--navy)] cursor-pointer hover:border-[var(--gold)]">
                    <input
                      type="checkbox"
                      checked={form.services.other}
                      onChange={() => toggleService("other")}
                    />
                    <span>Other</span>
                  </label>
                </div>

                {form.services.other && (
                  <div className="mb-4">
                    <Field
                      id="repair-other-spec"
                      label="Specify other service requested"
                      placeholder="e.g. Ultrasonic bath cleaning, custom rewiring..."
                      value={form.otherService}
                      onChange={(v) => set("otherService", v)}
                    />
                  </div>
                )}

                <Textarea
                  id="repair-notes"
                  label="Additional notes or instructions"
                  placeholder="Any particular deadline, component preferences, or handling instructions..."
                  value={form.additionalNotes}
                  onChange={(v) => set("additionalNotes", v)}
                  rows={2}
                />
              </div>

              {/* ── 05 CUSTOMER ACKNOWLEDGEMENT ── */}
              <div className="mb-8">
                <div className="bg-[var(--navy)] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>05 CUSTOMER ACKNOWLEDGEMENT</span>
                  <span className="text-[10px] text-slate-300 font-normal">
                    * Authorization &amp; Terms
                  </span>
                </div>

                {/* Verbatim Disclaimer from PDF */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 mb-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.acknowledged}
                      onChange={(e) => set("acknowledged", e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-xs text-amber-950 leading-relaxed">
                      <strong>I confirm</strong> that the information provided is accurate and that I am authorised to submit this equipment for assessment. I understand that inspection may be required before a repair quotation can be provided, and that no chargeable repair will proceed without my approval.
                    </span>
                  </label>
                  {errors.acknowledged && (
                    <p className="field-hint error mt-2">
                      {errors.acknowledged}
                    </p>
                  )}
                </div>

                <div className="form-grid">
                  <Field
                    id="repair-signature"
                    label="Customer name / signature *"
                    placeholder="Type your full legal name as digital signature"
                    value={form.customerSignature}
                    onChange={(v) => set("customerSignature", v)}
                    required
                    error={errors.customerSignature}
                  />

                  <Field
                    id="repair-date-submitted"
                    label="Date submitted"
                    type="date"
                    value={form.dateSubmitted}
                    onChange={(v) => set("dateSubmitted", v)}
                    required
                  />

                  <div className="full">
                    <label className="field-label block text-xs font-bold text-[var(--navy)] mb-1">
                      Preferred collection / return arrangement *
                    </label>
                    <div className="radio-cards">
                      <label>
                        <input
                          type="radio"
                          name="collectionArrangement"
                          value="dropoff"
                          checked={form.collectionArrangement === "dropoff"}
                          onChange={() => set("collectionArrangement", "dropoff")}
                        />
                        <span>
                          <strong>I will drop off &amp; collect at Vivadoxa</strong>
                          <small>
                            No. 49B Umaru Ibrahim Street, beside Angwan Sunday Market, Kaduna
                          </small>
                        </span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="collectionArrangement"
                          value="pickup"
                          checked={form.collectionArrangement === "pickup"}
                          onChange={() => set("collectionArrangement", "pickup")}
                        />
                        <span>
                          <strong>Request Courier Pickup &amp; Return</strong>
                          <small>
                            Vivadoxa courier collects &amp; returns equipment to your location in Kaduna
                          </small>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {serverError && (
                <div
                  className="login-error"
                  role="alert"
                  style={{ marginBottom: 20 }}
                >
                  <Icon name="warning" size={16} />
                  {serverError}
                </div>
              )}

              <div className="form-action flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--line)]">
                <p className="text-xs text-[var(--muted)] m-0">
                  By submitting, you will receive an official Job Reference code and can print your intake slip.
                </p>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    "Submitting request…"
                  ) : (
                    <>
                      Submit Instrument Repair Request <Icon name="arrow" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* ── Inside Workshop Craftsmanship Photos ── */}
          <div style={{ margin: "64px 0" }}>
            <div
              style={{
                textAlign: "center",
                maxWidth: 740,
                margin: "0 auto 28px",
              }}
            >
              <span className="eyebrow">Inside the Vivadoxa Workshop</span>
              <h2
                style={{
                  fontSize: "clamp(26px, 3.5vw, 36px)",
                  margin: "8px 0 10px",
                  color: "var(--navy)",
                  fontFamily: "'DM Serif Display', serif",
                }}
              >
                Precision Acoustic, Electrical &amp; Mechanical Restoration
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Every instrument brought to our Kaduna clinic undergoes systematic diagnostic inspection by experienced technicians using precision leak-lights, digital multimeters, and specialized tooling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Workshop Card 1: Brass & Woodwinds */}
              <div className="bg-white rounded-2xl overflow-hidden border border-[var(--line)] shadow-xs flex flex-col">
                <div className="h-60 sm:h-72 overflow-hidden relative bg-[#0a192f]">
                  <img
                    src={repairSaxImg}
                    alt="Vivadoxa master technician repairing a golden brass saxophone at the workbench"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-[var(--navy)]/90 backdrop-blur-sm px-3 py-1 rounded-md border border-[var(--gold)]/40 text-[var(--gold2)] text-xs font-bold uppercase tracking-wider">
                    Acoustic &amp; Brass Bench
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                      Brass, Woodwinds &amp; String Overhauls
                    </h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                      Precision pad seating, key regulation, cork replacement, valve alignment, leak-light inspection, and fretboard restoration for saxophones, flutes, trumpets, violins, and guitars.
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 border-t border-[var(--line)] pt-3">
                    <li className="flex items-center gap-2">
                      <span className="text-[var(--gold)] font-bold">✓</span>
                      <span>Pad leveling &amp; acoustic leak sealing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[var(--gold)] font-bold">✓</span>
                      <span>Fret dressing, action lowering &amp; bridge setup</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Workshop Card 2: Electronics & Keyboards */}
              <div className="bg-white rounded-2xl overflow-hidden border border-[var(--line)] shadow-xs flex flex-col">
                <div className="h-60 sm:h-72 overflow-hidden relative bg-[#0a192f]">
                  <img
                    src={repairElectronicsImg}
                    alt="Vivadoxa electronics technician using multimeter diagnosing synthesizer keyboard circuit board"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-[var(--navy)]/90 backdrop-blur-sm px-3 py-1 rounded-md border border-[var(--gold)]/40 text-[var(--gold2)] text-xs font-bold uppercase tracking-wider">
                    Electronics &amp; Circuit Bench
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                      Digital Keyboards &amp; Audio Circuit Diagnostics
                    </h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                      Multimeter component testing, PCB circuit repairs, key contact strip replacement, power supply diagnostics, audio jack soldering, and speaker reconing for workstations and synthesizers.
                    </p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 border-t border-[var(--line)] pt-3">
                    <li className="flex items-center gap-2">
                      <span className="text-[var(--gold)] font-bold">✓</span>
                      <span>Sticky keys &amp; rubber contact strip replacement</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[var(--gold)] font-bold">✓</span>
                      <span>Power circuit, fuse &amp; audio output restoration</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Official Printable Repair Slip Modal ── */}
      {slipModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[var(--line)] relative my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--line)]">
              <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
                Official Instrument Repair Intake Slip
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-primary !py-1.5 !px-3 !text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="doc" size={13} /> Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => setSlipModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  aria-label="Close"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            </div>

            {/* Exact PDF Layout Rendering */}
            <div
              id="printable-repair-slip"
              className="p-6 bg-white border border-slate-300 rounded-lg text-slate-900 font-sans text-xs space-y-4"
            >
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-red-800 pb-3 gap-2">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                    VIVADOXA MUSIC
                  </h1>
                  <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider block">
                    ACTUALIZE YOUR PASSION
                  </span>
                  <span className="text-[9px] text-slate-600 block mt-0.5">
                    MUSICAL INSTRUMENTS • REPAIRS • MUSIC EDUCATION • STUDIO
                  </span>
                </div>
                <div className="sm:text-right text-[10px] text-slate-600">
                  <strong className="block text-slate-900 font-bold uppercase">
                    REPAIRS &amp; SERVICE CENTRE
                  </strong>
                  <span>0803 130 8881 | 0909 707 0881</span>
                  <span className="block">vivadoxa@gmail.com</span>
                  <span className="block max-w-xs">
                    No. 49B Umaru Ibrahim Street, off Super Market Street, Beside the Market, Ungwan Sunday, Kaduna.
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-1 bg-slate-100 border-y border-slate-300">
                <h2 className="text-sm font-extrabold tracking-wider uppercase m-0 text-slate-900">
                  INSTRUMENT REPAIR REQUEST
                </h2>
                <span className="text-[9px] text-slate-600">
                  Tell us what needs attention. Complete the details below so our technicians can assess your instrument and contact you with the next steps.
                </span>
              </div>

              {/* 01 CUSTOMER DETAILS */}
              <div>
                <div className="bg-slate-800 text-white font-bold text-[10px] px-2 py-0.5 uppercase tracking-wide">
                  01 CUSTOMER DETAILS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-300 text-[10px] divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  <div className="p-2">
                    <span className="text-slate-500 block">Full name *</span>
                    <strong className="text-slate-900">{form.fullName || "—"}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Phone / WhatsApp *</span>
                    <strong className="text-slate-900">{form.phone || "—"}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Email address</span>
                    <strong className="text-slate-900">{form.email || "—"}</strong>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 border-x border-b border-slate-300 text-[10px] divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  <div className="p-2">
                    <span className="text-slate-500 block">Address / Area</span>
                    <strong className="text-slate-900">{form.addressArea || "—"}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Preferred contact method</span>
                    <strong className="text-slate-900">{form.preferredContact}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Best time to reach you</span>
                    <strong className="text-slate-900">{form.bestTime}</strong>
                  </div>
                </div>
              </div>

              {/* 02 INSTRUMENT / EQUIPMENT DETAILS */}
              <div>
                <div className="bg-slate-800 text-white font-bold text-[10px] px-2 py-0.5 uppercase tracking-wide">
                  02 INSTRUMENT / EQUIPMENT DETAILS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-300 text-[10px] divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  <div className="p-2">
                    <span className="text-slate-500 block">Equipment type *</span>
                    <strong className="text-slate-900">{form.equipmentType}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Brand and model</span>
                    <strong className="text-slate-900">{form.brandModel || "—"}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Serial number (if available)</span>
                    <strong className="text-slate-900">{form.serialNumber || "—"}</strong>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 border-x border-b border-slate-300 text-[10px] divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  <div className="p-2">
                    <span className="text-slate-500 block">Accessories included</span>
                    <strong className="text-slate-900">{form.accessories || "None"}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Approx. age / purchase date</span>
                    <strong className="text-slate-900">{form.equipmentAge || "—"}</strong>
                  </div>
                </div>
              </div>

              {/* 03 PROBLEM DESCRIPTION */}
              <div>
                <div className="bg-slate-800 text-white font-bold text-[10px] px-2 py-0.5 uppercase tracking-wide">
                  03 PROBLEM DESCRIPTION
                </div>
                <div className="border border-slate-300 p-2 text-[10px]">
                  <span className="text-slate-500 block mb-1">
                    Describe the fault. When did it start? Include unusual sounds, error messages, or other symptoms.
                  </span>
                  <p className="text-slate-900 m-0 leading-relaxed font-medium">
                    {form.issue || "—"}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 border-x border-b border-slate-300 text-[10px] divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  <div className="p-2">
                    <span className="text-slate-500 block">When did the problem begin?</span>
                    <strong className="text-slate-900">{form.problemStarted || "—"}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Previously repaired?</span>
                    <strong className="text-slate-900">{form.previouslyRepaired}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Visible damage?</span>
                    <strong className="text-slate-900">{form.visibleDamage}</strong>
                  </div>
                </div>
              </div>

              {/* 04 SERVICE REQUESTED */}
              <div>
                <div className="bg-slate-800 text-white font-bold text-[10px] px-2 py-0.5 uppercase tracking-wide">
                  04 SERVICE REQUESTED
                </div>
                <div className="border border-slate-300 p-2 text-[10px] flex flex-wrap gap-4">
                  <span>{form.services.diagnosis ? "☒" : "☐"} Diagnosis / fault assessment</span>
                  <span>{form.services.repair ? "☒" : "☐"} Repair</span>
                  <span>{form.services.servicing ? "☒" : "☐"} Servicing / maintenance</span>
                  <span>{form.services.setupTuning ? "☒" : "☐"} Setup / tuning</span>
                  <span>{form.services.other ? "☒" : "☐"} Other: {form.otherService || "—"}</span>
                </div>
                {form.additionalNotes && (
                  <div className="border-x border-b border-slate-300 p-2 text-[10px]">
                    <span className="text-slate-500 block">Additional notes or instructions:</span>
                    <p className="text-slate-900 m-0">{form.additionalNotes}</p>
                  </div>
                )}
              </div>

              {/* 05 CUSTOMER ACKNOWLEDGEMENT */}
              <div>
                <div className="bg-slate-800 text-white font-bold text-[10px] px-2 py-0.5 uppercase tracking-wide">
                  05 CUSTOMER ACKNOWLEDGEMENT
                </div>
                <div className="border border-slate-300 p-2 text-[9px] text-slate-700 leading-tight">
                  I confirm that the information provided is accurate and that I am authorised to submit this equipment for assessment. I understand that inspection may be required before a repair quotation can be provided, and that no chargeable repair will proceed without my approval.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 border-x border-b border-slate-300 text-[10px] divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                  <div className="p-2">
                    <span className="text-slate-500 block">Customer name / signature</span>
                    <strong className="text-slate-900 underline font-serif text-xs">
                      {form.customerSignature || form.fullName}
                    </strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Date submitted</span>
                    <strong className="text-slate-900">{form.dateSubmitted}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Preferred collection / return arrangement</span>
                    <strong className="text-slate-900">
                      {form.collectionArrangement === "pickup"
                        ? "Courier Pickup & Return"
                        : "Studio Drop-off & Collection"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* FOR VIVADOXA MUSIC USE ONLY */}
              <div className="pt-2">
                <div className="bg-slate-700 text-white font-bold text-[10px] px-2 py-0.5 uppercase tracking-wider text-center">
                  FOR VIVADOXA MUSIC USE ONLY
                </div>
                <div className="grid grid-cols-3 border border-slate-400 text-[10px] divide-x divide-slate-400">
                  <div className="p-2">
                    <span className="text-slate-500 block">Job / ticket reference</span>
                    <strong className="text-slate-900 text-xs">
                      {sentCode || "REP-PENDING"}
                    </strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Date received</span>
                    <strong className="text-slate-900">{form.dateSubmitted}</strong>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Received by</span>
                    <span className="text-slate-400 italic">Vivadoxa Intake Desk</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-x border-b border-slate-400 text-[10px] divide-x divide-slate-400">
                  <div className="p-2">
                    <span className="text-slate-500 block">Technician diagnosis / findings</span>
                    <span className="text-slate-400 italic">Awaiting Bench Inspection</span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Estimated cost (₦)</span>
                    <span className="text-slate-400 italic">Quotation to follow</span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Estimated completion date</span>
                    <span className="text-slate-400 italic">TBD upon inspection</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-x border-b border-slate-400 text-[10px] divide-x divide-slate-400">
                  <div className="p-2">
                    <span className="text-slate-500 block">Work approved? Yes / No</span>
                    <span className="text-slate-400">Pending customer quote approval</span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Repair status</span>
                    <span className="text-[var(--gold)] font-bold uppercase">Received</span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 block">Date customer notified</span>
                    <span className="text-slate-400">—</span>
                  </div>
                </div>
              </div>

              {/* Slip Footer */}
              <div className="text-center pt-2 text-[9px] text-slate-500 border-t border-slate-300">
                <p className="m-0 font-medium text-slate-700">
                  Thank you for choosing Vivadoxa Music. We will contact you if further information or approval is required.
                </p>
                <p className="m-0 font-bold text-slate-900 tracking-wider uppercase mt-0.5">
                  VIVADOXA MUSIC • WHERE MUSIC COMES ALIVE • ACTUALIZE YOUR PASSION
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Repairs
