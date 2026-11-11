// ─── Vivadoxa Admin Hero Slideshow Manager ────────────────────────────────────
// Manage the photography carousel on the homepage hero section:
// Add, edit, reorder, upload images, toggle active state, and preview in real time.

import React, { useState, useEffect, useRef } from "react"
import { Icon, Button, Field } from "@/components/ui"
import {
  fetchHeroSlides,
  saveHeroSlides,
  resetHeroSlides,
  uploadHeroImage,
  DEFAULT_HERO_SLIDES,
  getMediaUrl,
  type HeroSlideItem,
} from "@/lib/api"

const PRESET_CATEGORIES = [
  "Keys & Piano",
  "Strings",
  "Woodwinds & Brass",
  "Percussion",
  "Voice & Vocals",
  "Guitars & Bass",
  "Live Performance",
  "Custom…",
]

const QUICK_PRESET_IMAGES = [
  {
    title: "Youth Saxophone Ensemble",
    category: "Woodwinds & Brass",
    src: "/media/programs/sax-ensemble.jpeg",
    subtitle: "Harmonies, stage dynamics & group masterclasses",
  },
  {
    title: "Concert Grand Piano",
    category: "Keys & Piano",
    src: "/media/programs/piano-recital-braids.jpeg",
    subtitle: "Classical repertoire, posture & sight-reading",
  },
  {
    title: "Violin Masterclass",
    category: "Strings",
    src: "/media/programs/violin-solo-rainbow.jpeg",
    subtitle: "Bowing technique, pitch control & graded syllabus",
  },
  {
    title: "Rhythm & Drumming Lab",
    category: "Percussion",
    src: "/media/programs/drums-group-lab.jpeg",
    subtitle: "Groove stability, polyrhythms & time-keeping",
  },
  {
    title: "Live Band Rehearsal",
    category: "Live Performance",
    src: "/media/studio/classroom-band-rehearsal.jpeg",
    subtitle: "African groove, stage confidence & collaboration",
  },
  {
    title: "Acoustic Guitar Workshop",
    category: "Guitars & Bass",
    src: "/media/programs/guitar-acoustic.jpeg",
    subtitle: "Fingerstyle, chords & modern contemporary coaching",
  },
]

