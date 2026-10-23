import { useState, useEffect } from "react"
import { Badge, PageHero, Icon, Button, SectionHead, WhatsAppIcon } from "@/components/ui"
import {
  programs as staticPrograms,
  officialPricingTiers,
  availableInstruments,
  specialtyPrograms,
} from "@/lib/data"
import { fetchAcademics } from "@/lib/api"
import {
  WHATSAPP_URL,
} from "@/lib/utils"
import type { Page, Program } from "@/types"

function ProgramCard({
  item,
  go,
}: {
  item: Program
  go: (p: Page) => void
}) {
  const whatsappInquiry = `${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20would%20like%20to%20inquire%20about%20the%20${encodeURIComponent(item.name)}%20program.`

  return (
    <article className="program-card">
      <div className="card-image">
        <img
          src={item.image}
          alt={`${item.name} lessons at Vivadoxa`}
          loading="lazy"
        />
        <Badge tone="gold">{item.tag}</Badge>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>Monthly Cohort</span>
          <span>{item.ageGroup || "All Ages"}</span>
        </div>
        <h3>{item.name}</h3>
        <p>{item.desc}</p>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 99,
              background: "var(--cream)",
              color: "var(--navy)",
              fontWeight: 600,
              border: "1px solid var(--line)",
            }}
          >
            {item.category}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 99,
              background: "#fff3cf",
              color: "#795514",
              fontWeight: 600,
            }}
          >
            {item.level || "All Levels"}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 99,
              background: "rgba(37,211,102,0.1)",
              color: "#128C7E",
              fontWeight: 600,
            }}
          >
            Live Studio + Recital
          </span>
        </div>

        <div className="card-foot">
          <strong>
            {item.fee}
            <small> / month</small>
          </strong>
          <div className="flex items-center gap-2">
            <a
              href={whatsappInquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ background: "#e8f7f0", color: "#25D366" }}
              aria-label={`Ask about ${item.name} on WhatsApp`}
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon size={18} />
            </a>
            <Button
              variant="primary"
              onClick={() => go("apply")}
              aria-label={`Apply for ${item.name}`}
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              Enroll <Icon name="arrow" size={14} />
            </Button>
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
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All")
  const [ageGroup, setAgeGroup] = useState<(typeof AGE_GROUPS)[number]>("All Ages")
  const [level, setLevel] = useState("")

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
                    inst.name.toLowerCase().includes(c.name.toLowerCase())
                )?.image ||
                staticPrograms.find((sp) =>
                  c.name.toLowerCase().includes(sp.name.toLowerCase())
                )?.image ||
                staticPrograms[0]?.image;

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
            })
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

  return (
    <main>
      <PageHero
        eyebrow="Official Curriculum & Price List"
        title="Official Programmes & Tuition Structure"
        body="Structured, practical training for young beginners through aspiring professionals across Kaduna and online. Prices are uniform for all musical instruments and voice training, backed by official study packs."
      />

      {/* Main Content Area */}
      <section className="section">
        <div className="container">
          {/* ── Official Duration Tiers & Price List ── */}
              <div style={{ marginBottom: 44 }}>
                <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 32px" }}>
                  <Badge tone="gold">Official Fee Structure &amp; Study Packs</Badge>
                  <h2
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "clamp(28px, 4vw, 38px)",
                      color: "var(--navy)",
                      margin: "12px 0 10px",
                    }}
                  >
                    Official Fee Schedule Across All Instruments
                  </h2>
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                    At Vivadoxa Music, <strong>prices are the same for all musical instruments and voice training</strong>. Choose your program duration based on your learning goals—from 1-month foundation kickstarts to 1-year professional conservatory diplomas.
                  </p>
                </div>

                {/* 5-Card Grid for Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6 mb-9">
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
                          Total Tuition Fee
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
                          Included Study Kit &amp; Perks:
                        </strong>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                          {tier.inclusions.map((inc, i) => (
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
                          href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20am%20interested%20in%20the%20${encodeURIComponent(tier.name)}%20(${encodeURIComponent(tier.fee)}).%20Please%20guide%20me.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-95 bg-[#e8f7f0] text-[#25D366] hover:bg-[#d1f2e2]"
                          title="Ask about this plan on WhatsApp"
                          aria-label={`Ask about ${tier.name} on WhatsApp`}
                        >
                          <WhatsAppIcon size={20} />
                        </a>
                      </div>
                    </div>
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
                  <Icon name="music" size={24} className="text-amber-800 shrink-0" />
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <strong style={{ fontSize: 13, color: "var(--navy)", display: "block" }}>
                      Transparent Uniform Pricing: No Hidden Fees or Instrument Surcharges
                    </strong>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0", lineHeight: 1.5 }}>
                      Whether you study Saxophones, Trumpets, Piano, Drums, Violin, Flute, Clarinet, Talking Drums, or Voice Training, the tuition fee remains identical across all 13 available instruments.
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

              {/* ── 13 Available Instruments Showcase ── */}
              <div style={{ marginBottom: 44 }}>
                <SectionHead
                  center
                  eyebrow="Complete Instrument Catalog"
                  title="13 Musical Disciplines Taught by Certified Specialists"
                  body="Every instrument below is available across all 4 program duration tiers (1 Month Intro, 3 Months Certificate, 6 Months Diploma, and 1 Year Advance Diploma) plus Home Lessons."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-7">
                  {availableInstruments.map((inst) => (
                    <div
                      key={inst.id}
                      style={{
                        background: "white",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--line)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 3px 12px rgba(0,0,0,0.03)",
                      }}
                      className="hover:border-[var(--gold)] hover:shadow-md transition-all"
                    >
                      <div style={{ height: 130, position: "relative", overflow: "hidden", background: "#0a192f" }}>
                        <img
                          src={inst.image}
                          alt={inst.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          loading="lazy"
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
                          }}
                        >
                          {inst.family}
                        </span>
                      </div>
                      <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                        <h4 style={{ margin: "0 0 4px", fontSize: 15, color: "var(--navy)", fontWeight: 700 }}>
                          {inst.name}
                        </h4>
                        <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.45, flex: 1 }}>
                          {inst.description}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                          <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 600 }}>{inst.levels}</span>
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
                  ))}
                </div>
              </div>

              {/* ── Specialty Programs & Masterclasses ── */}
              <div style={{ marginBottom: 44, background: "var(--cream)", padding: "32px 28px", borderRadius: "var(--radius)", border: "1px solid var(--line)" }}>
                <div style={{ maxWidth: 680, marginBottom: 24 }}>
                  <span className="eyebrow">Distinctive Curricula</span>
                  <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, margin: "6px 0 8px", color: "var(--navy)" }}>
                    Special Programs for Focused Musical Needs
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                    Beyond standard instrument coaching, Vivadoxa offers targeted specialty tracks designed for church musicians, choir conductors, busy professionals, and studio creators.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specialtyPrograms.map((spec) => (
                    <div
                      key={spec.title}
                      style={{
                        background: "white",
                        padding: "18px 20px",
                        borderRadius: 10,
                        border: "1px solid var(--line)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <h4 style={{ margin: 0, fontSize: 16, color: "var(--navy)", fontWeight: 700 }}>
                            {spec.title}
                          </h4>
                          <span style={{ fontSize: 10, background: "#fdf8ee", color: "var(--gold)", border: "1px solid #fae6be", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                            {spec.highlight}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--gold2)", fontWeight: 600, display: "block", marginBottom: 6 }}>
                          {spec.tagline}
                        </span>
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                          {spec.desc}
                        </p>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <a
                          href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20would%20like%20to%20learn%20more%20about%20the%20${encodeURIComponent(spec.title)}%20specialty%20track.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: 11, color: "#128C7E", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <WhatsAppIcon size={13} /> Chat on WhatsApp
                        </a>
                        <Button variant="ghost" onClick={() => go("apply")} style={{ fontSize: 11, padding: "4px 8px" }}>
                          Apply →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                    style={{ color: "var(--gold2)", fontSize: 10, display: "block", marginBottom: 4 }}
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
                          border: active ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.15)",
                          background: active ? "var(--gold)" : "rgba(255,255,255,0.06)",
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

              {/* Filter Bar */}
              <div className="filter-row">
                <p>
                  <strong>{category === "All" ? "All Programs" : category}</strong>
                  {ageGroup !== "All Ages" && ` · ${ageGroup}`}
                  {` · ${filtered.length} course${filtered.length !== 1 ? "s" : ""}`}
                </p>
                <div className="flex items-center gap-3">
                  <select
                    aria-label="Filter by level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
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
                {filtered.map((item) => (
                  <ProgramCard key={item.name} item={item} go={go} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-base mb-4">No programs match this specific filter combination.</p>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="tool" size={18} className="text-amber-800" />
                <span className="eyebrow" style={{ fontSize: 11 }}>In-House Instrument Workshop</span>
              </div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, margin: "0 0 8px", color: "var(--navy)" }}>
                Don&apos;t Own an Instrument Yet? We&apos;ve Got You Covered.
              </h3>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
                Enrolled students enjoy priority access to certified student loaner instruments, restringing, acoustic guitar setups, and keyboard calibrations right here in Kaduna.
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

