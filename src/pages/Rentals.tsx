import { useState, useEffect } from "react"
import {
  Badge,
  Button,
  Field,
  Icon,
  PageHero,
  SectionHead,
  SelectField,
  Textarea,
  WhatsAppIcon,
} from "@/components/ui"
import { SEO } from "@/components/SEO"
import {
  WHATSAPP_URL,
  SCHOOL_PHONE,
  SCHOOL_PHONE_2,
  SCHOOL_ADDRESS,
  SCHOOL_EMAIL,
} from "@/lib/utils"
import {
  violinImg,
  pianoImg,
  guitarAcousticImg,
  saxophoneImg,
  fluteImg,
  trumpetImg,
  drumsImg,
  bassGuitarImg,
  studioImg,
} from "@/lib/data"
import { fetchCatalogRentalsData, submitEnquiry } from "@/lib/api"
import { ScrollReveal } from "@/components/ScrollReveal"
import { LazyImage } from "@/components/LazyImage"
import CartCheckout from "@/components/CartCheckout"
import type { Page } from "@/types"

export interface RentalItem {
  id: string
  name: string
  category: "Strings" | "Keys" | "Guitars" | "Woodwinds" | "Brass" | "PA & Sound" | "Backline" | "Microphones" | string
  type: string
  image: string
  inclusions?: string[]
  features?: string[]
  recommendedFor?: string
  idealFor?: string
  inStock?: boolean
  isActive?: boolean
  is_active?: boolean
}

export interface RentalFleetType {
  id: string
  name: string
  description?: string
  badge?: string
  isActive?: boolean
  order?: number
}

export const DEFAULT_FLEET_TYPES: RentalFleetType[] = [
  {
    id: "student",
    name: "Student Home Practice",
    description: "Vetted practice instruments for students, scholars and home learners with clinic maintenance included.",
    badge: "Student Practice Fleet",
    isActive: true,
    order: 1,
  },
  {
    id: "event",
    name: "Stage, PA & Event Backline",
    description: "Professional concert sound systems, stage backline amps, drum kits, and live event gear in Kaduna.",
    badge: "Concert & Event Gear",
    isActive: true,
    order: 2,
  },
]

const DEFAULT_RENTALS: RentalItem[] = [
  {
    id: "violin",
    name: "Student Conservatory Violin Outfit (1/2, 3/4, 4/4)",
    category: "Strings",
    type: "student",
    image: violinImg,
    recommendedFor: "Beginner & Intermediate strings scholars",
    inclusions: [
      "Fitted wooden bow & organic rosin",
      "Padded lightweight hard foam case with backpack straps",
      "Shoulder rest & fine-tuners on all 4 strings",
      "Pre-delivery bridge inspection & peg lubrication",
    ],
  },
  {
    id: "keyboard",
    name: "61-Key Touch-Sensitive Student Keyboard",
    category: "Keys",
    type: "student",
    image: pianoImg,
    recommendedFor: "Piano syllabus practice, ear training & theory",
    inclusions: [
      "Sturdy X-frame foldable keyboard stand",
      "Heavy-duty power adapter & music rest",
      "Sustain pedal unit included",
      "Headphone output jack for quiet home practice",
    ],
  },
  {
    id: "acoustic-guitar",
    name: "Classical Nylon & Folk Acoustic Guitar",
    category: "Guitars",
    type: "student",
    image: guitarAcousticImg,
    recommendedFor: "Fingerpicking, classical posture & pop chords",
    inclusions: [
      "Water-resistant padded gig bag",
      "Digital clip-on chromatic tuner",
      "Spare high-E string & guitar plectrums",
      "Low-action fret setup for comfortable learning",
    ],
  },
  {
    id: "alto-sax",
    name: "Eb Alto Saxophone (Lacquered Brass)",
    category: "Woodwinds",
    type: "student",
    image: saxophoneImg,
    recommendedFor: "Wind players, band members & soloists",
    inclusions: [
      "Ergonomic mouthpiece, ligature & protective cap",
      "Padded neck strap & cork grease tube",
      "Cleaning pull-through swab & reeds starter pack",
      "Hard flight case with plush velvet lining",
    ],
  },
  {
    id: "flute",
    name: "C Concert Concert Flute (Silver Plated)",
    category: "Woodwinds",
    type: "student",
    image: fluteImg,
    recommendedFor: "Classical repertoire, breath control & orchestra",
    inclusions: [
      "Precision-aligned split-E mechanism & offset-G key",
      "Hard protective case & cleaning rod",
      "Microfiber polishing cloth",
      "Pad leak test and lubrication completed",
    ],
  },
  {
    id: "trumpet",
    name: "Bb Standard Student Trumpet",
    category: "Brass",
    type: "student",
    image: trumpetImg,
    recommendedFor: "Brass fundamentals, embouchure & ensemble playing",
    inclusions: [
      "Standard 7C brass mouthpiece",
      "Smooth Monel piston valves with valve oil bottle",
      "Durable molded case with dual carry handles",
      "Slide tuning grease and maintenance guide",
    ],
  },
  {
    id: "pa-system",
    name: "Active Concert PA System (2x Tops + Subwoofer)",
    category: "PA & Sound",
    type: "event",
    image: studioImg,
    idealFor: "Church crusades, live outdoor concerts, wedding banquets",
    features: [
      "Up to 2,000 Watts RMS clean sound dispersion",
      "Bluetooth & XLR/TRS multi-channel live mixer included",
      "Heavy-duty tripod speaker stands & power distribution cabling",
      "On-site sound technician setup available on request",
    ],
  },
  {
    id: "drum-kit",
    name: "5-Piece Stage Drum Kit & Heavy Hardware Pack",
    category: "Backline",
    type: "event",
    image: drumsImg,
    idealFor: "Concerts, youth rallies, music video shoots & recitals",
    features: [
      "Bass drum, 2 rack toms, 1 floor tom, 14-inch snare drum",
      "Complete cymbal set: 14\" hi-hats, 16\" crash, 20\" ride",
      "Heavy double-braced boom stands, kick pedal & drum throne",
      "Acoustic dampening gel rings for balanced live tone",
    ],
  },
  {
    id: "bass-amp",
    name: "300W Bass Combo & Stage Guitar Amplifier Rig",
    category: "Backline",
    type: "event",
    image: bassGuitarImg,
    idealFor: "Ensemble rehearsals, church guest bands & stage live backline",
    features: [
      "Punchy 15-inch neodymium speaker with balanced XLR direct out",
      "4-band active EQ with ultra-low & bright boost switches",
      "Road-ready reinforced cabinet with recessed carry handles",
      "Instrument shielded patch cables included",
    ],
  },
  {
    id: "stage-piano",
    name: "88-Key Weighted Action Stage Piano & Synthesizer",
    category: "Keys",
    type: "event",
    image: pianoImg,
    idealFor: "Classical recitals, worship conferences & corporate galas",
    features: [
      "Graded hammer action keys replicating acoustic grand touch",
      "Stereo balanced outputs, expression & sustain pedal unit",
      "Double-X heavy duty stage stand & padded flight transport case",
      "Preloaded concert grand, electric pianos, strings & organ patches",
    ],
  },
]

