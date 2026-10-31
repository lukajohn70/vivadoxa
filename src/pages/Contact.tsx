import { Link } from "react-router-dom"
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
  WhatsAppIcon,
  GoogleIcon,
  TikTokIcon,
  FacebookIcon,
  YouTubeIcon,
  InstagramIcon,
} from "@/components/ui"
import { SEO } from "@/components/SEO"
import { ScrollReveal } from "@/components/ScrollReveal"
import {
  isValidEmail,
  WHATSAPP_URL,
  SCHOOL_PHONE,
  SCHOOL_PHONE_2,
  SCHOOL_WHATSAPP,
  SCHOOL_EMAIL,
  SCHOOL_ADDRESS,
  GOOGLE_REVIEWS_URL,
  GOOGLE_MAPS_EMBED_URL,
  GOOGLE_MAPS_DIRECTIONS_URL,
  YOUTUBE_URL,
  TIKTOK_URL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
} from "@/lib/utils"
import { submitEnquiry } from "@/lib/api"

interface ContactForm {
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
}

const emptyContact: ContactForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "Program enquiry",
  message: "",
}

const QUICK_QUESTIONS = [
  {
    label: "Tuition Fees & Term Dates",
    text: "Hello Vivadoxa, I would like to know the current tuition fees and upcoming term dates.",
  },
  {
    label: "Kids Weekend Program",
    text: "Hello Vivadoxa, I want to inquire about the kids music program (ages 4-12).",
  },
  {
    label: "Instrument Repair & Tuning",
    text: "Hello Vivadoxa, I need to bring my instrument in for repair and inspection.",
  },
  {
    label: "Private Home Coaching",
    text: "Hello Vivadoxa, I would like to inquire about private home music lessons in Kaduna.",
  },
  {
    label: "Instrument Purchase (Store)",
    text: "Hello Vivadoxa Store, I would like to inquire about purchasing a musical instrument or audio equipment.",
  },
  {
    label: "Instrument Rental",
    text: "Hello Vivadoxa, I would like to inquire about renting an instrument or sound equipment for practice or an event.",
  },
  {
    label: "Studio Booking",
    text: "Hello Vivadoxa Studio, I would like to book a recording or rehearsal session.",
  },
]

