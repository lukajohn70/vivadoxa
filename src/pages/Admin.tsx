// ─── Admin Portal ─────────────────────────────────────────────────────────────
// Streamlined school operations dashboard. 100% database driven.

import { useState, useEffect, useCallback } from "react"
import { Logo, Button, Icon, Badge, Field, WhatsAppIcon } from "@/components/ui"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import {
  fetchStats,
  fetchApplications,
  fetchPayments,
  fetchRepairs,
  fetchEnquiries,
  updateApplicationStatus,
  updateApplication,
  updatePaymentStatus,
  updateRepairStatus,
  markEnquiryRead,
  replyEnquiry,
  fetchAcademics,
  saveProgram,
  deleteProgram,
  saveInstructor,
  deleteInstructor,
  toggleInstructorStatus,
  savePerformance,
  deletePerformance,
  deletePerformancesBatch,
  enrollStudent,
  updateStudent,
  deleteStudent,
  getBankSettings,
  saveBankSettings,
  getGeneralSettings,
  saveGeneralSettings,
  fetchRemoteSettings,
  releaseAdmissionLetter,
  revokeAdmissionLetter,
} from "@/lib/api"
import {
  StaffAndRolesView,
  PaymentSettingsView,
  GeneralSettingsView,
} from "@/components/AdminSystemViews"
import { ShopAndRentalsView } from "@/components/AdminCatalogView"
import { AdminGalleryView } from "@/components/AdminGalleryView"
import { AdminHeroSlidesView } from "@/components/AdminHeroSlidesView"
import { AdminBulletinView } from "@/components/AdminBulletinView"
import { ClassScheduleManagerView } from "@/components/AdminScheduleViews"
import {
  AdmissionLetterModal,
  PaymentReceiptModal,
} from "@/components/OfficialDocument"
import type { Page } from "@/types"

function extractYouTubeId(urlOrId: string): string {
  const v = urlOrId.trim()
  if (v.includes("/shorts/"))
    return v.split("/shorts/")[1].split("?")[0].split("&")[0]
  if (v.includes("v=")) return v.split("v=")[1].split("&")[0]
  if (v.includes("youtu.be/"))
    return v.split("youtu.be/")[1].split("?")[0].split("&")[0]
  if (v.includes("/embed/"))
    return v.split("/embed/")[1].split("?")[0].split("&")[0]
  return v
}

