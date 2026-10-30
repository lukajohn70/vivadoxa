import { useState } from "react"
import {
  Badge,
  Button,
  Icon,
  PageHero,
  WhatsAppIcon,
} from "@/components/ui"
import { SEO } from "@/components/SEO"
import { WHATSAPP_URL, SCHOOL_PHONE, SCHOOL_ADDRESS } from "@/lib/utils"
import {
  violinImg,
  pianoImg,
  guitarAcousticImg,
  guitarLeadImg,
  saxophoneImg,
  trumpetImg,
  drumsImg,
  fluteImg,
  clarinetImg,
  talkingDrumsImg,
} from "@/lib/data"
import type { Page } from "@/types"

interface ProductItem {
  id: string
  name: string
  category: "Guitars" | "Strings" | "Keys" | "Woodwinds" | "Brass" | "Percussion" | "Accessories"
  price: string
  image: string
  brand: string
  badge?: string
  inStock: boolean
  setupNote: string
  specs: string[]
}

const PRODUCTS: ProductItem[] = [
  {
    id: "yamaha-acoustic-guitar",
    name: "Yamaha F310 Natural Dreadnought Acoustic Guitar",
    category: "Guitars",
    price: "₦95,000",
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
    price: "₦185,000",
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
    price: "₦78,000",
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
    price: "₦240,000",
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
    price: "₦265,000",
    image: saxophoneImg,
    brand: "Jean Paul / Vivadoxa",
    badge: "Conservatory Grade",
    inStock: true,
    setupNote: "All pads vacuum tested for 100% airtight seal; key heights regulated",
    specs: ["Golden brass lacquered body with engraved bell", "Rico 2.5 reed starter pack & neck strap", "Deluxe contoured hard case with backpack straps"],
  },
  {
    id: "silver-flute",
    name: "Eastman / Vivadoxa Nickel Silver C Flute with Split-E",
    category: "Woodwinds",
    price: "₦110,000",
    image: fluteImg,
    brand: "Eastman",
    inStock: true,
    setupNote: "Headjoint cork seal tested and adjusted for effortless upper octave",
    specs: ["Closed-hole plateau keys with Italian leather pads", "Split-E mechanism for easier high E resonance", "Includes French plush case and wood cleaning rod"],
  },
  {
    id: "student-trumpet-bb",
    name: "Bach Prelude Bb Student Brass Trumpet",
    category: "Brass",
    price: "₦145,000",
    image: trumpetImg,
    brand: "Bach Prelude",
    inStock: true,
    setupNote: "Monel valves hand-lapped with fast valve oil; slides aligned",
    specs: ["0.459\" medium-large bore with yellow brass bell", "Genuine Vincent Bach 7C mouthpiece", "Heavy-duty canvas molded protective case"],
  },
  {
    id: "tama-stage-drums",
    name: "TAMA Imperialstar 5-Piece Complete Drum Kit",
    category: "Percussion",
    price: "₦650,000",
    image: drumsImg,
    brand: "TAMA",
    inStock: true,
    setupNote: "Bearing edges checked, heads seated and tuned to pitch",
    specs: ["100% poplar shells with Stage Master double-braced hardware", "Meinl HCS German brass cymbal set (14\" HH, 16\" Crash, 20\" Ride)", "Iron Cobra 200 bass drum pedal and drum throne included"],
  },
  {
    id: "yoruba-talking-drum",
    name: "Authentic Hand-Carved Nigerian Gangan Talking Drum",
    category: "Percussion",
    price: "₦38,000",
    image: talkingDrumsImg,
    brand: "Heritage Art",
    inStock: true,
    setupNote: "Goat skin heads tensioned with genuine leather tuning thongs",
    specs: ["Solid hardwood shell with high pitch flexibility", "Includes curved traditional wooden beater", "Carrying shoulder strap"],
  },
  {
    id: "daddario-strings-pack",
    name: "D'Addario EJ16 Phosphor Bronze Acoustic Guitar Strings",
    category: "Accessories",
    price: "₦8,500",
    image: guitarAcousticImg,
    brand: "D'Addario USA",
    badge: "Essential",
    inStock: true,
    setupNote: "Factory sealed in corrosion-intercept foil pack",
    specs: ["Light gauge (12-53) for balanced warm acoustic tone", "Corrosion resistant packaging", "Preferred by Vivadoxa guitar faculty"],
  },
  {
    id: "vandoren-reeds-sax",
    name: "Vandoren Traditional Eb Alto Saxophone Reeds (Box of 10)",
    category: "Accessories",
    price: "₦32,000",
    image: saxophoneImg,
    brand: "Vandoren Paris",
    badge: "French Import",
    inStock: true,
    setupNote: "Individually sealed in humidity-controlled 'Flow Pack'",
    specs: ["Strength 2.0 / 2.5 / 3.0 available", "Excellent response in all registers", "Pure tone and flexibility"],
  },
  {
    id: "pirastro-rosin",
    name: "Pirastro Goldflex Violin Rosin with Gold Spec Particles",
    category: "Accessories",
    price: "₦14,000",
    image: violinImg,
    brand: "Pirastro Germany",
    inStock: true,
    setupNote: "Mounted on satin cloth with plastic grip",
    specs: ["Infused with fine gold powder for smooth grip", "Reduces dust emission and enhances bow clarity", "Suitable for violin, viola, and cello"],
  },
]

