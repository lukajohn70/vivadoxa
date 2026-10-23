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
  purgeMockData,
  verifyBankAccount,
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
// 2. PAYMENT SETTINGS VIEW (WITH REAL BANK ACCOUNT AUTHENTICATION)
// ═════════════════════════════════════════════════════════════════════════════════
const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Zenith Bank", code: "057" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Stanbic IBTC Bank", code: "039" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "Sterling Bank", code: "232" },
  { name: "Wema Bank / ALAT", code: "035" },
  { name: "Polaris Bank", code: "076" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Keystone Bank", code: "082" },
  { name: "OPay Digital Services", code: "999992" },
  { name: "Palmpay", code: "999991" },
  { name: "Kuda Microfinance Bank", code: "50211" },
  { name: "Moniepoint Microfinance Bank", code: "50515" },
]

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

  // Bank Authentication State
  const initialBank = NIGERIAN_BANKS.find(
    (b) => b.name.toLowerCase() === (bankSettings.bankName || "").toLowerCase()
  )
  const [selectedBankCode, setSelectedBankCode] = useState(initialBank?.code || "044")
  const [verifying, setVerifying] = useState(false)
  const [authStatus, setAuthStatus] = useState<{
    verified: boolean
    accountName?: string
    error?: string
    method?: string
  } | null>(null)

  async function handleVerifyAccount() {
    const rawNo = (bankSettings.accountNumber || "").replace(/\D/g, "")
    if (rawNo.length !== 10) {
      setAuthStatus({
        verified: false,
        error: "Nigerian bank account number must be exactly 10 digits.",
      })
      return
    }

    setVerifying(true)
    setAuthStatus(null)

    try {
      const res = await verifyBankAccount({
        account_number: rawNo,
        bank_code: selectedBankCode,
        bank_name: bankSettings.bankName,
        paystackSecretKey: bankSettings.paystackSecretKey,
      })

      if (res.success && res.verified) {
        setAuthStatus({
          verified: true,
          accountName: res.account_name,
          method: res.method,
        })
        if (res.account_name) {
          setBankSettings((prev) => ({
            ...prev,
            accountName: res.account_name || prev.accountName,
          }))
        }
        setActionNotice(`✓ Account successfully authenticated: ${res.account_name}`)
      } else {
        setAuthStatus({
          verified: false,
          error: res.error || "Account could not be verified for this bank.",
        })
      }
    } catch (err: any) {
      setAuthStatus({
        verified: false,
        error: err.message || "Network error verifying account.",
      })
    } finally {
      setVerifying(false)
    }
  }

  function handleBankChange(code: string) {
    setSelectedBankCode(code)
    const match = NIGERIAN_BANKS.find((b) => b.code === code)
    if (match) {
      setBankSettings((prev) => ({ ...prev, bankName: match.name }))
      setAuthStatus(null)
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    saveBankSettings(bankSettings)
    setActionNotice("School bank account and Paystack gateway configurations saved successfully. Reflected dynamically on website checkout.")
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
            Configure official school bank account details displayed to applicants on the website checkout.
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
                <small style={{ color: "var(--muted)" }}>Directly displayed on the website payment page for tuition transfers.</small>
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

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Bank Name Selector */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 5, color: "var(--navy)" }}>
                  Bank Institution *
                </label>
                <select
                  value={selectedBankCode}
                  onChange={(e) => handleBankChange(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 40,
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    padding: "0 10px",
                    background: "white",
                    fontSize: 13,
                  }}
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number with Verification Action */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label htmlFor="cfg-account-no" style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)" }}>
                    NUBAN Account Number (10 Digits) *
                  </label>
                  <button
                    type="button"
                    onClick={handleVerifyAccount}
                    disabled={verifying}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--gold)",
                      fontSize: 11,
                      cursor: "pointer",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {verifying ? "Authenticating…" : "🔍 Authenticate Account"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    id="cfg-account-no"
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 1906950275"
                    value={bankSettings.accountNumber}
                    onChange={(e) => {
                      setBankSettings({ ...bankSettings, accountNumber: e.target.value.replace(/\D/g, "") })
                      setAuthStatus(null)
                    }}
                    required
                    style={{
                      flex: 1,
                      minHeight: 40,
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      padding: "0 10px",
                      background: "white",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "1px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleVerifyAccount}
                    disabled={verifying}
                    style={{ padding: "0 14px", fontSize: 12 }}
                  >
                    {verifying ? "Checking…" : "Verify"}
                  </Button>
                </div>

                {/* Authentication Feedback Banner */}
                {authStatus && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 12px",
                      borderRadius: 6,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: authStatus.verified ? "#f0fdf4" : "#fef2f2",
                      border: authStatus.verified ? "1px solid #86efac" : "1px solid #fecaca",
                      color: authStatus.verified ? "#166534" : "#991b1b",
                    }}
                  >
                    <Icon name={authStatus.verified ? "check" : "warning"} size={14} />
                    <span>
                      {authStatus.verified ? (
                        <>
                          <strong>Authenticated Account:</strong> {authStatus.accountName} (CBN NUBAN Verified)
                        </>
                      ) : (
                        authStatus.error
                      )}
                    </span>
                  </div>
                )}
              </div>

              <Field
                id="cfg-account-name"
                label="Official Account Name *"
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
            <div style={{ marginTop: 20, padding: 18, background: "var(--navy)", color: "white", borderRadius: 10, border: "1px solid rgba(201,107,50,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                  Live Website Checkout Display
                </span>
                <span style={{ fontSize: 11, color: "#9dafbc", fontWeight: 600 }}>{bankSettings.bankName}</span>
              </div>
              <div style={{ fontSize: 24, letterSpacing: 2.5, fontWeight: 700, margin: "6px 0", color: "#ffffff", fontFamily: "monospace" }}>
                {bankSettings.accountNumber || "— — — — — — — — — —"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#cbd5e1" }}>
                <span style={{ fontWeight: 600 }}>{bankSettings.accountName}</span>
                <span>{bankSettings.branch}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Online Payment Gateway (Paystack) */}
          <div className="editor-section" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none" }}>Online Payment Gateway (Paystack)</h3>
                <small style={{ color: "var(--muted)" }}>Optional automated debit card, bank app, and USSD payments.</small>
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
                  <label htmlFor="cfg-paystack-sk" style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)" }}>
                    Paystack Secret Key (Used for Bank Account Verification)
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

  // Database purge state
  const [purging, setPurging] = useState(false)
  const [showPurgeModal, setShowPurgeModal] = useState(false)
  const [purgeConfirmationInput, setPurgeConfirmationInput] = useState("")
  const [purgeError, setPurgeError] = useState("")
  const [purgeSuccess, setPurgeSuccess] = useState("")

  async function handleExecutePurge() {
    if (purgeConfirmationInput.trim().toUpperCase() !== "PURGE") {
      setPurgeError('Please type "PURGE" in all uppercase to confirm.')
      return
    }
    setPurging(true)
    setPurgeError("")
    try {
      const res = await purgeMockData("PURGE")
      if (res.success) {
        setPurgeSuccess("Database successfully purged! All mock and test customer records have been wiped clean.")
        setActionNotice("Database successfully purged of all mock records.")
        setShowPurgeModal(false)
        setPurgeConfirmationInput("")
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      } else {
        setPurgeError(res.error || "Failed to purge database.")
      }
    } catch (err: any) {
      setPurgeError(err.message || "Network error while purging.")
    } finally {
      setPurging(false)
    }
  }

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

        {/* SECTION 2: PRACTICAL NOTIFICATION PREFERENCES */}
        <div className="editor-section" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: "0 0 4px", paddingBottom: 0, border: "none" }}>Instant Alerts &amp; Notifications</h3>
              <small style={{ color: "var(--muted)" }}>Toggle real-time alerts for staff and automated confirmations for incoming students.</small>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* WhatsApp Alerts Toggle */}
            <div className="switch-row" style={{ padding: 14, background: "#fafdfb", borderRadius: 8, border: "1px solid rgba(37, 211, 102, 0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#25D366", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <WhatsAppIcon size={18} fill="white" />
                </div>
                <div>
                  <strong style={{ color: "#075e54", display: "block" }}>WhatsApp Instant Staff Alerts</strong>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Generate instant WhatsApp notification alerts to <strong>{generalSettings.schoolWhatsapp || "school contact"}</strong> when forms are submitted.
                  </span>
                </div>
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

            {/* Email Alerts Toggle */}
            <div className="switch-row" style={{ padding: 14, background: "#fffdfb", borderRadius: 8, border: "1px solid rgba(201, 107, 50, 0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name="mail" size={16} />
                </div>
                <div>
                  <strong style={{ color: "#a24a18", display: "block" }}>Email Staff Notifications</strong>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Send notifications to <strong>{generalSettings.schoolEmail || "admissions email"}</strong> upon new applications and enquiries.
                  </span>
                </div>
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

            {/* Student Welcome Email Toggle */}
            <div className="switch-row" style={{ padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--navy)", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name="check" size={16} />
                </div>
                <div>
                  <strong style={{ display: "block" }}>Student Application Confirmation</strong>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Automatically email applicant their official registration reference number upon submission.
                  </span>
                </div>
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

            {/* Alert Event Types */}
            <div style={{ marginTop: 8, padding: 14, background: "#faf9f6", borderRadius: 8, border: "1px solid var(--line)" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--gold-text)", marginBottom: 10 }}>
                Active Alert Triggers
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={generalSettings.alertOnApplication !== false}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, alertOnApplication: e.target.checked })}
                  />
                  <span>New Student Applications</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={generalSettings.alertOnPayment !== false}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, alertOnPayment: e.target.checked })}
                  />
                  <span>Payment Proof Submissions</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={generalSettings.alertOnRepair !== false}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, alertOnRepair: e.target.checked })}
                  />
                  <span>Instrument Repair Bookings</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={generalSettings.alertOnEnquiry !== false}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, alertOnEnquiry: e.target.checked })}
                  />
                  <span>General Contact Enquiries</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Database Hygiene & Mock Data Purge */}
        <div
          className="editor-section"
          style={{
            borderColor: "rgba(201, 107, 50, 0.3)",
            background: "#fbfaf8",
            marginTop: 18,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--navy)",
                  color: "var(--gold)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="trash" size={17} />
              </div>
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none", color: "var(--navy)", fontSize: 14, fontWeight: 700 }}>
                  Database Hygiene &amp; Test Data Purge
                </h3>
                <small style={{ color: "var(--muted)", display: "block", marginTop: 2, fontSize: 12 }}>
                  Safely wipes all test admissions, mock payments, repairs, contact messages, and schedules from MySQL.
                  Administrator accounts, academic courses, instructors, and settings are strictly preserved.
                </small>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPurgeModal(true)
                setPurgeError("")
                setPurgeConfirmationInput("")
              }}
              style={{
                borderColor: "#a24a18",
                color: "#a24a18",
                background: "white",
              }}
            >
              Purge Online Mock Data…
            </Button>
          </div>

          {purgeSuccess && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                borderRadius: 6,
                background: "#f4ece4",
                color: "#a24a18",
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid #ebdcd0",
              }}
            >
              ✓ {purgeSuccess}
            </div>
          )}
        </div>

        {/* Purge Confirmation Modal */}
        {showPurgeModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "grid",
              placeItems: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                background: "white",
                maxWidth: 480,
                width: "100%",
                borderRadius: 12,
                padding: 28,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#fdf5ec",
                    color: "var(--gold-text)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon name="trash" size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, color: "var(--navy)", fontWeight: 700 }}>
                    Confirm Database Purge
                  </h3>
                  <small style={{ color: "var(--muted)", fontSize: 12 }}>
                    This action wipes all mock and test customer records
                  </small>
                </div>
              </div>

              <div
                style={{
                  background: "#faf9f6",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "var(--ink)",
                  marginBottom: 18,
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--gold-text)", marginBottom: 4 }}>
                  The following MySQL tables will be truncated to 0:
                </div>
                <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
                  <li><code>applications</code> (all test admissions)</li>
                  <li><code>payments</code> (all mock transaction records)</li>
                  <li><code>repairs</code> (all test repair workshop requests)</li>
                  <li><code>enquiries</code> (all contact inquiries)</li>
                  <li><code>students</code> &amp; <code>schedule_requests</code></li>
                </ul>
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)" }}>
                  ✓ <strong>Preserved:</strong> Your admin accounts, passwords, academy course catalog, faculty instructors, and cohorts will remain untouched.
                </div>
              </div>

              {purgeError && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#fef2f2",
                    color: "#991b1b",
                    fontSize: 12,
                    borderRadius: 6,
                    marginBottom: 14,
                    border: "1px solid #fecaca",
                  }}
                >
                  {purgeError}
                </div>
              )}

              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--navy)" }}>
                To confirm, please type <code style={{ color: "var(--gold-text)" }}>PURGE</code> in uppercase:
              </label>
              <input
                type="text"
                value={purgeConfirmationInput}
                onChange={(e) => setPurgeConfirmationInput(e.target.value)}
                placeholder="Type PURGE"
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  marginBottom: 18,
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPurgeModal(false)}
                  disabled={purging}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleExecutePurge}
                  disabled={purging || purgeConfirmationInput.trim().toUpperCase() !== "PURGE"}
                  style={{
                    background: "var(--navy)",
                    color: "white",
                  }}
                >
                  {purging ? "Purging Database…" : "Permanently Purge Mock Records"}
                </Button>
              </div>
            </div>
          </div>
        )}

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
