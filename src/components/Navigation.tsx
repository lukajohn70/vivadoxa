import { useState, useRef, useEffect } from "react"
import {
  Icon,
  Logo,
  Button,
  WhatsAppIcon,
  GoogleIcon,
  TikTokIcon,
  FacebookIcon,
  YouTubeIcon,
  InstagramIcon,
  GmailIcon,
} from "@/components/ui"
import {
  WHATSAPP_URL,
  SCHOOL_PHONE,
  SCHOOL_PHONE_2,
  SCHOOL_WHATSAPP,
  SCHOOL_EMAIL,
  SCHOOL_ADDRESS,
  GOOGLE_REVIEWS_URL,
  GOOGLE_MAPS_DIRECTIONS_URL,
  YOUTUBE_URL,
  TIKTOK_URL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
} from "@/lib/utils"
import type { Page } from "@/types"

interface NavbarProps {
  page: Page
  go: (p: Page) => void
}

export function Navbar({ page, go }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  const programsRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (programsRef.current && !programsRef.current.contains(target)) {
        setProgramsOpen(false)
      }
      if (servicesRef.current && !servicesRef.current.contains(target)) {
        setServicesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Lock background body scroll when mobile navigation is open & listen for Escape
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setProgramsOpen(false)
        setServicesOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const handleProgramsToggle = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth <= 800) {
      e.preventDefault()
      setProgramsOpen((prev) => !prev)
      setServicesOpen(false)
    } else {
      go("programs")
      setProgramsOpen(false)
      setOpen(false)
    }
  }

  const handleServicesToggle = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth <= 800) {
      e.preventDefault()
      setServicesOpen((prev) => !prev)
      setProgramsOpen(false)
    } else {
      setServicesOpen((prev) => !prev)
    }
  }

  const isServicesActive = page === "repairs" || page === "performances"
  const isProgramsActive = page === "programs" || page === "modes"
  const isPortalActive = page === "portal" || page === "status"

  return (
    <header className="nav" role="banner">
      {/* Mobile backdrop overlay */}
      {open && (
        <div
          className="nav-backdrop"
          onClick={() => {
            setOpen(false)
            setProgramsOpen(false)
            setServicesOpen(false)
          }}
          aria-hidden="true"
        />
      )}

      <div className="container nav-inner">
        <button
          className="logo-button"
          onClick={() => {
            go("home")
            setOpen(false)
            setProgramsOpen(false)
            setServicesOpen(false)
          }}
          aria-label="Vivadoxa Music School Home"
        >
          <Logo />
        </button>

        <nav
          className={open ? "open" : ""}
          aria-label="Main navigation"
          id="main-nav"
        >
          <div className="nav-links">
            {/* 1. Academic Programs Dropdown */}
            <div
              className={`nav-dropdown-wrapper ${
                programsOpen ? "expanded" : ""
              }`}
              ref={programsRef}
              onMouseEnter={() => {
                if (typeof window !== "undefined" && window.innerWidth > 800) {
                  setProgramsOpen(true)
                }
              }}
              onMouseLeave={() => {
                if (typeof window !== "undefined" && window.innerWidth > 800) {
                  setProgramsOpen(false)
                }
              }}
            >
              <button
                className={`nav-dropdown-trigger flex items-center justify-between w-full md:w-auto gap-1 ${
                  isProgramsActive ? "active" : ""
                }`}
                onClick={handleProgramsToggle}
                aria-expanded={programsOpen}
                aria-haspopup="true"
              >
                <span>Programs</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                    programsOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div
                className={`nav-dropdown-panel ${
                  programsOpen
                    ? "open opacity-100 visible translate-y-0 max-h-[500px]"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none md:pointer-events-none max-h-0 md:max-h-none overflow-hidden md:overflow-visible"
                }`}
              >
                <div className="dropdown-section">
                  <span className="dropdown-heading">
                    Curriculum &amp; Fee Schedule
                  </span>
                  <button
                    onClick={() => {
                      go("programs")
                      setProgramsOpen(false)
                      setOpen(false)
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{
                        background: "rgba(201,107,50,0.12)",
                        color: "var(--gold)",
                      }}
                    >
                      <Icon name="calendar" size={16} />
                    </div>
                    <div>
                      <strong>Official Fee Schedule</strong>
                      <small>
                        1 Mo · 3 Mos · 6 Mos · 12 Mos · 2 Yrs Diploma
                      </small>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      go("programs")
                      setProgramsOpen(false)
                      setOpen(false)
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{
                        background: "rgba(30,58,95,0.08)",
                        color: "var(--navy)",
                      }}
                    >
                      <Icon name="music" size={16} />
                    </div>
                    <div>
                      <strong>17 Available Disciplines</strong>
                      <small>
                        Sax, Trumpet, Piano, Bass, Flute, Drums, Voice &amp;
                        more
                      </small>
                    </div>
                  </button>
                </div>

                <div className="dropdown-section border-t border-[var(--line)] pt-2 mt-2">
                  <span className="dropdown-heading">Instruction Formats</span>
                  <button
                    onClick={() => {
                      go("modes")
                      setProgramsOpen(false)
                      setOpen(false)
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{
                        background: "rgba(30,58,95,0.08)",
                        color: "var(--navy)",
                      }}
                    >
                      <Icon name="pin" size={16} />
                    </div>
                    <div>
                      <strong>Onsite Academy (Kaduna)</strong>
                      <small>Hands-on lessons at Angwan Sunday studio</small>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      go("modes")
                      setProgramsOpen(false)
                      setOpen(false)
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{
                        background: "rgba(184,142,86,0.12)",
                        color: "var(--gold)",
                      }}
                    >
                      <Icon name="user" size={16} />
                    </div>
                    <div>
                      <strong>Private Home Lessons</strong>
                      <small>
                        1-on-1 coaching delivered to your home (₦70,000/mo)
                      </small>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Music & Recording Studio */}
            <button
              className={page === "studio" ? "active" : ""}
              onClick={() => {
                go("studio")
                setOpen(false)
              }}
              aria-current={page === "studio" ? "page" : undefined}
            >
              Studio
            </button>

            {/* 3. Core Professional Services Dropdown */}
            <div
              className={`nav-dropdown-wrapper ${
                servicesOpen ? "expanded" : ""
              }`}
              ref={servicesRef}
              onMouseEnter={() => {
                if (typeof window !== "undefined" && window.innerWidth > 800) {
                  setServicesOpen(true)
                }
              }}
              onMouseLeave={() => {
                if (typeof window !== "undefined" && window.innerWidth > 800) {
                  setServicesOpen(false)
                }
              }}
            >
              <button
                className={`nav-dropdown-trigger flex items-center justify-between w-full md:w-auto gap-1 ${
                  isServicesActive ? "active" : ""
                }`}
                onClick={handleServicesToggle}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                <span>Services</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                    servicesOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              <div
                className={`nav-dropdown-panel ${
                  servicesOpen
                    ? "open opacity-100 visible translate-y-0 max-h-[500px]"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none md:pointer-events-none max-h-0 md:max-h-none overflow-hidden md:overflow-visible"
                }`}
              >
                <div className="dropdown-section">
                  <span className="dropdown-heading">
                    Workshop &amp; Stagecraft
                  </span>

                  <button
                    onClick={() => {
                      go("repairs")
                      setServicesOpen(false)
                      setOpen(false)
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{
                        background: "rgba(201,107,50,0.12)",
                        color: "var(--gold)",
                      }}
                    >
                      <Icon name="wrench" size={16} />
                    </div>
                    <div>
                      <strong>Instrument Repair Clinic</strong>
                      <small>
                        Diagnostics, precision overhaul &amp; courier pickup
                      </small>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      go("performances")
                      setServicesOpen(false)
                      setOpen(false)
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{
                        background: "rgba(30,58,95,0.08)",
                        color: "var(--navy)",
                      }}
                    >
                      <Icon name="star" size={16} />
                    </div>
                    <div>
                      <strong>Recitals &amp; Performances</strong>
                      <small>
                        Live student concerts, ensembles &amp; stagecraft
                      </small>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. About Vivadoxa */}
            <button
              className={page === "about" ? "active" : ""}
              onClick={() => {
                go("about")
                setOpen(false)
              }}
              aria-current={page === "about" ? "page" : undefined}
            >
              About
            </button>

            {/* 5. Contact & Location */}
            <button
              className={page === "contact" ? "active" : ""}
              onClick={() => {
                go("contact")
                setOpen(false)
              }}
              aria-current={page === "contact" ? "page" : undefined}
            >
              Contact
            </button>

            {/* 6. Student & Client Portal */}
            <button
              className={isPortalActive ? "active" : ""}
              onClick={() => {
                go("portal")
                setOpen(false)
              }}
              aria-current={isPortalActive ? "page" : undefined}
            >
              Portal
            </button>
          </div>

          {/* Action Group: Primary Admissions CTA */}
          <div className="nav-actions">
            <Button
              onClick={() => {
                go("apply")
                setOpen(false)
              }}
              className="nav-apply-btn"
            >
              Admissions <Icon name="arrow" size={14} />
            </Button>
          </div>
        </nav>

        <button
          className="menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
    </header>
  )
}

