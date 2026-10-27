import React, { useState, useEffect, useRef } from "react"
import {
  getCookieConsent,
  saveCookieConsent,
  acceptAllCookies,
  rejectNonEssentialCookies,
  openCookiePreferences,
  COOKIE_INVENTORY,
  type CookieConsentState,
} from "@/lib/cookieConsent"
import { Icon } from "@/components/ui"

interface CookieConsentProps {
  onNavigateToPolicy?: () => void
  onNavigateToPrivacy?: () => void
}

export function CookieConsent({
  onNavigateToPolicy,
  onNavigateToPrivacy,
}: CookieConsentProps) {
  const [consent, setConsent] = useState<CookieConsentState>(getCookieConsent)
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Local state for modal toggles before saving
  const [toggleFunctional, setToggleFunctional] = useState(false)
  const [toggleAnalytics, setToggleAnalytics] = useState(false)
  const [toggleMarketing, setToggleMarketing] = useState(false)
  const [showInventory, setShowInventory] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Initial check on mount
  useEffect(() => {
    const current = getCookieConsent()
    setConsent(current)
    if (!current.hasInteracted) {
      // Short delay for smooth slide-in
      const timer = setTimeout(() => setShowBanner(true), 600)
      return () => clearTimeout(timer)
    }
  }, [])

  // Sync modal switches with current consent when modal opens
  useEffect(() => {
    if (showModal) {
      setToggleFunctional(consent.functional)
      setToggleAnalytics(consent.analytics)
      setToggleMarketing(consent.marketing)
      // Focus modal close button or container for accessibility
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    }
  }, [showModal, consent])

  // Global listeners for open event and Escape key
  useEffect(() => {
    function handleOpenEvent() {
      setShowBanner(false)
      setShowModal(true)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && showModal) {
        setShowModal(false)
      }
    }

    window.addEventListener("vdx-open-cookie-preferences", handleOpenEvent)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("vdx-open-cookie-preferences", handleOpenEvent)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [showModal])

  // Custom event listener for storage changes across windows
  useEffect(() => {
    function handleConsentUpdated(e: Event) {
      const customEvent = e as CustomEvent<CookieConsentState>
      if (customEvent.detail) {
        setConsent(customEvent.detail)
      }
    }

    window.addEventListener("vdx-cookie-consent-updated", handleConsentUpdated)
    return () => {
      window.removeEventListener(
        "vdx-cookie-consent-updated",
        handleConsentUpdated,
      )
    }
  }, [])

  function handleAcceptAll() {
    const updated = acceptAllCookies()
    setConsent(updated)
    setShowBanner(false)
    setShowModal(false)
  }

  function handleRejectNonEssential() {
    const updated = rejectNonEssentialCookies()
    setConsent(updated)
    setShowBanner(false)
    setShowModal(false)
  }

  function handleSaveCustom() {
    const updated = saveCookieConsent({
      functional: toggleFunctional,
      analytics: toggleAnalytics,
      marketing: toggleMarketing,
      hasInteracted: true,
    })
    setConsent(updated)
    setShowModal(false)
    setShowBanner(false)
  }

  function handleOpenPreferences() {
    setShowBanner(false)
    setShowModal(true)
  }

  return (
    <>
      {/* ── Initial Consent Banner (Docked Bottom Bar, shown only prior to choice) ── */}
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-5 bg-[var(--navy)]/95 backdrop-blur-md text-white border-t border-[var(--gold)]/30 shadow-[0_-10px_35px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out"
        >
          <div className="container max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div
                className="w-10 h-10 rounded-xl bg-[var(--gold)]/20 border border-[var(--gold)]/40 flex items-center justify-center shrink-0 mt-0.5 text-[var(--gold2)]"
                aria-hidden="true"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16 15.5v.01" />
                  <path d="M12 12v.01" />
                  <path d="M11 17v.01" />
                  <path d="M7 13v.01" />
                </svg>
              </div>

              <div className="text-xs sm:text-[13px] leading-relaxed text-zinc-300">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-white font-semibold text-sm">
                    Your Privacy &amp; Cookie Consent
                  </strong>
                  <span className="badge badge-gold !py-0.5 !px-2 !text-[9px] uppercase tracking-wider font-mono">
                    NDPA 2023 · GDPR · ePrivacy
                  </span>
                </div>
                <p className="m-0 text-zinc-300">
                  Vivadoxa Music School uses essential cookies to safeguard
                  student admissions and portal sessions. With your permission,
                  we also use functional and performance cookies to optimize
                  your learning experience. We never sell personal data or track
                  minor learners. Review our{" "}
                  <a
                    href="/cookies"
                    onClick={(e) => {
                      if (onNavigateToPolicy) {
                        e.preventDefault()
                        onNavigateToPolicy()
                      }
                    }}
                    className="text-[var(--gold2)] font-semibold underline underline-offset-2 hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    onClick={(e) => {
                      if (onNavigateToPrivacy) {
                        e.preventDefault()
                        onNavigateToPrivacy()
                      }
                    }}
                    className="text-[var(--gold2)] font-semibold underline underline-offset-2 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="btn btn-secondary !min-h-[42px] !py-2 !px-4 !text-xs font-semibold !text-zinc-200 !border-zinc-600 hover:!bg-white/10 hover:!text-white flex-1 sm:flex-initial"
              >
                Reject Non-Essential
              </button>

              <button
                type="button"
                onClick={handleOpenPreferences}
                className="btn btn-secondary !min-h-[42px] !py-2 !px-4 !text-xs font-semibold !text-[var(--gold2)] !border-[var(--gold)]/40 hover:!bg-[var(--gold)]/10 hover:!border-[var(--gold)] flex-1 sm:flex-initial"
              >
                Customize Settings
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="btn btn-primary !min-h-[42px] !py-2 !px-5 !text-xs font-bold w-full sm:w-auto"
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── 3. Detailed Cookie Preferences Modal ────────────────────────────── */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[var(--line)] overflow-hidden text-[var(--ink)]"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[var(--navy)] text-white flex items-start justify-between gap-4 border-b border-[var(--gold)]/30">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-[var(--gold)]/20 border border-[var(--gold)]/40 flex items-center justify-center text-[var(--gold2)] shrink-0"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5v.01" />
                    <path d="M16 15.5v.01" />
                    <path d="M12 12v.01" />
                    <path d="M11 17v.01" />
                    <path d="M7 13v.01" />
                  </svg>
                </div>
                <div>
                  <h2
                    id="cookie-preferences-title"
                    className="text-lg font-bold font-serif text-white m-0"
                  >
                    Cookie &amp; Privacy Preferences
                  </h2>
                  <p className="text-xs text-zinc-300 m-0 mt-0.5">
                    Nigeria Data Protection Act (NDPA 2023) &amp; GDPR Control
                    Center
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-0"
                aria-label="Close cookie settings dialog"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-[13px] leading-relaxed">
              <div className="p-4 rounded-xl bg-[#fbfaf7] border border-[var(--line)] text-zinc-700">
                <p className="m-0 mb-1">
                  At Vivadoxa Music School, we believe in complete transparency
                  regarding data handling. You have the statutory right under
                  the <strong>NDPA 2023</strong> and international regulations
                  to decide which non-essential cookies and storage mechanisms
                  are activated on your browser.
                </p>
                <p className="m-0 text-[11px] text-[var(--muted)]">
                  You can modify or withdraw your consent at any time via the
                  floating Cookie Settings button or the link in our website
                  footer.
                </p>
              </div>

              {/* Category 1: Strictly Necessary (Always On) */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-sm font-semibold text-emerald-950">
                        1. Strictly Necessary Storage &amp; Cookies
                      </strong>
                      <span className="badge badge-green !py-0.5 !px-2 text-[10px] font-bold uppercase tracking-wider">
                        Always Active
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900/80 m-0">
                      Essential for authentication, security, CSRF protection,
                      and recording your consent choices. Without these, student
                      admission registration, bill payment status, and portal
                      dashboards cannot function.
                    </p>
                  </div>
                  <div className="shrink-0 pt-0.5 text-emerald-700">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category 2: Functional & Preferences */}
              <div className="p-4 rounded-xl border border-[var(--line)] bg-white hover:border-[var(--gold)]/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-sm font-semibold text-[var(--navy)]">
                        2. Functional &amp; Experience Preferences
                      </strong>
                    </div>
                    <p className="text-xs text-[var(--muted)] m-0">
                      Remembers your user preferences such as instrument filter
                      selections, video audio volume, and temporary application
                      form recovery so you do not lose your progress.
                    </p>
                  </div>
                  <label className="switch shrink-0 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={toggleFunctional}
                      onChange={(e) => setToggleFunctional(e.target.checked)}
                      aria-label="Toggle functional cookies"
                    />
                    <i></i>
                  </label>
                </div>
              </div>

              {/* Category 3: Performance & Analytics */}
              <div className="p-4 rounded-xl border border-[var(--line)] bg-white hover:border-[var(--gold)]/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-sm font-semibold text-[var(--navy)]">
                        3. Performance &amp; Aggregate Analytics
                      </strong>
                    </div>
                    <p className="text-xs text-[var(--muted)] m-0">
                      Helps our engineering team understand site load speeds,
                      network latency, and broken links across Kaduna and
                      international networks. All metrics are aggregated and
                      contain zero personally identifiable information (PII).
                    </p>
                  </div>
                  <label className="switch shrink-0 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={toggleAnalytics}
                      onChange={(e) => setToggleAnalytics(e.target.checked)}
                      aria-label="Toggle performance and analytics cookies"
                    />
                    <i></i>
                  </label>
                </div>
              </div>

              {/* Category 4: Marketing & Embedded Media */}
              <div className="p-4 rounded-xl border border-[var(--line)] bg-white hover:border-[var(--gold)]/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-sm font-semibold text-[var(--navy)]">
                        4. Media Embeds &amp; Interactive Services
                      </strong>
                    </div>
                    <p className="text-xs text-[var(--muted)] m-0">
                      Enables high-definition student recital showcase videos
                      (embedded via YouTube) and the interactive Google Map
                      directing prospective families to our Angwan Sunday Kaduna
                      studio.
                    </p>
                  </div>
                  <label className="switch shrink-0 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={toggleMarketing}
                      onChange={(e) => setToggleMarketing(e.target.checked)}
                      aria-label="Toggle marketing and embedded media cookies"
                    />
                    <i></i>
                  </label>
                </div>
              </div>

              {/* Collapsible Cookie Audit Inventory */}
              <div className="border border-[var(--line)] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowInventory(!showInventory)}
                  className="w-full p-3.5 bg-[#fbfaf7] text-left flex items-center justify-between text-xs font-semibold text-[var(--navy)] hover:bg-[#f5f3ee] transition-colors border-0"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="search" size={13} />
                    <span>
                      View Complete Cookie &amp; Storage Audit Table (
                      {COOKIE_INVENTORY.length} Items)
                    </span>
                  </span>
                  <span className="text-[var(--gold)] font-bold text-base leading-none">
                    {showInventory ? "−" : "+"}
                  </span>
                </button>

                {showInventory && (
                  <div className="p-3 bg-white overflow-x-auto text-[11px]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--line)] text-left text-[var(--muted)] font-semibold">
                          <th className="py-2 px-2">Identifier</th>
                          <th className="py-2 px-2">Type</th>
                          <th className="py-2 px-2">Category</th>
                          <th className="py-2 px-2">Lifespan</th>
                          <th className="py-2 px-2">Purpose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COOKIE_INVENTORY.map((item) => (
                          <tr
                            key={item.name}
                            className="border-b border-[var(--line)]/50 last:border-0 hover:bg-zinc-50"
                          >
                            <td className="py-2 px-2 font-mono text-[10px] font-bold text-[var(--navy)]">
                              {item.name}
                            </td>
                            <td className="py-2 px-2 text-zinc-600">
                              {item.type}
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                  item.category === "necessary"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : item.category === "functional"
                                      ? "bg-blue-100 text-blue-800"
                                      : item.category === "analytics"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {item.category}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-zinc-600">
                              {item.expiry}
                            </td>
                            <td className="py-2 px-2 text-zinc-700 leading-snug">
                              {item.purpose}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 bg-[#fbfaf7] border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="btn btn-secondary !min-h-[40px] !py-2 !px-4 !text-xs font-semibold w-full sm:w-auto"
              >
                Reject All Non-Essential
              </button>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="btn btn-secondary !min-h-[40px] !py-2 !px-4 !text-xs font-bold !border-[var(--gold)] !text-[var(--gold-text)] hover:!bg-[var(--gold)]/10 flex-1 sm:flex-initial"
                >
                  Save My Choices
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="btn btn-primary !min-h-[40px] !py-2 !px-5 !text-xs font-bold flex-1 sm:flex-initial"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CookieConsent
