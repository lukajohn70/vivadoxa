// ─── App.tsx — Production Router & Shell ───────────────────────────────────────
// Uses react-router-dom for URL routing, browser history, deep-linking, and protected routes.

import React from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom"
import { Navbar, Footer } from "@/components/Navigation"
import { Home } from "@/pages/Home"
import { About, Programs, Modes, Repairs, Contact, Performances } from "@/pages/StaticPages"
import { Apply, Payment, Status } from "@/pages/ApplyFlow"
import { Admin, AdminLogin } from "@/pages/Admin"
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth"
import { WHATSAPP_URL } from "@/lib/utils"
import { Icon, WhatsAppIcon } from "@/components/ui"
import type { Page } from "@/types"

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAdminAuth()
  if (!session) {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()

  // Standard navigation dispatcher compatible with legacy go() prop
  function go(p: Page | string) {
    const route =
      p === "home"
        ? "/"
        : p === "admin-login"
          ? "/admin/login"
          : p.startsWith("/")
            ? p
            : `/${p}`
    navigate(route)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const isStandalone =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/apply" ||
    location.pathname === "/payment"

  const activePage: Page = (
    location.pathname === "/"
      ? "home"
      : location.pathname.replace(/^\//, "").replace(/\//g, "-")
  ) as Page

  return (
    <>
      {/* Skip-to-content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {!isStandalone && <Navbar page={activePage} go={go} />}

      <div id="main-content">
        <Routes>
          <Route path="/" element={<Home go={go} />} />
          <Route path="/about" element={<About go={go} />} />
          <Route path="/programs" element={<Programs go={go} />} />
          <Route path="/modes" element={<Modes go={go} />} />
          <Route path="/repairs" element={<Repairs />} />
          <Route path="/performances" element={<Performances go={go} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/apply" element={<Apply go={go} />} />
          <Route path="/payment" element={<Payment go={go} />} />
          <Route path="/status" element={<Status />} />

          {/* Admin portal routes */}
          <Route path="/admin/login" element={<AdminLogin go={go} />} />
          <Route
            path="/admin-login"
            element={<Navigate to="/admin/login" replace />}
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Admin go={go} />
              </ProtectedAdminRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isStandalone && (
        <>
          <Footer go={go} />
          {/* WhatsApp floating button with official WhatsApp brand icon, pulse aura & hover tooltip */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-floating-btn"
            aria-label="Chat with Vivadoxa Admissions on WhatsApp"
            title="Chat with Admissions on WhatsApp"
          >
            <span className="whatsapp-pulse" aria-hidden="true" />
            <WhatsAppIcon size={28} className="whatsapp-svg" />
            <span className="whatsapp-tooltip">Chat with Admissions</span>
          </a>
        </>
      )}
    </>
  )
}

export default function App() {
  const basename = window.location.pathname.startsWith("/Vivadoxa")
    ? "/Vivadoxa"
    : undefined

  return (
    <BrowserRouter basename={basename}>
      <AdminAuthProvider>
        <AppShell />
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
