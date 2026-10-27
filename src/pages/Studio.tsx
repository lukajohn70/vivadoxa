import { useState } from "react"
import {
  Badge,
  Button,
  Icon,
  PageHero,
  SectionHead,
  WhatsAppIcon,
} from "@/components/ui"
import { SEO } from "@/components/SEO"
import {
  studioImg,
  studioEngineeringImg,
  soundEngineeringImg,
  drumsImg,
  pianoImg,
} from "@/lib/data"
import { WHATSAPP_URL, SCHOOL_ADDRESS } from "@/lib/utils"
import type { Page } from "@/types"

const STUDIO_SERVICES = [
  {
    id: "tracking",
    title: "Multi-Track Recording & Vocal Booths",
    desc: "Acoustically treated vocal and instrumental isolation booths. Equipped with studio condenser microphones, ultra-clean preamps, and dedicated multi-channel monitor mixes for clean, noise-free capture.",
    image: studioEngineeringImg,
    badge: "Audio Tracking",
    features: [
      "Treated vocal isolation booth with high-grade pop filtration",
      "Large-diaphragm condenser & dynamic studio mics",
      "Zero-latency multi-channel headphone monitoring",
      "Acoustic instruments and solo voice tracking",
    ],
  },
  {
    id: "production",
    title: "Music Production, Mixing & Mastering",
    desc: "Bring your musical concepts to life. Our production team blends analog warmth with digital precision across gospel, classical, Afrobeats, jazz, and cinematic arrangements.",
    image: soundEngineeringImg,
    badge: "Audio Engineering",
    features: [
      "Industry-standard DAWs: Logic Pro, Pro Tools, Cubase, FL Studio",
      "Precision stem mixing, spectral EQ, dynamic compression & analog saturation",
      "Radio-ready, streaming-compliant mastering (-14 LUFS standard)",
      "Arrangement consultation and beat programming",
    ],
  },
  {
    id: "rehearsal",
    title: "Live Band & Ensemble Rehearsal Studio",
    desc: "A spacious, sound-dampened rehearsal facility designed for worship teams, gigging bands, chamber ensembles, and solo instrumentalists preparing for concerts or tours.",
    image: studioImg,
    badge: "Rehearsal Suites",
    features: [
      "Full 5-piece acoustic drum kit with premium cymbals & dampening",
      "Bass and lead guitar combo amplifier stacks",
      "88-key weighted action digital piano & synthesizer workstation",
      "Multi-channel PA system with stage floor monitors and wireless mics",
    ],
  },
  {
    id: "recitals",
    title: "Recital & Audition Audio-Visual Capture",
    desc: "Document your musical milestones. We provide high-fidelity multi-track audio capture coupled with multi-angle 4K video recording for conservatory auditions, competitions, and recital archives.",
    image: drumsImg,
    badge: "Live Recording",
    features: [
      "Multi-camera 4K video coverage synced to studio multitrack audio",
      "Professional color grading and balanced sound mastering",
      "Audition-ready digital portfolio packages (ABRSM / MUSON / Berklee)",
      "Archival recital records for students and choirs",
    ],
  },
]

const STUDIO_RATES = [
  {
    name: "Band Rehearsal Suite",
    rate: "₦10,000",
    unit: "per hour (min 2 hours)",
    description:
      "Full access to our acoustically treated rehearsal space, backline gear, drum kit, guitar amps, and PA system.",
    includes: [
      "Acoustic drum kit with hardware & cymbals",
      "Keyboard workstation & guitar amplifiers",
      "Vocal microphones & PA monitor system",
      "Air-conditioned private studio hall",
    ],
    popular: false,
  },
  {
    name: "Vocal & Solo Tracking",
    rate: "₦25,000",
    unit: "per 3-hour session",
    description:
      "Dedicated vocal or instrumental recording session with a professional sound engineer guiding your takes.",
    includes: [
      "Treated vocal isolation booth",
      "Professional audio engineer included",
      "Raw stem export & rough mix review",
      "High-end condenser microphone chain",
    ],
    popular: true,
  },
  {
    name: "Full Song Production",
    rate: "₦75,000",
    unit: "per complete track",
    description:
      "End-to-end music production from instrumental arrangement, vocal recording, professional mixing, and final mastering.",
    includes: [
      "Custom beat/instrumental arrangement",
      "Up to 6 hours vocal tracking time",
      "Full stem mixdown & digital mastering",
      "WAV, MP3, and instrumental performance track",
    ],
    popular: false,
  },
]