export function Store({ go }: { go: (p: Page) => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

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

  const filteredProducts = PRODUCTS.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const orderProduct = (item: ProductItem) => {
    const msg = `Hello Vivadoxa Store, I would like to purchase the following item:%0A%0A• Product: ${encodeURIComponent(
      item.name,
    )}%0A• Price: ${encodeURIComponent(item.price)}%0A• Category: ${encodeURIComponent(
      item.category,
    )}%0A%0APlease confirm availability and payment/pickup details.`
    window.open(`https://wa.me/2348038890786?text=${msg}`, "_blank")
  }

  return (
    <main>
      <SEO
        title="Vivadoxa Music Store — Musical Instruments, Reeds & Strings | Kaduna"
        description="Shop certified genuine musical instruments, guitars, violins, keyboards, saxophones, Vandoren reeds, and D'Addario strings in Kaduna. Every instrument includes master clinic setup and warranty."
        keywords="musical instrument store kaduna, buy violin kaduna, buy guitar kaduna, buy keyboard kaduna, buy saxophone reeds kaduna, vivadoxa music shop, musical accessories nigeria"
        canonicalUrl="/store"
      />

      <PageHero
        badge="Instrument & Gear Atelier"
        title="Every instrument tested. Every tone perfected."
        lead="We do not just sell boxes. Every violin, guitar, saxophone, and keyboard is unboxed, aligned, intonated, and setup by our master repair clinic technicians before you play your first note."
        actions={
          <>
            <a
              href="#products-section"
              className="btn btn-primary"
            >
              Browse Instrument Catalog <Icon name="arrow" />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-concierge"
            >
              <WhatsAppIcon size={18} />
              <span>Store Order Concierge</span>
            </a>
          </>
        }
      />

      {/* ── Master Clinic Setup Guarantee Banner ──────────────────────── */}
      <section className="bg-white border-b border-[var(--line)] py-8">
        <div className="container">
          <div className="bg-[#FAF8F5] border border-[var(--gold)]/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center shrink-0 border border-[var(--gold)]/20">
                <Icon name="wrench" size={26} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--gold)] block">
                  The Vivadoxa Setup Guarantee
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[var(--navy)] mt-0.5">
                  Pre-Delivered Precision Intonation &amp; Action Adjustment
                </h3>
                <p className="text-xs text-[var(--muted)] max-w-xl mt-1 leading-relaxed">
                  Unlike generic retailers who ship untouched factory inventory, our certified repair technicians inspect
                  every bridge, level frets, seal saxophone pads, and test electronics prior to handover.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <div className="text-center sm:text-right">
                <strong className="block text-sm font-bold text-[var(--navy)]">6-Month Clinic Warranty</strong>
                <small className="text-[11px] text-emerald-700 font-semibold">Free periodic checkup included</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog Filter & Grid ──────────────────────────────────────── */}
      <section className="section bg-[#FAF8F5]" id="products-section">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">Inventory Catalog</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--navy)] mt-1">
                Instruments &amp; Accessories
              </h2>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search instruments, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[var(--line)] shadow-xs focus:outline-none focus:border-[var(--gold)]"
              />
              <span className="absolute left-3 top-2.5 text-[var(--muted)]">
                <Icon name="search" size={14} />
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-[var(--muted)] hover:text-black text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-xl bg-white border border-[var(--line)] shadow-xs w-max max-w-full overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[var(--gold)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[#FAF8F5]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[var(--line)]">
              <Icon name="search" size={32} className="mx-auto text-[var(--muted)] mb-3" />
              <h3 className="text-base font-bold text-[var(--navy)]">No matching items found</h3>
              <p className="text-xs text-[var(--muted)] mt-1 mb-4">
                We can source or special-order any instrument, reed, or accessory you need.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary !text-xs inline-flex"
              >
                Ask Concierge on WhatsApp
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="h-48 relative overflow-hidden bg-slate-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-[var(--gold)] text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[var(--navy)] font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                      {product.brand}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-[var(--gold)] tracking-wider">
                          {product.category}
                        </span>
                        <strong className="text-base font-bold text-[var(--navy)]">{product.price}</strong>
                      </div>

                      <h3 className="font-bold text-sm text-[var(--navy)] leading-snug mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[var(--line)] mb-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--navy)]">
                          <Icon name="wrench" size={12} className="text-[var(--gold)] shrink-0" />
                          <span>Clinic Setup Note:</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{product.setupNote}</p>
                      </div>

                      <ul className="space-y-1 text-[11px] text-slate-500 mb-3">
                        {product.specs.slice(0, 2).map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[var(--gold)]">•</span>
                            <span className="line-clamp-1">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-[var(--line)] mt-auto flex items-center justify-between gap-2">
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In Stock
                      </span>
                      <button
                        type="button"
                        onClick={() => orderProduct(product)}
                        className="btn btn-primary !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
                      >
                        <WhatsAppIcon size={14} />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Custom Sourcing Concierge ─────────────────────────────────── */}
      <section className="section bg-white border-t border-[var(--line)]">
        <div className="container max-w-3xl text-center">
          <span className="eyebrow">Can&apos;t find what you need?</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--navy)] mt-1 mb-3">
            Custom Procurement &amp; Special Orders
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-6">
            Looking for a specific model of Roland stage piano, Selmer Paris saxophone, Vandoren reed strength, or
            custom cello bow? Through our direct verified distribution network in Lagos and the UK, we source genuine
            musical equipment delivered safely to Kaduna.
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary !py-2.5 !px-5"
            >
              <WhatsAppIcon size={18} />
              <span>Contact Gear Concierge</span>
            </a>
            <a
              href={`tel:${SCHOOL_PHONE}`}
              className="btn btn-secondary !py-2.5 !px-5"
            >
              <Icon name="phone" size={15} />
              <span>Call Equipment Desk: {SCHOOL_PHONE}</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
