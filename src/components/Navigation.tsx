import { useState } from "react";
import { Icon, Logo, Button } from "@/components/ui";
import type { Page } from "@/types";

type NavPage = Exclude<Page, "apply" | "payment" | "admin" | "admin-login">;

const NAV_ITEMS: [string, NavPage][] = [
  ["Home", "home"],
  ["About", "about"],
  ["Programs", "programs"],
  ["Study Modes", "modes"],
  ["Repairs", "repairs"],
  ["Check Status", "status"],
  ["Contact", "contact"],
];

export function Navbar({ page, go }: { page: Page; go: (p: Page) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav" role="banner">
      <div className="container nav-inner">
        <button
          className="logo-button"
          onClick={() => go("home")}
          aria-label="Go to homepage"
        >
          <Logo />
        </button>

        <nav
          className={open ? "open" : ""}
          aria-label="Main navigation"
          id="main-nav"
        >
          {NAV_ITEMS.map(([label, id]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                go(id);
                setOpen(false);
              }}
              aria-current={page === id ? "page" : undefined}
            >
              {label}
            </button>
          ))}
          <Button
            onClick={() => {
              go("apply");
              setOpen(false);
            }}
          >
            Apply Now <Icon name="arrow" size={17} />
          </Button>
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
          <div className="socials" aria-label="Social media links">
            <a
              href="https://www.instagram.com/vivadoxa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              ig
            </a>
            <a
              href="https://www.facebook.com/vivadoxa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="https://wa.me/2348031308881"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              wa
            </a>
          </div>
        </div>
        <div>
          <strong>Explore</strong>
          {(
            [
              ["About", "about"],
              ["Programs", "programs"],
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
