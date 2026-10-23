import { useState, useEffect } from "react"
import { Badge, Button, Icon, PageHero, SectionHead, Cta, WhatsAppIcon } from "@/components/ui"
import { performances as staticPerformances, type PerformanceItem } from "@/lib/data"
import { fetchAcademics } from "@/lib/api"
import { WHATSAPP_URL, YOUTUBE_URL } from "@/lib/utils"
import type { Page } from "@/types"

const CATEGORIES = ["All", "Concert", "Recital", "Student Band", "Shorts"] as const

export function Performances({ go }: { go: (p: Page) => void }) {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All")
  const [items, setItems] = useState<PerformanceItem[]>(staticPerformances)
  const [showAll, setShowAll] = useState(false)
  const INITIAL_LIMIT = 6

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
              isShort: Boolean(p.is_short ?? p.isShort),
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const handleFilterChange = (cat: (typeof CATEGORIES)[number]) => {
    setFilter(cat)
    setShowAll(false)
  }

  const featured = items.find((p) => p.youtubeId === "-IcdMT9uCLU") || items[0] || staticPerformances[0]

  const filtered = filter === "All"
    ? items.filter((p) => p.youtubeId !== featured?.youtubeId)
    : filter === "Shorts"
      ? items.filter((p) => p.isShort)
      : items.filter((p) => p.category === filter)

  const visibleItems = (filter === "All" && !showAll)
    ? filtered.slice(0, INITIAL_LIMIT)
    : filtered

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

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 items-center mt-6 p-6 sm:p-9 rounded-2xl border" style={{ background: "var(--cream)", borderColor: "var(--line)" }}>
              <div style={{ borderRadius: 10, overflow: "hidden", background: featured.isShort ? "#080c14" : "#000", aspectRatio: featured.isShort ? undefined : "16/9", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", padding: featured.isShort ? 24 : 0 }}>
                {featured.videoUrl ? (
                  <video
                    src={featured.videoUrl}
                    poster={featured.thumbnail}
                    controls
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                  />
                ) : featured.isShort ? (
                  <div style={{ width: "100%", maxWidth: 260, aspectRatio: "9/16", borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)", position: "relative", background: "#000" }}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${featured.youtubeId}?rel=0&modestbranding=1`}
                      title={featured.title}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${featured.youtubeId}?rel=0&modestbranding=1`}
                    title={featured.title}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
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
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div className="tabs" role="tablist" aria-label="Performance filters" style={{ margin: 0 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={filter === c}
                  className={filter === c ? "active" : ""}
                  onClick={() => handleFilterChange(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary inline-flex items-center gap-2 text-xs py-2 px-3.5"
              style={{ borderColor: "rgba(255,0,0,0.3)", color: "#cc0000", background: "#ffffff" }}
            >
              <Icon name="youtube" size={16} /> Subscribe on YouTube @vivadoxa
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7">
            {visibleItems.map((item) => (
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
                {item.isShort ? (
                  <div
                    style={{
                      background: "#080c14",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "24px 16px",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    {/* Dedicated vertical phone/short player */}
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "240px",
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
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                        title={item.title}
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
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          pointerEvents: "none",
                          zIndex: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 8px",
                          borderRadius: 9999,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                          color: "white",
                          background: "rgba(0,0,0,0.7)",
                          backdropFilter: "blur(6px)",
                          border: "1px solid rgba(255,255,255,0.25)",
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                        Short
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ aspectRatio: "16/9", background: "#000", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.videoUrl ? (
                      <video
                        src={item.videoUrl}
                        poster={item.thumbnail}
                        controls
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                        title={item.title}
                        style={{ width: "100%", height: "100%", border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                )}

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

          {filter === "All" && filtered.length > INITIAL_LIMIT && (
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="btn btn-secondary inline-flex items-center gap-2"
                style={{
                  padding: "10px 24px",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 9999,
                  background: "white",
                  borderColor: "var(--line)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  cursor: "pointer",
                }}
              >
                {showAll ? (
                  <>Show fewer recitals <Icon name="arrowUp" size={13} /></>
                ) : (
                  <>Show all recitals (+{filtered.length - INITIAL_LIMIT} more) <Icon name="arrowDown" size={13} /></>
                )}
              </button>
            </div>
          )}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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

      {/* Authentic Recital & Stage Photo Gallery */}
      <section className="section" style={{ background: "white", borderTop: "1px solid var(--line)" }}>
        <div className="container">
          <SectionHead
            center
            eyebrow="Annual Concert Archives"
            title="Moments from our Recitals & Stages"
            body="A glimpse of Vivadoxa candidates bringing their unique sound to life across Kaduna community halls, outdoor recitals, and studio showcases."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-9">
            {[
              {
                src: "/media/programs/sax-ensemble.jpeg",
                title: "Live Saxophone Quintet",
                desc: "Youth brass & woodwind ensemble performing live at community recital.",
                tag: "Brass & Sax",
              },
              {
                src: "/media/programs/violin-recital-purple.jpeg",
                title: "Electric & Acoustic Strings Solo",
                desc: "Advanced violin candidate performing contemporary gospel medley.",
                tag: "Chamber Strings",
              },
              {
                src: "/media/programs/guitar-acoustic-recital.jpeg",
                title: "Vocal & Acoustic Recital",
                desc: "Student singer-songwriter performing original acoustic worship piece.",
                tag: "Guitar & Voice",
              },
              {
                src: "/media/programs/violin-solo-rainbow.jpeg",
                title: "Junior Violin Showcase",
                desc: "Young candidate demonstrating classical posture and intonation.",
                tag: "Early Strings",
              },
              {
                src: "/media/programs/flute-recital-boy.jpeg",
                title: "Concert Flute Solo",
                desc: "Transverse flute performance under the festival canopy in Kaduna.",
                tag: "Woodwinds",
              },
              {
                src: "/media/programs/piano-recital-denim.jpeg",
                title: "Foundation Keyboard Recital",
                desc: "Junior pianist demonstrating sight-reading and two-hand syncopation.",
                tag: "Piano & Keys",
              },
              {
                src: "/media/programs/drums-outdoor-banner.jpeg",
                title: "Open-Air Drum Showcase",
                desc: "Young drummer executing rock-solid pocket and fills in Kaduna.",
                tag: "Percussion",
              },
              {
                src: "/media/studio/academy-cohort-group.jpeg",
                title: "Annual Academy Cohort",
                desc: "Over 30 students and faculty united after our annual Kaduna concert.",
                tag: "All Faculty & Students",
              },
            ].map((photo, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  background: "var(--cream)",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div style={{ height: 220, overflow: "hidden", background: "#111" }}>
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span className="badge badge-gold" style={{ fontSize: 10, padding: "2px 8px" }}>
                      {photo.tag}
                    </span>
                    <h4 style={{ margin: "8px 0 4px", fontSize: 16, color: "var(--navy)", fontFamily: "'DM Serif Display', serif" }}>
                      {photo.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                      {photo.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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