const STUDIO_FAQS = [
  {
    q: "How do I book a music studio or rehearsal session at Vivadoxa?",
    a: "You can book directly via WhatsApp or by calling our studio desk at +234 907 533 0330. We recommend reserving your slot at least 24 to 48 hours in advance to guarantee studio room availability.",
  },
  {
    q: "Can I bring my own audio engineer or music producer?",
    a: "Yes! Outside audio engineers and producers are welcome to run sessions in our tracking rooms. An in-house studio tech will be present to handle routing, monitor mixing, and hardware patching.",
  },
  {
    q: "What instruments and backline equipment are provided in the rehearsal room?",
    a: "Our rehearsal suite comes fully equipped with a 5-piece acoustic drum kit, 88-key weighted digital piano, bass amplifier, guitar amplifier, vocal microphones with boom stands, and a multi-channel PA mixer with floor wedges.",
  },
  {
    q: "Do you offer sound engineering and music production courses?",
    a: "Yes. Vivadoxa offers 3-Month, 6-Month, and 1-Year Diploma courses in Studio Sound Engineering and Digital Music Production covering DAWs, mixing consoles, acoustics, microphone placement, and mastering.",
  },
]

export function Studio({ go }: { go: (p: Page) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const studioSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EntertainmentBusiness"],
    name: "Vivadoxa Music Studio & Recording Facility",
    alternateName: "Vivadoxa Recording Studio Kaduna",
    description:
      "Professional music recording studio, live band rehearsal space, vocal tracking booth, audio mixing & mastering, and sound engineering academy in Kaduna, Nigeria.",
    url: "https://vivadoxa.ng/studio",
    telephone: "+2349075330330",
    address: {
      "@type": "PostalAddress",
      streetAddress: "No. 49B Umaru Ibrahim Street, Angwan Sunday",
      addressLocality: "Kaduna",
      addressRegion: "Kaduna State",
      addressCountry: "NG",
    },
    priceRange: "₦10,000 - ₦150,000",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: STUDIO_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <main>
      <SEO
        title="Music Studio Kaduna — Professional Recording, Rehearsal & Production"
        description="Book Vivadoxa Music Studio in Kaduna for pristine vocal tracking, live band rehearsals, multi-track audio recording, mixing, mastering & sound engineering."
        keywords="music studio, music studio kaduna, recording studio kaduna, rehearsal studio kaduna, audio mixing studio, sound engineering kaduna, music production studio, vocal recording booth"
        canonicalUrl="/studio"
        ogImage="/media/studio/multi-instrument-lab.jpeg"
        schema={[studioSchema, faqSchema]}
      />

      <PageHero
        eyebrow="State-of-the-Art Music Studio"
        title="Where sound meets perfection."
        body="Kaduna's premier music recording and rehearsal studio. Built for musicians, choirs, producers, and students who demand acoustic clarity, pristine tracking, and professional audio engineering."
        image={studioEngineeringImg}
      />

      {/* ── Studio Capabilities & Services ─────────────────────────────────── */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <SectionHead
            eyebrow="Studio Services"
            title="Complete Acoustic & Audio Production Solutions"
            body="From tracking your first vocal demo to rehearsing a full concert set, our facility provides the exact environment, instruments, and equipment required to produce world-class music."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {STUDIO_SERVICES.map((srv) => (
              <article
                key={srv.id}
                className="rounded-2xl border border-[var(--line)] bg-[#faf8f5] overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="h-60 sm:h-72 w-full overflow-hidden relative bg-[#0a192f]">
                  <img
                    src={srv.image}
                    alt={`${srv.title} at Vivadoxa Music Studio Kaduna`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-4 left-4 bg-[var(--navy)]/90 backdrop-blur text-[var(--gold2)] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border border-[var(--gold)]/30">
                    {srv.badge}
                  </span>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif text-[var(--navy)] mb-3">
                      {srv.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">
                      {srv.desc}
                    </p>
                    <ul className="space-y-2.5 mb-6">
                      {srv.features.map((feat, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-700 flex items-start gap-2.5 leading-snug"
                        >
                          <span className="text-[var(--gold)] font-bold text-sm shrink-0">
                            ✓
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
                    <a
                      href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20would%20like%20to%20inquire%20about%20booking%20the%20${encodeURIComponent(srv.title)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                    >
                      <WhatsAppIcon size={16} />
                      <span>Book Session</span>
                    </a>
                    <button
                      onClick={() => go("contact")}
                      className="text-xs font-semibold text-[var(--navy)] hover:text-[var(--gold)] transition-colors"
                    >
                      Studio Tour &rarr;
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Studio Pricing & Session Tiers ─────────────────────────────────── */}
      <section
        className="section"
        style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div className="container">
          <SectionHead
            eyebrow="Rates & Packages"
            title="Transparent Studio Booking Rates"
            body="Flexible studio time packages for solo artists, ensembles, and music producers. All sessions include studio access and in-house technical support."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {STUDIO_RATES.map((tier) => (
              <div
                key={tier.name}
                className={`p-6 sm:p-8 rounded-2xl flex flex-col justify-between transition-all ${
                  tier.popular
                    ? "bg-white border-2 border-[var(--gold)] shadow-lg relative -translate-y-1"
                    : "bg-white border border-[var(--line)] shadow-xs"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-6 bg-[var(--gold)] text-[var(--navy)] text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                    Most Booked
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-serif text-[var(--navy)] mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mb-5">
                    {tier.description}
                  </p>

                  <div className="bg-[#faf8f5] p-4 rounded-xl border border-[var(--line)] mb-6">
                    <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider block">
                      Session Fee
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <strong className="text-3xl font-serif text-[var(--navy)]">
                        {tier.rate}
                      </strong>
                    </div>
                    <span className="text-xs text-slate-500 font-medium block mt-1">
                      {tier.unit}
                    </span>
                  </div>

                  <strong className="text-xs uppercase font-bold text-[var(--navy)] tracking-wider block mb-3">
                    Package Inclusions:
                  </strong>
                  <ul className="space-y-2.5 mb-8">
                    {tier.includes.map((inc, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-700 flex items-start gap-2.5"
                      >
                        <span className="text-[var(--gold)] font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20want%20to%20reserve%20a%20slot%20for%20${encodeURIComponent(tier.name)}%20(${encodeURIComponent(tier.rate)}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn w-full justify-center text-xs sm:text-sm font-bold min-h-[44px] ${
                    tier.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  <WhatsAppIcon size={18} />
                  <span>Reserve Studio Slot</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Studio Technical Gear & Environment ────────────────────────────── */}
      <section
        className="section"
        style={{ background: "white", borderTop: "1px solid var(--line)" }}
      >
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge tone="gold">Acoustic Specs &amp; Gear</Badge>
              <h2 className="text-3xl sm:text-4xl font-serif text-[var(--navy)] mt-3 mb-5">
                Engineered for pristine acoustic separation and warmth.
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed mb-6">
                Our Angwan Sunday Kaduna studio is purposefully designed with
                floating floors, bass trapping, acoustic diffusers, and isolated
                booths to eliminate urban noise and reflections.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#faf8f5] border border-[var(--line)]">
                  <strong className="text-xs text-[var(--gold2)] font-bold uppercase tracking-wider block mb-1">
                    Microphone Locker
                  </strong>
                  <p className="text-xs text-slate-600 m-0">
                    Large diaphragm studio condensers, matched acoustic stereo
                    pairs, dynamic instrument mics.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#faf8f5] border border-[var(--line)]">
                  <strong className="text-xs text-[var(--gold2)] font-bold uppercase tracking-wider block mb-1">
                    Monitoring &amp; DAWs
                  </strong>
                  <p className="text-xs text-slate-600 m-0">
                    Near-field active studio monitors, sub-bass tuning, Pro
                    Tools, Logic Pro &amp; Cubase setups.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#faf8f5] border border-[var(--line)]">
                  <strong className="text-xs text-[var(--gold2)] font-bold uppercase tracking-wider block mb-1">
                    Backline &amp; Keyboards
                  </strong>
                  <p className="text-xs text-slate-600 m-0">
                    Yamaha 88-key weighted action workstations, full acoustic
                    drum kit, bass and lead amplifiers.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#faf8f5] border border-[var(--line)]">
                  <strong className="text-xs text-[var(--gold2)] font-bold uppercase tracking-wider block mb-1">
                    Live Video Rig
                  </strong>
                  <p className="text-xs text-slate-600 m-0">
                    Multi-angle 4K studio cameras, studio key lighting, and
                    synchronous multitrack sync.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-[var(--line)] h-64 sm:h-80 bg-[#0a192f]">
                <img
                  src={studioImg}
                  alt="Vivadoxa Music Studio Keyboard Workstation Lab in Kaduna"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-5 rounded-2xl bg-[var(--navy)] text-white flex items-center justify-between">
                <div>
                  <strong className="text-sm font-serif block text-white">
                    Visit &amp; Tour the Studio
                  </strong>
                  <span className="text-xs text-slate-300 block">
                    {SCHOOL_ADDRESS}
                  </span>
                </div>
                <Button
                  onClick={() => go("contact")}
                  variant="primary"
                  className="!text-xs"
                >
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Studio Frequently Asked Questions ──────────────────────────────── */}
      <section
        className="section"
        style={{ background: "#faf8f5", borderTop: "1px solid var(--line)" }}
      >
        <div className="container max-w-3xl">
          <SectionHead
            center
            eyebrow="Studio FAQ"
            title="Frequently Asked Questions About Our Studio"
            body="Everything you need to know about recording sessions, equipment, and rehearsal bookings at Vivadoxa."
          />

          <div className="space-y-3.5 mt-8">
            {STUDIO_FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--line)] bg-white overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[var(--navy)] cursor-pointer"
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <Icon
                    name={openFaq === i ? "arrowUp" : "arrowDown"}
                    size={16}
                    className="text-[var(--gold)] shrink-0 transition-transform"
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--line)]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20have%20a%20question%20about%20your%20music%20studio.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <WhatsAppIcon size={18} />
              <span>
                Have a specific studio requirement? Ask Admissions on WhatsApp
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
export default Studio
