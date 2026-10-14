import { useState, useEffect } from "react"
import { Button, Badge, SectionHead, Icon, Cta, WhatsAppIcon } from "@/components/ui"
import {
  programs as staticPrograms,
  heroImg,
  studioImg,
  accreditations,
  ageTracks,
  performances as staticPerformances,
  portraitImg,
  soundExplorerInstruments,
  digitalCourses,
  institutionalPartners,
  masterMentorshipHighlights,
} from "@/lib/data"
import { fetchAcademics } from "@/lib/api"
import { WHATSAPP_URL } from "@/lib/utils"
import type { Page, Program } from "@/types"

function ProgramCard({ item, go }: { item: Program; go: (p: Page) => void }) {
  const whatsappInquiry = `${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20am%20interested%20in%20the%20${encodeURIComponent(item.name)}%20course.`

  return (
    <article className="program-card">
      <div className="card-image">
        <img src={item.image} alt={`${item.name} music lesson at Vivadoxa`} loading="lazy" />
        <Badge tone="gold">{item.tag}</Badge>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>12 weeks</span>
          <span>{item.ageGroup || "Onsite + Online"}</span>
        </div>
        <h3>{item.name}</h3>
        <p>{item.desc}</p>
        <div className="card-foot">
          <strong>
            {item.fee}
            <small> / term</small>
          </strong>
          <div className="flex items-center gap-2">
            <a
              href={whatsappInquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-emerald-500/15 text-[#25D366] hover:bg-emerald-500/25 transition-colors"
              aria-label={`Ask about ${item.name} on WhatsApp`}
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon size={18} />
            </a>
            <button
              onClick={() => go("apply")}
              aria-label={`Apply for ${item.name}`}
            >
              <Icon name="arrow" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function Home({ go }: { go: (p: Page) => void }) {
  const [courses, setCourses] = useState<Program[]>(staticPrograms)
  const [recitals, setRecitals] = useState(staticPerformances)
  const [soundCategory, setSoundCategory] = useState<string>("All")

  // Frontend-backend live data synchronization
  useEffect(() => {
    fetchAcademics("programs").then((dbCourses) => {
      if (Array.isArray(dbCourses) && dbCourses.length > 0) {
        setCourses(
          dbCourses.map((c: any) => ({
            name: c.name,
            tag: c.tag || "Popular",
            image: c.image || staticPrograms[0]?.image,
            fee: c.fee || "₦85,000",
            feeAmount: parseFloat(c.fee_amount || "85000"),
            desc: c.desc || "",
            category: c.category || "Instruments",
            ageGroup: c.age_group || "All Ages",
            level: c.level || "Beginner",
          }))
        )
      }
    }).catch(() => {})

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
          }))
        )
      }
    }).catch(() => {})
  }, [])

  const featured = courses.slice(0, 3)
  const featuredPerformance = recitals[0] || staticPerformances[0]

  const soundCategories = ["All", "Keys", "Wind & Brass", "Chamber Strings", "Percussion", "Strings & Frets", "Voice", "Studio Tech"]

  const filteredInstruments = soundCategory === "All"
    ? soundExplorerInstruments
    : soundExplorerInstruments.filter((inst) => inst.category === soundCategory)

  return (
    <main>
      {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <Badge tone="gold">Enrolment now open · {new Date().getFullYear()} session</Badge>
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
              <span className="play">♪</span>
              <div>
                <strong>Find your sound</strong>
                <small>30+ expert-led courses</small>
              </div>
            </div>
            <div className="staff-lines" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ── 2. Institutional Trust & Partner Strip (Parara Benchmark) ─────── */}
      <section className="trust-strip" aria-label="Institutional partners">
        <div className="container">
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-zinc-400">
              Trusted by Leading Schools, Church Choirs &amp; Ministries Across Kaduna
            </span>
          </div>
          <div className="trust-marquee-track">
            {institutionalPartners.map((partner) => (
              <div key={partner.name} className="trust-partner-chip">
                <span className="dot" />
                <span>{partner.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">({partner.badge})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Stats Section ─────────────────────────────────────────────── */}
      <section className="stats" aria-label="School highlights">
        <div className="container stats-grid">
          {[
            ["12+", "Years teaching"],
            ["1,500+", "Students trained"],
            ["15", "Instruments"],
            ["24", "Expert instructors"],
          ].map(([n, l]) => (
            <div key={l}>
              <strong>{n}</strong>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. "Pick Your Sound" Interactive Explorer (Parara Landmark) ──── */}
      <section className="section bg-[#0a0a0a] text-white border-b border-white/10" id="instruments">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <span className="eyebrow" style={{ color: "var(--gold2)" }}>Instruments &amp; Soundboard</span>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mt-2">
                Pick your sound. Master your instrument.
              </h2>
              <p className="text-zinc-400 text-sm md:text-base mt-3 leading-relaxed">
                Start with one instrument, build solid fundamentals, and grow with a structured roadmap designed for confidence on stage, church, or studio.
              </p>
            </div>
            <Button variant="secondary" onClick={() => go("programs")} style={{ borderColor: "rgba(255,255,255,0.25)", color: "white" }}>
              View full curriculum <Icon name="arrow" />
            </Button>
          </div>

          {/* Sound Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6 p-2 rounded-2xl bg-white/[0.03] border border-white/10 w-max max-w-full overflow-x-auto">
            {soundCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSoundCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  soundCategory === cat
                    ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sound Explorer Grid */}
          <div className="sound-explorer-grid">
            {filteredInstruments.map((inst) => {
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 uppercase tracking-wider group-hover:translate-x-1 transition-transform"
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
        </div>
      </section>

      {/* ── 5. Age-Group Learner Pathways ────────────────────────────────── */}
      <section className="section" style={{ background: "var(--cream)" }}>
        <div className="container">
          <SectionHead
            center
            eyebrow="A Clear Path for Every Age"
            title="Music education designed for how you learn"
            body="Whether cultivating an early love for music in a child, honing band stagecraft in a teenager, or fulfilling a lifelong passion as an adult."
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 40 }}>
            {ageTracks.map((track) => (
              <article
                key={track.id}
                style={{
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  padding: 32,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span className="eyebrow" style={{ fontSize: 11 }}>{track.age}</span>
                    <Badge tone="gold">Guided Track</Badge>
                  </div>
                  <h3 style={{ fontSize: 24, margin: "8px 0 10px", color: "var(--navy)" }}>
                    {track.title}
                  </h3>
                  <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                    {track.tagline}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {track.points.map((pt) => (
                      <li key={pt} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--ink)" }}>
                        <span style={{ color: "var(--gold)", fontWeight: 700 }}>✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    onClick={() => go("programs")}
                    style={{ border: 0, background: "none", color: "var(--gold)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer" }}
                  >
                    View Courses →
                  </button>
                  <Button onClick={() => go("apply")}>
                    Enroll Now
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Artistic Director VIP 1-on-1 Studio (Parara Founder Model) ── */}
      <section className="section" style={{ background: "var(--navy)", color: "white" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 70, alignItems: "center" }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--gold2)" }}>VIP Mentorship</span>
            <h2 style={{ color: "white", fontSize: "clamp(34px, 4vw, 50px)", margin: "12px 0 18px" }}>
              Direct with the Artistic Director.
            </h2>
            <p style={{ color: "#c1ccd5", fontSize: 16, lineHeight: 1.7, maxWidth: 540 }}>
              Personal masterclasses and executive guidance with <strong>Tosin Adewale</strong>, Founder &amp; Artistic Director. Built for advanced instrumentalists, church music leads, and candidates preparing for international conservatory diplomas.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "28px 0" }}>
              {masterMentorshipHighlights.map((hl) => (
                <div
                  key={hl.title}
                  style={{
                    padding: "16px 18px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,107,50,0.25)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <strong style={{ color: "var(--gold2)", fontSize: 14, display: "block", marginBottom: 3 }}>
                    {hl.title}
                  </strong>
                  <small style={{ color: "#9dacb8", fontSize: 12 }}>{hl.desc}</small>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Button onClick={() => go("apply")}>
                Apply for Director Mentorship <Icon name="arrow" />
              </Button>
              <a
                href={`${WHATSAPP_URL}?text=Hello%20Director%20Tosin,%20I%20would%20like%20to%20inquire%20about%20One-on-One%20VIP%20Mentorship%20at%20Vivadoxa.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center gap-2"
                style={{
                  borderColor: "rgba(37, 211, 102, 0.4)",
                  color: "#25D366",
                  background: "rgba(37, 211, 102, 0.1)",
                }}
              >
                <WhatsAppIcon size={18} /> Inquire on WhatsApp
              </a>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid rgba(201,107,50,0.3)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
              <img
                src={portraitImg}
                alt="Tosin Adewale, Founder & Artistic Director of Vivadoxa Music School"
                style={{ height: 460, width: "100%", objectFit: "cover" }}
              />
              <div style={{ padding: "20px 24px", background: "var(--navy2)", borderTop: "1px solid rgba(201,107,50,0.2)" }}>
                <strong style={{ fontSize: 19, color: "white", display: "block", fontFamily: "'DM Serif Display', serif" }}>
                  Tosin Adewale
                </strong>
                <span style={{ fontSize: 11, color: "var(--gold2)", textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: 700 }}>
                  Founder &amp; Artistic Director
                </span>
                <p style={{ fontSize: 12, color: "#9dacb8", margin: "6px 0 0" }}>
                  Concert pianist and music educator guiding musicians in Kaduna since 2013.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. On-Demand Digital Video Courses (Self-Paced Tier) ─────────── */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <span className="eyebrow">Self-Paced Masterclasses</span>
              <h2 style={{ margin: "10px 0 0", color: "var(--navy)" }}>
                Learn at your own pace. Anywhere, anytime.
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 15, margin: "6px 0 0", maxWidth: 640 }}>
                Can&apos;t attend onsite classes? Master chords, vocal placement, and tight drumming pocket through structured video lessons recorded in our Kaduna studio.
              </p>
            </div>
            <Button variant="secondary" onClick={() => go("programs")}>
              Browse all courses <Icon name="arrow" />
            </Button>
          </div>

          <div className="digital-courses-grid">
            {digitalCourses.map((course) => (
              <article key={course.id} className="digital-course-card">
                <div className="course-card-thumb">
                  <img src={course.image} alt={course.title} loading="lazy" />
                  <span className="course-meta-chip">
                    {course.lessonsCount} lessons • {course.duration}
                  </span>
                </div>
                <div className="digital-course-body">
                  <div className="flex items-center justify-between mb-1">
                    <Badge tone="gold">{course.tag}</Badge>
                    <span className="text-xs text-amber-500 font-bold">★ {course.rating}</span>
                  </div>
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <div className="digital-course-foot">
                    <strong>{course.fee}</strong>
                    <Button onClick={() => go("apply")}>
                      Get Access
                    </Button>
                  </div>
                </div>
              </article>
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

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 40, alignItems: "center", background: "white", padding: 32, borderRadius: "var(--radius)", border: "1px solid var(--line)" }}>
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)", background: "#000", aspectRatio: "16/9" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${featuredPerformance.youtubeId}?rel=0&modestbranding=1`}
                title={featuredPerformance.title}
                style={{ width: "100%", height: "100%", border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

      {/* ── 9. Featured Programs Grid ────────────────────────────────────── */}
      <section className="section" aria-labelledby="programs-heading">
        <div className="container">
          <SectionHead
            eyebrow="Explore your sound"
            title="A program for every ambition"
            body="From your very first note to advanced performance, learn with patient instructors and a practical curriculum."
          />
          <div className="program-grid">
            {featured.map((item) => (
              <ProgramCard item={item} go={go} key={item.name} />
            ))}
          </div>
          <div className="center-action">
            <Button variant="secondary" onClick={() => go("programs")}>
              View all programs <Icon name="arrow" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── 10. Instrument Repairs Teaser (Killer Vivadoxa Differentiator) ─ */}
      <section className="section" style={{ background: "white", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 60, alignItems: "center" }}>
            <div>
              <Badge tone="gold">In-House Instrument Clinic</Badge>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 46px)", margin: "14px 0 16px", color: "var(--navy)" }}>
                Expert repairs &amp; precision servicing for your instruments.
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
                From sticky piano keys and fret buzz to brass valve alignment and violin bridge refitting. Choose <strong>Studio Drop-off</strong> in Kaduna or request a <strong>Courier Pickup</strong> right from your doorstep.
              </p>
              <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
                <Button onClick={() => go("repairs")}>
                  Book a Repair Diagnostic <Icon name="arrow" />
                </Button>
                <button
                  onClick={() => go("repairs")}
                  className="btn btn-secondary inline-flex items-center gap-1.5"
                >
                  Track Existing Order
                </button>
              </div>
            </div>

            <div>
              <div style={{ padding: 32, borderRadius: "var(--radius)", background: "var(--cream)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "grid", placeItems: "center", fontWeight: 700 }}>
                    ✓
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: 14, color: "var(--navy)" }}>Transparent Diagnostic Estimates</strong>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Written cost assessment before work begins</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "grid", placeItems: "center", fontWeight: 700 }}>
                    ✓
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: 14, color: "var(--navy)" }}>Public Order Tracker</strong>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Track 5 stages from intake to final handover</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold)", color: "var(--navy)", display: "grid", placeItems: "center", fontWeight: 700 }}>
                    ✓
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: 14, color: "var(--navy)" }}>Logistics Pickup Across Kaduna</strong>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Doorstep courier collection &amp; safe return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Accreditation & Examination Standards ─────────────────────── */}
      <section className="section" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 35px" }}>
            <span className="eyebrow">Academic Benchmark</span>
            <h2 style={{ fontSize: 32, margin: "8px 0 10px", color: "var(--navy)" }}>
              Aligned with global music examination boards
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
              We prepare candidates for graded theory and practical examinations with internationally recognized boards.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {accreditations.map((acc) => (
              <div
                key={acc.name}
                style={{ padding: 24, background: "white", borderRadius: "var(--radius)", border: "1px solid var(--line)", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: 1 }}>
                  {acc.name}
                </span>
                <h4 style={{ margin: "8px 0 6px", fontSize: 17, color: "var(--navy)", fontFamily: "'DM Serif Display', serif" }}>{acc.badge}</h4>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{acc.detail}</p>
              </div>
            ))}
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
              href="tel:+2348031308881"
              className="admissions-hub-card group"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
                  <Icon name="phone" size={18} />
                </div>
                <strong>Direct Phone Line</strong>
                <p>Speak directly with our registrar between 9:00 AM and 6:00 PM.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                Call +234 803 130 8881 →
              </span>
            </a>

            <a
              href="mailto:hello@vivadoxa.ng"
              className="admissions-hub-card group"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
                  <Icon name="mail" size={18} />
                </div>
                <strong>Email Admissions</strong>
                <p>Send syllabus inquiries, church choir booking requests, or school partnerships.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                Send an email →
              </span>
            </a>

            <div
              onClick={() => go("contact")}
              className="admissions-hub-card group cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
                  <Icon name="pin" size={18} />
                </div>
                <strong>Visit the Studio</strong>
                <p>U/Sunday, Television, Kaduna. Tour the rehearsal rooms and test instruments.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-4 group-hover:translate-x-1 transition-transform">
                View location &amp; hours →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. Testimonials ─────────────────────────────────────────────── */}
      <section className="testimonial" aria-label="Student testimonial">
        <div className="container quote">
          <span className="quote-mark" aria-hidden="true">&ldquo;</span>
          <blockquote>
            Vivadoxa gave my daughter more than piano lessons. They gave her the confidence to perform, create and truly love music.
          </blockquote>
          <div>
            <strong>Amaka Okafor</strong>
            <span>Parent · Kaduna</span>
          </div>
          <div className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>

      <Cta go={go} />
    </main>
  )
}

export default Home
