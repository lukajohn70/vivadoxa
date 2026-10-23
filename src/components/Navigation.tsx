import { useState, useRef, useEffect } from "react";
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
} from "@/components/ui";
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
} from "@/lib/utils";
import type { Page } from "@/types";

type NavPage = Exclude<Page, "apply" | "payment" | "admin" | "admin-login">;

const NAV_ITEMS: [string, NavPage][] = [
  ["Home", "home"],
  ["About", "about"],
  ["Performances", "performances"],
  ["Study Modes", "modes"],
  ["Repairs", "repairs"],
  ["Reviews", "reviews"],
  ["Check Status", "status"],
  ["Contact", "contact"],
];

export function Navbar({ page, go }: { page: Page; go: (p: Page) => void }) {
  const [open, setOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProgramsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock background body scroll when mobile navigation is open & listen for Escape
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setProgramsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleProgramsToggle = (e: React.MouseEvent) => {
    // On mobile screens (<= 800px), toggle the accordion drawer
    if (typeof window !== "undefined" && window.innerWidth <= 800) {
      e.preventDefault();
      setProgramsOpen((prev) => !prev);
    } else {
      go("programs");
      setProgramsOpen(false);
      setOpen(false);
    }
  };

  return (
    <header className="nav" role="banner">
      {/* Mobile backdrop overlay */}
      {open && (
        <div
          className="nav-backdrop"
          onClick={() => {
            setOpen(false);
            setProgramsOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      <div className="container nav-inner">
        <button
          className="logo-button"
          onClick={() => {
            go("home");
            setOpen(false);
            setProgramsOpen(false);
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
            {/* Home */}
            <button
              className={page === "home" ? "active" : ""}
              onClick={() => {
                go("home");
                setOpen(false);
              }}
              aria-current={page === "home" ? "page" : undefined}
            >
              Home
            </button>

            {/* Programs with Dropdown Menu */}
            <div
              className={`nav-dropdown-wrapper ${programsOpen ? "expanded" : ""}`}
              ref={dropdownRef}
              onMouseEnter={() => {
                if (typeof window !== "undefined" && window.innerWidth > 800) {
                  setProgramsOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (typeof window !== "undefined" && window.innerWidth > 800) {
                  setProgramsOpen(false);
                }
              }}
            >
              <button
                className={`nav-dropdown-trigger flex items-center justify-between w-full md:w-auto gap-1 ${
                  page === "programs" || page === "modes" ? "active" : ""
                }`}
                onClick={handleProgramsToggle}
                aria-expanded={programsOpen}
                aria-haspopup="true"
              >
                <span>Programs &amp; Curriculum</span>
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

              {/* Dropdown panel */}
              <div
                className={`nav-dropdown-panel ${
                  programsOpen
                    ? "open opacity-100 visible translate-y-0 max-h-[500px]"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none md:pointer-events-none max-h-0 md:max-h-none overflow-hidden md:overflow-visible"
                }`}
              >
                <div className="dropdown-section">
                  <span className="dropdown-heading">Curriculum &amp; Fee Schedule</span>
                  <button
                    onClick={() => {
                      go("programs");
                      setProgramsOpen(false);
                      setOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{ background: "rgba(201,107,50,0.12)", color: "var(--gold)" }}
                    >
                      <Icon name="calendar" size={16} />
                    </div>
                    <div>
                      <strong>Official Fee Schedule</strong>
                      <small>1 Mo · 3 Mos · 6 Mos · 1 Year Diplomas</small>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      go("programs");
                      setProgramsOpen(false);
                      setOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{ background: "rgba(30,58,95,0.08)", color: "var(--navy)" }}
                    >
                      <Icon name="music" size={16} />
                    </div>
                    <div>
                      <strong>13 Musical Disciplines</strong>
                      <small>Sax, Trumpet, Piano, Bass, Flute, Drums, Voice &amp; more</small>
                    </div>
                  </button>
                </div>

                <div className="dropdown-section border-t border-[var(--line)] pt-2.5 mt-2">
                  <span className="dropdown-heading">Instruction Formats</span>
                  <button
                    onClick={() => {
                      go("modes");
                      setProgramsOpen(false);
                      setOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{ background: "rgba(30,58,95,0.08)", color: "var(--navy)" }}
                    >
                      <Icon name="pin" size={16} />
                    </div>
                    <div>
                      <strong>Studio Academy (Kaduna)</strong>
                      <small>Hands-on lessons at Angwan Sunday studio</small>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      go("modes");
                      setProgramsOpen(false);
                      setOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{ background: "rgba(201,107,50,0.12)", color: "var(--gold)" }}
                    >
                      <Icon name="sparkles" size={16} />
                    </div>
                    <div>
                      <strong>Private Home Lessons</strong>
                      <small>1-on-1 coaching delivered to your home (₦50,000/mo)</small>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Performances */}
            <button
              className={page === "performances" ? "active" : ""}
              onClick={() => {
                go("performances");
                setOpen(false);
              }}
              aria-current={page === "performances" ? "page" : undefined}
            >
              Performances
            </button>

            {/* Repairs */}
            <button
              className={page === "repairs" ? "active" : ""}
              onClick={() => {
                go("repairs");
                setOpen(false);
              }}
              aria-current={page === "repairs" ? "page" : undefined}
            >
              Repairs
            </button>

            {/* About */}
            <button
              className={page === "about" ? "active" : ""}
              onClick={() => {
                go("about");
                setOpen(false);
              }}
              aria-current={page === "about" ? "page" : undefined}
            >
              About
            </button>

            {/* Contact */}
            <button
              className={page === "contact" ? "active" : ""}
              onClick={() => {
                go("contact");
                setOpen(false);
              }}
              aria-current={page === "contact" ? "page" : undefined}
            >
              Contact
            </button>
          </div>

          {/* Action Group: Check Status + Portal + WhatsApp + Apply */}
          <div className="nav-actions">
            <button
              className={`nav-status-btn ${page === "status" ? "active" : ""}`}
              onClick={() => {
                go("status");
                setOpen(false);
              }}
              title="Track application or repair status"
              aria-label="Check application or repair status"
            >
              <Icon name="search" size={13} />
              <span>Check Status</span>
            </button>

            <button
              className={`nav-status-btn ${page === "portal" ? "active" : ""}`}
              onClick={() => {
                go("portal");
                setOpen(false);
              }}
              title="Student & Client Portal"
              aria-label="Student & Client Portal"
              style={{
                background: page === "portal" ? "var(--cream)" : "white",
                borderColor: page === "portal" ? "var(--gold)" : "var(--line)",
                color: page === "portal" ? "var(--gold-text)" : "var(--navy)",
                fontWeight: 700,
              }}
            >
              <Icon name="sparkles" size={13} />
              <span>Portal</span>
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-whatsapp-pill"
              aria-label="Direct WhatsApp Admissions Desk"
              title="Chat with Admissions Desk"
            >
              <WhatsAppIcon size={15} />
              <span>WhatsApp</span>
            </a>

            <Button
              onClick={() => {
                go("apply");
                setOpen(false);
              }}
              className="nav-apply-btn"
            >
              Apply Now <Icon name="arrow" size={15} />
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
  );
}

export function Footer({ go }: { go: (p: Page) => void }) {
  return (
    <footer>
      <div className="container footer-grid">
        {/* Column 1: Brand & Mission */}
        <div className="flex flex-col items-start gap-2.5">
          <Logo light />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/30 text-[var(--gold-text-dark)] font-bold text-[11px] uppercase tracking-wider my-1">
            <span>Motto:</span>
            <span>&ldquo;Actualize your passion&rdquo;</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300 m-0">
            &ldquo;To deliver exceptional musical experiences through our core pillars: practical instrumental and vocal instruction, dependable instrument repair clinic, and high-fidelity recital recording. At Vivadoxa, we help you master your sound and actualize your musical passion.&rdquo;
          </p>
          <p className="text-[11px] italic text-slate-400 border-l-2 border-[var(--gold)] pl-2.5 leading-relaxed m-0 mt-1">
            Vision: &ldquo;A world where every musician, from beginner to pro, has access to the tools, knowledge, and environment to bring their unique sound to life.&rdquo;
          </p>
        </div>

        {/* Column 2: Explore */}
        <div className="w-full">
          <strong className="text-white text-sm font-bold tracking-wide uppercase mb-3 block">Explore</strong>
          <div className="flex flex-col gap-2 w-full">
            {(
              [
                ["About Vivadoxa", "about"],
                ["Programs & Tuition", "programs"],
                ["Student Recitals", "performances"],
                ["Study Modes", "modes"],
                ["Instrument Repairs", "repairs"],
              ] as [string, Page][]
            ).map(([x, p]) => (
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
          <strong className="text-white text-sm font-bold tracking-wide uppercase mb-3 block">Get in touch</strong>
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
            <a href={`tel:${SCHOOL_PHONE}`} className="hover:text-white transition-colors py-1 flex items-center gap-2">
              <Icon name="phone" size={13} className="text-slate-400" /> <span>{SCHOOL_PHONE}</span>
            </a>
            <a href={`tel:${SCHOOL_PHONE_2}`} className="hover:text-white transition-colors py-1 flex items-center gap-2">
              <Icon name="phone" size={13} className="text-slate-400" /> <span>{SCHOOL_PHONE_2}</span>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium py-1 flex items-center gap-2"
            >
              <WhatsAppIcon size={14} className="text-emerald-400 shrink-0" /> <span>WhatsApp: {SCHOOL_WHATSAPP}</span>
            </a>
            <a href={`mailto:${SCHOOL_EMAIL}`} className="hover:text-white transition-colors py-1 flex items-center gap-2">
              <Icon name="mail" size={13} className="text-slate-400" /> <span>{SCHOOL_EMAIL}</span>
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
          <strong className="text-white text-sm font-bold tracking-wide uppercase mb-1 block">Social Media &amp; Online</strong>
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
              <TikTokIcon size={18} className="text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">TikTok</span>
                <span className="text-[11px] text-cyan-300 truncate">@vivadoxa</span>
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
              <FacebookIcon size={18} className="text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">Facebook</span>
                <span className="text-[11px] text-blue-300 truncate">@vivadoxa music</span>
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
              <YouTubeIcon size={18} className="text-red-500 group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">YouTube</span>
                <span className="text-[11px] text-red-300 truncate">Vivadoxa Music</span>
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
              <InstagramIcon size={18} className="text-pink-400 group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">Instagram</span>
                <span className="text-[11px] text-pink-300 truncate">@vivadoxa music</span>
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
              <WhatsAppIcon size={18} className="text-[#25D366] group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-emerald-300 leading-tight text-xs truncate">WhatsApp Desk</span>
                <span className="text-[11px] text-emerald-200/80 truncate">08031308881</span>
              </div>
            </a>

            {/* Gmail */}
            <a
              href={`mailto:${SCHOOL_EMAIL}`}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-amber-400 hover:bg-white/10 transition-all text-xs text-white group w-full"
              title={`Email Vivadoxa: ${SCHOOL_EMAIL}`}
            >
              <GmailIcon size={18} className="group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold leading-tight text-xs truncate">Official Email</span>
                <span className="text-[11px] text-amber-200/80 truncate">{SCHOOL_EMAIL}</span>
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
                  Google Reviews <span className="text-amber-400 text-[10px] tracking-wider">★★★★★</span>
                </span>
                <span className="text-[11px] text-amber-200/80">4.9 ★ Rating (130+ Verified Reviews)</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left w-full">
          <div className="text-xs text-slate-400 leading-relaxed">
            <span>© {new Date().getFullYear()} Vivadoxa Music School (RC 3184525). All rights reserved.</span>
            <span className="mx-2 hidden sm:inline text-slate-600">·</span>
            <span className="block sm:inline mt-0.5 sm:mt-0">
              Designed &amp; developed by{" "}
              <a
                href="https://jlm.com.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-white underline underline-offset-2 font-medium"
              >
                JLM
              </a>
              .
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1.5 text-xs text-slate-400 pt-1 sm:pt-0">
            <button onClick={() => go("privacy")} className="hover:text-white transition-colors cursor-pointer py-1">
              Privacy Policy
            </button>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <button onClick={() => go("terms")} className="hover:text-white transition-colors cursor-pointer py-1">
              Terms of Service
            </button>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <button onClick={() => go("tuition-policy")} className="hover:text-white transition-colors cursor-pointer py-1">
              Tuition &amp; Refunds
            </button>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <button onClick={() => go("safeguarding")} className="hover:text-white transition-colors cursor-pointer py-1">
              Child Safeguarding
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
