import { useState, useEffect } from "react"
import {
  PageHero,
  SectionHead,
  Cta,
  Button,
  Icon,
  WhatsAppIcon,
} from "@/components/ui"
import { SEO } from "@/components/SEO"
import {
  drumsImg,
  trumpetImg,
  portraitImg,
  heroImg,
  cohortImg,
  rcBadgeImg,
  repairSaxImg,
} from "@/lib/data"
import { fetchAcademics } from "@/lib/api"
import { WHATSAPP_URL } from "@/lib/utils"
import type { Page } from "@/types"

interface FacultyMember {
  name: string
  title: string
  specialization: string
  bio?: string
  image?: string
  is_director?: number
}

const defaultFaculty: FacultyMember[] = [
  {
    name: "Frederick Chrysantius",
    title: "Founder & Artistic Director",
    specialization: "Classical, Contemporary & Jazz / Composition",
    bio: "Pianist, composer, and educator guiding aspiring musicians, church music directors, and concert instrumentalists in Kaduna.",
    image: portraitImg,
    is_director: 1,
  },
  {
    name: "David Eze",
    title: "Guitar & Production Instructor",
    specialization: "Acoustic, Electric & DAWs",
    bio: "Multi-instrumentalist and session engineer specializing in fretboard harmony and audio production.",
    image: trumpetImg,
    is_director: 0,
  },
  {
    name: "Morenike Bello",
    title: "Vocal Performance Lead",
    specialization: "Breathing, Pitch & Stagecraft",
    bio: "Vocal coach experienced in classical choral direction and contemporary gospel performance.",
    image: heroImg,
    is_director: 0,
  },
]

