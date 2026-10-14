import { useState, useRef, useEffect } from "react";
import { Icon, Logo, Button, WhatsAppIcon } from "@/components/ui";
import { WHATSAPP_URL } from "@/lib/utils";
import type { Page } from "@/types";

type NavPage = Exclude<Page, "apply" | "payment" | "admin" | "admin-login">;

const NAV_ITEMS: [string, NavPage][] = [
  ["Home", "home"],
  ["About", "about"],
  ["Performances", "performances"],
  ["Study Modes", "modes"],
  ["Repairs", "repairs"],
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

  return (
    <header className="nav" role="banner">
      <div className="container nav-inner">
        <button
          className="logo-button"
          onClick={() => {
            go("home");
            setOpen(false);
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
              className="nav-dropdown-wrapper"
              ref={dropdownRef}
              onMouseEnter={() => setProgramsOpen(true)}
              onMouseLeave={() => setProgramsOpen(false)}
            >
              <button
                className={`nav-dropdown-trigger flex items-center gap-1 ${
                  page === "programs" || page === "modes" ? "active" : ""
                }`}
                onClick={() => {
                  go("programs");
                  setOpen(false);
                }}
                aria-expanded={programsOpen}
              >
                <span>Programs</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
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
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="dropdown-section">
                  <span className="dropdown-heading">Curriculum Tracks</span>
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
                      style={{ background: "rgba(201,107,50,0.18)", color: "var(--gold2)" }}
                    >
                      <Icon name="music" size={16} />
                    </div>
                    <div>
                      <strong>All Programs &amp; Courses</strong>
                      <small>Piano, Guitar, Vocals, Production &amp; Theory</small>
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
                      style={{ background: "rgba(201,107,50,0.14)", color: "var(--gold2)" }}
                    >
                      <Icon name="sparkles" size={16} />
                    </div>
                    <div>
                      <strong>Kids &amp; Teens Academy</strong>
                      <small>Ages 4 to 19 • Playful Ear, Graded Prep &amp; Stagecraft</small>
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
                      style={{ background: "rgba(201,107,50,0.14)", color: "var(--gold2)" }}
                    >
                      <Icon name="calendar" size={16} />
                    </div>
                    <div>
                      <strong>Adults &amp; Working Pros</strong>
                      <small>Flexible Evening &amp; Weekend Schedules</small>
                    </div>
                  </button>
                </div>

                <div className="dropdown-section border-t border-white/5 pt-2 mt-2">
                  <span className="dropdown-heading">Formats &amp; Clinic</span>
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
                      style={{ background: "rgba(255,255,255,0.06)", color: "#c1ccd5" }}
                    >
                      <Icon name="video" size={16} />
                    </div>
                    <div>
                      <strong>Study Modes</strong>
                      <small>Studio Onsite in Kaduna, Live Online &amp; Hybrid</small>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      go("repairs");
                      setProgramsOpen(false);
                      setOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <div
                      className="dropdown-icon-box"
                      style={{ background: "rgba(201,107,50,0.2)", color: "var(--gold2)" }}
                    >
                      <Icon name="tool" size={16} />
                    </div>
                    <div>
                      <strong className="flex items-center gap-1.5">
                        Instrument Hospital
                        <span className="badge badge-gold !py-0.5 !px-1.5 !text-[9px]">Clinic</span>
                      </strong>
                      <small>Precision Diagnostics, Repairs &amp; Courier Pickup</small>
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

          {/* Action Group: Check Status + WhatsApp + Apply */}
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
        <div>
          <Logo light />
          <p>Expert music education for every age, ambition and stage.</p>
          <div className="socials flex items-center gap-2 mt-4" aria-label="Social media links">
            <a
              href="https://www.instagram.com/vivadoxa"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn group"
              aria-label="Follow Vivadoxa on Instagram"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current group-hover:text-pink-400 transition-colors" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/vivadoxa"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn group"
              aria-label="Vivadoxa Facebook Page"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current group-hover:text-blue-400 transition-colors" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn whatsapp-social group"
              aria-label="Direct WhatsApp Admissions Desk"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon size={18} className="text-[#25D366] group-hover:scale-110 transition-transform" />
            </a>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-all text-decoration-none"
          >
            <WhatsAppIcon size={14} className="text-[#25D366]" />
            <span>Chat Admissions Desk</span>
          </a>
        </div>
        <div>
          <strong>Explore</strong>
          {(
            [
              ["About", "about"],
              ["Programs", "programs"],
              ["Performances", "performances"],
              ["Study modes", "modes"],
              ["Repairs", "repairs"],
            ] as [string, Page][]
          ).map(([x, p]) => (
            <button key={x} onClick={() => go(p)}>
              {x}
            </button>
          ))}
        </div>
        <div>
          <strong>Get in touch</strong>
          <span>
            U/Sunday, Television
            <br />
            Kaduna, Nigeria
          </span>
          <a href="tel:+2348031308881">+234 803 130 8881</a>
          <a href="mailto:hello@vivadoxa.ng">hello@vivadoxa.ng</a>
        </div>
        <div>
          <strong>Opening hours</strong>
          <span>Mon–Fri · 9am–7pm</span>
          <span>Saturday · 9am–5pm</span>
          <button onClick={() => go("admin-login")} aria-label="Staff portal login">
            Staff portal
          </button>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Vivadoxa Music School</span>
        <div>
          <button>Privacy</button>
          <button>Terms</button>
        </div>
      </div>
    </footer>
  );
}
