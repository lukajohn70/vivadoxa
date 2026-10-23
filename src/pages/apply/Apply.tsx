import { useState, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Logo,
  Button,
  Icon,
  Field,
  SelectField,
} from "@/components/ui"
import { programs } from "@/lib/data"
import {
  isValidEmail,
  SCHOOL_PHONE,
  SCHOOL_PHONE_2,
  SCHOOL_WHATSAPP,
  SCHOOL_EMAIL,
  WHATSAPP_URL,
} from "@/lib/utils"
import { submitApplication } from "@/lib/api"
import type { ApplicationData, Page } from "@/types"

// ── Multi-step stepper UI ────────────────────────────────────────────────────
function Stepper({ step }: { step: number }) {
  const steps = ["Personal", "Guardian", "Program", "Review"]
  return (
    <nav className="stepper" aria-label="Application steps">
      {steps.map((x, i) => (
        <div
          key={x}
          className={i + 1 <= step ? "done" : ""}
          aria-current={i + 1 === step ? "step" : undefined}
        >
          <span aria-hidden="true">
            {i + 1 < step ? <Icon name="check" size={14} /> : i + 1}
          </span>
          <small>{x}</small>
        </div>
      ))}
    </nav>
  )
}

function FormStep({
  title,
  intro,
  children,
}: {
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="form-step">
      <span className="eyebrow">Step details</span>
      <h2>{title}</h2>
      <p>{intro}</p>
      {children}
    </div>
  )
}

function ReviewRow({
  title,
  value,
  onEdit,
}: {
  title: string
  value: string
  onEdit: () => void
}) {
  return (
    <div className="review-row">
      <span>{title}</span>
      <strong>{value}</strong>
      <button type="button" onClick={onEdit} aria-label={`Edit ${title}`}>
        Edit
      </button>
    </div>
  )
}

export const OFFICIAL_APPLY_DISCIPLINES = [
  // Instruments (13 official disciplines)
  { name: "Piano & Keyboard Mastery", category: "Instruments" },
  { name: "Acoustic Guitar Foundations", category: "Instruments" },
  { name: "Lead & Electric Guitar", category: "Instruments" },
  { name: "Bass Guitar Groove & Harmony", category: "Instruments" },
  { name: "Violin & Classical Strings", category: "Instruments" },
  { name: "Saxophone (Alto & Tenor)", category: "Instruments" },
  { name: "Trumpet & Brass Fundamentals", category: "Instruments" },
  { name: "Euphonium & Low Brass", category: "Instruments" },
  { name: "Clarinet & Woodwinds", category: "Instruments" },
  { name: "Concert Flute", category: "Instruments" },
  { name: "Contemporary Drum Kit", category: "Instruments" },
  { name: "Talking Drums (Traditional Percussion)", category: "Instruments" },
  // Vocals
  { name: "Voice Training & Vocal Stagecraft", category: "Vocals" },
  // Composition
  { name: "Sight Reading & Music Theory", category: "Composition" },
  // Production
  { name: "Music Production & Audio Engineering", category: "Music Production" },
]

export const ENROLLMENT_DURATION_PLANS = [
  {
    id: "1-month",
    name: "1 Month Intensive Foundation",
    duration: "1 Month",
    fee: 20000,
    feeLabel: "₦20,000",
    badge: "Foundation",
    inclusions: "4 weekly intensive sessions, foundational technique & practice sheet",
  },
  {
    id: "3-months",
    name: "3 Months Certificate Program",
    duration: "3 Months",
    fee: 55000,
    feeLabel: "₦55,000",
    badge: "Most Popular",
    inclusions: "Full Vivadoxa study kit, textbooks, recital preparation & Certificate",
  },
  {
    id: "6-months",
    name: "6 Months Diploma Program",
    duration: "6 Months",
    fee: 95000,
    feeLabel: "₦95,000",
    badge: "Professional Track",
    inclusions: "Complete textbooks, Vivadoxa Academy T-Shirt, ensemble concerts & Diploma",
  },
  {
    id: "1-year",
    name: "1 Year Advance Diploma",
    duration: "12 Months (1 Year)",
    fee: 185000,
    feeLabel: "₦185,000",
    badge: "Mastery Level",
    inclusions: "Flagship conservatory training, live studio recording & Advance Diploma",
  },
  {
    id: "home-lessons",
    name: "Private Home Lessons (Monthly)",
    duration: "Monthly",
    fee: 50000,
    feeLabel: "₦50,000 / month",
    badge: "1-on-1 at Residence",
    inclusions: "Instructor visits your home in Kaduna for personalized 1-on-1 coaching",
  },
]

