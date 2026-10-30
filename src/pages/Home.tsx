import { useState, useEffect } from "react"
import {
  Button,
  Badge,
  SectionHead,
  Icon,
  Cta,
  WhatsAppIcon,
  GoogleIcon,
} from "@/components/ui"
import { HomeReviewsSpotlight } from "@/components/HomeReviewsSpotlight"
import { StatCounters } from "@/components/StatCounters"
import { ScrollReveal } from "@/components/ScrollReveal"
import { SEO } from "@/components/SEO"
import {
  heroImg,
  studioImg,
  performances as staticPerformances,
  soundExplorerInstruments,
  officialPricingTiers,
  repairSaxImg,
  repairElectronicsImg,
} from "@/lib/data"
import { fetchAcademics } from "@/lib/api"
import {
  WHATSAPP_URL,
  SCHOOL_PHONE,
  SCHOOL_PHONE_2,
  SCHOOL_WHATSAPP,
  SCHOOL_EMAIL,
  SCHOOL_ADDRESS,
  GOOGLE_REVIEWS_URL,
} from "@/lib/utils"
import type { Page } from "@/types"

const HERO_SLIDES = [
  {
    id: "sax-ensemble",
    src: "/media/programs/sax-ensemble.jpeg",
    alt: "Young African musicians performing saxophone ensemble at Vivadoxa",
    title: "Youth Saxophone Ensemble",
    subtitle: "Harmonies, stage dynamics & group masterclasses",
    category: "Woodwinds & Brass",
  },
  {
    id: "piano-recital",
    src: "/media/programs/piano-recital-braids.jpeg",
    alt: "Student performing live concert on grand piano at Vivadoxa",
    title: "Concert Grand Piano",
    subtitle: "Classical repertoire, posture & sight-reading",
    category: "Keys & Piano",
  },
  {
    id: "violin-solo",
    src: "/media/programs/violin-solo-rainbow.jpeg",
    alt: "Youth violinist performing solo recital at Vivadoxa academy",
    title: "Violin Masterclass",
    subtitle: "Bowing technique, pitch control & graded syllabus",
    category: "Strings",
  },
  {
    id: "drums-lab",
    src: "/media/programs/drums-group-lab.jpeg",
    alt: "Drumming students at Vivadoxa rhythm lab",
    title: "Rhythm & Drumming Lab",
    subtitle: "Groove stability, polyrhythms & time-keeping",
    category: "Percussion",
  },
  {
    id: "band-rehearsal",
    src: "/media/studio/classroom-band-rehearsal.jpeg",
    alt: "Students rehearsing in ensemble band at Vivadoxa music school",
    title: "Live Band Rehearsal",
    subtitle: "African groove, stage confidence & collaboration",
    category: "Live Performance",
  },
]

