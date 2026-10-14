// ─── Admin Portal ─────────────────────────────────────────────────────────────
// Streamlined school operations dashboard.

import { useState, useEffect, useCallback } from "react"
import { Logo, Button, Icon, Badge, Field } from "@/components/ui"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import {
  fetchStats,
  fetchApplications,
  fetchPayments,
  fetchRepairs,
  fetchEnquiries,
  updateApplicationStatus,
  updatePaymentStatus,
  updateRepairStatus,
  markEnquiryRead,
  fetchAcademics,
  saveProgram,
  saveInstructor,
  savePerformance,
  deletePerformance,
  enrollStudent,
} from "@/lib/api"
import {
  AdmissionLetterModal,
  PaymentReceiptModal,
} from "@/components/OfficialDocument"
import type { Page } from "@/types"

// ─── Admin Login page ─────────────────────────────────────────────────────────
export function AdminLogin({ go }: { go: (p: Page) => void }) {
  const { session, login, logout, loginError, loginLoading } = useAdminAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // If already authenticated, allow instant navigation to dashboard
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
          <Button onClick={() => go("admin")} fullWidth>
            Go to Admin Dashboard <Icon name="arrow" />
          </Button>
          <div style={{ marginTop: 12 }}>
            <Button variant="ghost" onClick={logout} fullWidth>
              Sign out
            </Button>
          </div>
          <p className="login-footer">
            <button type="button" onClick={() => go("home")}>
              Return to the website
            </button>
          </p>
        </div>
      </main>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) go("admin")
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <Logo />
        </div>
        <div className="admin-login-head">
          <span className="eyebrow">Staff portal</span>
          <h1>Sign in to your account</h1>
          <p>Access is restricted to authorised Vivadoxa staff only.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Field
            id="al-email"
            label="Email address"
            type="email"
            placeholder="admin@vivadoxa.ng"
            value={email}
            onChange={setEmail}
            required
          />
          <div className="password-field">
            <Field
              id="al-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={setPassword}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eyeoff" : "eye"} size={16} />
            </button>
          </div>

          {loginError && (
            <div className="login-error" role="alert">
              <Icon name="warning" size={16} />
              {loginError}
            </div>
          )}

          <Button type="submit" disabled={loginLoading} fullWidth>
            {loginLoading ? (
              "Signing in…"
            ) : (
              <>
                Sign in <Icon name="arrow" />
              </>
            )}
          </Button>
        </form>

        <p className="login-footer">
          Not a staff member?{" "}
          <button type="button" onClick={() => go("home")}>
            Return to the website
          </button>
        </p>
      </div>
    </main>
  )
}

