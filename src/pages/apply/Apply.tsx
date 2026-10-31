import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Logo,
  Button,
  Icon,
  Field,
  SelectField,
  WhatsAppIcon,
} from "@/components/ui"
import { SEO } from "@/components/SEO"
import {
  isValidEmail,
  SCHOOL_PHONE,
  SCHOOL_PHONE_2,
  SCHOOL_WHATSAPP,
  SCHOOL_EMAIL,
  WHATSAPP_URL,
} from "@/lib/utils"
import { submitApplication } from "@/lib/api"
import { ApplicationSlipModal } from "@/components/OfficialDocument"
import type { ApplicationData, Page } from "@/types"

// ── 17 Available Instruments & Disciplines from Official Roster ───────────────
export const OFFICIAL_AVAILABLE_INSTRUMENTS = [
  { name: "Alto saxophone", family: "Woodwinds & Brass" },
  { name: "Soprano saxophone", family: "Woodwinds & Brass" },
  { name: "Euphonium", family: "Woodwinds & Brass" },
  { name: "Trumpet", family: "Woodwinds & Brass" },
  { name: "Clarinet", family: "Woodwinds & Brass" },
  { name: "Flute", family: "Woodwinds & Brass" },
  { name: "Piano/keyboard", family: "Keyboards" },
  { name: "Intermediate Piano", family: "Keyboards" },
  { name: "Bass guitar", family: "Strings & Frets" },
  { name: "Lead guitar", family: "Strings & Frets" },
  { name: "Acoustic guitar", family: "Strings & Frets" },
  { name: "Talking drums", family: "Percussion" },
  { name: "Set drum", family: "Percussion" },
  { name: "Voice training", family: "Vocals" },
  { name: "Studio engineering", family: "Music Production" },
  { name: "Sound engineering", family: "Music Production" },
  { name: "Violin", family: "Strings" },
  { name: "Ukulele", family: "Strings & Frets" },
  { name: "Others Specify", family: "Custom" },
]

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "Non-Nigerian / International",
]

export const NATIONALITIES = [
  "Nigerian",
  "Ghanaian",
  "Cameroonian",
  "Kenyan",
  "South African",
  "British",
  "American",
  "Canadian",
  "Australian",
  "Irish",
  "German",
  "French",
  "Italian",
  "Spanish",
  "Dutch",
  "Indian",
  "Chinese",
  "Other African",
  "Other International",
]

// ── Official Section D Duration Tracks & Fixed Tuition Policy ─────────────────
// Note: For international students and Nigerian students, price is fixed for ANY instrument chosen.
export const OFFICIAL_DURATION_PLANS = [
  {
    id: "1-month",
    name: "1 Month Intro Program",
    duration: "1 Month",
    feeNGN: 20000,
    feeNGNLabel: "₦20,000",
    feeUSD: 25,
    feeUSDLabel: "$25",
    desc: "4 weekly intensive sessions covering foundational technique, posture & drills.",
  },
  {
    id: "3-months",
    name: "3 Months Certificate Program",
    duration: "3 Months",
    feeNGN: 55000,
    feeNGNLabel: "₦55,000",
    feeUSD: 70,
    feeUSDLabel: "$70",
    desc: "Foundational mastery, sight reading, recital preparation & Vivadoxa Certificate.",
  },
  {
    id: "6-months",
    name: "6 Months Program",
    duration: "6 Months",
    feeNGN: 100000,
    feeNGNLabel: "₦100,000",
    feeUSD: 125,
    feeUSDLabel: "$125",
    desc: "Intermediate musicianship, advanced scales, ensemble coaching & Certificate.",
  },
  {
    id: "1-year",
    name: "12 Months (1 Year) Program",
    duration: "1 Year",
    feeNGN: 195000,
    feeNGNLabel: "₦195,000",
    feeUSD: 240,
    feeUSDLabel: "$240",
    desc: "Conservatory mastery, live studio tracking, solo recital & Advanced Certificate.",
  },
  {
    id: "2-years",
    name: "2 Years Diploma Program",
    duration: "2 Years",
    feeNGN: 500000,
    feeNGNLabel: "₦500,000",
    feeUSD: 600,
    feeUSDLabel: "$600",
    desc: "Full conservatory curriculum, professional tracking, solo recital & Diploma.",
  },
  {
    id: "home-lessons",
    name: "Special: Private Classes (Monthly)",
    duration: "Monthly",
    feeNGN: 70000,
    feeNGNLabel: "₦70,000 / month",
    feeUSD: 90,
    feeUSDLabel: "$90 / month",
    desc: "1-on-1 personalized private coaching at your residence or private online session.",
  },
]

const defaultFormData = (): ApplicationData => ({
  fullName: "",
  firstName: "",
  surname: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  state: "",
  address: "",
  stateOfOrigin: "",
  maritalStatus: "",
  nationality: "",
  occupation: "",
  sponsor: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  relationship: "",
  classType: "",
  category: "",
  program: "",
  planTier: "",
  duration: "",
  sessionTime: "",
  level: "",
  schedule: "",
  studyMode: "Onsite",
  currency: "NGN",
  referenceNo: "",
  amount: 0,
  passportPhoto: "",
  signature: "",
})

