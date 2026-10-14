import { useState } from "react";
import {
  Button,
  Badge,
  SectionHead,
  Icon,
  PageHero,
  Field,
  Textarea,
  SelectField,
  UploadZone,
  Success,
  Cta,
} from "@/components/ui";
import { programs, drumsImg, trumpetImg, portraitImg, heroImg } from "@/lib/data";
import type { Page, Program } from "@/types";
import { isValidEmail } from "@/lib/utils";

// ── About ─────────────────────────────────────────────────────────────────────
export function About({ go }: { go: (p: Page) => void }) {
  return (
    <main>
      <PageHero
        eyebrow="About Vivadoxa"
        title="Music changes people. We help that happen."
        body="Since 2013, we have helped young people and adults discover their voice, master an instrument and grow in confidence."
        image={drumsImg}
      />

      <section className="section">
        <div className="container story-grid">
          <div>
            <SectionHead eyebrow="Our story" title="Rooted in craft. Driven by purpose." />
            <p>
              What began as a small keyboard class in Kaduna has grown into a vibrant learning
              community. Our teaching blends sound technique, creative expression and real
              performance experience.
            </p>
            <p>
              We believe excellent music education should feel personal, practical and
              joyful—at every age and skill level.
            </p>
          </div>
          <div className="mission-card">
            <span>Our mission</span>
            <h3>To nurture skilled, expressive and confident musicians.</h3>
            <hr />
            <span>Our vision</span>
            <h3>To become Africa&apos;s most trusted home for modern music education.</h3>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHead center eyebrow="Meet your mentors" title="Learn from working musicians" />
          <div className="team-grid">
            {[
              ["Tosin Adewale", "Piano & Composition", portraitImg],
              ["David Eze", "Guitar & Production", trumpetImg],
              ["Morenike Bello", "Vocals & Performance", heroImg],
            ].map(([n, s, img]) => (
              <article className="team-card" key={n}>
                <img src={img} alt={`${n}, ${s} instructor at Vivadoxa`} loading="lazy" />
                <h3>{n}</h3>
                <p>{s}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Cta go={go} />
    </main>
  );
}

// ── Programs ──────────────────────────────────────────────────────────────────
function ProgramCard({ item, go }: { item: Program; go: (p: Page) => void }) {
  return (
    <article className="program-card">
      <div className="card-image">
        <img src={item.image} alt={`${item.name} lessons at Vivadoxa`} loading="lazy" />
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
          <button onClick={() => go("apply")} aria-label={`Apply for ${item.name}`}>
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </article>
  );
}

const TABS = ["Instruments", "Vocals", "Composition", "Music Production"] as const;

export function Programs({ go }: { go: (p: Page) => void }) {
  const [tab, setTab] = useState<typeof TABS[number]>("Instruments");
  const [level, setLevel] = useState("");

  const filtered = programs.filter((p) => p.category === tab);

  return (
    <main>
      <PageHero
        eyebrow="Programs & courses"
        title="Find the sound that feels like you."
        body="Structured, practical training for beginners through advanced musicians."
      />
      <section className="section">
        <div className="container">
          <div className="tabs" role="tablist" aria-label="Program categories">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <p>
              <strong>{tab}</strong> · {filtered.length} program{filtered.length !== 1 && "s"}
            </p>
            <select
              aria-label="Filter by level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="program-grid" role="tabpanel">
            {filtered.map((item) => (
              <ProgramCard key={item.name} item={item} go={go} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

// ── Study Modes ───────────────────────────────────────────────────────────────
const MODES = [
  {
    name: "Onsite",
    sub: "Learn in our purpose-built studio",
    price: "From ₦75,000",
    best: true,
    items: ["Access to studio instruments", "Real-time ensemble practice", "Weekday and weekend slots"],
  },
  {
    name: "Online",
    sub: "Live one-to-one video lessons",
    price: "From ₦60,000",
    best: false,
    items: ["Learn from anywhere", "Lesson recordings included", "Stable internet required"],
  },
  {
    name: "Home lessons",
    sub: "We bring the lesson to you",
    price: "From ₦95,000",
    best: false,
    items: ["Available across Kaduna", "No commute required", "Your own instrument preferred"],
  },
];

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
          <SectionHead eyebrow="Common questions" title="Everything you need to know" />
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
  );
}

// ── Repairs ───────────────────────────────────────────────────────────────────
interface RepairForm {
  fullName: string;
  phone: string;
  email: string;
  instrumentType: string;
  issue: string;
  photos: FileList | null;
}

const emptyRepair: RepairForm = {
  fullName: "",
  phone: "",
  email: "",
  instrumentType: "",
  issue: "",
  photos: null,
};

export function Repairs() {
  const [form, setForm] = useState<RepairForm>(emptyRepair);
  const [errors, setErrors] = useState<Partial<Record<keyof RepairForm, string>>>({});
  const [sent, setSent] = useState(false);

  function set<K extends keyof RepairForm>(k: K, v: RepairForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (!form.instrumentType) e.instrumentType = "Please select an instrument type.";
    if (!form.issue.trim()) e.issue = "Please describe the issue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setSent(true);
  }

  if (sent) {
    return (
      <main>
        <PageHero
          eyebrow="Repairs & maintenance"
          title="Give your instrument its voice back."
          body="Careful diagnostics, expert repairs and transparent pricing for the instruments you love."
          image={trumpetImg}
        />
        <section className="section">
          <div className="container">
            <div className="form-shell">
              <Success
                title="Request received"
                body="Our repair specialist will contact you within one business day with the next steps."
                onReset={() => { setSent(false); setForm(emptyRepair); }}
              />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        eyebrow="Repairs & maintenance"
        title="Give your instrument its voice back."
        body="Careful diagnostics, expert repairs and transparent pricing for the instruments you love."
        image={trumpetImg}
      />
      <section className="section">
        <div className="container">
          <div className="service-grid">
            {["Professional tuning", "String replacement", "Full servicing", "Careful restoration", "Deep cleaning"].map(
              (x, i) => (
                <div className="service-card" key={x}>
                  <span>0{i + 1}</span>
                  <h3>{x}</h3>
                  <p>Expert care, quality parts and a clear estimate before work begins.</p>
                </div>
              )
            )}
          </div>

          <div className="form-shell">
            <SectionHead eyebrow="Request a repair" title="Tell us what is happening" />
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <Field
                  id="repair-name"
                  label="Full name"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={(v) => set("fullName", v)}
                  required
                  error={errors.fullName}
                />
                <Field
                  id="repair-phone"
                  label="Phone number"
                  placeholder="+234"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  required
                  error={errors.phone}
                />
                <Field
                  id="repair-email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  required
                  error={errors.email}
                />
                <SelectField
                  id="repair-instrument"
                  label="Instrument type"
                  value={form.instrumentType}
                  onChange={(v) => set("instrumentType", v)}
                  required
                >
                  <option value="Piano / Keyboard">Piano / Keyboard</option>
                  <option value="Guitar">Guitar</option>
                  <option value="Brass">Brass</option>
                  <option value="Drums">Drums</option>
                  <option value="Strings">Strings</option>
                  <option value="Other">Other</option>
                </SelectField>
                <Textarea
                  id="repair-issue"
                  label="Describe the issue"
                  placeholder="Tell us what you noticed..."
                  value={form.issue}
                  onChange={(v) => set("issue", v)}
                  required
                />
                <UploadZone
                  label="Upload instrument photos"
                  hint="JPG or PNG, up to 10MB"
                  accept="image/jpeg,image/png"
                  onChange={(files) => set("photos", files)}
                  fileName={form.photos?.[0]?.name}
                />
              </div>
              <div className="form-action">
                <Button type="submit">
                  Submit repair request <Icon name="arrow" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const emptyContact: ContactForm = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function Contact() {
  const [form, setForm] = useState<ContactForm>(emptyContact);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [sent, setSent] = useState(false);

  function set<K extends keyof ContactForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(form.email)) e.email = "Enter a valid email address.";
    if (!form.subject) e.subject = "Please select a subject.";
    if (!form.message.trim()) e.message = "Message cannot be empty.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setSent(true);
  }

  return (
    <main>
      <PageHero
        eyebrow="Contact us"
        title="Let's talk about your music."
        body="Questions about a course, repair or application? Our friendly team is ready to help."
      />
      <section className="section">
        <div className="container contact-grid">
          <div>
            <SectionHead eyebrow="Visit or call" title="We'd love to hear from you" />
            <div className="contact-list">
              <div>
                <Icon name="pin" />
                <p>
                  <strong>Our studio</strong>
                  <span>U/Sunday, Television, Kaduna, Nigeria</span>
                </p>
              </div>
              <div>
                <Icon name="phone" />
                <p>
                  <strong>Call us</strong>
                  <a href="tel:+2348031308881">+234 803 130 8881</a>
                </p>
              </div>
              <div>
                <Icon name="mail" />
                <p>
                  <strong>Email us</strong>
                  <a href="mailto:hello@vivadoxa.ng">hello@vivadoxa.ng</a>
                </p>
              </div>
            </div>
            <div className="hours">
              <strong>Opening hours</strong>
              <span>Mon–Fri: 9:00 AM – 7:00 PM</span>
              <span>Saturday: 9:00 AM – 5:00 PM</span>
            </div>
            <div className="map" aria-label="Map placeholder — Vivadoxa location">
              KADUNA
              <span>Vivadoxa Music School · U/Sunday, Television</span>
            </div>
          </div>

          <div className="contact-form">
            {sent ? (
              <Success
                title="Message sent"
                body="Thank you for reaching out. We'll reply within one business day."
                onReset={() => { setSent(false); setForm(emptyContact); }}
              />
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2>Send us a message</h2>
                <div className="form-grid">
                  <Field
                    id="contact-name"
                    label="Full name"
                    value={form.fullName}
                    onChange={(v) => set("fullName", v)}
                    required
                    error={errors.fullName}
                  />
                  <Field
                    id="contact-email"
                    label="Email address"
                    type="email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    required
                    error={errors.email}
                  />
                  <Field
                    id="contact-phone"
                    label="Phone number"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                  />
                  <SelectField
                    id="contact-subject"
                    label="Subject"
                    value={form.subject}
                    onChange={(v) => set("subject", v)}
                    required
                  >
                    <option value="Program enquiry">Program enquiry</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Repairs">Repairs</option>
                    <option value="Other">Other</option>
                  </SelectField>
                  <Textarea
                    id="contact-message"
                    label="Message"
                    placeholder="How can we help?"
                    value={form.message}
                    onChange={(v) => set("message", v)}
                    required
                  />
                </div>
                <Button type="submit">
                  Send message <Icon name="arrow" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
