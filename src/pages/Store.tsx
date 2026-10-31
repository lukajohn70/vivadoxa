import { useState, useEffect } from "react"
import {
  Badge,
  Button,
  Field,
  Icon,
  PageHero,
  Textarea,
  WhatsAppIcon,
} from "@/components/ui"
import { SEO } from "@/components/SEO"
import {
  WHATSAPP_URL,
  SCHOOL_PHONE,
  SCHOOL_EMAIL,
  SCHOOL_ADDRESS,
} from "@/lib/utils"
import {
  violinImg,
  pianoImg,
  guitarAcousticImg,
  guitarLeadImg,
  saxophoneImg,
  trumpetImg,
  drumsImg,
  fluteImg,
  talkingDrumsImg,
} from "@/lib/data"
import { fetchCatalogStore, submitEnquiry } from "@/lib/api"
import { ScrollReveal } from "@/components/ScrollReveal"
import { LazyImage } from "@/components/LazyImage"
import type { Page } from "@/types"

export interface ProductItem {
  id: string
  name: string
  category: "Guitars" | "Strings" | "Keys" | "Woodwinds" | "Brass" | "Percussion" | "Accessories"
  image: string
  brand: string
  badge?: string
  inStock: boolean
  setupNote: string
  specs: string[]
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "yamaha-acoustic-guitar",
    name: "Yamaha F310 Natural Dreadnought Acoustic Guitar",
    category: "Guitars",
    image: guitarAcousticImg,
    brand: "Yamaha",
    badge: "Bestseller",
    inStock: true,
    setupNote: "Fret leveling, low-action string tension adjustment completed",
    specs: ["Spruce top with rosewood fretboard", "Die-cast chrome tuners", "Includes padded gig bag & 3 plectrums"],
  },
  {
    id: "fender-strat-pack",
    name: "Squier by Fender Affinity Stratocaster Electric Guitar",
    category: "Guitars",
    image: guitarLeadImg,
    brand: "Fender",
    inStock: true,
    setupNote: "Truss rod calibrated, intonation set to standard E tuning",
    specs: ["Triple single-coil ceramic pickups", "Synchronized tremolo bridge", "Shielded 3-meter instrument cable included"],
  },
  {
    id: "conservatory-violin-outfit",
    name: "Vivadoxa Master Handcrafted Soloist Violin (4/4 & 3/4)",
    category: "Strings",
    image: violinImg,
    brand: "Vivadoxa Atelier",
    badge: "Faculty Choice",
    inStock: true,
    setupNote: "Bridge carved to correct radius, ebony pegs lubricated with Hill compound",
    specs: ["Seasoned spruce soundboard & flamed maple back", "Brazilwood octagonal horsehair bow", "Lightweight triangular foam case with hygrometer"],
  },
  {
    id: "yamaha-psr-keyboard",
    name: "Yamaha PSR-E373 61-Key Touch-Sensitive Portable Keyboard",
    category: "Keys",
    image: pianoImg,
    brand: "Yamaha",
    badge: "Popular",
    inStock: true,
    setupNote: "Firmware updated, power adapter & key contacts verified",
    specs: ["622 authentic instrument voices with Super Articulation Lite", "Keys touch response for expressive dynamics", "USB-to-HOST audio & MIDI recording interface"],
  },
  {
    id: "eb-alto-sax",
    name: "Jean Paul USA / Vivadoxa Eb Intermediate Alto Saxophone",
    category: "Woodwinds",
    image: saxophoneImg,
    brand: "Jean Paul / Vivadoxa",
    badge: "Conservatory Grade",
    inStock: true,
    setupNote: "All pads vacuum tested for 100% airtight seal; key heights regulated",
    specs: ["Golden brass lacquered body with engraved bell", "Rico 2.5 reed starter pack & neck strap", "Deluxe contoured hard case with backpack straps"],
  },
  {
    id: "silver-flute",
    name: "Yamaha YFL-222 Standard C Concert Flute",
    category: "Woodwinds",
    image: fluteImg,
    brand: "Yamaha",
    inStock: true,
    setupNote: "Headjoint cork seal tested, key cup alignment calibrated",
    specs: ["Nickel silver body with silver-plated finish", "Closed-hole keys with offset G", "Ergonomic key placement for fatigue-free practice"],
  },
  {
    id: "stage-trumpet",
    name: "Bach Prelude Bb Student / Worship Trumpet",
    category: "Brass",
    image: trumpetImg,
    brand: "Bach",
    badge: "Recommended",
    inStock: true,
    setupNote: "Monel pistons hand-lapped; valve slides lubricated with ultra-pure oil",
    specs: [".459 medium-large bore with yellow brass bell", "Genuine Bach 7C mouthpiece included", "Clear lacquer finish with rugged travel case"],
  },
  {
    id: "stage-drum-set",
    name: "Mapex Tornado 5-Piece Complete Acoustic Drum Kit",
    category: "Percussion",
    image: drumsImg,
    brand: "Mapex",
    inStock: true,
    setupNote: "Drum heads tuned to fundamental pitch; hardware tension verified",
    specs: ["Bass drum, 2 rack toms, floor tom & matching snare", "Includes hi-hat & crash/ride cymbals with stands", "Drum throne & 5A hickory sticks included"],
  },
  {
    id: "yoruba-talking-drum",
    name: "Handcrafted Traditional Gangan / Talking Drum",
    category: "Percussion",
    image: talkingDrumsImg,
    brand: "Vivadoxa Folk",
    badge: "Heritage",
    inStock: true,
    setupNote: "Natural goat skin heads conditioned; leather tension cords tuned",
    specs: ["Carved solid hardwood body", "Adjustable leather tension cords", "Curved hardwood beater stick included"],
  },
  {
    id: "daddario-strings",
    name: "D'Addario EJ16 Phosphor Bronze Acoustic Guitar Strings",
    category: "Accessories",
    image: guitarAcousticImg,
    brand: "D'Addario",
    inStock: true,
    setupNote: "Anti-corrosion foil packaging verified authentic",
    specs: ["Light gauge (.012-.053)", "Warm, bright, and balanced acoustic tone", "Precision wound with corrosion-resistant phosphor bronze"],
  },
  {
    id: "keyboard-stand-double-x",
    name: "Heavy-Duty Double-X Keyboard Stand with Lock Pin",
    category: "Accessories",
    image: pianoImg,
    brand: "ProStage",
    inStock: true,
    setupNote: "Welded joint load-tested to 50kg",
    specs: ["5 adjustable height positions", "Non-slip rubber end caps", "Folds flat for compact transport"],
  },
  {
    id: "pirastro-violin-strings",
    name: "Pirastro Tonica Violin String Set (4/4 Ball-End)",
    category: "Accessories",
    image: violinImg,
    brand: "Pirastro",
    inStock: true,
    setupNote: "Authentic German import verified",
    specs: ["Nylon core strings with silver winding", "Lively, open, and round tone", "High tuning stability and humidity resistance"],
  },
]