// ─── Admin Login page ─────────────────────────────────────────────────────────
export function AdminLogin({ go }: { go: (p: Page) => void }) {
  const {
    session,
    login,
    logout,
    loginError,
    loginLoading,
    pending2FA,
    verify2FA,
    resend2FA,
    cancel2FA,
  } = useAdminAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [resendNotice, setResendNotice] = useState("")
  const [resending, setResending] = useState(false)

  if (session) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <Logo />
          </div>
          <div className="admin-login-head">
            <span className="eyebrow">Staff portal</span>
            <h1>Already signed in</h1>
            <p>
              You are signed in as <strong>{session.name}</strong> (
              {session.email}).
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <Button onClick={() => go("admin")}>Open Admin Dashboard</Button>
            <Button variant="ghost" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResendNotice("")
    const success = await login(email, password)
    if (success) {
      go("admin")
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim() || otpCode.trim().length < 6) return
    const success = await verify2FA(otpCode.trim())
    if (success) {
      go("admin")
    }
  }

  const handleResend = async () => {
    if (resending) return
    setResending(true)
    setResendNotice("")
    try {
      const res = await resend2FA()
      if (res.success) {
        setResendNotice(
          "A fresh 6-digit verification code has been dispatched.",
        )
      } else {
        setResendNotice(res.message || "Failed to resend code.")
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <Logo />
        </div>

        {pending2FA ? (
          <>
            <div className="admin-login-head">
              <span
                className="eyebrow"
                style={{
                  color: "#c96b32",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#c96b32",
                  }}
                />
                Two-Factor Security Verification
              </span>
              <h1>Verify Your Device</h1>
              <p>
                First-time login or unrecognized device authorization (
                <strong>{pending2FA.deviceName || "Current Browser"}</strong>).
              </p>
            </div>

            <div
              style={{
                background: "#fbfaf8",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 13,
                color: "var(--navy)",
              }}
            >
              We dispatched a 6-digit authorization code to:
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  marginTop: 4,
                  letterSpacing: "0.02em",
                  color: "#157054",
                }}
              >
                {pending2FA.emailMasked}
              </div>
            </div>

            {loginError && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  borderRadius: "6px",
                  color: "#dc2626",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {loginError}
              </div>
            )}

            {resendNotice && (
              <div
                role="status"
                style={{
                  padding: "10px 14px",
                  background: "rgba(21, 112, 84, 0.1)",
                  border: "1px solid rgba(21, 112, 84, 0.3)",
                  borderRadius: "6px",
                  color: "#157054",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {resendNotice}
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="admin-login-form">
              <div>
                <label
                  htmlFor="admin-otp-input"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                    color: "var(--navy)",
                  }}
                >
                  Enter 6-Digit Verification Code:
                </label>
                <input
                  id="admin-otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="••••••"
                  autoFocus
                  required
                  style={{
                    width: "100%",
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "12px",
                    textAlign: "center",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "2px solid var(--gold)",
                    background: "white",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={loginLoading || otpCode.length < 6}
              >
                {loginLoading ? "Authorizing device…" : "Verify & Sign In"}
              </Button>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 8,
                  fontSize: 12,
                }}
              >
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold)",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {resending ? "Sending fresh code…" : "Resend email code"}
                </button>

                <button
                  type="button"
                  onClick={cancel2FA}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="admin-login-head">
              <span className="eyebrow">Staff access</span>
              <h1>Sign in to management</h1>
              <p>Admissions, payment verification &amp; studio operations.</p>
            </div>

            {loginError && (
              <div
                role="alert"
                style={{
                  padding: "10px 14px",
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  borderRadius: "6px",
                  color: "#dc2626",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-login-form">
              <Field
                id="admin-email"
                label="Staff email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="admin@vivadoxa.ng"
                required
                autoComplete="username"
              />

              <div style={{ position: "relative" }}>
                <Field
                  id="admin-pass"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "36px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    fontSize: "12px",
                    padding: "4px",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <Button type="submit" disabled={loginLoading}>
                {loginLoading ? "Signing in…" : "Sign in to Dashboard"}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}

// ─── Main Admin Portal ────────────────────────────────────────────────────────
export function Admin({ go }: { go: (p: Page) => void }) {
  const { session, logout } = useAdminAuth()

  useEffect(() => {
    if (!session) {
      go("admin-login")
    }
  }, [session, go])

  if (!session) {
    return null
  }

  const [active, setActive] = useState("Dashboard")
  const [mobileNav, setMobileNav] = useState(false)
  const [liveStats, setLiveStats] = useState<any>(null)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  const refreshStats = useCallback(() => {
    fetchStats()
      .then((res) => {
        if (res && res.success && res.stats) {
          setLiveStats(res.stats)
        }
      })
      .catch((err) => console.warn("Live stats fetch error:", err))
  }, [])

  useEffect(() => {
    refreshStats()
    const interval = setInterval(refreshStats, 15000)
    return () => clearInterval(interval)
  }, [refreshStats])

  function getBadgeCount(item: string): number {
    if (!liveStats) return 0
    if (item === "Applications") return liveStats.pending_applications || 0
    if (item === "Payments") return liveStats.pending_payments || 0
    if (item === "Repairs") return liveStats.active_repairs || 0
    if (item === "Enquiries") return liveStats.unread_enquiries || 0
    if (item === "Class Schedule") return liveStats.pending_schedules || 0
    return 0
  }

  const totalPending =
    (liveStats?.pending_applications || 0) +
    (liveStats?.pending_payments || 0) +
    (liveStats?.active_repairs || 0) +
    (liveStats?.unread_enquiries || 0) +
    (liveStats?.pending_schedules || 0)

  const navGroups: [string, string[]][] = [
    [
      "Operations",
      [
        "Dashboard",
        "Applications",
        "Payments",
        "Repairs",
        "Shop & Rentals",
        "Enquiries",
      ],
    ],
    ["Communications", ["Weekly Bulletin"]],
    [
      "Academics",
      [
        "Programs & Courses",
        "Instructors",
        "Performances & Recitals",
        "Photo Gallery",
        "Students",
        "Class Schedule",
      ],
    ],
    [
      "System",
      [
        "Hero Slideshow",
        "Staff & Roles",
        "Payment Settings",
        "General Settings",
      ],
    ],
  ]

  function closeNav(item: string) {
    setActive(item)
    setMobileNav(false)
    setShowNotifDropdown(false)
  }

  return (
    <main className="admin">
      {/* Backdrop overlay for mobile */}
      {mobileNav && (
        <div
          className="nav-backdrop"
          onClick={() => setMobileNav(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-side ${mobileNav ? "show" : ""}`}>
        <div className="admin-brand">
          <Logo light />
          <button
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="admin-profile">
          <span aria-hidden="true">
            {(session?.name || "AD").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <strong>{session?.name || "Administrator"}</strong>
            <small>Staff Administrator</small>
          </div>
        </div>
        <nav aria-label="Admin navigation">
          {navGroups.map(([group, items]) => (
            <div className="admin-nav-group" key={group}>
              <small>{group}</small>
              {items.map((item, i) => {
                const count = getBadgeCount(item)
                return (
                  <button
                    className={active === item ? "active" : ""}
                    onClick={() => closeNav(item)}
                    key={item}
                    aria-current={active === item ? "page" : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <span aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ flex: 1, textAlign: "left" }}>{item}</span>
                    {count > 0 && (
                      <span
                        style={{
                          marginLeft: 6,
                          padding: "2px 7px",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          background:
                            item === "Payments" || item === "Applications"
                              ? "#dc2626"
                              : "var(--gold)",
                          color: "white",
                          lineHeight: 1.2,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="admin-foot">
          <Button
            variant="ghost"
            onClick={logout}
            style={{
              width: "100%",
              color: "#dc2626",
              borderColor: "#fecaca",
              fontWeight: 700,
            }}
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileNav && (
        <div
          className="nav-backdrop"
          onClick={() => setMobileNav(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <section className="admin-main">
        <header>
          <div className="admin-title">
            <button
              className="admin-menu"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>
            <div>
              <h1>{active}</h1>
              <p>Vivadoxa Music School Management Portal</p>
            </div>
          </div>
          <div
            className="admin-tools"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                aria-label="Pending notifications"
                style={{
                  position: "relative",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid var(--line)",
                  background: showNotifDropdown ? "var(--cream)" : "white",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "var(--navy)",
                }}
              >
                <Icon name="bell" size={18} />
                {totalPending > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      background: "#dc2626",
                      color: "white",
                      borderRadius: 999,
                      padding: "1px 5px",
                      fontSize: 10,
                      fontWeight: 800,
                      minWidth: 16,
                      height: 16,
                      display: "grid",
                      placeItems: "center",
                      border: "2px solid white",
                    }}
                  >
                    {totalPending}
                  </span>
                )}
              </button>

              {/* Notification Popover Menu */}
              {showNotifDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: 46,
                    right: 0,
                    width: 290,
                    background: "white",
                    borderRadius: 10,
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.18)",
                    border: "1px solid var(--line)",
                    padding: "12px 14px",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid var(--line)",
                      paddingBottom: 8,
                      marginBottom: 8,
                    }}
                  >
                    <strong style={{ fontSize: 13, color: "var(--navy)" }}>
                      Pending Action Alerts
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {totalPending} action item{totalPending === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActive("Applications")
                        setShowNotifDropdown(false)
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "#fafafa",
                        border: "1px solid var(--line)",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>New Applications</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background:
                            (liveStats?.pending_applications || 0) > 0
                              ? "rgba(220,38,38,0.12)"
                              : "#f1f5f9",
                          color:
                            (liveStats?.pending_applications || 0) > 0
                              ? "#dc2626"
                              : "var(--muted)",
                        }}
                      >
                        {liveStats?.pending_applications || 0} pending
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActive("Payments")
                        setShowNotifDropdown(false)
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "#fafafa",
                        border: "1px solid var(--line)",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>Payment Proofs</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background:
                            (liveStats?.pending_payments || 0) > 0
                              ? "rgba(201,107,50,0.15)"
                              : "#f1f5f9",
                          color:
                            (liveStats?.pending_payments || 0) > 0
                              ? "var(--gold-text)"
                              : "var(--muted)",
                        }}
                      >
                        {liveStats?.pending_payments || 0} pending
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActive("Repairs")
                        setShowNotifDropdown(false)
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "#fafafa",
                        border: "1px solid var(--line)",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>Active Repairs</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background:
                            (liveStats?.active_repairs || 0) > 0
                              ? "rgba(37,99,235,0.12)"
                              : "#f1f5f9",
                          color:
                            (liveStats?.active_repairs || 0) > 0
                              ? "#2563eb"
                              : "var(--muted)",
                        }}
                      >
                        {liveStats?.active_repairs || 0} active
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActive("Enquiries")
                        setShowNotifDropdown(false)
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "#fafafa",
                        border: "1px solid var(--line)",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>Unread Enquiries</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background:
                            (liveStats?.unread_enquiries || 0) > 0
                              ? "rgba(16,185,129,0.12)"
                              : "#f1f5f9",
                          color:
                            (liveStats?.unread_enquiries || 0) > 0
                              ? "#059669"
                              : "var(--muted)",
                        }}
                      >
                        {liveStats?.unread_enquiries || 0} unread
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActive("Class Schedule")
                        setShowNotifDropdown(false)
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: "#fafafa",
                        border: "1px solid var(--line)",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>Schedule Requests</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background:
                            (liveStats?.pending_schedules || 0) > 0
                              ? "rgba(147,51,234,0.12)"
                              : "#f1f5f9",
                          color:
                            (liveStats?.pending_schedules || 0) > 0
                              ? "#7c3aed"
                              : "var(--muted)",
                        }}
                      >
                        {liveStats?.pending_schedules || 0} pending
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <span aria-hidden="true" title={session?.name || "Admin"}>
              {(session?.name || "AD").slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>

        <div className="admin-content">
          {active === "Dashboard" ? (
            <AdminOverview setActive={setActive} />
          ) : (
            <AdminManager title={active} />
          )}
        </div>
      </section>
    </main>
  )
}

// ─── Dashboard overview ────────────────────────────────────────────────────────
function AdminOverview({ setActive }: { setActive: (v: string) => void }) {
  const { session } = useAdminAuth()
  const [liveStats, setLiveStats] = useState<{
    total_applications: number
    pending_applications: number
    accepted_applications: number
    pending_payments: number
    total_revenue: number
    formatted_revenue: string
    active_repairs: number
    unread_enquiries?: number
    active_students?: number
    pending_schedules?: number
    monthly_revenue?: Array<{
      month: string
      key: string
      amount: number
      formatted: string
    }>
    recent_activity?: Array<{
      type: string
      title: string
      subtitle: string
      status: string
      created_at: string
    }>
  } | null>(null)

  useEffect(() => {
    fetchStats()
      .then((res) => {
        if (res && res.success && res.stats) {
          setLiveStats(res.stats)
        }
      })
      .catch((err) => console.warn("Live stats fetch error:", err))
  }, [])

  const metricCards = [
    {
      title: "Applications",
      count: liveStats ? String(liveStats.total_applications) : "—",
      sub: liveStats
        ? liveStats.pending_applications > 0
          ? `${liveStats.pending_applications} pending review`
          : "All evaluated"
        : "Loading…",
      tone: liveStats && liveStats.pending_applications > 0 ? "gold" : "muted",
      badge:
        liveStats && liveStats.pending_applications > 0
          ? `${liveStats.pending_applications} new`
          : null,
      target: "Applications",
      icon: "academic",
    },
    {
      title: "Active Students",
      count: liveStats ? String(liveStats.active_students ?? 0) : "—",
      sub: "Enrolled in training",
      tone: "muted",
      badge: null,
      target: "Students",
      icon: "users",
    },
    {
      title: "Pending Payments",
      count: liveStats ? String(liveStats.pending_payments) : "—",
      sub: liveStats
        ? liveStats.pending_payments > 0
          ? "Requires verification"
          : "All verified"
        : "Checking…",
      tone: liveStats && liveStats.pending_payments > 0 ? "gold" : "muted",
      badge: liveStats && liveStats.pending_payments > 0 ? "Action req." : null,
      target: "Payments",
      icon: "creditCard",
    },
    {
      title: "Verified Revenue",
      count: liveStats ? liveStats.formatted_revenue : "—",
      sub: "Cleared Payments",
      tone: "gold",
      badge: null,
      target: "Payments",
      icon: "dollar",
    },
    {
      title: "Active Repairs",
      count: liveStats ? String(liveStats.active_repairs) : "—",
      sub: liveStats
        ? liveStats.active_repairs > 0
          ? "In workshop queue"
          : "No pending repairs"
        : "Checking…",
      tone: liveStats && liveStats.active_repairs > 0 ? "gold" : "muted",
      badge: null,
      target: "Repairs",
      icon: "wrench",
    },
  ]

  const monthlyData =
    liveStats?.monthly_revenue && liveStats.monthly_revenue.length > 0
      ? liveStats.monthly_revenue
      : Array.from({ length: 6 }, (_, i) => {
          const d = new Date()
          d.setMonth(d.getMonth() - (5 - i))
          return {
            month: d.toLocaleDateString("en-US", { month: "short" }),
            key: d.toISOString().slice(0, 7),
            amount: 0,
            formatted: "₦0",
          }
        })

  const maxRevenue = Math.max(1, ...monthlyData.map((m) => m.amount || 0))
  const total6Months = monthlyData.reduce((acc, m) => acc + (m.amount || 0), 0)
  const peakMonth = [...monthlyData].sort(
    (a, b) => (b.amount || 0) - (a.amount || 0),
  )[0]
  const avgMonthly = Math.round(total6Months / Math.max(1, monthlyData.length))

  return (
    <>
      <div className="welcome-panel">
        <div>
          <span className="eyebrow">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
          <h2>Welcome back{session?.name ? `, ${session.name}` : ""}</h2>
          <p>
            Institutional management: admissions, enrolled students, audited
            revenues, workshop repairs and schedules.
          </p>
        </div>
        <Button onClick={() => setActive("Applications")}>
          Review applications <Icon name="arrow" />
        </Button>
      </div>

      <div className="metric-grid" role="list" aria-label="Key metrics">
        {metricCards.map((card) => (
          <article
            key={card.title}
            role="listitem"
            onClick={() => setActive(card.target)}
            title={`View ${card.title}`}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{card.title}</span>
              {card.badge && (
                <span
                  style={{
                    background: "#fdf5ec",
                    color: "var(--gold-text)",
                    border: "1px solid #ebdcd0",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 99,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {card.badge}
                </span>
              )}
            </div>
            <strong>{card.count}</strong>
            {card.sub ? (
              <small className={`tone-${card.tone}`}>{card.sub}</small>
            ) : null}
          </article>
        ))}
      </div>

      <div className="admin-panels">
        <section className="chart-panel">
          <div className="panel-title">
            <div>
              <h2>Revenue Overview (Last 6 Months)</h2>
              <p>
                Audited inflows aggregated from verified payment transactions
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--navy)",
                background: "#f4f2ec",
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--line)",
              }}
            >
              Current Academic Session
            </span>
          </div>

          <div className="chart" aria-label="Revenue chart">
            <div className="bars">
              {monthlyData.map((m) => {
                const heightPct =
                  m.amount > 0
                    ? Math.max(14, Math.round((m.amount / maxRevenue) * 100))
                    : 4
                return (
                  <div
                    key={m.month}
                    title={`${m.month}: ${m.formatted}`}
                    style={{ position: "relative" }}
                  >
                    {m.amount > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--navy)",
                          marginBottom: 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.formatted}
                      </span>
                    )}
                    <i
                      style={{
                        height: `${heightPct}%`,
                        transition: "height 0.4s ease",
                        background:
                          m.amount > 0
                            ? "linear-gradient(180deg, var(--gold) 0%, #8f471e 100%)"
                            : "#e5e7eb",
                        borderRadius: "5px 5px 0 0",
                      }}
                    />
                    <span style={{ fontWeight: 600, marginTop: 7 }}>
                      {m.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4.5 pt-4 border-t border-[var(--line)]">
            <div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  display: "block",
                }}
              >
                6-Month Inflow Total
              </span>
              <strong style={{ fontSize: 16, color: "var(--navy)" }}>
                ₦{total6Months.toLocaleString()}
              </strong>
            </div>
            <div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  display: "block",
                }}
              >
                Peak Month
              </span>
              <strong style={{ fontSize: 16, color: "var(--gold-text)" }}>
                {peakMonth && peakMonth.amount > 0
                  ? `${peakMonth.month} (${peakMonth.formatted})`
                  : "—"}
              </strong>
            </div>
            <div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  display: "block",
                }}
              >
                Average Monthly Intake
              </span>
              <strong style={{ fontSize: 16, color: "var(--navy)" }}>
                ₦{avgMonthly.toLocaleString()} / mo
              </strong>
            </div>
          </div>
        </section>
      </div>

      {/* Operational Quick Management Hub */}
      <div
        style={{
          marginTop: 20,
          background: "white",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                margin: 0,
                color: "var(--navy)",
              }}
            >
              Administrative Quick Hub
            </h3>
            <p
              style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: 11 }}
            >
              Direct operational shortcuts with live unread / pending indicators
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              title: "Review Applications",
              desc: "Evaluate student admissions & approve entries",
              badge: liveStats?.pending_applications
                ? `${liveStats.pending_applications} pending`
                : null,
              badgeType: "warn",
              tab: "Applications",
              icon: "academic",
            },
            {
              title: "Verify Bank Proofs",
              desc: "Confirm student transfer receipts & issue receipts",
              badge: liveStats?.pending_payments
                ? `${liveStats.pending_payments} unverified`
                : null,
              badgeType: "warn",
              tab: "Payments",
              icon: "creditCard",
            },
            {
              title: "Luthier Workshop",
              desc: "Update repair progress, diagnostic fees & pickups",
              badge: liveStats?.active_repairs
                ? `${liveStats.active_repairs} active`
                : null,
              badgeType: "info",
              tab: "Repairs",
              icon: "wrench",
            },
            {
              title: "Schedule Adjustments",
              desc: "Manage student day changes & travel requests",
              badge: liveStats?.pending_schedules
                ? `${liveStats.pending_schedules} pending`
                : null,
              badgeType: "warn",
              tab: "Class Schedule",
              icon: "calendar",
            },
            {
              title: "Inquiries & Leads",
              desc: "Respond to website contact form submissions",
              badge: liveStats?.unread_enquiries
                ? `${liveStats.unread_enquiries} unread`
                : null,
              badgeType: "warn",
              tab: "Enquiries",
              icon: "mail",
            },
            {
              title: "Student Roster",
              desc: "Manage cohorts, active enrollments & credentials",
              badge: liveStats?.active_students
                ? `${liveStats.active_students} active`
                : null,
              badgeType: "good",
              tab: "Students",
              icon: "users",
            },
          ].map((item) => (
            <div
              key={item.title}
              onClick={() => setActive(item.tab)}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "14px 16px",
                background: "#faf9f7",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition:
                  "transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)"
                e.currentTarget.style.backgroundColor = "white"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--line)"
                e.currentTarget.style.backgroundColor = "#faf9f7"
                e.currentTarget.style.transform = "none"
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      color: "var(--navy)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon name={item.icon} size={18} />
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 99,
                        background:
                          item.badgeType === "warn"
                            ? "#fdf5ec"
                            : item.badgeType === "good"
                              ? "#f4ece4"
                              : "#f0ece5",
                        color:
                          item.badgeType === "warn"
                            ? "var(--gold-text)"
                            : item.badgeType === "good"
                              ? "#8f471e"
                              : "var(--muted)",
                        border: "1px solid #ebdcd0",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <strong
                  style={{
                    fontSize: 13,
                    color: "var(--navy)",
                    display: "block",
                  }}
                >
                  {item.title}
                </strong>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    margin: "4px 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  {item.desc}
                </p>
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--gold)",
                }}
              >
                <span>Open module</span>
                <Icon name="arrow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Operational Manager & Data Tables ─────────────────────────────────────────
function AdminManager({ title }: { title: string }) {
  const { session } = useAdminAuth()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionNotice, setActionNotice] = useState("")

  // Modal inspection states
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const [showLetterModal, setShowLetterModal] = useState(false)
  const [openedLetterFromTable, setOpenedLetterFromTable] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editCourse, setEditCourse] = useState<any | null>(null)
  const [editInstructor, setEditInstructor] = useState<any | null>(null)
  const [editPerformance, setEditPerformance] = useState<any | null>(null)

  // Action Approval Modal state (approval of actions)
  const [approvalModal, setApprovalModal] = useState<{
    title: string
    message: string
    confirmLabel: string
    confirmTone?: "danger" | "success" | "primary"
    onConfirm: () => void | Promise<void>
  } | null>(null)

  // In-line editing states for Application inspector
  const [editingApp, setEditingApp] = useState(false)
  const [appForm, setAppForm] = useState({
    program: "",
    status: "",
    tuition_fee: 20000,
    phone: "",
    email: "",
    study_mode: "Onsite",
    skill_level: "Beginner",
  })

  // In-line editing states for Student inspector
  const [studentForm, setStudentForm] = useState({
    status: "active",
    cohort: "Saturday Cohort A",
    phone: "",
    email: "",
    program: "",
    password: "",
  })

  // In-app Email Reply states for Enquiries inspector
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replySubject, setReplySubject] = useState("")
  const [replyMessage, setReplyMessage] = useState("")
  const [sendingReply, setSendingReply] = useState(false)

  // Settings states
  const [bankSettings, setBankSettings] = useState(getBankSettings)
  const [generalSettings, setGeneralSettings] = useState(getGeneralSettings)

  const [selectedCohort, setSelectedCohort] = useState(
    "Saturday Cohort A (Morning)",
  )

  // Add Course / Instructor / Performance Form State
  const [newCourse, setNewCourse] = useState({
    name: "",
    category: "Instruments",
    fee: "₦20,000 / month",
    desc: "",
    age_group: "All Ages",
    level: "Beginner",
  })
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    title: "Instructor",
    specialization: "",
    location: "Kaduna Studio",
    bio: "",
    image: "",
    is_director: 0,
  })
  const [newPerformance, setNewPerformance] = useState({
    title: "",
    performer: "",
    program: "Piano & Keyboard Mastery",
    category: "Recital",
    youtube_id: "",
    duration: "4:15",
    date_label: "Term Recital",
    description: "",
  })
  const [selectedRecitalIds, setSelectedRecitalIds] = useState<number[]>([])

  // Repair workflow state
  const [repairCostInput, setRepairCostInput] = useState<string>("")
  const [repairStatusInput, setRepairStatusInput] = useState<string>("")
  const [repairAdminNote, setRepairAdminNote] = useState<string>("")

  async function handleBatchDeleteRecitals() {
    if (selectedRecitalIds.length === 0) return
    setApprovalModal({
      title: "Delete Selected Recital Videos",
      message: `Are you sure you want to delete ${selectedRecitalIds.length} selected recital video${
        selectedRecitalIds.length === 1 ? "" : "s"
      }?`,
      confirmLabel: `Delete ${selectedRecitalIds.length} Videos`,
      confirmTone: "danger",
      onConfirm: async () => {
        const res = await deletePerformancesBatch(selectedRecitalIds)
        if (res && res.success) {
          setActionNotice(
            res.message ||
              `${selectedRecitalIds.length} recital videos removed.`,
          )
          setSelectedRecitalIds([])
          loadData()
        } else {
          setActionNotice(res?.error || "Failed to delete selected recitals.")
        }
      },
    })
  }

  function handleToggleRecital(id: number) {
    setSelectedRecitalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleToggleAllRecitals() {
    if (selectedRecitalIds.length === filteredRecords.length) {
      setSelectedRecitalIds([])
    } else {
      setSelectedRecitalIds(filteredRecords.map((r: any) => r.id))
    }
  }

  async function handleToggleInstructor(inst: any) {
    const actionText = inst.is_active === 0 ? "activate" : "deactivate"
    setApprovalModal({
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Instructor Profile`,
      message: `Are you sure you want to ${actionText} the profile for "${inst.name}"? The profile record will be preserved.`,
      confirmLabel: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Profile`,
      confirmTone: actionText === "activate" ? "success" : "danger",
      onConfirm: async () => {
        const res = await toggleInstructorStatus(inst.id)
        if (res && res.success) {
          setActionNotice(res.message || `Instructor profile ${actionText}d.`)
          loadData()
        } else {
          setActionNotice(res?.error || `Failed to update instructor status.`)
        }
      },
    })
  }

  useEffect(() => {
    if (selectedRecord && title === "Applications") {
      setAppForm({
        program: selectedRecord.program || "",
        status: selectedRecord.status || "pending",
        tuition_fee: Number(selectedRecord.tuition_fee || 20000),
        phone: selectedRecord.phone || "",
        email: selectedRecord.email || "",
        study_mode: selectedRecord.study_mode || "Onsite",
        skill_level: selectedRecord.skill_level || "Beginner",
      })
      setEditingApp(false)
    } else if (selectedRecord && title === "Students") {
      setStudentForm({
        status: selectedRecord.status || "active",
        cohort: selectedRecord.cohort || "Saturday Cohort A",
        phone: selectedRecord.phone || "",
        email: selectedRecord.email || "",
        program: selectedRecord.program || "",
        password: "",
      })
    } else if (
      selectedRecord &&
      (title === "Repairs" || title.includes("Repairs"))
    ) {
      setRepairStatusInput(selectedRecord.status || "received")
      setRepairCostInput(
        selectedRecord.estimated_cost
          ? String(selectedRecord.estimated_cost)
          : "",
      )
      setRepairAdminNote("")
    }
  }, [selectedRecord, title])

  const loadData = useCallback(() => {
    setLoading(true)
    if (title === "Applications") {
      fetchApplications()
        .then((apps) => setRecords(apps || []))
        .finally(() => setLoading(false))
    } else if (title === "Payments") {
      fetchPayments()
        .then((pays) => setRecords(pays || []))
        .finally(() => setLoading(false))
    } else if (title === "Repairs" || title.includes("Repairs")) {
      fetchRepairs()
        .then((reps) => setRecords(reps || []))
        .finally(() => setLoading(false))
    } else if (title === "Enquiries") {
      fetchEnquiries()
        .then((enqs) => setRecords(enqs || []))
        .finally(() => setLoading(false))
    } else if (title === "Programs & Courses") {
      fetchAcademics("programs")
        .then((progs) => setRecords(progs || []))
        .finally(() => setLoading(false))
    } else if (title === "Instructors") {
      fetchAcademics("instructors", { all: 1 })
        .then((insts) => setRecords(insts || []))
        .finally(() => setLoading(false))
    } else if (title === "Performances & Recitals") {
      fetchAcademics("performances")
        .then((perfs) => setRecords(perfs || []))
        .finally(() => setLoading(false))
    } else if (title === "Students") {
      fetchAcademics("students")
        .then((studs) => setRecords(studs || []))
        .finally(() => setLoading(false))
    } else if (title === "Class Schedule") {
      fetchAcademics("cohorts")
        .then((cohs) => setRecords(cohs || []))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [title])

  useEffect(() => {
    setRecords([])
    setSelectedRecord(null)
    setSelectedRecitalIds([])
    setActionNotice("")
    loadData()
  }, [title, loadData])

  // Action handlers
  async function handleAppStatus(appNo: string, newStatus: string) {
    const res = await updateApplicationStatus(appNo, newStatus)
    if (res && res.success) {
      setActionNotice(`Application ${appNo} marked as ${newStatus}.`)
      loadData()
      if (selectedRecord && selectedRecord.application_no === appNo) {
        setSelectedRecord({ ...selectedRecord, status: newStatus })
      }
    }
  }

  async function handleReleaseLetter(appNo: string) {
    const res = await releaseAdmissionLetter(appNo)
    if (res && res.success) {
      setActionNotice(`Admission letter released for ${appNo}.`)
      loadData()
      if (selectedRecord && selectedRecord.application_no === appNo) {
        setSelectedRecord({ ...selectedRecord, letter_released: 1 })
      }
    } else {
      setActionNotice(
        `Failed to release letter: ${res?.error || "Unknown error"}`,
      )
    }
  }

  async function handleRevokeLetter(appNo: string) {
    const res = await revokeAdmissionLetter(appNo)
    if (res && res.success) {
      setActionNotice(`Admission letter access revoked for ${appNo}.`)
      loadData()
      if (selectedRecord && selectedRecord.application_no === appNo) {
        setSelectedRecord({ ...selectedRecord, letter_released: 0 })
      }
    }
  }

  async function handleEnroll(app: any) {
    const res = await enrollStudent({
      application_no: app.application_no,
      full_name: `${app.first_name} ${app.last_name}`,
      email: app.email,
      phone: app.phone,
      program: app.program,
      cohort: selectedCohort,
    })
    if (res && res.success) {
      setActionNotice(
        `Student enrolled with Student No: ${(res as any).student_no || "Generated"}!`,
      )
      loadData()
      setSelectedRecord(null)
    }
  }

  async function handlePaymentVerify(ref: string, appNo?: string) {
    const res = await updatePaymentStatus(ref, "verified")
    if (res && res.success) {
      setActionNotice(res.message || `Payment ${ref} verified successfully.`)
      await loadData()
      if (
        selectedRecord &&
        (selectedRecord.reference === ref ||
          selectedRecord.payment_reference === ref ||
          (appNo && selectedRecord.application_no === appNo))
      ) {
        setSelectedRecord({
          ...selectedRecord,
          status: "approved",
          payment_status: "verified",
          letter_released: 1,
        })
      }
    } else {
      setActionNotice(res?.error || `Unable to verify payment ${ref}.`)
    }
  }

  async function handleRepairStatus(
    code: string,
    newStatus: string,
    cost?: number,
    adminNote?: string,
  ) {
    const res = await updateRepairStatus(code, newStatus, cost, adminNote)
    if (res && res.success) {
      setActionNotice(
        `Repair ${code} updated to ${newStatus}. Customer auto-notified via branded email.`,
      )
      loadData()
      if (selectedRecord && selectedRecord.tracking_code === code) {
        setSelectedRecord({
          ...selectedRecord,
          status: newStatus,
          ...(cost !== undefined ? { estimated_cost: cost } : {}),
        })
      }
      setRepairAdminNote("")
    } else {
      setActionNotice(res?.error || `Failed to update repair ${code}.`)
    }
  }

  async function handleEnquiryToggle(id: number, currentRead: number) {
    const res = await markEnquiryRead(id, currentRead ? 0 : 1)
    if (res && res.success) {
      setActionNotice(`Enquiry marked as ${currentRead ? "unread" : "read"}.`)
      loadData()
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord({ ...selectedRecord, is_read: currentRead ? 0 : 1 })
      }
    }
  }

  async function handleSendEnquiryReply() {
    if (!selectedRecord || !selectedRecord.id) {
      alert("Error: Enquiry record identifier is missing.")
      return
    }
    if (!replyMessage.trim()) {
      alert("Please enter a reply message before sending.")
      return
    }

    try {
      setSendingReply(true)
      const adminName = session?.name || "Vivadoxa Admin Desk"
      const res = await replyEnquiry({
        id: selectedRecord.id,
        reply: replyMessage.trim(),
        subject: replySubject.trim() || undefined,
        replied_by: adminName,
      })

      if (res && res.success) {
        const clientEmail = selectedRecord.email || "the client"
        setActionNotice(`Email reply successfully sent to ${clientEmail}!`)
        const updated = {
          ...selectedRecord,
          is_read: 1,
          reply_message: replyMessage.trim(),
          replied_at: (res as any)?.replied_at || new Date().toISOString(),
          replied_by: adminName,
        }
        setSelectedRecord(updated)
        setRecords((prev) =>
          prev.map((r) =>
            r.id === selectedRecord.id ? { ...r, ...updated } : r,
          ),
        )
        setShowReplyForm(false)
        setReplyMessage("")
        alert(`Email reply successfully sent to ${clientEmail}!`)
      } else {
        const errorMsg =
          res?.error ||
          "Failed to send email reply. Please check your system email settings."
        setActionNotice(errorMsg)
        alert(errorMsg)
      }
    } catch (err: any) {
      console.error("handleSendEnquiryReply error:", err)
      const errorMsg =
        err?.message || "An unexpected error occurred while sending the email."
      setActionNotice(errorMsg)
      alert(errorMsg)
    } finally {
      setSendingReply(false)
    }
  }

  function applyReplyTemplate(templateType: string) {
    if (!selectedRecord) return
    const name = selectedRecord.name || "Valued Client"
    const subj = selectedRecord.subject || "your inquiry"

    if (templateType === "general") {
      setReplySubject(`Re: ${subj}`)
      setReplyMessage(
        `Dear ${name},\n\nThank you for reaching out to Vivadoxa Music.\n\nWe have reviewed your inquiry regarding "${subj}" and our team would be pleased to assist you.\n\n[Please enter your response details here]\n\nIf you have any further questions or would like to schedule a visit to our Kaduna studios at Angwan Sunday, feel free to reply directly to this email or reach us on WhatsApp at 08031308881.\n\nWarm regards,\nVivadoxa Music Support Team\nKaduna, Nigeria`,
      )
    } else if (templateType === "rentals") {
      setReplySubject(`Re: Rental Booking Inquiry — ${subj}`)
      setReplyMessage(
        `Dear ${name},\n\nThank you for reaching out regarding our musical instrument and equipment rental services.\n\nWe have checked our fleet and the requested items are available for your event dates. How our rental service works:\n• Rental fee is paid upfront to confirm your reservation\n• Gear is thoroughly inspected, tested, and calibrated by our technician clinic prior to release\n• Protective road cases / gig bags and essential cables/accessories are provided\n• You pick up at our studio (No. 49B Umaru Ibrahim Street, Angwan Sunday, Kaduna) or we arrange courier delivery within Kaduna\n• Gear is returned promptly following the conclusion of your event (please note that surcharges apply for late returns or damages)\n\nPlease let us know your confirmed event date(s) so we can issue your official invoice and reserve the gear.\n\nBest regards,\nVivadoxa Rentals & Logistics Desk`,
      )
    } else if (templateType === "academy") {
      setReplySubject(`Re: Music Academy Programs & Enrollment — ${name}`)
      setReplyMessage(
        `Dear ${name},\n\nThank you for your interest in joining Vivadoxa Music Academy!\n\nWe offer certified, graded curriculum coaching across 17 instruments, vocal training, and audio engineering. You can choose from:\n• Onsite studio private or group classes in Kaduna\n• Flexible Home Lessons at your residence\n• Interactive Live Online Coaching\n\nOur next cohort begins shortly with international ABRSM UK and MUSON syllabus alignment. You can review available courses and register directly at: https://www.vivadoxamusic.com/apply\n\nWe would love to welcome you. Would you like to schedule a free 15-minute studio orientation?\n\nWarm regards,\nVivadoxa Admissions Desk`,
      )
    } else if (templateType === "store") {
      setReplySubject(`Re: Store Product Availability & Order — ${subj}`)
      setReplyMessage(
        `Dear ${name},\n\nThank you for your inquiry with the Vivadoxa Music Store.\n\nThe item you inquired about is available in our store stock. Every instrument sold by Vivadoxa is individually inspected, fret-leveled, and intonation-tested in our workshop prior to dispatch.\n\nWe offer both secure pickup at our Angwan Sunday studio and doorstep delivery across Kaduna.\n\nPlease let us know if you would like us to reserve the item or provide bank payment details for immediate dispatch.\n\nBest regards,\nVivadoxa Store & Supplies Team`,
      )
    }
  }

  async function handleSaveStudentChanges() {
    if (!selectedRecord) return
    const res = await updateStudent({
      id: selectedRecord.id,
      student_no: selectedRecord.student_no,
      status: studentForm.status,
      cohort: studentForm.cohort,
      phone: studentForm.phone,
      email: studentForm.email,
      program: studentForm.program,
      ...(studentForm.password.trim()
        ? { password: studentForm.password.trim() }
        : {}),
    })
    if (res && res.success) {
      setActionNotice(`Student record for ${selectedRecord.full_name} updated.`)
      setSelectedRecord(null)
      loadData()
    } else {
      alert(res?.error || "Failed to update student record.")
    }
  }

  async function handleDeleteStudent(id: number, name: string) {
    const res = await deleteStudent(id)
    if (res && res.success) {
      setActionNotice(`Student record for ${name} removed.`)
      setSelectedRecord(null)
      loadData()
    }
  }

  async function handleAddProgram(e: React.FormEvent) {
    e.preventDefault()
    if (!newCourse.name) return
    const res = await saveProgram(newCourse)
    if (res && res.success) {
      setShowAddModal(false)
      setNewCourse({
        name: "",
        category: "Instruments",
        fee: "₦20,000 / month",
        desc: "",
        age_group: "All Ages",
        level: "Beginner",
      })
      setActionNotice("New course published successfully.")
      loadData()
    }
  }

  async function handleAddInstructor(e: React.FormEvent) {
    e.preventDefault()
    if (!newInstructor.name) return
    const res = await saveInstructor(newInstructor)
    if (res && res.success) {
      setShowAddModal(false)
      setNewInstructor({
        name: "",
        title: "Instructor",
        specialization: "",
        location: "Kaduna Studio",
        bio: "",
        image: "",
        is_director: 0,
      })
      setActionNotice("Instructor profile saved.")
      loadData()
    }
  }

  async function handleAddPerformance(e: React.FormEvent) {
    e.preventDefault()
    if (!newPerformance.title || !newPerformance.youtube_id) return
    const cleanedYid = extractYouTubeId(newPerformance.youtube_id)
    const res = await savePerformance({
      ...newPerformance,
      youtube_id: cleanedYid,
    })
    if (res && res.success) {
      setShowAddModal(false)
      setNewPerformance({
        title: "",
        performer: "",
        program: "Piano & Keyboard Mastery",
        category: "Recital",
        youtube_id: "",
        duration: "4:15",
        date_label: "Term Recital",
        description: "",
      })
      setActionNotice("Performance recital video published.")
      loadData()
    }
  }

  async function handleSaveAppModifications(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRecord) return
    const res = await updateApplication(selectedRecord.application_no, appForm)
    if (res && res.success) {
      setActionNotice(
        `Modifications saved for ${selectedRecord.application_no}.`,
      )
      setSelectedRecord({ ...selectedRecord, ...appForm })
      setEditingApp(false)
      loadData()
    } else {
      alert(res?.error || "Failed to save application modifications.")
    }
  }

  const exportCsv = () => {
    if (filteredRecords.length === 0) return
    const headers = Object.keys(filteredRecords[0]).join(",")
    const rows = filteredRecords
      .map((r) =>
        Object.values(r)
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n")
    const blob = new Blob([`${headers}\n${rows}`], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vivadoxa_${title.toLowerCase()}_export.csv`
    a.click()
  }

  const filteredRecords = records.filter((r) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      !searchTerm || JSON.stringify(r).toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === "all" ||
      r.status === statusFilter ||
      (statusFilter === "confirmed" &&
        (r.status === "approved" ||
          r.status === "verified" ||
          r.status === "ready" ||
          r.status === "active")) ||
      (statusFilter === "pending" &&
        (r.status === "pending" ||
          r.status === "reviewing" ||
          r.status === "assessing" ||
          r.status === "in_progress"))

    return matchesSearch && matchesStatus
  })

  const renderRecordActions = () => {
    if (!selectedRecord) return null
    return (
      <>
        {title === "Applications" && (
          <>
            <Button
              variant="ghost"
              style={{ color: "#dc2626" }}
              onClick={() => {
                setApprovalModal({
                  title: "Reject Admission Application",
                  message: `Are you sure you want to reject application ${selectedRecord.application_no} for ${selectedRecord.first_name || ""} ${selectedRecord.last_name || ""}?`,
                  confirmLabel: "Reject Application",
                  confirmTone: "danger",
                  onConfirm: async () => {
                    await handleAppStatus(
                      selectedRecord.application_no,
                      "rejected",
                    )
                  },
                })
              }}
            >
              Reject Application
            </Button>
            <Button
              onClick={() => {
                setShowLetterModal(true)
              }}
            >
              <Icon name="copy" size={14} /> Preview Admission Letter (PDF)
            </Button>
          </>
        )}

        {title === "Payments" && (
          <>
            {selectedRecord.status !== "verified" && (
              <Button
                onClick={() => {
                  setApprovalModal({
                    title: "Confirm Payment Verification",
                    message: `Verify transaction reference ${selectedRecord.reference} for ₦${Number(selectedRecord.amount || 0).toLocaleString()}? This confirms student tuition standing.`,
                    confirmLabel: "Verify Payment",
                    confirmTone: "success",
                    onConfirm: async () => {
                      await handlePaymentVerify(selectedRecord.reference)
                    },
                  })
                }}
              >
                Verify Payment
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setShowReceiptModal(true)
              }}
            >
              Official Receipt (PDF)
            </Button>
          </>
        )}

        {title === "Students" && (
          <>
            <Button
              variant="ghost"
              style={{ color: "#dc2626" }}
              onClick={() => {
                setApprovalModal({
                  title: "Delete Student Profile",
                  message: `Are you sure you want to delete student "${selectedRecord.full_name || selectedRecord.name}"? Portal access and academic records will be removed.`,
                  confirmLabel: "Delete Student",
                  confirmTone: "danger",
                  onConfirm: async () => {
                    await handleDeleteStudent(
                      selectedRecord.id,
                      selectedRecord.full_name || selectedRecord.name,
                    )
                  },
                })
              }}
            >
              Delete Student
            </Button>
            <Button onClick={handleSaveStudentChanges}>
              Save Database Updates
            </Button>
          </>
        )}

        {title === "Enquiries" && (
          <>
            <Button
              variant="secondary"
              onClick={() =>
                handleEnquiryToggle(selectedRecord.id, selectedRecord.is_read)
              }
            >
              {selectedRecord.is_read ? "Mark as Unread" : "Mark as Read"}
            </Button>
            {selectedRecord.phone && (
              <a
                href={`https://wa.me/${(selectedRecord.phone || "").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedRecord.name || "")},%20thank%20you%20for%20contacting%20Vivadoxa%20Music%20Academy.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  background: "#15803d",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <WhatsAppIcon size={14} fill="white" />
                Reply on WhatsApp
              </a>
            )}
          </>
        )}

        {title === "Programs & Courses" && (
          <>
            <Button
              variant="ghost"
              style={{ color: "#dc2626" }}
              onClick={() => {
                setApprovalModal({
                  title: "Deactivate Course Program",
                  message: `Are you sure you want to deactivate "${selectedRecord.name}"? This course will be hidden from the public admissions catalog.`,
                  confirmLabel: "Deactivate Course",
                  confirmTone: "danger",
                  onConfirm: async () => {
                    await deleteProgram(selectedRecord.id)
                    setActionNotice(
                      `Course "${selectedRecord.name}" deactivated.`,
                    )
                    setSelectedRecord(null)
                    loadData()
                  },
                })
              }}
            >
              Deactivate Course
            </Button>
            <Button
              onClick={() => {
                const rec = selectedRecord
                setSelectedRecord(null)
                setEditCourse(rec)
                setShowEditModal(true)
              }}
            >
              Edit Course Details
            </Button>
          </>
        )}

        {title === "Instructors" && (
          <>
            <Button
              variant="ghost"
              style={{ color: "#dc2626" }}
              onClick={() => {
                setApprovalModal({
                  title: "Deactivate Faculty Member",
                  message: `Are you sure you want to deactivate instructor "${selectedRecord.name}"?`,
                  confirmLabel: "Deactivate Instructor",
                  confirmTone: "danger",
                  onConfirm: async () => {
                    await deleteInstructor(selectedRecord.id)
                    setActionNotice(
                      `Instructor "${selectedRecord.name}" deactivated.`,
                    )
                    setSelectedRecord(null)
                    loadData()
                  },
                })
              }}
            >
              Deactivate Instructor
            </Button>
            <Button
              onClick={() => {
                const rec = selectedRecord
                setSelectedRecord(null)
                setEditInstructor(rec)
                setShowEditModal(true)
              }}
            >
              Edit Instructor Details
            </Button>
          </>
        )}

        {title === "Performances & Recitals" && selectedRecord.youtube_id && (
          <a
            href={`https://www.youtube.com/watch?v=${selectedRecord.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              background: "#dc2626",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="youtube" size={14} />
            Watch on YouTube
          </a>
        )}
      </>
    )
  }

  return (
    <div>
      {!selectedRecord && !showAddModal && !showEditModal && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{title} Management</h2>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {title === "Performances & Recitals" &&
              selectedRecitalIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchDeleteRecitals}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon name="trash" size={14} />
                  Delete Selected ({selectedRecitalIds.length})
                </button>
              )}
            {[
              "Programs & Courses",
              "Instructors",
              "Performances & Recitals",
            ].includes(title) && (
              <Button onClick={() => setShowAddModal(true)}>
                + Add{" "}
                {title === "Instructors"
                  ? "Instructor"
                  : title === "Performances & Recitals"
                    ? "Recital Video"
                    : "Course"}
              </Button>
            )}
          </div>
        </div>
      )}

      {actionNotice && (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            background: "rgba(52, 199, 89, 0.1)",
            border: "1px solid rgba(52, 199, 89, 0.3)",
            borderRadius: 8,
            marginBottom: 16,
            color: "#166534",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice("")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {title === "Weekly Bulletin" ? (
        <AdminBulletinView setActionNotice={setActionNotice} />
      ) : title === "Photo Gallery" ? (
        <AdminGalleryView setActionNotice={setActionNotice} />
      ) : title === "Hero Slideshow" ? (
        <AdminHeroSlidesView setActionNotice={setActionNotice} />
      ) : title === "Shop & Rentals" ? (
        <ShopAndRentalsView setActionNotice={setActionNotice} />
      ) : title === "Staff & Roles" ? (
        <StaffAndRolesView setActionNotice={setActionNotice} />
      ) : title === "Payment Settings" ? (
        <PaymentSettingsView
          bankSettings={bankSettings}
          setBankSettings={setBankSettings}
          setActionNotice={setActionNotice}
        />
      ) : title === "General Settings" ? (
        <GeneralSettingsView
          generalSettings={generalSettings}
          setGeneralSettings={setGeneralSettings}
          setActionNotice={setActionNotice}
        />
      ) : title === "Class Schedule" ? (
        <ClassScheduleManagerView setActionNotice={setActionNotice} />
      ) : selectedRecord || showAddModal || showEditModal ? null : (
        // Operational Data Tables
        <section className="table-panel manager-table">
          {/* Repairs: Custom Filter Bar + Pipeline */}
          {title === "Repairs" || title.includes("Repairs") ? (
            <>
              {/* Pipeline header */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    overflowX: "auto",
                    padding: "12px 0 4px",
                  }}
                >
                  {[
                    {
                      key: "received",
                      label: "Intake Received",
                      color: "#0b0b0b",
                    },
                    {
                      key: "assessing",
                      label: "Under Assessment",
                      color: "#c96b32",
                    },
                    {
                      key: "in_progress",
                      label: "Repair In Progress",
                      color: "#2563eb",
                    },
                    {
                      key: "ready",
                      label: "Ready for Pickup",
                      color: "#15803d",
                    },
                    {
                      key: "collected",
                      label: "Collected ✓",
                      color: "#5c5954",
                    },
                  ].map((stage, i, arr) => {
                    const count = records.filter(
                      (r) => r.status === stage.key,
                    ).length
                    const isActive = statusFilter === stage.key
                    return (
                      <div
                        key={stage.key}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setStatusFilter(isActive ? "all" : stage.key)
                          }
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            padding: "8px 14px",
                            borderRadius: 8,
                            border: isActive
                              ? `2px solid ${stage.color}`
                              : "2px solid var(--line)",
                            background: isActive ? `${stage.color}12` : "white",
                            cursor: "pointer",
                            minWidth: 110,
                            transition: "all 0.15s",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: stage.color,
                              lineHeight: 1,
                            }}
                          >
                            {count}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? stage.color : "var(--muted)",
                              textAlign: "center",
                              lineHeight: 1.3,
                            }}
                          >
                            {stage.label}
                          </span>
                        </button>
                        {i < arr.length - 1 && (
                          <span
                            style={{
                              color: "var(--muted)",
                              fontSize: 16,
                              margin: "0 2px",
                              userSelect: "none",
                            }}
                          >
                            ›
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Repairs filter bar */}
              <div className="manager-filters">
                <div className="search-field">
                  <Icon name="search" />
                  <input
                    placeholder="Search tickets, customers, instruments…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search Repairs"
                  />
                </div>
                <select
                  aria-label="Filter by repair status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Tickets ({records.length})</option>
                  <option value="received">
                    Received (
                    {records.filter((r) => r.status === "received").length})
                  </option>
                  <option value="assessing">
                    Under Assessment (
                    {records.filter((r) => r.status === "assessing").length})
                  </option>
                  <option value="in_progress">
                    In Progress (
                    {records.filter((r) => r.status === "in_progress").length})
                  </option>
                  <option value="ready">
                    Ready for Pickup (
                    {records.filter((r) => r.status === "ready").length})
                  </option>
                  <option value="collected">
                    Collected (
                    {records.filter((r) => r.status === "collected").length})
                  </option>
                </select>
                <Button variant="ghost" onClick={loadData}>
                  Refresh
                </Button>
                <Button variant="ghost" onClick={exportCsv}>
                  Export CSV
                </Button>
              </div>
            </>
          ) : (
            <div className="manager-filters">
              <div className="search-field">
                <Icon name="search" />
                <input
                  placeholder={`Search ${title.toLowerCase()}…`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={`Search ${title}`}
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed / Active / Ready</option>
                <option value="pending">Pending / In Review</option>
              </select>
              <Button variant="ghost" onClick={loadData}>
                Refresh
              </Button>
              <Button variant="ghost" onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
          )}

          <div className="hidden md:block table-wrap">
            <table>
              <thead>
                {title === "Applications" && (
                  <tr>
                    <th scope="col">Application Ref</th>
                    <th scope="col">Applicant Name</th>
                    <th scope="col">Program &amp; Mode</th>
                    <th scope="col">Tuition &amp; Payment</th>
                    <th scope="col">Admission Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                )}
                {title === "Payments" && (
                  <tr>
                    <th scope="col">Payment Ref</th>
                    <th scope="col">Payer</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Method &amp; Notes</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                )}
                {(title === "Repairs" || title.includes("Repairs")) && (
                  <tr>
                    <th scope="col">Ticket</th>
                    <th scope="col">Customer &amp; Contact</th>
                    <th scope="col">Instrument</th>
                    <th scope="col">Service</th>
                    <th scope="col">Stage</th>
                    <th scope="col">Actions</th>
                  </tr>
                )}
                {title === "Enquiries" && (
                  <tr>
                    <th scope="col">Sender</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Subject</th>
                    <th scope="col">Message Preview</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                )}
                {title === "Programs & Courses" && (
                  <tr>
                    <th scope="col">Course Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Fee</th>
                    <th scope="col">Duration &amp; Modes</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                )}
                {title === "Instructors" && (
                  <tr>
                    <th scope="col">Instructor Name</th>
                    <th scope="col">Position / Title</th>
                    <th scope="col">Specialization</th>
                    <th scope="col">Location</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                )}
                {title === "Performances & Recitals" && (
                  <tr>
                    <th scope="col" style={{ width: 40, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={
                          filteredRecords.length > 0 &&
                          selectedRecitalIds.length === filteredRecords.length
                        }
                        onChange={handleToggleAllRecitals}
                        title="Select all recitals"
                        aria-label="Select all recitals"
                      />
                    </th>
                    <th scope="col">Performance Title</th>
                    <th scope="col">Performer / Student</th>
                    <th scope="col">Course / Category</th>
                    <th scope="col">YouTube ID</th>
                    <th scope="col">Date / Term</th>
                    <th scope="col">Actions</th>
                  </tr>
                )}
                {title === "Students" && (
                  <tr>
                    <th scope="col">Student ID</th>
                    <th scope="col">Full Name</th>
                    <th scope="col">Program</th>
                    <th scope="col">Assigned Cohort</th>
                    <th scope="col">Status</th>
                    <th scope="col" style={{ textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: "var(--muted)",
                      }}
                    >
                      Loading records…
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: "var(--muted)",
                      }}
                    >
                      No {title.toLowerCase()} found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((row) => (
                    <tr
                      key={
                        row.id ||
                        row.reference ||
                        row.tracking_code ||
                        row.application_no ||
                        row.student_no
                      }
                      onClick={() => setSelectedRecord(row)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Applications row */}
                      {title === "Applications" && (
                        <>
                          <td>
                            <strong>{row.application_no}</strong>
                          </td>
                          <td>
                            <div>
                              {row.first_name} {row.last_name}
                            </div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.email} · {row.phone}
                            </small>
                          </td>
                          <td>
                            <div>{row.program}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.study_mode} ({row.skill_level})
                            </small>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              ₦
                              {Number(
                                row.tuition_fee || 20000,
                              ).toLocaleString()}
                            </div>
                            {row.payment_status === "verified" ? (
                              <Badge
                                tone="green"
                                style={{
                                  fontSize: 9.5,
                                  marginTop: 4,
                                  display: "inline-flex",
                                }}
                              >
                                ✓ Paid
                              </Badge>
                            ) : row.payment_status === "pending" ? (
                              <Badge
                                tone="gold"
                                style={{
                                  fontSize: 9.5,
                                  marginTop: 4,
                                  display: "inline-flex",
                                }}
                              >
                                ⏳ Proof Submitted
                              </Badge>
                            ) : (
                              <small
                                style={{
                                  color: "var(--muted)",
                                  display: "block",
                                  fontSize: 10,
                                  marginTop: 2,
                                }}
                              >
                                Unpaid
                              </small>
                            )}
                          </td>
                          <td>
                            <Badge
                              tone={
                                row.status === "approved"
                                  ? "green"
                                  : row.status === "rejected"
                                    ? "red"
                                    : "gold"
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="table-actions">
                              {row.status !== "approved" && (
                                <button
                                  className="action-btn accept"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAppStatus(
                                      row.application_no,
                                      "approved",
                                    )
                                  }}
                                  title="Approve candidate"
                                >
                                  ✓
                                </button>
                              )}
                              {row.status !== "rejected" && (
                                <button
                                  className="action-btn decline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAppStatus(
                                      row.application_no,
                                      "rejected",
                                    )
                                  }}
                                  title="Reject candidate"
                                >
                                  ✕
                                </button>
                              )}
                              {row.status === "approved" && (
                                <>
                                  <button
                                    type="button"
                                    className="action-btn"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedRecord(row)
                                      setOpenedLetterFromTable(true)
                                      setShowLetterModal(true)
                                    }}
                                    title="Preview Official Admission Letter (PDF)"
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "3px 8px",
                                      background: "rgba(201, 107, 50, 0.12)",
                                      color: "var(--gold-text)",
                                      border:
                                        "1px solid rgba(201, 107, 50, 0.3)",
                                      borderRadius: 5,
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                  >
                                    👁 Preview
                                  </button>
                                  <button
                                    className={`action-btn ${
                                      row.letter_released ? "decline" : "accept"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (row.letter_released) {
                                        handleRevokeLetter(row.application_no)
                                      } else {
                                        handleReleaseLetter(row.application_no)
                                      }
                                    }}
                                    title={
                                      row.letter_released
                                        ? "Revoke admission letter access"
                                        : "Release admission letter and email candidate"
                                    }
                                    style={{ fontSize: 10, padding: "3px 6px" }}
                                  >
                                    {row.letter_released ? "Revoke" : "Letter"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* Payments row */}
                      {title === "Payments" && (
                        <>
                          <td>
                            <code>{row.reference}</code>
                            {row.application_no && (
                              <small
                                style={{
                                  display: "block",
                                  color: "var(--muted)",
                                }}
                              >
                                App: {row.application_no}
                              </small>
                            )}
                          </td>
                          <td>
                            <div>{row.payer_name}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.payer_email}
                            </small>
                          </td>
                          <td>
                            <strong>
                              ₦{Number(row.amount).toLocaleString()}
                            </strong>
                          </td>
                          <td>
                            <div>{row.method}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.notes}
                            </small>
                          </td>
                          <td>
                            <Badge
                              tone={
                                row.status === "verified"
                                  ? "green"
                                  : row.status === "declined"
                                    ? "red"
                                    : "gold"
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td>
                            {row.status !== "verified" && (
                              <button
                                className="action-btn accept"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePaymentVerify(row.reference)
                                }}
                                title="Verify payment"
                              >
                                ✓ Verify
                              </button>
                            )}
                          </td>
                        </>
                      )}

                      {/* Repairs row */}
                      {(title === "Repairs" || title.includes("Repairs")) && (
                        <>
                          <td>
                            <code
                              style={{ fontWeight: 700, color: "var(--navy)" }}
                            >
                              {row.tracking_code}
                            </code>
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--muted)",
                                marginTop: 2,
                              }}
                            >
                              {row.created_at
                                ? new Date(row.created_at).toLocaleDateString()
                                : ""}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              {row.customer_name}
                            </div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.customer_phone}
                            </small>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              {row.instrument}
                              {row.brand_model ? ` — ${row.brand_model}` : ""}
                            </div>
                            <small
                              style={{
                                color: "var(--muted)",
                                maxWidth: 200,
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.issue}
                            </small>
                          </td>
                          <td>
                            <div
                              style={{
                                maxWidth: 180,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: 12,
                              }}
                            >
                              {row.service_requested || "—"}
                            </div>
                          </td>
                          <td>
                            <Badge
                              tone={
                                row.status === "collected"
                                  ? "navy"
                                  : row.status === "ready"
                                    ? "green"
                                    : row.status === "in_progress"
                                      ? "navy"
                                      : row.status === "assessing"
                                        ? "gold"
                                        : "navy"
                              }
                            >
                              {row.status === "received"
                                ? "Received"
                                : row.status === "assessing"
                                  ? "Assessing"
                                  : row.status === "in_progress"
                                    ? "In Progress"
                                    : row.status === "ready"
                                      ? "Ready ✓"
                                      : row.status === "collected"
                                        ? "Collected"
                                        : row.status}
                            </Badge>
                          </td>
                          <td>
                            <button
                              className="action-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRecord(row)
                              }}
                            >
                              View &amp; Update
                            </button>
                          </td>
                        </>
                      )}

                      {/* Enquiries row */}
                      {title === "Enquiries" && (
                        <>
                          <td>
                            <strong>{row.name}</strong>
                          </td>
                          <td>
                            <div>{row.email}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.phone}
                            </small>
                          </td>
                          <td>{row.subject}</td>
                          <td>
                            <div
                              style={{
                                maxWidth: 220,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.message}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                alignItems: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              <Badge tone={row.is_read ? "navy" : "green"}>
                                {row.is_read ? "Read" : "New"}
                              </Badge>
                              {row.replied_at && (
                                <Badge tone="gold">Replied ✓</Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              className="action-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEnquiryToggle(row.id, row.is_read)
                              }}
                            >
                              {row.is_read ? "Mark unread" : "Mark read"}
                            </button>
                          </td>
                        </>
                      )}

                      {/* Programs row */}
                      {title === "Programs & Courses" && (
                        <>
                          <td>
                            <strong>{row.name}</strong>
                            {row.tag && (
                              <small
                                style={{
                                  display: "inline-block",
                                  marginLeft: 6,
                                  color: "var(--muted)",
                                }}
                              >
                                ({row.tag})
                              </small>
                            )}
                          </td>
                          <td>{row.category}</td>
                          <td>{row.fee}</td>
                          <td>
                            <div>{row.duration || "1–12 Months"}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.modes || "Studio · Home · Online"}
                            </small>
                          </td>
                          <td>
                            <Badge tone="green">Active</Badge>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditCourse(row)
                                setShowEditModal(true)
                              }}
                              style={{
                                padding: "4px 8px",
                                fontSize: 11,
                                background: "none",
                                border: "1px solid var(--line)",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </>
                      )}

                      {/* Instructors row */}
                      {title === "Instructors" && (
                        <>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              {row.image ? (
                                <img
                                  src={row.image}
                                  alt={row.name}
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "1px solid var(--line)",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    background: "var(--navy)",
                                    color: "var(--gold)",
                                    display: "grid",
                                    placeItems: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {row.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <strong>{row.name}</strong>
                                {row.is_director ? (
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      background: "#fdf5ec",
                                      color: "var(--gold-text)",
                                      border: "1px solid #ebdcd0",
                                    }}
                                  >
                                    Director
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td>{row.title}</td>
                          <td>{row.specialization}</td>
                          <td>{row.location}</td>
                          <td>
                            <Badge
                              tone={row.is_active === 0 ? "navy" : "green"}
                            >
                              {row.is_active === 0 ? "Inactive" : "Active"}
                            </Badge>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditInstructor(row)
                                  setShowEditModal(true)
                                }}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: 11,
                                  background: "none",
                                  border: "1px solid var(--line)",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleInstructor(row)
                                }}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: 11,
                                  background: "none",
                                  border: "1px solid var(--line)",
                                  borderRadius: 4,
                                  color:
                                    row.is_active === 0 ? "#166534" : "#dc2626",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
                              >
                                {row.is_active === 0
                                  ? "Activate"
                                  : "Deactivate"}
                              </button>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Performances row */}
                      {title === "Performances & Recitals" && (
                        <>
                          <td
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: 40, textAlign: "center" }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedRecitalIds.includes(row.id)}
                              onChange={() => handleToggleRecital(row.id)}
                              aria-label={`Select recital ${row.title}`}
                            />
                          </td>
                          <td>
                            <strong>{row.title}</strong>
                            {row.is_featured ? (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: "#fdf5ec",
                                  color: "var(--gold-text)",
                                  border: "1px solid #ebdcd0",
                                }}
                              >
                                Featured
                              </span>
                            ) : null}
                          </td>
                          <td>{row.performer}</td>
                          <td>
                            <div>{row.program}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.category}
                            </small>
                          </td>
                          <td>
                            <code>{row.youtube_id}</code>
                          </td>
                          <td>{row.date_label || "Annual Recital"}</td>
                          <td>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setApprovalModal({
                                  title: "Remove Recital Showcase",
                                  message: `Are you sure you want to remove performance recital "${row.title}"?`,
                                  confirmLabel: "Remove Performance",
                                  confirmTone: "danger",
                                  onConfirm: async () => {
                                    await deletePerformance(row.id)
                                    setActionNotice(
                                      "Performance recital removed.",
                                    )
                                    loadData()
                                  },
                                })
                              }}
                              style={{
                                padding: "4px 8px",
                                fontSize: 11,
                                background: "none",
                                border: "1px solid var(--line)",
                                borderRadius: 4,
                                color: "#dc2626",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}

                      {/* Students row */}
                      {title === "Students" && (
                        <>
                          <td>
                            <strong>{row.student_no}</strong>
                          </td>
                          <td>
                            <div>{row.full_name}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.email} · {row.phone}
                            </small>
                          </td>
                          <td>{row.program}</td>
                          <td>{row.cohort}</td>
                          <td>
                            <Badge
                              tone={
                                row.status === "active"
                                  ? "green"
                                  : row.status === "graduated"
                                    ? "gold"
                                    : "red"
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e?.stopPropagation?.()
                                setSelectedRecord(row)
                              }}
                            >
                              Manage
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Feed (Responsive, No Horizontal Scrolling) */}
          <div className="block md:hidden" style={{ padding: 12 }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 24,
                  color: "var(--muted)",
                  fontSize: 13,
                }}
              >
                Loading records…
              </div>
            ) : filteredRecords.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 24,
                  color: "var(--muted)",
                  fontSize: 13,
                }}
              >
                No {title.toLowerCase()} found.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {filteredRecords.map((row) => {
                  const key =
                    row.id ||
                    row.reference ||
                    row.tracking_code ||
                    row.application_no ||
                    row.student_no

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedRecord(row)}
                      style={{
                        background: "white",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        padding: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      {/* Applications Mobile Card */}
                      {title === "Applications" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div>
                              <strong
                                style={{ fontSize: 14, color: "var(--navy)" }}
                              >
                                {row.application_no}
                              </strong>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--navy)",
                                  marginTop: 2,
                                }}
                              >
                                {row.first_name} {row.last_name}
                              </div>
                            </div>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <Badge
                                tone={
                                  row.status === "approved"
                                    ? "green"
                                    : row.status === "rejected"
                                      ? "red"
                                      : "gold"
                                }
                              >
                                {row.status}
                              </Badge>
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>
                            {row.email} · {row.phone}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12,
                              background: "#fbfaf8",
                              padding: "8px 10px",
                              borderRadius: 6,
                            }}
                          >
                            <div>
                              <span style={{ color: "var(--muted)" }}>
                                Program:{" "}
                              </span>
                              <strong>{row.program}</strong>
                              <div
                                style={{ fontSize: 11, color: "var(--muted)" }}
                              >
                                {row.study_mode} ({row.skill_level})
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ color: "var(--muted)" }}>
                                Tuition:{" "}
                              </span>
                              <strong style={{ color: "var(--navy)" }}>
                                ₦
                                {Number(
                                  row.tuition_fee || 20000,
                                ).toLocaleString()}
                              </strong>
                              {row.payment_status === "verified" ? (
                                <div>
                                  <Badge
                                    tone="green"
                                    style={{ fontSize: 9, marginTop: 3 }}
                                  >
                                    ✓ Paid
                                  </Badge>
                                </div>
                              ) : row.payment_status === "pending" ? (
                                <div>
                                  <Badge
                                    tone="gold"
                                    style={{ fontSize: 9, marginTop: 3 }}
                                  >
                                    ⏳ Proof Submitted
                                  </Badge>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", gap: 8, marginTop: 4 }}
                          >
                            {row.status !== "approved" && (
                              <button
                                type="button"
                                className="action-btn accept"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAppStatus(
                                    row.application_no,
                                    "approved",
                                  )
                                }}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                ✓ Approve
                              </button>
                            )}
                            {row.status !== "rejected" && (
                              <button
                                type="button"
                                className="action-btn decline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAppStatus(
                                    row.application_no,
                                    "rejected",
                                  )
                                }}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                ✕ Reject
                              </button>
                            )}
                            {row.status === "approved" && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedRecord(row)
                                    setOpenedLetterFromTable(true)
                                    setShowLetterModal(true)
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    background: "rgba(201, 107, 50, 0.1)",
                                    color: "var(--gold-text)",
                                    border: "1px solid rgba(201, 107, 50, 0.3)",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 4,
                                  }}
                                  title="Preview Official Admission Letter"
                                >
                                  👁 Preview
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (row.letter_released) {
                                      handleRevokeLetter(row.application_no)
                                    } else {
                                      handleReleaseLetter(row.application_no)
                                    }
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    background: row.letter_released
                                      ? "#fef3c7"
                                      : "#0b1a29",
                                    color: row.letter_released
                                      ? "#92400e"
                                      : "white",
                                    border: row.letter_released
                                      ? "1px solid #fcd34d"
                                      : "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                  }}
                                  title={
                                    row.letter_released
                                      ? "Revoke letter access"
                                      : "Release admission letter to student"
                                  }
                                >
                                  {row.letter_released
                                    ? "Revoke Letter"
                                    : "Release Letter"}
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRecord(row)
                              }}
                              style={{
                                padding: "8px 12px",
                                fontSize: 12,
                                border: "1px solid var(--line)",
                                background: "white",
                                borderRadius: 6,
                                fontWeight: 600,
                              }}
                            >
                              Details
                            </button>
                          </div>
                        </>
                      )}

                      {/* Payments Mobile Card */}
                      {title === "Payments" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div>
                              <code
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "var(--navy)",
                                }}
                              >
                                {row.reference}
                              </code>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--navy)",
                                  marginTop: 2,
                                }}
                              >
                                {row.payer_name}
                              </div>
                            </div>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <Badge
                                tone={
                                  row.status === "verified"
                                    ? "green"
                                    : row.status === "declined"
                                      ? "red"
                                      : "gold"
                                }
                              >
                                {row.status}
                              </Badge>
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>
                            {row.payer_email}{" "}
                            {row.application_no
                              ? `· App: ${row.application_no}`
                              : ""}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: 13,
                              background: "#fbfaf8",
                              padding: "8px 10px",
                              borderRadius: 6,
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "var(--muted)",
                                  display: "block",
                                }}
                              >
                                METHOD
                              </span>
                              <strong>{row.method}</strong>{" "}
                              {row.notes ? (
                                <small style={{ color: "var(--muted)" }}>
                                  {" "}
                                  ({row.notes})
                                </small>
                              ) : null}
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "var(--muted)",
                                  display: "block",
                                }}
                              >
                                AMOUNT
                              </span>
                              <strong
                                style={{ fontSize: 15, color: "var(--navy)" }}
                              >
                                ₦{Number(row.amount).toLocaleString()}
                              </strong>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", gap: 8, marginTop: 4 }}
                          >
                            {row.status !== "verified" && (
                              <button
                                type="button"
                                className="action-btn accept"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePaymentVerify(row.reference)
                                }}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                ✓ Verify Payment
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRecord(row)
                              }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                fontSize: 12,
                                border: "1px solid var(--line)",
                                background: "white",
                                borderRadius: 6,
                                fontWeight: 600,
                              }}
                            >
                              Inspect Details
                            </button>
                          </div>
                        </>
                      )}

                      {/* Repairs Mobile Card */}
                      {(title === "Repairs" || title.includes("Repairs")) && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div>
                              <code
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "var(--navy)",
                                }}
                              >
                                {row.tracking_code}
                              </code>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--navy)",
                                  marginTop: 2,
                                }}
                              >
                                {row.customer_name}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--muted)",
                                  marginTop: 1,
                                }}
                              >
                                {row.customer_phone}
                              </div>
                            </div>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <Badge
                                tone={
                                  row.status === "collected"
                                    ? "navy"
                                    : row.status === "ready"
                                      ? "green"
                                      : row.status === "in_progress"
                                        ? "navy"
                                        : row.status === "assessing"
                                          ? "gold"
                                          : "navy"
                                }
                              >
                                {row.status === "received"
                                  ? "Received"
                                  : row.status === "assessing"
                                    ? "Assessing"
                                    : row.status === "in_progress"
                                      ? "In Progress"
                                      : row.status === "ready"
                                        ? "Ready ✓"
                                        : row.status === "collected"
                                          ? "Collected"
                                          : row.status}
                              </Badge>
                            </span>
                          </div>
                          <div
                            style={{
                              background: "#fbfaf8",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                            }}
                          >
                            <div
                              style={{ fontWeight: 600, color: "var(--navy)" }}
                            >
                              {row.instrument}
                              {row.brand_model ? ` — ${row.brand_model}` : ""}
                            </div>
                            <div
                              style={{ color: "var(--muted)", marginTop: 2 }}
                            >
                              {row.service_requested || row.issue}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }}
                          >
                            <button
                              type="button"
                              className="action-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRecord(row)
                              }}
                              style={{
                                padding: "6px 14px",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              View &amp; Update
                            </button>
                          </div>
                        </>
                      )}

                      {/* Enquiries Mobile Card */}
                      {title === "Enquiries" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div>
                              <strong
                                style={{ fontSize: 14, color: "var(--navy)" }}
                              >
                                {row.name}
                              </strong>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--muted)",
                                  marginTop: 2,
                                }}
                              >
                                {row.email} · {row.phone}
                              </div>
                            </div>
                            <span
                              style={{
                                display: "flex",
                                gap: 4,
                                alignItems: "center",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Badge tone={row.is_read ? "navy" : "green"}>
                                {row.is_read ? "Read" : "New"}
                              </Badge>
                              {row.replied_at && (
                                <Badge tone="gold">Replied ✓</Badge>
                              )}
                            </span>
                          </div>
                          <div
                            style={{
                              background: "#fbfaf8",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                            }}
                          >
                            <strong
                              style={{
                                display: "block",
                                color: "var(--navy)",
                                marginBottom: 3,
                              }}
                            >
                              {row.subject}
                            </strong>
                            <p style={{ margin: 0, color: "var(--muted)" }}>
                              {row.message}
                            </p>
                          </div>
                          <div
                            style={{ display: "flex", gap: 8, marginTop: 4 }}
                          >
                            <button
                              type="button"
                              className="action-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEnquiryToggle(row.id, row.is_read)
                              }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {row.is_read ? "Mark unread" : "Mark read"}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRecord(row)
                              }}
                              style={{
                                padding: "8px 12px",
                                fontSize: 12,
                                border: "1px solid var(--line)",
                                background: "white",
                                borderRadius: 6,
                                fontWeight: 600,
                              }}
                            >
                              View
                            </button>
                          </div>
                        </>
                      )}

                      {/* Programs Mobile Card */}
                      {title === "Programs & Courses" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div>
                              <strong
                                style={{ fontSize: 14, color: "var(--navy)" }}
                              >
                                {row.name}
                              </strong>
                              {row.tag && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "var(--muted)",
                                    marginLeft: 6,
                                  }}
                                >
                                  ({row.tag})
                                </span>
                              )}
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--muted)",
                                  marginTop: 2,
                                }}
                              >
                                {row.category}
                              </div>
                            </div>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <Badge tone="green">Active</Badge>
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              background: "#fbfaf8",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                            }}
                          >
                            <div>
                              <div style={{ color: "var(--muted)" }}>
                                {row.duration || "1–12 Months"}
                              </div>
                              <div
                                style={{ fontSize: 11, color: "var(--muted)" }}
                              >
                                {row.modes || "Studio · Home · Online"}
                              </div>
                            </div>
                            <strong style={{ color: "var(--navy)" }}>
                              {row.fee}
                            </strong>
                          </div>
                          <div
                            style={{ display: "flex", gap: 8, marginTop: 4 }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditCourse(row)
                                setShowEditModal(true)
                              }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                background: "var(--navy)",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                              }}
                            >
                              Edit Course
                            </button>
                          </div>
                        </>
                      )}

                      {/* Instructors Mobile Card */}
                      {title === "Instructors" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              {row.image ? (
                                <img
                                  src={row.image}
                                  alt={row.name}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "1px solid var(--line)",
                                    flexShrink: 0,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "var(--navy)",
                                    color: "var(--gold)",
                                    display: "grid",
                                    placeItems: "center",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {row.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <strong
                                  style={{ fontSize: 14, color: "var(--navy)" }}
                                >
                                  {row.name}
                                </strong>
                                {row.is_director ? (
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      background: "#fdf5ec",
                                      color: "var(--gold-text)",
                                      border: "1px solid #ebdcd0",
                                    }}
                                  >
                                    Director
                                  </span>
                                ) : null}
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "var(--muted)",
                                    marginTop: 2,
                                  }}
                                >
                                  {row.title}
                                </div>
                              </div>
                            </div>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <Badge
                                tone={row.is_active === 0 ? "navy" : "green"}
                              >
                                {row.is_active === 0 ? "Inactive" : "Active"}
                              </Badge>
                            </span>
                          </div>
                          <div
                            style={{
                              background: "#fbfaf8",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                            }}
                          >
                            <div>
                              <strong style={{ color: "var(--navy)" }}>
                                Specialization:
                              </strong>{" "}
                              {row.specialization}
                            </div>
                            <div style={{ marginTop: 2 }}>
                              <strong style={{ color: "var(--navy)" }}>
                                Location:
                              </strong>{" "}
                              {row.location}
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", gap: 8, marginTop: 4 }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditInstructor(row)
                                setShowEditModal(true)
                              }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                background: "var(--navy)",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                              }}
                            >
                              Edit Profile
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleInstructor(row)
                              }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                background: "none",
                                border:
                                  row.is_active === 0
                                    ? "1px solid #166534"
                                    : "1px solid #dc2626",
                                color:
                                  row.is_active === 0 ? "#166534" : "#dc2626",
                                borderRadius: 6,
                                cursor: "pointer",
                              }}
                            >
                              {row.is_active === 0
                                ? "Activate Profile"
                                : "Deactivate Profile"}
                            </button>
                          </div>
                        </>
                      )}

                      {/* Performances Mobile Card */}
                      {title === "Performances & Recitals" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedRecitalIds.includes(row.id)}
                                onChange={() => handleToggleRecital(row.id)}
                                style={{ marginTop: 3 }}
                                aria-label={`Select recital ${row.title}`}
                              />
                              <div>
                                <strong
                                  style={{ fontSize: 14, color: "var(--navy)" }}
                                >
                                  {row.title}
                                </strong>
                                {row.is_featured ? (
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      background: "#fdf5ec",
                                      color: "var(--gold-text)",
                                      border: "1px solid #ebdcd0",
                                    }}
                                  >
                                    Featured
                                  </span>
                                ) : null}
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "var(--muted)",
                                    marginTop: 2,
                                  }}
                                >
                                  Performer: {row.performer}
                                </div>
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--muted)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.date_label || "Annual Recital"}
                            </span>
                          </div>
                          <div
                            style={{
                              background: "#fbfaf8",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>
                              {row.program} ({row.category})
                            </span>
                            <code>{row.youtube_id}</code>
                          </div>
                          <div
                            style={{ display: "flex", gap: 8, marginTop: 4 }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setApprovalModal({
                                  title: "Remove Recital Showcase",
                                  message: `Are you sure you want to remove performance recital "${row.title}"?`,
                                  confirmLabel: "Remove Performance",
                                  confirmTone: "danger",
                                  onConfirm: async () => {
                                    await deletePerformance(row.id)
                                    setActionNotice(
                                      "Performance recital removed.",
                                    )
                                    loadData()
                                  },
                                })
                              }}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                background: "none",
                                border: "1px solid #dc2626",
                                color: "#dc2626",
                                borderRadius: 6,
                                cursor: "pointer",
                              }}
                            >
                              Delete Performance
                            </button>
                          </div>
                        </>
                      )}

                      {/* Students Mobile Card */}
                      {title === "Students" && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div>
                              <strong
                                style={{ fontSize: 14, color: "var(--navy)" }}
                              >
                                {row.student_no}
                              </strong>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--navy)",
                                  marginTop: 2,
                                }}
                              >
                                {row.full_name}
                              </div>
                            </div>
                            <span style={{ whiteSpace: "nowrap" }}>
                              <Badge
                                tone={
                                  row.status === "active"
                                    ? "green"
                                    : row.status === "graduated"
                                      ? "gold"
                                      : "red"
                                }
                              >
                                {row.status}
                              </Badge>
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>
                            {row.email} · {row.phone}
                          </div>
                          <div
                            style={{
                              background: "#fbfaf8",
                              padding: "8px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <strong style={{ color: "var(--navy)" }}>
                                Program:
                              </strong>{" "}
                              {row.program}
                            </div>
                            <div>
                              <strong style={{ color: "var(--navy)" }}>
                                Cohort:
                              </strong>{" "}
                              {row.cohort}
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", gap: 8, marginTop: 4 }}
                          >
                            <Button
                              variant="ghost"
                              onClick={(e) => {
                                e?.stopPropagation?.()
                                setSelectedRecord(row)
                              }}
                              style={{ flex: 1, justifyContent: "center" }}
                            >
                              Manage Student
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Record Detail Dedicated Page ─────────────────────────────────────── */}
      {selectedRecord && !showLetterModal && !showReceiptModal && (
        <div
          className="admin-page-view"
          style={{
            maxWidth: 1200,
            margin: "0 auto 30px",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            }}
          >
            {/* Page Header Bar */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--line)",
                background: "#faf8f5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  style={{
                    background: "white",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--navy)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ← Back to {title} Table
                </button>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>/</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  {title} Record Details
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    color: "var(--navy)",
                  }}
                >
                  {title === "Enquiries"
                    ? "Enquiry"
                    : title === "Programs & Courses"
                      ? "Course Program"
                      : title === "Performances & Recitals"
                        ? "Recital Showcase"
                        : title.endsWith("ies")
                          ? title.slice(0, -3) + "y"
                          : title.endsWith("s")
                            ? title.slice(0, -1)
                            : title}{" "}
                  Details:{" "}
                  <span style={{ color: "var(--gold)" }}>
                    {selectedRecord.order_ref ||
                      selectedRecord.application_no ||
                      selectedRecord.reference ||
                      selectedRecord.tracking_code ||
                      selectedRecord.student_no ||
                      selectedRecord.title ||
                      selectedRecord.name}
                  </span>
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {renderRecordActions()}
                </div>
              </div>
            </div>

            <div style={{ padding: "28px 32px" }}>
              {/* Application Details */}
              {title === "Applications" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <small
                      style={{
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                      }}
                    >
                      Candidate Admission Record
                    </small>
                    <button
                      type="button"
                      onClick={() => setEditingApp(!editingApp)}
                      style={{
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        background: editingApp ? "#fee2e2" : "#f1f5f9",
                        color: editingApp ? "#dc2626" : "var(--navy)",
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {editingApp ? "Cancel Editing" : "Edit Details"}
                    </button>
                  </div>

                  {editingApp ? (
                    <form
                      onSubmit={handleSaveAppModifications}
                      style={{
                        background: "#fbfaf8",
                        padding: 16,
                        borderRadius: 8,
                        border: "1px solid var(--line)",
                        marginBottom: 16,
                      }}
                    >
                      <div className="form-grid" style={{ marginBottom: 12 }}>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 5,
                            }}
                          >
                            Program / Course
                          </label>
                          <input
                            value={appForm.program}
                            onChange={(e) =>
                              setAppForm({
                                ...appForm,
                                program: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              minHeight: 40,
                              borderRadius: 6,
                              border: "1px solid #cbd4d9",
                              padding: "0 10px",
                              background: "white",
                              fontSize: 13,
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 5,
                            }}
                          >
                            Tuition Fee (₦)
                          </label>
                          <input
                            type="number"
                            value={appForm.tuition_fee}
                            onChange={(e) =>
                              setAppForm({
                                ...appForm,
                                tuition_fee: Number(e.target.value),
                              })
                            }
                            style={{
                              width: "100%",
                              minHeight: 40,
                              borderRadius: 6,
                              border: "1px solid #cbd4d9",
                              padding: "0 10px",
                              background: "white",
                              fontSize: 13,
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 5,
                            }}
                          >
                            Study Mode
                          </label>
                          <select
                            value={appForm.study_mode}
                            onChange={(e) =>
                              setAppForm({
                                ...appForm,
                                study_mode: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              minHeight: 40,
                              borderRadius: 6,
                              border: "1px solid #cbd4d9",
                              padding: "0 10px",
                              background: "white",
                              fontSize: 13,
                            }}
                          >
                            <option value="Onsite">
                              Onsite (Kaduna Studio)
                            </option>
                            <option value="Online">Online Video Lessons</option>
                            <option value="Home Lessons">
                              Private Home Lessons
                            </option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 5,
                            }}
                          >
                            Skill Level
                          </label>
                          <select
                            value={appForm.skill_level}
                            onChange={(e) =>
                              setAppForm({
                                ...appForm,
                                skill_level: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              minHeight: 40,
                              borderRadius: 6,
                              border: "1px solid #cbd4d9",
                              padding: "0 10px",
                              background: "white",
                              fontSize: 13,
                            }}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 5,
                            }}
                          >
                            Student Phone
                          </label>
                          <input
                            value={appForm.phone}
                            onChange={(e) =>
                              setAppForm({ ...appForm, phone: e.target.value })
                            }
                            style={{
                              width: "100%",
                              minHeight: 40,
                              borderRadius: 6,
                              border: "1px solid #cbd4d9",
                              padding: "0 10px",
                              background: "white",
                              fontSize: 13,
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 700,
                              marginBottom: 5,
                            }}
                          >
                            Student Email
                          </label>
                          <input
                            type="email"
                            value={appForm.email}
                            onChange={(e) =>
                              setAppForm({ ...appForm, email: e.target.value })
                            }
                            style={{
                              width: "100%",
                              minHeight: 40,
                              borderRadius: 6,
                              border: "1px solid #cbd4d9",
                              padding: "0 10px",
                              background: "white",
                              fontSize: 13,
                            }}
                            required
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 10,
                        }}
                      >
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => setEditingApp(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Modifications</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="doc-grid" style={{ margin: "0 0 16px" }}>
                      <div>
                        <small>Full Name</small>
                        <strong>
                          {selectedRecord.first_name} {selectedRecord.last_name}
                        </strong>
                      </div>
                      <div>
                        <small>Email</small>
                        <strong>{selectedRecord.email}</strong>
                      </div>
                      <div>
                        <small>Phone Number</small>
                        <strong>{selectedRecord.phone}</strong>
                      </div>
                      {selectedRecord.phone && (
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            display: "flex",
                            gap: 10,
                            padding: "6px 0 2px",
                          }}
                        >
                          <a
                            href={`https://wa.me/${(selectedRecord.phone || "").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedRecord.first_name || "")},%20this%20is%20Vivadoxa%20Music%20Academy%20regarding%20your%20application%20(${selectedRecord.application_no}).`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 12px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              background: "rgba(37, 211, 102, 0.15)",
                              color: "#075e54",
                              border: "1px solid rgba(37, 211, 102, 0.35)",
                              textDecoration: "none",
                            }}
                          >
                            <WhatsAppIcon size={14} fill="#075e54" />
                            Chat on WhatsApp
                          </a>
                        </div>
                      )}
                      <div>
                        <small>Home Address</small>
                        <strong>{selectedRecord.address || "Kaduna"}</strong>
                      </div>
                      <div>
                        <small>Program Applied</small>
                        <strong>{selectedRecord.program}</strong>
                      </div>
                      <div>
                        <small>Study Mode &amp; Level</small>
                        <strong>
                          {selectedRecord.study_mode} (
                          {selectedRecord.skill_level})
                        </strong>
                      </div>
                      <div>
                        <small>Tuition Fee</small>
                        <strong>
                          ₦
                          {Number(
                            selectedRecord.tuition_fee || 20000,
                          ).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <small>Current Status</small>
                        <Badge
                          tone={
                            selectedRecord.status === "approved"
                              ? "green"
                              : selectedRecord.status === "rejected"
                                ? "red"
                                : "gold"
                          }
                        >
                          {selectedRecord.status}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Bursary & Payment Proof Section */}
                  <div
                    style={{
                      background:
                        selectedRecord.payment_status === "verified"
                          ? "#f0fdf4"
                          : selectedRecord.payment_status === "pending"
                            ? "#fffbeb"
                            : "#f8fafc",
                      border: `1px solid ${
                        selectedRecord.payment_status === "verified"
                          ? "#bbf7d0"
                          : selectedRecord.payment_status === "pending"
                            ? "#fde68a"
                            : "#e2e8f0"
                      }`,
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 13, color: "var(--navy)" }}>
                          Bursary Payment Reconciliation
                        </strong>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          Tuition Fee: ₦
                          {Number(
                            selectedRecord.tuition_fee || 20000,
                          ).toLocaleString()}
                        </div>
                      </div>
                      <Badge
                        tone={
                          selectedRecord.payment_status === "verified"
                            ? "green"
                            : selectedRecord.payment_status === "pending"
                              ? "gold"
                              : "neutral"
                        }
                      >
                        {selectedRecord.payment_status === "verified"
                          ? "✓ Payment Cleared & Verified"
                          : selectedRecord.payment_status === "pending"
                            ? "⏳ Bank Transfer Proof Submitted (Pending Admin Verification)"
                            : "No Payment Submitted"}
                      </Badge>
                    </div>

                    {selectedRecord.payment_reference ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(180px, 1fr))",
                          gap: 12,
                          fontSize: 12,
                          paddingTop: 10,
                          borderTop: "1px dashed rgba(0,0,0,0.1)",
                        }}
                      >
                        <div>
                          <small
                            style={{ color: "var(--muted)", display: "block" }}
                          >
                            Transaction Reference
                          </small>
                          <code>{selectedRecord.payment_reference}</code>
                        </div>
                        <div>
                          <small
                            style={{ color: "var(--muted)", display: "block" }}
                          >
                            Amount Logged
                          </small>
                          <strong>
                            ₦
                            {Number(
                              selectedRecord.payment_amount ||
                                selectedRecord.tuition_fee ||
                                20000,
                            ).toLocaleString()}{" "}
                            {selectedRecord.payment_currency || "NGN"}
                          </strong>
                        </div>
                        <div>
                          <small
                            style={{ color: "var(--muted)", display: "block" }}
                          >
                            Payment Method
                          </small>
                          <span>
                            {selectedRecord.payment_method || "Bank Transfer"}
                          </span>
                        </div>
                        <div>
                          <small
                            style={{ color: "var(--muted)", display: "block" }}
                          >
                            Payment Date
                          </small>
                          <span>
                            {selectedRecord.payment_date
                              ? new Date(
                                  selectedRecord.payment_date,
                                ).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: 12,
                          color: "var(--muted)",
                        }}
                      >
                        No bank transfer evidence or online gateway payment has
                        been recorded for this application yet.
                      </p>
                    )}

                    {selectedRecord.payment_status === "verified" ? (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "8px 14px",
                          background: "#ecfdf5",
                          borderRadius: 6,
                          border: "1px solid #a7f3d0",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                          color: "#047857",
                          fontWeight: 700,
                        }}
                      >
                        ✓ Tuition Payment Cleared &amp; Verified ({selectedRecord.payment_reference || "Reconciled"})
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: 14,
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          variant="primary"
                          onClick={() =>
                            handlePaymentVerify(
                              selectedRecord.payment_reference || selectedRecord.application_no,
                              selectedRecord.application_no,
                            )
                          }
                          style={{
                            background: "#15803d",
                            color: "white",
                            fontSize: 12,
                            padding: "6px 14px",
                          }}
                        >
                          ✓ Confirm &amp; Verify Tuition Payment
                        </Button>
                        <span style={{ fontSize: 11, color: "#854d0e" }}>
                          Confirming clears the student's admission and unlocks their official digital payment receipt and admission letter.
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedRecord.guardian_name && (
                    <div
                      style={{
                        padding: 12,
                        background: "#faf9f6",
                        borderRadius: 6,
                        marginBottom: 16,
                      }}
                    >
                      <small
                        style={{
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Guardian Details
                      </small>
                      <div style={{ marginTop: 4 }}>
                        <strong>{selectedRecord.guardian_name}</strong> (
                        {selectedRecord.guardian_phone})
                      </div>
                    </div>
                  )}

                  {/* Enrollment Controls */}
                  <div
                    style={{
                      borderTop: "1px solid var(--line)",
                      paddingTop: 16,
                      marginTop: 16,
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      Assign to Cohort:
                    </label>
                    <div style={{ display: "flex", gap: 10 }}>
                      <select
                        value={selectedCohort}
                        onChange={(e) => setSelectedCohort(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                          flex: 1,
                        }}
                      >
                        <option value="Saturday Cohort A (Morning)">
                          Saturday Cohort A (Morning 9am–12pm)
                        </option>
                        <option value="Saturday Cohort B (Afternoon)">
                          Saturday Cohort B (Afternoon 1pm–4pm)
                        </option>
                        <option value="Weekday Cohort (Tue & Thu)">
                          Weekday Cohort (Tue/Thu 5pm–7pm)
                        </option>
                        <option value="Private Home Lessons">
                          Private Home Lessons (Flexible Schedule)
                        </option>
                        <option value="Online Virtual Studio">
                          Online Virtual Studio (1-on-1 Remote)
                        </option>
                      </select>
                      <Button onClick={() => handleEnroll(selectedRecord)}>
                        Enroll as Student
                      </Button>
                    </div>
                  </div>

                  {/* Admission Letter Access & Preview */}
                  {selectedRecord.status === "approved" && (
                    <div
                      style={{
                        borderTop: "1px solid var(--line)",
                        paddingTop: 16,
                        marginTop: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          Admission Letter Access &amp; Preview
                        </label>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontWeight: 700,
                            background: selectedRecord.letter_released
                              ? "#ecfdf5"
                              : "#fef3c7",
                            color: selectedRecord.letter_released
                              ? "#047857"
                              : "#92400e",
                            border: `1px solid ${
                              selectedRecord.letter_released
                                ? "#a7f3d0"
                                : "#fde68a"
                            }`,
                          }}
                        >
                          {selectedRecord.letter_released
                            ? "● Released to Student"
                            : "○ Draft (Not Released)"}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          margin: "0 0 12px",
                        }}
                      >
                        {selectedRecord.letter_released
                          ? "Letter is active. The candidate was emailed their official notification and can view, print, or download it."
                          : "Preview the official signed letter below before releasing. Releasing will publish the letter and dispatch an official notification email to the student."}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowLetterModal(true)
                          }}
                          style={{
                            padding: "9px 18px",
                            fontSize: 13,
                            fontWeight: 700,
                            background: "var(--gold)",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            boxShadow: "0 2px 8px rgba(201,107,50,0.25)",
                          }}
                        >
                          <Icon name="copy" size={14} /> Preview Admission
                          Letter (PDF)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedRecord.letter_released) {
                              handleRevokeLetter(selectedRecord.application_no)
                            } else {
                              handleReleaseLetter(selectedRecord.application_no)
                            }
                          }}
                          style={{
                            padding: "9px 18px",
                            fontSize: 13,
                            fontWeight: 700,
                            background: selectedRecord.letter_released
                              ? "#fef3c7"
                              : "#0b1a29",
                            color: selectedRecord.letter_released
                              ? "#92400e"
                              : "white",
                            border: selectedRecord.letter_released
                              ? "1px solid #fcd34d"
                              : "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {selectedRecord.letter_released
                            ? "Revoke Admission Letter"
                            : "Release Letter & Email Student"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details */}
              {title === "Payments" && (
                <div className="doc-grid" style={{ margin: "0" }}>
                  <div>
                    <small>Payment Reference</small>
                    <strong>{selectedRecord.reference}</strong>
                  </div>
                  <div>
                    <small>Application Number</small>
                    <strong>{selectedRecord.application_no || "—"}</strong>
                  </div>
                  <div>
                    <small>Payer Name</small>
                    <strong>{selectedRecord.payer_name}</strong>
                  </div>
                  <div>
                    <small>Payer Email</small>
                    <strong>{selectedRecord.payer_email}</strong>
                  </div>
                  <div>
                    <small>Amount Paid</small>
                    <strong style={{ fontSize: 18, color: "var(--navy)" }}>
                      ₦{Number(selectedRecord.amount).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <small>Payment Method</small>
                    <strong>{selectedRecord.method}</strong>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <small>Bank Narration / Notes</small>
                    <strong>{selectedRecord.notes || "—"}</strong>
                  </div>
                  {selectedRecord.payer_phone && (
                    <div
                      style={{
                        gridColumn: "1/-1",
                        display: "flex",
                        gap: 10,
                        paddingTop: 8,
                      }}
                    >
                      <a
                        href={`https://wa.me/${(selectedRecord.payer_phone || "").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedRecord.payer_name || "")},%20this%20is%20Vivadoxa%20Accounts%20regarding%20your%20payment%20(Ref:%20${selectedRecord.reference}).`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: "rgba(37, 211, 102, 0.15)",
                          color: "#075e54",
                          border: "1px solid rgba(37, 211, 102, 0.35)",
                          textDecoration: "none",
                        }}
                      >
                        <WhatsAppIcon size={14} fill="#075e54" />
                        WhatsApp Payer
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Repair Details */}
              {(title === "Repairs" || title.includes("Repairs")) && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Section A — Ticket Overview */}
                  <div
                    style={{
                      background: "var(--navy)",
                      color: "white",
                      borderRadius: 10,
                      padding: "16px 20px",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div
                        style={{
                          fontSize: 10,
                          opacity: 0.6,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: 4,
                        }}
                      >
                        Ticket
                      </div>
                      <code
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "#e9a16f",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {selectedRecord.tracking_code}
                      </code>
                      <div
                        style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}
                      >
                        Received:{" "}
                        {selectedRecord.created_at
                          ? new Date(
                              selectedRecord.created_at,
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 6,
                      }}
                    >
                      <Badge
                        tone={
                          selectedRecord.status === "collected"
                            ? "navy"
                            : selectedRecord.status === "ready"
                              ? "green"
                              : selectedRecord.status === "in_progress"
                                ? "navy"
                                : selectedRecord.status === "assessing"
                                  ? "gold"
                                  : "navy"
                        }
                      >
                        {selectedRecord.status === "received"
                          ? "Intake Received"
                          : selectedRecord.status === "assessing"
                            ? "Under Assessment"
                            : selectedRecord.status === "in_progress"
                              ? "Repair In Progress"
                              : selectedRecord.status === "ready"
                                ? "Ready for Pickup ✓"
                                : selectedRecord.status === "collected"
                                  ? "Collected / Delivered"
                                  : selectedRecord.status}
                      </Badge>
                      <Badge
                        tone={
                          selectedRecord.intake_method === "pickup"
                            ? "gold"
                            : "navy"
                        }
                      >
                        {selectedRecord.intake_method === "pickup"
                          ? "🚗 Logistics Pickup"
                          : "📥 Studio Drop-off"}
                      </Badge>
                    </div>
                    {selectedRecord.pickup_address && (
                      <div
                        style={{
                          width: "100%",
                          fontSize: 12,
                          borderTop: "1px solid rgba(255,255,255,0.15)",
                          paddingTop: 8,
                          marginTop: 4,
                        }}
                      >
                        <span style={{ opacity: 0.6 }}>Pickup address: </span>
                        <strong style={{ color: "#e9a16f" }}>
                          {selectedRecord.pickup_address}
                        </strong>
                        {selectedRecord.collection_arrangement && (
                          <span style={{ opacity: 0.7 }}>
                            {" "}
                            · {selectedRecord.collection_arrangement}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section B — Customer */}
                  <div
                    style={{
                      background: "#faf9f6",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "16px 20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1.2px",
                        color: "var(--muted)",
                        marginBottom: 12,
                      }}
                    >
                      Customer
                    </div>
                    <div className="doc-grid" style={{ margin: 0 }}>
                      <div>
                        <small>Name</small>
                        <strong>{selectedRecord.customer_name}</strong>
                      </div>
                      <div>
                        <small>Phone</small>
                        <strong>{selectedRecord.customer_phone}</strong>
                      </div>
                      <div>
                        <small>Email</small>
                        <strong>{selectedRecord.customer_email || "—"}</strong>
                      </div>
                    </div>
                    {selectedRecord.customer_phone && (
                      <div style={{ marginTop: 14 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            marginBottom: 8,
                            fontWeight: 600,
                          }}
                        >
                          Optional Direct Follow-ups (Customer is auto-notified
                          by email upon stage updates):
                        </div>
                        <div
                          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                        >
                          <a
                            href={`https://wa.me/${(selectedRecord.customer_phone || "").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedRecord.customer_name || "")},%20this%20is%20Vivadoxa%20Instrument%20Workshop%20regarding%20your%20repair%20ticket%20(${selectedRecord.tracking_code}).%20Current%20Status:%20${selectedRecord.status}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 14px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              background: "rgba(37, 211, 102, 0.15)",
                              color: "#075e54",
                              border: "1px solid rgba(37, 211, 102, 0.35)",
                              textDecoration: "none",
                            }}
                          >
                            <WhatsAppIcon size={14} fill="#075e54" />
                            WhatsApp Customer
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section C — Instrument Details */}
                  <div
                    style={{
                      background: "#faf9f6",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "16px 20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1.2px",
                        color: "var(--muted)",
                        marginBottom: 12,
                      }}
                    >
                      Instrument Details
                    </div>
                    <div className="doc-grid" style={{ margin: 0 }}>
                      <div>
                        <small>Instrument Type</small>
                        <strong>{selectedRecord.instrument || "—"}</strong>
                      </div>
                      <div>
                        <small>Brand / Model</small>
                        <strong>{selectedRecord.brand_model || "—"}</strong>
                      </div>
                      {selectedRecord.serial_number && (
                        <div>
                          <small>Serial No.</small>
                          <strong>{selectedRecord.serial_number}</strong>
                        </div>
                      )}
                      {selectedRecord.equipment_age && (
                        <div>
                          <small>Instrument Age</small>
                          <strong>{selectedRecord.equipment_age}</strong>
                        </div>
                      )}
                      {selectedRecord.accessories && (
                        <div>
                          <small>Accessories Included</small>
                          <strong>{selectedRecord.accessories}</strong>
                        </div>
                      )}
                      <div style={{ gridColumn: "1/-1" }}>
                        <small>Service Requested</small>
                        <strong>
                          {selectedRecord.service_requested || "—"}
                        </strong>
                      </div>
                      <div style={{ gridColumn: "1/-1" }}>
                        <small>Reported Issue</small>
                        <strong>{selectedRecord.issue || "—"}</strong>
                      </div>
                      {selectedRecord.additional_notes && (
                        <div style={{ gridColumn: "1/-1" }}>
                          <small>Additional Notes</small>
                          <strong>{selectedRecord.additional_notes}</strong>
                        </div>
                      )}
                      <div>
                        <small>Previously Repaired?</small>
                        <strong>
                          {selectedRecord.previously_repaired === "yes" ||
                          selectedRecord.previously_repaired === true ||
                          selectedRecord.previously_repaired === 1
                            ? "Yes"
                            : "No"}
                        </strong>
                      </div>
                      {selectedRecord.visible_damage && (
                        <div>
                          <small>Visible Damage</small>
                          <strong>{selectedRecord.visible_damage}</strong>
                        </div>
                      )}
                      {selectedRecord.problem_started && (
                        <div>
                          <small>Problem Started</small>
                          <strong>{selectedRecord.problem_started}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section D — Workflow Actions */}
                  <div
                    style={{
                      background: "rgba(201,107,50,0.05)",
                      border: "2px solid var(--gold)",
                      borderRadius: 10,
                      padding: "18px 20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1.2px",
                        color: "var(--gold)",
                        marginBottom: 14,
                      }}
                    >
                      Update Repair Stage
                    </div>

                    {/* Visual stepper */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0,
                        marginBottom: 18,
                        overflowX: "auto",
                        paddingBottom: 4,
                      }}
                    >
                      {[
                        { key: "received", label: "Received" },
                        { key: "assessing", label: "Assessing" },
                        { key: "in_progress", label: "In Progress" },
                        { key: "ready", label: "Ready ✓" },
                        { key: "collected", label: "Collected" },
                      ].map((s, i, arr) => {
                        const stageOrder = [
                          "received",
                          "assessing",
                          "in_progress",
                          "ready",
                          "collected",
                        ]
                        const currentIdx = stageOrder.indexOf(
                          selectedRecord.status,
                        )
                        const thisIdx = stageOrder.indexOf(s.key)
                        const isCurrent = s.key === selectedRecord.status
                        const isPast = thisIdx < currentIdx
                        return (
                          <div
                            key={s.key}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 4,
                                minWidth: 60,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 11,
                                  fontWeight: 800,
                                  background: isCurrent
                                    ? "var(--gold)"
                                    : isPast
                                      ? "#15803d"
                                      : "var(--line)",
                                  color:
                                    isCurrent || isPast
                                      ? "white"
                                      : "var(--muted)",
                                  border: isCurrent
                                    ? "2px solid var(--gold)"
                                    : "2px solid transparent",
                                  boxShadow: isCurrent
                                    ? "0 0 0 3px rgba(201,107,50,0.2)"
                                    : "none",
                                }}
                              >
                                {isPast ? "✓" : i + 1}
                              </div>
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: isCurrent ? 700 : 500,
                                  color: isCurrent
                                    ? "var(--gold)"
                                    : isPast
                                      ? "#15803d"
                                      : "var(--muted)",
                                  textAlign: "center",
                                  lineHeight: 1.2,
                                }}
                              >
                                {s.label}
                              </span>
                            </div>
                            {i < arr.length - 1 && (
                              <div
                                style={{
                                  height: 2,
                                  width: 24,
                                  background:
                                    stageOrder.indexOf(s.key) < currentIdx
                                      ? "#15803d"
                                      : "var(--line)",
                                  marginBottom: 16,
                                }}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            marginBottom: 6,
                          }}
                        >
                          Change Stage:
                        </label>
                        <select
                          value={repairStatusInput}
                          onChange={(e) => setRepairStatusInput(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 10px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            fontSize: 13,
                            fontWeight: 600,
                            background: "white",
                          }}
                        >
                          <option value="received">Intake Received</option>
                          <option value="assessing">Under Assessment</option>
                          <option value="in_progress">
                            Repair In Progress
                          </option>
                          <option value="ready">
                            Ready for Pickup / Delivery
                          </option>
                          <option value="collected">
                            Collected / Delivered
                          </option>
                        </select>
                      </div>

                      <div style={{ flex: 1, minWidth: 160 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            marginBottom: 6,
                          }}
                        >
                          Set / Update Quoted Cost (₦):
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 15000"
                          value={repairCostInput}
                          onChange={(e) => setRepairCostInput(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "9px 10px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            fontSize: 13,
                            background: "white",
                          }}
                        />
                        {selectedRecord.estimated_cost && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--muted)",
                              marginTop: 4,
                            }}
                          >
                            Current: ₦
                            {Number(
                              selectedRecord.estimated_cost,
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Optional Workshop Note to include in the email */}
                    <div style={{ marginTop: 14 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 5,
                        }}
                      >
                        Optional Custom Note (included in customer&apos;s email
                        notification):
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Diaphragm replaced and octave key calibrated. Ready for play-testing."
                        value={repairAdminNote}
                        onChange={(e) => setRepairAdminNote(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                          fontSize: 12,
                          background: "white",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleRepairStatus(
                            selectedRecord.tracking_code,
                            repairStatusInput,
                            repairCostInput
                              ? Number(repairCostInput)
                              : undefined,
                            repairAdminNote.trim() || undefined,
                          )
                        }
                        style={{
                          padding: "10px 24px",
                          borderRadius: 7,
                          background: "var(--gold)",
                          color: "white",
                          border: "none",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          letterSpacing: "0.3px",
                          boxShadow: "0 2px 8px rgba(201,107,50,0.3)",
                        }}
                      >
                        Save &amp; Notify Customer
                      </button>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#166534",
                          lineHeight: 1.4,
                          flex: 1,
                          minWidth: 220,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "rgba(34, 197, 94, 0.08)",
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid rgba(34, 197, 94, 0.25)",
                        }}
                      >
                        <span style={{ fontSize: 14 }}>✉️</span>
                        <span>
                          Customer is{" "}
                          <strong>automatically notified via email</strong> with
                          updated stage, quotation &amp; live tracking.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enquiry Details */}
              {title === "Enquiries" && (
                <div>
                  <div className="doc-grid" style={{ margin: "0 0 16px" }}>
                    <div>
                      <small>From</small>
                      <strong>{selectedRecord.name}</strong>
                    </div>
                    <div>
                      <small>Email</small>
                      <strong>{selectedRecord.email || "—"}</strong>
                    </div>
                    <div>
                      <small>Phone</small>
                      <strong>{selectedRecord.phone || "—"}</strong>
                    </div>
                    <div>
                      <small>Subject</small>
                      <strong>{selectedRecord.subject}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px 20px",
                      background: "#faf9f6",
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                        paddingBottom: 8,
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <small
                        style={{
                          color: "var(--gold-text)",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: "1.2px",
                        }}
                      >
                        Enquiry &amp; Order Content
                      </small>
                      {selectedRecord.source && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "3px 9px",
                            borderRadius: 6,
                            background:
                              selectedRecord.source === "rentals"
                                ? "rgba(201,107,50,0.12)"
                                : selectedRecord.source === "store"
                                  ? "rgba(21,112,84,0.1)"
                                  : "rgba(11,11,11,0.06)",
                            color:
                              selectedRecord.source === "rentals"
                                ? "var(--gold-text)"
                                : selectedRecord.source === "store"
                                  ? "var(--green)"
                                  : "var(--navy)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {selectedRecord.source === "rentals"
                            ? "Rental Fleet"
                            : selectedRecord.source === "store"
                              ? "Music Store"
                              : selectedRecord.source}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        margin: 0,
                        color: "#191715",
                        whiteSpace: "pre-wrap",
                        fontFamily: "inherit",
                        fontSize: 13,
                        lineHeight: 1.7,
                        wordBreak: "break-word",
                      }}
                    >
                      {selectedRecord.message}
                    </div>
                  </div>

                  {/* Existing Reply Thread if previously replied */}
                  {selectedRecord.reply_message && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: "14px 18px",
                        background: "rgba(201, 107, 50, 0.06)",
                        border: "1px solid rgba(201, 107, 50, 0.25)",
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                          paddingBottom: 6,
                          borderBottom: "1px solid rgba(201, 107, 50, 0.15)",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "var(--gold)",
                            }}
                          />
                          <strong
                            style={{
                              fontSize: 11,
                              color: "var(--gold-text)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Staff Reply Sent
                          </strong>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          {selectedRecord.replied_at
                            ? new Date(
                                selectedRecord.replied_at,
                              ).toLocaleString()
                            : "Recently"}{" "}
                          {selectedRecord.replied_by
                            ? `· by ${selectedRecord.replied_by}`
                            : ""}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: "#191715",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {selectedRecord.reply_message}
                      </div>
                    </div>
                  )}

                  {/* In-App Reply Composer Drawer */}
                  {showReplyForm && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: "18px 20px",
                        background: "#ffffff",
                        border: "2px solid var(--gold)",
                        borderRadius: 12,
                        boxShadow: "0 4px 18px rgba(201, 107, 50, 0.12)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 14,
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize: 14,
                              color: "var(--navy)",
                              display: "block",
                            }}
                          >
                            ✉️ Compose In-App Email Reply
                          </strong>
                          <small
                            style={{ color: "var(--muted)", fontSize: 11 }}
                          >
                            Sent directly from Vivadoxa&apos;s verified mailer
                            to <strong>{selectedRecord.email}</strong>
                          </small>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowReplyForm(false)}
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 16,
                            cursor: "pointer",
                            color: "var(--muted)",
                          }}
                          aria-label="Close reply form"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Quick Template Presets */}
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--gold-text)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: 6,
                          }}
                        >
                          Quick Templates:
                        </div>
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          <button
                            type="button"
                            onClick={() => applyReplyTemplate("general")}
                            className="btn btn-ghost"
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              minHeight: 28,
                              border: "1px solid var(--line-strong)",
                              borderRadius: 20,
                              background: "#fbfaf8",
                            }}
                          >
                            General Response
                          </button>
                          <button
                            type="button"
                            onClick={() => applyReplyTemplate("rentals")}
                            className="btn btn-ghost"
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              minHeight: 28,
                              border: "1px solid var(--line-strong)",
                              borderRadius: 20,
                              background: "#fbfaf8",
                            }}
                          >
                            Rental Booking &amp; Quote
                          </button>
                          <button
                            type="button"
                            onClick={() => applyReplyTemplate("academy")}
                            className="btn btn-ghost"
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              minHeight: 28,
                              border: "1px solid var(--line-strong)",
                              borderRadius: 20,
                              background: "#fbfaf8",
                            }}
                          >
                            Academy Admission
                          </button>
                          <button
                            type="button"
                            onClick={() => applyReplyTemplate("store")}
                            className="btn btn-ghost"
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              minHeight: 28,
                              border: "1px solid var(--line-strong)",
                              borderRadius: 20,
                              background: "#fbfaf8",
                            }}
                          >
                            Store Product Order
                          </button>
                        </div>
                      </div>

                      {/* Email Subject */}
                      <div style={{ marginBottom: 12 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            marginBottom: 4,
                            color: "var(--navy)",
                          }}
                        >
                          Email Subject:
                        </label>
                        <input
                          type="text"
                          value={replySubject}
                          onChange={(e) => setReplySubject(e.target.value)}
                          placeholder={`Re: ${selectedRecord.subject || "Vivadoxa Inquiry"}`}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--line-strong)",
                            fontSize: 13,
                            background: "white",
                          }}
                        />
                      </div>

                      {/* Email Body Textarea */}
                      <div style={{ marginBottom: 12 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            marginBottom: 4,
                            color: "var(--navy)",
                          }}
                        >
                          Reply Message Body:
                        </label>
                        <textarea
                          rows={6}
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your official response to the client here..."
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--line-strong)",
                            fontSize: 13,
                            background: "white",
                            fontFamily: "inherit",
                            lineHeight: 1.6,
                            resize: "vertical",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginBottom: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        Client will receive a branded Vivadoxa HTML email
                        including their original inquiry for context.
                      </div>

                      {/* Action buttons */}
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <Button
                          variant="primary"
                          onClick={handleSendEnquiryReply}
                          disabled={sendingReply || !replyMessage.trim()}
                        >
                          {sendingReply
                            ? "Sending Email..."
                            : "Send Email to Client"}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setShowReplyForm(false)}
                          disabled={sendingReply}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Contact Bar */}
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 16,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {selectedRecord.email && (
                      <button
                        type="button"
                        onClick={() => {
                          const willShow = !showReplyForm
                          setShowReplyForm(willShow)
                          if (willShow && !replySubject) {
                            const subj =
                              selectedRecord.subject || "Vivadoxa Inquiry"
                            setReplySubject(
                              subj.startsWith("Re:") ? subj : `Re: ${subj}`,
                            )
                          }
                        }}
                        className="btn btn-primary"
                        style={{
                          fontSize: 12,
                          padding: "8px 18px",
                          minHeight: 38,
                          cursor: "pointer",
                        }}
                      >
                        <Icon name="mail" size={14} />
                        <span>
                          {showReplyForm
                            ? "Close Email Composer"
                            : selectedRecord.reply_message
                              ? "Send Another Email Reply"
                              : "Reply via In-App Email"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Student Profile Details */}
              {title === "Students" && (
                <div>
                  <div className="doc-grid" style={{ margin: "0 0 16px" }}>
                    <div>
                      <small>Student ID Number</small>
                      <strong style={{ fontSize: 16, color: "var(--navy)" }}>
                        {selectedRecord.student_no}
                      </strong>
                    </div>
                    <div>
                      <small>Linked Application</small>
                      <strong>
                        {selectedRecord.application_no || "Direct Registration"}
                      </strong>
                    </div>
                    <div>
                      <small>Student Full Name</small>
                      <strong>{selectedRecord.full_name}</strong>
                    </div>
                    <div>
                      <small>Enrolled Course / Program</small>
                      <strong>{selectedRecord.program}</strong>
                    </div>
                    <div>
                      <small>Primary Phone</small>
                      <strong>{selectedRecord.phone || "—"}</strong>
                    </div>
                    <div>
                      <small>Primary Email</small>
                      <strong>{selectedRecord.email || "—"}</strong>
                    </div>
                    {selectedRecord.phone && (
                      <div
                        style={{
                          gridColumn: "1/-1",
                          display: "flex",
                          gap: 10,
                          paddingTop: 4,
                        }}
                      >
                        <a
                          href={`https://wa.me/${(selectedRecord.phone || "").replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedRecord.full_name)},%20this%20is%20Vivadoxa%20Academy%20Academic%20Desk.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            background: "rgba(37, 211, 102, 0.15)",
                            color: "#075e54",
                            border: "1px solid rgba(37, 211, 102, 0.35)",
                            textDecoration: "none",
                          }}
                        >
                          <WhatsAppIcon size={14} fill="#075e54" />
                          WhatsApp Student
                        </a>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid var(--line)",
                      paddingTop: 16,
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px",
                        fontSize: 13,
                        textTransform: "uppercase",
                        color: "var(--muted)",
                      }}
                    >
                      Academic Cohort &amp; Enrollment Status
                    </h4>
                    <div className="form-grid">
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 4,
                          }}
                        >
                          Assigned Cohort Slot:
                        </label>
                        <select
                          value={studentForm.cohort}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              cohort: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            background: "white",
                            fontSize: 13,
                          }}
                        >
                          <option value="Saturday Cohort A">
                            Saturday Cohort A (Morning 9am–12pm)
                          </option>
                          <option value="Saturday Cohort B">
                            Saturday Cohort B (Afternoon 1pm–4pm)
                          </option>
                          <option value="Weekday Evenings">
                            Weekday Evenings (Tue &amp; Thu 5pm–7pm)
                          </option>
                          <option value="Private Home Lessons">
                            Private Home Lessons
                          </option>
                          <option value="Online Virtual Studio">
                            Online Virtual Studio
                          </option>
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 4,
                          }}
                        >
                          Enrollment Status:
                        </label>
                        <select
                          value={studentForm.status}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              status: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            background: "white",
                            fontSize: 13,
                          }}
                        >
                          <option value="active">
                            Active (Currently Enrolled)
                          </option>
                          <option value="graduated">
                            Graduated (Completed Program)
                          </option>
                          <option value="suspended">
                            Suspended / On Leave
                          </option>
                        </select>
                      </div>

                      {/* Student Portal Account Security */}
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          marginTop: 8,
                          padding: 12,
                          background: "#fbfaf8",
                          borderRadius: 8,
                          border: "1px solid var(--line)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <label
                            style={{
                              display: "block",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--navy)",
                            }}
                          >
                            Student Portal Login &amp; Password
                          </label>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 4,
                              background:
                                studentForm.status === "suspended"
                                  ? "#fee2e2"
                                  : "#dcfce7",
                              color:
                                studentForm.status === "suspended"
                                  ? "#991b1b"
                                  : "#166534",
                            }}
                          >
                            Portal Access:{" "}
                            {studentForm.status === "suspended"
                              ? "Disabled"
                              : "Active"}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={studentForm.password}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              password: e.target.value,
                            })
                          }
                          placeholder="Type new password to reset portal login (or leave blank)"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            background: "white",
                            fontSize: 13,
                          }}
                        />
                        <small
                          style={{
                            display: "block",
                            color: "var(--muted)",
                            fontSize: 11,
                            marginTop: 4,
                          }}
                        >
                          Setting status to &ldquo;Suspended&rdquo; disables
                          portal login. Entering a password here updates
                          credentials on save.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Programs & Courses Details */}
              {title === "Programs & Courses" && (
                <div>
                  <div
                    style={{
                      background: "#faf9f7",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "16px 20px",
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: "rgba(201, 107, 50, 0.15)",
                            color: "#a24a18",
                          }}
                        >
                          {selectedRecord.category || "Instrument Tuition"}
                        </span>
                        {selectedRecord.tag && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: "#f1f5f9",
                              color: "#475569",
                            }}
                          >
                            {selectedRecord.tag}
                          </span>
                        )}
                      </div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 700,
                          color: "var(--navy)",
                        }}
                      >
                        {selectedRecord.name}
                      </h3>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            selectedRecord.is_active !== 0
                              ? "rgba(21, 112, 84, 0.12)"
                              : "rgba(220, 38, 38, 0.1)",
                          color:
                            selectedRecord.is_active !== 0
                              ? "var(--green)"
                              : "#dc2626",
                        }}
                      >
                        {selectedRecord.is_active !== 0
                          ? "Active Program"
                          : "Inactive / Archived"}
                      </span>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 16,
                          fontWeight: 700,
                          color: "var(--gold)",
                        }}
                      >
                        {selectedRecord.fee || "₦20,000 / month"}
                      </div>
                    </div>
                  </div>

                  <div className="doc-grid" style={{ margin: "0 0 16px" }}>
                    <div>
                      <small>Curriculum Category</small>
                      <strong>
                        {selectedRecord.category || "Instruments"}
                      </strong>
                    </div>
                    <div>
                      <small>Tuition Fee Schedule</small>
                      <strong style={{ color: "var(--navy)" }}>
                        {selectedRecord.fee || "₦20,000 / month"}
                      </strong>
                    </div>
                    <div>
                      <small>Term Duration</small>
                      <strong>
                        {selectedRecord.duration || "1–12 Months (Modular)"}
                      </strong>
                    </div>
                    <div>
                      <small>Available Delivery Modes</small>
                      <strong>
                        {selectedRecord.modes ||
                          "Studio · Home Lessons · Online"}
                      </strong>
                    </div>
                    <div>
                      <small>Target Age Group</small>
                      <strong>{selectedRecord.age_group || "All Ages"}</strong>
                    </div>
                    <div>
                      <small>Entry Skill Level</small>
                      <strong>
                        {selectedRecord.level || "Beginner to Advanced"}
                      </strong>
                    </div>
                  </div>

                  {/* Course Description & Syllabus Highlights */}
                  <div
                    style={{
                      borderTop: "1px solid var(--line)",
                      paddingTop: 16,
                      marginTop: 8,
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 8px",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--muted)",
                      }}
                    >
                      Syllabus &amp; Course Highlights
                    </h4>
                    <div
                      style={{
                        background: "#faf9f7",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        padding: "14px 18px",
                        fontSize: 13.5,
                        lineHeight: 1.6,
                        color: "#374151",
                      }}
                    >
                      {selectedRecord.desc || (
                        <span
                          style={{ color: "var(--muted)", fontStyle: "italic" }}
                        >
                          No extended syllabus description provided for this
                          course. Click &ldquo;Edit Course Details&rdquo; below
                          to update learning objectives, repertoire notes, and
                          exam accreditation details.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructors Details */}
              {title === "Instructors" && (
                <div>
                  <div
                    style={{
                      background: "#faf9f7",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "16px 20px",
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: selectedRecord.is_director
                            ? "rgba(201, 107, 50, 0.15)"
                            : "#f1f5f9",
                          color: selectedRecord.is_director
                            ? "#a24a18"
                            : "#475569",
                          display: "inline-block",
                          marginBottom: 4,
                        }}
                      >
                        {selectedRecord.is_director
                          ? "Artistic Director & Faculty Lead"
                          : "Faculty Instructor"}
                      </span>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 700,
                          color: "var(--navy)",
                        }}
                      >
                        {selectedRecord.name}
                      </h3>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        {selectedRecord.title}
                      </div>
                    </div>

                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            selectedRecord.is_active !== 0
                              ? "rgba(21, 112, 84, 0.12)"
                              : "rgba(220, 38, 38, 0.1)",
                          color:
                            selectedRecord.is_active !== 0
                              ? "var(--green)"
                              : "#dc2626",
                        }}
                      >
                        {selectedRecord.is_active !== 0
                          ? "Active Faculty"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="doc-grid" style={{ margin: "0 0 16px" }}>
                    <div>
                      <small>Academic Designation</small>
                      <strong>{selectedRecord.title}</strong>
                    </div>
                    <div>
                      <small>Teaching Specialization</small>
                      <strong style={{ color: "var(--navy)" }}>
                        {selectedRecord.specialization}
                      </strong>
                    </div>
                    <div>
                      <small>Studio Campus</small>
                      <strong>
                        {selectedRecord.location || "Kaduna Studio"}
                      </strong>
                    </div>
                    <div>
                      <small>Leadership Status</small>
                      <strong>
                        {selectedRecord.is_director
                          ? "Director / Principal"
                          : "Faculty Member"}
                      </strong>
                    </div>
                  </div>

                  {selectedRecord.bio && (
                    <div
                      style={{
                        borderTop: "1px solid var(--line)",
                        paddingTop: 16,
                        marginTop: 8,
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--muted)",
                        }}
                      >
                        Instructor Biography &amp; Professional Background
                      </h4>
                      <div
                        style={{
                          background: "#faf9f7",
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          padding: "14px 18px",
                          fontSize: 13.5,
                          lineHeight: 1.6,
                          color: "#374151",
                        }}
                      >
                        {selectedRecord.bio}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Performances & Recitals Details */}
              {title === "Performances & Recitals" && (
                <div>
                  <div
                    style={{
                      background: "#faf9f7",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "16px 20px",
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: "rgba(201, 107, 50, 0.15)",
                          color: "#a24a18",
                          display: "inline-block",
                          marginBottom: 4,
                        }}
                      >
                        {selectedRecord.category || "Student Recital"}
                      </span>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 17,
                          fontWeight: 700,
                          color: "var(--navy)",
                        }}
                      >
                        {selectedRecord.title}
                      </h3>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        {selectedRecord.performers}
                      </div>
                    </div>

                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: selectedRecord.is_featured
                            ? "rgba(201, 107, 50, 0.15)"
                            : "#f1f5f9",
                          color: selectedRecord.is_featured
                            ? "var(--gold)"
                            : "var(--muted)",
                        }}
                      >
                        {selectedRecord.is_featured
                          ? "Featured Showcase"
                          : "Archive"}
                      </span>
                    </div>
                  </div>

                  <div className="doc-grid" style={{ margin: "0 0 16px" }}>
                    <div>
                      <small>Featured Performers</small>
                      <strong>{selectedRecord.performers}</strong>
                    </div>
                    <div>
                      <small>Genre / Category</small>
                      <strong>{selectedRecord.category}</strong>
                    </div>
                    <div>
                      <small>Event Showcase Type</small>
                      <strong>{selectedRecord.event_type}</strong>
                    </div>
                    <div>
                      <small>YouTube Video ID</small>
                      <strong
                        style={{
                          fontFamily: "monospace",
                          color: "var(--navy)",
                        }}
                      >
                        {selectedRecord.youtube_id || "—"}
                      </strong>
                    </div>
                  </div>

                  {selectedRecord.youtube_id && (
                    <div style={{ marginBottom: 16 }}>
                      <a
                        href={`https://www.youtube.com/watch?v=${selectedRecord.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          position: "relative",
                          borderRadius: 8,
                          overflow: "hidden",
                          maxHeight: 220,
                          border: "1px solid var(--line)",
                        }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${selectedRecord.youtube_id}/hqdefault.jpg`}
                          alt={selectedRecord.title}
                          style={{
                            width: "100%",
                            height: 220,
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: 14,
                            gap: 8,
                          }}
                        >
                          ▶ Play Video on YouTube
                        </div>
                      </a>
                    </div>
                  )}

                  {selectedRecord.description && (
                    <div
                      style={{
                        borderTop: "1px solid var(--line)",
                        paddingTop: 16,
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "var(--muted)",
                        }}
                      >
                        Recital Notes &amp; Performance Highlights
                      </h4>
                      <div
                        style={{
                          background: "#faf9f7",
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          padding: "14px 18px",
                          fontSize: 13.5,
                          lineHeight: 1.6,
                          color: "#374151",
                        }}
                      >
                        {selectedRecord.description}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Page Footer Action Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 32px",
                borderTop: "1px solid var(--line)",
                background: "#faf8f5",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <Button variant="ghost" onClick={() => setSelectedRecord(null)}>
                ← Return to {title} Table
              </Button>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {renderRecordActions()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Dedicated Pages ────────────────────────────────────────── */}
      {showLetterModal && selectedRecord && (
        <AdmissionLetterModal
          data={selectedRecord}
          isPage
          onClose={() => {
            setShowLetterModal(false)
            if (openedLetterFromTable) {
              setSelectedRecord(null)
              setOpenedLetterFromTable(false)
            }
          }}
        />
      )}

      {showReceiptModal && selectedRecord && (
        <PaymentReceiptModal
          data={selectedRecord}
          isPage
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* ── Add Course / Instructor Dedicated Page ──────────────────────────── */}
      {showAddModal && (
        <div
          className="admin-page-view"
          style={{
            maxWidth: 920,
            margin: "0 auto 30px",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--line)",
                background: "#faf8f5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "white",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--navy)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ← Back to {title} Table
                </button>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>/</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Create New Record
                </span>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--navy)",
                }}
              >
                {title === "Instructors"
                  ? "Add New Faculty Instructor"
                  : title === "Performances & Recitals"
                    ? "Add Recital Video Showcase"
                    : "Create New Course Program"}
              </h2>
            </div>

            {title === "Programs & Courses" && (
              <form onSubmit={handleAddProgram}>
                <div style={{ padding: "28px 32px" }}>
                  <Field
                    id="add-p-name"
                    label="Course Name"
                    value={newCourse.name}
                    onChange={(v) => setNewCourse({ ...newCourse, name: v })}
                    placeholder="e.g. Jazz Trumpet & Improvisation"
                    required
                  />
                  <div className="form-grid">
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 5,
                        }}
                      >
                        Category
                      </label>
                      <select
                        value={newCourse.category}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            category: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          minHeight: 40,
                          borderRadius: 6,
                          border: "1px solid #cbd4d9",
                          padding: "0 10px",
                          background: "white",
                          fontSize: 13,
                        }}
                      >
                        <option value="Instruments">Instruments</option>
                        <option value="Vocals">Vocals</option>
                        <option value="Production">
                          Production &amp; Tech
                        </option>
                        <option value="Theory">
                          Theory &amp; Musicianship
                        </option>
                      </select>
                    </div>
                    <Field
                      id="add-p-fee"
                      label="Fee Schedule"
                      value={newCourse.fee}
                      onChange={(v) => setNewCourse({ ...newCourse, fee: v })}
                      placeholder="e.g. ₦35,000 / month"
                    />
                  </div>
                  <Field
                    id="add-p-desc"
                    label="Course Description"
                    value={newCourse.desc}
                    onChange={(v) => setNewCourse({ ...newCourse, desc: v })}
                    placeholder="Syllabus highlights, techniques covered..."
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    padding: "18px 32px",
                    borderTop: "1px solid var(--line)",
                    background: "#faf8f5",
                  }}
                >
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Publish to Course Catalog</Button>
                </div>
              </form>
            )}

            {title === "Instructors" && (
              <form onSubmit={handleAddInstructor}>
                <div style={{ padding: "28px 32px" }}>
                  <Field
                    id="add-i-name"
                    label="Instructor Full Name"
                    value={newInstructor.name}
                    onChange={(v) =>
                      setNewInstructor({ ...newInstructor, name: v })
                    }
                    placeholder="e.g. Emmanuel Danjuma"
                    required
                  />
                  <div className="form-grid">
                    <Field
                      id="add-i-title"
                      label="Title / Position"
                      value={newInstructor.title}
                      onChange={(v) =>
                        setNewInstructor({ ...newInstructor, title: v })
                      }
                      placeholder="e.g. Senior Piano Faculty"
                    />
                    <Field
                      id="add-i-spec"
                      label="Specialization"
                      value={newInstructor.specialization}
                      onChange={(v) =>
                        setNewInstructor({
                          ...newInstructor,
                          specialization: v,
                        })
                      }
                      placeholder="e.g. Classical & Jazz Piano"
                    />
                  </div>
                  <div className="form-grid">
                    <Field
                      id="add-i-loc"
                      label="Primary Studio Location"
                      value={newInstructor.location}
                      onChange={(v) =>
                        setNewInstructor({ ...newInstructor, location: v })
                      }
                      placeholder="Kaduna Studio"
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 24,
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!newInstructor.is_director}
                          onChange={(e) =>
                            setNewInstructor({
                              ...newInstructor,
                              is_director: e.target.checked ? 1 : 0,
                            })
                          }
                        />
                        Executive / Artistic Director Profile
                      </label>
                    </div>
                  </div>
                  <Field
                    id="add-i-image"
                    label="Instructor Photo / Avatar URL"
                    value={newInstructor.image || ""}
                    onChange={(v) =>
                      setNewInstructor({ ...newInstructor, image: v })
                    }
                    placeholder="e.g. /assets/instructors/dan.jpg or https://..."
                  />
                  <Field
                    id="add-i-bio"
                    label="Biography"
                    value={newInstructor.bio}
                    onChange={(v) =>
                      setNewInstructor({ ...newInstructor, bio: v })
                    }
                    placeholder="Conservatory background, performance history, awards..."
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    padding: "18px 32px",
                    borderTop: "1px solid var(--line)",
                    background: "#faf8f5",
                  }}
                >
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Instructor Profile</Button>
                </div>
              </form>
            )}

            {title === "Performances & Recitals" && (
              <form onSubmit={handleAddPerformance}>
                <div style={{ padding: "28px 32px" }}>
                  <Field
                    id="add-pf-title"
                    label="Performance Title"
                    value={newPerformance.title}
                    onChange={(v) =>
                      setNewPerformance({ ...newPerformance, title: v })
                    }
                    placeholder="e.g. Chopin Nocturne in C Minor"
                    required
                  />
                  <div className="form-grid">
                    <Field
                      id="add-pf-perf"
                      label="Performer / Student Name"
                      value={newPerformance.performer}
                      onChange={(v) =>
                        setNewPerformance({ ...newPerformance, performer: v })
                      }
                      placeholder="e.g. Chinedu Okafor (Grade 3 Piano)"
                    />
                    <Field
                      id="add-pf-prog"
                      label="Associated Course"
                      value={newPerformance.program}
                      onChange={(v) =>
                        setNewPerformance({ ...newPerformance, program: v })
                      }
                      placeholder="Piano & Keyboard Mastery"
                    />
                  </div>
                  <div className="form-grid">
                    <Field
                      id="add-pf-yid"
                      label="YouTube URL or Video ID"
                      value={newPerformance.youtube_id}
                      onChange={(v) =>
                        setNewPerformance({ ...newPerformance, youtube_id: v })
                      }
                      placeholder="https://youtu.be/... or 11-char ID"
                      required
                    />
                    <Field
                      id="add-pf-date"
                      label="Recital Date / Term Label"
                      value={newPerformance.date_label}
                      onChange={(v) =>
                        setNewPerformance({ ...newPerformance, date_label: v })
                      }
                      placeholder="Annual Studio Recital 2026"
                    />
                  </div>
                  <Field
                    id="add-pf-desc"
                    label="Description & Highlights"
                    value={newPerformance.description}
                    onChange={(v) =>
                      setNewPerformance({ ...newPerformance, description: v })
                    }
                    placeholder="Performance context, milestone celebration..."
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    padding: "18px 32px",
                    borderTop: "1px solid var(--line)",
                    background: "#faf8f5",
                  }}
                >
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Publish Recital Video</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Course Dedicated Page ─────────────────────────────────────── */}
      {showEditModal && editCourse && (
        <div
          className="admin-page-view"
          style={{
            maxWidth: 920,
            margin: "0 auto 30px",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--line)",
                background: "#faf8f5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditCourse(null)
                  }}
                  style={{
                    background: "white",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--navy)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ← Back to Programs & Courses Table
                </button>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>/</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Edit Course
                </span>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--navy)",
                }}
              >
                Edit Course: {editCourse.name}
              </h2>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const res = await saveProgram(editCourse)
                if (res && res.success) {
                  setShowEditModal(false)
                  setEditCourse(null)
                  setActionNotice(`Course "${editCourse.name}" updated.`)
                  loadData()
                }
              }}
            >
              <div style={{ padding: "28px 32px" }}>
                <Field
                  id="edit-p-name"
                  label="Course Name"
                  value={editCourse.name}
                  onChange={(v) => setEditCourse({ ...editCourse, name: v })}
                  required
                />
                <div className="form-grid">
                  <Field
                    id="edit-p-cat"
                    label="Category"
                    value={editCourse.category}
                    onChange={(v) =>
                      setEditCourse({ ...editCourse, category: v })
                    }
                  />
                  <Field
                    id="edit-p-fee"
                    label="Fee Schedule"
                    value={editCourse.fee}
                    onChange={(v) => setEditCourse({ ...editCourse, fee: v })}
                  />
                </div>
                <Field
                  id="edit-p-desc"
                  label="Description"
                  value={editCourse.desc || ""}
                  onChange={(v) => setEditCourse({ ...editCourse, desc: v })}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 32px",
                  borderTop: "1px solid var(--line)",
                  background: "#faf8f5",
                }}
              >
                <Button
                  variant="ghost"
                  type="button"
                  style={{ color: "#dc2626" }}
                  onClick={() => {
                    setApprovalModal({
                      title: "Deactivate Course Program",
                      message: `Are you sure you want to deactivate "${editCourse.name}"? It will be hidden from the public admissions catalog.`,
                      confirmLabel: "Deactivate Course",
                      confirmTone: "danger",
                      onConfirm: async () => {
                        await deleteProgram(editCourse.id)
                        setShowEditModal(false)
                        setEditCourse(null)
                        setActionNotice("Course removed from catalog.")
                        loadData()
                      },
                    })
                  }}
                >
                  Deactivate Course
                </Button>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditCourse(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Modifications</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Instructor Dedicated Page ──────────────────────────────────── */}
      {showEditModal && editInstructor && (
        <div
          className="admin-page-view"
          style={{
            maxWidth: 920,
            margin: "0 auto 30px",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid var(--line)",
                background: "#faf8f5",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditInstructor(null)
                  }}
                  style={{
                    background: "white",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    padding: "6px 14px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--navy)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  ← Back to Instructors Table
                </button>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>/</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Edit Faculty Member
                </span>
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--navy)",
                }}
              >
                Edit Instructor: {editInstructor.name}
              </h2>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const res = await saveInstructor(editInstructor)
                if (res && res.success) {
                  setShowEditModal(false)
                  setEditInstructor(null)
                  setActionNotice(
                    `Instructor "${editInstructor.name}" updated.`,
                  )
                  loadData()
                }
              }}
            >
              <div style={{ padding: "28px 32px" }}>
                <Field
                  id="edit-i-name"
                  label="Instructor Name"
                  value={editInstructor.name}
                  onChange={(v) =>
                    setEditInstructor({ ...editInstructor, name: v })
                  }
                  required
                />
                <div className="form-grid">
                  <Field
                    id="edit-i-title"
                    label="Title / Position"
                    value={editInstructor.title}
                    onChange={(v) =>
                      setEditInstructor({ ...editInstructor, title: v })
                    }
                  />
                  <Field
                    id="edit-i-spec"
                    label="Specialization"
                    value={editInstructor.specialization}
                    onChange={(v) =>
                      setEditInstructor({
                        ...editInstructor,
                        specialization: v,
                      })
                    }
                  />
                </div>
                <Field
                  id="edit-i-image"
                  label="Instructor Photo / Avatar URL"
                  value={editInstructor.image || ""}
                  onChange={(v) =>
                    setEditInstructor({ ...editInstructor, image: v })
                  }
                  placeholder="e.g. /assets/instructors/dan.jpg or https://..."
                />
                <Field
                  id="edit-i-bio"
                  label="Biography"
                  value={editInstructor.bio || ""}
                  onChange={(v) =>
                    setEditInstructor({ ...editInstructor, bio: v })
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 32px",
                  borderTop: "1px solid var(--line)",
                  background: "#faf8f5",
                }}
              >
                <Button
                  variant="ghost"
                  type="button"
                  style={{
                    color:
                      editInstructor.is_active === 0 ? "#166534" : "#dc2626",
                  }}
                  onClick={() => {
                    const action =
                      editInstructor.is_active === 0 ? "activate" : "deactivate"
                    setApprovalModal({
                      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Instructor Profile`,
                      message: `${action.charAt(0).toUpperCase() + action.slice(1)} profile for "${editInstructor.name}"? (Profile will be preserved)`,
                      confirmLabel: `${action.charAt(0).toUpperCase() + action.slice(1)} Profile`,
                      confirmTone: action === "activate" ? "success" : "danger",
                      onConfirm: async () => {
                        await toggleInstructorStatus(editInstructor.id)
                        setShowEditModal(false)
                        setEditInstructor(null)
                        setActionNotice(
                          `Instructor profile ${action}d (preserved).`,
                        )
                        loadData()
                      },
                    })
                  }}
                >
                  {editInstructor.is_active === 0
                    ? "Activate Profile"
                    : "Deactivate Profile"}
                </Button>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditInstructor(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Modifications</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Action Approval Modal (Small confirmation dialog) ───────────────── */}
      {approvalModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setApprovalModal(null)
          }}
        >
          <div
            className="modal-card"
            style={{
              maxWidth: 440,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                padding: "24px 28px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background:
                    approvalModal.confirmTone === "danger"
                      ? "rgba(220, 38, 38, 0.12)"
                      : approvalModal.confirmTone === "success"
                        ? "rgba(21, 112, 84, 0.12)"
                        : "rgba(201, 107, 50, 0.12)",
                  color:
                    approvalModal.confirmTone === "danger"
                      ? "#dc2626"
                      : approvalModal.confirmTone === "success"
                        ? "#15803d"
                        : "var(--gold)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {approvalModal.confirmTone === "danger"
                  ? "✕"
                  : approvalModal.confirmTone === "success"
                    ? "✓"
                    : "ℹ"}
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--navy)",
                  }}
                >
                  {approvalModal.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {approvalModal.message}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "16px 28px",
                background: "#faf8f5",
                borderTop: "1px solid var(--line)",
              }}
            >
              <Button variant="ghost" onClick={() => setApprovalModal(null)}>
                Cancel
              </Button>
              <Button
                style={{
                  background:
                    approvalModal.confirmTone === "danger"
                      ? "#dc2626"
                      : approvalModal.confirmTone === "success"
                        ? "#15803d"
                        : "var(--gold)",
                  color: "white",
                  borderColor: "transparent",
                }}
                onClick={async () => {
                  const onConfirm = approvalModal.onConfirm
                  setApprovalModal(null)
                  await onConfirm()
                }}
              >
                {approvalModal.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
