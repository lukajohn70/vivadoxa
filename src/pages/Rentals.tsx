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
import { fetchCatalogRentals } from "@/lib/api"
import { ScrollReveal } from "@/components/ScrollReveal"
import { LazyImage } from "@/components/LazyImage"
import type { Page } from "@/types"

export interface RentalItem {
  id: string
  name: string
  category: "Strings" | "Keys" | "Guitars" | "Woodwinds" | "Brass" | "PA & Sound" | "Backline" | "Microphones"
  type: "student" | "event"
  image: string
  inclusions?: string[]
  features?: string[]
  recommendedFor?: string
  idealFor?: string
  inStock?: boolean
}

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
  const [activeTab, setActiveTab] = useState<"students" | "events" | "terms">("students")

  // Multi-Item Selection State
  const [selectedRentals, setSelectedRentals] = useState<RentalItem[]>([])
  const [showMultiDrawer, setShowMultiDrawer] = useState(false)

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
    fetchCatalogRentals().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setRentals(data as RentalItem[])
      }
    })
  }, [])

  const studentItems = rentals.filter((r) => r.type === "student" || (!r.type && r.category !== "PA & Sound" && r.category !== "Backline"))
  const eventItems = rentals.filter((r) => r.type === "event" || r.category === "PA & Sound" || r.category === "Backline")

  const [visibleStudentCount, setVisibleStudentCount] = useState(6)
  const [visibleEventCount, setVisibleEventCount] = useState(4)

  const displayedStudentItems = studentItems.slice(0, visibleStudentCount)
  const displayedEventItems = eventItems.slice(0, visibleEventCount)

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
    )}%0A%0APlease let me know current availability, rental terms, caution deposit requirements, and pickup/delivery options.`
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

    const msg = `Hello Vivadoxa Admin, I would like to reserve the following ${selectedRentals.length} rental items:%0A%0A${itemsList}%0A%0A• Duration: ${encodeURIComponent(
      formDuration,
    )}%0A• Customer: ${encodeURIComponent(formName || "Customer")}%0A• WhatsApp/Phone: ${encodeURIComponent(
      formPhone || "Not provided",
    )}%0A• Email: ${encodeURIComponent(formEmail || "Not provided")}%0A• Intake: ${encodeURIComponent(
      intakeText,
    )}%0A• Notes: ${encodeURIComponent(
      formNotes || "Please provide rental quote, caution deposit details, and pickup/delivery terms.",
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

    const body = `Hello Vivadoxa Administration,\n\nI would like to inquire about reserving the following ${selectedRentals.length} items from your rental fleet:\n\n${itemsList}\n\nRental Details:\n• Duration: ${formDuration}\n• Customer Name: ${formName || "Customer"}\n• Phone: ${formPhone || "Not provided"}\n• Intake Method: ${intakeText}\n• Notes: ${formNotes || "None"}\n\nPlease let me know the rental quote, caution deposit requirements, and handover schedule.\n\nThank you!`

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
    const msg = `Hello Vivadoxa Admin, I would like to reserve a rental:%0A%0A• Item: ${encodeURIComponent(
      gearText,
    )}%0A• Duration: ${encodeURIComponent(formDuration)}%0A• Name: ${encodeURIComponent(
      formName,
    )}%0A• Phone: ${encodeURIComponent(formPhone)}%0A• Email: ${encodeURIComponent(
      formEmail || "Not provided",
    )}%0A• Intake: ${encodeURIComponent(intakeText)}%0A• Notes: ${encodeURIComponent(
      formNotes || "None",
    )}%0A%0APlease provide rental rates, caution deposit details, and pickup/delivery arrangement.`

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
              <span className="text-2xl font-black text-[var(--gold)] block">Security</span>
              <strong className="text-xs text-[var(--navy)] block mt-1">Caution Deposit</strong>
              <small className="text-[11px] text-[var(--muted)]">Subject to return condition check</small>
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
              <div className="inline-flex p-1.5 rounded-xl bg-white border border-[var(--line)] shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("students")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "students"
                      ? "bg-[var(--gold)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--navy)]"
                  }`}
                >
                  Student Home Practice ({studentItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("events")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "events"
                      ? "bg-[var(--gold)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--navy)]"
                  }`}
                >
                  Stage, PA &amp; Event Backline ({eventItems.length})
                </button>
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

          {/* Tab 1: Student Rentals */}
          {activeTab === "students" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedStudentItems.map((item, idx) => {
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
                    {/* Multi-Select Checkbox overlay */}
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
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Student Practice Fleet
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-base text-[var(--navy)] mb-1">{item.name}</h3>
                      <p className="text-xs text-[var(--muted)] mb-3">{item.recommendedFor}</p>

                      <div className="mb-4 pt-3 border-t border-[var(--line)]">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gold)] block mb-1.5">
                          Inclusions &amp; Setup:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {(item.inclusions || []).map((inc, i) => (
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
                            Caution Deposit
                          </small>
                          <strong className="text-xs text-slate-700 font-semibold">Terms on Inspection</strong>
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

            {studentItems.length > visibleStudentCount && (
              <div className="text-center mt-10">
                <button
                  type="button"
                  onClick={() => setVisibleStudentCount((prev) => prev + 6)}
                  className="btn btn-secondary !py-3 !px-8 text-xs font-bold inline-flex items-center gap-2 shadow-xs hover:border-[var(--gold)] cursor-pointer"
                >
                  <span>View More Student Instruments ({studentItems.length - visibleStudentCount} remaining)</span>
                  <Icon name="arrow" size={13} className="rotate-90" />
                </button>
              </div>
            )}

            {visibleStudentCount >= studentItems.length && studentItems.length > 6 && (
              <div className="text-center mt-10 flex items-center justify-center gap-3">
                <span className="text-xs text-[var(--muted)]">Showing all {studentItems.length} student practice instruments</span>
                <button
                  type="button"
                  onClick={() => {
                    setVisibleStudentCount(6)
                    document.getElementById("rental-catalog")?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-xs font-bold text-[var(--gold)] hover:underline cursor-pointer"
                >
                  Show Less ↑
                </button>
              </div>
            )}
            </>
          )}

          {/* Tab 2: Stage & Event Backline */}
          {activeTab === "events" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedEventItems.map((item, idx) => {
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
                    {/* Multi-Select Checkbox overlay */}
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
                        <span className="text-[11px] text-[var(--muted)]">Sound engineer available</span>
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
                            Book Event Gear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </ScrollReveal>
                )
              })}
            </div>

            {eventItems.length > visibleEventCount && (
              <div className="text-center mt-10">
                <button
                  type="button"
                  onClick={() => setVisibleEventCount((prev) => prev + 4)}
                  className="btn btn-secondary !py-3 !px-8 text-xs font-bold inline-flex items-center gap-2 shadow-xs hover:border-[var(--gold)] cursor-pointer"
                >
                  <span>View More Event &amp; Sound Gear ({eventItems.length - visibleEventCount} remaining)</span>
                  <Icon name="arrow" size={13} className="rotate-90" />
                </button>
              </div>
            )}

            {visibleEventCount >= eventItems.length && eventItems.length > 4 && (
              <div className="text-center mt-10 flex items-center justify-center gap-3">
                <span className="text-xs text-[var(--muted)]">Showing all {eventItems.length} stage &amp; event sound packages</span>
                <button
                  type="button"
                  onClick={() => {
                    setVisibleEventCount(4)
                    document.getElementById("rental-catalog")?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-xs font-bold text-[var(--gold)] hover:underline cursor-pointer"
                >
                  Show Less ↑
                </button>
              </div>
            )}
            </>
          )}

          {/* Tab 3: Terms & FAQ (NO 100% refund promise) */}
          {activeTab === "terms" && (
            <ScrollReveal direction="up">
            <div className="bg-white rounded-2xl border border-[var(--line)] p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="font-bold text-lg text-[var(--navy)] mb-2">1. How Rental Security Deposits Work</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every instrument rental requires a refundable caution deposit paid prior to dispatch. When you return the
                  instrument at the conclusion of your rental term, our instrument clinic inspects its condition.
                  The security deposit is refunded subject to return condition verification, less any applicable repair or
                  overdue fees.
                </p>
              </div>

              <div className="border-t border-[var(--line)] pt-4">
                <h3 className="font-bold text-lg text-[var(--navy)] mb-2">2. Free Clinic Maintenance Guarantee</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If your rented instrument encounters normal wear issues (e.g. sticking pad, loose peg, or string
                  intonation), bring it into the Vivadoxa Instrument Clinic at Angwan Sunday for <strong>free immediate
                  calibration</strong>. You are never left stranded with unplayable equipment.
                </p>
              </div>

              <div className="border-t border-[var(--line)] pt-4">
                <h3 className="font-bold text-lg text-[var(--navy)] mb-2">3. Studio Pickup or Kaduna Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You can collect and test your instrument directly at our studio at No. 49B Umaru Ibrahim Street, Angwan
                  Sunday, Kaduna. Alternatively, we provide insured courier drop-off to Barnawa, Millennium City, Malali,
                  GRA, Sabon Tasha, and environs.
                </p>
              </div>

              <div className="border-t border-[var(--line)] pt-4">
                <h3 className="font-bold text-lg text-[var(--navy)] mb-2">4. Rent-To-Own Credit</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Loved your rented instrument? If you decide to purchase it or upgrade to a brand-new instrument from the
                  Vivadoxa Store within 3 months, <strong>50% of your paid rental fees</strong> are credited directly
                  toward your purchase price!
                </p>
              </div>
            </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── STICKY MULTI-ITEM RENTAL BAR (Floating Bottom) ───────────── */}
      {selectedRentals.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--navy)] text-white py-3 px-4 shadow-2xl border-t border-amber-500/30 animate-in slide-in-from-bottom">
          <div className="container max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--gold)] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {selectedRentals.length}
              </span>
              <div>
                <strong className="text-xs sm:text-sm font-bold block text-white">
                  {selectedRentals.length} {selectedRentals.length === 1 ? "Rental Item" : "Rental Items"} Selected
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
                Clear
              </button>

              <button
                type="button"
                onClick={() => setShowMultiDrawer(true)}
                className="btn btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <WhatsAppIcon size={14} />
                <span>Review &amp; Wire to Admin ({selectedRentals.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MULTI-ITEM RENTAL RESERVATION MODAL ───────────────────────── */}
      {showMultiDrawer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[var(--line)] relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowMultiDrawer(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[var(--navy)] p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <Icon name="close" size={18} />
            </button>

            <div className="mb-4">
              <span className="eyebrow block mb-1">Multi-Item Reservation</span>
              <h3 className="font-bold text-base sm:text-xl text-[var(--navy)]">
                Wire {selectedRentals.length} Selected Rentals to Admin
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Admin will verify availability for your dates, calculate security deposits, and arrange studio pickup or delivery in Kaduna.
              </p>
            </div>

            {/* List of Selected Rentals */}
            <div className="space-y-2 mb-5 max-h-52 overflow-y-auto pr-1">
              {selectedRentals.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[var(--line)] text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-800 truncate">{item.name}</h5>
                      <span className="text-[10px] text-[var(--muted)]">
                        {item.category} · {item.type === "event" ? "Event Backline" : "Student Practice"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSelectedRental(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Wire to Admin Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
              <button
                type="button"
                onClick={wireMultipleRentalsToWhatsApp}
                className="btn btn-primary !py-2.5 !px-3 !text-xs flex items-center justify-center gap-1.5 w-full cursor-pointer"
              >
                <WhatsAppIcon size={16} />
                <span>WhatsApp List</span>
              </button>

              <button
                type="button"
                onClick={wireMultipleRentalsToEmail}
                className="btn btn-secondary !py-2.5 !px-3 !text-xs flex items-center justify-center gap-1.5 w-full cursor-pointer"
              >
                <Icon name="mail" size={14} />
                <span>Email List</span>
              </button>

              <a
                href={`tel:${SCHOOL_PHONE}`}
                className="btn btn-secondary !py-2.5 !px-3 !text-xs flex items-center justify-center gap-1.5 w-full text-center"
              >
                <Icon name="phone" size={14} />
                <span>Call Admin</span>
              </a>
            </div>

            {/* Reservation Form */}
            <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-xl border border-[var(--line)]">
              <h4 className="text-xs font-bold text-[var(--navy)] mb-2 flex items-center gap-1.5">
                <Icon name="pen" size={12} className="text-[var(--gold)]" />
                <span>Reservation Details:</span>
              </h4>

              <form onSubmit={wireMultipleRentalsToWhatsApp} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field
                    label="Your Full Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Samuel Danladi"
                    required
                  />
                  <Field
                    label="WhatsApp / Phone Number"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0803 889 0786"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field
                    label="Email Address (Optional)"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <SelectField
                    label="Desired Rental Duration"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    options={[
                      { value: "1 Month", label: "1 Month (Student Practice)" },
                      { value: "3 Months", label: "3 Months (Academic Term)" },
                      { value: "6 Months", label: "6 Months (Semester)" },
                      { value: "12 Months", label: "12 Months (Full Year)" },
                      { value: "1 Day", label: "1 Day (Event / Concert)" },
                      { value: "Weekend (2-3 Days)", label: "Weekend Event (2-3 Days)" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--navy)] mb-1">Intake Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormIntake("pickup")}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        formIntake === "pickup"
                          ? "border-[var(--gold)] bg-amber-50 text-[var(--gold)] font-bold"
                          : "border-[var(--line)] bg-white text-[var(--muted)]"
                      }`}
                    >
                      Studio Pickup (Angwan Sunday)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIntake("delivery")}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        formIntake === "delivery"
                          ? "border-[var(--gold)] bg-amber-50 text-[var(--gold)] font-bold"
                          : "border-[var(--line)] bg-white text-[var(--muted)]"
                      }`}
                    >
                      Kaduna Delivery
                    </button>
                  </div>
                </div>

                {formIntake === "delivery" && (
                  <Field
                    label="Delivery Address & Landmark (Kaduna)"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. Barnawa Complex, near Market, Kaduna"
                    required
                  />
                )}

                <Textarea
                  label="Notes / Instrument Specifications"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Specify size requirements (e.g. 1/2 vs 4/4 violin), sound engineer request, or dates."
                  rows={2}
                />

                <Button type="submit" className="w-full justify-center !py-2.5 !text-xs">
                  <WhatsAppIcon size={15} />
                  <span>Reserve All {selectedRentals.length} Items via WhatsApp</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

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
                onChange={(e) => setSelectedGear(e.target.value)}
                placeholder="e.g. Student Conservatory Violin Outfit, 61-Key Keyboard, PA System"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Your full name"
                required
              />
              <Field
                label="WhatsApp / Phone Number"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="0803 889 0786"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Email Address"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <SelectField
                label="Desired Rental Duration"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                options={[
                  { value: "1 Month", label: "1 Month (Student Practice)" },
                  { value: "3 Months", label: "3 Months (Academic Term)" },
                  { value: "6 Months", label: "6 Months (Semester)" },
                  { value: "12 Months", label: "12 Months (Full Year)" },
                  { value: "1 Day", label: "1 Day (Event / Concert)" },
                  { value: "Weekend (2-3 Days)", label: "Weekend Event (2-3 Days)" },
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
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="e.g. Barnawa Complex, near Market, Kaduna"
                required
              />
            )}

            <Textarea
              label="Additional Notes / Special Requirements"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Specify size (e.g. 1/2 or 4/4 violin), music style, or delivery schedule preferences."
              rows={3}
            />

            <Button type="submit" className="w-full justify-center !py-3">
              <WhatsAppIcon size={18} />
              <span>Submit Rental Request on WhatsApp</span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--muted)] pt-1">
              <Icon name="shield" size={13} className="text-emerald-600" />
              <span>Free calibration · Security caution deposit subject to condition check</span>
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
