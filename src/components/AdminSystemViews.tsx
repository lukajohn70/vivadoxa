// ─── Admin System Views: Staff & Roles, Payment Settings, General & Notifications ───

import React, { useState, useEffect } from "react"
import { Icon, Button, Field, WhatsAppIcon } from "@/components/ui"
import {
  type BankSettings,
  type GeneralSettings,
  saveBankSettings,
  saveGeneralSettings,
  fetchAdmins,
  addStaffAdmin,
  updateStaffAdmin,
  toggleStaffActive,
  deleteStaffAdmin,
  testEmailNotification,
  testWhatsAppNotification,
  fetchNotificationLogs,
} from "@/lib/api"

// ═════════════════════════════════════════════════════════════════════════════════
// 1. STAFF & ROLES VIEW
// ═════════════════════════════════════════════════════════════════════════════════
export function StaffAndRolesView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("admissions")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const loadStaff = async () => {
    setLoading(true)
    try {
      const data = await fetchAdmins()
      setAdmins(data || [])
    } catch {
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  function openAddModal() {
    setEditingAdmin(null)
    setName("")
    setEmail("")
    setRole("admissions")
    setPassword("StaffPass" + Math.floor(100 + Math.random() * 900) + "!")
    setFormError("")
    setShowAddModal(true)
  }

  function openEditModal(staff: any) {
    setEditingAdmin(staff)
    setName(staff.name)
    setEmail(staff.email)
    setRole(staff.role)
    setPassword("")
    setFormError("")
    setShowAddModal(true)
  }

  async function handleSaveStaff(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")

    if (!name.trim() || !email.trim()) {
      setFormError("Full name and email address are required.")
      return
    }

    if (!editingAdmin && !password.trim()) {
      setFormError("Password is required for new staff accounts.")
      return
    }

    setSaving(true)
    try {
      if (editingAdmin) {
        const res = await updateStaffAdmin({
          id: editingAdmin.id,
          name: name.trim(),
          email: email.trim(),
          role,
          ...(password.trim() ? { password: password.trim() } : {}),
        })
        if (res.success) {
          setActionNotice(`Staff account for ${name} updated successfully.`)
          setShowAddModal(false)
          loadStaff()
        } else {
          setFormError(res.error || "Failed to update staff member.")
        }
      } else {
        const res = await addStaffAdmin({
          name: name.trim(),
          email: email.trim(),
          role,
          password: password.trim(),
        })
        if (res.success) {
          setActionNotice(`Staff administrator ${name} added successfully.`)
          setShowAddModal(false)
          loadStaff()
        } else {
          setFormError(res.error || "Failed to create staff member.")
        }
      }
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(staff: any) {
    if (staff.id === 1) {
      setActionNotice("Primary Superadmin cannot be deactivated.")
      return
    }
    const res = await toggleStaffActive(staff.id)
    if (res.success) {
      setActionNotice(res.message || "Staff status updated.")
      loadStaff()
    } else {
      setActionNotice(res.error || "Failed to update staff status.")
    }
  }

  async function handleDeleteStaff(staff: any) {
    if (staff.id === 1) {
      setActionNotice("Primary Superadmin account cannot be deleted.")
      return
    }
    if (!confirm(`Are you sure you want to permanently remove staff account for "${staff.name}" (${staff.email})?`)) {
      return
    }
    const res = await deleteStaffAdmin(staff.id)
    if (res.success) {
      setActionNotice(`Staff account "${staff.name}" deleted.`)
      loadStaff()
    } else {
      setActionNotice(res.error || "Failed to delete staff account.")
    }
  }

  const roleBadges: Record<string, { label: string; bg: string; color: string }> = {
    superadmin: { label: "Super Administrator", bg: "#702064", color: "#ffffff" },
    admissions: { label: "Admissions Officer", bg: "rgba(21, 112, 84, 0.15)", color: "#157054" },
    finance: { label: "Financial Officer", bg: "rgba(201, 107, 50, 0.15)", color: "#a24a18" },
    workshop: { label: "Workshop Lead", bg: "rgba(31, 110, 165, 0.15)", color: "#1f6ea5" },
    staff: { label: "General Staff", bg: "#eef1f4", color: "#475569" },
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner */}
      <div className="editor-head standalone" style={{ background: "white", padding: 24, borderRadius: 10, border: "1px solid var(--line)" }}>
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>Staff &amp; Role Access Control</h2>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
            Manage authorized academy staff accounts, assigned privileges, and login credentials.
          </p>
        </div>
        <Button onClick={openAddModal} variant="primary">
          + Add Staff Administrator
        </Button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div style={{ background: "white", padding: 18, borderRadius: 8, border: "1px solid var(--line)" }}>
          <small style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
            Total Staff Accounts
          </small>
          <strong style={{ display: "block", fontSize: 26, color: "var(--navy)", marginTop: 4 }}>
            {admins.length}
          </strong>
        </div>
        <div style={{ background: "white", padding: 18, borderRadius: 8, border: "1px solid var(--line)" }}>
          <small style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
            Active Accounts
          </small>
          <strong style={{ display: "block", fontSize: 26, color: "#157054", marginTop: 4 }}>
            {admins.filter((a) => a.is_active).length}
          </strong>
        </div>
        <div style={{ background: "white", padding: 18, borderRadius: 8, border: "1px solid var(--line)" }}>
          <small style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
            Super Administrators
          </small>
          <strong style={{ display: "block", fontSize: 26, color: "#702064", marginTop: 4 }}>
            {admins.filter((a) => a.role === "superadmin").length}
          </strong>
        </div>
        <div style={{ background: "white", padding: 18, borderRadius: 8, border: "1px solid var(--line)" }}>
          <small style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
            Admissions &amp; Operations
          </small>
          <strong style={{ display: "block", fontSize: 26, color: "#c96b32", marginTop: 4 }}>
            {admins.filter((a) => a.role !== "superadmin").length}
          </strong>
        </div>
      </div>

      {/* Staff Table Panel */}
      <div style={{ background: "white", borderRadius: 8, border: "1px solid var(--line)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15 }}>Authorized Personnel</h3>
            <small style={{ color: "var(--muted)" }}>Click any account to edit role or update login access.</small>
          </div>
          <Button variant="ghost" onClick={loadStaff}>
            Refresh
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fbfaf8", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                <th style={{ padding: "12px 18px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Staff Member</th>
                <th style={{ padding: "12px 18px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Email / Login Alias</th>
                <th style={{ padding: "12px 18px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>System Role</th>
                <th style={{ padding: "12px 18px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "12px 18px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Last Login</th>
                <th style={{ padding: "12px 18px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "var(--muted)" }}>
                    Loading staff records…
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "var(--muted)" }}>
                    No staff records found.
                  </td>
                </tr>
              ) : (
                admins.map((staff) => {
                  const roleInfo = roleBadges[staff.role] || roleBadges.staff
                  return (
                    <tr key={staff.id} style={{ borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: staff.role === "superadmin" ? "#0b0b0b" : "var(--gold)",
                              color: "white",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {staff.name ? staff.name.slice(0, 2).toUpperCase() : "AD"}
                          </span>
                          <div>
                            <strong>{staff.name}</strong>
                            {staff.id === 1 && (
                              <span style={{ marginLeft: 6, fontSize: 10, background: "#ffd700", color: "#000", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                                Primary
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px", color: "var(--navy)" }}>
                        <code>{staff.email}</code>
                      </td>
                      <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            background: roleInfo.bg,
                            color: roleInfo.color,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {roleInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: staff.is_active ? "#157054" : "#b84646",
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: staff.is_active ? "#157054" : "#b84646",
                            }}
                          />
                          {staff.is_active ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", color: "var(--muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                        {staff.last_login ? new Date(staff.last_login).toLocaleString() : "Never"}
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            style={{
                              padding: "4px 8px",
                              fontSize: 11,
                              background: "#f4f2ec",
                              border: "1px solid var(--line)",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            Edit
                          </button>
                          {staff.id !== 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleActive(staff)}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: 11,
                                  background: staff.is_active ? "rgba(184, 70, 70, 0.1)" : "rgba(21, 112, 84, 0.1)",
                                  color: staff.is_active ? "#b84646" : "#157054",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
                              >
                                {staff.is_active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(staff)}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: 11,
                                  background: "transparent",
                                  color: "#b84646",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
                                title="Delete account"
                              >
                                ✕
                              </button>
                            </>
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

        {/* Mobile Responsive Stacked Cards View (No sideways scrolling) */}
        <div className="block md:hidden" style={{ padding: 14 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 24, color: "var(--muted)", fontSize: 13 }}>
              Loading staff records…
            </div>
          ) : admins.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "var(--muted)", fontSize: 13 }}>
              No staff records found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {admins.map((staff) => {
                const roleInfo = roleBadges[staff.role] || roleBadges.staff
                return (
                  <div
                    key={staff.id}
                    style={{
                      background: "#fbfaf8",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: staff.role === "superadmin" ? "#0b0b0b" : "var(--gold)",
                            color: "white",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 700,
                            fontSize: 12,
                            flexShrink: 0,
                          }}
                        >
                          {staff.name ? staff.name.slice(0, 2).toUpperCase() : "AD"}
                        </span>
                        <div>
                          <strong style={{ fontSize: 14, color: "var(--navy)", display: "block" }}>{staff.name}</strong>
                          {staff.id === 1 && (
                            <span style={{ fontSize: 9, background: "#ffd700", color: "#000", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                              Primary Admin
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          background: roleInfo.bg,
                          color: roleInfo.color,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {roleInfo.label}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "var(--navy)", background: "white", padding: "8px 10px", borderRadius: 6, border: "1px solid #ede8de" }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>LOGIN EMAIL</div>
                      <code style={{ fontSize: 12, wordBreak: "break-all" }}>{staff.email}</code>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--muted)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: staff.is_active ? "#157054" : "#b84646", fontWeight: 600 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: staff.is_active ? "#157054" : "#b84646" }} />
                        {staff.is_active ? "Active" : "Deactivated"}
                      </span>
                      <span>Last login: {staff.last_login ? new Date(staff.last_login).toLocaleDateString() : "Never"}</span>
                    </div>

                    <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 10, marginTop: 2 }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(staff)}
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
                          textAlign: "center",
                        }}
                      >
                        Edit Account
                      </button>
                      {staff.id !== 1 && (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(staff)}
                          style={{
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            background: staff.is_active ? "rgba(184, 70, 70, 0.1)" : "rgba(21, 112, 84, 0.1)",
                            color: staff.is_active ? "#b84646" : "#157054",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          {staff.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Role Permissions Reference Card */}
      <div style={{ background: "white", padding: 22, borderRadius: 8, border: "1px solid var(--line)" }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--navy)" }}>Role &amp; Permissions Matrix</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          <div style={{ padding: 14, background: "#fcfbf9", borderRadius: 6, border: "1px solid #ebe7df" }}>
            <strong style={{ color: "#702064", display: "block", fontSize: 13 }}>Super Administrator</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Full system control: Operations, Academics, Staff management, Payment configurations, and Notification dispatch channels.
            </p>
          </div>
          <div style={{ padding: 14, background: "#fcfbf9", borderRadius: 6, border: "1px solid #ebe7df" }}>
            <strong style={{ color: "#157054", display: "block", fontSize: 13 }}>Admissions Officer</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Review student applications, approve/reject candidates, generate admission offer letters, and enroll students into cohorts.
            </p>
          </div>
          <div style={{ padding: 14, background: "#fcfbf9", borderRadius: 6, border: "1px solid #ebe7df" }}>
            <strong style={{ color: "#a24a18", display: "block", fontSize: 13 }}>Financial Officer</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Verify bank transfers and card payments, monitor revenue logs, generate official payment receipts, and reconcile accounts.
            </p>
          </div>
          <div style={{ padding: 14, background: "#fcfbf9", borderRadius: 6, border: "1px solid #ebe7df" }}>
            <strong style={{ color: "#1f6ea5", display: "block", fontSize: 13 }}>Workshop Lead</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>
              Manage instrument repair requests, update repair diagnostic stages, quote repair estimates, and notify customers.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <h3>{editingAdmin ? "Edit Staff Account" : "Add Staff Administrator"}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveStaff} className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {formError && (
                <div style={{ padding: "10px 14px", background: "#fee2e2", border: "1px solid #f87171", borderRadius: 6, color: "#991b1b", fontSize: 12 }}>
                  {formError}
                </div>
              )}

              <Field
                id="staff-name"
                label="Staff Full Name"
                value={name}
                onChange={setName}
                placeholder="e.g. Grace Danladi"
                required
              />

              <Field
                id="staff-email"
                label="Official Email or Username"
                value={email}
                onChange={setEmail}
                placeholder="e.g. grace@vivadoxa.ng"
                required
              />

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
                  Assigned Administrative Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: "100%", minHeight: 40, borderRadius: 6, border: "1px solid var(--line)", padding: "0 10px", background: "white", fontSize: 13 }}
                >
                  <option value="admissions">Admissions Officer</option>
                  <option value="finance">Financial Officer</option>
                  <option value="workshop">Workshop Lead</option>
                  <option value="staff">General Academy Staff</option>
                  <option value="superadmin">Super Administrator (Full Privileges)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
                  {editingAdmin ? "Reset Password (leave blank to keep current)" : "Temporary Password"}
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingAdmin ? "Leave blank to keep unchanged" : "Create password"}
                  style={{ width: "100%", minHeight: 40, borderRadius: 6, border: "1px solid var(--line)", padding: "0 10px", background: "white", fontSize: 13 }}
                  required={!editingAdmin}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingAdmin ? "Update Account" : "Create Staff Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════════
// 2. PAYMENT SETTINGS VIEW
// ═════════════════════════════════════════════════════════════════════════════════
export function PaymentSettingsView({
  bankSettings,
  setBankSettings,
  setActionNotice,
}: {
  bankSettings: BankSettings
  setBankSettings: React.Dispatch<React.SetStateAction<BankSettings>>
  setActionNotice: (msg: string) => void
}) {
  const [showSecret, setShowSecret] = useState(false)
  const [savedNotice, setSavedNotice] = useState("")

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    saveBankSettings(bankSettings)
    setActionNotice("School bank account and Paystack gateway configurations saved successfully.")
    setSavedNotice("Payment settings saved successfully!")
    setTimeout(() => setSavedNotice(""), 4000)
  }

  const isLive = (bankSettings.paystackPublicKey || "").startsWith("pk_live")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner */}
      <div className="editor-head standalone" style={{ background: "white", padding: 24, borderRadius: 10, border: "1px solid var(--line)" }}>
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>Payment &amp; Tuition Configurations</h2>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
            Configure official bank transfer details presented to students and connect Paystack payment gateway.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20 }}>
          {/* Section 1: Bank Transfer Details */}
          <div className="editor-section" style={{ margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none" }}>School Bank Account &amp; Transfer Details</h3>
                <small style={{ color: "var(--muted)" }}>Displayed to students during admission &amp; manual payment checkout.</small>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${bankSettings.accountNumber}\n${bankSettings.bankName}\n${bankSettings.accountName}`);
                  setActionNotice("Official bank account details copied to clipboard!");
                }}
                className="btn-sm"
                style={{
                  padding: "5px 12px",
                  fontSize: 11,
                  background: "var(--navy)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Copy Details
              </button>
            </div>

            <div className="form-grid">
              <Field
                id="cfg-bank-name"
                label="Bank Name"
                value={bankSettings.bankName}
                onChange={(v) => setBankSettings({ ...bankSettings, bankName: v })}
                required
              />
              <Field
                id="cfg-account-no"
                label="Account Number"
                value={bankSettings.accountNumber}
                onChange={(v) => setBankSettings({ ...bankSettings, accountNumber: v })}
                required
              />
              <Field
                id="cfg-account-name"
                label="Account Name"
                value={bankSettings.accountName}
                onChange={(v) => setBankSettings({ ...bankSettings, accountName: v })}
                required
              />
              <Field
                id="cfg-bank-branch"
                label="Branch / Location"
                value={bankSettings.branch}
                onChange={(v) => setBankSettings({ ...bankSettings, branch: v })}
                required
              />
            </div>

            {/* Student Preview Card */}
            <div style={{ marginTop: 20, padding: 16, background: "var(--navy)", color: "white", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--gold-text-dark)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                  Live Student Checkout Preview
                </span>
                <span style={{ fontSize: 11, color: "#9dafbc" }}>{bankSettings.bankName}</span>
              </div>
              <div style={{ fontSize: 24, letterSpacing: 2, fontWeight: 700, margin: "6px 0", color: "#ffffff" }}>
                {bankSettings.accountNumber}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#cbd5e1" }}>
                <span>{bankSettings.accountName}</span>
                <span>{bankSettings.branch}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Online Payment Gateway (Paystack) */}
          <div className="editor-section" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none" }}>Online Payment Gateway (Paystack)</h3>
                <small style={{ color: "var(--muted)" }}>Enable automated debit card, bank app, and USSD payments.</small>
              </div>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: isLive ? "rgba(21, 112, 84, 0.15)" : "rgba(201, 107, 50, 0.15)",
                  color: isLive ? "#157054" : "#c96b32",
                }}
              >
                {isLive ? "Live Mode" : "Test Mode"}
              </span>
            </div>

            <div className="switch-row" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
              <div>
                <strong>Enable Paystack Gateway</strong>
                <span>Allow applicants to pay tuition fees directly via card or bank transfer</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={bankSettings.enablePaystack !== false}
                  onChange={(e) => setBankSettings({ ...bankSettings, enablePaystack: e.target.checked })}
                  aria-label="Enable Paystack"
                />
                <i aria-hidden="true" />
              </label>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              <Field
                id="cfg-paystack-pk"
                label="Paystack Public Key"
                value={bankSettings.paystackPublicKey || ""}
                onChange={(v) => setBankSettings({ ...bankSettings, paystackPublicKey: v })}
                placeholder="pk_live_... or pk_test_..."
              />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label htmlFor="cfg-paystack-sk" style={{ fontSize: 11, fontWeight: 700 }}>
                    Paystack Secret Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    style={{ border: "none", background: "none", color: "var(--gold)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                  >
                    {showSecret ? "Hide Key" : "Reveal Key"}
                  </button>
                </div>
                <input
                  id="cfg-paystack-sk"
                  type={showSecret ? "text" : "password"}
                  value={bankSettings.paystackSecretKey || ""}
                  onChange={(e) => setBankSettings({ ...bankSettings, paystackSecretKey: e.target.value })}
                  placeholder="sk_live_... or sk_test_..."
                  style={{ width: "100%", minHeight: 40, borderRadius: 6, border: "1px solid var(--line)", padding: "0 10px", background: "white", fontSize: 13 }}
                />
              </div>

              <div style={{ marginTop: "auto", padding: 12, background: "#f8f9fa", borderRadius: 6, border: "1px solid #e9ecef" }}>
                <small style={{ display: "block", color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>
                  Webhook Endpoint for Automated Verification:
                </small>
                <code style={{ fontSize: 11, wordBreak: "break-all", color: "var(--navy)" }}>
                  {window.location.origin}{window.location.pathname.startsWith("/Vivadoxa") ? "/Vivadoxa" : ""}/api/payments.php?webhook=paystack
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, background: "white", padding: 16, borderRadius: 8, border: "1px solid var(--line)" }}>
          {savedNotice && (
            <span style={{ fontSize: 13, color: "#157054", fontWeight: 700 }}>
              ✓ {savedNotice}
            </span>
          )}
          <Button type="submit">
            Save Payment &amp; Gateway Settings
          </Button>
        </div>
      </form>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════════
// 3. GENERAL SETTINGS & NOTIFICATION ENGINE VIEW
// ═════════════════════════════════════════════════════════════════════════════════
export function GeneralSettingsView({
  generalSettings,
  setGeneralSettings,
  setActionNotice,
}: {
  generalSettings: GeneralSettings
  setGeneralSettings: React.Dispatch<React.SetStateAction<GeneralSettings>>
  setActionNotice: (msg: string) => void
}) {
  const [showSmtpPass, setShowSmtpPass] = useState(false)
  const [smtpActive, setSmtpActive] = useState(Boolean(generalSettings.smtpHost))
  const [savedNotice, setSavedNotice] = useState("")

  // Test states
  const [testingEmail, setTestingEmail] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState<any | null>(null)
  const [testEmailRecipient, setTestEmailRecipient] = useState(generalSettings.schoolEmail)

  const [testingWa, setTestingWa] = useState(false)
  const [testWaResult, setTestWaResult] = useState<any | null>(null)

  // Audit logs state
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const data = await fetchNotificationLogs()
      setLogs(data || [])
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    saveGeneralSettings(generalSettings)
    setActionNotice("Academy communications, WhatsApp, and Email notification settings saved.")
    setSavedNotice("Notification preferences saved successfully!")
    setTimeout(() => setSavedNotice(""), 4000)
  }

  async function handleTestEmail() {
    setTestingEmail(true)
    setTestEmailResult(null)
    try {
      const res = await testEmailNotification(generalSettings, testEmailRecipient)
      setTestEmailResult(res)
      if (res.success) {
        setActionNotice("Email test executed. See details below.")
        loadLogs()
      } else {
        setActionNotice(res.error || "Email delivery failed.")
      }
    } catch (err: any) {
      setTestEmailResult({ success: false, error: err.message })
    } finally {
      setTestingEmail(false)
    }
  }

  async function handleTestWhatsApp() {
    setTestingWa(true)
    setTestWaResult(null)
    try {
      const res = await testWhatsAppNotification(generalSettings, generalSettings.schoolWhatsapp)
      setTestWaResult(res)
      if (res.success) {
        setActionNotice("WhatsApp notification payload generated.")
        loadLogs()
      }
    } catch (err: any) {
      setTestWaResult({ success: false, error: err.message })
    } finally {
      setTestingWa(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner */}
      <div className="editor-head standalone" style={{ background: "white", padding: 24, borderRadius: 10, border: "1px solid var(--line)" }}>
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>Communications &amp; Notification Engine</h2>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
            Configure official school contact directory, and activate instantaneous WhatsApp and Email notifications.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* SECTION 1: School Contact Details */}
        <div className="editor-section" style={{ margin: 0 }}>
          <h3 style={{ margin: "0 0 4px", paddingBottom: 0, border: "none" }}>Official Academy Contact Directory</h3>
          <small style={{ color: "var(--muted)", display: "block", marginBottom: 16 }}>
            Displayed across website footers, consultation popups, and official communication dispatches.
          </small>

          <div className="form-grid">
            <Field
              id="cfg-school-phone"
              label="Primary Phone Number"
              value={generalSettings.schoolPhone}
              onChange={(v) => setGeneralSettings({ ...generalSettings, schoolPhone: v })}
              required
            />
            <Field
              id="cfg-school-phone2"
              label="Secondary Support Phone"
              value={generalSettings.schoolPhone2}
              onChange={(v) => setGeneralSettings({ ...generalSettings, schoolPhone2: v })}
            />
            <Field
              id="cfg-school-whatsapp"
              label="Official WhatsApp Contact"
              value={generalSettings.schoolWhatsapp}
              onChange={(v) => setGeneralSettings({ ...generalSettings, schoolWhatsapp: v })}
              required
            />
            <Field
              id="cfg-school-email"
              label="Official Admissions Email"
              value={generalSettings.schoolEmail}
              onChange={(v) => {
                setGeneralSettings({ ...generalSettings, schoolEmail: v })
                if (!testEmailRecipient) setTestEmailRecipient(v)
              }}
              type="email"
              required
            />
          </div>
          <div style={{ marginTop: 14 }}>
            <Field
              id="cfg-school-addr"
              label="Campus &amp; Studio Address"
              value={generalSettings.schoolAddress || "Kaduna Studio, Kaduna State, Nigeria"}
              onChange={(v) => setGeneralSettings({ ...generalSettings, schoolAddress: v })}
            />
          </div>
        </div>

        {/* SECTION 2: WHATSAPP NOTIFICATION ENGINE */}
        <div className="editor-section" style={{ margin: 0, border: "1px solid rgba(37, 211, 102, 0.4)", background: "#fafdfb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid rgba(37, 211, 102, 0.2)", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#25D366", color: "white", display: "grid", placeItems: "center" }}>
                <WhatsAppIcon size={20} fill="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none", color: "#075e54" }}>WhatsApp Notification Engine</h3>
                <small style={{ color: "var(--muted)" }}>Trigger instant alerts to admissions staff and send preformatted student chats.</small>
              </div>
            </div>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: generalSettings.whatsappAlerts ? "rgba(37, 211, 102, 0.2)" : "#f1f5f9",
                color: generalSettings.whatsappAlerts ? "#075e54" : "#64748b",
              }}
            >
              {generalSettings.whatsappAlerts ? "● WhatsApp Alerts Active" : "○ WhatsApp Disabled"}
            </span>
          </div>

          {/* Master Switch */}
          <div className="switch-row" style={{ padding: 14, background: "white", borderRadius: 8, border: "1px solid var(--line)", marginBottom: 18 }}>
            <div>
              <strong style={{ color: "#075e54" }}>Enable WhatsApp Instant Notification Pipeline</strong>
              <span>When enabled, alert pings are generated automatically on student submissions</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={generalSettings.whatsappAlerts}
                onChange={(e) => setGeneralSettings({ ...generalSettings, whatsappAlerts: e.target.checked })}
                aria-label="WhatsApp alerts"
              />
              <i aria-hidden="true" />
            </label>
          </div>

          {/* WhatsApp Event Triggers */}
          <div style={{ marginBottom: 18 }}>
            <small style={{ display: "block", fontWeight: 700, textTransform: "uppercase", fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
              Automated WhatsApp Alert Triggers
            </small>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "white", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={generalSettings.alertOnApplication !== false}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, alertOnApplication: e.target.checked })}
                />
                <span><strong>New Student Application</strong> (Admissions ping)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "white", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={generalSettings.alertOnPayment !== false}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, alertOnPayment: e.target.checked })}
                />
                <span><strong>Payment Proof Submission</strong> (Finance ping)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "white", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={generalSettings.alertOnRepair !== false}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, alertOnRepair: e.target.checked })}
                />
                <span><strong>Instrument Repair Intake</strong> (Workshop ping)</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "white", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={generalSettings.alertOnEnquiry !== false}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, alertOnEnquiry: e.target.checked })}
                />
                <span><strong>General Portal Enquiry</strong> (Lead alert)</span>
              </label>
            </div>
          </div>

          {/* Mode & Testing */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
            <div style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid var(--line)" }}>
              <strong style={{ display: "block", fontSize: 13, marginBottom: 4 }}>WhatsApp Delivery Mode</strong>
              <div style={{ display: "flex", gap: 10, margin: "10px 0" }}>
                <button
                  type="button"
                  onClick={() => setGeneralSettings({ ...generalSettings, whatsappMode: "direct" })}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: generalSettings.whatsappMode !== "gateway" ? "2px solid #25D366" : "1px solid var(--line)",
                    background: generalSettings.whatsappMode !== "gateway" ? "rgba(37, 211, 102, 0.1)" : "#f8fafc",
                    color: generalSettings.whatsappMode !== "gateway" ? "#075e54" : "var(--muted)",
                  }}
                >
                  Direct Click-to-Chat (wa.me)
                </button>
                <button
                  type="button"
                  onClick={() => setGeneralSettings({ ...generalSettings, whatsappMode: "gateway" })}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: generalSettings.whatsappMode === "gateway" ? "2px solid #25D366" : "1px solid var(--line)",
                    background: generalSettings.whatsappMode === "gateway" ? "rgba(37, 211, 102, 0.1)" : "#f8fafc",
                    color: generalSettings.whatsappMode === "gateway" ? "#075e54" : "var(--muted)",
                  }}
                >
                  Automated Gateway / API
                </button>
              </div>
              <small style={{ color: "var(--muted)", fontSize: 11, display: "block", lineHeight: 1.4 }}>
                {generalSettings.whatsappMode === "gateway"
                  ? "Webhook POST sent to third-party SMS/WhatsApp gateway (Twilio, Meta Cloud API, Termii)."
                  : "Generates formatted WhatsApp chat links with candidate name, program, and status ready to dispatch."}
              </small>

              {generalSettings.whatsappMode === "gateway" && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <Field
                    id="cfg-wa-url"
                    label="Gateway Webhook URL"
                    value={generalSettings.whatsappGatewayUrl || ""}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, whatsappGatewayUrl: v })}
                    placeholder="https://api.gateway.com/v1/messages"
                  />
                  <Field
                    id="cfg-wa-token"
                    label="API Bearer Token"
                    value={generalSettings.whatsappApiToken || ""}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, whatsappApiToken: v })}
                    type="password"
                    placeholder="••••••••••••••••"
                  />
                </div>
              )}
            </div>

            {/* Test WhatsApp Action */}
            <div style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
              <strong style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Verify WhatsApp Dispatch</strong>
              <small style={{ color: "var(--muted)", fontSize: 11, marginBottom: 12 }}>
                Sends a test notification payload to <strong>{generalSettings.schoolWhatsapp}</strong>.
              </small>

              <div style={{ marginTop: "auto" }}>
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  disabled={testingWa}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#25D366",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <WhatsAppIcon size={16} fill="white" />
                  {testingWa ? "Generating Test…" : "Send Test WhatsApp Alert"}
                </button>

                {testWaResult && (
                  <div style={{ marginTop: 12, padding: 10, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6 }}>
                    <span style={{ fontSize: 11, color: "#166534", fontWeight: 600, display: "block", marginBottom: 6 }}>
                      ✓ {testWaResult.message}
                    </span>
                    {testWaResult.wa_link && (
                      <a
                        href={testWaResult.wa_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#15803d",
                          textDecoration: "underline",
                        }}
                      >
                        Launch WhatsApp Web/App with Test Message ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: EMAIL NOTIFICATION ENGINE */}
        <div className="editor-section" style={{ margin: 0, border: "1px solid rgba(201, 107, 50, 0.4)", background: "#fffdfb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid rgba(201, 107, 50, 0.2)", paddingBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--gold)", color: "white", display: "grid", placeItems: "center" }}>
                <Icon name="mail" size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none", color: "#a24a18" }}>Email Notification Engine</h3>
                <small style={{ color: "var(--muted)" }}>Deliver instantaneous HTML alerts for new applications and payment receipts.</small>
              </div>
            </div>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: generalSettings.emailAlerts ? "rgba(201, 107, 50, 0.15)" : "#f1f5f9",
                color: generalSettings.emailAlerts ? "#a24a18" : "#64748b",
              }}
            >
              {generalSettings.emailAlerts ? "● Email Alerts Active" : "○ Email Alerts Disabled"}
            </span>
          </div>

          {/* Master Email Switch */}
          <div className="switch-row" style={{ padding: 14, background: "white", borderRadius: 8, border: "1px solid var(--line)", marginBottom: 14 }}>
            <div>
              <strong style={{ color: "#a24a18" }}>Enable Academy Email Alert Dispatcher</strong>
              <span>Send instantaneous emails to admissions staff when candidates submit applications</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={generalSettings.emailAlerts}
                onChange={(e) => setGeneralSettings({ ...generalSettings, emailAlerts: e.target.checked })}
                aria-label="Email alerts"
              />
              <i aria-hidden="true" />
            </label>
          </div>

          {/* Student Confirmation Switch */}
          <div className="switch-row" style={{ padding: 14, background: "white", borderRadius: 8, border: "1px solid var(--line)", marginBottom: 18 }}>
            <div>
              <strong>Student Automated Confirmation Email</strong>
              <span>Automatically send candidate a welcome email with their application reference number</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={generalSettings.studentEmailConfirmation !== false}
                onChange={(e) => setGeneralSettings({ ...generalSettings, studentEmailConfirmation: e.target.checked })}
                aria-label="Student confirmation email"
              />
              <i aria-hidden="true" />
            </label>
          </div>

          {/* Email Transport Configuration */}
          <div style={{ background: "white", padding: 18, borderRadius: 8, border: "1px solid var(--line)", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <strong style={{ fontSize: 13, color: "var(--navy)" }}>Email Transport Method</strong>
                <small style={{ color: "var(--muted)", display: "block" }}>Select server mail() or configure external SMTP credentials (Gmail, SendGrid, Mailgun).</small>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSmtpActive(false)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: !smtpActive ? "2px solid var(--gold)" : "1px solid var(--line)",
                    background: !smtpActive ? "rgba(201, 107, 50, 0.1)" : "#f8fafc",
                    color: !smtpActive ? "#a24a18" : "var(--muted)",
                  }}
                >
                  Server PHP mail()
                </button>
                <button
                  type="button"
                  onClick={() => setSmtpActive(true)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: smtpActive ? "2px solid var(--gold)" : "1px solid var(--line)",
                    background: smtpActive ? "rgba(201, 107, 50, 0.1)" : "#f8fafc",
                    color: smtpActive ? "#a24a18" : "var(--muted)",
                  }}
                >
                  Custom SMTP Server
                </button>
              </div>
            </div>

            {smtpActive && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                <div className="form-grid" style={{ marginBottom: 12 }}>
                  <Field
                    id="cfg-smtp-host"
                    label="SMTP Host"
                    value={generalSettings.smtpHost || ""}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, smtpHost: v })}
                    placeholder="e.g. smtp.gmail.com or mail.vivadoxa.ng"
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Field
                      id="cfg-smtp-port"
                      label="Port"
                      value={String(generalSettings.smtpPort || 587)}
                      onChange={(v) => setGeneralSettings({ ...generalSettings, smtpPort: Number(v) || 587 })}
                      placeholder="587"
                    />
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
                        Encryption
                      </label>
                      <select
                        value={generalSettings.smtpEncryption || "tls"}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, smtpEncryption: e.target.value })}
                        style={{ width: "100%", minHeight: 40, borderRadius: 6, border: "1px solid var(--line)", padding: "0 10px", background: "white", fontSize: 13 }}
                      >
                        <option value="tls">STARTTLS (Port 587)</option>
                        <option value="ssl">SSL / TLS (Port 465)</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: 12 }}>
                  <Field
                    id="cfg-smtp-user"
                    label="SMTP Username / Account Email"
                    value={generalSettings.smtpUser || ""}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, smtpUser: v })}
                    placeholder="admissions@vivadoxa.ng or vivadoxa@gmail.com"
                  />
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <label htmlFor="cfg-smtp-pass" style={{ fontSize: 11, fontWeight: 700 }}>
                        SMTP Password / App Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        style={{ border: "none", background: "none", color: "var(--gold)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                      >
                        {showSmtpPass ? "Hide" : "Reveal"}
                      </button>
                    </div>
                    <input
                      id="cfg-smtp-pass"
                      type={showSmtpPass ? "text" : "password"}
                      value={generalSettings.smtpPass || ""}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, smtpPass: e.target.value })}
                      placeholder="••••••••••••••••"
                      style={{ width: "100%", minHeight: 40, borderRadius: 6, border: "1px solid var(--line)", padding: "0 10px", background: "white", fontSize: 13 }}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <Field
                    id="cfg-from-email"
                    label="Sender 'From' Email"
                    value={generalSettings.fromEmail || "admissions@vivadoxa.ng"}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, fromEmail: v })}
                  />
                  <Field
                    id="cfg-from-name"
                    label="Sender Display Name"
                    value={generalSettings.fromName || "Vivadoxa Music Academy Admissions"}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, fromName: v })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Email Dispatcher */}
          <div style={{ background: "white", padding: 16, borderRadius: 8, border: "1px solid var(--line)" }}>
            <strong style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Verify Email Pipeline (Live Test)</strong>
            <small style={{ color: "var(--muted)", fontSize: 11, display: "block", marginBottom: 12 }}>
              Dispatch a styled test notification to confirm that email dispatch is fully operational.
            </small>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <Field
                  id="test-email-recip"
                  label="Test Recipient Email"
                  value={testEmailRecipient}
                  onChange={setTestEmailRecipient}
                  placeholder="e.g. vivadoxa@gmail.com"
                />
              </div>
              <Button type="button" onClick={handleTestEmail} disabled={testingEmail}>
                {testingEmail ? "Sending Verification…" : "Send Test Email"}
              </Button>
            </div>

            {testEmailResult && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 12,
                  background: testEmailResult.success ? "#f0fdf4" : "#fef2f2",
                  border: testEmailResult.success ? "1px solid #86efac" : "1px solid #fecaca",
                  color: testEmailResult.success ? "#166534" : "#991b1b",
                }}
              >
                <strong>{testEmailResult.success ? "✓ Test Dispatch Result:" : "✕ Delivery Warning:"}</strong>
                <p style={{ margin: "4px 0 0" }}>{testEmailResult.message || testEmailResult.error}</p>
                {testEmailResult.simulated && (
                  <small style={{ display: "block", marginTop: 4, color: "#854d0e" }}>
                    Note: Running on local development server without sendmail postfix daemon. The notification was verified and safely recorded in your System Notification Audit Log.
                  </small>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: SYSTEM NOTIFICATION AUDIT TRAIL */}
        <div className="editor-section" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, paddingBottom: 0, border: "none" }}>Live System Notification Audit Trail</h3>
              <small style={{ color: "var(--muted)" }}>Audit history of all recent WhatsApp and Email alerts triggered across Vivadoxa.</small>
            </div>
            <Button variant="ghost" onClick={loadLogs}>
              Refresh Logs
            </Button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fbfaf8", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Channel</th>
                  <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Recipient</th>
                  <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Subject / Event</th>
                  <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "10px 14px", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>
                      Loading audit records…
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                      No recent notifications recorded yet. Submit a test application or dispatch a test email above!
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 15).map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--line)", fontSize: 12 }}>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontWeight: 700,
                            fontSize: 10,
                            textTransform: "uppercase",
                            background: log.channel === "whatsapp" ? "rgba(37, 211, 102, 0.15)" : "rgba(201, 107, 50, 0.15)",
                            color: log.channel === "whatsapp" ? "#075e54" : "#a24a18",
                          }}
                        >
                          {log.channel === "whatsapp" ? <WhatsAppIcon size={12} /> : <Icon name="mail" size={12} />}
                          {log.channel}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--navy)" }}>
                        <code>{log.recipient}</code>
                      </td>
                      <td style={{ padding: "10px 14px", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.subject}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: log.status === "sent" ? "#dcfce7" : log.status === "logged" ? "#fef9c3" : "#fee2e2",
                            color: log.status === "sent" ? "#166534" : log.status === "logged" ? "#854d0e" : "#991b1b",
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 11 }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View (No Horizontal Scrolling) */}
          <div className="block md:hidden">
            {loadingLogs ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                Loading audit records…
              </div>
            ) : logs.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
                No recent notifications recorded yet. Submit a test application or dispatch a test email above!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {logs.slice(0, 15).map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: "#fbfaf8",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontWeight: 700,
                          fontSize: 10,
                          textTransform: "uppercase",
                          background: log.channel === "whatsapp" ? "rgba(37, 211, 102, 0.15)" : "rgba(201, 107, 50, 0.15)",
                          color: log.channel === "whatsapp" ? "#075e54" : "#a24a18",
                        }}
                      >
                        {log.channel === "whatsapp" ? <WhatsAppIcon size={12} /> : <Icon name="mail" size={12} />}
                        {log.channel}
                      </span>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background: log.status === "sent" ? "#dcfce7" : log.status === "logged" ? "#fef9c3" : "#fee2e2",
                          color: log.status === "sent" ? "#166534" : log.status === "logged" ? "#854d0e" : "#991b1b",
                        }}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>
                      {log.subject}
                    </div>

                    <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                      <code style={{ fontSize: 11 }}>{log.recipient}</code>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Save Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, background: "white", padding: 16, borderRadius: 8, border: "1px solid var(--line)" }}>
          {savedNotice && (
            <span style={{ fontSize: 13, color: "#157054", fontWeight: 700 }}>
              ✓ {savedNotice}
            </span>
          )}
          <Button type="submit">
            Save Communications &amp; Notification Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}
