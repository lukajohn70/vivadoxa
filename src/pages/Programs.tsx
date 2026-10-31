import { useState, useEffect } from "react"
import {
  Badge,
  PageHero,
  Icon,
  Button,
  WhatsAppIcon,
} from "@/components/ui"
import { SEO } from "@/components/SEO"
import {
  programs as staticPrograms,
  officialPricingTiers,
  availableInstruments,
} from "@/lib/data"
import { fetchAcademics } from "@/lib/api"
import { WHATSAPP_URL } from "@/lib/utils"
import { ScrollReveal } from "@/components/ScrollReveal"
import { LazyImage } from "@/components/LazyImage"
import type { Page, Program } from "@/types"

interface ProgramCardProps {
  item: Program
  go: (p: Page) => void
}

function ProgramCard({ item, go }: ProgramCardProps) {
  const whatsappInquiry = `${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20would%20like%20to%20inquire%20about%20the%20${encodeURIComponent(item.name)}%20program.`

  return (
    <article className="program-card h-full">
      <div className="card-image">
        <LazyImage
          src={item.image}
          alt={`${item.name} lessons at Vivadoxa`}
          fallbackSrc="/media/programs/piano-syllabus.jpeg"
          className="h-full"
        />
        <Badge tone="gold">{item.tag}</Badge>
      </div>
      <div className="card-body">
        <h3>{item.name}</h3>
        <p>{item.desc}</p>

        <div
          className="card-foot"
          style={{
            marginTop: "auto",
            borderTop: "1px solid var(--line)",
            paddingTop: 14,
          }}
        >
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              variant="primary"
              onClick={() => go("apply")}
              aria-label={`Enroll in ${item.name}`}
              style={{
                flex: 1,
                minHeight: 44,
                fontSize: 13,
                justifyContent: "center",
              }}
            >
              Enroll <Icon name="arrow" size={14} />
            </Button>
            <a
              href={whatsappInquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95"
              style={{ background: "#e8f7f0", color: "#25D366" }}
              aria-label={`Ask about ${item.name} on WhatsApp`}
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon size={20} />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

const CATEGORIES = [
  "All",
  "Instruments",
  "Vocals",
  "Composition",
  "Music Production",
] as const

const AGE_GROUPS = [
  "All Ages",
  "Kids (4–12)",
  "Teens (13–19)",
  "Adults & Professionals",
] as const

export function Programs({ go }: { go: (p: Page) => void }) {
  const [courses, setCourses] = useState<Program[]>(staticPrograms)
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("All")
  const [ageGroup, setAgeGroup] =
    useState<typeof AGE_GROUPS[number]>("All Ages")
  const [level, setLevel] = useState("")
  const [showAllInstruments, setShowAllInstruments] = useState(false)

  // Frontend-Backend consistency: sync live programs from MySQL database
  useEffect(() => {
    fetchAcademics("programs")
      .then((dbData) => {
        if (Array.isArray(dbData) && dbData.length > 0) {
          setCourses(
            dbData.map((c: any) => {
              const matchedImg =
                c.image ||
                availableInstruments.find(
                  (inst) =>
                    c.name.toLowerCase().includes(inst.name.toLowerCase()) ||
                    inst.name.toLowerCase().includes(c.name.toLowerCase()),
                )?.image ||
                staticPrograms.find((sp) =>
                  c.name.toLowerCase().includes(sp.name.toLowerCase()),
                )?.image ||
                staticPrograms[0]?.image

              return {
                name: c.name,
                tag: c.tag || "Popular",
                image: matchedImg,
                fee: c.fee || "₦20,000 / month",
                feeAmount: parseFloat(c.fee_amount || "20000"),
                desc: c.desc || "",
                category: c.category || "Instruments",
                ageGroup: c.age_group || "All Ages",
                level: c.level || "Beginner",
              }
            }),
          )
        }
      })
      .catch(() => {})
  }, [])

  const filtered = courses.filter((p) => {
    const matchCat = category === "All" || p.category === category
    const matchAge =
      ageGroup === "All Ages" ||
      p.ageGroup === ageGroup ||
      p.ageGroup === "All Ages"
    const matchLevel = !level || p.level === level
    return matchCat && matchAge && matchLevel
  })

  const programsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Vivadoxa Music School Programs & Courses",
    description:
      "Comprehensive music curriculum spanning 17 instrumental disciplines, vocal coaching, music theory, and audio engineering in Kaduna.",
    itemListElement: officialPricingTiers.map((tier, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Course",
        name: tier.name,
        description: tier.description,
        provider: {
          "@type": "Organization",
          name: "Vivadoxa Music School",
          sameAs: "https://vivadoxa.ng",
        },
        offers: {
          "@type": "Offer",
          price: tier.feeAmount,
          priceCurrency: "NGN",
          category: "Tuition Fee",
        },
      },
    })),
  }

  return (
    <main>
      <SEO
        title="Music School Programs & Courses Kaduna — Piano, Guitar, Sax, Drums & Vocals"
        description="Enroll in Vivadoxa Music School Kaduna. Graded conservatory curriculums (ABRSM & MUSON), 1-on-1 practical coaching in piano, saxophone, guitar, violin, drums & vocal performance."
        keywords="music schools, music schools in kaduna, music school kaduna, piano lessons kaduna, guitar lessons kaduna, saxophone school, singing lessons, drum academy kaduna"
        canonicalUrl="/programs"
        ogImage="/media/programs/piano-syllabus.jpeg"
        schema={programsSchema}
      />

      <PageHero
        eyebrow="Vivadoxa Academy"
        title="Discover Your Talent. Develop Your Sound. Master Your Craft."
        body="Welcome to Vivadoxa Academy, where musical passion meets professional instruction. Our academy provides structured music education for children, teenagers, adults, beginners, and advancing musicians. Whether you want to learn an instrument for personal enjoyment, develop your performance abilities, prepare for professional opportunities, or improve your church's music ministry, our training programmes are designed to help you progress."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => go("apply")}>
              Enrol at Vivadoxa Academy <Icon name="arrow" size={14} />
            </Button>
            <a
              href={`${WHATSAPP_URL}?text=${encodeURIComponent(
                "Hello Vivadoxa Academy, I would like to inquire about enrolling in your music training programmes.",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <WhatsAppIcon size={16} /> Chat with Admissions
            </a>
          </div>
        }
      />

      {/* Main Content Area */}
      <section className="section">
        <div className="container">
          {/* ── 1. Our Music Training Programmes ── */}
          <div className="mb-16 sm:mb-20">
            <ScrollReveal direction="left">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
              <span className="eyebrow">Core Curriculum</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
                Our Music <em>Training Programmes</em>
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
                Comprehensive, graded musical training tailored to personal enjoyment, academic certification, performance mastery, and church ministry.
              </p>
            </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pillar 1: Instrumental Training */}
              <ScrollReveal direction="up" delay={0} className="h-full">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  padding: "28px 26px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 12px rgba(14, 13, 12, 0.03)",
                }}
                className="hover:border-[var(--gold)] hover:shadow-md transition-all h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm">
                    01
                  </span>
                  <Badge tone="gold">Foundational to Mastery</Badge>
                </div>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 23,
                    color: "var(--navy)",
                    margin: "0 0 10px",
                  }}
                >
                  Instrumental Training
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
                  Rigorous, hands-on coaching in solo technique, scales, articulation, and expressive performance across major instruments:
                </p>
                <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Piano and keyboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Guitar (Acoustic, Electric &amp; Bass)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Drums and percussion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Violin and bowed strings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Saxophone (Alto, Tenor &amp; Soprano)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Trumpet and other brass instruments</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)] italic block mb-3">
                    * Other instruments subject to programme availability.
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => go("apply")}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Enrol in Instrument Training &rarr;
                  </Button>
                </div>
              </div>
              </ScrollReveal>

              {/* Pillar 2: Music Theory & Musicianship */}
              <ScrollReveal direction="up" delay={80} className="h-full">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  padding: "28px 26px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 12px rgba(14, 13, 12, 0.03)",
                }}
                className="hover:border-[var(--gold)] hover:shadow-md transition-all h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm">
                    02
                  </span>
                  <Badge tone="gold">Musicianship</Badge>
                </div>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 23,
                    color: "var(--navy)",
                    margin: "0 0 10px",
                  }}
                >
                  Music Theory &amp; Musicianship
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
                  Develop a deeper understanding of music through structured theoretical analysis and practical musicianship:
                </p>
                <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Reading musical notation (Treble &amp; Bass clefs)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Rhythm, time signatures, and timing precision</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Scales, modes, and key signatures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Chords, voicing, and functional harmony</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Ear training and interval recognition</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Sight-reading and musical interpretation</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)] block mb-3">
                    Integrated across all conservatory syllabi.
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => go("apply")}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Study Music Theory &rarr;
                  </Button>
                </div>
              </div>
              </ScrollReveal>

              {/* Pillar 3: Vocal Training */}
              <ScrollReveal direction="up" delay={160} className="h-full">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  padding: "28px 26px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 12px rgba(14, 13, 12, 0.03)",
                }}
                className="hover:border-[var(--gold)] hover:shadow-md transition-all h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm">
                    03
                  </span>
                  <Badge tone="gold">Voice Academy</Badge>
                </div>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 23,
                    color: "var(--navy)",
                    margin: "0 0 10px",
                  }}
                >
                  Vocal Training
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
                  Develop your voice with healthy vocal hygiene, powerful projection, and command on stage:
                </p>
                <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Vocal technique and diaphragmatic breath control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Pitch accuracy, tone purity, and intonation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Vocal range development and register blending</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Harmony singing and ensemble vocal blending</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Stage presence, mic technique, and projection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Performance and audition preparation</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-[var(--line)]">
                  <span className="text-[11px] text-[var(--muted)] block mb-3">
                    Available for solo singers, choirs, and worship vocalists.
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => go("apply")}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Enrol in Vocal Coaching &rarr;
                  </Button>
                </div>
              </div>
              </ScrollReveal>

              {/* Pillar 4: Church Musician Development */}
              <ScrollReveal direction="up" delay={0} className="h-full">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  padding: "28px 26px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 12px rgba(14, 13, 12, 0.03)",
                }}
                className="hover:border-[var(--gold)] hover:shadow-md transition-all h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm">
                    04
                  </span>
                  <Badge tone="gold">Ministry Track</Badge>
                </div>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 23,
                    color: "var(--navy)",
                    margin: "0 0 10px",
                  }}
                >
                  Church Musician Development
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
                  Practical, transformative training for church instrumentalists, vocalists, worship teams, and music directors:
                </p>
                <ul className="space-y-2 text-xs sm:text-[13px] text-slate-700 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Hymn accompaniment &amp; contemporary gospel progressions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Praise &amp; worship rhythm section cohesion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Choir direction, parts conducting, and arrangement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Church soundboard management &amp; acoustic balancing</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-[var(--line)]">
                  <Button
                    variant="secondary"
                    onClick={() => go("apply")}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Equip Your Worship Team &rarr;
                  </Button>
                </div>
              </div>
              </ScrollReveal>

              {/* Pillar 5: Professional Music Development */}
              <ScrollReveal direction="up" delay={80} className="h-full md:col-span-2 lg:col-span-2">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  padding: "28px 26px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 12px rgba(14, 13, 12, 0.03)",
                }}
                className="hover:border-[var(--gold)] hover:shadow-md transition-all h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--gold)] border border-[var(--gold)]/20 flex items-center justify-center font-bold text-sm">
                    05
                  </span>
                  <Badge tone="gold">Conservatory Diploma</Badge>
                </div>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 23,
                    color: "var(--navy)",
                    margin: "0 0 10px",
                  }}
                >
                  Professional Music Development
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mb-4">
                  For advancing musicians seeking to strengthen their technique, musical understanding, ensemble skills, and performance confidence for live concerts, studio recording, and professional certification:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-[13px] text-slate-700 mb-6 flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Advanced improvisation &amp; harmonic reharmonization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Virtuoso speed, finger independence &amp; embouchure</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Live ensemble cohesion &amp; professional stage presence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                      <span>Portfolio preparation for MUSON &amp; ABRSM diplomas</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[var(--muted)] font-medium">
                    12-Month Advanced &amp; 2-Year Professional Diploma tracks available.
                  </span>
                  <Button
                    variant="primary"
                    onClick={() => go("apply")}
                    className="text-xs font-bold"
                  >
                    Apply for Professional Track &rarr;
                  </Button>
                </div>
              </div>
              </ScrollReveal>
            </div>
          </div>
          {/* ── 2. Our Teaching Approach & Who Can Enrol ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 sm:mb-20">
            {/* Teaching Approach */}
            <ScrollReveal direction="left" className="h-full">
            <div
              style={{
                background: "linear-gradient(135deg, #0b0b0b 0%, #1c1917 100%)",
                borderRadius: 16,
                padding: "40px 34px",
                color: "white",
                border: "1px solid rgba(201,107,50,0.35)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              }}
              className="h-full"
            >
              <div>
                <span className="eyebrow" style={{ color: "var(--gold2)" }}>
                  Educational Philosophy
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white tracking-tight mt-2 mb-4 leading-snug">
                  Our Teaching <em>Approach</em>
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "#d6cec7",
                    margin: "0 0 18px",
                  }}
                >
                  We combine practical instruction, music theory, guided practice, and performance development to help students build a solid musical foundation.
                </p>
                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: "#d6cec7",
                    margin: 0,
                  }}
                >
                  Our approach focuses on individual progress, discipline, creativity, and confidence—empowering each musician to play with accuracy and authentic expression.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-8 border-t border-white/10">
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <strong className="block text-white text-sm font-bold">Progress</strong>
                  <span className="text-[11px] text-slate-300">Paced for you</span>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <strong className="block text-white text-sm font-bold">Discipline</strong>
                  <span className="text-[11px] text-slate-300">Guided practice</span>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <strong className="block text-white text-sm font-bold">Creativity</strong>
                  <span className="text-[11px] text-slate-300">Free expression</span>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <strong className="block text-white text-sm font-bold">Confidence</strong>
                  <span className="text-[11px] text-slate-300">Stage ready</span>
                </div>
              </div>
            </div>
            </ScrollReveal>

            {/* Who Can Enrol? */}
            <ScrollReveal direction="right" delay={120} className="h-full">
            <div
              style={{
                background: "var(--cream)",
                borderRadius: 16,
                padding: "40px 34px",
                border: "1px solid var(--line-strong)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              className="h-full"
            >
              <div>
                <span className="eyebrow">Eligibility &amp; Accommodations</span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[var(--navy)] tracking-tight mt-2 mb-4 leading-snug">
                  Who Can <em>Enrol?</em>
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--muted)",
                    lineHeight: 1.6,
                    margin: "0 0 20px",
                  }}
                >
                  Our programmes are structured to accommodate learners from all walks of life:
                </p>
                <div className="space-y-3 mb-6 text-xs sm:text-sm text-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Children discovering music for the first time</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Students seeking structured musical development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Adults pursuing a lifelong passion</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Church musicians and worship teams</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Aspiring professional musicians</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)] shrink-0" />
                    <span>Experienced players looking to improve their skills</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[var(--line)]">
                <p className="text-xs text-[var(--muted)] m-0 leading-relaxed italic">
                  * Programme availability and entry requirements may vary by instrument and proficiency level. Contact our admissions desk to confirm current cohorts.
                </p>
              </div>
            </div>
            </ScrollReveal>
          </div>

          {/* ── Official Duration Tiers & Price List ── */}
          <div className="mb-16 sm:mb-20">
            <ScrollReveal direction="left">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
              <span className="eyebrow">Tuition &amp; Durations</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
                Standardized Programmes &amp; <em>Tuition</em>
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
                Fixed tuition across all 17 musical instruments and vocal disciplines. Choose your track from foundational studies to our professional 2-year conservatory diploma.
              </p>
            </div>
            </ScrollReveal>

            {/* 6-Card Grid for Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-9">
              {officialPricingTiers.map((tier, idx) => (
                <ScrollReveal
                  key={tier.id}
                  direction="up"
                  delay={(idx % 3) * 60}
                  className="h-full"
                >
                <div
                  style={{
                    background: tier.popular
                      ? "linear-gradient(180deg, #fffcf7 0%, #ffffff 100%)"
                      : "#ffffff",
                    borderRadius: 14,
                    border: tier.popular
                      ? "1.5px solid var(--gold)"
                      : "1px solid var(--line)",
                    boxShadow: tier.popular
                      ? "0 10px 30px rgba(184, 142, 86, 0.10)"
                      : "0 2px 10px rgba(14, 13, 12, 0.03)",
                  }}
                  className="p-6 rounded-2xl flex flex-col h-full relative transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Top: Duration & Optional Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold-text)]">
                      {tier.duration}
                    </span>
                    {tier.badge && (
                      <span
                        className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
                          tier.popular
                            ? "bg-[var(--gold)] text-white"
                            : "bg-[var(--navy)] text-white"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  {/* Program Title */}
                  <h3
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 22,
                      color: "var(--navy)",
                      margin: "0 0 6px",
                      lineHeight: 1.25,
                    }}
                  >
                    {tier.name}
                  </h3>

                  {/* Single Crisp Scope Line */}
                  <p className="text-xs text-[var(--muted)] line-clamp-2 min-h-[34px] mb-4 leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Integrated Fee Block */}
                  <div className="pt-3 pb-3 border-y border-[var(--line)] mb-4">
                    <div className="flex items-baseline gap-1.5">
                      <strong
                        style={{
                          fontSize: 27,
                          fontFamily: "'DM Serif Display', serif",
                          color: "var(--navy)",
                          letterSpacing: "-0.3px",
                        }}
                      >
                        {tier.fee}
                      </strong>
                      {tier.duration === "Monthly" && (
                        <small className="text-xs text-[var(--muted)] font-medium">
                          / month
                        </small>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                      {tier.target}
                    </span>
                  </div>

                  {/* 3 Crisp Deliverables */}
                  <ul className="space-y-2 text-xs text-slate-700 mb-6 flex-1">
                    {tier.inclusions.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2.5 leading-snug"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action CTA */}
                  <div className="flex items-center gap-2 pt-2 mt-auto">
                    <Button
                      variant={tier.popular ? "primary" : "secondary"}
                      onClick={() => go("apply")}
                      className="flex-1 py-2.5 text-xs font-bold min-h-[42px] justify-center"
                    >
                      Apply for Admission <Icon name="arrow" size={12} />
                    </Button>
                    <a
                      href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20am%20interested%20in%20the%20${encodeURIComponent(tier.name)}%20(${encodeURIComponent(tier.fee)}).`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-[var(--line)] text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors"
                      title="Inquire on WhatsApp"
                      aria-label={`Ask about ${tier.name} on WhatsApp`}
                    >
                      <WhatsAppIcon size={16} />
                    </a>
                  </div>
                </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Important Notice Callout Box */}
            <div
              style={{
                background: "rgba(201,107,50,0.08)",
                border: "1px solid rgba(201,107,50,0.3)",
                borderRadius: 10,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <Icon
                name="music"
                size={24}
                className="text-amber-800 shrink-0"
              />
              <div style={{ flex: 1, minWidth: 260 }}>
                <strong
                  style={{
                    fontSize: 13,
                    color: "var(--navy)",
                    display: "block",
                  }}
                >
                  Transparent Uniform Pricing: No Hidden Fees or Instrument
                  Surcharges
                </strong>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    margin: "2px 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  Whether you study Alto or Soprano Saxophone, Trumpet, Piano,
                  Drums, Violin, Flute, Clarinet, Talking Drums, Voice, Studio
                  or Sound Engineering, the tuition fee remains identical across
                  all 17 available instruments and audio disciplines.
                </p>
              </div>
              <a
                href="tel:09075330330"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gold)] hover:underline"
              >
                Admissions Desk: 09075330330 →
              </a>
            </div>
          </div>

          {/* ── 17 Available Instruments Showcase ── */}
          <div className="mb-16 sm:mb-20">
            <ScrollReveal direction="up">
              <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                <span className="eyebrow">Complete Instrument Catalog</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
                  17 Musical &amp; Audio Disciplines <em>Taught by Specialists</em>
                </h2>
                <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
                  Every instrument below is available across all program duration tiers (1 Month Intro, 3 Months Certificate, 6 Months Program, 12 Months Advanced Program, and 2 Years Diploma Program) plus Home Lessons.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-7">
              {(showAllInstruments ? availableInstruments : availableInstruments.slice(0, 8)).map((inst, idx) => (
                <ScrollReveal
                  key={inst.id}
                  direction="up"
                  delay={(idx % 4) * 40}
                  className="h-full"
                >
                  <div
                    style={{
                      background: "white",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--line)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 3px 12px rgba(0,0,0,0.03)",
                      height: "100%",
                    }}
                    className="hover:border-[var(--gold)] hover:shadow-md transition-all"
                  >
                    <div
                      style={{
                        height: 130,
                        position: "relative",
                        overflow: "hidden",
                        background: "#0a192f",
                      }}
                    >
                      <LazyImage
                        src={inst.image}
                        alt={inst.name}
                        fallbackSrc="/media/programs/piano-syllabus.jpeg"
                        className="w-full h-full object-cover"
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          background: "rgba(10,25,47,0.85)",
                          color: "var(--gold2)",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          backdropFilter: "blur(4px)",
                          zIndex: 2,
                        }}
                      >
                        {inst.family}
                      </span>
                    </div>
                    <div
                      style={{
                        padding: "14px 14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 4px",
                          fontSize: 15,
                          color: "var(--navy)",
                          fontWeight: 700,
                        }}
                      >
                        {inst.name}
                      </h4>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          margin: "0 0 10px",
                          lineHeight: 1.45,
                          flex: 1,
                        }}
                      >
                        {inst.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderTop: "1px solid var(--line)",
                          paddingTop: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--gold)",
                            fontWeight: 600,
                          }}
                        >
                          {inst.levels}
                        </span>
                        <button
                          type="button"
                          onClick={() => go("apply")}
                          style={{
                            border: 0,
                            background: "none",
                            color: "var(--navy)",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          Enroll →
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => setShowAllInstruments(!showAllInstruments)}
                className="btn btn-secondary inline-flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-full"
              >
                {showAllInstruments ? (
                  <>Show Fewer Instruments ↑</>
                ) : (
                  <>Show All 17 Disciplines ({availableInstruments.length - 8} more) ↓</>
                )}
              </button>
            </div>
          </div>

          {/* ── Complete Course Catalog & Syllabi ── */}
          <div className="text-center max-w-3xl mx-auto my-14 sm:my-16">
            <span className="eyebrow">Interactive Syllabus</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[var(--navy)] tracking-tight leading-[1.15] mt-2 mb-4">
              All Academic Programs &amp; <em>Study Tracks</em>
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              Explore our structured conservatory modules, weekly hours, and examination standards across introductory to advanced diploma tiers.
            </p>
          </div>

          {/* Learner Stage Switcher - Pure Vivadoxa Luxury Theme */}
          <div
            style={{
              background: "var(--navy)",
              color: "white",
              borderRadius: "var(--radius)",
              padding: "24px 28px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 28,
              border: "1px solid rgba(201,107,50,0.25)",
            }}
          >
            <div>
              <span
                className="eyebrow"
                style={{
                  color: "var(--gold2)",
                  fontSize: 10,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Learner Stage
              </span>
              <p style={{ margin: 0, fontSize: 13, color: "#c1ccd5" }}>
                Select the learning track designed for your age group
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {AGE_GROUPS.map((ag) => {
                const active = ageGroup === ag
                return (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => setAgeGroup(ag)}
                    style={{
                      border: active
                        ? "1px solid var(--gold)"
                        : "1px solid rgba(255,255,255,0.15)",
                      background: active
                        ? "var(--gold)"
                        : "rgba(255,255,255,0.06)",
                      color: active ? "var(--navy)" : "white",
                      padding: "8px 16px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {ag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="tabs" role="tablist" aria-label="Program categories">
            {CATEGORIES.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={category === t}
                className={category === t ? "active" : ""}
                onClick={() => setCategory(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Filter Row with Uniform Vivadoxa Luxury Styling */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              background: "white",
              padding: "16px 20px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              marginBottom: 28,
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--gold)",
                }}
              />
              <strong style={{ fontSize: 14, color: "var(--navy)" }}>
                {category === "All" ? "All Programs" : category}
              </strong>
              {ageGroup !== "All Ages" && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "var(--cream)",
                    color: "var(--navy)",
                    fontWeight: 600,
                    border: "1px solid var(--line)",
                  }}
                >
                  {ageGroup}
                </span>
              )}
              <span
                style={{
                  fontSize: 12,
                  padding: "2px 10px",
                  borderRadius: 99,
                  background: "rgba(201, 107, 50, 0.12)",
                  color: "var(--gold-text)",
                  fontWeight: 700,
                }}
              >
                {filtered.length} course{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label
                htmlFor="course-level-filter"
                style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}
              >
                Difficulty Level:
              </label>
              <select
                id="course-level-filter"
                aria-label="Filter by level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  border: "1px solid var(--line)",
                  background: "white",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--navy)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <option value="">All difficulty levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Program Grid */}
          <div className="program-grid" role="tabpanel">
            {filtered.map((item, idx) => (
              <ScrollReveal
                key={item.name}
                direction="up"
                delay={(idx % 3) * 60}
                className="h-full"
              >
                <ProgramCard item={item} go={go} />
              </ScrollReveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-base mb-4">
                No programs match this specific filter combination.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setCategory("All")
                  setAgeGroup("All Ages")
                  setLevel("")
                }}
              >
                Reset All Filters
              </Button>
            </div>
          )}

          {/* ── Begin Your Musical Journey Banner ── */}
          <div
            style={{
              marginTop: 48,
              background: "linear-gradient(135deg, var(--navy) 0%, #172a45 100%)",
              borderRadius: "var(--radius)",
              padding: "48px 36px",
              textAlign: "center",
              color: "white",
              border: "1.5px solid var(--gold)",
              boxShadow: "0 10px 30px rgba(10,25,47,0.15)",
            }}
          >
            <span
              className="eyebrow"
              style={{
                color: "var(--gold2)",
                fontSize: 12,
                display: "inline-block",
                marginBottom: 8,
              }}
            >
              Start Today
            </span>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(28px, 4vw, 42px)",
                color: "white",
                margin: "0 0 12px",
              }}
            >
              Begin Your Musical Journey
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#e2e8f0",
                maxWidth: 620,
                margin: "0 auto 28px",
                lineHeight: 1.6,
              }}
            >
              Your age or experience does not have to limit your musical ambitions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <Button
                variant="primary"
                onClick={() => go("apply")}
                style={{
                  minHeight: 48,
                  padding: "0 28px",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                Enrol at Vivadoxa Academy <Icon name="arrow" size={16} />
              </Button>
              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(
                  "Hello Vivadoxa Academy, I would like to enrol in a training programme.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center gap-2"
                style={{
                  minHeight: 48,
                  padding: "0 24px",
                  fontSize: 14,
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  borderColor: "rgba(255,255,255,0.25)",
                }}
              >
                <WhatsAppIcon size={18} /> Chat with Admissions Desk
              </a>
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.5,
                color: "var(--gold2)",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Learn with purpose. Play with confidence. Perform with excellence.
            </p>
          </div>

          {/* Instrument Hospital Cross-Promotion Banner */}
          <div
            style={{
              marginTop: 56,
              background: "linear-gradient(135deg, #fdfbf7 0%, #f4ede3 100%)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              padding: "32px 36px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div style={{ maxWidth: 620 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <Icon name="tool" size={18} className="text-amber-800" />
                <span className="eyebrow" style={{ fontSize: 11 }}>
                  In-House Instrument Workshop
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 22,
                  margin: "0 0 8px",
                  color: "var(--navy)",
                }}
              >
                Don&apos;t Own an Instrument Yet? We&apos;ve Got You Covered.
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Enrolled students enjoy priority access to certified student
                loaner instruments, restringing, acoustic guitar setups, and
                keyboard calibrations right here in Kaduna.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={() => go("repairs")}>
                Explore Instrument Hospital →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Programs
