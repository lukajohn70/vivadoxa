import { Badge, Button, Icon, PageHero, SectionHead } from "@/components/ui"
import type { Page } from "@/types"

const MODES = [
  {
    name: "Onsite",
    sub: "Learn in our purpose-built studio",
    price: "From ₦75,000",
    best: true,
    items: [
      "Access to studio instruments",
      "Real-time ensemble practice",
      "Weekday and weekend slots",
    ],
  },
  {
    name: "Online",
    sub: "Live one-to-one video lessons",
    price: "From ₦60,000",
    best: false,
    items: [
      "Learn from anywhere",
      "Lesson recordings included",
      "Stable internet required",
    ],
  },
  {
    name: "Home lessons",
    sub: "We bring the lesson to you",
    price: "From ₦95,000",
    best: false,
    items: [
      "Available across Kaduna",
      "No commute required",
      "Your own instrument preferred",
    ],
  },
]

export function Modes({ go }: { go: (p: Page) => void }) {
  return (
    <main>
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
                <small> / term</small>
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
