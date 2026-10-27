// ─── Cookie & Privacy Compliance System ──────────────────────────────────────────
// Complies with:
// - Nigeria Data Protection Act (NDPA 2023) Sections 25, 26, & 31 (Minor Protection)
// - EU General Data Protection Regulation (GDPR, Regulation EU 2016/679)
// - ePrivacy Directive (2002/58/EC as amended)
// - UK Data Protection Act 2018 (UK GDPR)
// - California Consumer Privacy Act / CPRA

export interface CookieConsentState {
  necessary: boolean // Always true (strictly required for portal security, csrf, session & consent)
  functional: boolean // Preferences, UI filters, student form draft recovery
  analytics: boolean // Aggregated anonymous performance & page view diagnostics
  marketing: boolean // Video embeds (YouTube), rich interactive maps, media players
  timestamp: string // ISO 8601 string of when consent was recorded
  version: string // Policy version for auditing (e.g. "1.0")
  hasInteracted: boolean // Whether the user made an explicit choice
}

export const CONSENT_STORAGE_KEY = "vdx_cookie_consent"
export const CONSENT_POLICY_VERSION = "1.0"
export const CONSENT_EXPIRY_DAYS = 365

export interface CookieItem {
  name: string
  category: "necessary" | "functional" | "analytics" | "marketing"
  provider: string
  type: "Cookie" | "Local Storage" | "Session Storage"
  purpose: string
  expiry: string
}

export const COOKIE_INVENTORY: CookieItem[] = [
  {
    name: "vdx_cookie_consent",
    category: "necessary",
    provider: "Vivadoxa (First-party)",
    type: "Local Storage",
    purpose:
      "Stores your verified cookie & privacy preferences and prevents re-prompting on return visits.",
    expiry: "12 months",
  },
  {
    name: "vdx_portal_user",
    category: "necessary",
    provider: "Vivadoxa (First-party)",
    type: "Local Storage",
    purpose:
      "Maintains authenticated student and client portal session state across page refreshes.",
    expiry: "Session / 30 days",
  },
  {
    name: "vdx_admin_session",
    category: "necessary",
    provider: "Vivadoxa (First-party)",
    type: "Session Storage",
    purpose:
      "Cryptographic administrative session verification for studio faculty and management.",
    expiry: "Session end",
  },
  {
    name: "vdx_current_* (ref, name, email)",
    category: "necessary",
    provider: "Vivadoxa (First-party)",
    type: "Session Storage",
    purpose:
      "Preserves secure application order data and transaction references during the enrollment checkout process.",
    expiry: "Session end",
  },
  {
    name: "vdx_ui_preferences",
    category: "functional",
    provider: "Vivadoxa (First-party)",
    type: "Local Storage",
    purpose:
      "Remembers UI layout choices, instrument search filter state, and video player settings.",
    expiry: "6 months",
  },
  {
    name: "_vdx_perf_metrics",
    category: "analytics",
    provider: "Vivadoxa (First-party, Self-hosted)",
    type: "Local Storage",
    purpose:
      "Measures aggregate page load times and server latency without tracking individual user identities.",
    expiry: "90 days",
  },
  {
    name: "youtube-nocookie.com (embed)",
    category: "marketing",
    provider: "Google LLC / YouTube",
    type: "Cookie",
    purpose:
      "Renders privacy-enhanced recital video streams and masterclass recordings.",
    expiry: "Session / Persistent",
  },
  {
    name: "Google Maps Embed",
    category: "marketing",
    provider: "Google LLC",
    type: "Cookie",
    purpose:
      "Displays the interactive studio navigation map to our Kaduna campus.",
    expiry: "Session",
  },
]

export const DEFAULT_CONSENT: CookieConsentState = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: "",
  version: CONSENT_POLICY_VERSION,
  hasInteracted: false,
}

/**
 * Retrieves the current cookie consent from local storage.
 * If nonexistent or expired, returns the default (only necessary allowed, hasInteracted = false).
 */
export function getCookieConsent(): CookieConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return DEFAULT_CONSENT

    const parsed: CookieConsentState = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return DEFAULT_CONSENT

    // Check expiry (12 months = 365 days)
    if (parsed.timestamp) {
      const consentDate = new Date(parsed.timestamp).getTime()
      const maxAgeMs = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      if (Date.now() - consentDate > maxAgeMs) {
        localStorage.removeItem(CONSENT_STORAGE_KEY)
        return DEFAULT_CONSENT
      }
    }

    return {
      necessary: true, // Always true
      functional: !!parsed.functional,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      timestamp: parsed.timestamp || new Date().toISOString(),
      version: parsed.version || CONSENT_POLICY_VERSION,
      hasInteracted: !!parsed.hasInteracted,
    }
  } catch (err) {
    console.error("Failed to read cookie consent from storage:", err)
    return DEFAULT_CONSENT
  }
}

/**
 * Persists cookie consent and dispatches a window event so all components react immediately.
 */
export function saveCookieConsent(
  updates: Partial<Omit<CookieConsentState, "necessary" | "hasInteracted">> & {
    hasInteracted?: boolean
  },
): CookieConsentState {
  const current = getCookieConsent()
  const next: CookieConsentState = {
    ...current,
    ...updates,
    necessary: true, // Strictly immutable
    timestamp: new Date().toISOString(),
    version: CONSENT_POLICY_VERSION,
    hasInteracted:
      updates.hasInteracted !== undefined ? updates.hasInteracted : true,
  }

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    console.error("Failed to save cookie consent to storage:", err)
  }

  // Dispatch custom event for real-time reactivity
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("vdx-cookie-consent-updated", { detail: next }),
    )
  }

  return next
}

/**
 * Accept all categories (full functionality, analytics, and rich media embeds).
 */
export function acceptAllCookies(): CookieConsentState {
  return saveCookieConsent({
    functional: true,
    analytics: true,
    marketing: true,
    hasInteracted: true,
  })
}

/**
 * Reject all non-essential categories (strictly necessary only).
 */
export function rejectNonEssentialCookies(): CookieConsentState {
  return saveCookieConsent({
    functional: false,
    analytics: false,
    marketing: false,
    hasInteracted: true,
  })
}

/**
 * Check if the user has given consent for a specific category.
 */
export function hasConsentFor(
  category: "necessary" | "functional" | "analytics" | "marketing",
): boolean {
  if (category === "necessary") return true
  const consent = getCookieConsent()
  return !!consent[category]
}

/**
 * Triggers the Cookie Preferences Modal across the website.
 */
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("vdx-open-cookie-preferences"))
  }
}

/**
 * Global helper attached to window for direct execution from legal footers or policies.
 */
declare global {
  interface Window {
    openVivadoxaCookieSettings?: () => void
  }
}

if (typeof window !== "undefined") {
  window.openVivadoxaCookieSettings = openCookiePreferences
}
