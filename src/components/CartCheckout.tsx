import { useState } from "react"
import { Button, Field, Icon, SelectField, Textarea, WhatsAppIcon } from "@/components/ui"
import { submitOrder } from "@/lib/api"

export interface CartItem {
  id: string
  name: string
  category: string
  image?: string
  brand?: string
  type?: string
}

interface CartCheckoutProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onRemoveItem: (id: string) => void
  mode: "store" | "rentals"
  onConfirmed: (orderRef: string) => void
}

// Step indicator
function StepIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Review" },
    { n: 2, label: "Details" },
    { n: 3, label: "Confirmed" },
  ]
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all ${
                step === s.n
                  ? "bg-[var(--gold)] border-[var(--gold)] text-white shadow"
                  : step > s.n
                  ? "bg-[var(--navy)] border-[var(--navy)] text-white"
                  : "bg-white border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {step > s.n ? <Icon name="check" size={13} /> : s.n}
            </div>
            <span
              className={`text-[10px] font-semibold whitespace-nowrap ${
                step === s.n
                  ? "text-[var(--gold)]"
                  : step > s.n
                  ? "text-[var(--navy)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-1 mb-4 transition-all ${
                step > s.n ? "bg-[var(--navy)]" : "bg-[var(--line)]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CartCheckout({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  mode,
  onConfirmed,
}: CartCheckoutProps) {
  const [step, setStep] = useState(1)
  const [intakeMethod, setIntakeMethod] = useState<"pickup" | "delivery">("pickup")
  const [formName, setFormName] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formAddress, setFormAddress] = useState("")
  const [formDuration, setFormDuration] = useState("1 Month")
  const [formNotes, setFormNotes] = useState("")
  const [nameError, setNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [addressError, setAddressError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [orderRef, setOrderRef] = useState("")
  const [submitError, setSubmitError] = useState("")

  if (!isOpen) return null

  const modeLabel = mode === "store" ? "Purchase" : "Rental Reservation"

  const handleNext = () => {
    if (step === 1) {
      if (items.length === 0) return
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError("")
    setPhoneError("")
    setAddressError("")
    setSubmitError("")
    let valid = true

    if (!formName.trim()) {
      setNameError("Please enter your full name.")
      valid = false
    }
    if (!formPhone.trim()) {
      setPhoneError("Please enter your WhatsApp / phone number.")
      valid = false
    }
    if (intakeMethod === "delivery" && !formAddress.trim()) {
      setAddressError("Please enter your Kaduna delivery address and nearest landmark.")
      valid = false
    }
    if (!valid) return

    setSubmitting(true)

    const payload: Record<string, any> = {
      action: "submit",
      type: mode,
      customer_name: formName.trim(),
      customer_phone: formPhone.trim(),
      customer_email: formEmail.trim(),
      items: items.map((it) => ({
        id: it.id,
        name: it.name,
        category: it.category,
        brand: it.brand || "",
        type: it.type || "",
      })),
      intake_method: intakeMethod,
      delivery_address: intakeMethod === "delivery" ? formAddress.trim() : "",
      notes: formNotes.trim(),
    }

    if (mode === "rentals") {
      payload.duration = formDuration
    }

    const res = await submitOrder(payload)
    setSubmitting(false)

    if (res.success && res.order_ref) {
      setOrderRef(res.order_ref)
      setStep(3)
      onConfirmed(res.order_ref)
    } else {
      setSubmitError(res.error || "Order submission failed. Please try WhatsApp directly.")
    }
  }

  const handleClose = () => {
    setStep(1)
    setFormName("")
    setFormPhone("")
    setFormEmail("")
    setFormAddress("")
    setFormDuration("1 Month")
    setFormNotes("")
    setNameError("")
    setPhoneError("")
    setAddressError("")
    setSubmitError("")
    setOrderRef("")
    onClose()
  }

  const buildWhatsAppMsg = () => {
    const itemsList = items
      .map((it, idx) => `${idx + 1}. ${it.name} (${it.brand || it.category})`)
      .join("%0A")
    const intakeDesc =
      intakeMethod === "pickup"
        ? "Studio Pickup in Kaduna"
        : `Courier Delivery to: ${formAddress || "Kaduna"}`
    return `Hello Vivadoxa Admin, Order Reference: ${orderRef}%0A%0AI have confirmed a ${encodeURIComponent(modeLabel)} on the website.%0A%0AItems:%0A${itemsList}%0A%0A• Intake: ${encodeURIComponent(intakeDesc)}%0A• Name: ${encodeURIComponent(formName)}%0A• WhatsApp/Phone: ${encodeURIComponent(formPhone)}${formEmail ? `%0A• Email: ${encodeURIComponent(formEmail)}` : ""}${mode === "rentals" ? `%0A• Duration: ${encodeURIComponent(formDuration)}` : ""}${formNotes ? `%0A• Notes: ${encodeURIComponent(formNotes)}` : ""}%0A%0APlease proceed with my order confirmation!`
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[var(--line)] relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[var(--line)]">
          <div>
            <span className="eyebrow block mb-0.5">Vivadoxa {mode === "store" ? "Store" : "Rentals"}</span>
            <h3 className="font-bold text-base sm:text-lg text-[var(--navy)] font-serif">
              {step === 1 && "Review Your Order"}
              {step === 2 && "Your Details"}
              {step === 3 && "Order Confirmed!"}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="px-6 pt-5 pb-6">
          <StepIndicator step={step} />

          {/* ── Step 1: Review Order ──────────────────────────────────────── */}
          {step === 1 && (
            <div>
              {items.length === 0 ? (
                <div className="text-center py-10 text-[var(--muted)] text-sm">
                  <Icon name="cart" size={36} className="mx-auto mb-3 text-[var(--line)]" />
                  <p>No items selected yet.</p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 text-xs text-[var(--gold)] font-bold underline cursor-pointer"
                  >
                    Browse catalog
                  </button>
                </div>
              ) : (
                <>
                  {/* Item list */}
                  <div className="space-y-2 mb-5 max-h-52 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[var(--line)]"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        {item.image && (
                          <div
                            className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0"
                            style={{ width: "48px", height: "48px", minWidth: "48px", maxWidth: "48px" }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--navy)] truncate">{item.name}</p>
                          <p className="text-[10px] text-[var(--muted)] truncate">
                            {item.category}
                            {item.brand ? ` · ${item.brand}` : ""}
                            {item.type ? ` · ${item.type === "event" ? "Event Backline" : "Student Practice"}` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-600 text-xs p-1.5 rounded-lg hover:bg-red-50 cursor-pointer shrink-0 transition-colors"
                          title="Remove item"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Intake toggle */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-[var(--navy)] mb-2">
                      Collection Preference
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIntakeMethod("pickup")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          intakeMethod === "pickup"
                            ? "border-[var(--gold)] bg-amber-50 text-[var(--gold)]"
                            : "border-[var(--line)] bg-white text-[var(--muted)]"
                        }`}
                      >
                        🏬 Studio Pickup
                      </button>
                      <button
                        type="button"
                        onClick={() => setIntakeMethod("delivery")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          intakeMethod === "delivery"
                            ? "border-[var(--gold)] bg-amber-50 text-[var(--gold)]"
                            : "border-[var(--line)] bg-white text-[var(--muted)]"
                        }`}
                      >
                        🚚 Delivery (Kaduna)
                      </button>
                    </div>
                  </div>

                  {/* Pricing note */}
                  <div className="bg-amber-50 border border-[var(--gold)]/30 rounded-xl p-3 text-xs text-[var(--navy)] mb-5">
                    <strong>Prices on request.</strong> Our admin will confirm availability, pricing, and payment options after you submit your details.
                  </div>

                  <Button onClick={handleNext} full>
                    Continue to Your Details →
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── Step 2: Customer Details ──────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Field
                label="Full Name"
                value={formName}
                onChange={(e: any) => setFormName(typeof e === "string" ? e : e?.target?.value ?? "")}
                placeholder="e.g. Samuel Adekunle"
                required
                error={nameError}
              />
              <Field
                label="WhatsApp / Phone Number"
                value={formPhone}
                onChange={(e: any) => setFormPhone(typeof e === "string" ? e : e?.target?.value ?? "")}
                placeholder="e.g. 0803 130 8881"
                required
                error={phoneError}
              />
              <Field
                label="Email Address (Optional)"
                type="email"
                value={formEmail}
                onChange={(e: any) => setFormEmail(typeof e === "string" ? e : e?.target?.value ?? "")}
                placeholder="e.g. samuel@example.com"
              />

              {intakeMethod === "delivery" && (
                <Field
                  label="Kaduna Delivery Address & Landmark *"
                  value={formAddress}
                  onChange={(e: any) => setFormAddress(typeof e === "string" ? e : e?.target?.value ?? "")}
                  placeholder="e.g. Barnawa Complex, near Market, Kaduna"
                  required
                  error={addressError}
                />
              )}

              {mode === "rentals" && (
                <SelectField
                  label="Rental Duration"
                  value={formDuration}
                  onChange={(e: any) => setFormDuration(typeof e === "string" ? e : e?.target?.value ?? "")}
                  options={[
                    { value: "1 Month", label: "1 Month (Student Practice)" },
                    { value: "3 Months", label: "3 Months (Academic Term)" },
                    { value: "6 Months", label: "6 Months (Semester)" },
                    { value: "12 Months", label: "12 Months (Full Year)" },
                    { value: "1 Day", label: "1 Day (Event / Concert)" },
                    { value: "Weekend (2-3 Days)", label: "Weekend Event (2–3 Days)" },
                  ]}
                />
              )}

              <Textarea
                label="Notes / Special Requirements (Optional)"
                value={formNotes}
                onChange={(e: any) => setFormNotes(typeof e === "string" ? e : e?.target?.value ?? "")}
                placeholder={
                  mode === "store"
                    ? "Ask about payment options, delivery, or specific configurations."
                    : "Specify size, dates, sound engineer request, or any preferences."
                }
                rows={2}
              />

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="ghost" onClick={handleBack} className="!py-2.5 !text-xs">
                  ← Back
                </Button>
                <Button
                  type="submit"
                  full
                  disabled={submitting}
                  className="!py-2.5 !text-xs"
                >
                  {submitting ? "Submitting…" : `Confirm ${modeLabel} →`}
                </Button>
              </div>
            </form>
          )}

          {/* ── Step 3: Confirmed ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="text-center py-4">
              {/* Gold check circle */}
              <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon name="check" size={32} className="text-white" />
              </div>

              <h4 className="text-xl font-bold font-serif text-[var(--navy)] mb-1">
                {mode === "store" ? "Order Received!" : "Reservation Received!"}
              </h4>
              <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">
                {mode === "store"
                  ? "Our sales team will contact you within 24 hours to confirm availability, pricing, and payment options."
                  : "Our rental desk will contact you within 24 hours to confirm availability, security deposit, and handover details."}
              </p>

              {/* Order reference */}
              <div className="bg-[#FAF8F5] border border-[var(--line)] rounded-xl p-4 mb-5">
                <p className="text-[10px] text-[var(--muted)] font-semibold mb-1 uppercase tracking-widest">
                  Your Reference
                </p>
                <p className="text-2xl font-extrabold font-mono text-[var(--navy)] tracking-wider">
                  {orderRef}
                </p>
                <p className="text-[10px] text-[var(--muted)] mt-1">
                  Quote this when contacting us
                </p>
              </div>

              {/* WhatsApp follow-up */}
              <a
                href={`https://wa.me/2348031308881?text=${buildWhatsAppMsg()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full justify-center inline-flex items-center gap-2 !py-2.5 !text-xs mb-3"
              >
                <WhatsAppIcon size={15} />
                <span>Follow up via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="text-xs text-[var(--muted)] hover:text-[var(--navy)] underline cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
