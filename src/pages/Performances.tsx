import { useState, useEffect } from "react"
import { Badge, Button, Icon, PageHero, SectionHead, Cta, WhatsAppIcon } from "@/components/ui"
import { performances as staticPerformances, type PerformanceItem } from "@/lib/data"
import { fetchAcademics } from "@/lib/api"
import { WHATSAPP_URL } from "@/lib/utils"
import type { Page } from "@/types"

const CATEGORIES = ["All", "Concert", "Recital", "Student Band"] as const

export function Performances({ go }: { go: (p: Page) => void }) {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All")
  const [items, setItems] = useState<PerformanceItem[]>(staticPerformances)

  // Frontend-Backend consistency: fetch live performances entered from Admin portal
  useEffect(() => {
    fetchAcademics("performances")
      .then((dbData) => {
        if (Array.isArray(dbData) && dbData.length > 0) {
          setItems(
            dbData.map((p: any) => ({
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
      })
      .catch(() => {})
  }, [])

  const filtered = filter === "All"
    ? items
    : items.filter((p) => p.category === filter)

  const featured = items[0] || staticPerformances[0]

  return (
    <main>
      <PageHero
        eyebrow="Student Showcase & Recitals"
        title="Music that comes alive on stage."
        body="Experience the joy, discipline, and musicianship cultivated at Vivadoxa through live student concerts, recitals, and ensemble showcases in Kaduna."
      />

      {/* Featured Video Spotlight */}
      {featured && (
        <section className="section" style={{ background: "white", borderBottom: "1px solid var(--line)" }}>
          <div className="container">
            <SectionHead
              eyebrow="Featured Performance"
              title="Watch our students in action"
              body="Every 12 weeks, Vivadoxa candidates take the stage to share what they've learned with family, friends, and the community."
            />

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 40, alignItems: "center", marginTop: 24, background: "var(--cream)", padding: 36, borderRadius: "var(--radius)", border: "1px solid var(--line)" }}>
              <div style={{ borderRadius: 10, overflow: "hidden", background: "#000", aspectRatio: "16/9", border: "1px solid var(--line)" }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${featured.youtubeId}?rel=0&modestbranding=1`}
                  title={featured.title}
                  style={{ width: "100%", height: "100%", border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div>
                <Badge tone="gold">{featured.category}</Badge>
                <h2 style={{ fontSize: 28, margin: "14px 0 6px", color: "var(--navy)" }}>{featured.title}</h2>
                <p style={{ fontSize: 13, color: "var(--gold)", fontWeight: 700, margin: "0 0 14px" }}>
                  {featured.performer} • {featured.date}
                </p>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                  {featured.description}
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Button onClick={() => go("apply")}>
                    Enroll for {featured.program} <Icon name="arrow" />
                  </Button>
                  <a
                    href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20watched%20the%20${encodeURIComponent(featured.title)}%20recital%20and%20would%20like%20to%20learn%20more.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary inline-flex items-center gap-2"
                    style={{ borderColor: "rgba(37,211,102,0.4)", color: "#128C7E", background: "#f0fdf4" }}
                  >
                    <WhatsAppIcon size={18} /> Chat with Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Video Gallery */}
      <section className="section" style={{ background: "var(--cream)" }}>
        <div className="container">
          <div className="tabs" role="tablist" aria-label="Performance filters">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                className={filter === c ? "active" : ""}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24, marginTop: 28 }}>
            {filtered.map((item) => (
              <article
                key={item.id}
                style={{
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{ aspectRatio: "16/9", background: "#000", borderBottom: "1px solid var(--line)" }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                    title={item.title}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <Badge tone="gold">{item.category}</Badge>
                      <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{item.duration}</span>
                    </div>
                    <h3 style={{ fontSize: 20, margin: "6px 0 4px", color: "var(--navy)" }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, margin: "0 0 10px" }}>
                      {item.performer} • {item.program}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{item.date}</span>
                    <button
                      onClick={() => go("apply")}
                      style={{ border: 0, background: "none", color: "var(--gold)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      Join Course <Icon name="arrow" size={12} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recital Philosophy */}
      <section className="section" style={{ background: "white", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <SectionHead
            center
            eyebrow="Stage Philosophy"
            title="Why performance is at the heart of our pedagogy"
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 32 }}>
            <div style={{ padding: 28, borderRadius: "var(--radius)", background: "var(--cream)", border: "1px solid var(--line)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--navy)", color: "white", display: "grid", placeItems: "center", fontWeight: 700, marginBottom: 16 }}>
                01
              </div>
              <h3 style={{ fontSize: 18, color: "var(--navy)", margin: "0 0 8px" }}>Termly Live Recitals</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                Stage experience is built into every curriculum. Overcoming performance anxiety transforms practice room drills into authentic stage confidence.
              </p>
            </div>

            <div style={{ padding: 28, borderRadius: "var(--radius)", background: "var(--cream)", border: "1px solid var(--line)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--navy)", color: "white", display: "grid", placeItems: "center", fontWeight: 700, marginBottom: 16 }}>
                02
              </div>
              <h3 style={{ fontSize: 18, color: "var(--navy)", margin: "0 0 8px" }}>Ensemble Coordination</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                Students don&apos;t learn in isolation. We bring keyboardists, violinists, vocalists, and drummers together for collaborative live bands.
              </p>
            </div>

            <div style={{ padding: 28, borderRadius: "var(--radius)", background: "var(--cream)", border: "1px solid var(--line)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--navy)", color: "white", display: "grid", placeItems: "center", fontWeight: 700, marginBottom: 16 }}>
                03
              </div>
              <h3 style={{ fontSize: 18, color: "var(--navy)", margin: "0 0 8px" }}>Archived Video Portfolios</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                High-definition audio and video recordings of student performances are captured and provided to students and parents as lasting portfolios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Ensemble / Soloist Section */}
      <section className="section" style={{ background: "var(--navy)", color: "white" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 760 }}>
          <span className="eyebrow" style={{ color: "var(--gold2)" }}>
            Live Performance Bookings
          </span>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 32,
              color: "white",
              margin: "12px 0 16px",
            }}
          >
            Book a Vivadoxa Student Ensemble or Soloist for Your Event
          </h2>
          <p style={{ fontSize: 14, color: "#c1ccd5", lineHeight: 1.7, marginBottom: 32 }}>
            Looking for refined string quartets, gospel jazz keyboardists, or youth choral ensembles for your wedding, church convention, or corporate dinner in Kaduna or Abuja? Connect with our event coordinator directly.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={`${WHATSAPP_URL}?text=Hello%20Vivadoxa,%20I%20would%20like%20to%20book%20a%20musician%20or%20student%20ensemble%20for%20an%20event.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary inline-flex items-center gap-2"
              style={{ background: "#25D366", borderColor: "#25D366", color: "#0a192f", fontWeight: 700, padding: "12px 24px" }}
            >
              <WhatsAppIcon size={20} /> Book Musicians on WhatsApp
            </a>
            <Button variant="secondary" onClick={() => go("contact")} style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
              Send Event Brief
            </Button>
          </div>
        </div>
      </section>

      <Cta go={go} />
    </main>
  )
}

export default Performances