export function Apply({ go }: { go: (p: Page | string) => void }) {
  const navigate = useNavigate()
  const [data, setData] = useState<ApplicationData>(defaultFormData)
  const [customInstrument, setCustomInstrument] = useState("")
  const [selectedDays, setSelectedDays] =
    useState<"weekdays" | "weekends" | "">("")
  const [selectedTimeSlot, setSelectedTimeSlot] =
    useState<"Morning Section (10 AM - 1 PM)" | "Afternoon Section (1 PM - 4 PM)" | "Evening Section (4 PM - 7 PM)" | "">(
      "",
    )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState("")
  const [accountPassword, setAccountPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showSlipModal, setShowSlipModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const formTopRef = useRef<HTMLDivElement>(null)

  function set<K extends keyof ApplicationData>(k: K, v: ApplicationData[K]) {
    setData((d) => ({ ...d, [k]: v }))
    setErrors((e) => {
      const next = { ...e }
      delete next[(k as string)]
      return next
    })
    setSubmitError("")
  }

  function handleNameChange(type: "first" | "surname", val: string) {
    if (type === "first") {
      const full = `${val} ${data.surname || ""}`.trim()
      setData((d) => ({ ...d, firstName: val, fullName: full }))
      setErrors((e) => {
        const next = { ...e }
        delete next.firstName
        delete next.fullName
        return next
      })
    } else {
      const full = `${data.firstName || ""} ${val}`.trim()
      setData((d) => ({ ...d, surname: val, fullName: full }))
      setErrors((e) => {
        const next = { ...e }
        delete next.surname
        delete next.fullName
        return next
      })
    }
  }

  function handleNationalityChange(newNat: string) {
    set("nationality", newNat)
    set("stateOfOrigin", "")
    if (newNat !== "Nigerian" && data.studyMode === "Online") {
      handleCurrencyToggle("USD")
    }
  }

  function handlePassportUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Passport photograph must be under 5MB.")
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        set("passportPhoto", url)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleCurrencyToggle(curr: "NGN" | "USD") {
    set("currency", curr)
    const plan = OFFICIAL_DURATION_PLANS.find((p) => p.id === data.planTier)
    if (plan) {
      set("amount", curr === "USD" ? plan.feeUSD : plan.feeNGN)
    }
  }

  function handlePlanSelect(planId: string) {
    const plan = OFFICIAL_DURATION_PLANS.find((p) => p.id === planId)
    if (plan) {
      set("planTier", planId)
      set("duration", plan.duration)
      const isUSD = data.currency === "USD"
      if (planId === "home-lessons") {
        if (data.studyMode !== "Online") {
          set("studyMode", "Home Lessons")
        }
        set("classType", "Private classes")
        set("amount", isUSD ? 90 : 70000)
      } else {
        if (data.studyMode === "Home Lessons") {
          set("studyMode", "Onsite")
          set("classType", "Regular classes")
        }
        set("amount", isUSD ? plan.feeUSD : plan.feeNGN)
      }
    }
  }

  function handleScheduleUpdate(
    days: "weekdays" | "weekends" | "",
    slot: "Morning Section (10 AM - 1 PM)" | "Afternoon Section (1 PM - 4 PM)" | "Evening Section (4 PM - 7 PM)" | "",
  ) {
    setSelectedDays(days)
    setSelectedTimeSlot(slot)
    const daysLabel =
      days === "weekdays"
        ? "Weekdays (3 days per week)"
        : days === "weekends"
          ? "Weekends (Friday & Saturday)"
          : ""
    const combined =
      daysLabel && slot ? `${daysLabel} — ${slot}` : daysLabel || slot || ""
    set("schedule", combined)
    if (slot) set("sessionTime", slot)
  }

  function validateAll(): boolean {
    const e: Record<string, string> = {}
    if (!data.firstName?.trim()) e.firstName = "First name is required."
    if (!data.surname?.trim()) e.surname = "Surname is required."
    if (!data.dateOfBirth) e.dateOfBirth = "Date of birth (DOB) is required."
    if (!data.gender) e.gender = "Please select candidate gender."
    if (!data.phone?.trim()) e.phone = "Candidate phone number is required."
    if (!data.email?.trim()) e.email = "Candidate email address is required."
    else if (!isValidEmail(data.email))
      e.email = "Valid email address is required."
    if (!data.address?.trim()) e.address = "Residential address is required."

    if (!data.nationality) {
      e.nationality = "Please select nationality."
    }

    if (data.nationality === "Nigerian" && !data.stateOfOrigin?.trim()) {
      e.stateOfOrigin = "Please select your Nigerian State of Origin."
    }

    if (!data.program) {
      e.program =
        "Please select your primary instrument or discipline (Section B)."
    }
    if (data.program === "Others Specify" && !customInstrument.trim()) {
      e.customInstrument = "Please specify your instrument or course."
    }

    if (!data.planTier) {
      e.planTier = "Please select a study duration program (Section D)."
    }

    if (!data.signature?.trim()) {
      e.signature = "Please sign by typing your full legal name."
    }

    if (!termsAccepted) {
      setTermsError(
        "You must affirm the candidate declaration checkbox before submitting.",
      )
    }

    setErrors(e)
    return Object.keys(e).length === 0 && termsAccepted
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError("")
    setTermsError("")

    if (!validateAll()) {
      setTimeout(() => {
        const firstErr = document.querySelector(
          ".field-error input, .field-error select, .field-error textarea, .field-hint.error, .login-error",
        )
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: "smooth", block: "center" })
          if (firstErr instanceof HTMLElement) firstErr.focus()
        } else {
          formTopRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      }, 50)
      return
    }

    setSubmitting(true)

    const effectiveFirstName =
      data.firstName?.trim() || data.fullName.split(" ")[0] || "Candidate"
    const effectiveSurname =
      data.surname?.trim() ||
      data.fullName.split(" ").slice(1).join(" ") ||
      "Student"
    const effectiveFullName =
      data.fullName?.trim() ||
      `${effectiveFirstName} ${effectiveSurname}`.trim()
    const effectiveProgram =
      data.program === "Others Specify" && customInstrument.trim()
        ? customInstrument.trim()
        : data.program || "Piano/keyboard"
    const effectivePlan = data.planTier || "3-months"
    const effectiveDuration = data.duration || "3 Months"
    const effectiveAmount = data.amount > 0 ? data.amount : 55000
    const effectiveAddress = data.state
      ? `${data.address}, ${data.state}`
      : data.address || "Kaduna"

    try {
      const res = await submitApplication({
        fullName: effectiveFullName,
        first_name: effectiveFirstName,
        last_name: effectiveSurname,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender || "Female",
        phone: data.phone,
        email: data.email,
        address: effectiveAddress,
        guardianName: data.guardianName || data.sponsor || "Self-Sponsored",
        guardianPhone: data.guardianPhone || data.phone,
        program: effectiveProgram,
        studyMode: data.studyMode || "Onsite",
        level: data.level || "Beginner",
        amount: effectiveAmount,
        password: accountPassword.trim() || undefined,
        // Standardized official application form docx fields
        classType: data.classType || "Regular classes",
        stateOfOrigin:
          data.stateOfOrigin?.trim() ||
          (data.nationality === "Nigerian" ? "Kaduna" : "International"),
        maritalStatus: data.maritalStatus || "Single",
        nationality: data.nationality || "Nigerian",
        occupation: data.occupation || "Student",
        sponsor: data.sponsor || data.guardianName || "Self-Sponsored",
        sessionTime: data.sessionTime || "Morning Section (10 AM - 1 PM)",
        duration: effectiveDuration,
        planTier: effectivePlan,
        currency: data.currency || "NGN",
      })

      if (res && res.success && res.application_no) {
        // Cache application context for payment checkout & document download
        sessionStorage.setItem("vdx_current_ref", res.application_no)
        sessionStorage.setItem("vdx_current_amount", String(effectiveAmount))
        sessionStorage.setItem("vdx_current_currency", data.currency || "NGN")
        sessionStorage.setItem(
          "vdx_current_study_mode",
          data.studyMode || "Onsite",
        )
        sessionStorage.setItem("vdx_current_name", effectiveFullName)
        sessionStorage.setItem("vdx_current_email", data.email)
        sessionStorage.setItem("vdx_current_phone", data.phone || "")
        sessionStorage.setItem("vdx_current_program", effectiveProgram)
        sessionStorage.setItem("vdx_current_schedule", data.schedule || "")
        sessionStorage.setItem("vdx_current_plan", effectivePlan)
        sessionStorage.setItem("vdx_current_address", effectiveAddress)
        if (data.passportPhoto) {
          sessionStorage.setItem("vdx_current_passport", data.passportPhoto)
        }
        sessionStorage.setItem(
          "vdx_current_signature",
          data.signature || effectiveFullName,
        )

        navigate(
          `/payment?ref=${res.application_no}&amount=${effectiveAmount}&currency=${data.currency || "NGN"}&mode=${data.studyMode || "Onsite"}`,
        )
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        setSubmitError(
          res?.error ||
            "Failed to submit official application. Please check your details and try again.",
        )
      }
    } catch {
      setSubmitError("Network connection error. Please verify your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  const currentDateFormatted = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const isUSD = data.currency === "USD"

  return (
    <main
      className="application"
      style={{ background: "#f1ede6", minHeight: "100vh", paddingBottom: 60 }}
    >
      <SEO
        title="Official Admission Application Form"
        description="Official student admission application form for Vivadoxa Music School Kaduna. Standardized conservatory matriculation for instrumental and vocal studies."
      />

      <div className="container" ref={formTopRef}>
        {/* Navigation Head */}
        <div
          className="application-head"
          style={{ borderBottom: "1px solid #d9d4cc", height: 70 }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) navigate(-1)
                else go("home")
              }}
              className="btn btn-secondary !min-h-[36px] !py-1 !px-3 !text-xs inline-flex items-center gap-1.5 cursor-pointer"
              title="Return"
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
          <span className="text-xs text-[var(--navy)] font-mono font-bold hidden sm:inline">
            RC 3184525 · Official Conservatory Matriculation
          </span>
        </div>

        <div
          style={{ maxWidth: 880, margin: "0 auto", padding: "24px 0 60px" }}
        >
          {/* Header Introduction */}
          <div className="mb-6 text-center">
            <span
              style={{
                color: "var(--gold-text)",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Academic Admissions · Vivadoxa Conservatory
            </span>
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(28px, 4vw, 36px)",
                margin: "8px 0 6px",
                color: "var(--navy)",
              }}
            >
              Application for Admission
            </h1>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 13.5,
                maxWidth: 580,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Please complete candidate particulars below. Once submitted, your
              registration reference will be generated for tuition confirmation.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                className="btn btn-secondary !min-h-[38px] !py-1.5 !px-4 !text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Icon name="copy" size={14} /> Preview &amp; Print Official Form (PDF)
              </button>
            </div>
          </div>

          {/* Centered Official Application Form */}
          <form
            onSubmit={handleFormSubmit}
            noValidate
            autoComplete="off"
            className="apply-card"
            style={{
              background: "#ffffff",
              borderRadius: 14,
              boxShadow: "0 10px 40px rgba(14, 13, 12, 0.06)",
              border: "1px solid var(--line-strong)",
              padding: "36px 42px",
            }}
          >
            {/* ══════════════════════════════════════════════════════════════════
                FORM HEADER: CLASS CATEGORIES + PASSPORT PHOTO (Matching docx)
                ══════════════════════════════════════════════════════════════════ */}
            <div
              style={{
                borderBottom: "2px solid var(--navy)",
                paddingBottom: 20,
                marginBottom: 24,
              }}
            >
              {/* Top Row: Class Category Checkboxes + Date + Passport Photo Box */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 20,
                }}
              >
                {/* Left: School Title & Category Checkboxes */}
                <div style={{ flex: "1 1 340px" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        color: "var(--navy)",
                        background: "#e2e8f0",
                        padding: "2px 6px",
                        borderRadius: 3,
                      }}
                    >
                      RC 3184525
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        fontWeight: 600,
                      }}
                    >
                      Official Conservatory Registration
                    </span>
                  </div>

                  <h1
                    style={{
                      fontFamily: "serif",
                      fontSize: 26,
                      color: "var(--navy)",
                      margin: "4px 0 2px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    VIVADOXA MUSIC SCHOOL
                  </h1>
                  <h2
                    style={{
                      fontFamily: "serif",
                      fontSize: 18,
                      color: "var(--gold)",
                      margin: "0 0 14px",
                      textTransform: "uppercase",
                      letterSpacing: "1.2px",
                    }}
                  >
                    APPLICATION FORM
                  </h2>

                  {/* Class Category Checkboxes from docx */}
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1.5px solid #cbd5e1",
                      borderRadius: 10,
                      padding: "12px 16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          color: "var(--navy)",
                        }}
                      >
                        Class Category Checkboxes:
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        Date:{" "}
                        <strong style={{ color: "var(--navy)" }}>
                          {currentDateFormatted}
                        </strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {([
                        "Regular classes",
                        "Private classes",
                        "Group classes",
                        "Scholarship",
                      ] as const).map((cat) => {
                        const checked = data.classType === cat
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              set("classType", cat)
                              if (cat === "Private classes") {
                                set("studyMode", "Home Lessons")
                                set("planTier", "home-lessons")
                                set("duration", "Monthly")
                                set("amount", isUSD ? 90 : 70000)
                              } else if (data.studyMode === "Home Lessons") {
                                set("studyMode", "Onsite")
                                if (data.planTier === "home-lessons") {
                                  set("planTier", "")
                                  set("duration", "")
                                  set("amount", 0)
                                }
                              }
                            }}
                            className={`px-3 py-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                              checked
                                ? "border-[var(--navy)] bg-black/5 text-[var(--navy)] ring-2 ring-black/10 shadow-xs"
                                : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 shadow-xs"
                            }`}
                          >
                            <span
                              style={{
                                width: 17,
                                height: 17,
                                minWidth: 17,
                                borderRadius: 4,
                                border: checked
                                  ? "2px solid var(--navy)"
                                  : "2px solid #475569",
                                background: checked ? "var(--navy)" : "#ffffff",
                                color: "#ffffff",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10.5,
                                fontWeight: 900,
                                flexShrink: 0,
                              }}
                            >
                              {checked ? "✓" : ""}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: checked ? 700 : 600,
                                color: checked ? "var(--navy)" : "#141312",
                                lineHeight: 1.25,
                              }}
                            >
                              {cat}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Passport Photo Box from docx */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png"
                    onChange={handlePassportUpload}
                    style={{ display: "none" }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 104,
                      height: 126,
                      borderRadius: 4,
                      border: "1.5px dashed var(--gold, #c96b32)",
                      background: data.passportPhoto ? "#000000" : "#faf9f6",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    title="Click to affix / upload passport photograph"
                  >
                    {data.passportPhoto ? (
                      <img
                        src={data.passportPhoto}
                        alt="Student Passport"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", padding: 6 }}>
                        <Icon name="upload" size={18} className="mx-auto text-slate-400 mb-1" />
                        <strong
                          style={{
                            display: "block",
                            fontSize: 10,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            color: "var(--navy)",
                            marginTop: 3,
                          }}
                        >
                          Passport
                        </strong>
                        <span
                          style={{
                            fontSize: 8.5,
                            color: "var(--muted)",
                            lineHeight: 1.1,
                          }}
                        >
                          Affix Recent Photograph
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--gold)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      marginTop: 6,
                    }}
                  >
                    {data.passportPhoto
                      ? "Change Passport"
                      : "+ Affix Passport"}
                  </button>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION A (Personal Data) - Directly from docx
                ══════════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  background: "var(--navy)",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <strong
                  style={{
                    fontSize: 12,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                  }}
                >
                  SECTION A (Personal Data)
                </strong>
                <span style={{ fontSize: 11, color: "#cbd5e1" }}>
                  Date: {currentDateFormatted}
                </span>
              </div>

              <div className="form-grid">
                {/* NAME: First name and Surname */}
                <Field
                  id="ap-fn"
                  label="First Name"
                  placeholder="e.g. Samuel"
                  value={data.firstName || ""}
                  onChange={(v) => handleNameChange("first", v)}
                  required
                  error={errors.firstName}
                />
                <Field
                  id="ap-sn"
                  label="Surname"
                  placeholder="e.g. Danjuma"
                  value={data.surname || ""}
                  onChange={(v) => handleNameChange("surname", v)}
                  required
                  error={errors.surname}
                />

                {/* DOB & Nationality (Nationality comes BEFORE State of Origin) */}
                <Field
                  id="ap-dob"
                  label="DOB (Date of Birth)"
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(v) => set("dateOfBirth", v)}
                  required
                  error={errors.dateOfBirth}
                />
                <SelectField
                  id="ap-nat"
                  label="Nationality"
                  placeholder="Select nationality (e.g. Nigerian, Ghanaian, British)"
                  value={data.nationality}
                  onChange={handleNationalityChange}
                  required
                  error={errors.nationality}
                >
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </SelectField>

                {/* State of Origin: Dynamic based on Nationality */}
                {data.nationality === "Nigerian" ? (
                  <SelectField
                    id="ap-state-origin"
                    label="State of Origin (Nigeria)"
                    placeholder="Select Nigerian state of origin (e.g. Kaduna, Lagos)"
                    value={data.stateOfOrigin}
                    onChange={(v) => set("stateOfOrigin", v)}
                    required
                    error={errors.stateOfOrigin}
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </SelectField>
                ) : data.nationality ? (
                  <Field
                    id="ap-state-origin"
                    label="State / Province / Region of Origin"
                    placeholder="e.g. Greater London, California, Ontario, Greater Accra"
                    value={data.stateOfOrigin || ""}
                    onChange={(v) => set("stateOfOrigin", v)}
                    error={errors.stateOfOrigin}
                  />
                ) : (
                  <SelectField
                    id="ap-state-origin"
                    label="State of Origin"
                    placeholder="Select state of origin (e.g. Kaduna, Lagos, FCT)"
                    value={data.stateOfOrigin}
                    onChange={(v) => set("stateOfOrigin", v)}
                    required
                    error={errors.stateOfOrigin}
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </SelectField>
                )}

                {/* Marital Status */}
                <SelectField
                  id="ap-marital"
                  label="Marital Status"
                  placeholder="Select marital status (e.g. Single, Married)"
                  value={data.maritalStatus}
                  onChange={(v) => set("maritalStatus", v)}
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </SelectField>

                {/* Gender & Occupation */}
                <SelectField
                  id="ap-gender"
                  label="Gender"
                  placeholder="Select gender (Female / Male)"
                  value={data.gender}
                  onChange={(v) => set("gender", v)}
                  required
                  error={errors.gender}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </SelectField>
                <Field
                  id="ap-occ"
                  label="Occupation"
                  placeholder="e.g. Student, Civil Servant, Professional, Music Director"
                  value={data.occupation || ""}
                  onChange={(v) => set("occupation", v)}
                />

                {/* Residential Address */}
                <label className="field full" htmlFor="ap-address">
                  <span>
                    Residential Address{" "}
                    <span className="required-star" aria-hidden="true">
                      *
                    </span>
                  </span>
                  <input
                    id="ap-address"
                    placeholder="e.g. 14 Constitution Road, Kaduna"
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

                {/* Sponsor & Phone Number */}
                <Field
                  id="ap-sponsor"
                  label="Sponsor"
                  placeholder="e.g. Self-Sponsored or Mr. & Mrs. Danjuma"
                  value={data.sponsor || data.guardianName || ""}
                  onChange={(v) => {
                    set("sponsor", v)
                    set("guardianName", v)
                  }}
                />
                <Field
                  id="ap-sphone"
                  label="Sponsor Phone Number"
                  placeholder="e.g. 0803 123 4567 or +234 803 123 4567"
                  type="tel"
                  value={data.guardianPhone}
                  onChange={(v) => set("guardianPhone", v)}
                />

                {/* Candidate Contacts */}
                <Field
                  id="ap-phone"
                  label="Candidate Phone Number"
                  placeholder="e.g. 0803 123 4567 or +234 803 123 4567"
                  type="tel"
                  value={data.phone}
                  onChange={(v) => set("phone", v)}
                  required
                  error={errors.phone}
                />
                <Field
                  id="ap-email"
                  label="Candidate Email Address"
                  type="email"
                  placeholder="e.g. candidate@example.com"
                  value={data.email}
                  onChange={(v) => set("email", v)}
                  required
                  error={errors.email}
                />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION B (Interest) - 100% Correlation with Roster & docx
                ══════════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  background: "var(--navy)",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <strong
                  style={{
                    fontSize: 12,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                  }}
                >
                  SECTION B (Interest)
                </strong>
                <span style={{ fontSize: 11, color: "var(--gold)" }}>
                  Available Instruments &amp; Disciplines
                </span>
              </div>

              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--muted)",
                  margin: "0 0 12px",
                }}
              >
                Select your primary instrument or vocal discipline from the
                official school roster.
              </p>

              {/* Exact 17 Available Instruments + Intermediate Piano + Others Specify Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                {OFFICIAL_AVAILABLE_INSTRUMENTS.map((item) => {
                  const isSelected = data.program === item.name
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        set("program", item.name)
                        set("category", item.family)
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "border-[var(--navy)] bg-black/5 ring-2 ring-black/10 shadow-xs"
                          : "border-slate-300 bg-white hover:border-slate-400 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: isSelected
                              ? "2px solid var(--navy)"
                              : "2px solid #475569",
                            background: isSelected ? "var(--navy)" : "white",
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? "var(--navy)" : "#0f172a",
                            lineHeight: 1.25,
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          textTransform: "uppercase",
                          color: isSelected ? "var(--gold)" : "var(--muted)",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {item.family.split(" ")[0]}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Others Specify Input Field */}
              {data.program === "Others Specify" && (
                <div style={{ marginBottom: 14 }}>
                  <Field
                    id="ap-custom-specify"
                    label="Others Specify (Type your instrument or course)"
                    placeholder="e.g. Cello, Harp, Oboe, Accordion"
                    value={customInstrument}
                    onChange={(v) => setCustomInstrument(v)}
                    required
                    error={errors.customInstrument}
                  />
                </div>
              )}

              {/* Proficiency Level */}
              <div className="form-grid">
                <SelectField
                  id="ap-level"
                  label="Candidate Proficiency Level"
                  placeholder="Select proficiency level (Beginner / Intermediate / Advanced)"
                  value={data.level}
                  onChange={(v) => set("level", v)}
                  required
                  error={errors.level}
                >
                  <option value="Beginner">
                    Beginner (No prior musical experience)
                  </option>
                  <option value="Intermediate">
                    Intermediate (Basic chords, scales, reading)
                  </option>
                  <option value="Advanced">
                    Advanced (Concert repertoire &amp; theory)
                  </option>
                </SelectField>
              </div>

              {errors.program && (
                <div
                  className="login-error"
                  role="alert"
                  style={{ marginTop: 12 }}
                >
                  <Icon name="warning" size={14} />
                  {errors.program}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION C (Time) - Directly from docx with Weekday/Weekend Rules
                ══════════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  background: "var(--navy)",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <strong
                  style={{
                    fontSize: 12,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                  }}
                >
                  SECTION C (Time)
                </strong>
                <span style={{ fontSize: 11, color: "var(--gold)" }}>
                  Sessions &amp; Cohort Days
                </span>
              </div>

              {/* Section Time Checkboxes from docx */}
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--navy)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Session Time Slots (From Official Form):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {([
                    "Morning Section (10 AM - 1 PM)",
                    "Afternoon Section (1 PM - 4 PM)",
                    "Evening Section (4 PM - 7 PM)",
                  ] as const).map((slot) => {
                    const isSelected = selectedTimeSlot === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleScheduleUpdate(selectedDays, slot)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? "border-[var(--navy)] bg-black/5 ring-2 ring-black/10 shadow-xs"
                            : "border-slate-300 bg-white hover:border-slate-400 shadow-xs"
                        }`}
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: isSelected
                              ? "2px solid var(--navy)"
                              : "2px solid #475569",
                            background: isSelected ? "var(--navy)" : "white",
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                        <div>
                          <strong
                            style={{
                              display: "block",
                              fontSize: 13,
                              color: isSelected ? "var(--navy)" : "#0f172a",
                            }}
                          >
                            {slot.split(" (")[0]}
                          </strong>
                          <small
                            style={{
                              color: "#475569",
                              fontSize: 11.5,
                              fontWeight: 500,
                            }}
                          >
                            {slot.split(" (")[1]?.replace(")", "")}
                          </small>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Cohort Days: Weekdays (3 days/wk) vs Weekends (Friday & Saturday) */}
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--navy)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Cohort Days Schedule:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleScheduleUpdate("weekdays", selectedTimeSlot)
                    }
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                      selectedDays === "weekdays"
                        ? "border-[var(--navy)] bg-black/5 ring-2 ring-black/10 font-bold text-[var(--navy)] shadow-xs"
                        : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 shadow-xs"
                    }`}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: 13,
                          color:
                            selectedDays === "weekdays"
                              ? "var(--navy)"
                              : "#0f172a",
                        }}
                      >
                        Weekdays Schedule
                      </strong>
                      <span className="block text-xs text-slate-600 font-medium mt-0.5">
                        Strictly 3 days per week (Intensive practicals)
                      </span>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: 10 }}>
                      3 days / wk
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleScheduleUpdate("weekends", selectedTimeSlot)
                    }
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                      selectedDays === "weekends"
                        ? "border-[var(--navy)] bg-black/5 ring-2 ring-black/10 font-bold text-[var(--navy)] shadow-xs"
                        : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 shadow-xs"
                    }`}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: 13,
                          color:
                            selectedDays === "weekends"
                              ? "var(--navy)"
                              : "#0f172a",
                        }}
                      >
                        Weekends Schedule
                      </strong>
                      <span className="block text-xs text-slate-600 font-medium mt-0.5">
                        Strictly Friday &amp; Saturday masterclasses
                      </span>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: 10 }}>
                      Fri &amp; Sat
                    </span>
                  </button>
                </div>
              </div>

              {/* Study Mode: Onsite vs Online vs Home Lessons */}
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--navy)",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Study Mode:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(["Onsite", "Online", "Home Lessons"] as const).map((m) => {
                    const isSelected = data.studyMode === m
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          set("studyMode", m)
                          if (m === "Home Lessons") {
                            set("planTier", "home-lessons")
                            set("duration", "Monthly")
                            set("classType", "Private classes")
                            set("amount", isUSD ? 90 : 70000)
                          } else if (data.planTier === "home-lessons") {
                            set("planTier", "")
                            set("duration", "")
                            set("amount", 0)
                          }
                        }}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-[var(--navy)] bg-black/5 ring-2 ring-black/10 font-bold text-[var(--navy)] shadow-xs"
                            : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <strong
                            style={{
                              fontSize: 13,
                              color: isSelected ? "var(--navy)" : "#0f172a",
                            }}
                          >
                            {m}
                          </strong>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: isSelected
                                ? "2px solid var(--navy)"
                                : "2px solid #475569",
                              background: isSelected ? "var(--navy)" : "white",
                              color: "white",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 900,
                            }}
                          >
                            {isSelected ? "✓" : ""}
                          </span>
                        </div>
                        <small className="block text-xs text-slate-600 font-medium">
                          {m === "Onsite"
                            ? "Vivadoxa Studio Kaduna"
                            : m === "Online"
                              ? "Live interactive video"
                              : "1-on-1 at your residence"}
                        </small>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Online Student Billing Currency (Nigerian Students in ₦ vs Diaspora in $) */}
              {data.studyMode === "Online" && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "14px 16px",
                    background: "rgba(201,107,50,0.08)",
                    border: "1px solid var(--gold)",
                    borderRadius: 8,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <strong style={{ fontSize: 12, color: "var(--navy)" }}>
                      Online Student Tuition Currency:
                    </strong>
                    <span className="badge badge-gold" style={{ fontSize: 10 }}>
                      {isUSD ? "Diaspora ($ USD)" : "Nigerian Resident (₦ NGN)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCurrencyToggle("NGN")}
                      className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                        !isUSD
                          ? "border-[var(--gold)] bg-white ring-2 ring-[var(--gold)]/30 font-bold text-[var(--navy)]"
                          : "border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span>Nigerian Student (Naira ₦)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCurrencyToggle("USD")}
                      className={`p-2.5 rounded border text-left cursor-pointer transition-all ${
                        isUSD
                          ? "border-[var(--gold)] bg-white ring-2 ring-[var(--gold)]/30 font-bold text-[var(--navy)]"
                          : "border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span>Diaspora / International Student (USD $)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                SECTION D (Duration) - Directly from docx with Fixed Price Policy
                ══════════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  background: "var(--navy)",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <strong
                  style={{
                    fontSize: 12,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                  }}
                >
                  SECTION D (Duration)
                </strong>
                <span style={{ fontSize: 11, color: "var(--gold)" }}>
                  Fixed Tuition for Any Instrument Chosen
                </span>
              </div>

              {/* Notice that Price is Fixed for Any Instrument Chosen */}
              <div
                style={{
                  background: "#faf9f6",
                  border: "1.5px solid var(--line)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 16,
                  fontSize: 12,
                  color: "var(--navy)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="pin" size={13} className="text-[var(--gold)] shrink-0" />
                  <strong
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: 11,
                    }}
                  >
                    Uniform Fixed Tuition Guarantee:
                  </strong>
                </div>
                <p style={{ margin: 0, color: "#334155", lineHeight: 1.45 }}>
                  <strong>
                    For international students and Nigerian students, the price
                    is fixed for any instrument chosen.
                  </strong>{" "}
                  Whether you study Piano/keyboard, Saxophone, Violin, Voice
                  training, Studio engineering, or Talking drums, the tuition
                  rate below is fixed.
                </p>
              </div>

              {errors.planTier && (
                <div
                  className="login-error"
                  role="alert"
                  style={{ marginBottom: 12 }}
                >
                  <Icon name="warning" size={14} />
                  {errors.planTier}
                </div>
              )}

              {/* Duration Options from docx */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {OFFICIAL_DURATION_PLANS.map((plan) => {
                  const isSelected = data.planTier === plan.id
                  const isSpecial =
                    plan.id === "2-years" || plan.id === "home-lessons"
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSpecial ? "sm:col-span-1" : "sm:col-span-1"
                      } ${
                        isSelected
                          ? "border-[var(--navy)] bg-black/5 ring-2 ring-black/10 shadow-xs"
                          : "border-slate-300 bg-white hover:border-slate-400 shadow-xs"
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <strong
                            style={{
                              fontSize: 13.5,
                              color: isSelected ? "var(--navy)" : "#0f172a",
                            }}
                          >
                            {plan.name}
                          </strong>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              border: isSelected
                                ? "2px solid var(--navy)"
                                : "2px solid #475569",
                              background: isSelected ? "var(--navy)" : "white",
                              color: "white",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 900,
                              flexShrink: 0,
                            }}
                          >
                            {isSelected ? "✓" : ""}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: 11.5,
                            color: "#475569",
                            lineHeight: 1.45,
                          }}
                        >
                          {plan.desc}
                        </p>
                      </div>
                      <div className="w-full pt-2 border-t border-slate-200 flex items-center justify-between mt-auto">
                        <span
                          style={{
                            fontSize: 11.5,
                            color: "#334155",
                            fontWeight: 700,
                          }}
                        >
                          {plan.duration}
                        </span>
                        <strong style={{ fontSize: 14, color: "var(--gold)" }}>
                          {isUSD ? plan.feeUSDLabel : plan.feeNGNLabel}
                        </strong>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Total Fee Callout */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0b0b0b, #24201d)",
                  borderRadius: 8,
                  padding: "16px 20px",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      color: "var(--gold)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: 700,
                    }}
                  >
                    Tuition Assessment (Fixed for Any Instrument)
                  </span>
                  <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>
                    {data.program ? data.program : "Choose instrument"} ·{" "}
                    {data.duration ? data.duration : "Choose duration"}
                    {data.studyMode ? ` (${data.studyMode})` : ""}
                  </div>
                </div>
                <strong
                  style={{
                    fontSize: data.amount > 0 ? 24 : 15,
                    fontFamily: data.amount > 0 ? "serif" : "sans-serif",
                    color: data.amount > 0 ? "white" : "#cbd5e1",
                    fontWeight: data.amount > 0 ? 700 : 500,
                  }}
                >
                  {data.amount > 0 ? (
                    <>
                      {isUSD ? "$" : "₦"}
                      {data.amount.toLocaleString(isUSD ? "en-US" : "en-NG")}
                    </>
                  ) : (
                    "Select a plan above"
                  )}
                </strong>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                DECLARATION - Exact Wording from docx
                ══════════════════════════════════════════════════════════════════ */}
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  background: "var(--navy)",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <strong
                  style={{
                    fontSize: 12,
                    letterSpacing: "1.2px",
                    textTransform: "uppercase",
                  }}
                >
                  DECLARATION
                </strong>
                <span style={{ fontSize: 11, color: "var(--gold)" }}>
                  Official Candidate Affirmation
                </span>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid var(--navy)",
                  borderRadius: 8,
                  padding: "16px 20px",
                }}
              >
                {/* Exact Text from vivadoxa APPLICATION FORM.docx */}
                <blockquote
                  style={{
                    margin: "0 0 16px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#1e293b",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;I{" "}
                  <strong>
                    {data.fullName ||
                      `${data.firstName || ""} ${data.surname || ""}`.trim() ||
                      "the Applicant"}
                  </strong>{" "}
                  declare that to the best of my Knowledge the above information
                  is accurate and I also promise to abide by the rules governing
                  the school and promise to be of my best behavior.&rdquo;
                </blockquote>

                {/* Candidate Signature Line */}
                <div
                  style={{
                    borderTop: "1px dashed var(--line)",
                    paddingTop: 14,
                  }}
                >
                  <label
                    htmlFor="ap-signature"
                    style={{
                      display: "block",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "var(--navy)",
                      marginBottom: 5,
                    }}
                  >
                    Signature (Type Full Legal Name as Official Signature) *
                  </label>
                  <input
                    id="ap-signature"
                    type="text"
                    placeholder="e.g. Samuel Danjuma (Type full legal name)"
                    value={data.signature || ""}
                    onChange={(e) => set("signature", e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 42,
                      borderRadius: 6,
                      border: "1px solid var(--line, #cbd5e1)",
                      padding: "0 12px",
                      fontSize: 16,
                      fontFamily: "serif",
                      fontStyle: "italic",
                      background: "white",
                    }}
                    required
                  />
                  {errors.signature && (
                    <span
                      className="field-hint error"
                      role="alert"
                      style={{ marginTop: 4, display: "block" }}
                    >
                      {errors.signature}
                    </span>
                  )}
                  {data.signature && (
                    <div
                      style={{ marginTop: 6, fontSize: 12, color: "#157054" }}
                    >
                      Signed by:{" "}
                      <span
                        style={{
                          fontFamily: "serif",
                          fontStyle: "italic",
                          fontWeight: 700,
                        }}
                      >
                        {data.signature}
                      </span>{" "}
                      on {currentDateFormatted}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Portal Password */}
              <div
                style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  background: "#faf9f6",
                  border: "1px solid #e2ded8",
                  borderRadius: 6,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="lock" size={13} className="text-amber-800" />
                  <strong style={{ fontSize: 12, color: "var(--navy)" }}>
                    Student Portal Access (Optional)
                  </strong>
                </div>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 11.5,
                    color: "var(--muted)",
                  }}
                >
                  Create an optional password to view term lesson notes and
                  track practice assignments.
                </p>
                <div style={{ position: "relative" }}>
                  <input
                    id="portal-access-password"
                    name="vdx_portal_secret_key"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    placeholder="Create portal password (optional, min 6 characters)"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 36,
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      padding: "0 36px 0 10px",
                      fontSize: 13,
                      background: "white",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      padding: 4,
                      color: "var(--muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPassword ? "eyeoff" : "eye"} size={14} />
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="terms" style={{ marginTop: 16 }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked)
                    setTermsError("")
                  }}
                  required
                />
                <span style={{ fontSize: 12 }}>
                  I confirm that all particulars supplied above are true and
                  complete, and I agree to abide by the Vivadoxa Music School
                  admission and code of conduct regulations.
                </span>
              </label>

              {/* Prominent list of missing fields so user immediately sees what is required */}
              {Object.keys(errors).length > 0 && (
                <div
                  className="login-error"
                  role="alert"
                  style={{ marginTop: 12, marginBottom: 12, textAlign: "left" }}
                >
                  <Icon name="warning" size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <strong style={{ display: "block", marginBottom: 4 }}>
                      Please complete the following required fields to proceed:
                    </strong>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {Object.values(errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {termsError && (
                <div
                  className="login-error"
                  role="alert"
                  style={{ marginTop: 10, textAlign: "left" }}
                >
                  <Icon name="warning" size={14} className="shrink-0 mt-0.5" />
                  <span>{termsError}</span>
                </div>
              )}

              {submitError && (
                <div
                  className="login-error"
                  role="alert"
                  style={{ marginTop: 10, textAlign: "left" }}
                >
                  <Icon name="warning" size={14} className="shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>

            {/* Submission Button */}
            <div style={{ borderTop: "2px solid var(--navy)", paddingTop: 20 }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowSlipModal(true)}
                  style={{
                    minHeight: 50,
                    fontSize: 14,
                    fontWeight: 600,
                    borderColor: "var(--navy)",
                    color: "var(--navy)",
                  }}
                  className="w-full sm:w-auto"
                >
                  <Icon name="copy" size={15} /> Preview &amp; Print Form (PDF)
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    minHeight: 50,
                    fontSize: 15,
                    fontWeight: 700,
                    background: "var(--navy)",
                    color: "white",
                    justifyContent: "center",
                    letterSpacing: "0.5px",
                  }}
                >
                  {submitting ? (
                    "Submitting Official Admission Form…"
                  ) : (
                    <>
                      SUBMIT OFFICIAL APPLICATION &amp; PROCEED TO TUITION
                      {data.amount > 0 ? (
                        <>
                          {" "}
                          ({isUSD ? "$" : "₦"}
                          {data.amount.toLocaleString(isUSD ? "en-US" : "en-NG")})
                        </>
                      ) : null}{" "}
                      <Icon name="arrow" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Discrete Admissions Desk Assistance */}
          <div className="mt-8 pt-5 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>
                Admissions Desk: {SCHOOL_PHONE} · {SCHOOL_PHONE_2}
              </span>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[var(--navy)] hover:text-[var(--gold-text)] transition-colors"
            >
              <WhatsAppIcon size={14} className="text-emerald-600" />
              <span>Need help? Chat with Admissions on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Official Standardized Application Form Modal Preview & Download */}
      {showSlipModal && (
        <ApplicationSlipModal
          data={{
            ...data,
            first_name: data.firstName,
            last_name: data.surname,
            fullName:
              `${data.firstName || ""} ${data.surname || ""}`.trim() ||
              "Prospective Student",
            residentialAddress: data.address,
            guardianName: data.guardianName || data.sponsor,
            guardianPhone: data.guardianPhone || data.phone,
            passportPhoto: data.passportPhoto,
            application_no:
              sessionStorage.getItem("vdx_current_ref") ||
              `VDX-${new Date().getFullYear()}-0101`,
            created_at: new Date().toISOString(),
          }}
          onClose={() => setShowSlipModal(false)}
        />
      )}
    </main>
  )
}

export default Apply