export function AdminHeroSlidesView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [slides, setSlides] = useState<HeroSlideItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Form Fields
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState("Keys & Piano")
  const [formCustomCategory, setFormCustomCategory] = useState("")
  const [formSubtitle, setFormSubtitle] = useState("")
  const [formSrc, setFormSrc] = useState("")
  const [formAlt, setFormAlt] = useState("")
  const [formActive, setFormActive] = useState(true)

  // Simulator State
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchHeroSlides()
      setSlides(Array.isArray(data) && data.length > 0 ? data : DEFAULT_HERO_SLIDES)
    } catch {
      setActionNotice("Failed to load hero slideshow configuration.")
      setSlides(DEFAULT_HERO_SLIDES)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Keep simulator preview in bounds
  useEffect(() => {
    if (previewSlideIdx >= slides.length && slides.length > 0) {
      setPreviewSlideIdx(0)
    }
  }, [slides.length, previewSlideIdx])

  const openAddModal = () => {
    setEditingIndex(null)
    setFormTitle("")
    setFormCategory("Keys & Piano")
    setFormCustomCategory("")
    setFormSubtitle("")
    setFormSrc("/media/programs/sax-ensemble.jpeg")
    setFormAlt("Students performing live music recital at Vivadoxa Music Academy")
    setFormActive(true)
    setShowModal(true)
  }

  const openEditModal = (slide: HeroSlideItem, index: number) => {
    setEditingIndex(index)
    setFormTitle(slide.title || "")
    if (PRESET_CATEGORIES.includes(slide.category)) {
      setFormCategory(slide.category)
      setFormCustomCategory("")
    } else {
      setFormCategory("Custom…")
      setFormCustomCategory(slide.category)
    }
    setFormSubtitle(slide.subtitle || "")
    setFormSrc(slide.src || "")
    setFormAlt(slide.alt || "")
    setFormActive(slide.active !== false)
    setShowModal(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadHeroImage(file)
      if (res.success && res.image_url) {
        setFormSrc(res.image_url)
        if (!formTitle) {
          const cleanName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
          setFormTitle(cleanName)
        }
        setActionNotice("Photo uploaded successfully.")
      } else {
        alert(res.error || "Failed to upload photo.")
      }
    } catch (err: any) {
      alert(err.message || "Network error uploading photo.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSrc.trim()) {
      alert("Please provide an image URL or upload a photo.")
      return
    }
    if (!formTitle.trim()) {
      alert("Please enter a title for the slide.")
      return
    }

    const resolvedCategory =
      formCategory === "Custom…"
        ? formCustomCategory.trim() || "Music Academy"
        : formCategory

    const newSlide: HeroSlideItem = {
      id:
        editingIndex !== null && slides[editingIndex]
          ? slides[editingIndex].id
          : "slide-" + Date.now(),
      src: formSrc.trim(),
      alt: formAlt.trim() || `${formTitle} at Vivadoxa Music Academy`,
      title: formTitle.trim(),
      subtitle: formSubtitle.trim(),
      category: resolvedCategory,
      active: formActive,
    }

    const updated = [...slides]
    if (editingIndex !== null) {
      updated[editingIndex] = newSlide
    } else {
      updated.push(newSlide)
    }

    setSaving(true)
    try {
      const res = await saveHeroSlides(updated)
      if (res.success) {
        setSlides(updated)
        setShowModal(false)
        setActionNotice(
          editingIndex !== null
            ? `✓ Updated slide "${formTitle}" in homepage hero carousel.`
            : `✓ Added "${formTitle}" to homepage hero carousel.`
        )
      } else {
        alert(res.error || "Failed to save slideshow updates.")
      }
    } catch (err: any) {
      alert(err.message || "Failed to save slideshow.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlide = async () => {
    if (deleteIndex === null) return
    const target = slides[deleteIndex]
    const updated = slides.filter((_, idx) => idx !== deleteIndex)

    if (updated.length === 0) {
      alert("The slideshow must have at least one slide. Consider replacing this slide instead of deleting all.")
      setDeleteIndex(null)
      return
    }

    setSaving(true)
    try {
      const res = await saveHeroSlides(updated)
      if (res.success) {
        setSlides(updated)
        setDeleteIndex(null)
        setActionNotice(`✓ Removed slide "${target.title}" from hero slideshow.`)
      } else {
        alert(res.error || "Failed to delete slide.")
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete slide.")
    } finally {
      setSaving(false)
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= slides.length) return

    const updated = [...slides]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    setSlides(updated)
    setSaving(true)
    try {
      await saveHeroSlides(updated)
      setActionNotice("✓ Slide reordered successfully.")
    } catch {
      setActionNotice("Failed to update slide order.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (index: number) => {
    const updated = [...slides]
    const current = updated[index]
    updated[index] = { ...current, active: current.active === false }

    setSlides(updated)
    setSaving(true)
    try {
      await saveHeroSlides(updated)
      setActionNotice(
        updated[index].active !== false
          ? `✓ Activated slide "${current.title}" on homepage.`
          : `✓ Hidden slide "${current.title}" from homepage.`
      )
    } catch {
      setActionNotice("Failed to update slide status.")
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefaults = async () => {
    setSaving(true)
    try {
      const res = await resetHeroSlides()
      if (res.success) {
        setSlides(DEFAULT_HERO_SLIDES)
        setShowResetConfirm(false)
        setActionNotice("✓ Homepage hero slideshow restored to factory academy defaults.")
      } else {
        alert(res.error || "Failed to reset slideshow.")
      }
    } catch (err: any) {
      alert(err.message || "Failed to reset.")
    } finally {
      setSaving(false)
    }
  }

  const activeSlides = slides.filter((s) => s.active !== false)
  const currentSimSlide =
    activeSlides[previewSlideIdx] || activeSlides[0] || slides[0] || DEFAULT_HERO_SLIDES[0]

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "24px 28px",
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--navy)" }}>
              Homepage Hero Slideshow
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(201,107,50,0.12)",
                color: "var(--gold-text)",
                padding: "3px 10px",
                borderRadius: 999,
                letterSpacing: 0.5,
              }}
            >
              {activeSlides.length} Active Slides
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", maxWidth: 640 }}>
            Upload, replace, and reorder the photography displayed in the dynamic hero carousel on the Vivadoxa homepage. Changes are instantly published.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            onClick={() => setShowResetConfirm(true)}
            disabled={saving}
            style={{ fontSize: 13 }}
            title="Restore original 5 academy photos"
          >
            Reset Defaults
          </Button>
          <Button onClick={openAddModal} disabled={saving} style={{ fontSize: 13 }}>
            <Icon name="plus" size={14} />
            <span>Add Hero Slide</span>
          </Button>
        </div>
      </div>

      {/* ── Live Carousel Simulator ─────────────────────────────────────── */}
      <div
        style={{
          background: "#0b1118",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>👁️</span>
            <strong style={{ fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" }}>
              Live Website Hero Simulation
            </strong>
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            Slide {activeSlides.length > 0 ? previewSlideIdx + 1 : 0} of {activeSlides.length}
          </span>
        </div>

        {activeSlides.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
            <p>No active slides to display. Enable or add a slide below.</p>
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 380,
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#05080c",
            }}
          >
            <img
              src={getMediaUrl(currentSimSlide.src)}
              alt={currentSimSlide.alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "opacity 0.4s ease",
              }}
              onError={(e: any) => {
                const fallback = getMediaUrl("/media/programs/sax-ensemble.jpeg")
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback
                }
              }}
            />
            {/* Subtle Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(11,17,24,0.15) 0%, rgba(11,17,24,0.7) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Simulator Arrow Controls */}
            <button
              type="button"
              onClick={() =>
                setPreviewSlideIdx(
                  (prev) => (prev - 1 + activeSlides.length) % activeSlides.length
                )
              }
              aria-label="Previous Slide"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                width: 38,
                height: 38,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() =>
                setPreviewSlideIdx((prev) => (prev + 1) % activeSlides.length)
              }
              aria-label="Next Slide"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                width: 38,
                height: 38,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>

            {/* Dots */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                gap: 6,
                background: "rgba(0,0,0,0.45)",
                padding: "6px 12px",
                borderRadius: 999,
                backdropFilter: "blur(6px)",
              }}
            >
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewSlideIdx(idx)}
                  style={{
                    width: idx === previewSlideIdx ? 20 : 7,
                    height: 7,
                    borderRadius: 999,
                    border: "none",
                    background:
                      idx === previewSlideIdx ? "var(--gold)" : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Recital Discipline Banner Preview */}
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 18,
                right: 18,
                background: "rgba(11,17,24,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(201,107,50,0.2)",
                    color: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="music" size={15} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      color: "var(--gold2)",
                      fontWeight: 700,
                    }}
                  >
                    Discipline · {currentSimSlide.category}
                  </div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: 14,
                      color: "white",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {currentSimSlide.title}
                  </strong>
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--gold2)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  marginLeft: 12,
                }}
              >
                Explore Course ↗
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Slides Management List ───────────────────────────────────────── */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--line)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--line)",
            background: "#faf9f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <strong style={{ fontSize: 14, color: "var(--navy)" }}>
            Current Slides ({slides.length})
          </strong>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Use the arrows to reorder how slides appear in the rotation
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)" }}>
            Loading hero slides…
          </div>
        ) : slides.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ color: "var(--muted)", margin: "0 0 16px" }}>
              No hero slides configured.
            </p>
            <Button onClick={openAddModal}>Add First Slide</Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {slides.map((slide, idx) => {
              const isActive = slide.active !== false
              return (
                <div
                  key={slide.id || idx}
                  style={{
                    padding: "16px 24px",
                    borderBottom:
                      idx < slides.length - 1 ? "1px solid var(--line)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                    background: isActive ? "white" : "#fafafa",
                    opacity: isActive ? 1 : 0.65,
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Left: Thumbnail & Details */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 260 }}>
                    {/* Index Badge */}
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: isActive ? "#f4ece1" : "#e5e7eb",
                        color: isActive ? "var(--gold-text)" : "#6b7280",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>

                    {/* Image Thumbnail */}
                    <div
                      style={{
                        width: 90,
                        height: 60,
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid var(--line)",
                        flexShrink: 0,
                        background: "#f1f5f9",
                      }}
                    >
                      <img
                        src={getMediaUrl(slide.src)}
                        alt={slide.alt || slide.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e: any) => {
                          const fallback = getMediaUrl("/media/programs/sax-ensemble.jpeg")
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback
                          }
                        }}
                      />
                    </div>

                    {/* Metadata */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            letterSpacing: 0.8,
                            textTransform: "uppercase",
                            color: "var(--gold)",
                          }}
                        >
                          {slide.category}
                        </span>
                        {!isActive && (
                          <span
                            style={{
                              fontSize: 10,
                              background: "#fee2e2",
                              color: "#991b1b",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontWeight: 600,
                            }}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                      <strong style={{ fontSize: 14.5, color: "var(--navy)", display: "block" }}>
                        {slide.title}
                      </strong>
                      {slide.subtitle && (
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 12,
                            color: "var(--muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {slide.subtitle}
                        </p>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          fontFamily: "monospace",
                          display: "block",
                          marginTop: 3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {slide.src}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        background: "white",
                        cursor: idx === 0 ? "not-allowed" : "pointer",
                        opacity: idx === 0 ? 0.3 : 1,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      title="Move slide earlier in rotation"
                    >
                      ▲
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === slides.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        background: "white",
                        cursor: idx === slides.length - 1 ? "not-allowed" : "pointer",
                        opacity: idx === slides.length - 1 ? 0.3 : 1,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      title="Move slide later in rotation"
                    >
                      ▼
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(idx)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--line)",
                        background: isActive ? "#f8fafc" : "#fef2f2",
                        color: isActive ? "#475569" : "#dc2626",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                      title={isActive ? "Hide from homepage" : "Show on homepage"}
                    >
                      {isActive ? "Hide" : "Show"}
                    </button>

                    {/* Edit */}
                    <Button
                      variant="secondary"
                      onClick={() => openEditModal(slide, idx)}
                      style={{ padding: "6px 14px", fontSize: 12 }}
                    >
                      <Icon name="edit" size={13} />
                      <span>Edit</span>
                    </Button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteIndex(idx)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "1px solid #fecaca",
                        background: "#fff",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                      title="Delete slide"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ────────────────────────────────────────────── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 14,
              maxWidth: 620,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                borderBottom: "1px solid var(--line)",
                paddingBottom: 14,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>
                {editingIndex !== null ? "Edit Hero Slide" : "Add New Hero Slide"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlide}>
              {/* Photo Upload & Preview Section */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "var(--navy)",
                  }}
                >
                  Slide Photography *
                </label>

                {/* Preview Thumbnail */}
                {formSrc && (
                  <div
                    style={{
                      width: "100%",
                      height: 180,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid var(--line)",
                      marginBottom: 12,
                      background: "#0b1118",
                      position: "relative",
                    }}
                  >
                    <img
                      src={getMediaUrl(formSrc)}
                      alt="Hero slide preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e: any) => {
                        const fallback = getMediaUrl("/media/programs/sax-ensemble.jpeg")
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback
                        }
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        background: "rgba(0,0,0,0.65)",
                        color: "white",
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 4,
                      }}
                    >
                      Image Preview
                    </div>
                  </div>
                )}

                {/* Upload Buttons */}
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ fontSize: 12 }}
                  >
                    <Icon name="camera" size={14} />
                    <span>{uploading ? "Uploading…" : "Upload Photo from Device"}</span>
                  </Button>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>or enter path below:</span>
                </div>

                <Field
                  label="Image URL or Path"
                  value={formSrc}
                  onChange={(e) => setFormSrc(e.target.value)}
                  placeholder="/media/programs/sax-ensemble.jpeg or https://..."
                  required
                />

                {/* Preset Quick Picker */}
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Quick Select from Academy Presets:
                  </span>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                    {QUICK_PRESET_IMAGES.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setFormSrc(p.src)
                          if (!formTitle) setFormTitle(p.title)
                          if (!formSubtitle) setFormSubtitle(p.subtitle)
                          setFormCategory(p.category)
                        }}
                        style={{
                          flex: "0 0 auto",
                          border: formSrc === p.src ? "2px solid var(--gold)" : "1px solid var(--line)",
                          borderRadius: 6,
                          overflow: "hidden",
                          width: 80,
                          height: 54,
                          cursor: "pointer",
                          padding: 0,
                          background: "#000",
                        }}
                        title={p.title}
                      >
                        <img src={getMediaUrl(p.src)} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Discipline */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Field
                  label="Slide Title *"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Concert Grand Piano"
                  required
                />

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12.5,
                      fontWeight: 700,
                      marginBottom: 6,
                      color: "var(--navy)",
                    }}
                  >
                    Discipline / Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--line)",
                      background: "white",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Category Input if selected */}
              {formCategory === "Custom…" && (
                <div style={{ marginBottom: 14 }}>
                  <Field
                    label="Custom Category Name *"
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="e.g. Acoustic Masterclass"
                    required
                  />
                </div>
              )}

              {/* Subtitle / Description */}
              <div style={{ marginBottom: 14 }}>
                <Field
                  label="Subtitle / Focus Area"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Harmonies, stage dynamics & group masterclasses"
                />
              </div>

              {/* Alt Text */}
              <div style={{ marginBottom: 18 }}>
                <Field
                  label="Accessibility & SEO Alt Text"
                  value={formAlt}
                  onChange={(e) => setFormAlt(e.target.value)}
                  placeholder="e.g. Young Nigerian musicians performing saxophone ensemble at Vivadoxa"
                />
              </div>

              {/* Active Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: "#faf9f7",
                  border: "1px solid var(--line)",
                  marginBottom: 24,
                }}
              >
                <input
                  type="checkbox"
                  id="slideActiveCheck"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <label htmlFor="slideActiveCheck" style={{ fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  Active (show this slide in the homepage hero rotation)
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : editingIndex !== null ? "Save Changes" : "Add Slide"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ──────────────────────────────────── */}
      {deleteIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteIndex(null)
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              maxWidth: 440,
              width: "100%",
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "#991b1b" }}>
              Delete Hero Slide?
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>"{slides[deleteIndex]?.title}"</strong> from the homepage hero slideshow?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button variant="ghost" onClick={() => setDeleteIndex(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSlide}
                disabled={saving}
                style={{ background: "#dc2626", borderColor: "#dc2626" }}
              >
                {saving ? "Deleting…" : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Confirmation Dialog ───────────────────────────────────── */}
      {showResetConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResetConfirm(false)
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              maxWidth: 440,
              width: "100%",
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: "var(--navy)" }}>
              Reset to Factory Academy Defaults?
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              This will restore the original 5 curated Vivadoxa hero photographs (Saxophone Ensemble, Concert Grand Piano, Violin Masterclass, Drumming Lab, and Band Rehearsal).
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleResetDefaults} disabled={saving}>
                {saving ? "Resetting…" : "Confirm Reset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminHeroSlidesView
