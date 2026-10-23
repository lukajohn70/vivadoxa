import { useState, useEffect } from "react"
import { Button, Badge, SectionHead, Icon, Cta, WhatsAppIcon, GoogleIcon } from "@/components/ui"
import { HomeReviewsSpotlight } from "@/components/HomeReviewsSpotlight"
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

export function Home({ go }: { go: (p: Page) => void }) {
  const [recitals, setRecitals] = useState(staticPerformances)
  const [soundCategory, setSoundCategory] = useState<string>("All")
  const [showAllInstruments, setShowAllInstruments] = useState(false)

  // Frontend-backend live data synchronization for recitals
  useEffect(() => {
    fetchAcademics("performances").then((dbPerf) => {
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
          }))
        )
      }
    }).catch(() => {})
  }, [])

  const featuredPerformance = recitals.find((p) => p.youtubeId === "-IcdMT9uCLU") || recitals[0] || staticPerformances[0]

  const soundCategories = ["All", "Woodwinds", "Brass", "Keys", "Strings & Frets", "Percussion", "Voice"] as const

  const allCategoryInstruments = soundCategory === "All"
    ? soundExplorerInstruments
    : soundExplorerInstruments.filter((inst) => inst.category === soundCategory)

  // Initial view displays top 6 flagship disciplines when "All" is active; expands on toggle
  const visibleInstruments = (soundCategory === "All" && !showAllInstruments)
    ? allCategoryInstruments.slice(0, 6)
    : allCategoryInstruments

  return (
    <main>
      {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <Badge tone="gold">Actualize your passion · {new Date().getFullYear()} Enrolment Open</Badge>
            <h1>
              Learn music.
              <br />
              <em>Master your craft.</em>
            </h1>
            <p>
              Expert-led music education and graded conservatory preparation that builds confident musicians—one note, one lesson, one stage at a time.
            </p>
            <div className="button-row">
              <Button onClick={() => go("apply")}>
                Start your journey <Icon name="arrow" />
              </Button>
              <Button variant="secondary" onClick={() => go("programs")}>
                Explore programs
              </Button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center gap-2.5 transition-all"
                style={{
                  borderColor: "rgba(37, 211, 102, 0.4)",
                  color: "#25D366",
                  background: "rgba(37, 211, 102, 0.12)",
                }}
              >
                <WhatsAppIcon size={20} />
                <span>WhatsApp Admissions</span>
              </a>
            </div>
            <div className="trust-row">
              <div className="avatars" aria-hidden="true">
                <span>A</span>
                <span>T</span>
                <span>K</span>
              </div>
              <p>
                <strong>4.9 / 5</strong>
                <br />
                from our learning community in Kaduna
              </p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="gold-shape" aria-hidden="true" />
            <img
              src={heroImg}
              alt="Young African musicians performing together at Vivadoxa"
              fetchPriority="high"
            />
            <div className="floating-card" aria-hidden="true">
              <span className="play">
                <Icon name="music" size={14} />
              </span>
              <div>
                <strong>Find your sound</strong>
                <small>30+ expert-led courses</small>
              </div>
            </div>
            <div className="staff-lines" aria-hidden="true" />
          </div>
        </div>
      </section>



      {/* ── 4. "Pick Your Sound" Interactive Explorer (Parara Landmark) ──── */}
      <section className="section" style={{ background: "#FAF8F5", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }} id="instruments">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <span className="eyebrow">Musical Disciplines</span>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 44px)", margin: "8px 0 0", color: "var(--navy)" }}>
                Pick your sound. Master your instrument.
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 15, margin: "8px 0 0", maxWidth: 640, lineHeight: 1.6 }}>
                Structured, practical instruction across 13 core instrumental disciplines and voice training. Available via in-studio lessons in Kaduna or private home coaching.
              </p>
            </div>
            <Button variant="secondary" onClick={() => go("programs")}>
              View full curriculum <Icon name="arrow" />
            </Button>
          </div>

          {/* Sound Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-xl bg-white border border-[var(--line)] w-max max-w-full overflow-x-auto shadow-xs">
            {soundCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSoundCategory(cat)}
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

          {/* Sound Explorer Grid */}
          <div className="sound-explorer-grid">
            {visibleInstruments.map((inst) => {
              const waText = `Hello Vivadoxa, I am interested in learning the ${inst.name} (${inst.tag}) program.`
              return (
                <article key={inst.id} className="sound-card group">
                  <div className="sound-img-wrap">
                    <img src={inst.image} alt={inst.name} loading="lazy" />
                    <div className="sound-img-overlay" />
                    <span className="sound-badge-pill">{inst.tag}</span>
                    <span className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-300 bg-black/60 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur">
                      {inst.recommendedAge}
                    </span>
                  </div>

                  <div className="sound-card-body">
                    <h3>{inst.name}</h3>
                    <p className="headline">{inst.headline}</p>
                    <p className="desc">{inst.description}</p>

                    <div className="sound-skills-list">
                      {inst.skills.map((skill) => (
                        <span key={skill} className="sound-skill-tag">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-3 pt-2.5 border-t border-[var(--line)]">
                      <span className="text-[11px] text-[var(--muted)] font-medium">Training Format:</span>
                      <strong className="text-[var(--navy)] text-xs font-semibold">Studio &amp; Home Coaching</strong>
                    </div>

                    <div className="sound-card-actions">
                      <a
                        href={`${WHATSAPP_URL}?text=${encodeURIComponent(waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sound-wa-btn"
                        aria-label={`Ask about ${inst.name} on WhatsApp`}
                        title="Inquire on WhatsApp"
                      >
                        <WhatsAppIcon size={16} />
                        <span>Inquire</span>
                      </a>
                      <button
                        onClick={() => go("apply")}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--gold)] hover:text-[var(--navy)] uppercase tracking-wider group-hover:translate-x-1 transition-all"
                      >
                        <span>Enroll</span>
                        <Icon name="arrow" size={14} />
                      </button>
                    </div>
                  </div>
                </article>
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
                <span>{showAllInstruments ? "Show Fewer Disciplines" : "Show All 13 Disciplines"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--gold)]/15 text-[var(--gold2)] font-semibold">
                  {showAllInstruments ? "Showing 13" : "+7 more"}
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
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <span className="eyebrow">Tuition &amp; Fees Schedule</span>
              <h2 style={{ margin: "10px 0 0", color: "var(--navy)" }}>
                Official Programmes &amp; Fees
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0", maxWidth: 640 }}>
                Prices are uniform across all musical instruments and voice training. Every program includes complete study materials, graded syllabus prep, and studio access.
              </p>
            </div>
            <Button variant="secondary" onClick={() => go("programs")} className="w-full sm:w-auto justify-center min-h-[44px]">
              View complete catalog &amp; study packs <Icon name="arrow" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {officialPricingTiers.map((tier) => (
              <div
                key={tier.id}
                style={{
                  background: tier.popular ? "linear-gradient(180deg, #fffcf7 0%, #ffffff 100%)" : "white",
                  borderRadius: "var(--radius)",
                  border: tier.popular ? "2px solid var(--gold)" : "1px solid var(--line)",
                  boxShadow: tier.popular ? "0 10px 30px rgba(201,107,50,0.12)" : "0 4px 16px rgba(0,0,0,0.03)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                className="p-5 sm:p-6 rounded-2xl flex flex-col relative transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {tier.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: 18,
                      background: tier.popular ? "var(--gold)" : "var(--navy)",
                      color: tier.popular ? "var(--navy)" : "white",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      padding: "3px 12px",
                      borderRadius: 99,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      zIndex: 10,
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div style={{ marginTop: tier.badge ? 6 : 0, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold2)", textTransform: "uppercase", letterSpacing: 1 }}>
                    {tier.duration}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "clamp(19px, 3.5vw, 21px)",
                      color: "var(--navy)",
                      margin: "4px 0 6px",
                      lineHeight: 1.25,
                    }}
                  >
                    {tier.name}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                    {tier.description}
                  </p>
                </div>

                <div
                  style={{
                    background: "var(--cream)",
                    padding: "12px 14px",
                    borderRadius: 8,
                    marginBottom: 14,
                    border: "1px solid var(--line)",
                  }}
                >
                  <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--muted)", display: "block" }}>
                    Tuition Fee
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <strong style={{ fontSize: "clamp(22px, 5vw, 26px)", color: "var(--navy)", fontFamily: "'DM Serif Display', serif" }}>
                      {tier.fee}
                    </strong>
                    {tier.id === "tier-home" && (
                      <small style={{ fontSize: 11, color: "var(--muted)" }}>/ month</small>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--ink)", fontWeight: 600 }}>
                    {tier.target}
                  </span>
                </div>

                <div style={{ flex: 1, marginBottom: 16 }}>
                  <strong style={{ fontSize: 11, color: "var(--navy)", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
                    Study Pack &amp; Inclusions:
                  </strong>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {tier.inclusions.slice(0, 4).map((inc, i) => (
                      <li key={i} style={{ fontSize: 11.5, color: "#334155", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.45 }}>
                        <span style={{ color: "var(--gold)", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 8 }}>
                  <Button
                    variant={tier.popular ? "primary" : "secondary"}
                    onClick={() => go("apply")}
                    className="flex-1 py-3 text-xs sm:text-sm font-bold min-h-[44px] justify-center"
                  >
                    Enroll Now <Icon name="arrow" size={13} />
                  </Button>
                  <a
                    href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20am%20interested%20in%20the%20${encodeURIComponent(tier.name)}%20(${encodeURIComponent(tier.fee)}).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-95 bg-[#e8f7f0] text-[#25D366] hover:bg-[#d1f2e2]"
                    title="Inquire on WhatsApp"
                    aria-label={`Ask about ${tier.name} on WhatsApp`}
                  >
                    <WhatsAppIcon size={20} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Live Recital & Performance Showcase ───────────────────────── */}
      <section className="section" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 35 }}>
            <div>
              <span className="eyebrow">Stage Experience</span>
              <h2 style={{ margin: "10px 0 0", color: "var(--navy)" }}>
                The school should feel alive before you step in.
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0", maxWidth: 600 }}>
                Watch our students in recitals, youth ensembles, and concert medleys. Real music, genuine growth, and visible stage confidence.
              </p>
            </div>
            <Button variant="secondary" onClick={() => go("performances")}>
              Watch all recitals <Icon name="arrow" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 items-center p-6 sm:p-8 rounded-2xl border bg-white" style={{ borderColor: "var(--line)" }}>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)", background: featuredPerformance.isShort ? "#080c14" : "#000", aspectRatio: featuredPerformance.isShort ? undefined : "16/9", display: "flex", alignItems: "center", justifyContent: "center", padding: featuredPerformance.isShort ? 24 : 0 }}>
              {featuredPerformance.videoUrl ? (
                <video
                  src={featuredPerformance.videoUrl}
                  poster={featuredPerformance.thumbnail}
                  controls
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                />
              ) : featuredPerformance.isShort ? (
                <div style={{ width: "100%", maxWidth: 260, aspectRatio: "9/16", borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)", position: "relative", background: "#000" }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${featuredPerformance.youtubeId}?rel=0&modestbranding=1`}
                    title={featuredPerformance.title}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
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

            <div>
              <Badge tone="gold">{featuredPerformance.category}</Badge>
              <h3 style={{ fontSize: 26, margin: "12px 0 6px", color: "var(--navy)" }}>
                {featuredPerformance.title}
              </h3>
              <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, margin: "0 0 12px" }}>
                {featuredPerformance.performer} • {featuredPerformance.date}
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
                {featuredPerformance.description}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
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
          </div>
        </div>
      </section>



      {/* ── 10. Instrument Repairs Teaser (Killer Vivadoxa Differentiator) ─ */}
      <section className="section" style={{ background: "white", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-center">
            <div>
              <Badge tone="gold">In-House Instrument Clinic</Badge>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 46px)", margin: "14px 0 16px", color: "var(--navy)" }}>
                Expert repairs &amp; precision servicing for your instruments.
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                From sticky piano keys and fret buzz to brass valve alignment and violin bridge refitting. Choose <strong>Studio Drop-off</strong> in Kaduna or request a <strong>Courier Pickup</strong> right from your doorstep.
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

            <div>
              <div style={{ position: "relative" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--line)] bg-[#0a192f] h-36 sm:h-48">
                    <img
                      src={repairSaxImg}
                      alt="Brass & saxophone overhaul at Vivadoxa workshop"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>
                  <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--line)] bg-[#0a192f] h-36 sm:h-48">
                    <img
                      src={repairElectronicsImg}
                      alt="Keyboard electronics diagnostic with multimeter at Vivadoxa clinic"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-[var(--radius)] bg-[var(--cream)] border border-[var(--line)] flex flex-col gap-3.5">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      ✓
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: 13, color: "var(--navy)" }}>Transparent Diagnostic Estimates</strong>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Written cost assessment before work begins</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      ✓
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: 13, color: "var(--navy)" }}>Public Order Tracker</strong>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Track 5 stages from intake to final handover</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      ✓
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: 13, color: "var(--navy)" }}>Logistics Pickup Across Kaduna</strong>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Doorstep courier collection &amp; safe return</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── 12. Omnichannel Admissions Contact Hub (Parara Model) ─────────── */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="eyebrow">Direct Admissions Desk</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mt-2">
              Talk to admissions before you commit.
            </h2>
            <p className="text-sm md:text-base text-slate-500 mt-2">
              Share your musical background, age bracket, and whether you prefer studio lessons, live online sessions, or home coaching in Kaduna.
            </p>
          </div>

          <div className="admissions-hub-grid">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="admissions-hub-card wa-highlight group"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
                  <WhatsAppIcon size={22} />
                </div>
                <strong>Chat on WhatsApp</strong>
                <p>Instant answers on tuition, batch schedules, and customized learning plans.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Open WhatsApp Desk →
              </span>
            </a>

            <a
              href={`tel:${SCHOOL_PHONE}`}
              className="admissions-hub-card group"
            >
              <div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                  style={{ background: "var(--navy)", color: "var(--gold2)" }}
                >
                  <Icon name="phone" size={18} />
                </div>
                <strong>Direct Phone Lines</strong>
                <p>Speak directly with our registrar on {SCHOOL_PHONE} or {SCHOOL_PHONE_2}.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                Call {SCHOOL_PHONE} →
              </span>
            </a>

            <a
              href={`mailto:${SCHOOL_EMAIL}`}
              className="admissions-hub-card group"
            >
              <div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                  style={{ background: "var(--navy)", color: "var(--gold2)" }}
                >
                  <Icon name="mail" size={18} />
                </div>
                <strong>Email Admissions</strong>
                <p>Send syllabus inquiries, church choir booking requests, or school partnerships.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                Email {SCHOOL_EMAIL} →
              </span>
            </a>

            <div
              onClick={() => go("contact")}
              className="admissions-hub-card group cursor-pointer"
            >
              <div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                  style={{ background: "var(--navy)", color: "var(--gold2)" }}
                >
                  <Icon name="pin" size={18} />
                </div>
                <strong>Visit the Studio</strong>
                <p>{SCHOOL_ADDRESS}. Tour our studios and test instruments.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                View location &amp; hours →
              </span>
            </div>
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