export function Contact() {
  const [form, setForm] = useState<ContactForm>(emptyContact)
  const [errors, setErrors] =
    useState<Partial<Record<keyof ContactForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")
  const [sent, setSent] = useState(false)

  function set<K extends keyof ContactForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
    setServerError("")
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.fullName.trim()) e.fullName = "Full name is required."
    if (!form.email.trim()) e.email = "Email is required."
    else if (!isValidEmail(form.email)) e.email = "Enter a valid email address."
    if (!form.subject) e.subject = "Please select a subject."
    if (!form.message.trim()) e.message = "Message cannot be empty."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError("")

    try {
      const res = await submitEnquiry({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      })

      if (res && res.success) {
        setSent(true)
      } else {
        setServerError(
          res.error || "Failed to submit message. Please try again.",
        )
      }
    } catch {
      setServerError("Network connection error. Please verify your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <SEO
        title="Contact Vivadoxa — Music School, Instrument Repair & Recording Studio | Kaduna"
        description="Get in touch with Vivadoxa Music School, Instrument Repair Clinic & Recording Studio in Kaduna. Inquire about classes, diagnostic drop-offs, and rehearsal bookings."
        keywords="contact music school kaduna, instrument repair kaduna phone, recording studio kaduna address, vivadoxa phone number"
        canonicalUrl="/contact"
      />

      <PageHero
        eyebrow="Admissions & Studio Desk"
        title="Let's talk about your music."
        body="Questions about a course, instrument repair, studio booking, or instrument rental and purchase? Our admissions desk in Kaduna is active and ready to assist you."
        actions={
          <>
            <a
              href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello Vivadoxa, I would like to reach the admissions desk.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <WhatsAppIcon size={16} /> WhatsApp Us Now
            </a>
            <a
              href="#contact-form"
              className="btn-concierge"
            >
              <Icon name="mail" size={15} /> Send a Message
            </a>
            <a
              href={`tel:${SCHOOL_PHONE}`}
              className="btn-concierge"
            >
              <Icon name="phone" size={15} /> Call the Desk
            </a>
          </>
        }
      />

      {/* ── Feature Desks Strip (New Features Direct Routing) ────────── */}
      <section className="bg-white border-b border-[var(--line)] py-10">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="eyebrow">Direct Department Desks</span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[var(--navy)] mt-1">
                  Specialized Service Routing
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1 max-w-xl">
                  Have a specific requirement? Connect directly with the right department lead or browse our online showcases.
                </p>
              </div>
              <span className="text-xs text-[var(--gold)] font-bold uppercase tracking-wider">
                ● All desks active in Kaduna
              </span>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Store */}
            <ScrollReveal direction="up" delay={0} className="h-full">
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[var(--line)] hover:border-[var(--gold)] transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center mb-3">
                    <Icon name="tag" size={20} />
                  </div>
                  <strong className="text-sm text-[var(--navy)] block mb-1">
                    Instrument Store
                  </strong>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Keyboards, guitars, violins, drum kits &amp; PA audio gear with master clinic setup guarantee.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--line)]">
                  <Link
                    to="/store"
                    className="text-xs font-bold text-[var(--navy)] hover:text-[var(--gold)] transition-colors inline-flex items-center gap-1"
                  >
                    View Showcase <Icon name="arrow" size={12} />
                  </Link>
                  <span className="text-slate-300">·</span>
                  <a
                    href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello Vivadoxa Store, I would like to inquire about purchasing an instrument.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                  >
                    <WhatsAppIcon size={12} /> Sales
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* 2. Rentals */}
            <ScrollReveal direction="up" delay={60} className="h-full">
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[var(--line)] hover:border-[var(--gold)] transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Icon name="music" size={20} />
                  </div>
                  <strong className="text-sm text-[var(--navy)] block mb-1">
                    Gear &amp; Sound Rentals
                  </strong>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Student practice rentals &amp; concert stage sound gear. Multi-item reservation wiring.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--line)]">
                  <Link
                    to="/rentals"
                    className="text-xs font-bold text-[var(--navy)] hover:text-[var(--gold)] transition-colors inline-flex items-center gap-1"
                  >
                    Rentals Fleet <Icon name="arrow" size={12} />
                  </Link>
                  <span className="text-slate-300">·</span>
                  <a
                    href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello Vivadoxa Admin, I would like to inquire about renting an instrument or audio equipment.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                  >
                    <WhatsAppIcon size={12} /> Hire Desk
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* 3. Studio */}
            <ScrollReveal direction="up" delay={120} className="h-full">
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[var(--line)] hover:border-[var(--gold)] transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                    <Icon name="mic" size={20} />
                  </div>
                  <strong className="text-sm text-[var(--navy)] block mb-1">
                    Recording Studio
                  </strong>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Acoustically-treated vocal booth, mixing &amp; mastering suites, and band rehearsal room.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--line)]">
                  <Link
                    to="/studio"
                    className="text-xs font-bold text-[var(--navy)] hover:text-[var(--gold)] transition-colors inline-flex items-center gap-1"
                  >
                    Explore Studio <Icon name="arrow" size={12} />
                  </Link>
                  <span className="text-slate-300">·</span>
                  <a
                    href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello Vivadoxa Studio, I want to book a session.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                  >
                    <WhatsAppIcon size={12} /> Booking
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* 4. Repairs Clinic */}
            <ScrollReveal direction="up" delay={180} className="h-full">
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[var(--line)] hover:border-[var(--gold)] transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <Icon name="wrench" size={20} />
                  </div>
                  <strong className="text-sm text-[var(--navy)] block mb-1">
                    Repair Clinic
                  </strong>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                    Diagnostics, fret leveling, action setup, violin peg service &amp; electronic soldering.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--line)]">
                  <Link
                    to="/repairs"
                    className="text-xs font-bold text-[var(--navy)] hover:text-[var(--gold)] transition-colors inline-flex items-center gap-1"
                  >
                    Clinic Details <Icon name="arrow" size={12} />
                  </Link>
                  <span className="text-slate-300">·</span>
                  <a
                    href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello Vivadoxa Clinic, I need to bring my instrument in for repair.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                  >
                    <WhatsAppIcon size={12} /> Clinic
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <ScrollReveal direction="left">
            <div>
              <SectionHead
                eyebrow="Direct Channels"
                title="We'd love to hear from you"
              />

              {/* Instant WhatsApp Priority Card */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(37,211,102,0.12) 0%, rgba(18,140,126,0.06) 100%)",
                  border: "1.5px solid rgba(37,211,102,0.4)",
                  borderRadius: "var(--radius)",
                  padding: "20px 22px",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <WhatsAppIcon size={28} />
                    <div>
                      <strong
                        style={{
                          fontSize: 16,
                          color: "var(--navy)",
                          display: "block",
                        }}
                      >
                        Official WhatsApp Admissions
                      </strong>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#128C7E",
                          fontWeight: 700,
                        }}
                      >
                        ● Online · Fast reply under 15 mins
                      </span>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    margin: "0 0 14px",
                    lineHeight: 1.5,
                  }}
                >
                  Tap a pre-filled prompt below to start an instant WhatsApp
                  conversation with our Kaduna admissions coordinator:
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {QUICK_QUESTIONS.map((q) => (
                    <a
                      key={q.label}
                      href={`${WHATSAPP_URL}?text=${encodeURIComponent(q.text)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "white",
                        border: "1px solid rgba(37,211,102,0.35)",
                        color: "#0a192f",
                        padding: "6px 12px",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s ease",
                      }}
                      className="hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
                    >
                      <WhatsAppIcon size={13} /> {q.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="contact-list">
                <div>
                  <Icon name="pin" />
                  <p>
                    <strong>Our studio</strong>
                    <span>{SCHOOL_ADDRESS}</span>
                  </p>
                </div>
                <div>
                  <Icon name="phone" />
                  <p>
                    <strong>Call our direct lines</strong>
                    <a href={`tel:${SCHOOL_PHONE}`}>{SCHOOL_PHONE}</a>
                    <span className="mx-1">·</span>
                    <a href={`tel:${SCHOOL_PHONE_2}`}>{SCHOOL_PHONE_2}</a>
                  </p>
                </div>
                <div>
                  <WhatsAppIcon size={18} className="text-[#25D366] mt-1" />
                  <p>
                    <strong>WhatsApp desk</strong>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {SCHOOL_WHATSAPP} (Instant Chat)
                    </a>
                  </p>
                </div>
                <div>
                  <Icon name="mail" />
                  <p>
                    <strong>Email us</strong>
                    <a href={`mailto:${SCHOOL_EMAIL}`}>{SCHOOL_EMAIL}</a>
                  </p>
                </div>
              </div>

              {/* Social Media & Google Reviews Card */}
              <div
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  padding: "20px 22px",
                }}
              >
                <strong
                  style={{
                    fontSize: 13,
                    color: "var(--navy)",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Connect on Official Channels
                </strong>
                <div className="flex flex-wrap gap-2 mb-4">
                  <a
                    href={TIKTOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors inline-flex items-center gap-2 group"
                    title="TikTok: @vivadoxa"
                  >
                    <TikTokIcon
                      size={14}
                      className="group-hover:scale-110 transition-transform flex-shrink-0"
                    />
                    <span>@vivadoxa</span>
                  </a>
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors inline-flex items-center gap-2 group"
                    title="Facebook: @vivadoxa music"
                  >
                    <FacebookIcon
                      size={14}
                      className="text-[#1877F2] group-hover:scale-110 transition-transform flex-shrink-0"
                    />
                    <span>@vivadoxa music</span>
                  </a>
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex items-center gap-2 group"
                    title="YouTube: Vivadoxa Music"
                  >
                    <YouTubeIcon
                      size={14}
                      className="text-[#FF0000] group-hover:scale-110 transition-transform flex-shrink-0"
                    />
                    <span>Vivadoxa Music</span>
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-50 hover:bg-pink-100 text-pink-700 transition-colors inline-flex items-center gap-2 group"
                    title="Instagram: @vivadoxa music"
                  >
                    <InstagramIcon
                      size={14}
                      className="text-[#E4405F] group-hover:scale-110 transition-transform flex-shrink-0"
                    />
                    <span>@vivadoxa music</span>
                  </a>
                </div>

                {/* Google Reviews rating callout */}
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#FAF8F5",
                    border: "1px solid #e6e2d8",
                    borderRadius: 8,
                    padding: "12px 16px",
                    textDecoration: "none",
                  }}
                  className="hover:border-blue-400 transition-colors group"
                  title="Read verified Google reviews for Vivadoxa Music Kaduna"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <GoogleIcon size={24} />
                    <div>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <span style={{ color: "#FBBC05", fontSize: 13 }}>
                          ★ ★ ★ ★ ★
                        </span>
                        <strong style={{ fontSize: 13, color: "var(--navy)" }}>
                          4.9 on Google
                        </strong>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        130+ verified reviews from students &amp; parents in
                        Kaduna
                      </span>
                    </div>
                  </div>
                  <span
                    style={{ fontSize: 11, color: "#1a73e8", fontWeight: 700 }}
                    className="group-hover:translate-x-1 transition-transform flex items-center gap-1"
                  >
                    Read Reviews <Icon name="external" size={11} />
                  </span>
                </a>
              </div>

              <div className="hours">
                <strong>Opening hours</strong>
                <span>Mon–Fri: 9:00 AM – 7:00 PM</span>
                <span>Saturday: 9:00 AM – 5:00 PM</span>
              </div>

              <div
                style={{
                  marginTop: 20,
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                  background: "white",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    background: "var(--navy)",
                    color: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <strong
                      style={{ fontSize: 13, display: "block", color: "white" }}
                    >
                      Vivadoxa Music School
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--gold2)" }}>
                      Angwan Sunday, Kaduna · Beside Angwan Sunday Market
                    </span>
                  </div>
                  <a
                    href={GOOGLE_MAPS_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-white/90 hover:text-white inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 transition-all flex-shrink-0"
                    style={{ textDecoration: "none" }}
                    title="Open directions in Google Maps"
                  >
                    <span>Directions</span>
                    <Icon name="external" size={11} />
                  </a>
                </div>
                <iframe
                  src={GOOGLE_MAPS_EMBED_URL}
                  width="100%"
                  height="320"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Vivadoxa Music School Location Map"
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="contact-form" id="contact-form">
              {sent ? (
                <Success
                  title="Message sent successfully"
                  body="Thank you for reaching out. Your enquiry has been routed to the Vivadoxa admissions desk. We will respond within one business day."
                  onReset={() => {
                    setSent(false)
                    setForm(emptyContact)
                  }}
                  action="Send another message"
                />
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h2>Send us a message</h2>
                  <div className="form-grid">
                    <Field
                      id="contact-name"
                      label="Full name"
                      value={form.fullName}
                      onChange={(v) => set("fullName", v)}
                      required
                      error={errors.fullName}
                    />
                    <Field
                      id="contact-email"
                      label="Email address"
                      type="email"
                      value={form.email}
                      onChange={(v) => set("email", v)}
                      required
                      error={errors.email}
                    />
                    <Field
                      id="contact-phone"
                      label="Phone number"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => set("phone", v)}
                    />
                    <SelectField
                      id="contact-subject"
                      label="Subject"
                      value={form.subject}
                      onChange={(v) => set("subject", v)}
                      required
                    >
                      <option value="Program enquiry">Program enquiry</option>
                      <option value="Admissions">Admissions</option>
                      <option value="Instrument Purchase">Instrument Purchase (Store)</option>
                      <option value="Instrument Rental">Instrument Rental</option>
                      <option value="Studio Booking">Studio Booking</option>
                      <option value="Repairs">Repairs &amp; Clinic</option>
                      <option value="Other">Other</option>
                    </SelectField>
                    <Textarea
                      id="contact-message"
                      label="Message"
                      placeholder="How can we help?"
                      value={form.message}
                      onChange={(v) => set("message", v)}
                      required
                      error={errors.message}
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

                  <p className="text-[11px] text-[var(--muted)] leading-relaxed mt-4 mb-3">
                    By submitting this form, you confirm that you have read and
                    agree to our{" "}
                    <a
                      href="/privacy"
                      className="underline text-[var(--gold)] font-medium hover:text-[var(--gold2)]"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="/cookies"
                      className="underline text-[var(--gold)] font-medium hover:text-[var(--gold2)]"
                    >
                      Cookie Policy
                    </a>
                    . Your information is processed securely under the Nigeria
                    Data Protection Act (NDPA 2023) and is never shared with
                    third-party advertisers.
                  </p>

                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      "Sending message…"
                    ) : (
                      <>
                        Send message <Icon name="arrow" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}

export default Contact
