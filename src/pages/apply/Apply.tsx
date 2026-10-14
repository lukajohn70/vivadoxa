import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Logo,
  Button,
  Icon,
  Field,
  SelectField,
} from "@/components/ui"
import { programs } from "@/lib/data"
import { isValidEmail } from "@/lib/utils"
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
  program: "Piano & Keyboard",
  level: "Beginner",
  schedule: "Weekday evenings",
  studyMode: "Onsite",
  referenceNo: "",
  amount: 85000,
})

export function Apply({ go }: { go: (p: Page | string) => void }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ApplicationData>(defaultData)
  const [errors, setErrors] = useState<
    Partial<Record<keyof ApplicationData, string>>
  >({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const formRef = useRef<HTMLDivElement>(null)

  function set<K extends keyof ApplicationData>(k: K, v: ApplicationData[K]) {
    setData((d) => ({ ...d, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
    setSubmitError("")
  }

  function handleProgramChange(name: string) {
    const prog = programs.find((p) => p.name === name)
    set("program", name)
    if (prog) set("amount", prog.feeAmount)
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
          <button
            className="logo-button"
            onClick={() => go("home")}
            aria-label="Go to homepage"
          >
            <Logo />
          </button>
          <span>Official Admissions Portal</span>
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
              <strong>Admissions Desk</strong>
              <a href="tel:+2348031308881">+234 803 130 8881</a>
              <a href="mailto:admissions@vivadoxa.ng">admissions@vivadoxa.ng</a>
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
                    onChange={(v) => set("category", v)}
                    required
                  >
                    <option value="Instruments">Instruments</option>
                    <option value="Vocals">Vocals</option>
                    <option value="Composition">Composition</option>
                    <option value="Music Production">Music Production</option>
                  </SelectField>
                  <SelectField
                    id="ap-prog"
                    label="Program / instrument"
                    value={data.program}
                    onChange={handleProgramChange}
                    required
                  >
                    {programs
                      .filter((p) => p.category === data.category)
                      .map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name} — {p.fee}
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
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
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
                      Flexible
                    </option>
                  </SelectField>
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
                              onChange={() => set("studyMode", x)}
                            />
                            <span>
                              <strong>{x}</strong>
                              <small>
                                {x === "Onsite"
                                  ? "At our Kaduna studio"
                                  : x === "Online"
                                    ? "Live video lessons"
                                    : "Instructor visits you"}
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
                  {data.guardianName && (
                    <ReviewRow
                      title="Guardian"
                      value={`${data.guardianName} · ${data.guardianPhone}`}
                      onEdit={() => setStep(2)}
                    />
                  )}
                  <div className="total">
                    <div>
                      <span>Program tuition (one 12-week term)</span>
                    </div>
                    <strong>₦{data.amount.toLocaleString("en-NG")}</strong>
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
                    I agree to Vivadoxa Music School admission terms and
                    policies.
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
                <span />
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
