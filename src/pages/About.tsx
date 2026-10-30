import { PageHero, SectionHead, Icon } from "@/components/ui"
import { SEO } from "@/components/SEO"
import { cohortImg } from "@/lib/data"
import type { Page } from "@/types"

export function About({ go }: { go: (p: Page) => void }) {
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
      <section className="section" style={{ background: "white" }}>
        <div className="container story-grid">
          <div>
            <SectionHead
              eyebrow="Our Story"
              title="Built on a Passion for Music"
            />
            <p>
              Music is more than sound. It is a language of expression, a
              source of inspiration, a profession, and a powerful force that
              brings people together.
            </p>
            <p>
              Founded in 2019, Vivadoxa Music was established to provide
              musicians with access to the training, equipment, creative
              facilities, and technical support they need to thrive.
            </p>
            <p>
              Over the years, we have developed an integrated music environment
              that brings essential musical services together in one place.
            </p>
            <p>
              From nurturing young talents to supporting experienced performers,
              our purpose remains the same: to make quality music education,
              equipment, production, and technical services more accessible.
            </p>
            <p>
              Based in Kaduna, Nigeria, we continue to work towards raising
              musical standards and building a community where talent is
              discovered, creativity is encouraged, and excellence is pursued.
            </p>
          </div>

          <div className="mission-card">
            <span
              style={{
                color: "var(--gold)",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              Our Vision
            </span>
            <h3
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.3rem",
                lineHeight: 1.5,
                color: "var(--navy)",
                margin: "10px 0 16px",
              }}
            >
              &ldquo;A world where every musician, from beginner to pro, has
              access to the tools, knowledge, and environment to bring their
              unique sound to life.&rdquo;
            </h3>

            <hr style={{ margin: "24px 0" }} />

            <span
              style={{
                color: "var(--gold)",
                textTransform: "uppercase",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              Our Mission
            </span>
            <p
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.15rem",
                lineHeight: 1.5,
                color: "var(--navy)",
                margin: "10px 0 14px",
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
                fontSize: "0.95rem",
                margin: 0,
              }}
            >
              &ldquo;At Vivadoxa, we don&apos;t just sell music. We create it,
              teach it, and preserve it.&rdquo;
            </p>
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
