import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { PageHero, SectionHead, Icon } from "@/components/ui"
import { SEO } from "@/components/SEO"
import { cohortImg } from "@/lib/data"
import type { Page } from "@/types"

export function About({ go }: { go: (p: Page) => void }) {
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash || window.location.hash
    if (hash) {
      const id = hash.replace("#", "")
      const el = document.getElementById(id)
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 120)
        return () => clearTimeout(timer)
      }
    }
  }, [location.hash])
  return (
    <main>
      <SEO
        title="About Us — Vivadoxa Music"
        description="Our Story: Built on a Passion for Music. Learn about Vivadoxa Music's vision, mission, core values, and philosophy."
        keywords="about vivadoxa, vivadoxa music, music education, kaduna music school"
        canonicalUrl="/about"
        ogImage="/media/studio/academy-cohort-group.jpeg"
      />

      <PageHero
        eyebrow="About Us"
        title="Built on a Passion for Music"
        body="Music is more than sound. It is a language of expression, a source of inspiration, a profession, and a powerful force that brings people together."
        image={cohortImg}
      />

      {/* Our Story, Vision & Mission */}
      <section
        id="story"
        className="section"
        style={{
          background: "#FFFFFF",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="container">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <span
              className="eyebrow"
              style={{
                color: "var(--gold)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 700,
                letterSpacing: "1.5px",
                marginBottom: 8,
              }}
            >
              Our Heritage &amp; Mission
            </span>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(32px, 4.2vw, 48px)",
                color: "var(--navy)",
                margin: "8px 0 16px",
                lineHeight: 1.15,
              }}
            >
              The Story of Vivadoxa Music
            </h2>
            <p
              style={{
                fontSize: "1.15rem",
                color: "var(--ink)",
                lineHeight: 1.65,
                fontWeight: 500,
              }}
            >
              Music is more than sound. It is a language of expression, a source
              of inspiration, a profession, and a powerful force that brings
              people together.
            </p>
          </div>

          {/* 3 Story Milestone Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Card 1 */}
            <div
              style={{
                background: "#FAF8F5",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    background: "rgba(201,107,50,0.12)",
                    color: "var(--gold)",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  2019 • The Genesis
                </span>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "1.3rem",
                    color: "var(--navy)",
                    margin: "0 0 10px",
                  }}
                >
                  Founded in Kaduna
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.95rem",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  Established to provide musicians in Northern Nigeria with
                  direct access to the professional training, equipment, creative
                  facilities, and technical support they need to thrive.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: "#FAF8F5",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    background: "rgba(11,11,11,0.08)",
                    color: "var(--navy)",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Ecosystem
                </span>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "1.3rem",
                    color: "var(--navy)",
                    margin: "0 0 10px",
                  }}
                >
                  Under One Unified Roof
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.95rem",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  Over the years, we have developed an integrated music environment
                  that connects music education, instrument sales, a modern
                  recording studio, and in-house repair services in one place.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div
              style={{
                background: "#FAF8F5",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    background: "rgba(201,107,50,0.12)",
                    color: "var(--gold)",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Impact
                </span>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "1.3rem",
                    color: "var(--navy)",
                    margin: "0 0 10px",
                  }}
                >
                  Raising Standards
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.95rem",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  From nurturing young talents to supporting seasoned performers,
                  we continue building a vibrant community where talent is
                  discovered, creativity is encouraged, and excellence is pursued.
                </p>
              </div>
            </div>
          </div>

          {/* Dual Vision & Mission Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Vision Card */}
            <div
              className="lg:col-span-5"
              style={{
                background: "linear-gradient(145deg, #FAF8F5 0%, #FFFFFF 100%)",
                border: "1px solid var(--line)",
                borderLeft: "5px solid var(--gold)",
                borderRadius: "var(--radius)",
                padding: "36px 30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 10px 30px -10px rgba(11,11,11,0.06)",
              }}
            >
              <div>
                <span
                  style={{
                    color: "var(--gold)",
                    textTransform: "uppercase",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    display: "block",
                    marginBottom: 12,
                  }}
                >
                  Our Vision
                </span>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "1.45rem",
                    lineHeight: 1.45,
                    color: "var(--navy)",
                    margin: "0 0 16px",
                  }}
                >
                  &ldquo;A world where every musician, from beginner to pro, has
                  access to the tools, knowledge, and environment to bring their
                  unique sound to life.&rdquo;
                </h3>
              </div>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  margin: 0,
                  borderTop: "1px solid var(--line)",
                  paddingTop: 16,
                }}
              >
                Building a musical home where aspiring artists transform into
                confident, skilled musicians and creators.
              </p>
            </div>

            {/* Mission Card & 4 Pillars */}
            <div
              className="lg:col-span-7"
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "36px 32px",
                boxShadow: "0 10px 30px -10px rgba(11,11,11,0.06)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    color: "var(--gold)",
                    textTransform: "uppercase",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Our Mission
                </span>
                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "var(--navy)",
                    fontWeight: 600,
                    margin: "0 0 20px",
                    lineHeight: 1.5,
                  }}
                >
                  To deliver exceptional musical experiences through four core
                  institutional pillars:
                </p>

                {/* 4 Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div
                    style={{
                      background: "#FAF8F5",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "rgba(201,107,50,0.15)",
                        color: "var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--navy)", fontWeight: 600 }}>
                      Innovative Lessons
                    </span>
                  </div>

                  <div
                    style={{
                      background: "#FAF8F5",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "rgba(201,107,50,0.15)",
                        color: "var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--navy)", fontWeight: 600 }}>
                      Curated Instrument Sales
                    </span>
                  </div>

                  <div
                    style={{
                      background: "#FAF8F5",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "rgba(201,107,50,0.15)",
                        color: "var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--navy)", fontWeight: 600 }}>
                      Dependable Repair Services
                    </span>
                  </div>

                  <div
                    style={{
                      background: "#FAF8F5",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "rgba(201,107,50,0.15)",
                        color: "var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--navy)", fontWeight: 600 }}>
                      State-of-the-Art Studio
                    </span>
                  </div>
                </div>
              </div>

              {/* Slogan Pill */}
              <div
                style={{
                  background: "rgba(201,107,50,0.08)",
                  border: "1px dashed rgba(201,107,50,0.35)",
                  borderRadius: 8,
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    color: "var(--gold-text)",
                    fontWeight: 700,
                    fontStyle: "italic",
                    fontSize: "0.95rem",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  &ldquo;At Vivadoxa, we don&apos;t just sell music. We create it, teach it, and preserve it.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Meet Our CEO & Founder (High-Contrast Deep Brand Canvas) ───────── */}
      <section
        id="founder"
        className="section scroll-mt-24"
        style={{
          background: "#0B0B0B",
          color: "white",
          borderTop: "3px solid var(--gold)",
          borderBottom: "3px solid var(--gold)",
          position: "relative",
          overflow: "hidden",
          scrollMarginTop: "90px",
        }}
      >
        {/* Subtle Brand Glow Accent in Background */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(201,107,50,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Row 1: Executive Portrait & Core Bio (Balanced Heights) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12">
            {/* Left Column: Portrait & Quick Credentials Bar */}
            <div className="lg:col-span-5">
              <div
                style={{
                  background: "#161311",
                  border: "1px solid rgba(201,107,50,0.35)",
                  borderRadius: "20px",
                  padding: "16px",
                  boxShadow: "0 20px 50px -15px rgba(0,0,0,0.6)",
                }}
              >
                {/* Photo frame */}
                <div
                  style={{
                    position: "relative",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "2px solid rgba(201,107,50,0.45)",
                    aspectRatio: "3/4",
                    background: "var(--navy)",
                  }}
                >
                  <img
                    src="/media/team/frederick-chrysantius.jpeg"
                    alt="Frederick Chrysantius — Founder & CEO, Vivadoxa Music"
                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  {/* Floating Brand Ribbon on Image */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      right: "12px",
                      background: "rgba(11, 11, 11, 0.94)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(201,107,50,0.5)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "10.5px",
                          textTransform: "uppercase",
                          letterSpacing: "1.2px",
                          color: "var(--gold-text-dark, #f2a672)",
                          fontWeight: 700,
                        }}
                      >
                        Founder &amp; CEO
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        Frederick Chrysantius
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "4px 8px",
                        background: "rgba(201,107,50,0.25)",
                        border: "1px solid rgba(201,107,50,0.4)",
                        borderRadius: "6px",
                        color: "var(--gold-text-dark, #f2a672)",
                      }}
                    >
                      Est. 2019
                    </span>
                  </div>
                </div>

                {/* Executive Credentials & Creed Bar (Directly below photo to eliminate all empty space) */}
                <div
                  style={{
                    marginTop: "14px",
                    padding: "16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                  }}
                >
                  <div className="grid grid-cols-2 gap-3 text-left mb-3 pb-3 border-b border-white/10">
                    <div>
                      <span style={{ display: "block", fontSize: 10, color: "var(--gold-text-dark, #f2a672)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                        Headquarters
                      </span>
                      <strong style={{ fontSize: 13, color: "white" }}>
                        Kaduna, Nigeria
                      </strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 10, color: "var(--gold-text-dark, #f2a672)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                        Expansion Scope
                      </span>
                      <strong style={{ fontSize: 13, color: "white" }}>
                        Northern Nigeria &amp; Beyond
                      </strong>
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "10.5px",
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                        color: "var(--gold-text-dark, #f2a672)",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      Official Creed
                    </span>
                    <p
                      style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: "1.2rem",
                        color: "white",
                        margin: 0,
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;Actualize your passion.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative & Executive Vision */}
            <div className="lg:col-span-7">
              <span
                className="eyebrow"
                style={{
                  color: "var(--gold-text-dark, #f2a672)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  marginBottom: 8,
                }}
              >
                Meet Our CEO
              </span>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "clamp(32px, 4.2vw, 46px)",
                  color: "white",
                  margin: "8px 0 6px",
                  lineHeight: 1.15,
                }}
              >
                Frederick Chrysantius
              </h2>
              <p
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: "var(--gold-text-dark, #f2a672)",
                  marginBottom: "16px",
                }}
              >
                Founder &amp; Chief Executive Officer, Vivadoxa Music
              </p>

              <blockquote
                style={{
                  borderLeft: "3px solid var(--gold)",
                  paddingLeft: "18px",
                  margin: "0 0 22px",
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.25rem",
                  lineHeight: 1.45,
                  color: "white",
                }}
              >
                &ldquo;A Vision Beyond Music. A Passion for Excellence.&rdquo;
              </blockquote>

              <div
                style={{
                  color: "var(--line-strong)",
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <p>
                  At the heart of Vivadoxa Music is a vision driven by passion,
                  purpose and an unwavering commitment to excellence.
                </p>
                <p>
                  <strong>Frederick Chrysantius</strong> is the Founder and Chief
                  Executive Officer of Vivadoxa Music, an institution established on
                  the belief that music is more than an art form — it is a powerful
                  instrument for education, creativity, expression and transformation.
                </p>
                <p>
                  With a vision to redefine the musical experience, he founded
                  Vivadoxa Music in 2019 to create an environment where aspiring
                  musicians, professional artists, music educators and enthusiasts
                  can discover their potential, develop their talents and achieve
                  extraordinary possibilities.
                </p>
                <p>
                  Under his leadership, Vivadoxa Music is built around a comprehensive
                  approach to the musical industry, bringing together music education,
                  musical instruments, professional audio equipment, music production,
                  repairs, technical support and creative development under one roof.
                </p>
              </div>

              {/* His Vision Card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderLeft: "4px solid var(--gold)",
                  borderRadius: "var(--radius)",
                  padding: "22px 24px",
                  marginTop: "24px",
                }}
              >
                <span
                  style={{
                    color: "var(--gold-text-dark, #f2a672)",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  His Vision
                </span>
                <p
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "1.15rem",
                    color: "white",
                    margin: "0 0 10px",
                    lineHeight: 1.45,
                  }}
                >
                  &ldquo;Talent deserves opportunity, passion deserves direction,
                  and excellence should never be compromised.&rdquo;
                </p>
                <p
                  style={{
                    color: "var(--line-strong)",
                    fontSize: "0.95rem",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  His vision is to position Vivadoxa Music as a leading name in
                  the global music industry — a trusted destination synonymous with
                  quality, innovation, professionalism and exceptional musical
                  experiences. To have Vivadoxa Music in every northern state of
                  Nigeria and beyond.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Leadership Philosophy (3-Column Full-Width Grid) */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: "32px",
              marginTop: "8px",
            }}
          >
            <div className="mb-6">
              <span
                style={{
                  color: "var(--gold-text-dark, #f2a672)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                His Leadership Philosophy
              </span>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.5rem",
                  color: "white",
                  margin: "0 0 6px",
                }}
              >
                Guided by Three Fundamental Principles
              </h3>
              <p style={{ color: "var(--line-strong)", fontSize: "0.92rem", margin: 0 }}>
                Frederick&apos;s leadership philosophy anchors every service, classroom, and recording session:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {/* Principle 1 */}
              <div
                style={{
                  background: "#161311",
                  border: "1px solid rgba(201,107,50,0.25)",
                  borderRadius: "var(--radius)",
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(201,107,50,0.18)",
                      border: "1px solid rgba(201,107,50,0.35)",
                      color: "var(--gold-text-dark, #f2a672)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Icon name="star" size={20} />
                  </div>
                  <h4
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "1.25rem",
                      color: "white",
                      margin: "0 0 8px",
                    }}
                  >
                    Excellence
                  </h4>
                  <p
                    style={{
                      color: "var(--line-strong)",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Delivering quality without compromise and maintaining standards
                    that inspire confidence.
                  </p>
                </div>
              </div>

              {/* Principle 2 */}
              <div
                style={{
                  background: "#161311",
                  border: "1px solid rgba(201,107,50,0.25)",
                  borderRadius: "var(--radius)",
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(201,107,50,0.18)",
                      border: "1px solid rgba(201,107,50,0.35)",
                      color: "var(--gold-text-dark, #f2a672)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Icon name="sparkles" size={20} />
                  </div>
                  <h4
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "1.25rem",
                      color: "white",
                      margin: "0 0 8px",
                    }}
                  >
                    Innovation
                  </h4>
                  <p
                    style={{
                      color: "var(--line-strong)",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Embracing new ideas, technology and creative possibilities to
                    advance the musical experience.
                  </p>
                </div>
              </div>

              {/* Principle 3 */}
              <div
                style={{
                  background: "#161311",
                  border: "1px solid rgba(201,107,50,0.25)",
                  borderRadius: "var(--radius)",
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(201,107,50,0.18)",
                      border: "1px solid rgba(201,107,50,0.35)",
                      color: "var(--gold-text-dark, #f2a672)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Icon name="users" size={20} />
                  </div>
                  <h4
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "1.25rem",
                      color: "white",
                      margin: "0 0 8px",
                    }}
                  >
                    Impact
                  </h4>
                  <p
                    style={{
                      color: "var(--line-strong)",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Creating opportunities, empowering talent and contributing
                    meaningfully to the growth of music and the creative industry.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 3: Looking Ahead Creed Banner (Full-Width) */}
            <div
              style={{
                background: "linear-gradient(135deg, #171412 0%, #201a16 100%)",
                border: "1px solid rgba(201,107,50,0.35)",
                borderLeft: "5px solid var(--gold)",
                borderRadius: "var(--radius)",
                padding: "28px 30px",
              }}
            >
              <span
                style={{
                  color: "var(--gold-text-dark, #f2a672)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Looking Ahead
              </span>
              <p
                style={{
                  color: "var(--line-strong)",
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  margin: "0 0 16px",
                }}
              >
                As Vivadoxa Music continues to grow, Frederick Chrysantius
                remains committed to building more than a music business. His
                ambition is to establish a lasting institution all over the
                northern part of Nigeria and beyond that inspires generations,
                nurtures exceptional talent and contributes to the evolution of
                music locally and internationally.
              </p>
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: "14px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "1.2rem",
                      color: "white",
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    &ldquo;The future of music belongs to those who dare to
                    imagine it, invest in it and bring it to life.&rdquo;
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--gold-text-dark, #f2a672)",
                      fontWeight: 700,
                      margin: "4px 0 0",
                    }}
                  >
                    — Frederick Chrysantius, Founder &amp; CEO
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(201,107,50,0.18)",
                    border: "1px solid rgba(201,107,50,0.4)",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    color: "var(--gold-text-dark, #f2a672)",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  Actualize your passion.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Core Values */}
      <section
        className="section alt"
        style={{
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="container">
          <SectionHead
            center
            eyebrow="Values"
            title="Our Core Values"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {/* Excellence */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(201,107,50,0.12)",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name="star" size={22} />
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.3rem",
                  color: "var(--navy)",
                  margin: "0 0 8px",
                }}
              >
                Excellence
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                We pursue high standards in everything we do.
              </p>
            </div>

            {/* Integrity */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(201,107,50,0.12)",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name="shield" size={22} />
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.3rem",
                  color: "var(--navy)",
                  margin: "0 0 8px",
                }}
              >
                Integrity
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                We value honesty, transparency, and responsible service.
              </p>
            </div>

            {/* Passion */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(201,107,50,0.12)",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={22}
                  height={22}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.3rem",
                  color: "var(--navy)",
                  margin: "0 0 8px",
                }}
              >
                Passion
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Our love for music inspires our work and our relationships with
                customers.
              </p>
            </div>

            {/* Innovation */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(201,107,50,0.12)",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name="sparkles" size={22} />
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.3rem",
                  color: "var(--navy)",
                  margin: "0 0 8px",
                }}
              >
                Innovation
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                We embrace new ideas, technologies, and approaches that improve
                musical experiences.
              </p>
            </div>

            {/* Community */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(201,107,50,0.12)",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Icon name="users" size={22} />
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.3rem",
                  color: "var(--navy)",
                  margin: "0 0 8px",
                }}
              >
                Community
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                We believe music thrives when people learn, create, and grow
                together.
              </p>
            </div>

            {/* Customer Commitment */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(201,107,50,0.12)",
                  color: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={22}
                  height={22}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "1.3rem",
                  color: "var(--navy)",
                  margin: "0 0 8px",
                }}
              >
                Customer Commitment
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                We listen to our customers and work to provide solutions that
                meet their needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section
        className="section"
        style={{
          background: "var(--navy2)",
          borderTop: "3px solid var(--gold)",
          borderBottom: "4px solid var(--gold)",
          padding: "90px 0 85px",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: 860, textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 16px",
              borderRadius: "var(--radius)",
              background: "rgba(201,107,50,0.18)",
              border: "1px solid rgba(201,107,50,0.35)",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                color: "var(--gold-text-dark)",
                fontSize: 11,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Our Philosophy
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(26px, 3.8vw, 42px)",
              color: "white",
              margin: "10px 0 18px",
              lineHeight: 1.35,
            }}
          >
            &ldquo;We believe every musical dream deserves an opportunity to
            grow.&rdquo;
          </h2>

          <p
            style={{
              color: "var(--line-strong)",
              fontSize: "1.12rem",
              lineHeight: 1.8,
              maxWidth: 720,
              margin: "0 auto",
            }}
          >
            At Vivadoxa Music, we do more than provide services. We help people
            discover possibilities, develop their abilities, and bring their
            musical ambitions to life.
          </p>
        </div>
      </section>
    </main>
  )
}

export default About