export function Footer({ go }: { go: (p: Page) => void }) {
  return (
    <footer>
      <div className="container footer-grid">
        {/* Column 1: Brand, Vision & Mission */}
        <div className="flex flex-col items-start gap-2.5">
          <Logo light />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/30 text-[var(--gold-text-dark)] font-bold text-[11px] uppercase tracking-wider my-1">
            <span>Motto:</span>
            <span>&ldquo;Actualize your passion&rdquo;</span>
          </div>
          <p className="text-[11px] italic text-slate-300 border-l-2 border-[var(--gold)] pl-2.5 leading-relaxed m-0 mt-1">
            Vision: &ldquo;A world where every musician, from beginner to pro,
            has access to the tools, knowledge, and environment to bring their
            unique sound to life.&rdquo;
          </p>
          <p className="text-xs leading-relaxed text-slate-400 m-0">
            Mission: &ldquo;To deliver exceptional musical experiences through
            our core pillars: practical instrumental and vocal instruction,
            dependable instrument repair clinic, and high-fidelity recital
            recording. At Vivadoxa, we help you master your sound and actualize
            your musical passion.&rdquo;
          </p>
        </div>

        {/* Column 2: Explore */}
        <div className="w-full">
          <strong className="text-white text-sm font-bold tracking-wide uppercase mb-3 block">
            Explore
          </strong>
          <div className="flex flex-col gap-2 w-full">
            {([
              ["About Vivadoxa", "about"],
              ["Programs & Tuition", "programs"],
              ["Instrument Repairs", "repairs"],
              ["Music Studio & Recording", "studio"],
              ["Student Recitals", "performances"],
              ["Study Modes", "modes"],
            ] as [string, Page][]).map(([x, p]) => (
              <button
                key={x}
                onClick={() => go(p)}
                className="text-left py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between w-full"
              >
                <span>{x}</span>
                <span className="text-[var(--gold)] text-xs">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Studio & Opening Hours */}
        <div className="w-full">
          <strong className="text-white text-sm font-bold tracking-wide uppercase mb-3 block">
            Get in touch
          </strong>
          <span className="text-xs leading-relaxed text-slate-300 block mb-2">
            No. 49B Umaru Ibrahim Street,
            <br />
            off Super Market Street beside Angwan Sunday Market,
            <br />
            Angwan Sunday, Kaduna, Nigeria
          </span>
          <a
            href={GOOGLE_MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold hover:bg-amber-400/20 transition-colors mb-3"
          >
            <Icon name="pin" size={12} />
            <span>Open in Google Maps</span>
            <Icon name="external" size={11} />
          </a>
          <div className="flex flex-col gap-1.5 text-xs w-full">
            <a
              href={`tel:${SCHOOL_PHONE}`}
              className="hover:text-white transition-colors py-1 flex items-center gap-2"
            >
              <Icon name="phone" size={13} className="text-slate-400" />{" "}
              <span>{SCHOOL_PHONE}</span>
            </a>
            <a
              href={`tel:${SCHOOL_PHONE_2}`}
              className="hover:text-white transition-colors py-1 flex items-center gap-2"
            >
              <Icon name="phone" size={13} className="text-slate-400" />{" "}
              <span>{SCHOOL_PHONE_2}</span>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium py-1 flex items-center gap-2"
            >
              <WhatsAppIcon size={14} className="text-emerald-400 shrink-0" />{" "}
              <span>WhatsApp: {SCHOOL_WHATSAPP}</span>
            </a>
            <a
              href={`mailto:${SCHOOL_EMAIL}`}
              className="hover:text-white transition-colors py-1 flex items-center gap-2"
            >
              <Icon name="mail" size={13} className="text-slate-400" />{" "}
              <span>{SCHOOL_EMAIL}</span>
            </a>
          </div>

          <div className="mt-3.5 p-3 rounded-lg bg-white/[0.04] border border-white/10 w-full">
            <strong className="text-[11px] uppercase tracking-wider text-[var(--gold2)] block mb-1">
              Studio Hours
            </strong>
            <div className="text-xs text-slate-300 flex flex-col gap-0.5">
              <span>Mon–Fri · 9:00 AM – 7:00 PM</span>
              <span>Saturday · 9:00 AM – 5:00 PM</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t border-white/10 text-xs">
              <button
                onClick={() => go("portal")}
                aria-label="Student & Client portal"
                className="text-amber-300 hover:text-white cursor-pointer font-semibold underline underline-offset-2 py-0.5"
              >
                Student &amp; Client Portal →
              </button>
              <span className="text-zinc-600">·</span>
              <button
                onClick={() => go("admin-login")}
                aria-label="Staff portal login"
                className="text-zinc-400 hover:text-white cursor-pointer underline underline-offset-2 py-0.5"
              >
                Staff Portal →
              </button>
            </div>
          </div>
        </div>

        {/* Column 4: Official Social Media & Online */}
        <div className="w-full">
          <strong className="text-white text-sm font-bold tracking-wide uppercase mb-1 block">
            Social Media &amp; Online
          </strong>
          <span className="text-xs text-slate-400 block mb-3">
            Follow and message us directly:
          </span>

          <div className="flex flex-col gap-2 w-full">
            {/* TikTok */}
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400 hover:bg-white/10 transition-all text-xs text-white group w-full"
              title="Vivadoxa on TikTok: @vivadoxa"
            >
              <TikTokIcon
                size={18}
                className="text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">
                  TikTok
                </span>
                <span className="text-[11px] text-cyan-300 truncate">
                  @vivadoxa
                </span>
              </div>
            </a>

            {/* Facebook */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400 hover:bg-white/10 transition-all text-xs text-white group w-full"
              title="Vivadoxa on Facebook: @vivadoxa music"
            >
              <FacebookIcon
                size={18}
                className="text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">
                  Facebook
                </span>
                <span className="text-[11px] text-blue-300 truncate">
                  @vivadoxa music
                </span>
              </div>
            </a>

            {/* YouTube */}
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-red-500 hover:bg-white/10 transition-all text-xs text-white group w-full"
              title="Vivadoxa on YouTube: Vivadoxa Music"
            >
              <YouTubeIcon
                size={18}
                className="text-red-500 group-hover:scale-110 transition-transform flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">
                  YouTube
                </span>
                <span className="text-[11px] text-red-300 truncate">
                  Vivadoxa Music
                </span>
              </div>
            </a>

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-pink-400 hover:bg-white/10 transition-all text-xs text-white group w-full"
              title="Vivadoxa on Instagram: @vivadoxa music"
            >
              <InstagramIcon
                size={18}
                className="text-pink-400 group-hover:scale-110 transition-transform flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">
                  Instagram
                </span>
                <span className="text-[11px] text-pink-300 truncate">
                  @vivadoxa music
                </span>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/40 transition-all text-xs text-white group w-full"
              title="Direct WhatsApp: 08031308881"
            >
              <WhatsAppIcon
                size={18}
                className="text-[#25D366] group-hover:scale-110 transition-transform flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-emerald-300 leading-tight text-xs truncate">
                  WhatsApp Desk
                </span>
                <span className="text-[11px] text-emerald-200/80 truncate">
                  08031308881
                </span>
              </div>
            </a>

            {/* Gmail */}
            <a
              href={`mailto:${SCHOOL_EMAIL}`}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-amber-400 hover:bg-white/10 transition-all text-xs text-white group w-full"
              title={`Email Vivadoxa: ${SCHOOL_EMAIL}`}
            >
              <GmailIcon
                size={18}
                className="group-hover:scale-110 transition-transform flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">
                  Official Email
                </span>
                <span className="text-[11px] text-amber-200/80 truncate">
                  {SCHOOL_EMAIL}
                </span>
              </div>
            </a>

            {/* Google Reviews */}
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-amber-950/30 border border-amber-400/40 hover:border-amber-300 hover:bg-amber-900/40 transition-all text-xs text-white group w-full"
              title="Google Reviews for Vivadoxa Music Kaduna"
            >
              <GoogleIcon size={20} className="shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-amber-300 leading-tight flex items-center gap-1.5 text-xs">
                  Google Reviews{" "}
                  <span className="text-amber-400 text-[10px] tracking-wider">
                    ★★★★★
                  </span>
                </span>
                <span className="text-[11px] text-amber-200/80">
                  4.9 ★ Rating (130+ Verified Reviews)
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom-wrap border-t border-white/10 pt-6 pb-8">
        {/* Tier 1: Regulatory & Compliance Links */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] text-xs">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-slate-400">
            <button
              type="button"
              onClick={() => go("privacy")}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Privacy Policy
            </button>
            <span
              className="text-slate-600 hidden sm:inline"
              aria-hidden="true"
            >
              ·
            </span>
            <button
              type="button"
              onClick={() => go("terms")}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Terms of Service
            </button>
            <span
              className="text-slate-600 hidden sm:inline"
              aria-hidden="true"
            >
              ·
            </span>
            <button
              type="button"
              onClick={() => go("cookies")}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Cookie Policy
            </button>
            <span
              className="text-slate-600 hidden sm:inline"
              aria-hidden="true"
            >
              ·
            </span>
            <button
              type="button"
              onClick={() => window.openVivadoxaCookieSettings?.()}
              className="text-[var(--gold2)] hover:text-white transition-colors cursor-pointer py-0.5 font-medium"
              title="Open Cookie Preferences Center"
            >
              Cookie Settings
            </button>
            <span
              className="text-slate-600 hidden sm:inline"
              aria-hidden="true"
            >
              ·
            </span>
            <button
              type="button"
              onClick={() => go("tuition-policy")}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Tuition &amp; Refunds
            </button>
            <span
              className="text-slate-600 hidden sm:inline"
              aria-hidden="true"
            >
              ·
            </span>
            <button
              type="button"
              onClick={() => go("safeguarding")}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Child Safeguarding
            </button>
          </div>

          <div className="flex items-center justify-center lg:justify-end gap-2 text-[11px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>RC 3184525 · Official Music Academy</span>
          </div>
        </div>

        {/* Tier 2: Legal Copyright & Developer Attribution */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 text-xs text-slate-400 text-center sm:text-left">
          <p className="m-0">
            © {new Date().getFullYear()} Vivadoxa Music School. All rights
            reserved.
          </p>
          <p className="m-0">
            Designed &amp; developed by{" "}
            <a
              href="https://jlm.com.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold2)] hover:text-white underline underline-offset-2 font-medium"
            >
              JLM
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
