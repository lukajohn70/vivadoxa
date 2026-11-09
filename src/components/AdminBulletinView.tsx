import React, { useState, useEffect, useRef } from "react"
import { Icon, Button } from "@/components/ui"
import {
  type BulletinItem,
  fetchBulletins,
  saveBulletin,
  sendBulletin,
  deleteBulletin,
  fetchNewsletterSubscribers,
} from "@/lib/api"

export function AdminBulletinView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [activeSubTab, setActiveSubTab] = useState<"bulletins" | "subscribers">("bulletins")
  const [bulletins, setBulletins] = useState<BulletinItem[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Editor modal state
  const [showEditor, setShowEditor] = useState(false)
  const [previewMode, setPreviewMode] = useState<"edit" | "preview" | "raw">("edit")
  const [editingId, setEditingId] = useState<number | undefined>(undefined)
  const [title, setTitle] = useState("")
  const [edition, setEdition] = useState("")
  const [category, setCategory] = useState("Weekly Bulletin")
  const [summary, setSummary] = useState("")
  const [contentHtml, setContentHtml] = useState("")
  const [targetAudience, setTargetAudience] = useState<"all" | "students" | "subscribers" | "test">("all")
  const [testEmail, setTestEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState("")

  const editorRef = useRef<HTMLDivElement>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [bList, sList] = await Promise.all([
        fetchBulletins(),
        fetchNewsletterSubscribers(),
      ])
      setBulletins(bList || [])
      setSubscribers(sList || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync contentHtml to editorRef when opening modal or switching back to edit mode
  useEffect(() => {
    if (showEditor && previewMode === "edit" && editorRef.current) {
      if (editorRef.current.innerHTML !== contentHtml) {
        editorRef.current.innerHTML = contentHtml
      }
    }
  }, [showEditor, previewMode])

  function openCreateModal() {
    const now = new Date()
    const weekNum = Math.ceil((now.getDate() + 6 - now.getDay()) / 7)
    const monthName = now.toLocaleDateString("en-US", { month: "short" })

    setEditingId(undefined)
    setTitle("")
    setEdition(`Week ${weekNum} · ${monthName} ${now.getFullYear()}`)
    setCategory("Weekly Bulletin")
    setSummary("")
    setContentHtml(
      `<p>Welcome to this week's <strong>Vivadoxa Weekly Bulletin</strong> — notes, schedules, and artistic highlights from our Kaduna studios.</p>
<h3>1. Rehearsal & Timetable Announcements</h3>
<p>Please review your cohort schedule for upcoming studio sessions and ensemble practice.</p>
<div style="background: #fff8f3; border-left: 4px solid #c96b32; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
  <strong>Tip of the Week:</strong> Warm up with 5 minutes of chromatic scales and diaphragm support exercises before jumping into repertoire.
</div>
<h3>2. Studio & Workshop Highlights</h3>
<p>Our luthier desk is accepting instruments for seasonal maintenance and restringing.</p>`
    )
    setTargetAudience("all")
    setTestEmail("")
    setFormError("")
    setPreviewMode("edit")
    setShowEditor(true)
  }

  function openEditModal(b: BulletinItem) {
    setEditingId(b.id)
    setTitle(b.title)
    setEdition(b.edition)
    setCategory(b.category)
    setSummary(b.summary || "")
    setContentHtml(b.content_html)
    setTargetAudience(b.target_audience || "all")
    setTestEmail("")
    setFormError("")
    setPreviewMode("edit")
    setShowEditor(true)
  }

  // Format commands for rich editor
  function executeCmd(command: string, value: string | undefined = undefined) {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand(command, false, value)
      setContentHtml(editorRef.current.innerHTML)
    }
  }

  function insertCallout(type: "gold" | "info" | "quote") {
    let html = ""
    if (type === "gold") {
      html = `
        <div style="background: #fff8f3; border-left: 4px solid #c96b32; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 14px;">
          <strong style="color: #0b0b0b;">📢 Academy Announcement:</strong>
          <p style="margin: 4px 0 0; color: #5c5954;">Add your important studio or performance note here...</p>
        </div><p></p>
      `
    } else if (type === "info") {
      html = `
        <div style="background: #f0fdf4; border-left: 4px solid #15803d; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 14px;">
          <strong style="color: #166534;">✓ Luthier & Practice Tip:</strong>
          <p style="margin: 4px 0 0; color: #374151;">Wipe down instrument fretboards and strings with a microfiber cloth after every session.</p>
        </div><p></p>
      `
    } else {
      html = `
        <blockquote style="border-left: 3px solid #c96b32; padding-left: 16px; margin: 16px 0; font-style: italic; color: #191715;">
          "Excellence is not an act, but a habit. Actualize your passion."
        </blockquote><p></p>
      `
    }
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand("insertHTML", false, html)
      setContentHtml(editorRef.current.innerHTML)
    }
  }

  async function handleSaveDraft() {
    setFormError("")
    const currentHtml = editorRef.current ? editorRef.current.innerHTML : contentHtml
    if (!title.trim()) {
      setFormError("Bulletin title is required.")
      return
    }
    if (!currentHtml.trim()) {
      setFormError("Bulletin content cannot be empty.")
      return
    }

    setSaving(true)
    try {
      const res = await saveBulletin({
        id: editingId,
        title: title.trim(),
        edition: edition.trim(),
        category,
        summary: summary.trim(),
        content_html: currentHtml,
        target_audience: targetAudience,
        status: "draft",
      })

      if (res.success) {
        setActionNotice(`Weekly Bulletin "${title}" saved as draft.`)
        setShowEditor(false)
        loadData()
      } else {
        setFormError(res.error || "Failed to save bulletin.")
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to save draft.")
    } finally {
      setSaving(false)
    }
  }

  async function handleBroadcast(isTest: boolean = false) {
    setFormError("")
    const currentHtml = editorRef.current ? editorRef.current.innerHTML : contentHtml
    if (!title.trim()) {
      setFormError("Bulletin title is required.")
      return
    }
    if (isTest && !testEmail.trim()) {
      setFormError("Please provide an email address to send the test bulletin to.")
      return
    }

    if (!isTest) {
      if (!confirm(`Are you sure you want to broadcast "${title}" to "${targetAudience}" recipients? This will send real emails.`)) {
        return
      }
    }

    setSending(true)
    try {
      // 1. Save latest edits first
      const saveRes = await saveBulletin({
        id: editingId,
        title: title.trim(),
        edition: edition.trim(),
        category,
        summary: summary.trim(),
        content_html: currentHtml,
        target_audience: targetAudience,
        status: isTest ? "draft" : "published",
      })

      const targetId = editingId || saveRes.id
      if (!targetId) throw new Error("Could not save bulletin ID.")

      // 2. Dispatch broadcast
      const sendRes = await sendBulletin(
        targetId,
        targetAudience,
        isTest ? testEmail.trim() : undefined,
      )

      if (sendRes.success) {
        setActionNotice(sendRes.message || "Bulletin sent successfully.")
        if (!isTest) {
          setShowEditor(false)
          loadData()
        }
      } else {
        setFormError(sendRes.error || "Failed to dispatch bulletin.")
      }
    } catch (err: any) {
      setFormError(err.message || "Error broadcasting bulletin.")
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(id: number, bTitle: string) {
    if (!confirm(`Are you sure you want to delete bulletin "${bTitle}"?`)) return
    const res = await deleteBulletin(id)
    if (res.success) {
      setActionNotice(`Bulletin "${bTitle}" deleted.`)
      loadData()
    } else {
      setActionNotice(res.error || "Failed to delete bulletin.")
    }
  }

  return (
    <div className="admin-bulletin-container" style={{ padding: "8px 0" }}>
      {/* View Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--navy)" }}>
            Weekly Bulletin &amp; Newsletters
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13.5 }}>
            Publish rich-formatted weekly dispatches, rehearsal advisories, and student spotlights to all patrons.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={openCreateModal}>
            <Icon name="plus" size={15} /> Compose New Bulletin
          </Button>
        </div>
      </div>

      {/* Sub Tabs: Bulletins vs Subscribers */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid var(--line)",
          marginBottom: 20,
          paddingBottom: 1,
        }}
      >
        <button
          onClick={() => setActiveSubTab("bulletins")}
          style={{
            padding: "9px 18px",
            border: "none",
            background: "none",
            fontSize: 14,
            fontWeight: activeSubTab === "bulletins" ? 700 : 500,
            color: activeSubTab === "bulletins" ? "var(--gold)" : "var(--muted)",
            borderBottom: activeSubTab === "bulletins" ? "2px solid var(--gold)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Dispatched &amp; Draft Bulletins ({bulletins.length})
        </button>

        <button
          onClick={() => setActiveSubTab("subscribers")}
          style={{
            padding: "9px 18px",
            border: "none",
            background: "none",
            fontSize: 14,
            fontWeight: activeSubTab === "subscribers" ? 700 : 500,
            color: activeSubTab === "subscribers" ? "var(--gold)" : "var(--muted)",
            borderBottom: activeSubTab === "subscribers" ? "2px solid var(--gold)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Newsletter Subscribers ({subscribers.length})
        </button>
      </div>

      {/* ── Sub Tab 1: Bulletins Table ────────────────────────────────────── */}
      {activeSubTab === "bulletins" && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--line)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
              Loading weekly bulletins…
            </div>
          ) : bulletins.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: "rgba(201,107,50,0.12)",
                  color: "var(--gold)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Icon name="mail" size={24} />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>No Weekly Bulletins Yet</h3>
              <p style={{ color: "var(--muted)", fontSize: 13.5, maxWidth: 440, margin: "auto" }}>
                Compose and broadcast your first official bulletin to students, applicants, and community subscribers.
              </p>
              <div style={{ marginTop: 16 }}>
                <Button onClick={openCreateModal}>Compose First Bulletin</Button>
              </div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: "#faf8f5", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px" }}>Edition / Issue</th>
                    <th style={{ padding: "12px 16px" }}>Bulletin Title</th>
                    <th style={{ padding: "12px 16px" }}>Category</th>
                    <th style={{ padding: "12px 16px" }}>Audience</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Recipients</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bulletins.map((b) => (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: "1px solid var(--line)",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#faf9f7")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                    >
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--gold-text)" }}>
                        {b.edition}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600, color: "var(--navy)" }}>{b.title}</div>
                        {b.summary && (
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                            {b.summary}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: "rgba(11,11,11,0.06)",
                            fontSize: 11.5,
                            fontWeight: 600,
                          }}
                        >
                          {b.category}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textTransform: "capitalize", color: "var(--muted)" }}>
                        {b.target_audience === "all" ? "Students & Subscribers" : b.target_audience}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "3px 9px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            background:
                              b.status === "sent"
                                ? "rgba(21,112,84,0.12)"
                                : b.status === "published"
                                  ? "rgba(201,107,50,0.15)"
                                  : "rgba(100,116,139,0.15)",
                            color:
                              b.status === "sent"
                                ? "var(--green)"
                                : b.status === "published"
                                  ? "var(--gold)"
                                  : "#64748b",
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {b.recipients_count && b.recipients_count > 0 ? (
                          <strong>{b.recipients_count} delivered</strong>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            onClick={() => openEditModal(b)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid var(--line)",
                              background: "white",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Edit / Preview
                          </button>
                          <button
                            onClick={() => handleDelete(b.id!, b.title)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #fee2e2",
                              background: "#fff5f5",
                              color: "#dc2626",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sub Tab 2: Subscribers List ───────────────────────────────────── */}
      {activeSubTab === "subscribers" && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--line)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
              Loading subscribers…
            </div>
          ) : subscribers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
              No newsletter subscribers logged yet. Visitors who sign up via the website footer will appear here.
            </div>
          ) : (
            <div className="table-wrapper" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: "#faf8f5", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px" }}>Subscriber Email</th>
                    <th style={{ padding: "12px 16px" }}>Full Name</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Acquisition Source</th>
                    <th style={{ padding: "12px 16px" }}>Subscribed On</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--navy)" }}>
                        {s.email}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted)" }}>
                        {s.full_name || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: s.status === "active" ? "rgba(21,112,84,0.12)" : "rgba(220,38,38,0.1)",
                            color: s.status === "active" ? "var(--green)" : "#dc2626",
                          }}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted)" }}>
                        {s.source}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>
                        {new Date(s.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── RICH FORMATTING BULLETIN EDITOR & PREVIEW MODAL ───────────────── */}
      {showEditor && (
        <div
          className="admin-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(3px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditor(false)
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 14,
              width: "min(960px, 98vw)",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#faf9f7",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>
                  {editingId ? "Edit Weekly Bulletin" : "Compose Weekly Bulletin"}
                </h3>
                <small style={{ color: "var(--muted)" }}>
                  Rich-text formatting with live email preview &amp; audience targeting
                </small>
              </div>

              {/* View Switcher Tabs */}
              <div
                style={{
                  display: "inline-flex",
                  background: "rgba(0,0,0,0.06)",
                  borderRadius: 8,
                  padding: 3,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (editorRef.current) setContentHtml(editorRef.current.innerHTML)
                    setPreviewMode("edit")
                  }}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: previewMode === "edit" ? "white" : "transparent",
                    color: previewMode === "edit" ? "var(--navy)" : "var(--muted)",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: previewMode === "edit" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  Visual Editor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorRef.current) setContentHtml(editorRef.current.innerHTML)
                    setPreviewMode("preview")
                  }}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: previewMode === "preview" ? "white" : "transparent",
                    color: previewMode === "preview" ? "var(--navy)" : "var(--muted)",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: previewMode === "preview" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  Live Email Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorRef.current) setContentHtml(editorRef.current.innerHTML)
                    setPreviewMode("raw")
                  }}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: previewMode === "raw" ? "white" : "transparent",
                    color: previewMode === "raw" ? "var(--navy)" : "var(--muted)",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: previewMode === "raw" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  Raw HTML
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowEditor(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: 4,
                }}
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1 }}>
              {formError && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 8,
                    color: "#b91c1c",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {formError}
                </div>
              )}

              {/* Bulletin Metadata Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    Edition / Issue Code *
                  </label>
                  <input
                    type="text"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    placeholder="e.g. Week 46 · Nov 2026"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      fontSize: 13,
                      background: "white",
                    }}
                  >
                    <option value="Weekly Bulletin">Weekly Bulletin</option>
                    <option value="Student Spotlight">Student Spotlight</option>
                    <option value="Workshop & Repairs">Workshop &amp; Repairs</option>
                    <option value="Masterclass">Masterclass &amp; Auditions</option>
                    <option value="Recitals & Concerts">Recitals &amp; Concerts</option>
                    <option value="Executive Message">Executive Message</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      fontSize: 13,
                      background: "white",
                    }}
                  >
                    <option value="all">All (Students, Applicants &amp; Subscribers)</option>
                    <option value="students">Active Students &amp; Applicants Only</option>
                    <option value="subscribers">Newsletter Subscribers Only</option>
                    <option value="test">Single Test Recipient (Email)</option>
                  </select>
                </div>
              </div>

              {/* Title Input */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Bulletin Headline / Email Subject *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Vivadoxa Weekly Bulletin: Mid-Term Rehearsals & Sight-Reading Clinic"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Summary / Sub-headline */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Synopsis / Sub-headline (Optional)
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Quick summary shown in dispatch teasers..."
                  style={{
                    width: "100%",
                    padding: "7px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                />
              </div>

              {/* ── VIEW 1: Visual Editor with Rich Formatting Toolbar ────── */}
              {previewMode === "edit" && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Bulletin Body Content (Rich Formatting)
                  </label>

                  {/* Formatting Toolbar */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                      background: "#f7f5f0",
                      padding: "8px 10px",
                      border: "1px solid var(--line)",
                      borderBottom: "none",
                      borderRadius: "8px 8px 0 0",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => executeCmd("bold")}
                      title="Bold"
                      style={{
                        padding: "4px 8px",
                        fontWeight: 700,
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd("italic")}
                      title="Italic"
                      style={{
                        padding: "4px 8px",
                        fontStyle: "italic",
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd("underline")}
                      title="Underline"
                      style={{
                        padding: "4px 8px",
                        textDecoration: "underline",
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      U
                    </button>

                    <span style={{ width: 1, height: 20, background: "#dfdad0", margin: "0 4px" }} />

                    <button
                      type="button"
                      onClick={() => executeCmd("formatBlock", "<h2>")}
                      title="Heading 2"
                      style={{
                        padding: "4px 8px",
                        fontWeight: 700,
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd("formatBlock", "<h3>")}
                      title="Heading 3"
                      style={{
                        padding: "4px 8px",
                        fontWeight: 700,
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd("formatBlock", "<p>")}
                      title="Normal Paragraph"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      Paragraph
                    </button>

                    <span style={{ width: 1, height: 20, background: "#dfdad0", margin: "0 4px" }} />

                    <button
                      type="button"
                      onClick={() => executeCmd("insertUnorderedList")}
                      title="Bullet List"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => executeCmd("insertOrderedList")}
                      title="Numbered List"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      1. List
                    </button>

                    <span style={{ width: 1, height: 20, background: "#dfdad0", margin: "0 4px" }} />

                    <button
                      type="button"
                      onClick={() => insertCallout("gold")}
                      title="Insert Announcement Callout Box"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #c96b32",
                        background: "#fff8f3",
                        color: "#a24a18",
                        fontWeight: 600,
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      + Announcement Box
                    </button>

                    <button
                      type="button"
                      onClick={() => insertCallout("info")}
                      title="Insert Tip Box"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #15803d",
                        background: "#f0fdf4",
                        color: "#166534",
                        fontWeight: 600,
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      + Workshop Tip Box
                    </button>

                    <button
                      type="button"
                      onClick={() => insertCallout("quote")}
                      title="Insert Quote"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      “ Quote
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt("Enter web link URL:", "https://")
                        if (url) executeCmd("createLink", url)
                      }}
                      title="Insert Link"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      🔗 Link
                    </button>

                    <button
                      type="button"
                      onClick={() => executeCmd("insertHorizontalRule")}
                      title="Divider line"
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #dfdad0",
                        background: "white",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      ― Divider
                    </button>
                  </div>

                  {/* Editable Content Canvas */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setContentHtml(e.currentTarget.innerHTML)}
                    style={{
                      minHeight: 260,
                      maxHeight: 380,
                      overflowY: "auto",
                      padding: "16px 20px",
                      border: "1px solid var(--line)",
                      borderRadius: "0 0 8px 8px",
                      background: "white",
                      fontSize: 14.5,
                      lineHeight: 1.65,
                      outline: "none",
                    }}
                  />
                </div>
              )}

              {/* ── VIEW 2: Raw HTML View ─────────────────────────────────── */}
              {previewMode === "raw" && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                    Direct HTML Source Code
                  </label>
                  <textarea
                    rows={12}
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    style={{
                      width: "100%",
                      fontFamily: "monospace",
                      fontSize: 13,
                      padding: 12,
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      background: "#1e1e1e",
                      color: "#4ade80",
                    }}
                  />
                </div>
              )}

              {/* ── VIEW 3: Live Branded Email Card Preview ───────────────── */}
              {previewMode === "preview" && (
                <div style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      background: "#f7f5f0",
                      padding: "24px 16px",
                      borderRadius: 10,
                      border: "1px solid #ede8e0",
                    }}
                  >
                    {/* Outgoing Mailer Info Header */}
                    <div
                      style={{
                        maxWidth: 620,
                        margin: "0 auto 12px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#166534",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <span>
                        <strong>Sender:</strong> Vivadoxa Music Weekly Bulletin &lt;<code>info@vivadoxamusic.com</code>&gt;
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          background: "#dcfce7",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        info@vivadoxamusic.com
                      </span>
                    </div>

                    <div
                      style={{
                        maxWidth: 620,
                        margin: "auto",
                        background: "white",
                        borderRadius: 14,
                        overflow: "hidden",
                        border: "1px solid #e9e4dc",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Brand Header */}
                      <div
                        style={{
                          background: "#0b0b0b",
                          padding: "20px 28px",
                          borderBottom: "2px solid #c96b32",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <img
                            src="https://www.vivadoxamusic.com/vivadoxa-logo.png"
                            alt="Vivadoxa Music"
                            style={{ maxHeight: 42, width: "auto", display: "block" }}
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#f2a672",
                              textTransform: "uppercase",
                              letterSpacing: 2,
                              marginTop: 6,
                            }}
                          >
                            {edition || "Weekly Bulletin"}
                          </div>
                        </div>

                        <span
                          style={{
                            background: "rgba(201, 107, 50, 0.2)",
                            border: "1px solid rgba(201, 107, 50, 0.5)",
                            color: "#f2a672",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            padding: "4px 10px",
                            borderRadius: 6,
                          }}
                        >
                          {category}
                        </span>
                      </div>

                      {/* Preview Body */}
                      <div style={{ padding: "28px 28px 22px" }}>
                        <h1 style={{ margin: "0 0 12px", fontSize: 21, fontWeight: 700, color: "#0b0b0b", lineHeight: 1.3 }}>
                          {title || "Untitled Bulletin"}
                        </h1>
                        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#5c5954" }}>
                          Dear <strong>Valued Patron</strong>,
                        </p>

                        <div
                          style={{ fontSize: 14, color: "#191715", lineHeight: 1.65 }}
                          dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />

                        {/* Service Directory Footer */}
                        <div
                          style={{
                            marginTop: 26,
                            paddingTop: 18,
                            borderTop: "1px solid #e7e2d9",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              color: "#8a847c",
                              marginBottom: 10,
                            }}
                          >
                            Vivadoxa Services &amp; Programs
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                              gap: "8px 16px",
                              fontSize: 12,
                              color: "#44403c",
                            }}
                          >
                            <div style={{ paddingBottom: 6, borderBottom: "1px solid #f2ede4" }}>
                              <span style={{ fontWeight: 700, color: "#0b0b0b" }}>Music Academy</span> · 17 Cohorts
                              <div>
                                <span style={{ color: "#c96b32", fontWeight: 600, fontSize: 11 }}>Apply / Enroll &rarr;</span>
                              </div>
                            </div>
                            <div style={{ paddingBottom: 6, borderBottom: "1px solid #f2ede4" }}>
                              <span style={{ fontWeight: 700, color: "#0b0b0b" }}>Instrument Clinic</span> · Luthier Care
                              <div>
                                <span style={{ color: "#c96b32", fontWeight: 600, fontSize: 11 }}>Book Repair &rarr;</span>
                              </div>
                            </div>
                            <div style={{ paddingBottom: 6, borderBottom: "1px solid #f2ede4" }}>
                              <span style={{ fontWeight: 700, color: "#0b0b0b" }}>Rentals &amp; Backline</span> · Concert Fleet
                              <div>
                                <span style={{ color: "#c96b32", fontWeight: 600, fontSize: 11 }}>Browse Rentals &rarr;</span>
                              </div>
                            </div>
                            <div style={{ paddingBottom: 6, borderBottom: "1px solid #f2ede4" }}>
                              <span style={{ fontWeight: 700, color: "#0b0b0b" }}>Music Store</span> · Gear &amp; Supplies
                              <div>
                                <span style={{ color: "#c96b32", fontWeight: 600, fontSize: 11 }}>Shop Catalog &rarr;</span>
                              </div>
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, color: "#0b0b0b" }}>Studio &amp; Rehearsal</span> · Live Room
                              <div>
                                <span style={{ color: "#c96b32", fontWeight: 600, fontSize: 11 }}>Book Studio &rarr;</span>
                              </div>
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, color: "#0b0b0b" }}>Client Concierge</span> · WhatsApp
                              <div>
                                <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 11 }}>Chat with Desk &rarr;</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Signoff */}
                        <div
                          style={{
                            marginTop: 28,
                            paddingTop: 18,
                            borderTop: "1px solid #f0ece5",
                            fontSize: 13,
                            color: "#5c5954",
                          }}
                        >
                          <p style={{ margin: 0 }}>With excellence in sound,</p>
                          <p style={{ margin: "4px 0 0", fontWeight: 700, color: "#0b0b0b" }}>
                            Vivadoxa Music Weekly Bulletin
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#c96b32" }}>
                            info@vivadoxamusic.com
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        style={{
                          background: "#faf8f5",
                          padding: "18px 28px",
                          borderTop: "1px solid #ede8e0",
                          textAlign: "center",
                          fontSize: 11,
                          color: "#8a857e",
                        }}
                      >
                        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
                          Vivadoxa Music Academy &amp; Studio · Instrument Clinic · Audio Hub
                        </p>
                        <p style={{ margin: "0 0 4px" }}>
                          Kaduna Studio, Kaduna State, Nigeria · Phone: +234 907 533 0330 · WhatsApp: +234 803 130 8881
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: "#a8a29e" }}>
                          You received this email because you subscribed on vivadoxamusic.com or hold an active academy account.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Recipient row if audience is 'test' */}
              {targetAudience === "test" && (
                <div
                  style={{
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 14,
                  }}
                >
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>
                    Send Test To Email:
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="e.g. director@vivadoxamusic.com"
                    style={{
                      width: "100%",
                      padding: "7px 12px",
                      borderRadius: 6,
                      border: "1px solid #7dd3fc",
                      fontSize: 13,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: "14px 22px",
                borderTop: "1px solid var(--line)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                background: "#faf9f7",
              }}
            >
              <div>
                <Button variant="ghost" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="secondary" onClick={handleSaveDraft} disabled={saving || sending}>
                  {saving ? "Saving Draft…" : "Save Draft"}
                </Button>

                {targetAudience === "test" ? (
                  <Button onClick={() => handleBroadcast(true)} disabled={sending || saving}>
                    {sending ? "Sending Test…" : "Send Test Bulletin"}
                  </Button>
                ) : (
                  <Button onClick={() => handleBroadcast(false)} disabled={sending || saving}>
                    <Icon name="mail" size={14} />
                    {sending ? "Broadcasting…" : "Broadcast Bulletin Now"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
