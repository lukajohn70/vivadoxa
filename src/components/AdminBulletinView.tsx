import React, { useState, useEffect, useRef } from "react"
import { Icon, Button } from "@/components/ui"
import {
  type BulletinItem,
  fetchBulletins,
  saveBulletin,
  sendBulletin,
  deleteBulletin,
  fetchNewsletterSubscribers,
  fetchBulletinDispatchLogs,
  type BulletinDispatchLog,
  type BulletinSendResponse,
} from "@/lib/api"

export function AdminBulletinView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  // Page view mode: "directory" (listing & logs) vs "composer" (dedicated full-page editor)
  const [viewMode, setViewMode] = useState<"directory" | "composer">("directory")

  // Directory subtabs
  const [activeSubTab, setActiveSubTab] = useState<"bulletins" | "subscribers" | "logs">("bulletins")

  // Data states
  const [bulletins, setBulletins] = useState<BulletinItem[]>([])
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [dispatchLogs, setDispatchLogs] = useState<BulletinDispatchLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Real-time delivery receipt confirmation
  const [lastDispatchResult, setLastDispatchResult] = useState<BulletinSendResponse | null>(null)

  // Composer editor state
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
      const [bList, sList, lList] = await Promise.all([
        fetchBulletins(),
        fetchNewsletterSubscribers(),
        fetchBulletinDispatchLogs(50),
      ])
      setBulletins(bList || [])
      setSubscribers(sList || [])
      setDispatchLogs(lList || [])
    } finally {
      setLoading(false)
    }
  }

  const refreshLogsOnly = async () => {
    setLoadingLogs(true)
    try {
      const lList = await fetchBulletinDispatchLogs(50)
      setDispatchLogs(lList || [])
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync contentHtml to editorRef when switching to composer or visual edit mode
  useEffect(() => {
    if (viewMode === "composer" && previewMode === "edit" && editorRef.current) {
      if (editorRef.current.innerHTML !== contentHtml) {
        editorRef.current.innerHTML = contentHtml
      }
    }
  }, [viewMode, previewMode])

  function openCreatePage() {
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
    setViewMode("composer")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openEditPage(b: BulletinItem, mode: "edit" | "preview" = "edit") {
    setEditingId(b.id)
    setTitle(b.title)
    setEdition(b.edition)
    setCategory(b.category)
    setSummary(b.summary || "")
    setContentHtml(b.content_html)
    setTargetAudience(b.target_audience || "all")
    setTestEmail("")
    setFormError("")
    setPreviewMode(mode)
    setViewMode("composer")
    window.scrollTo({ top: 0, behavior: "smooth" })
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
          <strong style="color: #0b0b0b;">Academy Announcement:</strong>
          <p style="margin: 4px 0 0; color: #5c5954;">Add your important studio or performance note here...</p>
        </div><p></p>
      `
    } else if (type === "info") {
      html = `
        <div style="background: #f0fdf4; border-left: 4px solid #15803d; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-size: 14px;">
          <strong style="color: #166534;">Luthier & Practice Tip:</strong>
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
        if (!editingId && res.id) {
          setEditingId(res.id)
        }
        setActionNotice(`Weekly Bulletin "${title}" saved as draft.`)
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
      if (!confirm(`Are you sure you want to broadcast "${title}" to "${targetAudience}" recipients? This will send real emails from info@vivadoxamusic.com.`)) {
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
      setEditingId(targetId)

      // 2. Dispatch broadcast
      const sendRes = await sendBulletin(
        targetId,
        targetAudience,
        isTest ? testEmail.trim() : undefined,
      )

      if (sendRes.success) {
        setLastDispatchResult(sendRes)
        setActionNotice(sendRes.message || "Email dispatched successfully from info@vivadoxamusic.com.")
        loadData()
        refreshLogsOnly()
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

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: DELIVERY CONFIRMATION RECEIPT BANNER
  // ══════════════════════════════════════════════════════════════════════════
  const renderDeliveryReceipt = () => {
    if (!lastDispatchResult) return null
    return (
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 20,
          boxShadow: "0 2px 10px rgba(22, 101, 52, 0.08)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#22c55e",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="check" size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#166534" }}>
              Email Dispatched Successfully
            </div>
            <p style={{ margin: "2px 0 8px", fontSize: 13.5, color: "#15803d" }}>
              {lastDispatchResult.message || "Email delivered successfully."}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "14px 22px",
                fontSize: 12,
                color: "#166534",
              }}
            >
              <span>
                <strong>Sender Mailbox:</strong> <code>info@vivadoxamusic.com</code>
              </span>
              <span>
                <strong>Target:</strong>{" "}
                {lastDispatchResult.target === "all"
                  ? "All Students & Subscribers"
                  : lastDispatchResult.target}
              </span>
              {lastDispatchResult.sent_count !== undefined && (
                <span>
                  <strong>Delivered Inboxes:</strong> {lastDispatchResult.sent_count}
                </span>
              )}
              {lastDispatchResult.dispatched_at && (
                <span>
                  <strong>Dispatch Timestamp:</strong> {lastDispatchResult.dispatched_at}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              setViewMode("directory")
              setActiveSubTab("logs")
            }}
            style={{
              background: "#15803d",
              color: "white",
              border: "none",
              padding: "7px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View in Delivery Logs &rarr;
          </button>
          <button
            type="button"
            onClick={() => setLastDispatchResult(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#166534",
              cursor: "pointer",
              padding: 4,
              fontSize: 14,
            }}
            title="Dismiss notification"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 1: DEDICATED FULL-PAGE COMPOSER (NOT A MODAL)
  // ══════════════════════════════════════════════════════════════════════════
  if (viewMode === "composer") {
    return (
      <div className="admin-bulletin-composer-page" style={{ padding: "4px 0 32px" }}>
        {/* Top Breadcrumb & Action Bar */}
        <div
          style={{
            background: "white",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "16px 22px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div>
            <button
              type="button"
              onClick={() => setViewMode("directory")}
              style={{
                background: "none",
                border: "none",
                color: "var(--gold)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                padding: 0,
                marginBottom: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              &larr; Back to Bulletins Directory
            </button>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "var(--navy)" }}>
              {editingId ? "Edit Weekly Bulletin" : "Compose Weekly Bulletin"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#166534",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                From: info@vivadoxamusic.com
              </span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                {edition || "Draft Issue"}
              </span>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button
              variant="ghost"
              onClick={() => setViewMode("directory")}
              disabled={saving || sending}
            >
              Cancel
            </Button>

            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={saving || sending}
            >
              {saving ? "Saving Draft…" : "Save Draft"}
            </Button>

            {targetAudience === "test" ? (
              <Button
                onClick={() => handleBroadcast(true)}
                disabled={sending || saving}
                style={{ background: "#0369a1", color: "white" }}
              >
                {sending ? "Sending Test…" : "Send Test to Inbox"}
              </Button>
            ) : (
              <Button onClick={() => handleBroadcast(false)} disabled={sending || saving}>
                {sending ? "Broadcasting…" : "Broadcast Bulletin"}
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Delivery Receipt Banner */}
        {renderDeliveryReceipt()}

        {/* Error Notice */}
        {formError && (
          <div
            style={{
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#b91c1c",
              fontSize: 13.5,
              marginBottom: 18,
            }}
          >
            {formError}
          </div>
        )}

        {/* View Switcher Tabs (Visual Editor vs Live Email Preview vs Raw HTML) */}
        <div
          style={{
            display: "inline-flex",
            background: "rgba(0,0,0,0.06)",
            borderRadius: 8,
            padding: 4,
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (editorRef.current) setContentHtml(editorRef.current.innerHTML)
              setPreviewMode("edit")
            }}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              border: "none",
              background: previewMode === "edit" ? "white" : "transparent",
              color: previewMode === "edit" ? "var(--navy)" : "var(--muted)",
              fontWeight: 700,
              fontSize: 13,
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
              padding: "7px 16px",
              borderRadius: 6,
              border: "none",
              background: previewMode === "preview" ? "white" : "transparent",
              color: previewMode === "preview" ? "var(--navy)" : "var(--muted)",
              fontWeight: 700,
              fontSize: 13,
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
              padding: "7px 16px",
              borderRadius: 6,
              border: "none",
              background: previewMode === "raw" ? "white" : "transparent",
              color: previewMode === "raw" ? "var(--navy)" : "var(--muted)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: previewMode === "raw" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Raw HTML Source
          </button>
        </div>

        {/* ── SUB-VIEW: Visual Editor ────────────────────────────────────────── */}
        {previewMode === "edit" && (
          <div
            style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "24px 28px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            {/* Metadata Fields Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                  Edition / Issue Code *
                </label>
                <input
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  placeholder="e.g. Week 46 · Nov 2026"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    fontSize: 13.5,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                  Category Tag *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    fontSize: 13.5,
                    background: "white",
                  }}
                >
                  <option value="Weekly Bulletin">Weekly Bulletin</option>
                  <option value="Studio Timetable">Studio Timetable</option>
                  <option value="Concert Advisory">Concert Advisory</option>
                  <option value="Masterclass Series">Masterclass Series</option>
                  <option value="Clinic & Luthier Care">Clinic &amp; Luthier Care</option>
                  <option value="Director Dispatch">Director Dispatch</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                  Target Audience *
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    fontSize: 13.5,
                    background: "white",
                  }}
                >
                  <option value="all">All (Students, Applicants &amp; Subscribers)</option>
                  <option value="subscribers">Subscribers Only</option>
                  <option value="students">Students &amp; Applicants Only</option>
                  <option value="test">Single Test Recipient (Test Mode)</option>
                </select>
              </div>
            </div>

            {/* Test Email Row if test mode selected */}
            {targetAudience === "test" && (
              <div
                style={{
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  padding: "12px 16px",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0369a1", marginBottom: 4 }}>
                  Destination Email for Test Delivery:
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="e.g. director@vivadoxamusic.com"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #7dd3fc",
                    fontSize: 13.5,
                  }}
                />
              </div>
            )}

            {/* Title Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                Bulletin Title / Subject Line *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mid-Term Rehearsals, Sight-Reading Masterclass &amp; Luthier Clinic"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Summary Input */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                Short Summary (Inbox preview snippet)
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="One sentence preview shown in Gmail / Apple Mail inbox listings"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  fontSize: 13,
                }}
              />
            </div>

            {/* Formatting Toolbar */}
            <div
              style={{
                border: "1px solid var(--line)",
                borderBottom: "none",
                borderRadius: "8px 8px 0 0",
                background: "#faf9f7",
                padding: "8px 12px",
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => executeCmd("bold")}
                title="Bold"
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => executeCmd("italic")}
                title="Italic"
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontStyle: "italic",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => executeCmd("underline")}
                title="Underline"
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  textDecoration: "underline",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                U
              </button>

              <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }} />

              <button
                type="button"
                onClick={() => executeCmd("formatBlock", "<h2>")}
                title="Heading 2"
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: 11,
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
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => executeCmd("formatBlock", "<p>")}
                title="Paragraph"
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Para
              </button>

              <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }} />

              <button
                type="button"
                onClick={() => executeCmd("insertUnorderedList")}
                title="Bullet List"
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontSize: 11,
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
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                1. List
              </button>

              <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }} />

              <button
                type="button"
                onClick={() => insertCallout("gold")}
                style={{
                  padding: "4px 9px",
                  background: "#fff8f3",
                  border: "1px solid #ffd8c0",
                  borderRadius: 4,
                  color: "#a24a18",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Announcement Box
              </button>
              <button
                type="button"
                onClick={() => insertCallout("info")}
                style={{
                  padding: "4px 9px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 4,
                  color: "#166534",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Practice Tip Box
              </button>
              <button
                type="button"
                onClick={() => insertCallout("quote")}
                style={{
                  padding: "4px 9px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                + Quote
              </button>

              <span style={{ width: 1, height: 18, background: "var(--line)", margin: "0 4px" }} />

              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter link URL (e.g. https://www.vivadoxamusic.com/apply):")
                  if (url) executeCmd("createLink", url)
                }}
                style={{
                  padding: "4px 9px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => executeCmd("removeFormat")}
                style={{
                  padding: "4px 8px",
                  background: "white",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  fontSize: 11,
                  color: "#dc2626",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>

            {/* Editable Content Area */}
            <div
              ref={editorRef}
              contentEditable
              onInput={() => {
                if (editorRef.current) setContentHtml(editorRef.current.innerHTML)
              }}
              style={{
                minHeight: 460,
                border: "1px solid var(--line)",
                borderRadius: "0 0 8px 8px",
                padding: "20px 22px",
                fontSize: 15,
                lineHeight: 1.7,
                color: "#191715",
                background: "white",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        )}

        {/* ── SUB-VIEW: Live Email Preview ───────────────────────────────────── */}
        {previewMode === "preview" && (
          <div
            style={{
              background: "#f7f5f0",
              padding: "28px 16px",
              borderRadius: 12,
              border: "1px solid #ede8e0",
            }}
          >
            {/* Outgoing Mailer Info Header */}
            <div
              style={{
                maxWidth: 620,
                margin: "0 auto 14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "10px 16px",
                borderRadius: 8,
                fontSize: 12.5,
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
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                Domain Authenticated
              </span>
            </div>

            {/* Email Card Frame */}
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
                    background: "rgba(201, 107, 50, 0.18)",
                    border: "1px solid rgba(201, 107, 50, 0.45)",
                    color: "#f2a672",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    padding: "5px 12px",
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {category || "Weekly Bulletin"}
                </span>
              </div>

              {/* Preview Body */}
              <div style={{ padding: "30px 30px 24px" }}>
                <h1 style={{ margin: "0 0 14px", fontSize: 21, fontWeight: 700, color: "#0b0b0b", lineHeight: 1.35 }}>
                  {title || "Untitled Bulletin"}
                </h1>
                <p style={{ margin: "0 0 16px", fontSize: 14, color: "#5c5954" }}>
                  Dear <strong>Valued Patron</strong>,
                </p>

                <div
                  style={{ fontSize: 14.5, color: "#191715", lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />

                {/* Sleek, Non-Distracting Services Directory Footer */}
                <div
                  style={{
                    marginTop: 28,
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
        )}

        {/* ── SUB-VIEW: Raw HTML Source ──────────────────────────────────────── */}
        {previewMode === "raw" && (
          <div
            style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "var(--muted)" }}>
              <span>Raw HTML Source (Editable)</span>
              <span>{contentHtml.length} characters</span>
            </div>
            <textarea
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              rows={22}
              style={{
                width: "100%",
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: 1.5,
                padding: 14,
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "#0f172a",
                color: "#e2e8f0",
              }}
            />
          </div>
        )}

        {/* Sticky Bottom Actions */}
        <div
          style={{
            marginTop: 20,
            background: "white",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "14px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Outgoing sender: <strong>info@vivadoxamusic.com</strong> · Audience:{" "}
            <strong>{targetAudience === "all" ? "All Patrons & Students" : targetAudience}</strong>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={handleSaveDraft} disabled={saving || sending}>
              {saving ? "Saving Draft…" : "Save Draft"}
            </Button>

            {targetAudience === "test" ? (
              <Button
                onClick={() => handleBroadcast(true)}
                disabled={sending || saving}
                style={{ background: "#0369a1", color: "white" }}
              >
                {sending ? "Sending Test…" : "Send Test Bulletin"}
              </Button>
            ) : (
              <Button onClick={() => handleBroadcast(false)} disabled={sending || saving}>
                {sending ? "Broadcasting…" : "Broadcast Weekly Bulletin"}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW 2: BULLETINS DIRECTORY & DISPATCH LOGS
  // ══════════════════════════════════════════════════════════════════════════
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
            Weekly Bulletin &amp; Dispatch Management
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13.5 }}>
            Publish rich-formatted weekly dispatches, timetables, and clinic advisories dispatched from <code>info@vivadoxamusic.com</code>.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={openCreatePage}>
            <Icon name="plus" size={15} /> Compose Weekly Bulletin
          </Button>
        </div>
      </div>

      {/* Real-time Delivery Receipt Banner */}
      {renderDeliveryReceipt()}

      {/* Sub Tabs: Bulletins vs Subscribers vs Delivery Proof Logs */}
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

        <button
          onClick={() => {
            setActiveSubTab("logs")
            refreshLogsOnly()
          }}
          style={{
            padding: "9px 18px",
            border: "none",
            background: "none",
            fontSize: 14,
            fontWeight: activeSubTab === "logs" ? 700 : 500,
            color: activeSubTab === "logs" ? "var(--gold)" : "var(--muted)",
            borderBottom: activeSubTab === "logs" ? "2px solid var(--gold)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Email Dispatch &amp; Delivery Proof ({dispatchLogs.length})
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
                <Button onClick={openCreatePage}>Compose First Bulletin</Button>
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
                    <th style={{ padding: "12px 16px" }}>Delivery Proof</th>
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
                          <div>
                            <span style={{ color: "#166534", fontWeight: 700 }}>
                              {b.recipients_count} delivered
                            </span>
                            {b.sent_at && (
                              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                                {new Date(b.sent_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>Pending broadcast</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            onClick={() => openEditPage(b, "edit")}
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
                            Edit
                          </button>
                          <button
                            onClick={() => openEditPage(b, "preview")}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid var(--line)",
                              background: "#faf9f7",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Preview
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

      {/* ── Sub Tab 3: Delivery Proof & Dispatch Logs (NEW) ────────────────── */}
      {activeSubTab === "logs" && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--line)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          {/* Logs Header Bar */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#faf9f7",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>
                Live Email Dispatch Audit Trail
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--muted)" }}>
                Real-time delivery verification records from server mailers for all outgoing bulletins and notifications.
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={refreshLogsOnly}
              disabled={loadingLogs}
              style={{ fontSize: 12 }}
            >
              {loadingLogs ? "Refreshing…" : "Refresh Delivery Logs"}
            </Button>
          </div>

          {loadingLogs ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
              Loading delivery audit records…
            </div>
          ) : dispatchLogs.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
              No email dispatch records found yet. Dispatches will be logged here in real-time.
            </div>
          ) : (
            <div className="table-wrapper" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#faf8f5", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px" }}>Delivery Status</th>
                    <th style={{ padding: "12px 16px" }}>Recipient Inbox</th>
                    <th style={{ padding: "12px 16px" }}>Subject Line</th>
                    <th style={{ padding: "12px 16px" }}>Server Route / MTA Note</th>
                    <th style={{ padding: "12px 16px" }}>Dispatch Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchLogs.map((log) => {
                    const isSent = log.status === "sent"
                    const isLogged = log.status === "logged"
                    const isFailed = log.status === "failed"

                    return (
                      <tr
                        key={log.id}
                        style={{
                          borderBottom: "1px solid var(--line)",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "3px 9px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background: isSent
                                ? "#dcfce7"
                                : isLogged
                                  ? "#e0f2fe"
                                  : isFailed
                                    ? "#fee2e2"
                                    : "#fef3c7",
                              color: isSent
                                ? "#166534"
                                : isLogged
                                  ? "#0369a1"
                                  : isFailed
                                    ? "#b91c1c"
                                    : "#b45309",
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: isSent
                                  ? "#22c55e"
                                  : isLogged
                                    ? "#0284c7"
                                    : isFailed
                                      ? "#ef4444"
                                      : "#f59e0b",
                              }}
                            />
                            {isSent ? "Delivered" : isLogged ? "MTA Logged" : log.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--navy)" }}>
                          {log.recipient}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#374151" }}>
                          {log.subject}
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>
                          {log.error_message || "Delivered via server mail() from info@vivadoxamusic.com"}
                        </td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>
                          {new Date(log.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default AdminBulletinView