export function Home({ go }: { go: (p: Page) => void }) {
  const [recitals, setRecitals] = useState(staticPerformances)
  const [soundCategory, setSoundCategory] = useState<string>("All")
  const [showAllInstruments, setShowAllInstruments] = useState(false)
  const [heroSlide, setHeroSlide] = useState(0)
  const [prevHeroSlide, setPrevHeroSlide] = useState<number | null>(null)
  const [isHeroPaused, setIsHeroPaused] = useState(false)
  const [isCategoryFading, setIsCategoryFading] = useState(false)

  const handleSlideChange = (
    nextIndex: number | ((curr: number) => number),
  ) => {
    setHeroSlide((curr) => {
      const next = typeof nextIndex === "function" ? nextIndex(curr) : nextIndex
      if (next !== curr) {
        setPrevHeroSlide(curr)
      }
      return next
    })
  }

  // Auto-advance hero slides every 6 seconds unless user is hovering
  useEffect(() => {
    if (isHeroPaused) return
    const timer = setInterval(() => {
      handleSlideChange((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isHeroPaused])

  const handleCategorySelect = (cat: string) => {
    if (cat === soundCategory) return
    setIsCategoryFading(true)
    setTimeout(() => {
      setSoundCategory(cat)
      setIsCategoryFading(false)
    }, 150)
  }

  // Frontend-backend live data synchronization for recitals
  useEffect(() => {
    fetchAcademics("performances")
      .then((dbPerf) => {
        if (Array.isArray(dbPerf) && dbPerf.length > 0) {
          setRecitals(
            dbPerf.map((p: any) => ({
              id: String(p.id),
              title: p.title,
              performer: p.performer,
              program: p.program,
              category: p.category,
              youtubeId: p.youtube_id,
              duration: p.duration,
              date: p.date_label,
              description: p.description,
              isShort: Boolean(p.is_short ?? p.isShort),
            })),
          )
        }
      })
      .catch(() => {})
  }, [])

  const featuredPerformance =
    recitals.find((p) => p.youtubeId === "-IcdMT9uCLU") ||
    recitals[0] ||
    staticPerformances[0]

  const soundCategories = [
    "All",
    "Woodwinds",
    "Brass",
    "Keys",
    "Strings & Frets",
    "Percussion",
    "Voice",
    "Production",
  ] as const

  const allCategoryInstruments =
    soundCategory === "All"
      ? soundExplorerInstruments
      : soundExplorerInstruments.filter(
          (inst) => inst.category === soundCategory,
        )

  // Initial view displays top 6 flagship disciplines when "All" is active; expands on toggle
  const visibleInstruments =
    soundCategory === "All" && !showAllInstruments
      ? allCategoryInstruments.slice(0, 6)
      : allCategoryInstruments

  return (
    <main>
      <SEO
        title="Vivadoxa — Premier Music School, Instrument Repair & Recording Studio | Kaduna"
        description="Kaduna's premier music school, expert instrument repair clinic, and modern recording studio. Certified training across 17 instruments, precision servicing, and audio engineering."
        keywords="music schools, music schools in kaduna, music school kaduna, instrument repair, instrument repair kaduna, musical instrument repair, music studio, music studio kaduna, recording studio kaduna, music lessons, guitar repair, saxophone repair, piano lessons kaduna, voice training, audio mixing studio"
        canonicalUrl="/"
      />

      {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
      <section className="hero overflow-hidden">
        <div className="container hero-grid">
          <ScrollReveal direction="left" className="hero-copy">
            <span className="eyebrow block mb-3 text-[var(--gold2)] tracking-[2px] font-semibold text-xs">
              Conservatory Standards · Master Atelier · Kaduna
            </span>
            <h1>
              Actualize your
              <br />
              <em>passion.</em>
            </h1>
            <p>
              Kaduna&apos;s premier music academy, master instrument clinic, and
              purpose-built recording studio. Structured conservatory
              preparation across 17 core disciplines, master technicians, and
              dedicated stage recitals.
            </p>
            <div className="button-row">
              <Button onClick={() => go("apply")}>
                Apply for Admission <Icon name="arrow" />
              </Button>
              <Button variant="secondary" onClick={() => go("programs")}>
                Explore Curriculum
              </Button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-concierge"
                aria-label="Direct Admissions Consultation on WhatsApp"
              >
                <WhatsAppIcon size={18} />
                <span>Admissions Concierge</span>
              </a>
            </div>
            <div
              className="hero-credentials"
              aria-label="Institutional Standards"
            >
              <div className="credential-item">
                <span className="credential-label">Curriculum</span>
                <strong className="credential-val">
                  MUSON &amp; ABRSM Prep
                </strong>
              </div>
              <div className="credential-divider" aria-hidden="true" />
              <div className="credential-item">
                <span className="credential-label">Heritage</span>
                <strong className="credential-val">
                  Founded in Kaduna, 2013
                </strong>
              </div>
              <div className="credential-divider" aria-hidden="true" />
              <div className="credential-item">
                <span className="credential-label">Atelier</span>
                <strong className="credential-val">
                  Certified Repair Clinic
                </strong>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={120}>
            <div
              className="hero-visual"
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
              aria-roledescription="carousel"
              aria-label="Vivadoxa Academy Student Recitals & Training Showcase"
            >
              {/* ── Living Hero Photography Carousel with Subtle Merge ── */}
              <div className="hero-slides-track">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = idx === heroSlide
                  const isPrevious = idx === prevHeroSlide
                  return (
                    <div
                      key={slide.id}
                      className={`hero-slide ${
                        isActive ? "is-active" : isPrevious ? "is-previous" : ""
                      }`}
                      aria-hidden={!isActive}
                    >
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        fetchPriority={idx === 0 ? "high" : "low"}
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                      <div className="hero-slide-overlay" aria-hidden="true" />
                    </div>
                  )
                })}

                {/* Minimalist Slide Progress Controls */}
                <div className="hero-slider-nav">
                  <div className="hero-slider-dots">
                    {HERO_SLIDES.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => handleSlideChange(idx)}
                        className={`hero-dot-btn ${
                          idx === heroSlide ? "is-active" : ""
                        }`}
                        aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                      >
                        <span className="sr-only">{slide.title}</span>
                      </button>
                    ))}
                  </div>

                  <div className="hero-slider-arrows">
                    <button
                      type="button"
                      onClick={() =>
                        handleSlideChange(
                          (prev) =>
                            (prev - 1 + HERO_SLIDES.length) %
                            HERO_SLIDES.length,
                        )
                      }
                      className="hero-arrow-btn"
                      aria-label="Previous photo"
                      title="Previous"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSlideChange(
                          (prev) => (prev + 1) % HERO_SLIDES.length,
                        )
                      }
                      className="hero-arrow-btn"
                      aria-label="Next photo"
                      title="Next"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Integrated Architectural Discipline Banner */}
                <div
                  className="hero-recital-banner"
                  onClick={() => go("programs")}
                  role="button"
                  tabIndex={0}
                  title={`Explore ${HERO_SLIDES[heroSlide].title} curriculum`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      go("programs")
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="play-circle">
                      <Icon name="music" size={13} />
                    </span>
                    <div className="min-w-0">
                      <small>
                        Discipline · {HERO_SLIDES[heroSlide].category}
                      </small>
                      <strong className="truncate">
                        {HERO_SLIDES[heroSlide].title}
                      </strong>
                    </div>
                  </div>
                  <span className="hero-recital-cta">Explore Course ↗</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 2. Prestigious Institutional Milestone Counters ───────────────── */}
      <StatCounters />

      {/* ── 4. "Pick Your Sound" Interactive Explorer (Parara Landmark) ──── */}
      <section
        className="section overflow-hidden"
        style={{
          background: "#FAF8F5",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
        id="instruments"
      >
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <ScrollReveal direction="left" className="max-w-2xl">
              <div>
                <span className="eyebrow">Musical Disciplines</span>
                <h2
                  style={{
                    fontSize: "clamp(30px, 4vw, 44px)",
                    margin: "8px 0 0",
                    color: "var(--navy)",
                  }}
                >
                  Pick your sound. Master your instrument.
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 15,
                    margin: "8px 0 0",
                    maxWidth: 640,
                    lineHeight: 1.6,
                  }}
                >
                  Structured, practical instruction across 17 core instrumental
                  disciplines and audio engineering. Available via in-studio
                  lessons in Kaduna or private home coaching.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={120}>
              <Button variant="secondary" onClick={() => go("programs")}>
                View full curriculum <Icon name="arrow" />
              </Button>
            </ScrollReveal>
          </div>

          {/* Sound Category Filter Pills */}
          <ScrollReveal direction="up" delay={80}>
            <div className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-xl bg-white border border-[var(--line)] w-max max-w-full overflow-x-auto shadow-xs">
              {soundCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    soundCategory === cat
                      ? "bg-[var(--gold)] text-white shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[#F3EFEA]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Sound Explorer Grid */}
          <div
            className={`sound-explorer-grid transition-opacity duration-300 ${
              isCategoryFading ? "opacity-30" : "opacity-100"
            }`}
          >
            {visibleInstruments.map((inst, idx) => {
              const waText = `Hello Vivadoxa, I am interested in learning the ${inst.name} (${inst.tag}) program.`
              return (
                <ScrollReveal
                  key={inst.id}
                  direction="up"
                  delay={(idx % 3) * 70}
                  className="h-full"
                >
                  <article className="sound-card group h-full">
                    <div className="sound-img-wrap">
                      <img src={inst.image} alt={inst.name} loading="lazy" />
                      <div className="sound-img-overlay" />
                      <span className="sound-badge-pill">{inst.category}</span>
                    </div>

                    <div className="sound-card-body">
                      <h3>{inst.name}</h3>
                      <p className="desc">{inst.description}</p>

                      <div className="sound-card-actions mt-auto">
                        <button
                          type="button"
                          onClick={() => go("apply")}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gold)] hover:text-[var(--navy)] uppercase tracking-wider group-hover:translate-x-1 transition-all cursor-pointer"
                        >
                          <span>Enroll Now</span>
                          <Icon name="arrow" size={14} />
                        </button>
                        <a
                          href={`${WHATSAPP_URL}?text=${encodeURIComponent(waText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sound-wa-btn"
                          aria-label={`Ask about ${inst.name} on WhatsApp`}
                          title="Inquire on WhatsApp"
                        >
                          <WhatsAppIcon size={15} />
                          <span>Inquire</span>
                        </a>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              )
            })}
          </div>

          {/* Show All / Show Fewer Expand Toggle Button */}
          {soundCategory === "All" && soundExplorerInstruments.length > 6 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-10 pt-2">
              <button
                type="button"
                onClick={() => setShowAllInstruments((prev) => !prev)}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--navy)] bg-white border border-[var(--line)] shadow-xs hover:border-[var(--gold)] hover:bg-[#FAF6F0] hover:shadow-md transition-all cursor-pointer group"
                aria-expanded={showAllInstruments}
              >
                <span>
                  {showAllInstruments
                    ? "Show Fewer Disciplines"
                    : `Show All ${soundExplorerInstruments.length} Disciplines`}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold2)] font-semibold">
                  {showAllInstruments
                    ? `Showing ${soundExplorerInstruments.length}`
                    : `+${soundExplorerInstruments.length - 6} more`}
                </span>
                <Icon
                  name={showAllInstruments ? "arrowUp" : "arrowDown"}
                  size={14}
                  className="text-[var(--gold)] group-hover:translate-y-0.5 transition-transform"
                />
              </button>
              <Button
                variant="ghost"
                onClick={() => go("programs")}
                className="!text-xs text-[var(--muted)] hover:text-[var(--navy)]"
              >
                <span>Browse complete syllabus</span>
                <Icon name="arrow" size={13} />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. Official Programs & Tuition Structure (Price List Document) ─── */}
      <section
        className="section overflow-hidden"
        style={{ background: "white" }}
      >
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <ScrollReveal direction="left">
              <div>
                <span className="eyebrow">Academic Programmes</span>
                <h2 style={{ margin: "10px 0 0", color: "var(--navy)" }}>
                  Programmes &amp; Tuition
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 15,
                    margin: "6px 0 0",
                    maxWidth: 600,
                  }}
                >
                  Standardized tuition across all 17 instruments and vocal
                  disciplines. Includes curriculum materials, recital
                  preparation, and studio access.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={120}>
              <Button
                variant="secondary"
                onClick={() => go("programs")}
                className="w-full sm:w-auto justify-center min-h-[42px]"
              >
                Full Syllabus &amp; Catalog <Icon name="arrow" />
              </Button>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officialPricingTiers.map((tier, idx) => (
              <ScrollReveal
                key={tier.id}
                direction="up"
                delay={idx * 60}
                className="h-full"
              >
                <div
                  key={tier.id}
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

                  {/* 3 Crisp Deliverables (clean bronze dots instead of repetitive checkmark icons) */}
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
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-[var(--line)] text-emerald-600 hover:bg-emerald-50 transition-colors"
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
        </div>
      </section>

      {/* ── 8. Live Recital & Performance Showcase ───────────────────────── */}
      <section
        className="section"
        style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--line)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 20,
              marginBottom: 35,
            }}
          >
            <ScrollReveal direction="left">
              <div>
                <span className="eyebrow">Stage Experience</span>
                <h2 style={{ margin: "10px 0 0", color: "var(--navy)" }}>
                  The school should feel alive before you step in.
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 15,
                    margin: "6px 0 0",
                    maxWidth: 600,
                  }}
                >
                  Watch our students in recitals, youth ensembles, and concert
                  medleys. Real music, genuine growth, and visible stage
                  confidence.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={120}>
              <Button variant="secondary" onClick={() => go("performances")}>
                Watch all recitals <Icon name="arrow" />
              </Button>
            </ScrollReveal>
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 items-center p-6 sm:p-8 rounded-2xl border bg-white overflow-hidden"
            style={{ borderColor: "var(--line)" }}
          >
            <ScrollReveal direction="left">
              <div
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  background: featuredPerformance.isShort ? "#080c14" : "#000",
                  aspectRatio: featuredPerformance.isShort ? undefined : "16/9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: featuredPerformance.isShort ? 24 : 0,
                }}
              >
                {featuredPerformance.videoUrl ? (
                  <video
                    src={featuredPerformance.videoUrl}
                    poster={featuredPerformance.thumbnail}
                    controls
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      background: "#000",
                    }}
                  />
                ) : featuredPerformance.isShort ? (
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 260,
                      aspectRatio: "9/16",
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      position: "relative",
                      background: "#000",
                    }}
                  >
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${featuredPerformance.youtubeId}?rel=0&modestbranding=1`}
                      title={featuredPerformance.title}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${featuredPerformance.youtubeId}?rel=0&modestbranding=1`}
                    title={featuredPerformance.title}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={120}>
              <div>
                <Badge tone="gold">{featuredPerformance.category}</Badge>
                <h3
                  style={{
                    fontSize: 26,
                    margin: "12px 0 6px",
                    color: "var(--navy)",
                  }}
                >
                  {featuredPerformance.title}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--gold)",
                    fontWeight: 700,
                    margin: "0 0 12px",
                  }}
                >
                  {featuredPerformance.performer} • {featuredPerformance.date}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  {featuredPerformance.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Button onClick={() => go("apply")}>
                    Start learning this instrument
                  </Button>
                  <button
                    onClick={() => go("performances")}
                    className="btn btn-secondary inline-flex items-center gap-1.5"
                  >
                    More videos <Icon name="arrow" size={14} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 10. Instrument Repairs Teaser (Killer Vivadoxa Differentiator) ─ */}
      <section
        className="section"
        style={{ background: "white", borderTop: "1px solid var(--line)" }}
      >
        <div className="container overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-center">
            <ScrollReveal direction="left">
              <div>
                <Badge tone="gold">In-House Instrument Clinic</Badge>
                <h2
                  style={{
                    fontSize: "clamp(30px, 4vw, 46px)",
                    margin: "14px 0 16px",
                    color: "var(--navy)",
                  }}
                >
                  Expert repairs &amp; precision servicing for your instruments.
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 15,
                    lineHeight: 1.7,
                    maxWidth: 540,
                  }}
                >
                  From sticky piano keys and fret buzz to brass valve alignment
                  and violin bridge refitting. Choose{" "}
                  <strong>Studio Drop-off</strong> in Kaduna or request a{" "}
                  <strong>Courier Pickup</strong> right from your doorstep.
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5 mt-6">
                  <Button onClick={() => go("repairs")}>
                    Book a Repair Diagnostic <Icon name="arrow" />
                  </Button>
                  <button
                    onClick={() => go("repairs")}
                    className="btn btn-secondary inline-flex items-center justify-center gap-1.5"
                  >
                    Track Existing Order
                  </button>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={120}>
              <div>
                <div style={{ position: "relative" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--line)] bg-[#0a192f] h-36 sm:h-48 group">
                      <img
                        src={repairSaxImg}
                        alt="Brass & saxophone overhaul at Vivadoxa workshop"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        className="transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--line)] bg-[#0a192f] h-36 sm:h-48 group">
                      <img
                        src={repairElectronicsImg}
                        alt="Keyboard electronics diagnostic with multimeter at Vivadoxa clinic"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        className="transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 rounded-[var(--radius)] bg-[var(--cream)] border border-[var(--line)] flex flex-col gap-4">
                    <div className="flex items-start gap-3.5">
                      <span className="text-xs font-mono font-bold text-[var(--gold-text)] bg-[var(--gold)]/10 px-2 py-1 rounded border border-[var(--gold)]/20 shrink-0">
                        01
                      </span>
                      <div>
                        <strong className="block text-sm text-[var(--navy)] font-semibold">
                          Transparent Diagnostic Assessment
                        </strong>
                        <span className="text-xs text-[var(--muted)] leading-relaxed block mt-0.5">
                          Written technical evaluation and estimate before
                          benchwork commences
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <span className="text-xs font-mono font-bold text-[var(--gold-text)] bg-[var(--gold)]/10 px-2 py-1 rounded border border-[var(--gold)]/20 shrink-0">
                        02
                      </span>
                      <div>
                        <strong className="block text-sm text-[var(--navy)] font-semibold">
                          Chain-of-Custody Order Tracking
                        </strong>
                        <span className="text-xs text-[var(--muted)] leading-relaxed block mt-0.5">
                          Follow 5 diagnostic stages from intake through
                          acoustic test to handover
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <span className="text-xs font-mono font-bold text-[var(--gold-text)] bg-[var(--gold)]/10 px-2 py-1 rounded border border-[var(--gold)]/20 shrink-0">
                        03
                      </span>
                      <div>
                        <strong className="block text-sm text-[var(--navy)] font-semibold">
                          Logistics Pickup Across Kaduna
                        </strong>
                        <span className="text-xs text-[var(--muted)] leading-relaxed block mt-0.5">
                          Doorstep courier collection and protected transit for
                          precious instruments
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 11. Music Studio & Audio Production Showcase (Core SEO Pillar) ── */}
      <section
        className="section overflow-hidden"
        style={{
          background: "var(--cream)",
          borderTop: "1px solid var(--line)",
        }}
        id="music-studio"
      >
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14 items-center">
            <ScrollReveal direction="left" className="order-2 lg:order-1">
              <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--line)] bg-[#0a192f] h-36 sm:h-48 group">
                    <img
                      src="/media/studio/multi-instrument-lab.jpeg"
                      alt="Modern recording studio multitrack console at Vivadoxa Kaduna"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      className="transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--line)] bg-[#0a192f] h-36 sm:h-48 group">
                    <img
                      src="/media/studio/studio-keyboard-lab.jpeg"
                      alt="Acoustic keyboard workstation lab and recording booth in Kaduna"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      className="transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="p-5 sm:p-6 rounded-[var(--radius)] bg-white border border-[var(--line)] flex flex-col gap-4 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <span className="text-xs font-mono font-bold bg-[var(--navy)] text-[var(--gold2)] px-2 py-1 rounded shrink-0">
                      01
                    </span>
                    <div>
                      <strong className="block text-sm text-[var(--navy)] font-semibold">
                        Treated Isolation Vocal Booths
                      </strong>
                      <span className="text-xs text-[var(--muted)] leading-relaxed block mt-0.5">
                        Zero-bleed acoustic dampening with studio-grade
                        condenser tracking
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <span className="text-xs font-mono font-bold bg-[var(--navy)] text-[var(--gold2)] px-2 py-1 rounded shrink-0">
                      02
                    </span>
                    <div>
                      <strong className="block text-sm text-[var(--navy)] font-semibold">
                        Live Band Rehearsal Suites
                      </strong>
                      <span className="text-xs text-[var(--muted)] leading-relaxed block mt-0.5">
                        Full acoustic drum kit, tube amplifiers &amp; multitrack
                        PA arrays
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <span className="text-xs font-mono font-bold bg-[var(--navy)] text-[var(--gold2)] px-2 py-1 rounded shrink-0">
                      03
                    </span>
                    <div>
                      <strong className="block text-sm text-[var(--navy)] font-semibold">
                        Stem Mixing &amp; Digital Mastering
                      </strong>
                      <span className="text-xs text-[var(--muted)] leading-relaxed block mt-0.5">
                        Radio-ready -14 LUFS international streaming
                        deliverables
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal
              direction="right"
              delay={120}
              className="order-1 lg:order-2"
            >
              <div>
                <Badge tone="gold">State-of-the-Art Music Studio</Badge>
                <h2
                  style={{
                    fontSize: "clamp(30px, 4vw, 46px)",
                    margin: "14px 0 16px",
                    color: "var(--navy)",
                  }}
                >
                  Acoustic recording, rehearsal rooms &amp; sound production.
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 15,
                    lineHeight: 1.7,
                    maxWidth: 540,
                  }}
                >
                  Whether you are tracking vocals, recording a gospel choir,
                  cutting a live rhythm section, or booking band
                  rehearsals—Vivadoxa Music Studio delivers crystal-clear
                  acoustic isolation, high-end condenser mics, and experienced
                  audio engineers in Kaduna.
                </p>
                <div className="flex flex-col sm:flex-row gap-3.5 mt-6">
                  <Button onClick={() => go("studio")}>
                    Explore Music Studio <Icon name="arrow" />
                  </Button>
                  <a
                    href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20would%20like%20to%20book%20a%20music%20studio%20session.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary inline-flex items-center justify-center gap-2"
                  >
                    <WhatsAppIcon size={18} />
                    <span>Book Studio Session</span>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 12. Omnichannel Admissions Contact Hub (Parara Model) ─────────── */}
      <section
        className="section overflow-hidden"
        style={{ background: "white" }}
      >
        <div className="container">
          <ScrollReveal direction="up">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="eyebrow">Direct Admissions Desk</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mt-2">
                Talk to admissions before you commit.
              </h2>
              <p className="text-sm md:text-base text-slate-500 mt-2">
                Share your musical background, age bracket, and whether you
                prefer studio lessons, live online sessions, or home coaching in
                Kaduna.
              </p>
            </div>
          </ScrollReveal>

          <div className="admissions-hub-grid">
            <ScrollReveal direction="left">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="admissions-hub-card wa-highlight group h-full"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-[var(--whatsapp)] text-white flex items-center justify-center shadow-md">
                    <WhatsAppIcon size={20} />
                  </div>
                  <strong>Admissions Desk on WhatsApp</strong>
                  <p>
                    Instant guidance on term schedules, graded syllabi, and
                    private home coaching enrollment.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--whatsapp)] mt-4 group-hover:translate-x-1 transition-transform">
                  Chat with Admissions Desk →
                </span>
              </a>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={100}>
              <a
                href={`tel:${SCHOOL_PHONE}`}
                className="admissions-hub-card group h-full"
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                    style={{ background: "var(--navy)", color: "var(--gold2)" }}
                  >
                    <Icon name="phone" size={18} />
                  </div>
                  <strong>Direct Phone Lines</strong>
                  <p>
                    Speak directly with our registrar on {SCHOOL_PHONE} or{" "}
                    {SCHOOL_PHONE_2}.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                  Call {SCHOOL_PHONE} →
                </span>
              </a>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={100}>
              <a
                href={`mailto:${SCHOOL_EMAIL}`}
                className="admissions-hub-card group h-full"
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                    style={{ background: "var(--navy)", color: "var(--gold2)" }}
                  >
                    <Icon name="mail" size={18} />
                  </div>
                  <strong>Email Admissions</strong>
                  <p>
                    Send syllabus inquiries, church choir booking requests, or
                    school partnerships.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                  Email {SCHOOL_EMAIL} →
                </span>
              </a>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div
                onClick={() => go("contact")}
                className="admissions-hub-card group cursor-pointer h-full"
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                    style={{ background: "var(--navy)", color: "var(--gold2)" }}
                  >
                    <Icon name="pin" size={18} />
                  </div>
                  <strong>Visit the Studio</strong>
                  <p>
                    {SCHOOL_ADDRESS}. Tour our studios and test instruments.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                  View location &amp; hours →
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 13. Verified Community & Google Reviews Spotlight ─────────────── */}
      <HomeReviewsSpotlight go={go} />

      <Cta go={go} />
    </main>
  )
}

export default Home
