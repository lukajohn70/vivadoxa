import { Badge, Button, Icon, PageHero, SectionHead } from "@/components/ui"
import { SEO } from "@/components/SEO"
import type { Page } from "@/types"

const MODES = [
  {
    name: "Onsite",
    sub: "Learn in our purpose-built Kaduna studio",
    price: "From ₦20,000",
    best: true,
    items: [
      "Access to 17 available studio instruments & disciplines",
      "Real-time ensemble practice & recitals",
      "Weekdays (3 days per week) or Weekends (Friday/Saturday)",
    ],
  },
  {
    name: "Online",
    sub: "Live one-to-one video lessons across Nigeria & Diaspora",
    price: "₦20,000 / $25",
    best: false,
    items: [
      "Nigerian students pay in Naira (₦) · Diaspora students pay in Dollars ($)",
      "Weekdays (3 days per week) or Weekends (Friday/Saturday)",
      "Live 1-on-1 video masterclasses & digital sheet music",
      "WhatsApp direct feedback from faculty",
    ],
  },
  {
    name: "Home lessons",
    sub: "Certified instructor visits your residence (₦70,000/mo)",
    price: "₦70,000",
    best: false,
    items: [
      "Available across Kaduna metropolis",
      "1-on-1 personalized learning pace",
      "Weekdays (3 days per week) or Weekends (Friday/Saturday)",
    ],
  },
]

export function Modes({ go }: { go: (p: Page) => void }) {
  return (
    <main>
      <SEO
        title="Study Modes — In-Studio Music Classes, Home Coaching & Online Lessons | Vivadoxa"
        description="Choose your ideal music learning format. Onsite lessons in our fully equipped Kaduna studio, 1-on-1 private home music coaching, or interactive online video classes."
        keywords="study modes, home music lessons kaduna, onsite music studio classes, online music lessons nigeria, private music tutor"
        canonicalUrl="/modes"
      />

      <PageHero
        eyebrow="Study modes"
        title="Excellent teaching, wherever you learn."
        body="Choose a format that fits your schedule, learning style and location."
      />
      <section className="section">
        <div className="container comparison">
          {MODES.map((m) => (
            <article className={m.best ? "featured" : ""} key={m.name}>
              {m.best && <Badge tone="gold">Most immersive</Badge>}
              <h2>{m.name}</h2>
              <p>{m.sub}</p>
              <strong>
                {m.price}
                <small> / month</small>
              </strong>
              <ul>
                {m.items.map((x) => (
                  <li key={x}>
                    <span>
                      <Icon name="check" size={16} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              <Button
                variant={m.best ? "primary" : "secondary"}
                onClick={() => go("apply")}
                fullWidth
              >
                Choose {m.name}
              </Button>
            </article>
          ))}
        </div>

        <div className="faq">
          <SectionHead
            eyebrow="Common questions"
            title="Everything you need to know"
          />
          {[
            [
              "Can I switch study modes during the term?",
              "Yes. Speak with our admissions team and we will help you move to the best option, subject to instructor availability.",
            ],
            [
              "Do I need to own an instrument?",
              "For onsite lessons, studio instruments are provided. For online and home lessons, you will need access to your own instrument.",
            ],
            [
              "How long is each lesson?",
              "Standard lessons are 60 minutes. Intensive sessions of 90 minutes are available on request.",
            ],
          ].map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Modes
