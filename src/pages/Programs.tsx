import { useState, useEffect } from "react"
import { Badge, PageHero, Icon, Button, SectionHead, WhatsAppIcon } from "@/components/ui"
import { programs as staticPrograms, accreditations, digitalCourses, type DigitalCourse } from "@/lib/data"
import { fetchAcademics } from "@/lib/api"
import { WHATSAPP_URL } from "@/lib/utils"
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
          <span>12 weeks term</span>
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
            <small> / term</small>
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

function DigitalCourseCard({
  course,
  go,
}: {
  course: DigitalCourse
  go: (p: Page) => void
}) {
  const whatsappCourseInquiry = `${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20want%20to%20enroll%20in%20the%20digital%20video%20masterclass:%20${encodeURIComponent(course.title)}.`

  return (
    <article
      style={{
        background: "white",
        borderRadius: "var(--radius)",
        border: "1px solid var(--line)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="hover:-translate-y-1 hover:shadow-xl"
    >
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", background: "#111" }}>
        <img
          src={course.image}
          alt={course.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "rgba(10,25,47,0.88)",
            color: "var(--gold2)",
            padding: "4px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(201,107,50,0.3)",
          }}
        >
          {course.tag}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            background: "rgba(0,0,0,0.75)",
            color: "white",
            padding: "3px 8px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "monospace",
          }}
        >
          {course.duration}
        </div>
      </div>

      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
          <span style={{ color: "var(--gold)", fontWeight: 700 }}>
            ★ {course.rating.toFixed(1)} <span style={{ color: "var(--muted)", fontWeight: 400 }}>({course.studentsCount} students)</span>
          </span>
          <span style={{ color: "var(--muted)", fontSize: 11 }}>
            {course.lessonsCount} HD Lessons
          </span>
        </div>

        <h3
          style={{
            fontSize: 17,
            fontFamily: "'DM Serif Display', serif",
            color: "var(--navy)",
            margin: "0 0 8px",
            lineHeight: 1.35,
          }}
        >
          {course.title}
        </h3>

        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 16px", lineHeight: 1.5, flex: 1 }}>
          {course.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 4,
              background: "var(--cream)",
              color: "var(--navy)",
              fontWeight: 600,
              border: "1px solid var(--line)",
            }}
          >
            Instructor: {course.instructor}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 4,
              background: "#e8f7f0",
              color: "#128C7E",
              fontWeight: 600,
            }}
          >
            {course.level}
          </span>
        </div>

        <div
          style={{
            paddingTop: 14,
            borderTop: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>One-time Fee</span>
            <strong style={{ fontSize: 20, color: "var(--navy)", fontFamily: "'DM Serif Display', serif" }}>
              {course.fee}
            </strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href={whatsappCourseInquiry}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ background: "#e8f7f0", color: "#25D366" }}
              aria-label={`Inquire about ${course.title} on WhatsApp`}
              title="Get Syllabus on WhatsApp"
            >
              <WhatsAppIcon size={18} />
            </a>
            <Button
              variant="primary"
              onClick={() => go("apply")}
              style={{ padding: "8px 16px", fontSize: 12 }}
            >
              Get Instant Access
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
  const [activeTab, setActiveTab] = useState<"academy" | "digital">("academy")
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
            dbData.map((c: any) => ({
              name: c.name,
              tag: c.tag || "Popular",
              image: c.image || staticPrograms[0]?.image,
              fee: c.fee || "₦85,000 / term",
              feeAmount: parseFloat(c.fee_amount || "85000"),
              desc: c.desc || "",
              category: c.category || "Instruments",
              ageGroup: c.age_group || "All Ages",
              level: c.level || "Beginner",
            }))
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
        eyebrow="Curriculum & Learning Tracks"
        title="Find the sound that feels like you."
        body="Structured, practical training for young beginners through aspiring professionals across Kaduna and online. Choose full-term studio training or self-paced video masterclasses."
      />

      {/* Parara-Inspired Dual Mode Switcher Banner */}
      <section style={{ background: "white", borderBottom: "1px solid var(--line)", padding: "18px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "inline-flex",
              background: "var(--cream)",
              padding: 5,
              borderRadius: 99,
              border: "1px solid var(--line)",
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("academy")}
              style={{
                border: 0,
                borderRadius: 99,
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: activeTab === "academy" ? 700 : 500,
                background: activeTab === "academy" ? "var(--navy)" : "transparent",
                color: activeTab === "academy" ? "white" : "var(--muted)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🏛️</span> Full-Term Studio & Live Programs (12 Wks)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("digital")}
              style={{
                border: 0,
                borderRadius: 99,
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: activeTab === "digital" ? 700 : 500,
                background: activeTab === "digital" ? "var(--gold)" : "transparent",
                color: activeTab === "digital" ? "var(--navy)" : "var(--muted)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🎬</span> Self-Paced Video Masterclasses
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: activeTab === "digital" ? "var(--navy)" : "var(--gold)",
                  color: activeTab === "digital" ? "white" : "var(--navy)",
                  fontWeight: 700,
                }}
              >
                Instant
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="section">
        <div className="container">
          {activeTab === "academy" ? (
            <>
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
            </>
          ) : (
            <>
              {/* Digital Masterclasses Showcase */}
              <div style={{ marginBottom: 32 }}>
                <SectionHead
                  center
                  eyebrow="On-Demand Video Curriculum"
                  title="Master Musical Skills at Your Own Pace"
                  body="Instant access to high-definition video masterclasses recorded by Vivadoxa's senior faculty. Download sheet music, play-along backing tracks, and receive WhatsApp instructor feedback."
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 24,
                }}
              >
                {digitalCourses.map((dc) => (
                  <DigitalCourseCard key={dc.id} course={dc} go={go} />
                ))}
              </div>

              {/* Direct with Instructor Masterclass Callout */}
              <div
                style={{
                  marginTop: 48,
                  background: "var(--navy)",
                  borderRadius: "var(--radius)",
                  padding: "36px 32px",
                  color: "white",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 24,
                  border: "1px solid rgba(201,107,50,0.3)",
                }}
              >
                <div style={{ maxWidth: 640 }}>
                  <span className="eyebrow" style={{ color: "var(--gold2)", fontSize: 11 }}>
                    Exclusive WhatsApp Video Feedback
                  </span>
                  <h3
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 24,
                      margin: "8px 0 10px",
                      color: "white",
                    }}
                  >
                    Submit Practice Recordings to Tosin Adewale
                  </h3>
                  <p style={{ fontSize: 13, color: "#c1ccd5", lineHeight: 1.6, margin: 0 }}>
                    Every digital course student receives direct WhatsApp critique passes from Vivadoxa faculty. Record your fingerings, embouchure, or vocal runs on your phone and get tailored corrective feedback within 24 hours.
                  </p>
                </div>
                <a
                  href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20want%20to%20learn%20more%20about%20video%20masterclasses%20and%20instructor%20feedback.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex items-center gap-2"
                  style={{ background: "#25D366", borderColor: "#25D366", color: "#0a192f", fontWeight: 700 }}
                >
                  <WhatsAppIcon size={20} /> Ask About Video Feedback
                </a>
              </div>
            </>
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
                <span style={{ fontSize: 20 }}>🩺</span>
                <span className="eyebrow" style={{ fontSize: 11 }}>In-House Instrument Hospital</span>
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

      {/* Examination & Certification Standards */}
      <section className="section" style={{ background: "white", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <SectionHead
            center
            eyebrow="International Standards"
            title="Graded Exam & Performance Syllabus"
            body="Every Vivadoxa curriculum is aligned with international examination board standards, preparing candidates for formal diplomas and performance credentials."
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 40 }}>
            {accreditations.map((acc) => (
              <div
                key={acc.name}
                style={{
                  padding: 24,
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--line)",
                  background: "var(--cream)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span className="eyebrow" style={{ fontSize: 11 }}>
                  {acc.name}
                </span>
                <h4 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "var(--navy)", fontFamily: "'DM Serif Display', serif" }}>
                  {acc.badge}
                </h4>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                  {acc.detail}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, textAlign: "center" }}>
            <a
              href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20would%20like%20to%20inquire%20about%20music%20exam%20preparation%20and%20certifications.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary inline-flex items-center gap-2"
              style={{ borderColor: "rgba(37,211,102,0.4)", color: "#128C7E", background: "#f0fdf4" }}
            >
              <WhatsAppIcon size={18} /> Speak with an Admissions Advisor on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Programs

