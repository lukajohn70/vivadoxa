// ─── Admin Schedule Views: Master Timetable & Absence / Reschedule Queue ─────────

import React, { useState, useEffect } from "react"
import { Icon, Button, Badge, Field, WhatsAppIcon } from "@/components/ui"
import {
  fetchAcademics,
  fetchScheduleRequests,
  respondToScheduleRequest,
  saveCohort,
  deleteCohort,
} from "@/lib/api"

export function ClassScheduleManagerView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [activeTab, setActiveTab] = useState<"timetable" | "requests">("requests")
  const [cohorts, setCohorts] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Modal for responding to a schedule request
  const [selectedReq, setSelectedReq] = useState<any | null>(null)
  const [modalStatus, setModalStatus] = useState<"approved" | "declined">("approved")
  const [makeupDate, setMakeupDate] = useState("")
  const [makeupTime, setMakeupTime] = useState("16:00")
  const [allocatedRoom, setAllocatedRoom] = useState("Studio Room 1 (Piano Lab)")
  const [staffNotes, setStaffNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Cohort creation modal
  const [showAddCohortModal, setShowAddCohortModal] = useState(false)
  const [newCohortName, setNewCohortName] = useState("")
  const [newCohortTime, setNewCohortTime] = useState("")
  const [newCohortRoom, setNewCohortRoom] = useState("Studio Hall 1 & Piano Lab")

  const loadData = async () => {
    setLoading(true)
    try {
      const [cohs, reqs] = await Promise.all([
        fetchAcademics("cohorts"),
        fetchScheduleRequests(undefined, "all"),
      ])
      setCohorts(cohs || [])
      setRequests(reqs || [])
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const pendingCount = requests.filter((r) => r.status === "pending").length

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    const matchesType = typeFilter === "all" || r.request_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Filter cohorts
  const filteredCohorts = cohorts.filter((c) => {
    return (
      !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.time_slot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.room?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const openRespondModal = (req: any, status: "approved" | "declined") => {
    setSelectedReq(req)
    setModalStatus(status)
    setAllocatedRoom(req.program?.includes("Piano") ? "Studio Room 1 (Piano Lab)" : "Studio Room 2 (Strings & Winds)")
    
    // Suggest tomorrow's date or affected date
    const today = new Date()
    today.setDate(today.getDate() + 3)
    const defDate = today.toISOString().split("T")[0]
    setMakeupDate(req.affected_date || defDate)
    setMakeupTime("16:00")
    setStaffNotes(
      status === "approved"
        ? `Allocated catch-up session based on student notice. Please check in with studio desk 10 mins prior.`
        : `Unable to accommodate makeup session due to short notice or lack of available studio slots.`
    )
  }

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReq) return

    setSubmitting(true)
    try {
      const combinedDateTime =
        modalStatus === "approved" && makeupDate
          ? `${makeupDate} ${makeupTime}:00`
          : undefined

      const res = await respondToScheduleRequest({
        id: selectedReq.id,
        status: modalStatus,
        allocated_makeup_date: combinedDateTime,
        allocated_room: modalStatus === "approved" ? allocatedRoom : undefined,
        staff_notes: staffNotes,
      })

      if (res.success) {
        setActionNotice(
          modalStatus === "approved"
            ? `✓ Request for ${selectedReq.student_name} approved! Catch-up slot allocated and WhatsApp/Email sent.`
            : `Schedule request for ${selectedReq.student_name} marked as declined.`
        )
        setSelectedReq(null)
        loadData()
      } else {
        alert(res.error || "Failed to update request.")
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddCohort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCohortName || !newCohortTime) return

    try {
      const res = await saveCohort({
        name: newCohortName,
        time_slot: newCohortTime,
        room: newCohortRoom,
        status: "Active",
      })
      if (res.success) {
        setShowAddCohortModal(false)
        setNewCohortName("")
        setNewCohortTime("")
        setActionNotice(`✓ Cohort slot "${newCohortName}" saved to database timetable.`)
        loadData()
      } else {
        alert(res.error || "Failed to save cohort slot.")
      }
    } catch (err: any) {
      alert(err.message || "Failed to save cohort.")
    }
  }

  const handleDeleteCohort = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete cohort slot "${name}"?`)) return
    try {
      const res = await deleteCohort(id)
      if (res.success) {
        setActionNotice(`✓ Cohort slot "${name}" deleted.`)
        loadData()
      }
    } catch {}
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* View Switcher Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", gap: 8, background: "#edeae4", padding: 4, borderRadius: 10 }}>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "requests" ? "white" : "transparent",
              color: activeTab === "requests" ? "var(--navy)" : "var(--muted)",
              boxShadow: activeTab === "requests" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>Student Absence &amp; Reschedule Queue</span>
            {pendingCount > 0 && (
              <span
                style={{
                  background: "#dc2626",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "1px 7px",
                  borderRadius: 999,
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timetable")}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "timetable" ? "white" : "transparent",
              color: activeTab === "timetable" ? "var(--navy)" : "var(--muted)",
              boxShadow: activeTab === "timetable" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>Studio Cohort Timetable</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>({cohorts.length})</span>
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {activeTab === "timetable" && (
            <Button variant="primary" onClick={() => setShowAddCohortModal(true)}>
              + Add Cohort Slot
            </Button>
          )}
          <Button variant="ghost" onClick={loadData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* TAB 1: ABSENCE & RESCHEDULE QUEUE */}
      {activeTab === "requests" && (
        <section className="table-panel manager-table" style={{ margin: 0 }}>
          <div className="manager-filters" style={{ flexWrap: "wrap", gap: 10 }}>
            <div className="search-field" style={{ minWidth: 260 }}>
              <Icon name="search" />
              <input
                placeholder="Search student, program, reason…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status"
            >
              <option value="all">All Request Statuses</option>
              <option value="pending">Pending Review Only</option>
              <option value="approved">Approved &amp; Catch-Up Allocated</option>
              <option value="declined">Declined</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter notice type"
            >
              <option value="all">All Notice Types</option>
              <option value="absence_travel">Travel / Out of Town</option>
              <option value="one_off_reschedule">One-Off Reschedule</option>
              <option value="permanent_change">Permanent Cohort Change</option>
            </select>
          </div>

          <div className="table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fbfaf8", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Student &amp; Program</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Notice Type</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Dates &amp; Reason</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Makeup Status / Slot</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
                      Loading schedule queue…
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "var(--muted)" }}>
                      No schedule or absence requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const isPending = req.status === "pending"
                    const isApproved = req.status === "approved"
                    const cleanPhone = (req.student_phone || "").replace(/[^0-9]/g, "")
                    const intlPhone = cleanPhone.startsWith("0") ? "234" + cleanPhone.slice(1) : cleanPhone

                    return (
                      <tr key={req.id} style={{ borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                        <td style={{ padding: "14px 16px" }}>
                          <strong style={{ display: "block", color: "var(--navy)" }}>{req.student_name}</strong>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>{req.program}</span>
                          <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 11 }}>
                            <a
                              href={`https://wa.me/${intlPhone}?text=Hello%20${encodeURIComponent(req.student_name)},%20this%20is%20Vivadoxa%20Academy%20academic%20desk%20regarding%20your%20schedule%20notice%20for%20${encodeURIComponent(req.program)}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#15803d", display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none", fontWeight: 600 }}
                            >
                              <WhatsAppIcon size={12} fill="#15803d" /> {req.student_phone || "WhatsApp"}
                            </a>
                            <span style={{ color: "var(--muted)" }}>· {req.student_email}</span>
                          </div>
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: req.request_type === "absence_travel" ? "#e0f2fe" : req.request_type === "one_off_reschedule" ? "#fef3c7" : "#ede9fe",
                              color: req.request_type === "absence_travel" ? "#0369a1" : req.request_type === "one_off_reschedule" ? "#92400e" : "#5b21b6",
                            }}
                          >
                            {req.request_type === "absence_travel"
                              ? "Travel / Away"
                              : req.request_type === "one_off_reschedule"
                                ? "One-Off Reschedule"
                                : "Cohort Transfer"}
                          </span>
                          <small style={{ display: "block", marginTop: 4, color: "var(--muted)", fontSize: 11 }}>
                            Current: {req.current_schedule || "Saturday Cohort"}
                          </small>
                        </td>

                        <td style={{ padding: "14px 16px", maxWidth: 260 }}>
                          <strong style={{ display: "block", fontSize: 12, color: "var(--navy)" }}>
                            Date: {req.affected_date || "Upcoming lesson"}
                            {req.return_date ? ` → ${req.return_date}` : ""}
                          </strong>
                          <span style={{ fontSize: 12, color: "#475569", display: "block", marginTop: 2 }}>
                            <em>{req.reason}</em>
                          </span>
                          {req.notes && (
                            <small style={{ color: "var(--muted)", display: "block", marginTop: 4, fontStyle: "italic" }}>
                              Note: "{req.notes}"
                            </small>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          {isApproved && req.allocated_makeup_date ? (
                            <div style={{ background: "#dcfce7", padding: "6px 10px", borderRadius: 6, border: "1px solid #86efac", fontSize: 12, color: "#166534" }}>
                              <strong>✓ Catch-Up Scheduled:</strong>
                              <div style={{ marginTop: 2 }}>{new Date(req.allocated_makeup_date).toLocaleString()}</div>
                              <small style={{ color: "#15803d" }}>Room: {req.allocated_room || "Studio Room 1"}</small>
                            </div>
                          ) : req.makeup_requested ? (
                            <div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706" }}>
                                Requested Catch-Up
                              </span>
                              <small style={{ display: "block", color: "var(--muted)", marginTop: 2 }}>
                                Pref: {req.preferred_makeup_slot || "Flexible"}
                              </small>
                            </div>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: 12 }}>No makeup requested</span>
                          )}
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 800,
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
                        </td>

                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openRespondModal(req, "approved")}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: 6,
                                    border: "none",
                                    background: "#15803d",
                                    color: "white",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  Allocate Slot
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRespondModal(req, "declined")}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    border: "1px solid var(--line)",
                                    background: "white",
                                    color: "#991b1b",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openRespondModal(req, "approved")}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: 6,
                                  border: "1px solid var(--line)",
                                  background: "#f4f2ec",
                                  color: "var(--navy)",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Edit Slot
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: STUDIO COHORT TIMETABLE */}
      {activeTab === "timetable" && (
        <section className="table-panel manager-table" style={{ margin: 0 }}>
          <div className="manager-filters">
            <div className="search-field">
              <Icon name="search" />
              <input
                placeholder="Search cohort slot, studio room…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fbfaf8", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                  <th style={{ padding: "12px 18px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Cohort Name</th>
                  <th style={{ padding: "12px 18px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Time Slot</th>
                  <th style={{ padding: "12px 18px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Studio Room / Location</th>
                  <th style={{ padding: "12px 18px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)" }}>Status</th>
                  <th style={{ padding: "12px 18px", fontSize: 11, textTransform: "uppercase", color: "var(--muted)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCohorts.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                    <td style={{ padding: "14px 18px" }}>
                      <strong style={{ color: "var(--navy)" }}>{c.name}</strong>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--navy)" }}>{c.time_slot}</td>
                    <td style={{ padding: "14px 18px", color: "var(--muted)" }}>{c.room}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <Badge tone="green">{c.status || "Active"}</Badge>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteCohort(c.id, c.name)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Modal: Allocate Catch-Up Slot / Respond to Request ───────────────────── */}
      {selectedReq && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReq(null)
          }}
        >
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-head">
              <div>
                <h3 style={{ margin: 0, fontSize: 17 }}>
                  {modalStatus === "approved" ? "Approve & Allocate Catch-Up Session" : "Decline Schedule Request"}
                </h3>
                <small style={{ color: "var(--muted)", display: "block", marginTop: 2 }}>
                  Student: {selectedReq.student_name} ({selectedReq.program})
                </small>
              </div>
              <button className="modal-close" onClick={() => setSelectedReq(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResponse} className="modal-body" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Request Summary Box */}
              <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}>
                <div><strong>Reason:</strong> {selectedReq.reason}</div>
                <div><strong>Affected Session:</strong> {selectedReq.affected_date || "Upcoming session"}</div>
                {selectedReq.preferred_makeup_slot && (
                  <div><strong>Student Preferred Slot:</strong> {selectedReq.preferred_makeup_slot}</div>
                )}
                {selectedReq.notes && (
                  <div style={{ marginTop: 4, color: "var(--muted)", fontStyle: "italic" }}>
                    Student Note: "{selectedReq.notes}"
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>
                  Decision
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setModalStatus("approved")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: modalStatus === "approved" ? "2px solid #15803d" : "1px solid var(--line)",
                      background: modalStatus === "approved" ? "#dcfce7" : "white",
                      color: modalStatus === "approved" ? "#166534" : "var(--navy)",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    ✓ Approve &amp; Allocate Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStatus("declined")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: modalStatus === "declined" ? "2px solid #991b1b" : "1px solid var(--line)",
                      background: modalStatus === "declined" ? "#fee2e2" : "white",
                      color: modalStatus === "declined" ? "#991b1b" : "var(--navy)",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    ✕ Decline Request
                  </button>
                </div>
              </div>

              {modalStatus === "approved" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                        Allocated Makeup Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={makeupDate}
                        onChange={(e) => setMakeupDate(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                        Allocated Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={makeupTime}
                        onChange={(e) => setMakeupTime(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                      Allocated Studio Room / Suite
                    </label>
                    <select
                      value={allocatedRoom}
                      onChange={(e) => setAllocatedRoom(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13, background: "white" }}
                    >
                      <option value="Studio Room 1 (Grand Piano Lab)">Studio Room 1 (Grand Piano Lab)</option>
                      <option value="Studio Room 2 (Strings & Winds)">Studio Room 2 (Strings & Winds)</option>
                      <option value="Studio Room 3 (Guitar & Bass Lounge)">Studio Room 3 (Guitar & Bass Lounge)</option>
                      <option value="Audio Engineering Suite">Audio Engineering Suite</option>
                      <option value="Live Rehearsal Hall">Live Rehearsal Hall</option>
                      <option value="Private Home Lesson (Kaduna)">Private Home Lesson (Kaduna)</option>
                      <option value="Online 1-on-1 Studio">Online 1-on-1 Studio (Zoom / Google Meet)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                  {modalStatus === "approved" ? "Instructor Notes (included in WhatsApp & Email)" : "Reason for Declining"}
                </label>
                <textarea
                  rows={2}
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                />
              </div>

              <div style={{ background: "#f0fdf4", padding: 10, borderRadius: 6, fontSize: 11, color: "#166534" }}>
                Saving will automatically dispatch a WhatsApp notification to <strong>{selectedReq.student_phone}</strong> and an email to <strong>{selectedReq.student_email}</strong>.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--line)", background: "white", cursor: "pointer", fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "none",
                    background: modalStatus === "approved" ? "#15803d" : "#991b1b",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {submitting ? "Saving & Notifying…" : modalStatus === "approved" ? "Confirm & Notify Student" : "Decline Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add New Cohort Slot ─────────────────────────────────────────── */}
      {showAddCohortModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddCohortModal(false)
          }}
        >
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <h3 style={{ margin: 0, fontSize: 17 }}>Add Cohort Slot</h3>
              <button className="modal-close" onClick={() => setShowAddCohortModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCohort} className="modal-body" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                  Cohort Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wednesday Evening Masterclass"
                  value={newCohortName}
                  onChange={(e) => setNewCohortName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                  Time Schedule *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wednesdays 5:00 PM – 7:00 PM"
                  value={newCohortTime}
                  onChange={(e) => setNewCohortTime(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
                  Studio Room
                </label>
                <input
                  type="text"
                  value={newCohortRoom}
                  onChange={(e) => setNewCohortRoom(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowAddCohortModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid var(--line)", background: "white", cursor: "pointer", fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--navy)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Create Cohort Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