// ─── Admin shell ──────────────────────────────────────────────────────────────
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

  const navGroups: [string, string[]][] = [
    [
      "Operations",
      ["Dashboard", "Applications", "Payments", "Repairs", "Enquiries"],
    ],
    [
      "Academics",
      ["Programs & Courses", "Instructors", "Performances & Recitals", "Students", "Class Schedule"],
    ],
    [
      "System",
      ["Staff & Roles", "Payment Settings", "General Settings"],
    ],
  ]

  function closeNav(item: string) {
    setActive(item)
    setMobileNav(false)
  }

  return (
    <main className="admin">
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
            {session.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <strong>{session.name}</strong>
            <small>Staff Administrator</small>
          </div>
        </div>
        <nav aria-label="Admin navigation">
          {navGroups.map(([group, items]) => (
            <div className="admin-nav-group" key={group}>
              <small>{group}</small>
              {items.map((item, i) => (
                <button
                  className={active === item ? "active" : ""}
                  onClick={() => closeNav(item)}
                  key={item}
                  aria-current={active === item ? "page" : undefined}
                >
                  <span aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button
          className="signout"
          onClick={() => {
            logout()
            go("home")
          }}
        >
          Sign out
        </button>
      </aside>

      {/* Main content area */}
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
          <div className="admin-tools">
            <button aria-label="Search">
              <Icon name="search" />
            </button>
            <button aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <span aria-hidden="true">
              {session.name.slice(0, 2).toUpperCase()}
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
  const [liveStats, setLiveStats] = useState<{
    total_applications: number
    pending_applications: number
    accepted_applications: number
    pending_payments: number
    total_revenue: number
    formatted_revenue: string
    active_repairs: number
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

  const stats = [
    [
      "Applications",
      liveStats ? String(liveStats.total_applications) : "5",
      liveStats ? `${liveStats.pending_applications} pending review` : "+18%",
    ],
    [
      "Pending payments",
      liveStats ? String(liveStats.pending_payments) : "1",
      "Needs verification",
    ],
    [
      "Total revenue",
      liveStats ? liveStats.formatted_revenue : "₦175,000",
      "Verified payments",
    ],
    [
      "Active repairs",
      liveStats ? String(liveStats.active_repairs) : "2",
      "In workshop",
    ],
  ]

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
          <h2>Welcome back 👋</h2>
          <p>
            Student admissions, enrolled students, payments and repairs overview.
          </p>
        </div>
        <Button onClick={() => setActive("Applications")}>
          Review applications <Icon name="arrow" />
        </Button>
      </div>

      <div className="metric-grid" role="list" aria-label="Key metrics">
        {stats.map(([a, b, c]) => (
          <article key={a} role="listitem">
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c}</small>
          </article>
        ))}
      </div>

      <div className="admin-panels">
        <section className="chart-panel">
          <div className="panel-title">
            <div>
              <h2>Revenue overview</h2>
              <p>Verified tuition fees received</p>
            </div>
            <select aria-label="Revenue period">
              <option>Current academic session</option>
            </select>
          </div>
          <div className="bar-chart" aria-label="Revenue chart">
            {[
              ["Jan", 40],
              ["Feb", 65],
              ["Mar", 85],
              ["Apr", 55],
              ["May", 70],
              ["Jun", 95],
            ].map(([m, h]) => (
              <div className="bar-col" key={m as string}>
                <div
                  className="bar"
                  style={{ height: `${h}%` }}
                  title={`₦${(Number(h) * 2000).toLocaleString()}`}
                />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-panel">
          <div className="panel-title">
            <div>
              <h2>Quick Actions</h2>
              <p>Common administrative tasks</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <button
              className="quick-action-card"
              onClick={() => setActive("Applications")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                background: "var(--card-bg, rgba(255,255,255,0.02))",
                border: "1px solid var(--border)",
                borderRadius: 8,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div>
                <strong style={{ display: "block" }}>Review New Admissions</strong>
                <small style={{ color: "var(--muted)" }}>Check student applications and acceptances</small>
              </div>
              <Icon name="arrow" />
            </button>
            <button
              className="quick-action-card"
              onClick={() => setActive("Payments")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                background: "var(--card-bg, rgba(255,255,255,0.02))",
                border: "1px solid var(--border)",
                borderRadius: 8,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div>
                <strong style={{ display: "block" }}>Verify Bank Transfers</strong>
                <small style={{ color: "var(--muted)" }}>Reconcile pending tuition payments</small>
              </div>
              <Icon name="arrow" />
            </button>
            <button
              className="quick-action-card"
              onClick={() => setActive("Repairs")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                background: "var(--card-bg, rgba(255,255,255,0.02))",
                border: "1px solid var(--border)",
                borderRadius: 8,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div>
                <strong style={{ display: "block" }}>Workshop Service Orders</strong>
                <small style={{ color: "var(--muted)" }}>Update repair job progress & estimates</small>
              </div>
              <Icon name="arrow" />
            </button>
          </div>
        </section>
      </div>
    </>
  )
}

// ─── Operational Manager & Data Tables ─────────────────────────────────────────
function AdminManager({ title }: { title: string }) {
  const isSettings = title.includes("Settings") || title.includes("Roles")

  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionNotice, setActionNotice] = useState("")

  // Modal inspection states
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const [showLetterModal, setShowLetterModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState("Saturday Cohort A")

  // Add Course / Instructor / Performance Form State
  const [newCourse, setNewCourse] = useState({
    name: "",
    category: "Instruments",
    fee: "₦85,000 / term",
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
    is_director: 0,
  })
  const [newPerformance, setNewPerformance] = useState({
    title: "",
    performer: "",
    program: "Keyboard / Piano",
    category: "Recital",
    youtube_id: "",
    duration: "4:15",
    date_label: "Term Recital",
    description: "",
  })

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
      fetchAcademics("instructors")
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
      setActionNotice(`Student enrolled with Student No: ${(res as any).student_no || "Generated"}!`)
      loadData()
      setSelectedRecord(null)
    }
  }

  async function handlePaymentVerify(ref: string) {
    const res = await updatePaymentStatus(ref, "verified")
    if (res && res.success) {
      setActionNotice(`Payment ${ref} verified successfully.`)
      loadData()
      if (selectedRecord && selectedRecord.reference === ref) {
        setSelectedRecord({ ...selectedRecord, status: "verified" })
      }
    }
  }

  async function handleRepairStatus(code: string, newStatus: string, cost?: number) {
    const res = await updateRepairStatus(code, newStatus, cost)
    if (res && res.success) {
      setActionNotice(`Repair ${code} updated to ${newStatus}.`)
      loadData()
      if (selectedRecord && selectedRecord.tracking_code === code) {
        setSelectedRecord({ ...selectedRecord, status: newStatus, ...(cost ? { estimated_cost: cost } : {}) })
      }
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

  async function handleAddProgram(e: React.FormEvent) {
    e.preventDefault()
    if (!newCourse.name) return
    const res = await saveProgram(newCourse)
    if (res && res.success) {
      setShowAddModal(false)
      setNewCourse({
        name: "",
        category: "Instruments",
        fee: "₦85,000 / term",
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
        is_director: 0,
      })
      setActionNotice("Instructor profile added successfully.")
      loadData()
    }
  }

  async function handleAddPerformance(e: React.FormEvent) {
    e.preventDefault()
    if (!newPerformance.title || !newPerformance.youtube_id) return
    const res = await savePerformance(newPerformance)
    if (res && res.success) {
      setShowAddModal(false)
      setNewPerformance({
        title: "",
        performer: "",
        program: "Keyboard / Piano",
        category: "Recital",
        youtube_id: "",
        duration: "4:15",
        date_label: "Term Recital",
        description: "",
      })
      setActionNotice("Recital video published successfully.")
      loadData()
    }
  }

  async function handleDeletePerformance(id: number) {
    if (!confirm("Are you sure you want to remove this recital performance?")) return
    const res = await deletePerformance(id)
    if (res && res.success) {
      setActionNotice("Performance deleted successfully.")
      loadData()
    }
  }

  function exportCsv() {
    if (!filteredRecords || filteredRecords.length === 0) return
    const headers = Object.keys(filteredRecords[0]).filter((k) => k !== "id")
    const csvRows = [
      headers.join(","),
      ...filteredRecords.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ]
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vivadoxa_${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filtered live records
  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      !term || JSON.stringify(rec).toLowerCase().includes(term)

    if (!matchesSearch) return false

    if (statusFilter === "all") return true
    if (statusFilter === "confirmed") {
      return (
        rec.status === "approved" ||
        rec.status === "verified" ||
        rec.status === "ready" ||
        rec.status === "active" ||
        rec.is_read === 1
      )
    }
    if (statusFilter === "pending") {
      return (
        rec.status === "pending" ||
        rec.status === "reviewing" ||
        rec.status === "assessing" ||
        rec.is_read === 0
      )
    }
    return true
  })

  return (
    <>
      <div className="manager-head">
        <div>
          <span className="eyebrow">School Management</span>
          <h2>{title}</h2>
          <p>Review, verify, and update school records in real time.</p>
        </div>
        {(title === "Programs & Courses" || title === "Instructors" || title === "Performances & Recitals") && (
          <Button onClick={() => setShowAddModal(true)}>
            + Add {title === "Instructors" ? "Instructor" : title === "Performances & Recitals" ? "Recital Video" : "Course"}
          </Button>
        )}
      </div>

      {actionNotice && (
        <div
          role="status"
          style={{
            padding: "12px 16px",
            background: "rgba(52, 199, 89, 0.1)",
            border: "1px solid rgba(52, 199, 89, 0.3)",
            borderRadius: 8,
            marginBottom: 16,
            color: "#34c759",
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

      {isSettings ? (
        <div className="settings-grid">
          <section className="editor-section">
            <h3>School Bank Details (for student transfers)</h3>
            <div className="form-grid">
              <Field
                id="cfg-bank-name"
                label="Bank Name"
                value="Guaranty Trust Bank (GTBank)"
                readOnly
              />
              <Field
                id="cfg-account-no"
                label="Account Number"
                value="0123456789"
                readOnly
              />
              <Field
                id="cfg-account-name"
                label="Account Name"
                value="Vivadoxa Music School"
                readOnly
              />
              <Field
                id="cfg-bank-branch"
                label="Branch / Location"
                value="Television, Kaduna"
                readOnly
              />
            </div>
          </section>

          <section className="editor-section">
            <h3>Online Card Gateway (Paystack)</h3>
            <div className="form-grid">
              <Field
                id="cfg-paystack-pk"
                label="Paystack Public Key"
                value="pk_live_vivadoxa_school_portal"
                readOnly
              />
              <Field
                id="cfg-paystack-sk"
                label="Paystack Secret Key"
                value="••••••••••••••••••••••••"
                readOnly
                type="password"
              />
            </div>
          </section>

          <section className="editor-section">
            <h3>Admissions Notifications</h3>
            <div className="switch-row">
              <div>
                <strong>Email Alert on Application</strong>
                <span>Send email to admissions desk when a new student applies</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  defaultChecked
                  aria-label="Email alerts"
                />
                <i aria-hidden="true" />
              </label>
            </div>
            <div className="switch-row">
              <div>
                <strong>WhatsApp Admission Alert</strong>
                <span>Notify school manager on WhatsApp</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  defaultChecked
                  aria-label="WhatsApp alerts"
                />
                <i aria-hidden="true" />
              </label>
            </div>
          </section>
        </div>
      ) : (
        // Operational Data Tables
        <section className="table-panel manager-table">
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

          <div className="table-wrap">
            <table>
              <thead>
                {title === "Applications" && (
                  <tr>
                    <th scope="col">Application Ref</th>
                    <th scope="col">Applicant Name</th>
                    <th scope="col">Program &amp; Mode</th>
                    <th scope="col">Tuition Fee</th>
                    <th scope="col">Status</th>
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
                    <th scope="col">Tracking Code</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Instrument &amp; Issue</th>
                    <th scope="col">Intake Method</th>
                    <th scope="col">Status</th>
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
                  </tr>
                )}
                {title === "Instructors" && (
                  <tr>
                    <th scope="col">Instructor Name</th>
                    <th scope="col">Position / Title</th>
                    <th scope="col">Specialization</th>
                    <th scope="col">Location</th>
                    <th scope="col">Status</th>
                  </tr>
                )}
                {title === "Performances & Recitals" && (
                  <tr>
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
                  </tr>
                )}
                {title === "Class Schedule" && (
                  <tr>
                    <th scope="col">Cohort Name</th>
                    <th scope="col">Time Schedule</th>
                    <th scope="col">Studio Room</th>
                    <th scope="col">Status</th>
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
                      No {title.toLowerCase()} found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((row) => (
                    <tr
                      key={
                        row.id ||
                        row.application_no ||
                        row.reference ||
                        row.tracking_code ||
                        row.student_no ||
                        row.name
                      }
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedRecord(row)}
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
                            ₦{Number(row.tuition_fee || 75000).toLocaleString()}
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
                          <td onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: 6 }}>
                              {row.status !== "approved" && (
                                <button
                                  className="btn-sm"
                                  onClick={() =>
                                    handleAppStatus(row.application_no, "approved")
                                  }
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: "0.75rem",
                                    background: "#34c759",
                                    color: "#000",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedRecord(row)}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "0.75rem",
                                  background: "rgba(255,255,255,0.08)",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                }}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Payments row */}
                      {title === "Payments" && (
                        <>
                          <td>
                            <strong>{row.reference}</strong>
                            {row.application_no && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--muted)",
                                }}
                              >
                                App: {row.application_no}
                              </div>
                            )}
                          </td>
                          <td>
                            <div>{row.payer_name}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.payer_email}
                            </small>
                          </td>
                          <td>
                            <strong>₦{Number(row.amount).toLocaleString()}</strong>
                          </td>
                          <td>
                            <div>{row.method}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.notes || "—"}
                            </small>
                          </td>
                          <td>
                            <Badge
                              tone={
                                row.status === "verified" ? "green" : "gold"
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: 6 }}>
                              {row.status !== "verified" ? (
                                <button
                                  onClick={() =>
                                    handlePaymentVerify(row.reference)
                                  }
                                  style={{
                                    padding: "4px 10px",
                                    fontSize: "0.75rem",
                                    background: "#34c759",
                                    color: "#000",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  Verify
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedRecord(row)
                                    setShowReceiptModal(true)
                                  }}
                                  style={{
                                    padding: "4px 8px",
                                    fontSize: "0.75rem",
                                    background: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                  }}
                                >
                                  Receipt
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}

                      {/* Repairs row */}
                      {(title === "Repairs" || title.includes("Repairs")) && (
                        <>
                          <td>
                            <strong>{row.tracking_code}</strong>
                          </td>
                          <td>
                            <div>{row.customer_name}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.customer_phone}
                            </small>
                          </td>
                          <td>
                            <div>{row.instrument}</div>
                            <small style={{ color: "var(--muted)" }}>
                              {row.issue}
                            </small>
                          </td>
                          <td>
                            <Badge
                              tone={
                                row.intake_method === "pickup"
                                  ? "gold"
                                  : "navy"
                              }
                            >
                              {row.intake_method === "pickup"
                                ? "Pickup Request"
                                : "Studio Drop-off"}
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              tone={
                                row.status === "ready" ||
                                row.status === "collected"
                                  ? "green"
                                  : "gold"
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedRecord(row)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "0.75rem",
                                background: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                            >
                              Manage
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
                              {row.phone || "—"}
                            </small>
                          </td>
                          <td>{row.subject}</td>
                          <td
                            style={{
                              maxWidth: 220,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.message}
                          </td>
                          <td>
                            <Badge tone={row.is_read ? "green" : "gold"}>
                              {row.is_read ? "Read" : "Unread"}
                            </Badge>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() =>
                                handleEnquiryToggle(row.id, row.is_read)
                              }
                              style={{
                                padding: "4px 8px",
                                fontSize: "0.75rem",
                                background: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                            >
                              {row.is_read ? "Mark Unread" : "Mark Read"}
                            </button>
                          </td>
                        </>
                      )}

                      {/* Programs & Courses row */}
                      {title === "Programs & Courses" && (
                        <>
                          <td>
                            <strong>{row.name}</strong>
                          </td>
                          <td>{row.category}</td>
                          <td>
                            <strong>{row.fee}</strong>
                          </td>
                          <td>{row.duration} · {row.modes}</td>
                          <td>
                            <Badge tone="green">Published</Badge>
                          </td>
                        </>
                      )}

                      {/* Instructors row */}
                      {title === "Instructors" && (
                        <>
                          <td>
                            <strong>{row.name}</strong>
                          </td>
                          <td>{row.title}</td>
                          <td>{row.specialization}</td>
                          <td>{row.location}</td>
                          <td>
                            <Badge tone="green">
                              {row.is_director ? "Artistic Director" : "Active Faculty"}
                            </Badge>
                          </td>
                        </>
                      )}

                      {/* Performances & Recitals row */}
                      {title === "Performances & Recitals" && (
                        <>
                          <td>
                            <strong>{row.title}</strong>
                          </td>
                          <td>{row.performer}</td>
                          <td>
                            <div>{row.program}</div>
                            <small style={{ color: "var(--muted)" }}>{row.category}</small>
                          </td>
                          <td>
                            <code style={{ background: "#eae6de", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>
                              {row.youtube_id}
                            </code>
                          </td>
                          <td>
                            <div>{row.date_label}</div>
                            <small style={{ color: "var(--muted)" }}>{row.duration}</small>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDeletePerformance(row.id)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "0.75rem",
                                background: "rgba(184, 70, 70, 0.15)",
                                color: "var(--red)",
                                border: "1px solid rgba(184, 70, 70, 0.3)",
                                borderRadius: 4,
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
                            <Badge tone="green">{row.status}</Badge>
                          </td>
                        </>
                      )}

                      {/* Class Schedule row */}
                      {title === "Class Schedule" && (
                        <>
                          <td>
                            <strong>{row.name}</strong>
                          </td>
                          <td>{row.time_slot}</td>
                          <td>{row.room}</td>
                          <td>
                            <Badge tone="green">{row.status}</Badge>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Record Detail Inspector Modal ────────────────────────────────────── */}
      {selectedRecord && !showLetterModal && !showReceiptModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Record Details"
        >
          <div className="modal-card">
            <div className="modal-head">
              <h3>
                {title.slice(0, -1)} Details:{" "}
                {selectedRecord.application_no ||
                  selectedRecord.reference ||
                  selectedRecord.tracking_code ||
                  selectedRecord.student_no ||
                  selectedRecord.name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Application Details */}
              {title === "Applications" && (
                <div>
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
                        {selectedRecord.study_mode} ({selectedRecord.skill_level})
                      </strong>
                    </div>
                    <div>
                      <small>Tuition Fee</small>
                      <strong>
                        ₦
                        {Number(
                          selectedRecord.tuition_fee || 85000,
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
                        <option value="Saturday Cohort A">
                          Saturday Cohort A (Morning)
                        </option>
                        <option value="Saturday Cohort B">
                          Saturday Cohort B (Afternoon)
                        </option>
                        <option value="Weekday Evenings">
                          Weekday Evenings (Tue/Thu)
                        </option>
                      </select>
                      <Button onClick={() => handleEnroll(selectedRecord)}>
                        Enroll as Student
                      </Button>
                    </div>
                  </div>
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
                </div>
              )}

              {/* Repair Details */}
              {(title === "Repairs" || title.includes("Repairs")) && (
                <div>
                  <div className="doc-grid" style={{ margin: "0 0 16px" }}>
                    <div>
                      <small>Tracking Code</small>
                      <strong>{selectedRecord.tracking_code}</strong>
                    </div>
                    <div>
                      <small>Customer Name</small>
                      <strong>{selectedRecord.customer_name}</strong>
                    </div>
                    <div>
                      <small>Customer Phone</small>
                      <strong>{selectedRecord.customer_phone}</strong>
                    </div>
                    <div>
                      <small>Customer Email</small>
                      <strong>{selectedRecord.customer_email || "—"}</strong>
                    </div>
                    <div>
                      <small>Instrument</small>
                      <strong>{selectedRecord.instrument}</strong>
                    </div>
                    <div>
                      <small>Delivery / Intake Method</small>
                      <Badge
                        tone={
                          selectedRecord.intake_method === "pickup"
                            ? "gold"
                            : "navy"
                        }
                      >
                        {selectedRecord.intake_method === "pickup"
                          ? "Logistics Pickup Request"
                          : "Studio Drop-off"}
                      </Badge>
                    </div>
                    {selectedRecord.pickup_address && (
                      <div style={{ gridColumn: "1/-1" }}>
                        <small>Pickup Address &amp; Landmark</small>
                        <strong style={{ color: "var(--gold)" }}>
                          {selectedRecord.pickup_address}
                        </strong>
                      </div>
                    )}
                    <div style={{ gridColumn: "1/-1" }}>
                      <small>Reported Issue</small>
                      <strong>{selectedRecord.issue}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid var(--line)",
                      paddingTop: 16,
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                        Update Stage:
                      </label>
                      <select
                        defaultValue={selectedRecord.status}
                        onChange={(e) =>
                          handleRepairStatus(selectedRecord.tracking_code, e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                        }}
                      >
                        <option value="received">Received</option>
                        <option value="assessing">Assessing</option>
                        <option value="in_progress">In Progress</option>
                        <option value="ready">Ready for Pickup / Delivery</option>
                        <option value="collected">Collected / Delivered</option>
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                        Set Repair Cost (₦):
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        defaultValue={selectedRecord.estimated_cost || ""}
                        onBlur={(e) =>
                          handleRepairStatus(
                            selectedRecord.tracking_code,
                            selectedRecord.status,
                            Number(e.target.value),
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: 6,
                          border: "1px solid var(--line)",
                        }}
                      />
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
                      <strong>{selectedRecord.email}</strong>
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
                      padding: 16,
                      background: "#faf9f6",
                      borderRadius: 6,
                      lineHeight: 1.6,
                    }}
                  >
                    <small style={{ color: "var(--muted)", textTransform: "uppercase" }}>
                      Message Content:
                    </small>
                    <p style={{ margin: "8px 0 0", color: "#111" }}>
                      {selectedRecord.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-foot">
              {title === "Applications" && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleAppStatus(selectedRecord.application_no, "rejected")
                    }
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setShowLetterModal(true)
                    }}
                  >
                    Official Admission Letter (PDF)
                  </Button>
                </>
              )}

              {title === "Payments" && (
                <>
                  {selectedRecord.status !== "verified" && (
                    <Button
                      onClick={() =>
                        handlePaymentVerify(selectedRecord.reference)
                      }
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

              <Button variant="ghost" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Modals ──────────────────────────────────────────────────── */}
      {showLetterModal && selectedRecord && (
        <AdmissionLetterModal
          data={selectedRecord}
          onClose={() => setShowLetterModal(false)}
        />
      )}

      {showReceiptModal && selectedRecord && (
        <PaymentReceiptModal
          data={selectedRecord}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* ── Add Course / Instructor Modal ────────────────────────────────────── */}
      {showAddModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Add Record"
        >
          <div className="modal-card">
            <div className="modal-head">
              <h3>
                {title === "Instructors"
                  ? "Add New Instructor"
                  : title === "Performances & Recitals"
                    ? "Add Recital Video"
                    : "Add New Course"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            {title === "Instructors" ? (
              <form onSubmit={handleAddInstructor}>
                <div className="modal-body">
                  <div className="form-grid">
                    <Field
                      id="ins-name"
                      label="Instructor Full Name"
                      placeholder="e.g. Samuel Adeyemi"
                      value={newInstructor.name}
                      onChange={(v) =>
                        setNewInstructor({ ...newInstructor, name: v })
                      }
                      required
                    />
                    <Field
                      id="ins-title"
                      label="Title / Role"
                      placeholder="e.g. Lead Brass Instructor"
                      value={newInstructor.title}
                      onChange={(v) =>
                        setNewInstructor({ ...newInstructor, title: v })
                      }
                      required
                    />
                    <Field
                      id="ins-spec"
                      label="Specialization"
                      placeholder="e.g. Trumpet, Saxophone & Theory"
                      value={newInstructor.specialization}
                      onChange={(v) =>
                        setNewInstructor({ ...newInstructor, specialization: v })
                      }
                      required
                    />
                    <Field
                      id="ins-loc"
                      label="Location / Studio"
                      value={newInstructor.location}
                      onChange={(v) =>
                        setNewInstructor({ ...newInstructor, location: v })
                      }
                    />
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>
                        Role Tier / Leadership
                      </label>
                      <select
                        value={newInstructor.is_director}
                        onChange={(e) =>
                          setNewInstructor({
                            ...newInstructor,
                            is_director: Number(e.target.value),
                          })
                        }
                        style={{ width: "100%", minHeight: 48, borderRadius: 8, border: "1px solid #cbd4d9", padding: "0 14px", background: "white" }}
                      >
                        <option value={0}>Faculty Instructor</option>
                        <option value={1}>Artistic Director / Executive</option>
                      </select>
                    </div>
                    <div className="full">
                      <Field
                        id="ins-bio"
                        label="Executive Biography"
                        placeholder="Professional background, conservatory training, performance accomplishments..."
                        value={newInstructor.bio}
                        onChange={(v) =>
                          setNewInstructor({ ...newInstructor, bio: v })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Instructor</Button>
                </div>
              </form>
            ) : title === "Performances & Recitals" ? (
              <form onSubmit={handleAddPerformance}>
                <div className="modal-body">
                  <div className="form-grid">
                    <Field
                      id="perf-title"
                      label="Performance Title"
                      placeholder="e.g. Chopin Nocturne Op. 9 No. 2"
                      value={newPerformance.title}
                      onChange={(v) =>
                        setNewPerformance({ ...newPerformance, title: v })
                      }
                      required
                    />
                    <Field
                      id="perf-performer"
                      label="Performer / Student Name"
                      placeholder="e.g. Joy Okafor (Grade 5 Piano Candidate)"
                      value={newPerformance.performer}
                      onChange={(v) =>
                        setNewPerformance({ ...newPerformance, performer: v })
                      }
                      required
                    />
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>
                        Showcase Category
                      </label>
                      <select
                        value={newPerformance.category}
                        onChange={(e) =>
                          setNewPerformance({
                            ...newPerformance,
                            category: e.target.value,
                          })
                        }
                        style={{ width: "100%", minHeight: 48, borderRadius: 8, border: "1px solid #cbd4d9", padding: "0 14px", background: "white" }}
                      >
                        <option value="Recital">Recital</option>
                        <option value="Concert">Concert</option>
                        <option value="Student Band">Student Band</option>
                      </select>
                    </div>
                    <Field
                      id="perf-program"
                      label="Associated Program"
                      placeholder="e.g. Keyboard / Piano Mastery"
                      value={newPerformance.program}
                      onChange={(v) =>
                        setNewPerformance({ ...newPerformance, program: v })
                      }
                      required
                    />
                    <Field
                      id="perf-yt"
                      label="YouTube Video ID"
                      placeholder="e.g. dQw4w9WgXcQ (ID only)"
                      value={newPerformance.youtube_id}
                      onChange={(v) =>
                        setNewPerformance({
                          ...newPerformance,
                          youtube_id: v.includes("v=")
                            ? v.split("v=")[1].split("&")[0]
                            : v.includes("youtu.be/")
                              ? v.split("youtu.be/")[1].split("?")[0]
                              : v,
                        })
                      }
                      required
                    />
                    <Field
                      id="perf-date"
                      label="Date / Term Label"
                      placeholder="e.g. Summer Showcase 2026"
                      value={newPerformance.date_label}
                      onChange={(v) =>
                        setNewPerformance({ ...newPerformance, date_label: v })
                      }
                    />
                    <div className="full">
                      <Field
                        id="perf-desc"
                        label="Performance Description"
                        placeholder="Context about this recital piece, student progression, or stage highlight..."
                        value={newPerformance.description}
                        onChange={(v) =>
                          setNewPerformance({ ...newPerformance, description: v })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
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
            ) : (
              <form onSubmit={handleAddProgram}>
                <div className="modal-body">
                  <div className="form-grid">
                    <Field
                      id="prog-name"
                      label="Course Name"
                      placeholder="e.g. Jazz Saxophone Improvisation"
                      value={newCourse.name}
                      onChange={(v) =>
                        setNewCourse({ ...newCourse, name: v })
                      }
                      required
                    />
                    <Field
                      id="prog-fee"
                      label="Fee Description"
                      placeholder="₦85,000 / term"
                      value={newCourse.fee}
                      onChange={(v) =>
                        setNewCourse({ ...newCourse, fee: v })
                      }
                      required
                    />
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>
                        Discipline / Category
                      </label>
                      <select
                        value={newCourse.category}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, category: e.target.value })
                        }
                        style={{ width: "100%", minHeight: 48, borderRadius: 8, border: "1px solid #cbd4d9", padding: "0 14px", background: "white" }}
                      >
                        <option value="Instruments">Instruments</option>
                        <option value="Vocals">Vocals</option>
                        <option value="Composition">Composition</option>
                        <option value="Music Production">Music Production</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 7 }}>
                        Target Age Group
                      </label>
                      <select
                        value={newCourse.age_group}
                        onChange={(e) =>
                          setNewCourse({ ...newCourse, age_group: e.target.value })
                        }
                        style={{ width: "100%", minHeight: 48, borderRadius: 8, border: "1px solid #cbd4d9", padding: "0 14px", background: "white" }}
                      >
                        <option value="All Ages">All Ages</option>
                        <option value="Kids (4–12)">Kids (4–12)</option>
                        <option value="Teens (13–19)">Teens (13–19)</option>
                        <option value="Adults & Professionals">Adults & Professionals</option>
                      </select>
                    </div>
                    <div className="full">
                      <Field
                        id="prog-desc"
                        label="Course Description"
                        placeholder="Curriculum overview and technique scope..."
                        value={newCourse.desc}
                        onChange={(v) =>
                          setNewCourse({ ...newCourse, desc: v })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-foot">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Publish Course</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Admin
