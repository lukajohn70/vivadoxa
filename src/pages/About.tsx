import { useState, useEffect } from "react"
import { PageHero, SectionHead, Cta, Button, Icon, WhatsAppIcon } from "@/components/ui"
import { drumsImg, trumpetImg, portraitImg, heroImg } from "@/lib/data"
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
    name: "Tosin Adewale",
    title: "Founder & Artistic Director",
    specialization: "Classical, Contemporary & Jazz / Composition",
    bio: "Pianist, composer, and educator with over 15 years guiding aspiring musicians, church music directors, and concert pianists across West Africa.",
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
            }))
          )
        }
      })
      .catch(() => {})
  }, [])

  const director = faculty.find((f) => f.is_director === 1) || faculty[0]
  const otherFaculty = faculty.filter((f) => f !== director)

  return (
    <main>
      <PageHero
        eyebrow="About Vivadoxa"
        title="Music changes people. We help that happen."
        body="Since 2013, we have helped young people, church music leaders, and adults in Kaduna discover their voice, master an instrument, and perform with confidence."
        image={drumsImg}
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
              What began as an intimate keyboard class in Kaduna has grown into a
              vibrant conservatory and instrument clinic. Our pedagogy bridges
              deep classical technique, authentic African musicality, and real-world
              stage performance.
            </p>
            <p>
              We believe elite music education should feel personal,
              disciplined, and deeply inspiring—regardless of whether a student
              is four years old or sixty.
            </p>
          </div>
          <div className="mission-card">
            <span>Our mission</span>
            <h3>To nurture skilled, expressive, and confident musicians.</h3>
            <hr />
            <span>Our vision</span>
            <h3>
              To become Northern Nigeria&apos;s most trusted benchmark for modern music
              education and instrument craftsmanship.
            </h3>
          </div>
        </div>
      </section>

      {/* CEO & Founder Spotlight Section */}
      <section className="section" style={{ background: "var(--navy)", color: "white" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 70, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid rgba(201,107,50,0.3)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
              <img
                src={director.image || portraitImg}
                alt={`${director.name}, ${director.title} of Vivadoxa Music School`}
                style={{ height: 460, width: "100%", objectFit: "cover" }}
              />
              <div style={{ padding: "20px 24px", background: "var(--navy2)", borderTop: "1px solid rgba(201,107,50,0.2)" }}>
                <strong style={{ fontSize: 20, color: "white", display: "block", fontFamily: "'DM Serif Display', serif" }}>
                  {director.name}
                </strong>
                <span style={{ fontSize: 11, color: "var(--gold2)", textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: 700 }}>
                  {director.title}
                </span>
                <p style={{ fontSize: 12, color: "#9dacb8", margin: "6px 0 0" }}>
                  {director.specialization}
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="eyebrow" style={{ color: "var(--gold2)" }}>Executive Leadership</span>
            <h2 style={{ color: "white", fontSize: "clamp(34px, 4vw, 50px)", margin: "12px 0 18px" }}>
              A letter from our Artistic Director.
            </h2>
            <blockquote style={{ color: "#c1ccd5", fontSize: 16, lineHeight: 1.7, fontStyle: "italic", margin: "0 0 20px", borderLeft: "3px solid var(--gold)", paddingLeft: 20 }}>
              &ldquo;Music is not merely entertainment—it is a language that shapes intellect, character, and spiritual expression. When we founded Vivadoxa in 2013, our aim was clear: to raise music stars with authentic technical discipline, giving African talents the foundation to stand on any global stage.&rdquo;
            </blockquote>
            <p style={{ color: "#9dacb8", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
              {director.bio}
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Button onClick={() => go("apply")}>
                Start Your Journey <Icon name="arrow" />
              </Button>
              <a
                href={`${WHATSAPP_URL}?text=Hello%20Director%20Tosin,%20I%20read%20your%20note%20on%20the%20Vivadoxa%20About%20page%20and%20would%20like%20to%20connect.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center gap-2"
                style={{ borderColor: "rgba(37,211,102,0.4)", color: "#25D366", background: "rgba(37,211,102,0.08)" }}
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
                />
                <h3>{ins.name}</h3>
                <p style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12 }}>{ins.title}</p>
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

      {/* Examination standards */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <SectionHead
            center
            eyebrow="Pedagogical Standard"
            title="Graded Exam & Performance Syllabus"
            body="Every Vivadoxa curriculum prepares candidates for internationally recognized examination boards including ABRSM and Trinity College London."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 32 }}>
            <div style={{ padding: 24, borderRadius: "var(--radius)", background: "var(--cream)", border: "1px solid var(--line)" }}>
              <span className="eyebrow">ABRSM UK</span>
              <h4 style={{ margin: "8px 0 6px", fontSize: 18, color: "var(--navy)", fontFamily: "'DM Serif Display', serif" }}>Classical & Theory Syllabus</h4>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Rigorous scales, sight-reading, aural training, and graded classical repertoire.
              </p>
            </div>
            <div style={{ padding: 24, borderRadius: "var(--radius)", background: "var(--cream)", border: "1px solid var(--line)" }}>
              <span className="eyebrow">Trinity College London</span>
              <h4 style={{ margin: "8px 0 6px", fontSize: 18, color: "var(--navy)", fontFamily: "'DM Serif Display', serif" }}>Rock & Pop Standards</h4>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Contemporary drum groove assessment, lead guitar improvisation, and vocal styling.
              </p>
            </div>
            <div style={{ padding: 24, borderRadius: "var(--radius)", background: "var(--cream)", border: "1px solid var(--line)" }}>
              <span className="eyebrow">African & Western Fusion</span>
              <h4 style={{ margin: "8px 0 6px", fontSize: 18, color: "var(--navy)", fontFamily: "'DM Serif Display', serif" }}>MUSON Alignment</h4>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                Rooted in authentic African rhythm, praise medleys, and contemporary stage performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Cta go={go} />
    </main>
  )
}

export default About
