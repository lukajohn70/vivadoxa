// ─── Vivadoxa Student & Client Portal Dashboard ──────────────────────────────
import React, { useState, useEffect } from "react"
import { Logo, Button, Icon, Badge, Field, WhatsAppIcon } from "@/components/ui"
import {
  checkUserSession,
  logoutUser,
  fetchUserPortalData,
  approveRepairEstimate,
  updateUserProfile,
  submitScheduleRequest,
  type PortalUser,
  type PortalData,
} from "@/lib/api"
import {
  AdmissionLetterModal,
  PaymentReceiptModal,
  ApplicationSlipModal,
} from "@/components/OfficialDocument"
import type { Page } from "@/types"

export function Portal({ go }: { go: (p: Page | string) => void }) {
  const [user, setUser] = useState<PortalUser | null>(null)
  const [portalData, setPortalData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] =
    useState<"courses" | "payments" | "repairs" | "profile">("courses")

  // Modals
  const [slipData, setSlipData] = useState<any | null>(null)
  const [letterData, setLetterData] = useState<any | null>(null)
  const [receiptData, setReceiptData] = useState<any | null>(null)

  // Profile update form
  const [profileName, setProfileName] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [profileAddress, setProfileAddress] = useState("")
  const [profileGuardian, setProfileGuardian] = useState("")
  const [profileGuardianPhone, setProfileGuardianPhone] = useState("")
  const [profilePassword, setProfilePassword] = useState("")
  const [profileNotice, setProfileNotice] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)

  // Action toast notice
  const [actionNotice, setActionNotice] = useState("")

  // Schedule & Absence modal
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedProgramForSchedule, setSelectedProgramForSchedule] =
    useState<any | null>(null)
  const [schedType, setSchedType] =
    useState<"absence_travel" | "one_off_reschedule" | "permanent_change">(
      "absence_travel",
    )
  const [schedAffectedDate, setSchedAffectedDate] = useState("")
  const [schedReturnDate, setSchedReturnDate] = useState("")
  const [schedReason, setSchedReason] = useState("Traveling out of town")
  const [schedMakeup, setSchedMakeup] = useState(true)
  const [schedPreferredSlot, setSchedPreferredSlot] = useState(
    "Wednesday afternoon (4:00 PM)",
  )
  const [schedNotes, setSchedNotes] = useState("")
  const [schedSubmitting, setSchedSubmitting] = useState(false)
  const [schedSuccessMsg, setSchedSuccessMsg] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const activeUser = await checkUserSession()
      if (!activeUser) {
        go("portal-login")
        return
      }
      setUser(activeUser)
      setProfileName(activeUser.full_name)
      setProfilePhone(activeUser.phone)
      setProfileAddress(activeUser.address || "")
      setProfileGuardian(activeUser.guardian_name || "")
      setProfileGuardianPhone(activeUser.guardian_phone || "")

      const res = await fetchUserPortalData(activeUser.email)
      if (res && res.success && res.portal) {
        setPortalData(res.portal)
      }
    } catch {
      // Fallback or error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleLogout() {
    await logoutUser()
    setUser(null)
    go("home")
  }

  async function handleApproveRepair(code: string) {
    const res = await approveRepairEstimate(code)
    if (res.success) {
      setActionNotice(res.message || "Repair estimate approved!")
      loadData()
      setTimeout(() => setActionNotice(""), 4000)
    }
  }

  async function handleSendScheduleRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProgramForSchedule || !user) return

    setSchedSubmitting(true)
    setSchedSuccessMsg("")
    try {
      const res = await submitScheduleRequest({
        student_name: user.full_name,
        student_email: user.email,
        student_phone: user.phone,
        program: selectedProgramForSchedule.program,
        request_type: schedType,
        current_schedule:
          selectedProgramForSchedule.schedule || "Saturday Cohort (10am–12pm)",
        affected_date: schedAffectedDate || undefined,
        return_date:
          schedType === "absence_travel"
            ? schedReturnDate || undefined
            : undefined,
        reason: schedReason,
        makeup_requested: schedMakeup,
        preferred_makeup_slot: schedMakeup ? schedPreferredSlot : undefined,
        notes: schedNotes,
      })

      if (res.success) {
        setSchedSuccessMsg(
          "Schedule notice submitted successfully! Admissions & instructors have been notified.",
        )
        setTimeout(() => {
          setShowScheduleModal(false)
          setSchedSuccessMsg("")
          loadData()
        }, 2200)
      } else {
        alert(res.error || "Failed to submit schedule notice.")
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.")
    } finally {
      setSchedSubmitting(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileNotice("")
    try {
      const res = await updateUserProfile({
        full_name: profileName,
        phone: profilePhone,
        address: profileAddress,
        guardian_name: profileGuardian,
        guardian_phone: profileGuardianPhone,
        ...(profilePassword.trim() ? { password: profilePassword.trim() } : {}),
      })
      if (res.success && res.user) {
        setUser(res.user)
        setProfilePassword("")
        setProfileNotice("Profile details updated successfully!")
        setTimeout(() => setProfileNotice(""), 4000)
      }
    } catch {
      setProfileNotice("Failed to update profile.")
    } finally {
      setProfileSaving(false)
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f5f0",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Logo />
          <p style={{ marginTop: 16, color: "var(--muted)", fontSize: 14 }}>
            Opening your Vivadoxa Portal…
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const applications = portalData?.applications || []
  const payments = portalData?.payments || []
  const repairs = portalData?.repairs || []
  const students = portalData?.students || []
  const financials = portalData?.financials || {
    total_invoiced: 0,
    total_paid: 0,
    balance_due: 0,
    formatted_invoiced: "₦0.00",
    formatted_paid: "₦0.00",
    formatted_balance: "₦0.00",
  }

  return (
    <main
      style={{ minHeight: "100vh", background: "#f2f0e9", paddingBottom: 60 }}
    >
      {/* Top Portal Navigation Bar */}
      <header className="bg-[var(--navy)] text-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10">
        <div className="container flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => go("home")}
              className="logo-button cursor-pointer"
              aria-label="Vivadoxa Home"
            >
              <Logo light />
            </button>
            <span className="hidden sm:inline-block h-5 w-px bg-white/20" />
            <span className="text-xs sm:text-[13px] font-bold tracking-wide text-[var(--gold-text-dark)] uppercase">
              STUDENT &amp; CLIENT PORTAL
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-white/10 sm:border-t-0">
            <div className="flex items-center gap-2.5 text-left sm:text-right min-w-0">
              <span
                className="w-9 h-9 rounded-full bg-[var(--gold)] text-white grid place-items-center font-bold text-xs shrink-0 order-first sm:order-last"
                aria-hidden="true"
              >
                {user.full_name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <strong className="block text-xs sm:text-[13px] font-bold truncate max-w-[170px] sm:max-w-[200px]">
                  {user.full_name}
                </strong>
                <small className="block text-[10px] sm:text-[11px] text-[#9dafbc] truncate max-w-[170px] sm:max-w-[200px]">
                  {user.email}
                </small>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-md text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ marginTop: 28 }}>
        {/* Toast notice */}
        {actionNotice && (
          <div
            style={{
              padding: "12px 18px",
              background: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: 8,
              color: "#166534",
              marginBottom: 20,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ✓ {actionNotice}
          </div>
        )}

        {/* Welcome & Overview Banner */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: "24px 28px",
            border: "1px solid var(--line)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <h1 style={{ fontSize: 24, margin: 0, fontWeight: 700 }}>
                Welcome, {user.full_name.split(" ")[0]}
              </h1>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  background: "rgba(201, 107, 50, 0.15)",
                  color: "#a24a18",
                }}
              >
                {applications.length > 0 && repairs.length > 0
                  ? "Academy Student & Workshop Client"
                  : repairs.length > 0
                    ? "Instrument Workshop Client"
                    : "Music Academy Student"}
              </span>
            </div>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
              Here is your centralized academic, tuition, and repair maintenance
              ledger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <Button variant="secondary" onClick={() => go("repairs")}>
              Book Instrument Repair
            </Button>
            <Button variant="primary" onClick={() => go("apply")}>
              + Apply for New Program
            </Button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div
            style={{
              background: "white",
              borderRadius: 10,
              padding: 20,
              border: "1px solid var(--line)",
            }}
          >
            <small
              style={{
                color: "var(--muted)",
                textTransform: "uppercase",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              Active Programs &amp; Applications
            </small>
            <strong
              style={{
                display: "block",
                fontSize: 28,
                color: "var(--navy)",
                marginTop: 4,
              }}
            >
              {applications.length}
            </strong>
            <span style={{ fontSize: 11, color: "#157054", fontWeight: 600 }}>
              {students.length > 0
                ? `${students.length} Enrolled Student Cohort`
                : "Applications in Review"}
            </span>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 10,
              padding: 20,
              border: "1px solid var(--line)",
            }}
          >
            <small
              style={{
                color: "var(--muted)",
                textTransform: "uppercase",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              Active Instrument Repairs
            </small>
            <strong
              style={{
                display: "block",
                fontSize: 28,
                color: "#1f6ea5",
                marginTop: 4,
              }}
            >
              {repairs.length}
            </strong>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {repairs.filter((r) => r.status === "ready").length} Ready for
              Collection
            </span>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 10,
              padding: 20,
              border: "1px solid var(--line)",
            }}
          >
            <small
              style={{
                color: "var(--muted)",
                textTransform: "uppercase",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              Verified Tuition Paid
            </small>
            <strong
              style={{
                display: "block",
                fontSize: 24,
                color: "#157054",
                marginTop: 4,
              }}
            >
              {financials.formatted_paid}
            </strong>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {payments.filter((p) => p.status === "verified").length} Verified
              Receipts
            </span>
          </div>

          <div
            style={{
              background:
                financials.balance_due > 0
                  ? "rgba(201, 107, 50, 0.08)"
                  : "white",
              borderRadius: 10,
              padding: 20,
              border:
                financials.balance_due > 0
                  ? "1px solid rgba(201, 107, 50, 0.3)"
                  : "1px solid var(--line)",
            }}
          >
            <small
              style={{
                color: "var(--muted)",
                textTransform: "uppercase",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              Tuition Balance Outstanding
            </small>
            <strong
              style={{
                display: "block",
                fontSize: 24,
                color: financials.balance_due > 0 ? "#a24a18" : "#157054",
                marginTop: 4,
              }}
            >
              {financials.formatted_balance}
            </strong>
            {financials.balance_due > 0 ? (
              <button
                type="button"
                onClick={() => go("payment")}
                style={{
                  marginTop: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  background: "var(--gold)",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Pay Balance Online ↗
              </button>
            ) : (
              <span style={{ fontSize: 11, color: "#157054", fontWeight: 600 }}>
                ✓ All Invoices Settled
              </span>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: 8,
            borderBottom: "1px solid var(--line)",
            marginBottom: 24,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("courses")}
            style={{
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: 700,
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "courses"
                  ? "3px solid var(--gold)"
                  : "3px solid transparent",
              color:
                activeTab === "courses" ? "var(--gold-text)" : "var(--muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            My Programs &amp; Admission ({applications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            style={{
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: 700,
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "payments"
                  ? "3px solid var(--gold)"
                  : "3px solid transparent",
              color:
                activeTab === "payments" ? "var(--gold-text)" : "var(--muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Tuition &amp; Payments ({payments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("repairs")}
            style={{
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: 700,
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "repairs"
                  ? "3px solid var(--gold)"
                  : "3px solid transparent",
              color:
                activeTab === "repairs" ? "var(--gold-text)" : "var(--muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Instrument Repairs ({repairs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "12px 18px",
              fontSize: 13,
              fontWeight: 700,
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "profile"
                  ? "3px solid var(--gold)"
                  : "3px solid transparent",
              color:
                activeTab === "profile" ? "var(--gold-text)" : "var(--muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Profile &amp; Settings
          </button>
        </div>

        {/* TAB 1: PROGRAMS & ADMISSION */}
        {activeTab === "courses" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {applications.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 10,
                  padding: 40,
                  textAlign: "center",
                  border: "1px solid var(--line)",
                }}
              >
                <Icon name="music" size={36} className="text-amber-600 mb-3" />
                <h3 style={{ margin: "8px 0" }}>No Academy Applications Yet</h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    maxWidth: 440,
                    margin: "0 auto 18px",
                  }}
                >
                  Discover our instrumental and vocal masterclasses. Select a
                  course and submit an application to start your musical
                  journey.
                </p>
                <Button onClick={() => go("apply")}>
                  Browse Courses &amp; Apply Now
                </Button>
              </div>
            ) : (
              applications.map((app) => {
                const isApproved = app.status === "approved"
                return (
                  <div
                    key={app.id}
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 24,
                      border: "1px solid var(--line)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 14,
                        marginBottom: 16,
                        paddingBottom: 16,
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--gold-text)",
                              background: "#fef3c7",
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {app.application_no}
                          </span>
                          <h3 style={{ margin: 0, fontSize: 18 }}>
                            {app.program}
                          </h3>
                        </div>
                        <small style={{ color: "var(--muted)" }}>
                          Mode: <strong>{app.study_mode}</strong> (
                          {app.skill_level}) · Submitted on{" "}
                          {new Date(app.created_at).toLocaleDateString()}
                        </small>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background:
                              app.status === "approved"
                                ? "#dcfce7"
                                : app.status === "rejected"
                                  ? "#fee2e2"
                                  : "#fef9c3",
                            color:
                              app.status === "approved"
                                ? "#166534"
                                : app.status === "rejected"
                                  ? "#991b1b"
                                  : "#854d0e",
                          }}
                        >
                          {app.status === "approved"
                            ? "✓ Admission Approved"
                            : app.status === "rejected"
                              ? "Application Declined"
                              : "● Pending Committee Review"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4 text-xs">
                      <div>
                        <small
                          style={{
                            display: "block",
                            color: "var(--muted)",
                            fontSize: 11,
                          }}
                        >
                          Tuition Fee Schedule
                        </small>
                        <strong>
                          ₦{Number(app.tuition_fee || 20000).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <small
                          style={{
                            display: "block",
                            color: "var(--muted)",
                            fontSize: 11,
                          }}
                        >
                          Primary Campus
                        </small>
                        <strong>Kaduna Studio, Nigeria</strong>
                      </div>
                      <div>
                        <small
                          style={{
                            display: "block",
                            color: "var(--muted)",
                            fontSize: 11,
                          }}
                        >
                          Contact On File
                        </small>
                        <span>{app.phone}</span>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 14,
                        borderTop: "1px solid #f1f5f9",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProgramForSchedule(app)
                            setSchedAffectedDate("")
                            setSchedReturnDate("")
                            setSchedNotes("")
                            setShowScheduleModal(true)
                          }}
                          style={{
                            padding: "7px 14px",
                            fontSize: 12,
                            fontWeight: 700,
                            background: "#f4f2ec",
                            color: "var(--navy)",
                            border: "1px solid var(--line)",
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Icon name="calendar" size={14} />
                          Reschedule / Report Absence
                        </button>

                        <button
                          type="button"
                          onClick={() => setSlipData(app)}
                          style={{
                            padding: "7px 14px",
                            fontSize: 12,
                            fontWeight: 700,
                            background: "transparent",
                            color: "var(--navy)",
                            border: "1px solid var(--line)",
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Icon name="copy" size={14} />
                          Download Application Slip
                        </button>

                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => setLetterData(app)}
                            style={{
                              padding: "7px 14px",
                              fontSize: 12,
                              fontWeight: 700,
                              background: "var(--navy)",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Icon name="academic" size={14} />
                            View Official Admission Letter
                          </button>
                        )}
                        <a
                          href={`https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Admissions,%20I%20am%20following%20up%20on%20my%20application%20(${app.application_no})%20for%20${encodeURIComponent(app.program)}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: "7px 14px",
                            fontSize: 12,
                            fontWeight: 700,
                            background: "rgba(37, 211, 102, 0.14)",
                            color: "#075e54",
                            border: "1px solid rgba(37, 211, 102, 0.35)",
                            borderRadius: 6,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <WhatsAppIcon size={14} fill="#075e54" />
                          Chat with Admissions Desk
                        </a>
                      </div>

                      {financials.balance_due > 0 && (
                        <button
                          type="button"
                          onClick={() => go("payment")}
                          style={{
                            padding: "7px 14px",
                            fontSize: 12,
                            fontWeight: 700,
                            background: "var(--gold)",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Pay Tuition ₦
                          {Number(app.tuition_fee || 20000).toLocaleString()} ↗
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}

            {/* Schedule & Reschedule Requests Audit */}
            {portalData?.schedule_requests &&
              portalData.schedule_requests.length > 0 && (
                <div
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 22,
                    border: "1px solid var(--line)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 2px",
                          fontSize: 15,
                          color: "var(--navy)",
                        }}
                      >
                        Schedule Updates &amp; Makeup Lessons
                      </h4>
                      <small style={{ color: "var(--muted)" }}>
                        Log of your reported travel notices, lesson absences,
                        and catch-up allocations.
                      </small>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {portalData.schedule_requests.map((req: any) => (
                      <div
                        key={req.id}
                        style={{
                          padding: 14,
                          background: "#faf9f6",
                          borderRadius: 8,
                          border: "1px solid var(--line)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: 10,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 260 }}>
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
                                padding: "2px 8px",
                                borderRadius: 4,
                                background:
                                  req.request_type === "absence_travel"
                                    ? "#e0f2fe"
                                    : "#fef3c7",
                                color:
                                  req.request_type === "absence_travel"
                                    ? "#0369a1"
                                    : "#92400e",
                              }}
                            >
                              {req.request_type === "absence_travel"
                                ? "Travel / Absence Notice"
                                : req.request_type === "one_off_reschedule"
                                  ? "One-Off Reschedule"
                                  : "Cohort Transfer"}
                            </span>
                            <strong style={{ fontSize: 13 }}>
                              {req.program}
                            </strong>
                          </div>
                          <p
                            style={{
                              margin: "4px 0",
                              fontSize: 12,
                              color: "var(--navy)",
                            }}
                          >
                            <strong>Date Affected:</strong>{" "}
                            {req.affected_date || "Upcoming session"}{" "}
                            {req.return_date ? `until ${req.return_date}` : ""}{" "}
                            · <em>Reason: {req.reason}</em>
                          </p>
                          {req.status === "approved" &&
                            req.allocated_makeup_date && (
                              <div
                                style={{
                                  marginTop: 8,
                                  padding: "8px 12px",
                                  background: "#dcfce7",
                                  border: "1px solid #86efac",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  color: "#166534",
                                }}
                              >
                                <strong>✓ Catch-Up Session Allocated:</strong>{" "}
                                {new Date(
                                  req.allocated_makeup_date,
                                ).toLocaleString()}{" "}
                                ({req.allocated_room || "Studio Room 1"})
                                {req.staff_notes && (
                                  <span
                                    style={{
                                      display: "block",
                                      marginTop: 2,
                                      fontSize: 11,
                                      color: "#15803d",
                                    }}
                                  >
                                    Instructor Note: {req.staff_notes}
                                  </span>
                                )}
                              </div>
                            )}
                          {req.status === "pending" && (
                            <small
                              style={{
                                color: "var(--muted)",
                                display: "block",
                                marginTop: 4,
                              }}
                            >
                              Our admissions desk and instructors have been
                              alerted. We will confirm your catch-up slot
                              shortly.
                            </small>
                          )}
                        </div>

                        <div>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background:
                                req.status === "approved"
                                  ? "#dcfce7"
                                  : req.status === "declined"
                                    ? "#fee2e2"
                                    : "#fef9c3",
                              color:
                                req.status === "approved"
                                  ? "#166534"
                                  : req.status === "declined"
                                    ? "#991b1b"
                                    : "#854d0e",
                            }}
                          >
                            {req.status === "approved"
                              ? "Approved"
                              : req.status === "declined"
                                ? "Declined"
                                : "Pending Review"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* TAB 2: TUITION & PAYMENTS */}
        {activeTab === "payments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Top Balance Card */}
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: 24,
                border: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 4px" }}>
                  Tuition &amp; Fees Statement
                </h3>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
                  Verified payments are credited directly to your student
                  registration ledger.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="secondary" onClick={() => go("payment")}>
                  Upload Transfer Proof
                </Button>
                <Button variant="primary" onClick={() => go("payment")}>
                  Pay with Card / Paystack
                </Button>
              </div>
            </div>

            {/* Payments Table */}
            <div
              style={{
                background: "white",
                borderRadius: 10,
                border: "1px solid var(--line)",
                overflow: "hidden",
              }}
            >
              <div className="hidden md:block table-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        background: "#fbfaf8",
                        borderBottom: "1px solid var(--line)",
                        textAlign: "left",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px 18px",
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Reference
                      </th>
                      <th
                        style={{
                          padding: "12px 18px",
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Course / Ref
                      </th>
                      <th
                        style={{
                          padding: "12px 18px",
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Amount
                      </th>
                      <th
                        style={{
                          padding: "12px 18px",
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Method
                      </th>
                      <th
                        style={{
                          padding: "12px 18px",
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "12px 18px",
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          padding: "12px 18px",
                          fontSize: 11,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          textAlign: "right",
                        }}
                      >
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: 40,
                            textAlign: "center",
                            color: "var(--muted)",
                          }}
                        >
                          No payment transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((pay) => (
                        <tr
                          key={pay.id}
                          style={{
                            borderBottom: "1px solid var(--line)",
                            fontSize: 13,
                          }}
                        >
                          <td style={{ padding: "14px 18px" }}>
                            <code>{pay.reference}</code>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            {pay.application_no || "Tuition Registration"}
                          </td>
                          <td
                            style={{
                              padding: "14px 18px",
                              fontWeight: 700,
                              color: "var(--navy)",
                            }}
                          >
                            ₦{Number(pay.amount).toLocaleString()}
                          </td>
                          <td
                            style={{
                              padding: "14px 18px",
                              color: "var(--muted)",
                            }}
                          >
                            {pay.method}
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <span
                              style={{
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                background:
                                  pay.status === "verified"
                                    ? "#dcfce7"
                                    : pay.status === "declined"
                                      ? "#fee2e2"
                                      : "#fef9c3",
                                color:
                                  pay.status === "verified"
                                    ? "#166534"
                                    : pay.status === "declined"
                                      ? "#991b1b"
                                      : "#854d0e",
                              }}
                            >
                              {pay.status === "verified"
                                ? "Verified"
                                : pay.status === "declined"
                                  ? "Declined"
                                  : "Pending Verification"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "14px 18px",
                              color: "var(--muted)",
                              fontSize: 12,
                            }}
                          >
                            {new Date(pay.created_at).toLocaleDateString()}
                          </td>
                          <td
                            style={{ padding: "14px 18px", textAlign: "right" }}
                          >
                            <button
                              type="button"
                              onClick={() => setReceiptData(pay)}
                              style={{
                                padding: "4px 10px",
                                fontSize: 11,
                                fontWeight: 600,
                                background: "#f4f2ec",
                                border: "1px solid var(--line)",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                            >
                              View Official Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Card View */}
              <div className="block md:hidden" style={{ padding: 12 }}>
                {payments.length === 0 ? (
                  <div
                    style={{
                      padding: 24,
                      textAlign: "center",
                      color: "var(--muted)",
                      fontSize: 13,
                    }}
                  >
                    No payment transactions recorded yet.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {payments.map((pay) => (
                      <div
                        key={pay.id}
                        style={{
                          background: "#fbfaf8",
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          padding: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
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
                              {pay.reference}
                            </code>
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--muted)",
                                marginTop: 2,
                              }}
                            >
                              {pay.application_no || "Tuition Registration"}
                            </div>
                          </div>
                          <span
                            style={{
                              padding: "2px 7px",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                              background:
                                pay.status === "verified"
                                  ? "#dcfce7"
                                  : pay.status === "declined"
                                    ? "#fee2e2"
                                    : "#fef9c3",
                              color:
                                pay.status === "verified"
                                  ? "#166534"
                                  : pay.status === "declined"
                                    ? "#991b1b"
                                    : "#854d0e",
                            }}
                          >
                            {pay.status === "verified"
                              ? "Verified"
                              : pay.status === "declined"
                                ? "Declined"
                                : "Pending Verification"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "white",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #ede8de",
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
                            <strong style={{ fontSize: 12 }}>
                              {pay.method}
                            </strong>
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
                              style={{ fontSize: 14, color: "var(--navy)" }}
                            >
                              ₦{Number(pay.amount).toLocaleString()}
                            </strong>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: "1px solid var(--line)",
                            paddingTop: 8,
                          }}
                        >
                          <span style={{ fontSize: 11, color: "var(--muted)" }}>
                            {new Date(pay.created_at).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => setReceiptData(pay)}
                            style={{
                              padding: "5px 12px",
                              fontSize: 11,
                              fontWeight: 600,
                              background: "var(--navy)",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                          >
                            Official Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INSTRUMENT REPAIRS */}
        {activeTab === "repairs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {repairs.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 10,
                  padding: 40,
                  textAlign: "center",
                  border: "1px solid var(--line)",
                }}
              >
                <Icon name="tool" size={36} className="text-amber-600 mb-3" />
                <h3 style={{ margin: "8px 0" }}>
                  No Active Instrument Repairs
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    maxWidth: 440,
                    margin: "0 auto 18px",
                  }}
                >
                  Does your guitar, violin, keyboard, or woodwind instrument
                  need restringing, setup, or electronic repair? Submit an
                  intake ticket to our Kaduna workshop.
                </p>
                <Button onClick={() => go("repairs")}>
                  Book Instrument Service
                </Button>
              </div>
            ) : (
              repairs.map((rep) => {
                const stages = [
                  "received",
                  "assessing",
                  "in_progress",
                  "ready",
                  "collected",
                ]
                const currentIdx = stages.indexOf(rep.status)

                return (
                  <div
                    key={rep.id}
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 24,
                      border: "1px solid var(--line)",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#1f6ea5",
                              background: "#e0f2fe",
                              padding: "2px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {rep.tracking_code}
                          </span>
                          <h3 style={{ margin: 0, fontSize: 18 }}>
                            {rep.instrument}
                          </h3>
                        </div>
                        <small style={{ color: "var(--muted)" }}>
                          Intake:{" "}
                          <strong>
                            {rep.intake_method === "pickup"
                              ? "Logistics Courier Pickup"
                              : "Studio Drop-off"}
                          </strong>{" "}
                          · Intake logged{" "}
                          {new Date(rep.created_at).toLocaleDateString()}
                        </small>
                      </div>

                      <div>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background:
                              rep.status === "ready" ? "#dcfce7" : "#e0f2fe",
                            color:
                              rep.status === "ready" ? "#166534" : "#0369a1",
                          }}
                        >
                          Stage: {rep.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Steps */}
                    <div
                      style={{
                        margin: "20px 0",
                        padding: "16px",
                        background: "#faf9f6",
                        borderRadius: 8,
                        border: "1px solid var(--line)",
                      }}
                    >
                      <small
                        style={{
                          display: "block",
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--muted)",
                          marginBottom: 10,
                        }}
                      >
                        Luthier Workshop Diagnostic Pipeline
                      </small>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          position: "relative",
                        }}
                      >
                        {[
                          { key: "received", label: "1. Intake Received" },
                          { key: "assessing", label: "2. Fault Diagnostic" },
                          {
                            key: "in_progress",
                            label: "3. Service In Progress",
                          },
                          { key: "ready", label: "4. Ready for Collection" },
                        ].map((stage, idx) => {
                          const isDone = currentIdx >= idx
                          const isCurrent = currentIdx === idx
                          return (
                            <div
                              key={stage.key}
                              style={{
                                textAlign: "center",
                                flex: 1,
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: "50%",
                                  background: isDone ? "#157054" : "#cbd5e1",
                                  color: "white",
                                  display: "grid",
                                  placeItems: "center",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  margin: "0 auto 6px",
                                }}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: isCurrent ? 700 : 500,
                                  color: isCurrent ? "#157054" : "var(--muted)",
                                }}
                              >
                                {stage.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4 text-xs">
                      <div>
                        <small
                          style={{
                            display: "block",
                            color: "var(--muted)",
                            fontSize: 11,
                          }}
                        >
                          Reported Issue
                        </small>
                        <p style={{ margin: "2px 0 0", color: "var(--navy)" }}>
                          {rep.issue}
                        </p>
                      </div>
                      <div>
                        <small
                          style={{
                            display: "block",
                            color: "var(--muted)",
                            fontSize: 11,
                          }}
                        >
                          Diagnostic Cost Estimate
                        </small>
                        <strong style={{ fontSize: 16, color: "var(--navy)" }}>
                          {rep.estimated_cost
                            ? `₦${Number(rep.estimated_cost).toLocaleString()}`
                            : "Awaiting Luthier Assessment"}
                        </strong>
                      </div>
                    </div>

                    {/* Cost Quote Approval */}
                    {rep.status === "assessing" && rep.estimated_cost && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#fef3c7] border border-[#fde68a] rounded-lg mb-3.5">
                        <div>
                          <strong style={{ color: "#92400e", fontSize: 13 }}>
                            Diagnostic Quote Ready for Approval:
                          </strong>
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: 12,
                              color: "#78350f",
                            }}
                          >
                            Estimated cost is ₦
                            {Number(rep.estimated_cost).toLocaleString()}.
                            Approve to authorize workshop repairs.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => handleApproveRepair(rep.tracking_code)}
                          className="w-full sm:w-auto shrink-0"
                        >
                          Approve Quote &amp; Start Repair
                        </Button>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                        paddingTop: 12,
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <a
                        href={`https://wa.me/2348031308881?text=Hello%20Vivadoxa%20Workshop,%20I%20am%20inquiring%20about%20my%20repair%20ticket%20(${rep.tracking_code})%20for%20my%20${encodeURIComponent(rep.instrument)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: "6px 12px",
                          fontSize: 11,
                          fontWeight: 700,
                          background: "rgba(37, 211, 102, 0.14)",
                          color: "#075e54",
                          border: "1px solid rgba(37, 211, 102, 0.35)",
                          borderRadius: 6,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <WhatsAppIcon size={14} fill="#075e54" />
                        Chat with Workshop Luthier
                      </a>

                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        Kaduna Studio Workshop · Angwan Sunday
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 4: PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 28,
              border: "1px solid var(--line)",
              maxWidth: 640,
            }}
          >
            <h3 style={{ margin: "0 0 4px" }}>
              Profile &amp; Emergency Contacts
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              Keep your contact details updated to ensure notifications and
              admission letters reach you promptly.
            </p>

            <form
              onSubmit={handleSaveProfile}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {profileNotice && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    borderRadius: 6,
                    color: "#166534",
                    fontSize: 12,
                  }}
                >
                  ✓ {profileNotice}
                </div>
              )}

              <Field
                id="prof-name"
                label="Full Legal Name"
                value={profileName}
                onChange={setProfileName}
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
                    Email Address (Immutable)
                  </label>
                  <input
                    value={user.email}
                    disabled
                    style={{
                      width: "100%",
                      minHeight: 40,
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      padding: "0 10px",
                      background: "#f8f9fa",
                      fontSize: 13,
                      color: "var(--muted)",
                    }}
                  />
                </div>
                <Field
                  id="prof-phone"
                  label="Primary Phone Number"
                  value={profilePhone}
                  onChange={setProfilePhone}
                  required
                />
              </div>

              <Field
                id="prof-addr"
                label="Residential Address (Kaduna)"
                value={profileAddress}
                onChange={setProfileAddress}
                placeholder="Street address and landmark"
              />

              <div
                className="form-grid"
                style={{ paddingTop: 8, borderTop: "1px solid var(--line)" }}
              >
                <Field
                  id="prof-guardian"
                  label="Emergency Contact / Guardian Name"
                  value={profileGuardian}
                  onChange={setProfileGuardian}
                />
                <Field
                  id="prof-guardian-phone"
                  label="Guardian Phone Number"
                  value={profileGuardianPhone}
                  onChange={setProfileGuardianPhone}
                />
              </div>

              <div
                style={{ paddingTop: 8, borderTop: "1px solid var(--line)" }}
              >
                <Field
                  id="prof-pass"
                  label="Update Password (leave blank to keep unchanged)"
                  type="password"
                  placeholder="••••••••••••"
                  value={profilePassword}
                  onChange={setProfilePassword}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 10,
                }}
              >
                <Button type="submit" disabled={profileSaving}>
                  {profileSaving ? "Saving Changes…" : "Update Profile"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Official Application Slip Modal */}
      {slipData && (
        <ApplicationSlipModal
          data={{
            first_name: slipData.first_name,
            last_name: slipData.last_name,
            application_no: slipData.application_no,
            program: slipData.program,
            study_mode: slipData.study_mode,
            skill_level: slipData.skill_level,
            tuition_fee: slipData.tuition_fee,
            created_at: slipData.created_at,
            email: slipData.email,
            phone: slipData.phone,
            address: slipData.address,
            status: slipData.status,
          }}
          onClose={() => setSlipData(null)}
        />
      )}

      {/* Official Admission Letter Modal */}
      {letterData && (
        <AdmissionLetterModal
          data={{
            first_name: letterData.first_name,
            last_name: letterData.last_name,
            application_no: letterData.application_no,
            program: letterData.program,
            study_mode: letterData.study_mode,
            tuition_fee: letterData.tuition_fee,
            created_at: letterData.created_at,
            email: letterData.email,
            phone: letterData.phone,
          }}
          onClose={() => setLetterData(null)}
        />
      )}

      {/* Official Payment Receipt Modal */}
      {receiptData && (
        <PaymentReceiptModal
          data={{
            reference: receiptData.reference,
            application_no: receiptData.application_no,
            payer_name: receiptData.payer_name || user.full_name,
            payer_email: receiptData.payer_email || user.email,
            amount: receiptData.amount,
            method: receiptData.method,
            status: receiptData.status,
            created_at: receiptData.created_at,
          }}
          onClose={() => setReceiptData(null)}
        />
      )}

      {/* Schedule, Absence & Reschedule Request Modal */}
      {showScheduleModal && selectedProgramForSchedule && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowScheduleModal(false)
          }}
        >
          <div className="modal-card" style={{ maxWidth: 580 }}>
            <div className="modal-head">
              <div>
                <h3
                  id="schedule-modal-title"
                  style={{ margin: 0, fontSize: 17 }}
                >
                  Report Absence or Request Reschedule
                </h3>
                <small
                  style={{
                    color: "var(--muted)",
                    display: "block",
                    marginTop: 2,
                  }}
                >
                  {selectedProgramForSchedule.program} · {user?.full_name}
                </small>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowScheduleModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSendScheduleRequest}
              className="modal-body"
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {schedSuccessMsg ? (
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    borderRadius: 8,
                    color: "#166534",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  ✓ {schedSuccessMsg}
                </div>
              ) : (
                <>
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#166534",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>24-Hour Studio Notice Policy:</strong> Vivadoxa
                    music instruction is 1-on-1 and relies on scheduled studio
                    rooms and instructors. Submitting notice at least 24 hours
                    in advance preserves your lesson credit and guarantees
                    priority catch-up slot allocation.
                  </div>

                  {/* Type Selector */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--navy)",
                        marginBottom: 6,
                      }}
                    >
                      What would you like to report?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSchedType("absence_travel")}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          border:
                            schedType === "absence_travel"
                              ? "2px solid var(--navy)"
                              : "1px solid var(--line)",
                          background:
                            schedType === "absence_travel"
                              ? "rgba(10, 25, 47, 0.05)"
                              : "white",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            fontSize: 13,
                            color: "var(--navy)",
                          }}
                        >
                          Travel / Away
                        </strong>
                        <small style={{ color: "var(--muted)", fontSize: 11 }}>
                          Out of town or taking leave
                        </small>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSchedType("one_off_reschedule")}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          border:
                            schedType === "one_off_reschedule"
                              ? "2px solid var(--navy)"
                              : "1px solid var(--line)",
                          background:
                            schedType === "one_off_reschedule"
                              ? "rgba(10, 25, 47, 0.05)"
                              : "white",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            fontSize: 13,
                            color: "var(--navy)",
                          }}
                        >
                          One-Off Reschedule
                        </strong>
                        <small style={{ color: "var(--muted)", fontSize: 11 }}>
                          Move single lesson date
                        </small>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSchedType("permanent_change")}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          border:
                            schedType === "permanent_change"
                              ? "2px solid var(--navy)"
                              : "1px solid var(--line)",
                          background:
                            schedType === "permanent_change"
                              ? "rgba(10, 25, 47, 0.05)"
                              : "white",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            fontSize: 13,
                            color: "var(--navy)",
                          }}
                        >
                          Cohort Change
                        </strong>
                        <small style={{ color: "var(--muted)", fontSize: 11 }}>
                          Switch recurring weekly slot
                        </small>
                      </button>
                    </div>
                  </div>

                  {/* Dates */}
                  <div
                    className={
                      schedType === "absence_travel"
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                        : "grid grid-cols-1 gap-3"
                    }
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--navy)",
                          marginBottom: 4,
                        }}
                      >
                        {schedType === "absence_travel"
                          ? "Departure / Start Date *"
                          : "Date You Cannot Attend *"}
                      </label>
                      <input
                        type="date"
                        required
                        value={schedAffectedDate}
                        onChange={(e) => setSchedAffectedDate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                          fontSize: 13,
                        }}
                      />
                    </div>

                    {schedType === "absence_travel" && (
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--navy)",
                            marginBottom: 4,
                          }}
                        >
                          Expected Return Date
                        </label>
                        <input
                          type="date"
                          value={schedReturnDate}
                          onChange={(e) => setSchedReturnDate(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            fontSize: 13,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--navy)",
                        marginBottom: 4,
                      }}
                    >
                      Primary Reason
                    </label>
                    <select
                      value={schedReason}
                      onChange={(e) => setSchedReason(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        fontSize: 13,
                        background: "white",
                      }}
                    >
                      <option value="Traveling out of town">
                        Traveling out of town (Kaduna / Interstate / Abroad)
                      </option>
                      <option value="School / University Examinations">
                        School or University Examinations
                      </option>
                      <option value="Work / Official Business Conflict">
                        Work or Official Business Conflict
                      </option>
                      <option value="Health / Medical Appointment">
                        Health / Medical Appointment
                      </option>
                      <option value="Family Commitment / Event">
                        Family Commitment or Event
                      </option>
                      <option value="Transport or Logistics Delay">
                        Transport or Logistics Delay
                      </option>
                      <option value="Other">Other Personal Circumstance</option>
                    </select>
                  </div>

                  {/* Makeup Session Option */}
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--navy)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={schedMakeup}
                        onChange={(e) => setSchedMakeup(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      Request a 1-on-1 Catch-Up / Makeup Lesson
                    </label>

                    {schedMakeup && (
                      <div style={{ marginTop: 10 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--muted)",
                            textTransform: "uppercase",
                            marginBottom: 4,
                          }}
                        >
                          Preferred Catch-Up Day &amp; Time
                        </label>
                        <select
                          value={schedPreferredSlot}
                          onChange={(e) =>
                            setSchedPreferredSlot(e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            fontSize: 13,
                            background: "white",
                          }}
                        >
                          <option value="Wednesday afternoon (4:00 PM)">
                            Wednesday afternoon (4:00 PM – 5:30 PM)
                          </option>
                          <option value="Thursday evening (5:30 PM)">
                            Thursday evening (5:30 PM – 7:00 PM)
                          </option>
                          <option value="Friday afternoon (3:30 PM)">
                            Friday afternoon (3:30 PM – 5:00 PM)
                          </option>
                          <option value="Next Saturday morning (9:00 AM)">
                            Next Saturday morning (9:00 AM – 10:30 AM)
                          </option>
                          <option value="Next Saturday afternoon (2:00 PM)">
                            Next Saturday afternoon (2:00 PM – 3:30 PM)
                          </option>
                          <option value="Flexible (Coordinate with Instructor)">
                            Flexible — whatever slot the instructor has free
                          </option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Additional notes */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--navy)",
                        marginBottom: 4,
                      }}
                    >
                      Additional Notes for Instructor / Studio Desk
                    </label>
                    <textarea
                      rows={2}
                      value={schedNotes}
                      onChange={(e) => setSchedNotes(e.target.value)}
                      placeholder="e.g. I will practice scales at home with the lesson notes while away…"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        fontSize: 13,
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 mt-2.5 pt-2.5 border-t border-[var(--line)]">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="btn btn-secondary w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={schedSubmitting}
                      className="btn btn-primary w-full sm:w-auto"
                    >
                      {schedSubmitting
                        ? "Submitting Notice…"
                        : "Submit Notice & Alert Studio Desk"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Portal
