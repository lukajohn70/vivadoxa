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
} from "@/components/ui"
import { isValidEmail, WHATSAPP_URL } from "@/lib/utils"
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
  { label: "Tuition Fees & Term Dates", text: "Hello Vivadoxa, I would like to know the current tuition fees and upcoming term dates." },
  { label: "Kids Weekend Program", text: "Hello Vivadoxa, I want to inquire about the kids music program (ages 4-12)." },
  { label: "Instrument Repair & Tuning", text: "Hello Vivadoxa, I need to bring my instrument in for repair and inspection." },
  { label: "VIP Masterclass Mentorship", text: "Hello Director Tosin, I would like to inquire about 1-on-1 VIP studio mentorship." },
]

export function Contact() {
  const [form, setForm] = useState<ContactForm>(emptyContact)
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactForm, string>>
  >({})
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
    else if (!isValidEmail(form.email))
      e.email = "Enter a valid email address."
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
      setServerError(
        "Network connection error. Please verify your connection.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <PageHero
        eyebrow="Admissions & Studio Desk"
        title="Let's talk about your music."
        body="Questions about a course, instrument repair, or studio visit? Our admissions counselors in Kaduna are active and ready to assist you."
      />
      <section className="section">
        <div className="container contact-grid">
          <div>
            <SectionHead
              eyebrow="Direct Channels"
              title="We'd love to hear from you"
            />
            
            {/* Instant WhatsApp Priority Card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(37,211,102,0.12) 0%, rgba(18,140,126,0.06) 100%)",
                border: "1.5px solid rgba(37,211,102,0.4)",
                borderRadius: "var(--radius)",
                padding: "20px 22px",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <WhatsAppIcon size={28} />
                  <div>
                    <strong style={{ fontSize: 16, color: "var(--navy)", display: "block" }}>
                      Official WhatsApp Admissions
                    </strong>
                    <span style={{ fontSize: 11, color: "#128C7E", fontWeight: 700 }}>
                      ● Online · Fast reply under 15 mins
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
                Tap a pre-filled prompt below to start an instant WhatsApp conversation with our Kaduna admissions coordinator:
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
                  <span>U/Sunday, Television, Kaduna, Nigeria</span>
                </p>
              </div>
              <div>
                <Icon name="phone" />
                <p>
                  <strong>Call us</strong>
                  <a href="tel:+2348031308881">+234 803 130 8881</a>
                </p>
              </div>
              <div>
                <Icon name="mail" />
                <p>
                  <strong>Email us</strong>
                  <a href="mailto:hello@vivadoxa.ng">hello@vivadoxa.ng</a>
                </p>
              </div>
            </div>

            <div className="hours">
              <strong>Opening hours</strong>
              <span>Mon–Fri: 9:00 AM – 7:00 PM</span>
              <span>Saturday: 9:00 AM – 5:00 PM</span>
            </div>

            <div
              className="map"
              aria-label="Map placeholder — Vivadoxa location"
            >
              KADUNA SOUTH
              <span>Vivadoxa Music School · U/Sunday, Television</span>
            </div>
          </div>

          <div className="contact-form">
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
                    <option value="Repairs">Repairs</option>
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
        </div>
      </section>
    </main>
  )
}

export default Contact
