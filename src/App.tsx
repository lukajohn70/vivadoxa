// ─── App.tsx — Root component and router ──────────────────────────────────────
// All pages are lazy-split into separate files for maintainability.
// Navigation is client-side (SPA) via the `page` state variable.

import { useState } from "react";
import { Navbar, Footer } from "@/components/Navigation";
import { Home } from "@/pages/Home";
import { About, Programs, Modes, Repairs, Contact } from "@/pages/StaticPages";
import { Apply, Payment, Status } from "@/pages/ApplyFlow";
import { Admin, AdminLogin } from "@/pages/Admin";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { WHATSAPP_URL } from "@/lib/utils";
import { Icon } from "@/components/ui";
import type { Page } from "@/types";

// Pages that suppress the global nav/footer
const STANDALONE_PAGES: Page[] = ["apply", "payment", "admin", "admin-login"];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const { session } = useAdminAuth();

  function go(p: Page) {
    // Guard: going to /admin directly redirects to login if not authenticated
    if (p === "admin" && !session) {
      setPage("admin-login");
    } else {
      setPage(p);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const standalone = STANDALONE_PAGES.includes(page);

  return (
    <>
      {/* Skip-to-content link for keyboard and screen reader users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {!standalone && <Navbar page={page} go={go} />}

      <div id="main-content">
        {page === "home"        && <Home go={go} />}
        {page === "about"       && <About go={go} />}
        {page === "programs"    && <Programs go={go} />}
        {page === "modes"       && <Modes go={go} />}
        {page === "repairs"     && <Repairs />}
        {page === "apply"       && <Apply go={go} />}
        {page === "payment"     && <Payment go={go} />}
        {page === "status"      && <Status />}
        {page === "contact"     && <Contact />}
        {page === "admin-login" && <AdminLogin go={go} />}
        {page === "admin"       && <Admin go={go} />}
      </div>

      {!standalone && (
        <>
          <Footer go={go} />
          {/* WhatsApp floating action button */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp"
            aria-label="Chat with Vivadoxa on WhatsApp"
          >
            <Icon name="phone" />
          </a>
        </>
      )}
    </>
  );
}
