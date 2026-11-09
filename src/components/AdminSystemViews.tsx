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
  testWhatsAppNotification,
  fetchNotificationLogs,
  verifyBankAccount,
  fetchPortalUsers,
  togglePortalUserActive,
  changePortalUserPassword,
  changeStaffPassword,
  type PortalAccountUser,
} from "@/lib/api"

// ═════════════════════════════════════════════════════════════════════════════════
// 1. STAFF & ROLES VIEW
// ═════════════════════════════════════════════════════════════════════════════════
export function StaffAndRolesView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [activeAccountTab, setActiveAccountTab] = useState<"staff" | "portal">("staff")

  // Staff States
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null)

  // Portal Users States
  const [portalUsers, setPortalUsers] = useState<PortalAccountUser[]>([])
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalSearch, setPortalSearch] = useState("")
  const [portalStatusFilter, setPortalStatusFilter] = useState<"all" | "active" | "disabled">("all")

  // Shared Password Reset Modal State
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean
    type: "staff" | "portal"
    target: { id: number; name: string; email: string } | null
  }>({
    isOpen: false,
    type: "staff",
    target: null,
  })
  const [newPasswordValue, setNewPasswordValue] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  // Staff Form states
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

  const loadPortalUsers = async () => {
    setPortalLoading(true)
    try {
      const data = await fetchPortalUsers()
      setPortalUsers(data || [])
    } catch {
      setPortalUsers([])
    } finally {
      setPortalLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
    loadPortalUsers()
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
    if (
      !confirm(
        `Are you sure you want to permanently remove staff account for "${staff.name}" (${staff.email})?`,
      )
    ) {
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

  // ── Portal User Actions ────────────────────────────────────────────────────
  async function handleTogglePortalUser(user: PortalAccountUser) {
    const res = await togglePortalUserActive(user.id)
    if (res.success) {
      setActionNotice(res.message || "Account status updated.")
      loadPortalUsers()
    } else {
      setActionNotice(res.error || "Failed to update account access.")
    }
  }

  function openPasswordModal(type: "staff" | "portal", target: { id: number; name: string; email: string }) {
    setPasswordModal({
      isOpen: true,
      type,
      target,
    })
    setNewPasswordValue("VdxPass" + Math.floor(100 + Math.random() * 900) + "!")
    setPasswordError("")
  }

  async function handleSaveNewPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordModal.target) return
    if (!newPasswordValue.trim() || newPasswordValue.trim().length < 6) {
      setPasswordError("Password must be at least 6 characters.")
      return
    }

    setPasswordSaving(true)
    setPasswordError("")
    try {
      if (passwordModal.type === "staff") {
        const res = await changeStaffPassword(passwordModal.target.id, newPasswordValue.trim())
        if (res.success) {
          setActionNotice(`Password updated successfully for staff "${passwordModal.target.name}".`)
          setPasswordModal({ isOpen: false, type: "staff", target: null })
        } else {
          setPasswordError(res.error || "Failed to update staff password.")
        }
      } else {
        const res = await changePortalUserPassword(passwordModal.target.id, newPasswordValue.trim())
        if (res.success) {
          setActionNotice(`Password updated successfully for portal account "${passwordModal.target.name}".`)
          setPasswordModal({ isOpen: false, type: "portal", target: null })
        } else {
          setPasswordError(res.error || "Failed to update portal user password.")
        }
      }
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred while resetting password.")
    } finally {
      setPasswordSaving(false)
    }
  }

  const filteredPortalUsers = portalUsers.filter((u) => {
    const q = portalSearch.toLowerCase()
    const matchesSearch =
      !portalSearch ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))

    const isUserActive = Boolean(u.is_active)
    const matchesStatus =
      portalStatusFilter === "all" ||
      (portalStatusFilter === "active" && isUserActive) ||
      (portalStatusFilter === "disabled" && !isUserActive)

    return matchesSearch && matchesStatus
  })

  interface RoleBadge {
    label: string
    bg: string
    color: string
  }

  const roleBadges: Record<string, RoleBadge> = {
    superadmin: {
      label: "Super Administrator",
      bg: "#702064",
      color: "#ffffff",
    },
    admissions: {
      label: "Admissions Officer",
      bg: "rgba(21, 112, 84, 0.15)",
      color: "#157054",
    },
    finance: {
      label: "Financial Officer",
      bg: "rgba(201, 107, 50, 0.15)",
      color: "#a24a18",
    },
    workshop: {
      label: "Workshop Lead",
      bg: "rgba(31, 110, 165, 0.15)",
      color: "#1f6ea5",
    },
    staff: { label: "General Staff", bg: "#eef1f4", color: "#475569" },
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {showAddModal ? (
        /* ── Add / Edit Staff Dedicated Page ────────────────────────── */
        <div
          className="admin-page-view"
          style={{
            maxWidth: 720,
            margin: "0 auto",
            width: "100%",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 14,
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
                  ← Back to Accounts
                </button>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>/</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  {editingAdmin ? "Edit Staff Account" : "Add Staff Administrator"}
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
                {editingAdmin ? "Edit Staff Account" : "Add Staff Administrator"}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--muted)" }}>
                Configure administrative credentials, departmental role, and access scope.
              </p>
            </div>

            <form onSubmit={handleSaveStaff}>
              <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
                {formError && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#fee2e2",
                      border: "1px solid #f87171",
                      borderRadius: 6,
                      color: "#991b1b",
                      fontSize: 12,
                    }}
                  >
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
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      marginBottom: 5,
                    }}
                  >
                    Assigned Administrative Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
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
                    <option value="admissions">Admissions Officer</option>
                    <option value="finance">Financial Officer</option>
                    <option value="workshop">Workshop Lead</option>
                    <option value="staff">General Academy Staff</option>
                    <option value="superadmin">
                      Super Administrator (Full Privileges)
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
                    {editingAdmin
                      ? "Reset Password (leave blank to keep current)"
                      : "Temporary Password"}
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      editingAdmin
                        ? "Leave blank to keep unchanged"
                        : "Create password"
                    }
                    style={{
                      width: "100%",
                      minHeight: 40,
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      padding: "0 10px",
                      background: "white",
                      fontSize: 13,
                    }}
                    required={!editingAdmin}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div
                style={{
                  padding: "16px 32px",
                  borderTop: "1px solid var(--line)",
                  background: "#faf8f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  ← Back to Accounts
                </Button>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Saving…"
                      : editingAdmin
                        ? "Update Account"
                        : "Create Staff Account"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
      {/* Top Banner & Sub-Tabs */}
      <div
        className="editor-head standalone"
        style={{
          background: "white",
          padding: "20px 24px",
          borderRadius: 10,
          border: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>
            User Accounts &amp; Access Control
          </h2>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
            Manage staff credentials, permissions, and student/client portal account logins.
          </p>
        </div>

        {/* Tab switch pills */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveAccountTab("staff")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid var(--line)",
              background: activeAccountTab === "staff" ? "var(--navy)" : "#fbfaf8",
              color: activeAccountTab === "staff" ? "white" : "var(--navy)",
            }}
          >
            Staff Administrators ({admins.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveAccountTab("portal")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid var(--line)",
              background: activeAccountTab === "portal" ? "var(--navy)" : "#fbfaf8",
              color: activeAccountTab === "portal" ? "white" : "var(--navy)",
            }}
          >
            Portal Students &amp; Clients ({portalUsers.length})
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 1. STAFF ADMINISTRATORS TAB                                             */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeAccountTab === "staff" && (
        <>
          {/* Header Action Button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={openAddModal} variant="primary">
              + Add Staff Administrator
            </Button>
          </div>

          {/* Metrics Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            <div
              style={{
                background: "white",
                padding: 18,
                borderRadius: 8,
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
                Total Staff Accounts
              </small>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color: "var(--navy)",
                  marginTop: 4,
                }}
              >
                {admins.length}
              </strong>
            </div>
            <div
              style={{
                background: "white",
                padding: 18,
                borderRadius: 8,
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
                Active Accounts
              </small>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color: "#157054",
                  marginTop: 4,
                }}
              >
                {admins.filter((a) => a.is_active).length}
              </strong>
            </div>
            <div
              style={{
                background: "white",
                padding: 18,
                borderRadius: 8,
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
                Super Administrators
              </small>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color: "#702064",
                  marginTop: 4,
                }}
              >
                {admins.filter((a) => a.role === "superadmin").length}
              </strong>
            </div>
            <div
              style={{
                background: "white",
                padding: 18,
                borderRadius: 8,
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
                Admissions &amp; Operations
              </small>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color: "#c96b32",
                  marginTop: 4,
                }}
              >
                {admins.filter((a) => a.role !== "superadmin").length}
              </strong>
            </div>
          </div>

          {/* Staff Table Panel */}
          <div
            style={{
              background: "white",
              borderRadius: 8,
              border: "1px solid var(--line)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 15 }}>Authorized Personnel</h3>
                <small style={{ color: "var(--muted)" }}>
                  Manage login privileges, role assignments, or reset passwords.
                </small>
              </div>
              <Button variant="ghost" onClick={loadStaff}>
                Refresh
              </Button>
            </div>

            {/* Desktop Table View */}
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
                      Staff Member
                    </th>
                    <th
                      style={{
                        padding: "12px 18px",
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Email / Login Alias
                    </th>
                    <th
                      style={{
                        padding: "12px 18px",
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      System Role
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
                      Last Login
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: 30,
                          textAlign: "center",
                          color: "var(--muted)",
                        }}
                      >
                        Loading staff records…
                      </td>
                    </tr>
                  ) : admins.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: 30,
                          textAlign: "center",
                          color: "var(--muted)",
                        }}
                      >
                        No staff records found.
                      </td>
                    </tr>
                  ) : (
                    admins.map((staff) => {
                      const roleInfo = roleBadges[staff.role] || roleBadges.staff
                      return (
                        <tr
                          key={staff.id}
                          style={{
                            borderBottom: "1px solid var(--line)",
                            fontSize: 13,
                          }}
                        >
                          <td style={{ padding: "14px 18px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <span
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background:
                                    staff.role === "superadmin"
                                      ? "#0b0b0b"
                                      : "var(--gold)",
                                  color: "white",
                                  display: "grid",
                                  placeItems: "center",
                                  fontWeight: 700,
                                  fontSize: 12,
                                }}
                              >
                                {staff.name
                                  ? staff.name.slice(0, 2).toUpperCase()
                                  : "AD"}
                              </span>
                              <div>
                                <strong>{staff.name}</strong>
                                {staff.id === 1 && (
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: 10,
                                      background: "#ffd700",
                                      color: "#000",
                                      padding: "1px 6px",
                                      borderRadius: 4,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            style={{ padding: "14px 18px", color: "var(--navy)" }}
                          >
                            <code>{staff.email}</code>
                          </td>
                          <td
                            style={{ padding: "14px 18px", whiteSpace: "nowrap" }}
                          >
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
                          <td
                            style={{ padding: "14px 18px", whiteSpace: "nowrap" }}
                          >
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
                                  background: staff.is_active
                                    ? "#157054"
                                    : "#b84646",
                                }}
                              />
                              {staff.is_active ? "Active" : "Deactivated"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "14px 18px",
                              color: "var(--muted)",
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {staff.last_login
                              ? new Date(staff.last_login).toLocaleString()
                              : "Never"}
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
                              <button
                                type="button"
                                onClick={() => openPasswordModal("staff", { id: staff.id, name: staff.name, email: staff.email })}
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
                                Password
                              </button>
                              {staff.id !== 1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(staff)}
                                    style={{
                                      padding: "4px 8px",
                                      fontSize: 11,
                                      background: staff.is_active
                                        ? "rgba(184, 70, 70, 0.1)"
                                        : "rgba(21, 112, 84, 0.1)",
                                      color: staff.is_active
                                        ? "#b84646"
                                        : "#157054",
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

            {/* Mobile Responsive Stacked Cards View */}
            <div className="block md:hidden" style={{ padding: 14 }}>
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 24,
                    color: "var(--muted)",
                    fontSize: 13,
                  }}
                >
                  Loading staff records…
                </div>
              ) : admins.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 24,
                    color: "var(--muted)",
                    fontSize: 13,
                  }}
                >
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
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background:
                                  staff.role === "superadmin"
                                    ? "#0b0b0b"
                                    : "var(--gold)",
                                color: "white",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 700,
                                fontSize: 12,
                                flexShrink: 0,
                              }}
                            >
                              {staff.name
                                ? staff.name.slice(0, 2).toUpperCase()
                                : "AD"}
                            </span>
                            <div>
                              <strong
                                style={{
                                  fontSize: 14,
                                  color: "var(--navy)",
                                  display: "block",
                                }}
                              >
                                {staff.name}
                              </strong>
                              {staff.id === 1 && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    background: "#ffd700",
                                    color: "#000",
                                    padding: "1px 5px",
                                    borderRadius: 4,
                                    fontWeight: 700,
                                  }}
                                >
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

                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--navy)",
                            background: "white",
                            padding: "8px 10px",
                            borderRadius: 6,
                            border: "1px solid #ede8de",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--muted)",
                              marginBottom: 2,
                            }}
                          >
                            LOGIN EMAIL
                          </div>
                          <code style={{ fontSize: 12, wordBreak: "break-all" }}>
                            {staff.email}
                          </code>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: 11,
                            color: "var(--muted)",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              color: staff.is_active ? "#157054" : "#b84646",
                              fontWeight: 600,
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: staff.is_active ? "#157054" : "#b84646",
                              }}
                            />
                            {staff.is_active ? "Active" : "Deactivated"}
                          </span>
                          <span>
                            Last login:{" "}
                            {staff.last_login
                              ? new Date(staff.last_login).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            borderTop: "1px solid var(--line)",
                            paddingTop: 10,
                            marginTop: 2,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            style={{
                              flex: 1,
                              padding: "8px 10px",
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
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openPasswordModal("staff", { id: staff.id, name: staff.name, email: staff.email })}
                            style={{
                              padding: "8px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              background: "#f4f2ec",
                              border: "1px solid var(--line)",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            Password
                          </button>
                          {staff.id !== 1 && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(staff)}
                              style={{
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                background: staff.is_active
                                  ? "rgba(184, 70, 70, 0.1)"
                                  : "rgba(21, 112, 84, 0.1)",
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
          <div
            style={{
              background: "white",
              padding: 22,
              borderRadius: 8,
              border: "1px solid var(--line)",
            }}
          >
            <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--navy)" }}>
              Role &amp; Permissions Matrix
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 14,
              }}
            >
              <div
                style={{
                  padding: 14,
                  background: "#fcfbf9",
                  borderRadius: 6,
                  border: "1px solid #ebe7df",
                }}
              >
                <strong
                  style={{ color: "#702064", display: "block", fontSize: 13 }}
                >
                  Super Administrator
                </strong>
                <p
                  style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}
                >
                  Full system control: Operations, Academics, Staff management,
                  Payment configurations, and Notification dispatch channels.
                </p>
              </div>
              <div
                style={{
                  padding: 14,
                  background: "#fcfbf9",
                  borderRadius: 6,
                  border: "1px solid #ebe7df",
                }}
              >
                <strong
                  style={{ color: "#157054", display: "block", fontSize: 13 }}
                >
                  Admissions Officer
                </strong>
                <p
                  style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}
                >
                  Review student applications, approve/reject candidates, generate
                  admission offer letters, and enroll students into cohorts.
                </p>
              </div>
              <div
                style={{
                  padding: 14,
                  background: "#fcfbf9",
                  borderRadius: 6,
                  border: "1px solid #ebe7df",
                }}
              >
                <strong
                  style={{ color: "#a24a18", display: "block", fontSize: 13 }}
                >
                  Financial Officer
                </strong>
                <p
                  style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}
                >
                  Verify bank transfers and card payments, monitor revenue logs,
                  generate official payment receipts, and reconcile accounts.
                </p>
              </div>
              <div
                style={{
                  padding: 14,
                  background: "#fcfbf9",
                  borderRadius: 6,
                  border: "1px solid #ebe7df",
                }}
              >
                <strong
                  style={{ color: "#1f6ea5", display: "block", fontSize: 13 }}
                >
                  Workshop Lead
                </strong>
                <p
                  style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}
                >
                  Manage instrument repair requests, update repair diagnostic
                  stages, quote repair estimates, and notify customers.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 2. PORTAL STUDENTS & CLIENTS TAB                                      */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeAccountTab === "portal" && (
        <>
          {/* Metrics Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            <div
              style={{
                background: "white",
                padding: 18,
                borderRadius: 8,
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
                Total Portal Accounts
              </small>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color: "var(--navy)",
                  marginTop: 4,
                }}
              >
                {portalUsers.length}
              </strong>
            </div>
            <div
              style={{
                background: "white",
                padding: 18,
                borderRadius: 8,
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
                Active Logins
              </small>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color: "#157054",
                  marginTop: 4,
                }}
              >
                {portalUsers.filter((u) => Boolean(u.is_active)).length}
              </strong>
            </div>
            <div
              style={{
                background: "white",
                padding: 18,
                borderRadius: 8,
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
                Disabled Accounts
              </small>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color: "#b84646",
                  marginTop: 4,
                }}
              >
                {portalUsers.filter((u) => !Boolean(u.is_active)).length}
              </strong>
            </div>
            <div
              style={{
                background: "white",
                padding: 18,
                borderRadius: 8,
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
                Enrolled Students
              </small>
              <strong
                style={{
                  display: "block",
                  fontSize: 26,
                  color: "var(--gold)",
                  marginTop: 4,
                }}
              >
                {portalUsers.filter((u) => u.role === "student").length}
              </strong>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div
            style={{
              background: "white",
              padding: "16px 20px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 260 }}>
              <input
                type="text"
                placeholder="Search by student name, email, phone…"
                value={portalSearch}
                onChange={(e) => setPortalSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  background: "#fbfaf8",
                  fontSize: 13,
                }}
              />
              <select
                value={portalStatusFilter}
                onChange={(e: any) => setPortalStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  background: "white",
                  fontSize: 13,
                }}
              >
                <option value="all">All Accounts ({portalUsers.length})</option>
                <option value="active">Active Only ({portalUsers.filter((u) => Boolean(u.is_active)).length})</option>
                <option value="disabled">Disabled Only ({portalUsers.filter((u) => !Boolean(u.is_active)).length})</option>
              </select>
            </div>
            <Button variant="ghost" onClick={loadPortalUsers}>
              Refresh
            </Button>
          </div>

          {/* Portal Users Table */}
          <div
            style={{
              background: "white",
              borderRadius: 8,
              border: "1px solid var(--line)",
              overflow: "hidden",
            }}
          >
            {/* Desktop Table View */}
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
                      User Account
                    </th>
                    <th
                      style={{
                        padding: "12px 18px",
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Phone Number
                    </th>
                    <th
                      style={{
                        padding: "12px 18px",
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Login Status
                    </th>
                    <th
                      style={{
                        padding: "12px 18px",
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Account Type
                    </th>
                    <th
                      style={{
                        padding: "12px 18px",
                        fontSize: 11,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      Registered
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portalLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: 30,
                          textAlign: "center",
                          color: "var(--muted)",
                        }}
                      >
                        Loading portal user accounts…
                      </td>
                    </tr>
                  ) : filteredPortalUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: 30,
                          textAlign: "center",
                          color: "var(--muted)",
                        }}
                      >
                        No user accounts match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPortalUsers.map((user) => {
                      const isActive = Boolean(user.is_active)
                      const displayName = user.full_name || user.email
                      return (
                        <tr
                          key={user.id}
                          style={{
                            borderBottom: "1px solid var(--line)",
                            fontSize: 13,
                          }}
                        >
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: "#157054",
                                  color: "white",
                                  display: "grid",
                                  placeItems: "center",
                                  fontWeight: 700,
                                  fontSize: 12,
                                }}
                              >
                                {displayName ? displayName.slice(0, 2).toUpperCase() : "US"}
                              </span>
                              <div>
                                <strong style={{ display: "block" }}>{displayName}</strong>
                                <code style={{ fontSize: 11, color: "var(--muted)" }}>
                                  {user.email}
                                </code>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 18px" }}>
                            <span style={{ fontSize: 12, color: "var(--navy)" }}>
                              {user.phone || "—"}
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
                                color: isActive ? "#157054" : "#b84646",
                              }}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: isActive ? "#157054" : "#b84646",
                                }}
                              />
                              {isActive ? "Active Access" : "Disabled (Blocked)"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                                background: "#eef1f4",
                                color: "#475569",
                                textTransform: "capitalize",
                              }}
                            >
                              {user.role || "student"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "14px 18px",
                              color: "var(--muted)",
                              fontSize: 12,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td style={{ padding: "14px 18px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => openPasswordModal("portal", { id: user.id, name: displayName, email: user.email })}
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
                                Change Password
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePortalUser(user)}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: 11,
                                  background:
                                    isActive
                                      ? "rgba(184, 70, 70, 0.1)"
                                      : "rgba(21, 112, 84, 0.1)",
                                  color: isActive ? "#b84646" : "#157054",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontWeight: 600,
                                }}
                              >
                                {isActive ? "Disable Account" : "Enable Account"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="block md:hidden" style={{ padding: 14 }}>
              {portalLoading ? (
                <div style={{ textAlign: "center", padding: 24, color: "var(--muted)", fontSize: 13 }}>
                  Loading portal accounts…
                </div>
              ) : filteredPortalUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: 24, color: "var(--muted)", fontSize: 13 }}>
                  No user accounts match current search.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filteredPortalUsers.map((user) => {
                    const isActive = Boolean(user.is_active)
                    const displayName = user.full_name || user.email
                    return (
                      <div
                        key={user.id}
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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 14, color: "var(--navy)" }}>
                              {displayName}
                            </strong>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>
                              <code>{user.email}</code>
                              {user.phone ? ` · ${user.phone}` : ""}
                            </div>
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 11,
                              fontWeight: 700,
                              color: isActive ? "#157054" : "#b84646",
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: isActive ? "#157054" : "#b84646",
                              }}
                            />
                            {isActive ? "Active" : "Disabled"}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            borderTop: "1px solid var(--line)",
                            paddingTop: 10,
                            marginTop: 2,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => openPasswordModal("portal", { id: user.id, name: displayName, email: user.email })}
                            style={{
                              flex: 1,
                              padding: "8px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              background: "var(--navy)",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            Change Password
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePortalUser(user)}
                            style={{
                              padding: "8px 12px",
                              fontSize: 12,
                              fontWeight: 600,
                              background:
                                isActive
                                  ? "rgba(184, 70, 70, 0.1)"
                                  : "rgba(21, 112, 84, 0.1)",
                              color: isActive ? "#b84646" : "#157054",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            {isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

        </>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* QUICK PASSWORD RESET MODAL (STAFF & PORTAL USERS)                      */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {passwordModal.isOpen && passwordModal.target && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: 440 }}>
            <div className="modal-head">
              <h3>
                Change Password: {passwordModal.target.name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setPasswordModal({ isOpen: false, type: "staff", target: null })}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSaveNewPassword}
              className="modal-body"
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  background: "#fbfaf8",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                }}
              >
                Account: <strong>{passwordModal.target.name}</strong> (
                <code>{passwordModal.target.email}</code>)
                <div style={{ marginTop: 2, fontSize: 11 }}>
                  Type: {passwordModal.type === "staff" ? "Staff Administrator" : "Student / Portal User"}
                </div>
              </div>

              {passwordError && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fee2e2",
                    border: "1px solid #f87171",
                    borderRadius: 6,
                    color: "#991b1b",
                    fontSize: 12,
                  }}
                >
                  {passwordError}
                </div>
              )}

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setNewPasswordValue(
                        "VdxPass" + Math.floor(100 + Math.random() * 900) + "!",
                      )
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--gold)",
                      fontSize: 11,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    🎲 Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="Enter minimum 6 characters"
                  required
                  style={{
                    width: "100%",
                    minHeight: 40,
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    padding: "0 10px",
                    background: "white",
                    fontSize: 14,
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <Button
                  variant="ghost"
                  onClick={() =>
                    setPasswordModal({ isOpen: false, type: "staff", target: null })
                  }
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={passwordSaving}>
                  {passwordSaving ? "Updating Password…" : "Save New Password"}
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
  const [showSecretFlutterwave, setShowSecretFlutterwave] = useState(false)
  const [savedNotice, setSavedNotice] = useState("")

  // Bank Authentication State
  const initialBank = NIGERIAN_BANKS.find(
    (b) => b.name.toLowerCase() === (bankSettings.bankName || "").toLowerCase(),
  )
  const [selectedBankCode, setSelectedBankCode] = useState(
    initialBank?.code || "044",
  )
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
        setActionNotice(
          `✓ Account successfully authenticated: ${res.account_name}`,
        )
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
    setActionNotice(
      "School bank account, Paystack (₦) and Flutterwave / USD ($) gateway configurations saved successfully. Reflected dynamically on website checkout.",
    )
    setSavedNotice("Payment settings saved successfully!")
    setTimeout(() => setSavedNotice(""), 4000)
  }

  const isLive = (bankSettings.paystackPublicKey || "").startsWith("pk_live")
  const isFlutterwaveLive =
    (bankSettings.flutterwavePublicKey || "").startsWith("FLWPUBK-") &&
    !(bankSettings.flutterwavePublicKey || "").includes("TEST")

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner */}
      <div
        className="editor-head standalone"
        style={{
          background: "white",
          padding: 24,
          borderRadius: 10,
          border: "1px solid var(--line)",
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>
            Payment &amp; Tuition Configurations
          </h2>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
            Configure official school bank account details displayed to
            applicants on the website checkout.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 20,
          }}
        >
          {/* Section 1: Bank Transfer Details */}
          <div className="editor-section" style={{ margin: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none" }}>
                  School Bank Account &amp; Transfer Details
                </h3>
                <small style={{ color: "var(--muted)" }}>
                  Directly displayed on the website payment page for tuition
                  transfers.
                </small>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${bankSettings.accountNumber}\n${bankSettings.bankName}\n${bankSettings.accountName}`,
                  )
                  setActionNotice(
                    "Official bank account details copied to clipboard!",
                  )
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
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 5,
                    color: "var(--navy)",
                  }}
                >
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <label
                    htmlFor="cfg-account-no"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
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
                    {verifying ? "Authenticating…" : "Authenticate Account"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    id="cfg-account-no"
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 0236649229"
                    value={bankSettings.accountNumber}
                    onChange={(e) => {
                      setBankSettings({
                        ...bankSettings,
                        accountNumber: e.target.value.replace(/\D/g, ""),
                      })
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
                      border: authStatus.verified
                        ? "1px solid #86efac"
                        : "1px solid #fecaca",
                      color: authStatus.verified ? "#166534" : "#991b1b",
                    }}
                  >
                    <Icon
                      name={authStatus.verified ? "check" : "warning"}
                      size={14}
                    />
                    <span>
                      {authStatus.verified ? (
                        <>
                          <strong>Authenticated Account:</strong>{" "}
                          {authStatus.accountName} (CBN NUBAN Verified)
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
                label="Official Account Name"
                value={bankSettings.accountName}
                onChange={(v) =>
                  setBankSettings({ ...bankSettings, accountName: v })
                }
                required
              />
            </div>

            {/* Student Preview Card */}
            <div
              style={{
                marginTop: 20,
                padding: 20,
                background: "var(--navy)",
                color: "white",
                borderRadius: 12,
                border: "1px solid rgba(201,107,50,0.35)",
                boxShadow: "0 6px 20px rgba(11,26,44,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--gold)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 800,
                  }}
                >
                  Live Website Checkout Display
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#ffffff",
                    fontWeight: 700,
                    background: "rgba(255,255,255,0.15)",
                    padding: "4px 12px",
                    borderRadius: 6,
                    letterSpacing: "0.2px",
                  }}
                >
                  {bankSettings.bankName || "Guaranty Trust Bank (GTBank)"}
                </span>
              </div>
              <div
                style={{
                  fontSize: 26,
                  letterSpacing: 3,
                  fontWeight: 800,
                  margin: "8px 0 6px",
                  color: "#ffffff",
                  fontFamily: "monospace",
                }}
              >
                {bankSettings.accountNumber || "0236649229"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#e2e8f0",
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                }}
              >
                {bankSettings.accountName || "Fredrerick Chysantus"}
              </div>
            </div>
          </div>

          {/* Section 2: Online Payment Gateway (Paystack) */}
          <div
            className="editor-section"
            style={{ margin: 0, display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none" }}>
                  Online Payment Gateway (Paystack)
                </h3>
                <small style={{ color: "var(--muted)" }}>
                  Optional automated debit card, bank app, and USSD payments.
                </small>
              </div>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: isLive
                    ? "rgba(21, 112, 84, 0.15)"
                    : "rgba(201, 107, 50, 0.15)",
                  color: isLive ? "#157054" : "#c96b32",
                }}
              >
                {isLive ? "Live Mode" : "Test Mode"}
              </span>
            </div>

            <div
              className="switch-row"
              style={{
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <strong>Enable Paystack Gateway</strong>
                <span>
                  Allow applicants to pay tuition fees directly via card or bank
                  transfer
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(bankSettings.enablePaystack)}
                  onChange={(e) =>
                    setBankSettings({
                      ...bankSettings,
                      enablePaystack: e.target.checked,
                    })
                  }
                  aria-label="Enable Paystack"
                />
                <i aria-hidden="true" />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                flex: 1,
              }}
            >
              <Field
                id="cfg-paystack-pk"
                label="Paystack Public Key"
                value={bankSettings.paystackPublicKey || ""}
                onChange={(v) =>
                  setBankSettings({ ...bankSettings, paystackPublicKey: v })
                }
                placeholder="pk_live_... or pk_test_..."
              />

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <label
                    htmlFor="cfg-paystack-sk"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    Paystack Secret Key (Used for Bank Account Verification)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--gold)",
                      fontSize: 11,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {showSecret ? "Hide Key" : "Reveal Key"}
                  </button>
                </div>
                <input
                  id="cfg-paystack-sk"
                  type={showSecret ? "text" : "password"}
                  value={bankSettings.paystackSecretKey || ""}
                  onChange={(e) =>
                    setBankSettings({
                      ...bankSettings,
                      paystackSecretKey: e.target.value,
                    })
                  }
                  placeholder="sk_live_... or sk_test_..."
                  style={{
                    width: "100%",
                    minHeight: 40,
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    padding: "0 10px",
                    background: "white",
                    fontSize: 13,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "auto",
                  padding: 12,
                  background: "#f8f9fa",
                  borderRadius: 6,
                  border: "1px solid #e9ecef",
                }}
              >
                <small
                  style={{
                    display: "block",
                    color: "var(--muted)",
                    fontSize: 11,
                    marginBottom: 4,
                  }}
                >
                  Webhook Endpoint for Automated Verification:
                </small>
                <code
                  style={{
                    fontSize: 11,
                    wordBreak: "break-all",
                    color: "var(--navy)",
                  }}
                >
                  {window.location.origin}
                  {window.location.pathname.startsWith("/Vivadoxa")
                    ? "/Vivadoxa"
                    : ""}
                  /api/payments.php?webhook=paystack
                </code>
              </div>
            </div>
          </div>

          {/* Section 3: Diaspora & International Payment Gateway (USD / Dollars) */}
          <div
            className="editor-section"
            style={{ margin: 0, display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ margin: 0, paddingBottom: 0, border: "none" }}>
                  Diaspora &amp; International Students Gateway (USD / $)
                </h3>
                <small style={{ color: "var(--muted)" }}>
                  Automated international debit/credit card checkout via
                  Flutterwave.
                </small>
              </div>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: isFlutterwaveLive
                    ? "rgba(21, 112, 84, 0.15)"
                    : "rgba(201, 107, 50, 0.15)",
                  color: isFlutterwaveLive ? "#157054" : "#c96b32",
                }}
              >
                {isFlutterwaveLive ? "Live Mode" : "Test Mode"}
              </span>
            </div>

            <div
              className="switch-row"
              style={{
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <strong>Enable International USD Gateway</strong>
                <span>
                  Allow diaspora &amp; online students to pay tuition in US
                  Dollars ($) via Visa, Mastercard &amp; Amex
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={Boolean(bankSettings.enableFlutterwave)}
                  onChange={(e) =>
                    setBankSettings({
                      ...bankSettings,
                      enableFlutterwave: e.target.checked,
                    })
                  }
                  aria-label="Enable Flutterwave USD Gateway"
                />
                <i aria-hidden="true" />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                flex: 1,
              }}
            >
              <Field
                id="cfg-flutterwave-pk"
                label="Flutterwave Public Key (API Key)"
                value={bankSettings.flutterwavePublicKey || ""}
                onChange={(v) =>
                  setBankSettings({ ...bankSettings, flutterwavePublicKey: v })
                }
                placeholder="FLWPUBK-xxxxxxxxxxxxxxxxxxxxxxxx-X or FLWPUBK_TEST-..."
              />

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <label
                    htmlFor="cfg-flutterwave-sk"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    Flutterwave Secret Key
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setShowSecretFlutterwave(!showSecretFlutterwave)
                    }
                    style={{
                      border: "none",
                      background: "none",
                      color: "var(--gold)",
                      fontSize: 11,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {showSecretFlutterwave ? "Hide Key" : "Reveal Key"}
                  </button>
                </div>
                <input
                  id="cfg-flutterwave-sk"
                  type={showSecretFlutterwave ? "text" : "password"}
                  value={bankSettings.flutterwaveSecretKey || ""}
                  onChange={(e) =>
                    setBankSettings({
                      ...bankSettings,
                      flutterwaveSecretKey: e.target.value,
                    })
                  }
                  placeholder="FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxx-X or FLWSECK_TEST-..."
                  style={{
                    width: "100%",
                    minHeight: 40,
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    padding: "0 10px",
                    background: "white",
                    fontSize: 13,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "auto",
                  padding: 12,
                  background: "#f8f9fa",
                  borderRadius: 6,
                  border: "1px solid #e9ecef",
                }}
              >
                <small
                  style={{
                    display: "block",
                    color: "var(--muted)",
                    fontSize: 11,
                    marginBottom: 4,
                  }}
                >
                  Webhook Endpoint for USD Payments:
                </small>
                <code
                  style={{
                    fontSize: 11,
                    wordBreak: "break-all",
                    color: "var(--navy)",
                  }}
                >
                  {window.location.origin}
                  {window.location.pathname.startsWith("/Vivadoxa")
                    ? "/Vivadoxa"
                    : ""}
                  /api/payments.php?webhook=flutterwave
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 14,
            background: "white",
            padding: 16,
            borderRadius: 8,
            border: "1px solid var(--line)",
          }}
        >
          {savedNotice && (
            <span style={{ fontSize: 13, color: "#157054", fontWeight: 700 }}>
              ✓ {savedNotice}
            </span>
          )}
          <Button type="submit">Save Payment &amp; Gateway Settings</Button>
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
  const [smtpActive, setSmtpActive] = useState(
    Boolean(generalSettings.smtpHost),
  )
  const [savedNotice, setSavedNotice] = useState("")

  // Test states
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
    setActionNotice(
      "Academy communications, WhatsApp, and Email notification settings saved.",
    )
    setSavedNotice("Notification preferences saved successfully!")
    setTimeout(() => setSavedNotice(""), 4000)
  }

  async function handleTestWhatsApp() {
    setTestingWa(true)
    setTestWaResult(null)
    try {
      const res = await testWhatsAppNotification(
        generalSettings,
        generalSettings.schoolWhatsapp,
      )
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
      <div
        className="editor-head standalone"
        style={{
          background: "white",
          padding: 24,
          borderRadius: 10,
          border: "1px solid var(--line)",
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>
            Communications &amp; Notification Engine
          </h2>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 13 }}>
            Configure official school contact directory, and activate
            instantaneous WhatsApp and Email notifications.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        {/* SECTION 1: School Contact Details */}
        <div className="editor-section" style={{ margin: 0 }}>
          <h3 style={{ margin: "0 0 4px", paddingBottom: 0, border: "none" }}>
            Official Academy Contact Directory
          </h3>
          <small
            style={{
              color: "var(--muted)",
              display: "block",
              marginBottom: 16,
            }}
          >
            Displayed across website footers, consultation popups, and official
            communication dispatches.
          </small>

          <div className="form-grid">
            <Field
              id="cfg-school-phone"
              label="Primary Phone Number"
              value={generalSettings.schoolPhone}
              onChange={(v) =>
                setGeneralSettings({ ...generalSettings, schoolPhone: v })
              }
              required
            />
            <Field
              id="cfg-school-phone2"
              label="Secondary Support Phone"
              value={generalSettings.schoolPhone2}
              onChange={(v) =>
                setGeneralSettings({ ...generalSettings, schoolPhone2: v })
              }
            />
            <Field
              id="cfg-school-whatsapp"
              label="Official WhatsApp Contact"
              value={generalSettings.schoolWhatsapp}
              onChange={(v) =>
                setGeneralSettings({ ...generalSettings, schoolWhatsapp: v })
              }
              required
            />
            <Field
              id="cfg-school-email"
              label="Primary Operations Email"
              value={generalSettings.schoolEmail}
              onChange={(v) =>
                setGeneralSettings({ ...generalSettings, schoolEmail: v })
              }
              type="email"
              required
            />
            <Field
              id="cfg-official-gmail"
              label="Official Gmail Backup / Archive"
              value={generalSettings.officialGmail || "vivadoxa@gmail.com"}
              onChange={(v) =>
                setGeneralSettings({ ...generalSettings, officialGmail: v })
              }
              type="email"
              required
            />
          </div>
          <div style={{ marginTop: 14 }}>
            <Field
              id="cfg-school-addr"
              label="Campus &amp; Studio Address"
              value={
                generalSettings.schoolAddress ||
                "Kaduna Studio, Kaduna State, Nigeria"
              }
              onChange={(v) =>
                setGeneralSettings({ ...generalSettings, schoolAddress: v })
              }
            />
          </div>
          <div style={{ marginTop: 14 }}>
            <Field
              id="cfg-logo-url"
              label="Official Brand Logo URL (For Outgoing Emails &amp; Documents)"
              value={
                generalSettings.logoUrl ||
                "https://www.vivadoxamusic.com/vivadoxa-logo.png"
              }
              onChange={(v) =>
                setGeneralSettings({ ...generalSettings, logoUrl: v })
              }
              placeholder="https://www.vivadoxamusic.com/vivadoxa-logo.png"
            />
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 14px",
                background: "#0b0b0b",
                borderRadius: 8,
                border: "1px solid rgba(201,107,50,0.35)",
              }}
            >
              <img
                src={generalSettings.logoUrl || "https://www.vivadoxamusic.com/vivadoxa-logo.png"}
                alt="Vivadoxa Logo"
                style={{ height: 32, width: "auto", display: "block" }}
              />
              <span style={{ fontSize: 11, color: "#f2a672", fontWeight: 600, letterSpacing: 0.5 }}>
                Current Email Header Logo
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRACTICAL NOTIFICATION PREFERENCES */}
        <div className="editor-section" style={{ margin: 0 }}>
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
                style={{ margin: "0 0 4px", paddingBottom: 0, border: "none" }}
              >
                Instant Alerts &amp; Notifications
              </h3>
              <small style={{ color: "var(--muted)" }}>
                Toggle real-time alerts for staff and automated confirmations
                for incoming students.
              </small>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* WhatsApp Alerts Toggle */}
            <div
              className="switch-row"
              style={{
                padding: 14,
                background: "#fafdfb",
                borderRadius: 8,
                border: "1px solid rgba(37, 211, 102, 0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#25D366",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <WhatsAppIcon size={18} fill="white" />
                </div>
                <div>
                  <strong style={{ color: "#075e54", display: "block" }}>
                    WhatsApp Instant Staff Alerts
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Generate instant WhatsApp notification alerts to{" "}
                    <strong>
                      {generalSettings.schoolWhatsapp || "school contact"}
                    </strong>{" "}
                    when forms are submitted.
                  </span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={generalSettings.whatsappAlerts}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      whatsappAlerts: e.target.checked,
                    })
                  }
                  aria-label="WhatsApp alerts"
                />
                <i aria-hidden="true" />
              </label>
            </div>

            {/* Email Alerts Toggle */}
            <div
              className="switch-row"
              style={{
                padding: 14,
                background: "#fffdfb",
                borderRadius: 8,
                border: "1px solid rgba(201, 107, 50, 0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="mail" size={16} />
                </div>
                <div>
                  <strong style={{ color: "#a24a18", display: "block" }}>
                    Email Staff Notifications
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Send notifications to{" "}
                    <strong>
                      {generalSettings.schoolEmail || "admissions email"}
                    </strong>{" "}
                    upon new applications and enquiries.
                  </span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={generalSettings.emailAlerts}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      emailAlerts: e.target.checked,
                    })
                  }
                  aria-label="Email alerts"
                />
                <i aria-hidden="true" />
              </label>
            </div>

            {/* Official Gmail Backup Toggle */}
            <div
              className="switch-row"
              style={{
                padding: 14,
                border: "1px solid var(--line)",
                borderRadius: 8,
                background: "rgba(201,107,50,0.04)",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "rgba(201,107,50,0.14)",
                    color: "var(--gold-text)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="mail" size={16} />
                </div>
                <div>
                  <strong style={{ color: "#a24a18", display: "block" }}>
                    Copy Every Form & Notification to Official Gmail
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Always route a backup / BCC of all form submissions and receipts to{" "}
                    <strong>{generalSettings.officialGmail || "vivadoxa@gmail.com"}</strong>.
                  </span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={generalSettings.copyOfficialGmail ?? true}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      copyOfficialGmail: e.target.checked,
                    })
                  }
                  aria-label="Copy to Official Gmail"
                />
                <i aria-hidden="true" />
              </label>
            </div>

            {/* Student Welcome Email Toggle */}
            <div
              className="switch-row"
              style={{
                padding: 14,
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "var(--navy)",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="check" size={16} />
                </div>
                <div>
                  <strong style={{ display: "block" }}>
                    Student Application Confirmation
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Automatically email applicant their official registration
                    reference number upon submission.
                  </span>
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={generalSettings.studentEmailConfirmation !== false}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      studentEmailConfirmation: e.target.checked,
                    })
                  }
                  aria-label="Student confirmation email"
                />
                <i aria-hidden="true" />
              </label>
            </div>

            {/* Alert Event Types */}
            <div
              style={{
                marginTop: 8,
                padding: 14,
                background: "#faf9f6",
                borderRadius: 8,
                border: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--gold-text)",
                  marginBottom: 10,
                }}
              >
                Active Alert Triggers
              </span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={generalSettings.alertOnApplication !== false}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        alertOnApplication: e.target.checked,
                      })
                    }
                  />
                  <span>New Student Applications</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={generalSettings.alertOnPayment !== false}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        alertOnPayment: e.target.checked,
                      })
                    }
                  />
                  <span>Payment Proof Submissions</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={generalSettings.alertOnRepair !== false}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        alertOnRepair: e.target.checked,
                      })
                    }
                  />
                  <span>Instrument Repair Bookings</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={generalSettings.alertOnEnquiry !== false}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        alertOnEnquiry: e.target.checked,
                      })
                    }
                  />
                  <span>General Contact Enquiries</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 14,
            background: "white",
            padding: 16,
            borderRadius: 8,
            border: "1px solid var(--line)",
          }}
        >
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