export function About({ go }: { go: (p: Page) => void }) {
  const [faculty, setFaculty] = useState<FacultyMember[]>(defaultFaculty)

  // Frontend-backend live data synchronization
  useEffect(() => {
    fetchAcademics("instructors")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaculty(
            data.map((ins: any) => ({
              name: ins.name,
              title: ins.title || "Instructor",
              specialization: ins.specialization || "Music Instruction",
              bio: ins.bio || "",
              image: ins.image || (ins.is_director ? portraitImg : trumpetImg),
              is_director: ins.is_director ? 1 : 0,
            })),
          )
        }
      })
      .catch(() => {})
  }, [])

  const director = faculty.find((f) => f.is_director === 1) || faculty[0]
  const otherFaculty = faculty.filter((f) => f !== director)

  return (
    <main>
      <SEO
        title="About Vivadoxa — Music School, Instrument Hospital & Recording Studio | Kaduna"
        description="Learn about Vivadoxa in Kaduna, Nigeria. Our story, artistic directors, faculty, and four core pillars: innovative music lessons, certified instrument repairs, sales, and a modern recording studio."
        keywords="about vivadoxa, music school kaduna, instrument hospital kaduna, recording studio kaduna, frederick chrysantius"
        canonicalUrl="/about"
        ogImage="/media/studio/academy-cohort-group.jpeg"
      />

      <PageHero
        eyebrow="About Vivadoxa"
        title="Music changes people. We help that happen."
        body="Since 2013, we have helped young people, church music leaders, and adults in Kaduna discover their voice, master an instrument, and perform with confidence."
        image={cohortImg}
      />

      {/* Origin Story */}
      <section className="section">
        <div className="container story-grid">
          <div>
            <SectionHead
              eyebrow="Our story"
              title="Rooted in craft. Driven by purpose."
            />
            <p>
              What began as an intimate keyboard class in Kaduna has grown into
              a vibrant conservatory and instrument clinic. Our pedagogy bridges
              deep classical technique, authentic African musicality, and
              real-world stage performance.
            </p>
            <p>
              We believe elite music education should feel personal,
              disciplined, and deeply inspiring—regardless of whether a student
              is four years old or sixty.
            </p>
          </div>
          <div className="mission-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
              }}
            >
              <span>Our Motto</span>
              <span
                className="badge badge-gold"
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  textTransform: "none",
                  letterSpacing: "normal",
                }}
              >
                Official Credo
              </span>
            </div>
            <h3
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.65rem",
                color: "var(--navy)",
                margin: "4px 0 16px",
              }}
            >
              &ldquo;Actualize your passion&rdquo;
            </h3>

            <hr style={{ margin: "20px 0" }} />

            <span>Our vision</span>
            <h3
              style={{
                fontSize: "1.2rem",
                lineHeight: 1.45,
                margin: "8px 0 12px",
                fontFamily: "'DM Serif Display', serif",
                color: "var(--navy)",
              }}
            >
              &ldquo;A world where every musician, from beginner to pro, has
              access to the tools, knowledge, and environment to bring their
              unique sound to life.&rdquo;
            </h3>

            <hr style={{ margin: "20px 0" }} />

            <span>Our mission</span>
            <p
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.2rem",
                lineHeight: 1.45,
                color: "var(--navy)",
                margin: "8px 0 12px",
              }}
            >
              To deliver exceptional musical experiences through four core
              pillars: <strong>innovative lessons</strong>,{" "}
              <strong>curated instrument sales</strong>,{" "}
              <strong>dependable repair services</strong>, and a{" "}
              <strong>state-of-the-art recording studio</strong>.
            </p>
            <p
              style={{
                color: "var(--gold)",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: "0.92rem",
                margin: "0 0 4px",
              }}
            >
              &ldquo;At Vivadoxa, we don&apos;t just sell music. We create it,
              teach it, and preserve it.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Four Core Pillars of Vivadoxa */}
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
            eyebrow="The Vivadoxa Framework"
            title="Four Pillars of Musical Excellence"
            body="How we deliver exceptional musical experiences across Northern Nigeria and beyond—uniting world-class instruction, premium equipment, master repairs, and audio production."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {/* Pillar 1 */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: "rgba(201,107,50,0.12)",
                    color: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon name="music" size={22} />
                </div>
                <span
                  className="eyebrow"
                  style={{ color: "var(--gold)", fontSize: 11 }}
                >
                  Pillar 01
                </span>
                <h3
                  style={{
                    fontSize: 20,
                    margin: "6px 0 10px",
                    color: "var(--navy)",
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  Innovative Lessons
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Structured pedagogy spanning classical techniques,
                  contemporary praise medleys, and graded syllabi (ABRSM &amp;
                  MUSON). Tailored cohorts for children, teens, and adults.
                </p>
              </div>
              <button
                onClick={() => go("programs")}
                className="btn btn-secondary"
                style={{
                  marginTop: 22,
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                Explore Programs →
              </button>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: "rgba(30,58,95,0.1)",
                    color: "var(--navy)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon name="home" size={22} />
                </div>
                <span
                  className="eyebrow"
                  style={{ color: "var(--gold)", fontSize: 11 }}
                >
                  Pillar 02
                </span>
                <h3
                  style={{
                    fontSize: 20,
                    margin: "6px 0 10px",
                    color: "var(--navy)",
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  Studio &amp; Home Coaching
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Learn at our fully equipped Angwan Sunday studio or request
                  certified instructors for private doorstep music lessons
                  across Kaduna, as well as Sunday Specials for church
                  instrumentalists.
                </p>
              </div>
              <button
                onClick={() => go("modes")}
                className="btn btn-secondary"
                style={{
                  marginTop: 22,
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                Explore Study Modes →
              </button>
            </div>

            {/* Pillar 3 */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <div
                  style={{
                    height: 140,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 16,
                    background: "#0a192f",
                  }}
                >
                  <img
                    src={repairSaxImg}
                    alt="Vivadoxa instrument hospital craftsman repairing saxophone"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </div>
                <span
                  className="eyebrow"
                  style={{ color: "var(--gold)", fontSize: 11 }}
                >
                  Pillar 03
                </span>
                <h3
                  style={{
                    fontSize: 20,
                    margin: "6px 0 10px",
                    color: "var(--navy)",
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  Dependable Repair Services
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Kaduna&apos;s premier instrument hospital. Comprehensive
                  diagnostics, piano action regulation, brass ultrasonic
                  flushes, electronic keyboard servicing, and courier pickup
                  right to your doorstep.
                </p>
              </div>
              <button
                onClick={() => go("repairs")}
                className="btn btn-secondary"
                style={{
                  marginTop: 22,
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                Book Instrument Clinic →
              </button>
            </div>

            {/* Pillar 4 */}
            <div
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: "rgba(30,58,95,0.1)",
                    color: "var(--navy)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <Icon name="video" size={22} />
                </div>
                <span
                  className="eyebrow"
                  style={{ color: "var(--gold)", fontSize: 11 }}
                >
                  Pillar 04
                </span>
                <h3
                  style={{
                    fontSize: 20,
                    margin: "6px 0 10px",
                    color: "var(--navy)",
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  State-of-the-Art Studio
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  A dedicated, acoustically treated recording studio for recital
                  preservation, vocal tracking, gospel and band production,
                  audio mixing, and multi-track session capture.
                </p>
              </div>
              <button
                onClick={() => go("contact")}
                className="btn btn-secondary"
                style={{
                  marginTop: 22,
                  width: "100%",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                Inquire Studio Sessions →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CEO & Founder Spotlight Section */}
      <section
        className="section"
        style={{ background: "var(--navy)", color: "white" }}
      >
        <div className="container grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <div style={{ position: "relative" }}>
            <div
              style={{
                borderRadius: "var(--radius)",
                overflow: "hidden",
                border: "1px solid rgba(201,107,50,0.3)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              }}
            >
              <img
                src={director.image || portraitImg}
                alt={`${director.name}, ${director.title} of Vivadoxa Music School`}
                className="h-72 sm:h-96 lg:h-[460px] w-full object-cover"
              />
              <div
                style={{
                  padding: "18px 20px",
                  background: "var(--navy2)",
                  borderTop: "1px solid rgba(201,107,50,0.2)",
                }}
              >
                <strong
                  style={{
                    fontSize: 20,
                    color: "white",
                    display: "block",
                    fontFamily: "'DM Serif Display', serif",
                  }}
                >
                  {director.name}
                </strong>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--gold2)",
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    fontWeight: 700,
                  }}
                >
                  {director.title}
                </span>
                <p
                  style={{ fontSize: 12, color: "#9dacb8", margin: "6px 0 0" }}
                >
                  {director.specialization}
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="eyebrow" style={{ color: "var(--gold2)" }}>
              Executive Leadership
            </span>
            <h2
              style={{
                color: "white",
                fontSize: "clamp(30px, 4vw, 50px)",
                margin: "12px 0 18px",
              }}
            >
              A letter from our Artistic Director.
            </h2>
            <blockquote
              style={{
                color: "#c1ccd5",
                fontSize: 15,
                lineHeight: 1.7,
                fontStyle: "italic",
                margin: "0 0 20px",
                borderLeft: "3px solid var(--gold)",
                paddingLeft: 16,
              }}
            >
              &ldquo;Music is not merely entertainment—it is a language that
              shapes intellect, character, and spiritual expression. When we
              founded Vivadoxa in 2013, our aim was clear: to raise music stars
              with authentic technical discipline, giving African talents the
              foundation to stand on any global stage.&rdquo;
            </blockquote>
            <p
              style={{
                color: "#9dacb8",
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 28,
              }}
            >
              {director.bio}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5">
              <Button onClick={() => go("apply")}>
                Start Your Journey <Icon name="arrow" />
              </Button>
              <a
                href={`${WHATSAPP_URL}?text=Hello%20Director%20Frederick,%20I%20read%20your%20note%20on%20the%20Vivadoxa%20About%20page%20and%20would%20like%20to%20connect.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center justify-center gap-2"
                style={{
                  borderColor: "rgba(37,211,102,0.4)",
                  color: "#25D366",
                  background: "rgba(37,211,102,0.08)",
                }}
              >
                <WhatsAppIcon size={18} /> Connect with the Director
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Team */}
      <section className="section alt">
        <div className="container">
          <SectionHead
            center
            eyebrow="Meet your mentors"
            title="Learn from working musicians"
            body="Our faculty comprises seasoned recitalists, sound engineers, and choral leaders dedicated to personalized instruction."
          />
          <div className="team-grid">
            {faculty.map((ins) => (
              <article className="team-card" key={ins.name}>
                <img
                  src={ins.image || trumpetImg}
                  alt={`${ins.name}, ${ins.title} at Vivadoxa`}
                  loading="lazy"
                  style={{ width: "100%", height: 320, objectFit: "cover" }}
                />
                <h3>{ins.name}</h3>
                <p
                  style={{
                    color: "var(--gold)",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {ins.title}
                </p>
                <p>{ins.specialization}</p>
              </article>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 45 }}>
            <button
              onClick={() => go("performances")}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              Watch student recitals & concerts →
            </button>
          </div>
        </div>
      </section>

      <Cta go={go} />
    </main>
  )
}

export default About
