import { Button, Badge, SectionHead, Icon, Cta } from "@/components/ui";
import { programs, heroImg, studioImg } from "@/lib/data";
import type { Page, Program } from "@/types";

function ProgramCard({ item, go }: { item: Program; go: (p: Page) => void }) {
  return (
    <article className="program-card">
      <div className="card-image">
        <img src={item.image} alt={`${item.name} music lesson at Vivadoxa`} loading="lazy" />
        <Badge tone="gold">{item.tag}</Badge>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>12 weeks</span>
          <span>Onsite + Online</span>
        </div>
        <h3>{item.name}</h3>
        <p>{item.desc}</p>
        <div className="card-foot">
          <strong>
            {item.fee}
            <small> / term</small>
          </strong>
          <button
            onClick={() => go("apply")}
            aria-label={`Apply for ${item.name}`}
          >
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function Home({ go }: { go: (p: Page) => void }) {
  const featured = programs.slice(0, 3);

  return (
    <main>
      {/* Hero */}
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
              Expert-led music education that builds confident musicians—one
              note, one lesson, one stage at a time.
            </p>
            <div className="button-row">
              <Button onClick={() => go("apply")}>
                Start your journey <Icon name="arrow" />
              </Button>
              <Button variant="secondary" onClick={() => go("programs")}>
                Explore programs
              </Button>
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
                from our learning community
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

      {/* Stats */}
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

      {/* Featured programs */}
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

      {/* How it works */}
      <section className="section how" aria-labelledby="steps-heading">
        <div className="container">
          <SectionHead
            center
            eyebrow="Simple admission"
            title="Your journey starts in four steps"
          />
          <div className="steps" role="list">
            {[
              ["01", "Apply online", "Tell us what you want to learn."],
              ["02", "Make payment", "Transfer to our Moniepoint account."],
              ["03", "Get confirmation", "We verify within 24 hours."],
              ["04", "Start learning", "Receive your admission letter."],
            ].map(([n, t, d], i) => (
              <div className="step" key={n} role="listitem">
                <span aria-hidden="true">{n}</span>
                {i < 3 && <i className="line" aria-hidden="true" />}
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study modes */}
      <section className="section" aria-labelledby="modes-heading">
        <div className="container modes-split">
          <div className="photo-stack">
            <img
              src={studioImg}
              alt="Professional music production and teaching studio at Vivadoxa"
              loading="lazy"
            />
            <div>
              <strong>Flexible learning</strong>
              <span>Built around your life</span>
            </div>
          </div>
          <div>
            <SectionHead
              eyebrow="Learn your way"
              title="Your goals. Your schedule. Your space."
              body="Whether you thrive in the energy of our studios or prefer focused lessons from home, the same excellent teaching meets you there."
            />
            <div className="mode-list">
              {[
                ["Onsite at our studio", "Professional rooms, instruments and community."],
                ["Live online lessons", "Personal instruction wherever you are."],
                ["Home lessons", "An instructor comes to you in Kaduna."],
              ].map(([t, d], i) => (
                <button key={t} onClick={() => go("modes")}>
                  <span>0{i + 1}</span>
                  <div>
                    <strong>{t}</strong>
                    <small>{d}</small>
                  </div>
                  <Icon name="arrow" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial" aria-label="Student testimonial">
        <div className="container quote">
          <span className="quote-mark" aria-hidden="true">&ldquo;</span>
          <blockquote>
            Vivadoxa gave my daughter more than piano lessons. They gave her
            the confidence to perform, create and truly love music.
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
  );
}