export function Rentals({ go }: { go: (p: Page) => void }) {
  const [rentals, setRentals] = useState<RentalItem[]>(DEFAULT_RENTALS)
  const [fleetTypes, setFleetTypes] = useState<RentalFleetType[]>(DEFAULT_FLEET_TYPES)
  const [activeTab, setActiveTab] = useState<string>("student")

  // Multi-Item Selection State with localStorage persistence
  const [selectedRentals, setSelectedRentals] = useState<RentalItem[]>(() => {
    try {
      const saved = localStorage.getItem("vdx_rental_cart")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [showMultiDrawer, setShowMultiDrawer] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem("vdx_rental_cart", JSON.stringify(selectedRentals))
    } catch {}
  }, [selectedRentals])

  // Single Item Inquiry Target
  const [selectedGear, setSelectedGear] = useState<string>("")

  // Form Fields
  const [formName, setFormName] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formDuration, setFormDuration] = useState("1 Month")
  const [formIntake, setFormIntake] = useState("pickup")
  const [formAddress, setFormAddress] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // Dynamic fetch from database / backend
  useEffect(() => {
    fetchCatalogRentalsData().then(({ rentals: data, fleetTypes: ftData }) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setRentals(data as RentalItem[])
      }
      if (ftData && Array.isArray(ftData) && ftData.length > 0) {
        setFleetTypes(ftData as RentalFleetType[])
      }
    })
  }, [])

  // Active items & active fleet types filter
  const activeFleetTypes = fleetTypes.filter((ft) => ft.isActive !== false)
  const activeRentals = rentals.filter(
    (r) => r.isActive !== false && (r as any).is_active !== false,
  )

  // Ensure active tab points to a valid active fleet or terms
  useEffect(() => {
    if (activeTab !== "terms") {
      const exists = activeFleetTypes.some((ft) => ft.id === activeTab)
      if (!exists && activeFleetTypes.length > 0) {
        setActiveTab(activeFleetTypes[0].id)
      }
    }
  }, [activeFleetTypes, activeTab])

  // Helper to get active items for a given fleet type
  const getItemsForFleet = (fleetId: string) => {
    return activeRentals.filter((r) => {
      if (fleetId === "student" || fleetId === "students") {
        return (
          r.type === "student" ||
          (!r.type && r.category !== "PA & Sound" && r.category !== "Backline")
        )
      }
      if (fleetId === "event" || fleetId === "events") {
        return (
          r.type === "event" ||
          (!r.type && (r.category === "PA & Sound" || r.category === "Backline"))
        )
      }
      return r.type === fleetId
    })
  }

  const [visibleCountMap, setVisibleCountMap] = useState<Record<string, number>>({})
  const getVisibleCount = (fleetId: string) =>
    visibleCountMap[fleetId] || (fleetId === "event" ? 4 : 6)
  const setVisibleCount = (fleetId: string, count: number) => {
    setVisibleCountMap((prev) => ({ ...prev, [fleetId]: count }))
  }

  // Multi-selection helpers
  const isSelected = (id: string) => selectedRentals.some((item) => item.id === id)

  const toggleSelectRental = (item: RentalItem) => {
    if (isSelected(item.id)) {
      setSelectedRentals(selectedRentals.filter((i) => i.id !== item.id))
    } else {
      setSelectedRentals([...selectedRentals, item])
    }
  }

  const removeSelectedRental = (id: string) => {
    setSelectedRentals(selectedRentals.filter((i) => i.id !== id))
  }

  const clearRentalsSelection = () => {
    setSelectedRentals([])
    try {
      localStorage.removeItem("vdx_rental_cart")
    } catch {}
    setShowMultiDrawer(false)
  }

  const handleInquiry = (gearName: string) => {
    setSelectedGear(gearName)
    const el = document.getElementById("rental-inquiry-form")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  const directWhatsAppInquiry = (gearName: string) => {
    const msg = `Hello Vivadoxa Admin, I would like to inquire about renting:%0A%0A• Item: ${encodeURIComponent(
      gearName,
    )}%0A%0APlease let me know current availability, rental fee quote, and pickup/delivery options.`
    window.open(`https://wa.me/2348031308881?text=${msg}`, "_blank")
  }

  // Wire MULTIPLE rental items to Admin via WhatsApp
  const wireMultipleRentalsToWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (selectedRentals.length === 0) return

    const itemsList = selectedRentals
      .map((item, idx) => `${idx + 1}. ${item.name} (${item.category})`)
      .join("%0A")

    const intakeText = formIntake === "pickup" ? "Studio Pickup in Kaduna" : `Courier Delivery to: ${formAddress || "Kaduna Address"}`

    // Connect to backend database & admin notification
    submitEnquiry({
      fullName: formName || "Rental Fleet Customer",
      email: formEmail || "",
      phone: formPhone,
      source: "rentals",
      type: "reservation",
      subject: `Rental Reservation (${selectedRentals.length} Items): ${selectedRentals.map(r => r.name).slice(0, 2).join(", ")}`,
      message: `Selected Fleet Items:\n${selectedRentals.map((r, i) => `${i + 1}. ${r.name} (${r.category})`).join("\n")}\n\nDuration: ${formDuration}\nIntake Method: ${intakeText}\nAdditional Notes: ${formNotes || "None"}`,
    }).catch(() => {})

    const msg = `Hello Vivadoxa Admin, I would like to reserve the following ${selectedRentals.length} rental items:%0A%0A${itemsList}%0A%0A• Duration: ${encodeURIComponent(
      formDuration,
    )}%0A• Customer: ${encodeURIComponent(formName || "Customer")}%0A• WhatsApp/Phone: ${encodeURIComponent(
      formPhone || "Not provided",
    )}%0A• Email: ${encodeURIComponent(formEmail || "Not provided")}%0A• Intake: ${encodeURIComponent(
      intakeText,
    )}%0A• Notes: ${encodeURIComponent(
      formNotes || "Please provide rental quote, payment details, and pickup/delivery terms.",
    )}`

    window.open(`https://wa.me/2348031308881?text=${msg}`, "_blank")
  }

  // Wire MULTIPLE rental items to Admin via Email
  const wireMultipleRentalsToEmail = () => {
    if (selectedRentals.length === 0) return

    const itemsList = selectedRentals
      .map((item, idx) => `${idx + 1}. ${item.name} (${item.category})`)
      .join("\n")

    const intakeText = formIntake === "pickup" ? "Studio Pickup in Kaduna" : `Courier Delivery to: ${formAddress || "Kaduna Address"}`

    // Connect to backend database
    submitEnquiry({
      fullName: formName || "Rental Fleet Customer",
      email: formEmail || "",
      phone: formPhone,
      source: "rentals",
      type: "reservation",
      subject: `Rental Reservation (${selectedRentals.length} Items): ${selectedRentals.map(r => r.name).slice(0, 2).join(", ")}`,
      message: `Selected Fleet Items:\n${selectedRentals.map((r, i) => `${i + 1}. ${r.name} (${r.category})`).join("\n")}\n\nDuration: ${formDuration}\nIntake Method: ${intakeText}\nAdditional Notes: ${formNotes || "None"}`,
    }).catch(() => {})

    const body = `Hello Vivadoxa Administration,\n\nI would like to inquire about reserving the following ${selectedRentals.length} items from your rental fleet:\n\n${itemsList}\n\nRental Details:\n• Duration: ${formDuration}\n• Customer Name: ${formName || "Customer"}\n• Phone: ${formPhone || "Not provided"}\n• Intake Method: ${intakeText}\n• Notes: ${formNotes || "None"}\n\nPlease let me know the rental quote, payment details, and handover schedule.\n\nThank you!`

    window.location.href = `mailto:${SCHOOL_EMAIL}?subject=${encodeURIComponent(
      `Rental Fleet Inquiry (${selectedRentals.length} Items)`,
    )}&body=${encodeURIComponent(body)}`
  }

  // Single form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const gearText = selectedGear || "Musical Instrument / Equipment Rental"
    const intakeText = formIntake === "pickup" ? "Studio Pickup in Kaduna" : `Courier Delivery to: ${formAddress}`

    // Connect to backend database & admin notification
    submitEnquiry({
      fullName: formName || "Rental Customer",
      email: formEmail || "",
      phone: formPhone,
      source: "rentals",
      type: "reservation",
      subject: `Rental Reservation: ${gearText}`,
      message: `Item: ${gearText}\nDuration: ${formDuration}\nIntake Method: ${intakeText}\nAdditional Notes: ${formNotes || "None"}`,
    }).catch(() => {})

    const msg = `Hello Vivadoxa Admin, I would like to reserve a rental:%0A%0A• Item: ${encodeURIComponent(
      gearText,
    )}%0A• Duration: ${encodeURIComponent(formDuration)}%0A• Name: ${encodeURIComponent(
      formName,
    )}%0A• Phone: ${encodeURIComponent(formPhone)}%0A• Email: ${encodeURIComponent(
      formEmail || "Not provided",
    )}%0A• Intake: ${encodeURIComponent(intakeText)}%0A• Notes: ${encodeURIComponent(
      formNotes || "None",
    )}%0A%0APlease provide rental rates, payment details, and pickup/delivery arrangement.`

    window.open(`https://wa.me/2348031308881?text=${msg}`, "_blank")
  }

  return (
    <main className="pb-24">
      <SEO
        title="Musical Instrument & Sound Equipment Rentals in Kaduna | Vivadoxa"
        description="Showcase of student practice instruments and professional concert sound equipment for rent in Kaduna. Rent violins, keyboards, saxophones, guitars, and stage backline with maintenance included. Contact admin to rent."
        keywords="instrument rentals kaduna, rent violin kaduna, rent keyboard kaduna, rent saxophone kaduna, sound system rental kaduna, drum kit rental kaduna, vivadoxa rentals"
        canonicalUrl="/rentals"
      />

      <PageHero
        eyebrow="Instrument & Sound Hire"
        title="Practice today. Perform tomorrow."
        body="Vetted practice instruments for students and professional stage backline and PA sound systems for concerts and events in Kaduna. Select items to wire your reservation directly to admin."
        actions={
          <>
            <a href="#rental-catalog" className="btn btn-primary inline-flex items-center gap-2">
              Browse Rental Fleet <Icon name="arrow" size={14} />
            </a>
            <button
              type="button"
              onClick={() => handleInquiry("General Rental Inquiry")}
              className="btn-concierge cursor-pointer"
            >
              Reserve via Form &rarr;
            </button>
            <a
              href="https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Admin%2C%20I%20would%20like%20to%20inquire%20about%20instrument%20and%20sound%20equipment%20rentals."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-concierge inline-flex items-center gap-2"
            >
              <WhatsAppIcon size={16} /> Rental WhatsApp
            </a>
          </>
        }
      />

      {/* ── Value Pillars Strip (NO 100% refund promise) ─────────────── */}
      <section className="bg-white border-b border-[var(--line)] py-8">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <ScrollReveal direction="up" delay={0}>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)]">
              <span className="text-2xl font-black text-[var(--gold)] block">100%</span>
              <strong className="text-xs text-[var(--navy)] block mt-1">Technician Vetted</strong>
              <small className="text-[11px] text-[var(--muted)]">Intonated &amp; setup by our clinic</small>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={80}>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)]">
              <span className="text-2xl font-black text-[var(--navy)] block">Flexible</span>
              <strong className="text-xs text-[var(--navy)] block mt-1">Student Practice Terms</strong>
              <small className="text-[11px] text-[var(--muted)]">Monthly &amp; term practice access</small>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={160}>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)]">
              <span className="text-2xl font-black text-[var(--gold)] block">Simple</span>
              <strong className="text-xs text-[var(--navy)] block mt-1">Upfront Rental</strong>
              <small className="text-[11px] text-[var(--muted)]">Pay, pick up, use &amp; return</small>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={240}>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[var(--line)]">
              <span className="text-2xl font-black text-[var(--navy)] block">Kaduna</span>
              <strong className="text-xs text-[var(--navy)] block mt-1">Pickup &amp; Delivery</strong>
              <small className="text-[11px] text-[var(--muted)]">Angwan Sunday Studio or doorstep</small>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Category Navigation Tabs ───────────────────────────────────── */}
      <section className="section bg-[#FAF8F5]" id="rental-catalog">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <ScrollReveal direction="left">
              <div>
                <span className="eyebrow">Rental Showcase</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--navy)] mt-1">
                  Choose your rental gear
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Select single or multiple items with &ldquo;Select&rdquo;, then wire your reservation list to Admin.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={100}>
              <div className="inline-flex flex-wrap p-1.5 rounded-xl bg-white border border-[var(--line)] shadow-xs">
                {activeFleetTypes.map((ft) => {
                  const count = getItemsForFleet(ft.id).length
                  const isActive = activeTab === ft.id
                  return (
                    <button
                      key={ft.id}
                      type="button"
                      onClick={() => setActiveTab(ft.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[var(--gold)] text-white shadow-xs"
                          : "text-[var(--muted)] hover:text-[var(--navy)]"
                      }`}
                    >
                      {ft.name} ({count})
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setActiveTab("terms")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "terms"
                      ? "bg-[var(--gold)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--navy)]"
                  }`}
                >
                  Protocol &amp; FAQ
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Dynamic Active Fleet View */}
          {activeTab !== "terms" && (() => {
            const currentFleet =
              activeFleetTypes.find((ft) => ft.id === activeTab) ||
              activeFleetTypes[0]

            if (!currentFleet) {
              return (
                <div className="bg-white rounded-2xl border border-[var(--line)] p-12 text-center max-w-lg mx-auto">
                  <Icon name="info" size={32} className="mx-auto text-[var(--gold)] mb-3" />
                  <h3 className="font-bold text-base text-[var(--navy)]">Rental Fleet Transitioning</h3>
                  <p className="text-xs text-[var(--muted)] mt-1 mb-4">
                    Our rental catalog is currently undergoing inventory updates. Please check back soon or inquire via WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => directWhatsAppInquiry("General Rental Inquiry")}
                    className="btn btn-primary !text-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon size={14} /> Inquire on WhatsApp
                  </button>
                </div>
              )
            }

            const fleetItems = getItemsForFleet(currentFleet.id)
            const visibleCount = getVisibleCount(currentFleet.id)
            const displayedItems = fleetItems.slice(0, visibleCount)
            const isHorizontalLayout = currentFleet.id === "event" || currentFleet.id === "backline"

            if (fleetItems.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-[var(--line)] p-12 text-center max-w-lg mx-auto">
                  <Icon name="info" size={32} className="mx-auto text-[var(--gold)] mb-3" />
                  <h3 className="font-bold text-base text-[var(--navy)]">
                    No gear currently listed under {currentFleet.name}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-1 mb-4">
                    Instruments and equipment for this fleet are currently undergoing clinical intonation or reserved. Contact admin for custom fleet bookings.
                  </p>
                  <button
                    type="button"
                    onClick={() => directWhatsAppInquiry(`Inquiry for ${currentFleet.name}`)}
                    className="btn btn-primary !text-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon size={14} /> Inquire on WhatsApp
                  </button>
                </div>
              )
            }

            return (
              <>
                {isHorizontalLayout ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedItems.map((item, idx) => {
                      const selected = isSelected(item.id)
                      return (
                        <ScrollReveal
                          key={item.id}
                          direction="up"
                          delay={(idx % 2) * 80}
                          className="h-full"
                        >
                          <div
                            className={`bg-white rounded-2xl border transition-all flex flex-col sm:flex-row group relative h-full ${
                              selected
                                ? "border-[var(--gold)] shadow-md ring-2 ring-[var(--gold)]/20"
                                : "border-[var(--line)] shadow-xs hover:shadow-md"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSelectRental(item)}
                              className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm transition-all cursor-pointer ${
                                selected
                                  ? "bg-[var(--gold)] text-white"
                                  : "bg-white/95 text-[var(--navy)] hover:bg-white"
                              }`}
                              title={selected ? "Click to deselect" : "Select item for multi-item rental reservation"}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                                  selected ? "bg-white text-[var(--gold)]" : "border border-slate-400"
                                }`}
                              >
                                {selected ? "✓" : ""}
                              </span>
                              <span>{selected ? "Selected" : "Select"}</span>
                            </button>

                            <div className="sm:w-5/12 h-52 sm:h-auto relative overflow-hidden bg-slate-900 shrink-0 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
                              <LazyImage
                                src={item.image}
                                alt={item.name}
                                fallbackSrc="/media/studio/multi-instrument-lab.jpeg"
                                className="group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden pointer-events-none" />
                              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[var(--navy)] font-bold text-[11px] px-2.5 py-1 rounded-md z-10">
                                {item.category}
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1 pr-20">
                                  <h3 className="font-bold text-base text-[var(--navy)]">{item.name}</h3>
                                </div>
                                <p className="text-xs text-[var(--muted)] mb-3">{item.idealFor || item.recommendedFor}</p>

                                <ul className="space-y-1 text-xs text-slate-600 mb-4">
                                  {(item.features || item.inclusions || []).map((f, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="text-[var(--gold)] font-bold">✓</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
                                <span className="text-[11px] text-[var(--muted)]">
                                  {currentFleet.badge || "Technician Vetted"}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => directWhatsAppInquiry(item.name)}
                                    className="btn btn-secondary !py-2 !px-2.5 !text-xs cursor-pointer"
                                    title="Inquire on WhatsApp"
                                  >
                                    <WhatsAppIcon size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInquiry(item.name)}
                                    className="btn btn-primary !py-2 !px-4 !text-xs cursor-pointer"
                                  >
                                    Reserve Item
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ScrollReveal>
                      )
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedItems.map((item, idx) => {
                      const selected = isSelected(item.id)
                      return (
                        <ScrollReveal
                          key={item.id}
                          direction="up"
                          delay={(idx % 3) * 70}
                          className="h-full"
                        >
                          <div
                            className={`bg-white rounded-2xl border transition-all flex flex-col group relative h-full ${
                              selected
                                ? "border-[var(--gold)] shadow-md ring-2 ring-[var(--gold)]/20"
                                : "border-[var(--line)] shadow-xs hover:shadow-md"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleSelectRental(item)}
                              className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm transition-all cursor-pointer ${
                                selected
                                  ? "bg-[var(--gold)] text-white"
                                  : "bg-white/95 text-[var(--navy)] hover:bg-white"
                              }`}
                              title={selected ? "Click to deselect" : "Select item for multi-item rental reservation"}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                                  selected ? "bg-white text-[var(--gold)]" : "border border-slate-400"
                                }`}
                              >
                                {selected ? "✓" : ""}
                              </span>
                              <span>{selected ? "Selected" : "Select"}</span>
                            </button>

                            <div className="h-48 relative overflow-hidden bg-slate-900 rounded-t-2xl">
                              <LazyImage
                                src={item.image}
                                alt={item.name}
                                fallbackSrc="/media/programs/violin-solo-rainbow.jpeg"
                                className="group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[var(--navy)] font-bold text-[11px] px-2.5 py-1 rounded-md shadow-xs z-10">
                                {item.category}
                              </span>
                              <span className="absolute bottom-3 left-3 bg-white/95 text-[var(--navy)] font-bold text-xs px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5 z-10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                                {currentFleet.badge || currentFleet.name}
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                              <h3 className="font-bold text-base text-[var(--navy)] mb-1">{item.name}</h3>
                              <p className="text-xs text-[var(--muted)] mb-3">{item.recommendedFor || item.idealFor}</p>

                              <div className="mb-4 pt-3 border-t border-[var(--line)]">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gold)] block mb-1.5">
                                  Inclusions &amp; Setup:
                                </span>
                                <ul className="space-y-1 text-xs text-slate-600">
                                  {(item.inclusions || item.features || []).map((inc, i) => (
                                    <li key={i} className="flex items-start gap-1.5">
                                      <span className="text-[var(--gold)] font-bold">✓</span>
                                      <span>{inc}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="mt-auto pt-4 border-t border-[var(--line)] flex items-center justify-between gap-2">
                                <div>
                                  <small className="block text-[10px] text-[var(--muted)] uppercase font-semibold">
                                    Rental Policy
                                  </small>
                                  <strong className="text-xs text-slate-700 font-semibold">Upfront Payment</strong>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => directWhatsAppInquiry(item.name)}
                                    className="btn btn-secondary !py-2 !px-2.5 !text-xs cursor-pointer"
                                    title="Inquire on WhatsApp"
                                  >
                                    <WhatsAppIcon size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInquiry(item.name)}
                                    className="btn btn-primary !py-2 !px-3.5 !text-xs cursor-pointer"
                                  >
                                    Reserve Item
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ScrollReveal>
                      )
                    })}
                  </div>
                )}

                {fleetItems.length > visibleCount && (
                  <div className="text-center mt-10">
                    <button
                      type="button"
                      onClick={() => setVisibleCount(currentFleet.id, visibleCount + (isHorizontalLayout ? 4 : 6))}
                      className="btn btn-secondary !py-3 !px-8 text-xs font-bold inline-flex items-center gap-2 shadow-xs hover:border-[var(--gold)] cursor-pointer"
                    >
                      <span>
                        View More {currentFleet.name} ({fleetItems.length - visibleCount} remaining)
                      </span>
                      <Icon name="arrow" size={13} className="rotate-90" />
                    </button>
                  </div>
                )}

                {visibleCount >= fleetItems.length && fleetItems.length > (isHorizontalLayout ? 4 : 6) && (
                  <div className="text-center mt-10 flex items-center justify-center gap-3">
                    <span className="text-xs text-[var(--muted)]">
                      Showing all {fleetItems.length} items in {currentFleet.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVisibleCount(currentFleet.id, isHorizontalLayout ? 4 : 6)
                        document.getElementById("rental-catalog")?.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="text-xs font-bold text-[var(--gold)] hover:underline cursor-pointer"
                    >
                      Show Less ↑
                    </button>
                  </div>
                )}
              </>
            )
          })()}

          {/* Tab 3: Protocol & FAQ */}
          {activeTab === "terms" && (
            <ScrollReveal direction="up">
            <div className="bg-white rounded-2xl border border-[var(--line)] p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="font-bold text-lg text-[var(--navy)] mb-2">1. How Our Rental Workflow Works</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Renting an instrument or event sound gear from Vivadoxa is simple and straightforward: choose your equipment
                  or gadget for your event, pay the rental fee upfront to confirm your booking, pick it up from our Kaduna studio
                  (or request local courier delivery), use it for your event, and return it once the event is over.
                </p>
              </div>

              <div className="border-t border-[var(--line)] pt-4">
                <h3 className="font-bold text-lg text-[var(--navy)] mb-2">2. Free Clinic Calibration Guarantee</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every instrument and audio device is thoroughly tested, tuned, and calibrated by our certified in-house
                  instrument clinic prior to dispatch. You receive gig-ready, fully functional equipment with proper
                  protective gig bags or flight cases and standard accessories.
                </p>
              </div>

              <div className="border-t border-[var(--line)] pt-4">
                <h3 className="font-bold text-lg text-[var(--navy)] mb-2">3. Studio Pickup or Kaduna Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You can collect and test your gear directly at our studio at No. 49B Umaru Ibrahim Street, Angwan
                  Sunday, Kaduna. Alternatively, we provide insured courier drop-off to Barnawa, Millennium City, Malali,
                  GRA, Sabon Tasha, and environs.
                </p>
              </div>

              <div className="border-t border-[var(--line)] pt-4">
                <h3 className="font-bold text-lg text-[var(--navy)] mb-2">4. On-Time Returns &amp; Damage Surcharges</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Equipment must be returned promptly at the agreed date and time following your event. There are no deposit refunds
                  or rent-to-own schemes. Please note that surcharges apply for late returns past the agreed rental window or for
                  any physical damages and unreturned accessories.
                </p>
              </div>
            </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── STICKY CART BAR (Floating Bottom) ─────────────────────────── */}
      {selectedRentals.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--navy)] text-white py-3 px-4 shadow-2xl border-t border-[var(--gold)] animate-in slide-in-from-bottom">
          <div className="container max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--gold)] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {selectedRentals.length}
              </span>
              <div>
                <strong className="text-xs sm:text-sm font-bold block text-white">
                  {selectedRentals.length} {selectedRentals.length === 1 ? "Rental Item" : "Rental Items"} in Cart
                </strong>
                <span className="text-[11px] text-slate-300 line-clamp-1">
                  {selectedRentals.map((i) => i.name).join(" · ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={clearRentalsSelection}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>

              <button
                type="button"
                onClick={() => setShowMultiDrawer(true)}
                className="btn btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Icon name="cart" size={15} />
                <span>Review Cart &amp; Confirm ({selectedRentals.length}) &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING QUICK CART BUTTON ─────────────────────────────────── */}
      {selectedRentals.length > 0 && !showMultiDrawer && (
        <button
          type="button"
          onClick={() => setShowMultiDrawer(true)}
          className="fixed bottom-20 right-4 sm:right-6 z-40 bg-[var(--gold)] text-white p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white"
          aria-label={`View Rental Cart (${selectedRentals.length} items)`}
          title="Open Cart"
        >
          <Icon name="cart" size={20} />
          <span className="absolute -top-1.5 -right-1.5 bg-[var(--navy)] text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-white">
            {selectedRentals.length}
          </span>
        </button>
      )}

      {/* ── INTERACTIVE CART & CHECKOUT MODAL ──────────────────────────── */}
      <CartCheckout
        isOpen={showMultiDrawer}
        onClose={() => setShowMultiDrawer(false)}
        items={selectedRentals}
        onRemoveItem={removeSelectedRental}
        mode="rentals"
        onConfirmed={(_ref) => {
          setSelectedRentals([])
          try {
            localStorage.removeItem("vdx_rental_cart")
          } catch {}
        }}
      />

      {/* ── Interactive Rental Booking Form (Single / General) ────────── */}
      <section className="section bg-white border-t border-[var(--line)]" id="rental-inquiry-form">
        <div className="container max-w-2xl">
          <ScrollReveal direction="up">
          <div className="text-center mb-8">
            <span className="eyebrow">Instant Reservation</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--navy)] mt-1">
              Reserve your instrument or sound gear
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">
              Fill out the details below. Our admissions and equipment desk will verify availability and confirm your
              booking immediately.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[var(--line)]">
            <div>
              <Field
                label="Selected Instrument or Equipment"
                value={selectedGear}
                onChange={(val: any) => setSelectedGear(typeof val === "string" ? val : val?.target?.value ?? "")}
                placeholder="e.g. Student Conservatory Violin Outfit, 61-Key Keyboard, PA System"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={formName}
                onChange={(val: any) => setFormName(typeof val === "string" ? val : val?.target?.value ?? "")}
                placeholder="Your full name"
                required
              />
              <Field
                label="WhatsApp / Phone Number"
                value={formPhone}
                onChange={(val: any) => setFormPhone(typeof val === "string" ? val : val?.target?.value ?? "")}
                placeholder="0803 889 0786"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Email Address"
                type="email"
                value={formEmail}
                onChange={(val: any) => setFormEmail(typeof val === "string" ? val : val?.target?.value ?? "")}
                placeholder="you@example.com"
              />
              <SelectField
                label="Desired Rental Duration"
                value={formDuration}
                onChange={(val: any) => setFormDuration(typeof val === "string" ? val : val?.target?.value ?? "")}
                options={[
                  { value: "1 Day (Event / Concert)", label: "1 Day (Event / Concert)" },
                  { value: "Weekend (2-3 Days)", label: "Weekend Event (2-3 Days)" },
                  { value: "1 Week", label: "1 Week" },
                  { value: "1 Month (Practice / Production)", label: "1 Month (Practice / Production)" },
                  { value: "Academic Term (3 Months)", label: "Academic Term (3 Months)" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--navy)] mb-1.5">Intake Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormIntake("pickup")}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    formIntake === "pickup"
                      ? "border-[var(--gold)] bg-amber-50/50 text-[var(--gold)] font-bold"
                      : "border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  Studio Pickup (Kaduna)
                </button>
                <button
                  type="button"
                  onClick={() => setFormIntake("delivery")}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    formIntake === "delivery"
                      ? "border-[var(--gold)] bg-amber-50/50 text-[var(--gold)] font-bold"
                      : "border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  Doorstep Courier Delivery
                </button>
              </div>
            </div>

            {formIntake === "delivery" && (
              <Field
                label="Delivery Address & Landmark (Kaduna)"
                value={formAddress}
                onChange={(val: any) => setFormAddress(typeof val === "string" ? val : val?.target?.value ?? "")}
                placeholder="e.g. Barnawa Complex, near Market, Kaduna"
                required
              />
            )}

            <Textarea
              label="Additional Notes / Special Requirements"
              value={formNotes}
              onChange={(val: any) => setFormNotes(typeof val === "string" ? val : val?.target?.value ?? "")}
              placeholder="Specify size (e.g. 1/2 or 4/4 violin), music style, or delivery schedule preferences."
              rows={3}
            />

            <Button type="submit" className="w-full justify-center !py-3">
              <WhatsAppIcon size={18} />
              <span>Submit Rental Request on WhatsApp</span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--muted)] pt-1">
              <Icon name="shield" size={13} className="text-emerald-600" />
              <span>Tested &amp; gig-ready · Return after event · Late/damage surcharge terms apply</span>
            </div>

            {/* Alternative Contact Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[var(--line)] text-xs text-[var(--muted)]">
              <span className="font-semibold text-[var(--navy)]">Prefer another channel?</span>
              <a
                href={`mailto:${SCHOOL_EMAIL}?subject=Rental%20Inquiry%20from%20Website`}
                className="inline-flex items-center gap-1 text-[var(--navy)] hover:text-[var(--gold)] font-medium"
              >
                <Icon name="mail" size={13} />
                <span>{SCHOOL_EMAIL}</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href={`tel:${SCHOOL_PHONE}`}
                className="inline-flex items-center gap-1 text-[var(--navy)] hover:text-[var(--gold)] font-medium"
              >
                <Icon name="phone" size={13} />
                <span>Call {SCHOOL_PHONE}</span>
              </a>
            </div>
          </form>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