const defaultData = (): ApplicationData => ({
  fullName: "",
  dateOfBirth: "",
  gender: "Female",
  phone: "",
  email: "",
  state: "Kaduna",
  address: "",
  guardianName: "",
  relationship: "",
  guardianPhone: "",
  guardianEmail: "",
  category: "Instruments",
  program: "Piano & Keyboard Mastery",
  planTier: "1-month",
  level: "Beginner",
  schedule: "Weekday evenings",
  studyMode: "Onsite",
  referenceNo: "",
  amount: 20000,
})

export function Apply({ go }: { go: (p: Page | string) => void }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const stepParam = parseInt(searchParams.get("step") || "1", 10)
  const initialStep = stepParam >= 1 && stepParam <= 4 ? stepParam : 1
  const [step, setStep] = useState(initialStep)
  const [data, setData] = useState<ApplicationData>(defaultData)
  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicationData, string>>
  >({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState("")
  const [accountPassword, setAccountPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const formRef = useRef<HTMLDivElement>(null)

  function set<K extends keyof ApplicationData>(k: K, v: ApplicationData[K]) {
    setData((d) => ({ ...d, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
    setSubmitError("")
  }

  function handleCategoryChange(cat: string) {
    set("category", cat)
    const matchingProgs = OFFICIAL_APPLY_DISCIPLINES.filter((p) => p.category === cat)
    if (matchingProgs.length > 0) {
      set("program", matchingProgs[0].name)
    }
  }

  function handlePlanChange(planId: string) {
    const plan = ENROLLMENT_DURATION_PLANS.find((p) => p.id === planId)
    if (plan) {
      set("planTier", planId)
      if (planId === "home-lessons") {
        set("studyMode", "Home Lessons")
        set("amount", 50000)
      } else {
        if (data.studyMode === "Home Lessons") {
          set("studyMode", "Onsite")
        }
        set("amount", plan.fee)
      }
    }
  }

  function handleStudyModeChange(mode: "Onsite" | "Online" | "Home Lessons") {
    set("studyMode", mode)
    if (mode === "Home Lessons") {
      set("planTier", "home-lessons")
      set("amount", 50000)
    } else {
      if (data.planTier === "home-lessons") {
        set("planTier", "1-month")
        set("amount", 20000)
      } else {
        const plan = ENROLLMENT_DURATION_PLANS.find((p) => p.id === data.planTier)
        set("amount", plan ? plan.fee : 20000)
      }
    }
  }

  function validateStep(): boolean {
    const e: typeof errors = {}

    if (step === 1) {
      if (!data.fullName.trim()) e.fullName = "Full name is required."
      if (!data.dateOfBirth) e.dateOfBirth = "Date of birth is required."
      if (!data.gender) e.gender = "Please select a gender."
      if (!data.phone.trim()) e.phone = "Phone number is required."
      if (!data.email.trim()) e.email = "Email is required."
      else if (!isValidEmail(data.email))
        e.email = "Enter a valid email address."
      if (!data.state) e.state = "Please select your state."
      if (!data.address.trim()) e.address = "Home address is required."
    }

    if (step === 2) {
      if (data.guardianEmail && !isValidEmail(data.guardianEmail)) {
        e.guardianEmail = "Enter a valid guardian email address."
      }
    }

    if (step === 3) {
      if (!data.category) e.category = "Please select a category."
      if (!data.program) e.program = "Please select a program."
      if (!data.level) e.level = "Please select your level."
      if (!data.schedule) e.schedule = "Please select a preferred schedule."
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validateStep()) {
      formRef.current?.scrollIntoView({ behavior: "smooth" })
      return
    }
    setStep((s) => s + 1)
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  function prev() {
    setStep((s) => s - 1)
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function handleSubmit() {
    if (!termsAccepted) {
      setTermsError("You must agree to the terms before proceeding.")
      return
    }
    setTermsError("")
    setSubmitting(true)
    setSubmitError("")

    try {
      const res = await submitApplication({
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        address: `${data.address}, ${data.state}`,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        program: data.program,
        studyMode: data.studyMode,
        level: data.level,
        amount: data.amount,
        password: accountPassword.trim() || undefined,
      })

      if (res && res.success && res.application_no) {
        // Save current application context for seamless payment processing
        sessionStorage.setItem("vdx_current_ref", res.application_no)
        sessionStorage.setItem("vdx_current_amount", String(data.amount))
        sessionStorage.setItem("vdx_current_name", data.fullName)
        sessionStorage.setItem("vdx_current_email", data.email)
        sessionStorage.setItem("vdx_current_program", data.program)

        navigate(`/payment?ref=${res.application_no}&amount=${data.amount}`)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setSubmitError(
          res.error || "Failed to submit application. Please try again.",
        )
      }
    } catch {
      setSubmitError(
        "Network connection error. Please verify your connection.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="application">
      <div className="container">
        <div className="application-head">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) navigate(-1)
                else go("programs")
              }}
              className="btn btn-secondary !min-h-[36px] !py-1 !px-3 !text-xs inline-flex items-center gap-1.5 cursor-pointer"
              title="Return to previous page"
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
          <span className="text-xs text-[var(--muted)] hidden sm:inline">Official Admissions Portal</span>
        </div>

        <div className="apply-layout">
          <aside>
            <span>Admissions {new Date().getFullYear()}</span>
            <h1>Begin your musical journey.</h1>
            <p>
              Complete your application in a few simple steps to secure your
              audition and class placement.
            </p>
            <div className="support">
              <strong className="block text-white font-semibold text-sm mb-3">Admissions Desk</strong>
              <div className="flex flex-col gap-2.5 text-xs text-[#9dacb8]">
                <a href={`tel:${SCHOOL_PHONE}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Icon name="phone" size={13} className="text-slate-400" /> <span>{SCHOOL_PHONE}</span>
                </a>
                <a href={`tel:${SCHOOL_PHONE_2}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <Icon name="phone" size={13} className="text-slate-400" /> <span>{SCHOOL_PHONE_2}</span>
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <WhatsAppIcon size={14} className="text-emerald-400 shrink-0" /> <span>{SCHOOL_WHATSAPP} (WhatsApp)</span>
                </a>
                <a href={`mailto:${SCHOOL_EMAIL}`} className="inline-flex items-center gap-2 hover:text-white transition-colors break-all">
                  <Icon name="mail" size={13} className="text-slate-400" /> <span>{SCHOOL_EMAIL}</span>
                </a>
              </div>
            </div>
          </aside>

          <section
            className="apply-card"
            ref={formRef as React.RefObject<HTMLElement>}
          >
            <Stepper step={step} />

            {/* Step 1 — Personal */}
            {step === 1 && (
              <FormStep
                title="Personal details"
                intro="Let's start with some basic information about you."
              >
                <div className="form-grid">
                  <Field
                    id="ap-name"
                    label="Full name"
                    placeholder="As shown on your ID"
                    value={data.fullName}
                    onChange={(v) => set("fullName", v)}
                    required
                    error={errors.fullName}
                  />
                  <Field
                    id="ap-dob"
                    label="Date of birth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(v) => set("dateOfBirth", v)}
                    required
                    error={errors.dateOfBirth}
                  />
                  <SelectField
                    id="ap-gender"
                    label="Gender"
                    value={data.gender}
                    onChange={(v) => set("gender", v)}
                    required
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </SelectField>
                  <Field
                    id="ap-phone"
                    label="Phone number"
                    placeholder="+234"
                    type="tel"
                    value={data.phone}
                    onChange={(v) => set("phone", v)}
                    required
                    error={errors.phone}
                  />
                  <Field
                    id="ap-email"
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    value={data.email}
                    onChange={(v) => set("email", v)}
                    required
                    error={errors.email}
                  />
                  <SelectField
                    id="ap-state"
                    label="State"
                    value={data.state}
                    onChange={(v) => set("state", v)}
                    required
                  >
                    <option value="Kaduna">Kaduna</option>
                    <option value="Kano">Kano</option>
                    <option value="Abuja FCT">Abuja FCT</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Other">Other</option>
                  </SelectField>
                  <label className="field full" htmlFor="ap-address">
                    <span>
                      Home address{" "}
                      <span className="required-star" aria-hidden="true">
                        {" "}
                        *
                      </span>
                    </span>
                    <input
                      id="ap-address"
                      placeholder="Street, area, and city"
                      value={data.address}
                      onChange={(e) => set("address", e.target.value)}
                      required
                      aria-invalid={!!errors.address}
                    />
                    {errors.address && (
                      <span className="field-hint error" role="alert">
                        {errors.address}
                      </span>
                    )}
                  </label>
                </div>
              </FormStep>
            )}

            {/* Step 2 — Guardian */}
            {step === 2 && (
              <FormStep
                title="Guardian details"
                intro="Required for applicants under the age of 18. Skip if you are an adult applicant."
              >
                <div className="form-grid">
                  <Field
                    id="ap-gname"
                    label="Guardian name"
                    placeholder="Full name of parent or guardian"
                    value={data.guardianName}
                    onChange={(v) => set("guardianName", v)}
                  />
                  <Field
                    id="ap-rel"
                    label="Relationship"
                    placeholder="e.g. Mother, Father, Sponsor"
                    value={data.relationship}
                    onChange={(v) => set("relationship", v)}
                  />
                  <Field
                    id="ap-gphone"
                    label="Guardian phone"
                    placeholder="+234"
                    type="tel"
                    value={data.guardianPhone}
                    onChange={(v) => set("guardianPhone", v)}
                  />
                  <Field
                    id="ap-gemail"
                    label="Guardian email"
                    type="email"
                    placeholder="guardian@example.com"
                    value={data.guardianEmail}
                    onChange={(v) => set("guardianEmail", v)}
                    error={errors.guardianEmail}
                  />
                </div>
              </FormStep>
            )}

            {/* Step 3 — Program */}
            {step === 3 && (
              <FormStep
                title="Choose your program"
                intro="Tell us what instrument and study mode you would like to pursue."
              >
                <div className="form-grid">
                  <SelectField
                    id="ap-cat"
                    label="Category"
                    value={data.category}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="Instruments">Musical Instruments (13 Official Disciplines)</option>
                    <option value="Vocals">Voice Training & Vocal Stagecraft</option>
                    <option value="Composition">Sight Reading & Music Theory</option>
                    <option value="Music Production">Music Production & Audio Engineering</option>
                  </SelectField>
                  <SelectField
                    id="ap-prog"
                    label="Program / Instrument"
                    value={data.program}
                    onChange={(v) => set("program", v)}
                    required
                  >
                    {OFFICIAL_APPLY_DISCIPLINES
                      .filter((p) => p.category === data.category)
                      .map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                  </SelectField>
                  <SelectField
                    id="ap-level"
                    label="Current level"
                    value={data.level}
                    onChange={(v) => set("level", v)}
                    required
                  >
                    <option value="Beginner">Beginner (No prior experience)</option>
                    <option value="Intermediate">Intermediate (Basic chords / scales)</option>
                    <option value="Advanced">Advanced (Performance & repertoire)</option>
                  </SelectField>
                  <SelectField
                    id="ap-sched"
                    label="Preferred schedule"
                    value={data.schedule}
                    onChange={(v) => set("schedule", v)}
                    required
                  >
                    <option value="Weekday evenings">Weekday evenings</option>
                    <option value="Saturday mornings">Saturday mornings</option>
                    <option value="Saturday afternoons">
                      Saturday afternoons
                    </option>
                    <option value="Flexible (discuss with instructor)">
                      Flexible (discuss with instructor)
                    </option>
                  </SelectField>

                  {/* Enrollment Duration Plan Selection */}
                  <div className="full">
                    <span className="field-label">
                      Enrollment Duration & Program Track{" "}
                      <span className="required-star" aria-hidden="true">
                        *
                      </span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                      {ENROLLMENT_DURATION_PLANS.map((plan) => {
                        const isSelected = data.planTier === plan.id;
                        const isHomeLessons = plan.id === "home-lessons";
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => handlePlanChange(plan.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isHomeLessons ? "sm:col-span-2" : "sm:col-span-1"
                            } ${
                              isSelected
                                ? "border-[var(--gold)] bg-[var(--gold)]/10 ring-2 ring-[var(--gold)]/30"
                                : "border-[var(--border,#e5e7eb)] bg-[var(--card,#ffffff)] hover:border-[var(--gold)]/50"
                            }`}
                          >
                            {isHomeLessons ? (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold2)] border border-[var(--gold)]/30">
                                      {plan.badge}
                                    </span>
                                    <span className="font-bold text-sm text-[var(--navy,#0f2438)]">
                                      {plan.name}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[var(--muted,#64748b)] leading-relaxed">
                                    {plan.inclusions}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[var(--border,#e5e7eb)]/60 sm:pl-3.5">
                                  <div className="text-left sm:text-right">
                                    <span className="block text-[11px] text-[var(--muted,#64748b)] font-medium">
                                      {plan.duration}
                                    </span>
                                    <strong className="text-sm font-bold text-[var(--gold)]">
                                      {plan.feeLabel}
                                    </strong>
                                  </div>
                                  <span
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                      isSelected
                                        ? "border-[var(--gold)] bg-[var(--gold)] text-white shadow-xs"
                                        : "border-zinc-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="w-full">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    {plan.badge ? (
                                      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold2)] border border-[var(--gold)]/30">
                                        {plan.badge}
                                      </span>
                                    ) : (
                                      <span />
                                    )}
                                    <span
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                        isSelected
                                          ? "border-[var(--gold)] bg-[var(--gold)] text-white shadow-xs"
                                          : "border-zinc-300 bg-white"
                                      }`}
                                    >
                                      {isSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                      )}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-sm text-[var(--navy,#0f2438)] leading-snug mb-1">
                                    {plan.name}
                                  </h4>
                                  <p className="text-xs text-[var(--muted,#64748b)] leading-relaxed mb-3">
                                    {plan.inclusions}
                                  </p>
                                </div>
                                <div className="w-full pt-2 border-t border-[var(--border,#e5e7eb)]/60 flex items-center justify-between mt-auto">
                                  <span className="text-xs text-[var(--muted,#64748b)] font-medium">
                                    {plan.duration}
                                  </span>
                                  <strong className="text-sm font-bold text-[var(--gold)]">
                                    {plan.feeLabel}
                                  </strong>
                                </div>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="full">
                    <span className="field-label">
                      Study mode{" "}
                      <span className="required-star" aria-hidden="true">
                        *
                      </span>
                    </span>
                    <div
                      className="radio-cards"
                      role="radiogroup"
                      aria-label="Study mode"
                    >
                      {(["Onsite", "Online", "Home Lessons"] as const).map(
                        (x) => (
                          <label key={x}>
                            <input
                              type="radio"
                              name="mode"
                              value={x}
                              checked={data.studyMode === x}
                              onChange={() => handleStudyModeChange(x)}
                            />
                            <span>
                              <strong>{x}</strong>
                              <small>
                                {x === "Onsite"
                                  ? "At Vivadoxa Kaduna Studio"
                                  : x === "Online"
                                    ? "Live Interactive Video Coaching"
                                    : "Instructor visits your residence (₦50,000/mo)"}
                              </small>
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </FormStep>
            )}

            {/* Step 4 — Review */}
            {step === 4 && (
              <FormStep
                title="Review & confirm"
                intro="Verify your admission details before submitting."
              >
                <div className="review">
                  <ReviewRow
                    title="Applicant"
                    value={`${data.fullName} · ${data.email}`}
                    onEdit={() => setStep(1)}
                  />
                  <ReviewRow
                    title="Phone"
                    value={data.phone}
                    onEdit={() => setStep(1)}
                  />
                  <ReviewRow
                    title="Program"
                    value={`${data.program} · ${data.level}`}
                    onEdit={() => setStep(3)}
                  />
                  <ReviewRow
                    title="Study mode"
                    value={`${data.studyMode} · ${data.schedule}`}
                    onEdit={() => setStep(3)}
                  />
                  <ReviewRow
                    title="Plan & Duration"
                    value={ENROLLMENT_DURATION_PLANS.find((p) => p.id === data.planTier)?.name || "1 Month Intensive Foundation"}
                    onEdit={() => setStep(3)}
                  />
                  {data.guardianName && (
                    <ReviewRow
                      title="Guardian"
                      value={`${data.guardianName} · ${data.guardianPhone}`}
                      onEdit={() => setStep(2)}
                    />
                  )}
                  <div className="total">
                    <div>
                      <span>{ENROLLMENT_DURATION_PLANS.find((p) => p.id === data.planTier)?.name || "Program Tuition"}</span>
                      <small className="block text-xs text-[var(--muted)] font-normal mt-0.5">
                        Uniform tuition policy across all 13 official instruments and vocal disciplines
                      </small>
                    </div>
                    <strong>₦{data.amount.toLocaleString("en-NG")}</strong>
                  </div>
                  <div style={{ margin: "20px 0 16px", padding: 16, background: "#faf9f6", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Icon name="lock" size={15} className="text-amber-800" />
                      <strong style={{ fontSize: 13, color: "var(--navy)" }}>Student Portal Account (Optional)</strong>
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>
                      Create a password to access your Student Portal anytime to track your admission review, download official admission letters, and view payment receipts.
                    </p>
                    <input
                      type="password"
                      placeholder="Choose a password (leave blank for automatic credentials)"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      style={{ width: "100%", minHeight: 40, borderRadius: 6, border: "1px solid #cbd5e1", padding: "0 12px", background: "white", fontSize: 13 }}
                    />
                  </div>

                  <label className="terms">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked)
                        if (e.target.checked) setTermsError("")
                      }}
                      aria-invalid={!!termsError}
                    />
                    <span>
                      I agree to the Vivadoxa Music School{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold text-[var(--gold)] hover:text-[var(--gold2)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </a>
                      ,{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold text-[var(--gold)] hover:text-[var(--gold2)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>
                      ,{" "}
                      <a
                        href="/tuition-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold text-[var(--gold)] hover:text-[var(--gold2)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Tuition &amp; Refund Policy
                      </a>
                      , and{" "}
                      <a
                        href="/safeguarding"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold text-[var(--gold)] hover:text-[var(--gold2)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Child Safeguarding Guidelines
                      </a>
                      .
                    </span>
                  </label>
                  {termsError && (
                    <p className="field-hint error" role="alert">
                      {termsError}
                    </p>
                  )}
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
                </div>
              </FormStep>
            )}

            <div className="apply-actions">
              {step > 1 ? (
                <Button variant="ghost" onClick={prev} disabled={submitting}>
                  Back
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) navigate(-1)
                    else go("programs")
                  }}
                  disabled={submitting}
                >
                  ← Back to Programs
                </Button>
              )}
              <Button
                onClick={step < 4 ? next : handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  "Submitting to admissions…"
                ) : step === 4 ? (
                  <>
                    Submit & proceed to payment <Icon name="arrow" />
                  </>
                ) : (
                  <>
                    Save & continue <Icon name="arrow" />
                  </>
                )}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Apply