export function Store({ go }: { go: (p: Page) => void }) {
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Multi-Item Selection State
  const [selectedItems, setSelectedItems] = useState<ProductItem[]>([])
  const [showMultiDrawer, setShowMultiDrawer] = useState(false)

  // Single Item Modal State
  const [singleInquiryProduct, setSingleInquiryProduct] = useState<ProductItem | null>(null)
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<ProductItem | null>(null)

  // Shared Form States
  const [formName, setFormName] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formIntake, setFormIntake] = useState("pickup")
  const [formNotes, setFormNotes] = useState("")

  // Request a Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    phone: "",
    email: "",
    instrumentPlayed: "",
    instrumentNeeded: "",
    budget: "",
    clientType: "Individual Musician",
    notes: "",
  })

  // Load dynamic catalog from database / backend
  useEffect(() => {
    fetchCatalogStore().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setProducts(data as ProductItem[])
      }
    })
  }, [])

  const categories = [
    "All",
    "Guitars",
    "Strings",
    "Keys",
    "Woodwinds",
    "Brass",
    "Percussion",
    "Accessories",
  ]

  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => {
    setVisibleCount(8)
  }, [selectedCategory, searchQuery])

  const displayedProducts = filteredProducts.slice(0, visibleCount)

  // Multi-selection helpers
  const isSelected = (id: string) => selectedItems.some((item) => item.id === id)

  const toggleSelectItem = (item: ProductItem) => {
    if (isSelected(item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const removeSelectedItem = (id: string) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id))
  }

  const clearSelection = () => {
    setSelectedItems([])
    setShowMultiDrawer(false)
  }

  // Quick Direct WhatsApp Inquiry for single item
  const contactViaWhatsApp = (item: ProductItem) => {
    const msg = `Hello Vivadoxa Store, I would like to inquire about purchasing the following item:%0A%0A• Product: ${encodeURIComponent(
      item.name,
    )}%0A• Brand: ${encodeURIComponent(
      item.brand,
    )}%0A• Category: ${encodeURIComponent(
      item.category,
    )}%0A%0APlease let me know the current price, availability, and pickup/delivery options in Kaduna.`
    window.open(`https://wa.me/2348031308881?text=${msg}`, "_blank")
  }

  // Wire MULTIPLE items to Admin via WhatsApp
  const wireMultipleToWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (selectedItems.length === 0) return

    const itemsList = selectedItems
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.name} (${item.brand || "Vivadoxa"} - ${item.category})`,
      )
      .join("%0A")

    const intakeDesc = formIntake === "pickup" ? "Studio Pickup in Kaduna" : "Courier Delivery in Kaduna"

    // Connect to backend database & admin notification
    submitEnquiry({
      fullName: formName || "Store Customer",
      email: formEmail || "",
      phone: formPhone,
      source: "store",
      type: "inquiry",
      subject: `Store Inquiry (${selectedItems.length} items): ${selectedItems.map((i) => i.name).slice(0, 2).join(", ")}`,
      message: `Selected Showcase Items:\n${selectedItems.map((item, i) => `${i + 1}. ${item.name} (${item.brand || "Vivadoxa"} - ${item.category})`).join("\n")}\n\nIntake: ${intakeDesc}\nNotes: ${formNotes || "N/A"}`,
    }).catch(() => {})

    const msg = `Hello Vivadoxa Admin, I would like to purchase the following ${selectedItems.length} items from your showcase:%0A%0A${itemsList}%0A%0ACustomer Details:%0A• Name: ${encodeURIComponent(
      formName || "Customer",
    )}%0A• WhatsApp/Phone: ${encodeURIComponent(
      formPhone || "Not provided",
    )}%0A• Email: ${encodeURIComponent(
      formEmail || "Not provided",
    )}%0A• Intake Preference: ${encodeURIComponent(
      intakeDesc,
    )}%0A• Notes: ${encodeURIComponent(
      formNotes || "Please contact me with price quotes, stock availability, and payment/handover options.",
    )}`

    window.open(`https://wa.me/2348031308881?text=${msg}`, "_blank")
  }

  // Handle single item modal form submit
  const handleSingleModalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const itemName = singleInquiryProduct ? singleInquiryProduct.name : "Musical Instrument"
    const intakeDesc = formIntake === "pickup" ? "Studio Pickup in Kaduna" : "Courier Delivery in Kaduna"

    const msg = `Hello Vivadoxa Store, I am submitting a purchase inquiry:%0A%0A• Product: ${encodeURIComponent(
      itemName,
    )}%0A• Name: ${encodeURIComponent(formName || "Customer")}%0A• WhatsApp/Phone: ${encodeURIComponent(
      formPhone,
    )}%0A• Email: ${encodeURIComponent(formEmail || "Not provided")}%0A• Intake: ${encodeURIComponent(
      intakeDesc,
    )}%0A• Notes: ${encodeURIComponent(formNotes || "Please contact me with price and availability.")}`

    window.open(`https://wa.me/2348031308881?text=${msg}`, "_blank")
  }

  // Handle Request a Quote modal submit
  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Connect to backend database & admin notification
    submitEnquiry({
      fullName: quoteForm.name || "Quote Request",
      email: quoteForm.email || "",
      phone: quoteForm.phone,
      source: "store",
      type: "quote",
      subject: `Store Quote Request: ${quoteForm.instrumentNeeded} (${quoteForm.clientType})`,
      message: `Client Type: ${quoteForm.clientType}\nInstrument Played: ${quoteForm.instrumentPlayed || "N/A"}\nInstrument Needed: ${quoteForm.instrumentNeeded}\nBudget: ${quoteForm.budget || "Flexible"}\nNotes: ${quoteForm.notes || "None"}`,
    }).catch(() => {})

    const msg = `Hello Vivadoxa Store,%0A%0AI would like to request an instrument quotation:%0A%0A• Name: ${encodeURIComponent(
      quoteForm.name,
    )}%0A• Phone/WhatsApp: ${encodeURIComponent(
      quoteForm.phone,
    )}%0A• Email: ${encodeURIComponent(
      quoteForm.email || "Not specified",
    )}%0A• Category/Client: ${encodeURIComponent(
      quoteForm.clientType,
    )}%0A• What I Play: ${encodeURIComponent(
      quoteForm.instrumentPlayed || "Not specified",
    )}%0A• What I Need: ${encodeURIComponent(
      quoteForm.instrumentNeeded,
    )}%0A• Budget Range: ${encodeURIComponent(
      quoteForm.budget || "Flexible",
    )}%0A• Additional Notes: ${encodeURIComponent(
      quoteForm.notes || "Please advise on best options and availability.",
    )}`

    window.open(`https://wa.me/2348031308881?text=${msg}`, "_blank")
    setShowQuoteModal(false)
  }

  return (
    <main className="pb-24">
      <SEO
        title="Vivadoxa Store — Quality Instruments & Audio Equipment | Kaduna"
        description="Find quality musical instruments and audio equipment suited to your needs, skill level, and budget. Keyboards, guitars, violins, drums, wind instruments, and PA systems in Kaduna."
        keywords="musical instrument store kaduna, buy keyboard kaduna, buy guitar kaduna, buy drum set kaduna, buy violin, church audio equipment kaduna, vivadoxa store"
        canonicalUrl="/store"
      />

      <PageHero
        eyebrow="Vivadoxa Instrument & Audio Store"
        title="Quality Instruments. Exceptional Possibilities."
        body="Browse our showroom of vetted keyboards, guitars, violins, drums, and church audio equipment in Kaduna. Choose single or multiple items to wire directly to admin with technician setup guarantee."
        actions={
          <>
            <a href="#products-section" className="btn btn-primary inline-flex items-center gap-2">
              Browse Showroom <Icon name="arrow" size={14} />
            </a>
            <button
              type="button"
              onClick={() => setShowQuoteModal(true)}
              className="btn-concierge cursor-pointer"
            >
              Request a Quote &rarr;
            </button>
            <a
              href="https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Store,%20I%20would%20like%20to%20speak%20with%20your%20sales%20team%20about%20an%20instrument%20purchase."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-concierge inline-flex items-center gap-2"
            >
              <WhatsAppIcon size={16} /> Sales WhatsApp
            </a>
          </>
        }
      />

      {/* ── Contact Channels Bar ────────────────────────────────────────── */}
      <section className="bg-white border-b border-[var(--line)] py-4">
        <div className="container flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--gold)] animate-pulse" />
            <strong className="text-[var(--navy)] font-bold">Personalized Gear Advisory:</strong>
            <span className="text-[var(--muted)]">
              Every instrument is unboxed, inspected, and set up by our master clinic before handover.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Store,%20I%20have%20an%20instrument%20sales%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--gold-text)] font-bold hover:underline"
            >
              <WhatsAppIcon size={14} />
              <span>WhatsApp: 0803 130 8881</span>
            </a>

            <a
              href={`mailto:${SCHOOL_EMAIL}?subject=Instrument%20Purchase%20Inquiry`}
              className="inline-flex items-center gap-1.5 text-[var(--navy)] font-semibold hover:text-[var(--gold)]"
            >
              <Icon name="mail" size={13} />
              <span>{SCHOOL_EMAIL}</span>
            </a>

            <a
              href={`tel:${SCHOOL_PHONE}`}
              className="inline-flex items-center gap-1.5 text-[var(--navy)] font-semibold hover:text-[var(--gold)]"
            >
              <Icon name="phone" size={13} />
              <span>Call: {SCHOOL_PHONE}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── 1. What We Offer (Standardized Categories) ─────────────────── */}
      <section className="section bg-white" id="what-we-offer">
        <div className="container">
          <ScrollReveal direction="left">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="eyebrow">Inventory &amp; Sourcing</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
              What We <em>Offer</em>
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              Carefully curated instruments, accessories, and professional audio gear suited to beginners, churches, institutions, and seasoned musicians.
            </p>
          </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category 1: Keyboards & Pianos */}
            <ScrollReveal direction="up" delay={0} className="h-full">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#faf8f5] border border-[var(--line)] flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                  Keyboard and Piano Equipment
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                  Full-range digital pianos, stage synthesizers, portable practice keyboards, and heavy-duty staging accessories.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Digital keyboards (61 &amp; 76 keys)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Digital pianos (88 weighted hammer action)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Heavy-duty keyboard stands &amp; benches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Sustain pedals &amp; power adapters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Padded carry bags &amp; dust covers</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-5 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("Keys")
                    const el = document.getElementById("products-section")
                    if (el) el.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-xs font-bold text-[var(--gold-text)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Explore Keyboard Catalog &rarr;
                </button>
              </div>
            </div>
            </ScrollReveal>

            {/* Category 2: Drums & Percussion */}
            <ScrollReveal direction="up" delay={70} className="h-full">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#faf8f5] border border-[var(--line)] flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                  Drums and Percussion
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                  Dynamic rhythm setups for worship sanctuaries, rehearsal spaces, concert stages, and home practice.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Acoustic 5-piece &amp; 6-piece drum sets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Electronic drums (mesh heads, where available)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Cymbals (Hi-hats, Crash, Ride packs)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Hickory &amp; maple drumsticks (5A, 5B, 7A)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Percussion accessories, thrones &amp; practice pads</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-5 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("Percussion")
                    const el = document.getElementById("products-section")
                    if (el) el.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-xs font-bold text-[var(--gold-text)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Explore Drums &amp; Percussion &rarr;
                </button>
              </div>
            </div>
            </ScrollReveal>

            {/* Category 3: Guitars & String Instruments */}
            <ScrollReveal direction="up" delay={140} className="h-full">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#faf8f5] border border-[var(--line)] flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                  Guitars and String Instruments
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                  Carefully intonated fretted and bowed instruments with low-action setups adjusted before handover.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Acoustic &amp; classical nylon-string guitars</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Electric guitars (Stratocaster &amp; Telecaster styles)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Bass guitars (4-string &amp; 5-string active/passive)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Violins (Full 4/4, 3/4 &amp; 1/2 fractional sizes)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Strings, capos, straps &amp; gig bags</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-5 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("Guitars")
                    const el = document.getElementById("products-section")
                    if (el) el.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-xs font-bold text-[var(--gold-text)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Explore Guitars &amp; Strings &rarr;
                </button>
              </div>
            </div>
            </ScrollReveal>

            {/* Category 4: Wind & Brass Instruments */}
            <ScrollReveal direction="up" delay={210} className="h-full">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#faf8f5] border border-[var(--line)] flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                  04
                </div>
                <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                  Wind and Brass Instruments
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                  Airtight, pad-tested saxophones, trumpets, and orchestral winds ready for brass bands and soloists.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Saxophones (Alto Eb, Tenor Bb, Soprano)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Trumpets &amp; cornets for worship &amp; classical play</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Concert flutes &amp; clarinets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Mouthpieces, ligatures &amp; Vandoren/Rico reeds</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Other wind and brass instruments, subject to availability</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-5 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("Woodwinds")
                    const el = document.getElementById("products-section")
                    if (el) el.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-xs font-bold text-[var(--gold-text)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Explore Wind &amp; Brass &rarr;
                </button>
              </div>
            </div>
            </ScrollReveal>

            {/* Category 5: Professional Audio Equipment */}
            <ScrollReveal direction="up" delay={280} className="h-full">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#faf8f5] border border-[var(--line)] flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                  05
                </div>
                <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                  Professional Audio Equipment
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                  Robust, crystal-clear sound reinforcement gear for churches, auditoriums, studios, and outdoor events.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Microphones (Vocal dynamic, condenser &amp; wireless mics)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Speakers and powered PA systems</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Audio mixers (Analog &amp; digital consoles)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Power amplifiers &amp; studio reference monitors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>XLR cables, snake boxes &amp; audio adapters</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-5 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="text-xs font-bold text-[var(--gold-text)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Request Audio Equipment Quote &rarr;
                </button>
              </div>
            </div>
            </ScrollReveal>

            {/* Category 6: Music Accessories */}
            <ScrollReveal direction="up" delay={350} className="h-full">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#faf8f5] border border-[var(--line)] flex flex-col justify-between hover:border-[var(--gold)] hover:shadow-md transition-all h-full">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm mb-4">
                  06
                </div>
                <h3 className="text-xl font-serif text-[var(--navy)] mb-2 font-bold">
                  Music Accessories &amp; Sourcing
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                  We help customers source essential accessories and equipment for practice, rehearsals, recording, worship, and live performances.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Electronic chromatic clip-on tuners &amp; metronomes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Heavy-duty folding sheet music stands</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Instrument care oils, polishes &amp; swab cloths</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Hard cases, foam gig bags &amp; instrument stands</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Custom special order sourcing via Lagos &amp; UK</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-5 border-t border-[var(--line)]">
                <span className="text-[11px] text-[var(--muted)] block italic">
                  * Products and availability vary. Contact us to confirm current stock, specifications, and prices.
                </span>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 2. Who We Serve & Why Buy from Vivadoxa ────────────────────── */}
      <section className="section bg-[#FAF8F5] border-t border-b border-[var(--line)]">
        <div className="container">
          <ScrollReveal direction="left">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="eyebrow">The Vivadoxa Advantage</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
              Serving Musicians with <em>Integrity &amp; Purpose</em>
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              We understand that every musician has different needs. Our goal is to help you choose equipment that delivers lasting value and supports your musical development.
            </p>
          </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Who We Serve */}
            <ScrollReveal direction="left" className="h-full">
            <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[var(--line)] shadow-xs flex flex-col justify-between h-full">
              <div>
                <span className="eyebrow block mb-2">Our Community</span>
                <h3 className="text-2xl sm:text-3xl font-serif text-[var(--navy)] mb-4 font-bold">
                  Who We Serve
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] mb-6 leading-relaxed">
                  From aspiring novices taking their very first lesson to major auditoriums and production studios, we supply reliable equipment suited to every performance environment:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm text-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Individual musicians</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Music students &amp; beginners</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Schools &amp; educational institutions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Churches &amp; worship centres</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Bands &amp; entertainment companies</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Recording studios &amp; producers</span>
                  </div>
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Event organisers &amp; audio rental agencies</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-8 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Need bulk procurement or institutional pricing?</span>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="text-xs font-bold text-[var(--gold-text)] hover:underline"
                >
                  Request Institutional Quote &rarr;
                </button>
              </div>
            </div>
            </ScrollReveal>

            {/* Why Buy from Vivadoxa? */}
            <ScrollReveal direction="right" delay={120} className="h-full">
            <div className="p-8 sm:p-10 rounded-2xl bg-[var(--navy)] text-white shadow-xs flex flex-col justify-between h-full">
              <div>
                <span className="eyebrow !text-[var(--gold2)] block mb-2">Our Value Proposition</span>
                <h3 className="text-2xl sm:text-3xl font-serif text-white mb-4 font-bold">
                  Why Buy from Vivadoxa?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  We understand that every musician has different needs. Our goal is to help you choose equipment that delivers value, suits your intended use, and supports your musical development.
                </p>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <strong className="block text-white text-xs sm:text-sm font-bold mb-1">
                      1. Expert Musical Consultation
                    </strong>
                    <span className="text-xs text-slate-300 leading-relaxed block">
                      We do not push unsold inventory. We consult on your musical style, church size, or child&apos;s physical stature to select the perfect model.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <strong className="block text-white text-xs sm:text-sm font-bold mb-1">
                      2. Master Clinic Setup Guarantee
                    </strong>
                    <span className="text-xs text-slate-300 leading-relaxed block">
                      Every violin is soundpost-aligned, every guitar action is lowered, and sax pads are vacuum-checked before handover.
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <strong className="block text-white text-xs sm:text-sm font-bold mb-1">
                      3. Dedicated Post-Sale Service Centre
                    </strong>
                    <span className="text-xs text-slate-300 leading-relaxed block">
                      Backed by our in-house repairs &amp; maintenance workshop in Kaduna for periodic tune-ups, spare parts, and warranty care.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-8 border-t border-white/10">
                <p className="text-xs text-[var(--gold2)] font-semibold m-0">
                  The right instrument. The right guidance. The right sound.
                </p>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 3. Active Showcase Catalog (Interactive Filter & Multi-Select) ── */}
      <section className="section bg-white" id="products-section">
        <div className="container">
          <ScrollReveal direction="left">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <span className="eyebrow">Product Showcase</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
              Browse Our <em>Instruments &amp; Gear</em>
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              Select one or multiple items using the checkbox on each card, or contact our sales team to confirm current stock, specifications, and prices.
            </p>
          </div>
          </ScrollReveal>

          {/* Search & Category Filter */}
          <ScrollReveal direction="up" delay={50}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[var(--gold)] text-white shadow-xs"
                      : "bg-[#faf8f5] text-[var(--navy)] border border-[var(--line)] hover:border-[var(--gold)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search models, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2 pl-8 pr-3 rounded-lg border border-[var(--line)] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[var(--gold)] transition-all"
              />
              <span className="absolute left-2.5 top-2.5 text-slate-400">
                <Icon name="search" size={13} />
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          </ScrollReveal>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF8F5] rounded-2xl border border-[var(--line)]">
              <Icon name="search" size={32} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-[var(--navy)]">No instruments match your criteria</h3>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
                We regularly procure specialized instruments. Contact our sales team or request a quote for custom sourcing.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedCategory("All")
                  setSearchQuery("")
                }}
                className="mt-4 !text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product, idx) => {
                const checked = isSelected(product.id)
                return (
                  <ScrollReveal
                    key={product.id}
                    direction="up"
                    delay={(idx % 4) * 50}
                    className="h-full"
                  >
                  <div
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group hover:shadow-md h-full ${
                      checked
                        ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/20 shadow-md"
                        : "border-[var(--line)] hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {/* Image Frame with Badge & Checkbox */}
                      <div className="relative aspect-4/3 bg-[#FAF8F5] overflow-hidden">
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          fallbackSrc="/media/programs/guitar-acoustic-recital.jpeg"
                          className="group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                          {product.badge && (
                            <span className="bg-[var(--gold)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                              {product.badge}
                            </span>
                          )}
                          <span className="bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                            {product.brand}
                          </span>
                        </div>

                        {/* Multi-Select Checkbox */}
                        <label
                          className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-md bg-white/90 backdrop-blur-xs border border-slate-300 flex items-center justify-center cursor-pointer shadow-xs hover:bg-white"
                          title="Select to add to multi-item inquiry"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectItem(product)}
                            className="sr-only"
                          />
                          {checked && (
                            <span className="w-3.5 h-3.5 rounded-xs bg-[var(--gold)] flex items-center justify-center text-white text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </label>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gold)] block mb-1">
                          {product.category}
                        </span>
                        <h4
                          onClick={() => setSelectedDetailProduct(product)}
                          className="font-bold text-sm sm:text-base text-[var(--navy)] leading-snug mb-2 hover:text-[var(--gold)] cursor-pointer line-clamp-2"
                        >
                          {product.name}
                        </h4>

                        <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[var(--line)] mb-3">
                          <span className="text-[10px] uppercase font-bold text-slate-700 block">
                            Atelier Setup:
                          </span>
                          <p className="text-[11px] text-[var(--muted)] m-0 leading-tight">
                            {product.setupNote}
                          </p>
                        </div>

                        <ul className="space-y-1 mb-2">
                          {product.specs.slice(0, 2).map((s, specIdx) => (
                            <li key={specIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-tight">
                              <span className="text-[var(--gold)] shrink-0">•</span>
                              <span className="line-clamp-1">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 sm:p-5 pt-0 border-t border-[var(--line)] mt-2">
                      <div className="flex items-center justify-between gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailProduct(product)}
                          className="text-xs font-semibold text-[var(--navy)] hover:text-[var(--gold)] cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => contactViaWhatsApp(product)}
                          className="btn btn-secondary !py-1.5 !px-3 !text-xs !min-h-0 inline-flex items-center gap-1.5 hover:!border-[var(--gold)]"
                        >
                          <WhatsAppIcon size={13} />
                          <span>Inquire</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  </ScrollReveal>
                )
              })}
            </div>

            {filteredProducts.length > visibleCount && (
              <div className="text-center mt-12">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="btn btn-secondary !py-3 !px-8 text-xs font-bold inline-flex items-center gap-2 shadow-xs hover:border-[var(--gold)] cursor-pointer"
                >
                  <span>View More Instruments ({filteredProducts.length - visibleCount} more)</span>
                  <Icon name="arrow" size={13} className="rotate-90" />
                </button>
              </div>
            )}

            {visibleCount >= filteredProducts.length && filteredProducts.length > 8 && (
              <div className="text-center mt-12 flex items-center justify-center gap-3">
                <span className="text-xs text-[var(--muted)]">
                  Showing all {filteredProducts.length} showroom instruments
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVisibleCount(8)
                    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="text-xs font-bold text-[var(--gold)] hover:underline cursor-pointer"
                >
                  Show Less ↑
                </button>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* ── 4. Find Your Perfect Sound (Call to Action Section) ────────── */}
      <section className="py-16 sm:py-24 bg-[var(--navy)] text-white relative overflow-hidden">
        <ScrollReveal direction="up">
        <div className="container max-w-4xl text-center relative z-10">
          <span className="eyebrow !text-[var(--gold2)] mb-3 block">Bespoke Procurement</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight leading-[1.15] mb-4">
            Find Your <em>Perfect Sound</em>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-3 leading-relaxed">
            Tell us what you play, what you need, and your budget. Our team can help you explore suitable options.
          </p>
          <p className="text-sm font-semibold text-[var(--gold2)] tracking-wide mb-8">
            The right instrument. The right guidance. The right sound.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#what-we-offer" className="btn btn-primary">
              Browse Our Instruments <Icon name="arrow" size={14} />
            </a>
            <button
              type="button"
              onClick={() => setShowQuoteModal(true)}
              className="btn btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20 cursor-pointer"
            >
              Request a Quote &rarr;
            </button>
            <a
              href="https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Sales%20Team,%20I%20would%20like%20guidance%20on%20choosing%20an%20instrument."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary !bg-[var(--gold)]/20 !text-[var(--gold2)] !border-[var(--gold)]/30 hover:!bg-[var(--gold)]/30 inline-flex items-center gap-2"
            >
              <WhatsAppIcon size={16} /> Contact Our Sales Team
            </a>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* ── STICKY MULTI-ITEM INQUIRY BAR (Floating Bottom) ───────────── */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--navy)] text-white py-3 px-4 shadow-2xl border-t border-[var(--gold)] animate-in slide-in-from-bottom">
          <div className="container max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--gold)] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {selectedItems.length}
              </span>
              <div>
                <strong className="text-xs sm:text-sm font-bold block text-white">
                  {selectedItems.length} {selectedItems.length === 1 ? "Instrument" : "Instruments"} Selected
                </strong>
                <span className="text-[11px] text-slate-300">
                  Ready to wire list directly to Vivadoxa Administration
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs text-slate-300 hover:text-white px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowMultiDrawer(true)}
                className="btn btn-primary !py-2 !px-4 !text-xs !min-h-0 flex items-center gap-1.5"
              >
                <WhatsAppIcon size={14} />
                <span>Wire to Admin &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MULTI-ITEM INQUIRY MODAL / DRAWER ─────────────────────────── */}
      {showMultiDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--line)] p-6 sm:p-7 relative">
            <button
              type="button"
              onClick={() => setShowMultiDrawer(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <Icon name="close" size={18} />
            </button>

            <div className="mb-4">
              <span className="eyebrow block mb-1">Multi-Item Inquiry</span>
              <h3 className="font-bold text-base sm:text-xl text-[var(--navy)]">
                Wire {selectedItems.length} Selected Items to Admin
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Confirm your selected gear. Our administration will contact you with availability and delivery details.
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[var(--line)] mb-5 max-h-40 overflow-y-auto space-y-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-0">
                  <div className="flex items-center gap-2 pr-2">
                    <span className="text-[var(--gold)] font-bold">•</span>
                    <span className="font-semibold text-[var(--navy)]">{item.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedItem(item.id)}
                    className="text-[var(--muted)] hover:text-[var(--gold)] text-xs shrink-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={wireMultipleToWhatsApp} className="space-y-3.5">
              <Field
                label="Your Full Name *"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Samuel Adekunle"
                required
              />

              <Field
                label="WhatsApp / Phone Number *"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. 0801 234 5678"
                required
              />

              <Field
                label="Email Address (Optional)"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. samuel@example.com"
              />

              <div>
                <label className="block text-xs font-bold text-[var(--navy)] mb-1">
                  Collection Preference:
                </label>
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
                    Studio Pickup (Kaduna)
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
                    Courier Delivery (Kaduna)
                  </button>
                </div>
              </div>

              <Textarea
                label="Questions or Requirements"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Ask about discounts, payment options, or setup preferences."
                rows={2}
              />

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="flex-1 justify-center !py-2.5 !text-xs">
                  <WhatsAppIcon size={15} />
                  <span>Send via WhatsApp</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REQUEST A QUOTE MODAL ─────────────────────────────────────── */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--line)] p-6 sm:p-7 relative">
            <button
              type="button"
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <Icon name="close" size={18} />
            </button>

            <div className="mb-5">
              <span className="eyebrow block mb-1">Vivadoxa Store Advisory</span>
              <h3 className="font-bold text-lg sm:text-2xl font-serif text-[var(--navy)]">
                Request an Instrument <em>Quote</em>
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                Tell us what you play, what you need, and your budget. Our sales team will prepare tailored options.
              </p>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-3.5">
              <Field
                label="Full Name *"
                value={quoteForm.name}
                onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                placeholder="e.g. Pastor David Emmanuel"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Phone / WhatsApp Number *"
                  value={quoteForm.phone}
                  onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                  placeholder="e.g. 0803 130 8881"
                  required
                />
                <Field
                  label="Email (Optional)"
                  type="email"
                  value={quoteForm.email}
                  onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                  placeholder="e.g. david@church.ng"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--navy)] mb-1">
                  Who Are You Buying For?
                </label>
                <select
                  value={quoteForm.clientType}
                  onChange={(e) => setQuoteForm({ ...quoteForm, clientType: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[var(--line)] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[var(--gold)]"
                >
                  <option value="Individual Musician">Individual Musician / Personal Use</option>
                  <option value="Music Student">Music Student / Beginner</option>
                  <option value="Church / Worship Centre">Church / Worship Centre</option>
                  <option value="School / Educational Institution">School / Educational Institution</option>
                  <option value="Band / Entertainment Company">Band / Entertainment Company</option>
                  <option value="Recording Studio / Producer">Recording Studio / Producer</option>
                  <option value="Event Organiser">Event Organiser / Rental Service</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="What Instrument Do You Play?"
                  value={quoteForm.instrumentPlayed}
                  onChange={(e) => setQuoteForm({ ...quoteForm, instrumentPlayed: e.target.value })}
                  placeholder="e.g. Keyboard, Bass, Sax"
                />
                <Field
                  label="Budget Range (NGN)"
                  value={quoteForm.budget}
                  onChange={(e) => setQuoteForm({ ...quoteForm, budget: e.target.value })}
                  placeholder="e.g. ₦150,000 - ₦300,000"
                />
              </div>

              <Field
                label="What Equipment / Instrument Do You Need? *"
                value={quoteForm.instrumentNeeded}
                onChange={(e) => setQuoteForm({ ...quoteForm, instrumentNeeded: e.target.value })}
                placeholder="e.g. Yamaha PSR keyboard + double-x stand + sustain pedal"
                required
              />

              <Textarea
                label="Specific Notes, Brand Preferences, or Questions"
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                placeholder="Tell us if you need delivery in Kaduna, sound check recommendations, etc."
                rows={3}
              />

              <div className="pt-2">
                <Button type="submit" className="w-full justify-center !py-2.5 !text-xs">
                  <WhatsAppIcon size={15} />
                  <span>Submit Quote Request to Sales Team</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SINGLE PRODUCT DETAIL MODAL ───────────────────────────────── */}
      {selectedDetailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--line)] p-6 relative">
            <button
              type="button"
              onClick={() => setSelectedDetailProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <Icon name="close" size={18} />
            </button>

            <div className="aspect-16/9 bg-[#FAF8F5] rounded-xl overflow-hidden mb-4">
              <img
                src={selectedDetailProduct.image}
                alt={selectedDetailProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge tone="gold">{selectedDetailProduct.category}</Badge>
                <span className="text-xs text-[var(--muted)] font-medium">Brand: {selectedDetailProduct.brand}</span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-[var(--navy)]">
                {selectedDetailProduct.name}
              </h3>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[var(--line)] mb-4">
              <strong className="text-xs font-bold text-[var(--navy)] block mb-1">
                Vivadoxa Workshop Inspection:
              </strong>
              <p className="text-xs text-[var(--muted)] leading-relaxed m-0">
                {selectedDetailProduct.setupNote}
              </p>
            </div>

            <div className="mb-5">
              <strong className="text-xs font-bold text-[var(--navy)] block mb-1.5">
                Included Specifications &amp; Accessories:
              </strong>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedDetailProduct.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  toggleSelectItem(selectedDetailProduct)
                  setSelectedDetailProduct(null)
                }}
                className={`btn btn-secondary !py-2 !px-4 !text-xs cursor-pointer ${
                  isSelected(selectedDetailProduct.id) ? "!border-[var(--gold)] !text-[var(--gold)]" : ""
                }`}
              >
                {isSelected(selectedDetailProduct.id) ? "✓ Added to Selection" : "+ Select for Multi-Order"}
              </button>

              <button
                type="button"
                onClick={() => {
                  contactViaWhatsApp(selectedDetailProduct)
                  setSelectedDetailProduct(null)
                }}
                className="btn btn-primary !py-2 !px-4 !text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <WhatsAppIcon size={14} />
                <span>Inquire on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
