// ─── Vivadoxa Academy Gallery Showcase ──────────────────────────────────────────
// Customer-facing photo gallery section with real academy moments,
// category filtering with optimized mobile selector (no clunky scrollbar),
// pagination ("View More Photos"), lightbox modal, and admissions CTAs.
// Strictly adheres to Vivadoxa brand colors (obsidian navy, terracotta gold, cream, warm paper).

import { useState, useEffect, useCallback } from "react"
import { Button, Icon, WhatsAppIcon } from "@/components/ui"
import { ScrollReveal } from "@/components/ScrollReveal"
import { fetchGalleryItems } from "@/lib/api"
import { initialGalleryItems } from "@/lib/data"
import { WHATSAPP_URL } from "@/lib/utils"
import type { GalleryItem, Page } from "@/types"

const CATEGORIES = [
  "All",
  "Piano & Keys",
  "Strings & Violin",
  "Brass & Woodwinds",
  "Guitars",
  "Drums & Rhythm",
  "Ensembles & Bands",
  "Community & Recitals",
]

// Short labels for compact mobile pill wrapping
const MOBILE_LABELS: Record<string, string> = {
  All: "All",
  "Piano & Keys": "Piano",
  "Strings & Violin": "Violin",
  "Brass & Woodwinds": "Sax & Brass",
  Guitars: "Guitar",
  "Drums & Rhythm": "Drums",
  "Ensembles & Bands": "Bands",
  "Community & Recitals": "Recitals",
}

const INITIAL_LIMIT = 8

export function GallerySection({
  go,
  standalone = false,
}: {
  go?: (p: Page | string) => void
  standalone?: boolean
}) {
  const [items, setItems] = useState<GalleryItem[]>(initialGalleryItems)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Load latest photos from API or fallback
  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchGalleryItems()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setItems(data)
        }
      })
      .catch((err) => console.warn("Gallery fetch error:", err))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // Reset showAll when category changes
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category)
    setShowAll(false)
    setLightboxIndex(null)
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeCategory === "All") return true
    return item.category?.toLowerCase() === activeCategory.toLowerCase()
  })

  // Visible items slice (initial limit vs showAll)
  const visibleItems = showAll
    ? filteredItems
    : filteredItems.slice(0, INITIAL_LIMIT)

  // Lightbox navigation
  const activeItem =
    lightboxIndex !== null && filteredItems[lightboxIndex]
      ? filteredItems[lightboxIndex]
      : null

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((curr) =>
      curr !== null
        ? (curr - 1 + filteredItems.length) % filteredItems.length
        : null,
    )
  }, [lightboxIndex, filteredItems.length])

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((curr) =>
      curr !== null ? (curr + 1) % filteredItems.length : null,
    )
  }, [lightboxIndex, filteredItems.length])

  const handleClose = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  // Keyboard controls for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [lightboxIndex, handleClose, handlePrev, handleNext])

  return (
    <section
      id="gallery"
      className={`section overflow-hidden ${standalone ? "pt-12 pb-24" : ""}`}
      style={{
        background: standalone ? "var(--cream)" : "white",
        borderTop: standalone ? "none" : "1px solid var(--line)",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-10">
          <ScrollReveal direction="left" className="max-w-2xl">
            <div>
              <span className="eyebrow">Moments at Vivadoxa</span>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 44px)",
                  margin: "10px 0 12px",
                  color: "var(--navy)",
                }}
              >
                Where musical dedication comes to life.
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.65",
                  color: "var(--muted)",
                  margin: 0,
                }}
              >
                Step inside our Kaduna rehearsal labs, conservatory recitals, and
                live ensemble masterclasses. Real scholars, dedicated mentors, and
                unforgettable performances.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" className="flex items-center gap-3">
            {go && (
              <Button
                variant="primary"
                onClick={() => go("apply")}
                className="shadow-sm hover:shadow"
              >
                Join the Academy
              </Button>
            )}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold text-[var(--whatsapp-text)] bg-[var(--whatsapp-bg-soft)] border border-[var(--whatsapp-border)] hover:bg-[var(--whatsapp)] hover:text-white transition-all shadow-xs"
              title="Chat with Admissions on WhatsApp"
            >
              <WhatsAppIcon size={18} />
              <span>Book a Visit</span>
            </a>
          </ScrollReveal>
        </div>

        {/* ── Category Filters (Optimized for Mobile & Desktop) ────────── */}
        <ScrollReveal direction="up" className="mb-8">
          {/* Mobile Selector (< md): No awkward scrollbar, sleek select & thumb chips */}
          <div className="md:hidden space-y-2.5">
            {/* Quick-select dropdown */}
            <div className="relative">
              <label htmlFor="mobile-gallery-selector" className="sr-only">
                Filter gallery by discipline
              </label>
              <div
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border"
                style={{
                  background: "var(--cream)",
                  borderColor: "var(--line-strong)",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    name="music"
                    size={16}
                    style={{ color: "var(--gold)" }}
                  />
                  <span
                    className="text-xs font-semibold text-[var(--muted)]"
                  >
                    Discipline:
                  </span>
                  <span
                    className="text-xs font-bold truncate"
                    style={{ color: "var(--navy)" }}
                  >
                    {activeCategory}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-white text-[var(--gold-text)] border border-[var(--line)]"
                  >
                    {filteredItems.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[var(--gold-text)] pointer-events-none">
                  <span className="text-[11px] font-semibold">Change</span>
                  <Icon name="arrowDown" size={12} />
                </div>
                {/* Native invisible select covering the whole trigger for seamless touch */}
                <select
                  id="mobile-gallery-selector"
                  value={activeCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => {
                    const count =
                      cat === "All"
                        ? items.length
                        : items.filter(
                            (i) =>
                              i.category?.toLowerCase() === cat.toLowerCase(),
                          ).length
                    return (
                      <option key={cat} value={cat}>
                        {cat} ({count} photos)
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            {/* Quick-tap wrapping pills (zero horizontal scrollbar) */}
            <div
              className="flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="Filter gallery shortcuts"
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat
                const label = MOBILE_LABELS[cat] || cat

                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-[var(--gold)] text-white border-[var(--gold)] shadow-xs"
                        : "bg-white text-[var(--navy)] border-[var(--line)] hover:bg-[#F3EFEA]"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Desktop Tab Pills (md+): Clean full-width pills with no-scrollbar */}
          <div
            className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
            role="tablist"
            aria-label="Filter gallery by instrument"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat
              const count =
                cat === "All"
                  ? items.length
                  : items.filter(
                      (i) => i.category?.toLowerCase() === cat.toLowerCase(),
                    ).length

              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? "bg-[var(--gold)] text-white border-[var(--gold)] shadow-xs"
                      : "bg-[#F3EFEA] text-[var(--navy)] border-[var(--line)] hover:bg-[#EAE4DC] hover:border-[var(--line-strong)]"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-white text-[var(--muted)] border border-[var(--line)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Gallery Grid */}
        {loading && items.length === 0 ? (
          <div className="py-20 text-center text-[var(--muted)]">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-3"
              style={{ borderColor: "var(--gold)" }}
            />
            <p>Loading academy showcase moments…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="py-16 text-center rounded-2xl border border-dashed p-8"
            style={{
              background: "var(--cream)",
              borderColor: "var(--line-strong)",
            }}
          >
            <Icon
              name="music"
              className="mx-auto mb-3"
              size={36}
              style={{ color: "var(--gold)" }}
            />
            <p
              className="font-semibold text-base"
              style={{ color: "var(--navy)" }}
            >
              No photos found in &ldquo;{activeCategory}&rdquo; yet.
            </p>
            <Button
              variant="secondary"
              onClick={() => handleCategorySelect("All")}
              className="mt-4"
            >
              View All Photos ({items.length})
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleItems.map((item, idx) => (
                <ScrollReveal
                  key={item.id}
                  direction="up"
                  className="group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col hover:-translate-y-1"
                  style={{
                    borderColor: "var(--line)",
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <div
                    className="relative aspect-4/3 w-full overflow-hidden cursor-pointer"
                    style={{ background: "var(--cream)" }}
                    onClick={() => {
                      const fullIndex = filteredItems.findIndex(
                        (fi) => fi.id === item.id,
                      )
                      setLightboxIndex(fullIndex !== -1 ? fullIndex : idx)
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Category Pill Tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-xs backdrop-blur-xs border"
                        style={{
                          background: "rgba(255,255,255,0.95)",
                          color: "var(--navy)",
                          borderColor: "var(--line)",
                        }}
                      >
                        {item.category}
                      </span>
                    </div>

                    {item.featured && (
                      <div className="absolute top-3 right-3 z-10">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                          style={{ background: "var(--gold)" }}
                        >
                          Featured
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay with View Icon */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                      style={{ background: "rgba(11,11,11,0.45)" }}
                    >
                      <div
                        className="w-12 h-12 rounded-full text-white flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-200 shadow-lg"
                        style={{ background: "var(--gold)" }}
                      >
                        <Icon name="search" size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className="font-serif font-bold text-base line-clamp-1 transition-colors cursor-pointer"
                        style={{ color: "var(--navy)" }}
                        onClick={() => {
                          const fullIndex = filteredItems.findIndex(
                            (fi) => fi.id === item.id,
                          )
                          setLightboxIndex(fullIndex !== -1 ? fullIndex : idx)
                        }}
                      >
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p
                          className="text-xs line-clamp-2 mt-1.5 leading-relaxed"
                          style={{ color: "var(--muted)" }}
                        >
                          {item.caption}
                        </p>
                      )}
                    </div>

                    <div
                      className="flex items-center justify-between pt-3 mt-3 border-t text-[11px]"
                      style={{
                        borderColor: "var(--line)",
                        color: "var(--muted)",
                      }}
                    >
                      <span>{item.date || "Vivadoxa Recital"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const fullIndex = filteredItems.findIndex(
                            (fi) => fi.id === item.id,
                          )
                          setLightboxIndex(fullIndex !== -1 ? fullIndex : idx)
                        }}
                        className="font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        style={{ color: "var(--gold-text)" }}
                      >
                        <span>Expand</span>
                        <Icon name="arrow" size={11} />
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* ── View More Photos Action Bar ────────────────────────── */}
            {filteredItems.length > INITIAL_LIMIT && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-10 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-[var(--navy)] bg-white border border-[var(--line)] shadow-xs hover:border-[var(--gold)] hover:bg-[#FAF6F0] hover:shadow-md transition-all cursor-pointer group"
                  aria-expanded={showAll}
                >
                  <span>
                    {showAll
                      ? "Show Fewer Photos"
                      : `View More Photos (${filteredItems.length - INITIAL_LIMIT} remaining)`}
                  </span>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: "rgba(201,107,50,0.12)",
                      color: "var(--gold-text)",
                    }}
                  >
                    {showAll
                      ? `Showing all ${filteredItems.length}`
                      : `+${filteredItems.length - INITIAL_LIMIT} more`}
                  </span>
                  <Icon
                    name={showAll ? "arrowUp" : "arrowDown"}
                    size={14}
                  />
                </button>

                {!standalone && go && (
                  <button
                    type="button"
                    onClick={() => go("gallery")}
                    className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    style={{ color: "var(--gold-text)" }}
                  >
                    <span>Full Gallery Page</span>
                    <Icon name="arrow" size={13} />
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Section Bottom Feature Callout (Obsidian Navy Brand Block) */}
        <div
          className="mt-14 p-6 sm:p-9 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border"
          style={{
            background: "var(--navy)",
            borderColor: "rgba(201,107,50,0.3)",
          }}
        >
          <div className="max-w-xl text-center md:text-left">
            <span
              className="eyebrow block mb-2"
              style={{ color: "var(--gold-text-dark)" }}
            >
              Live Auditions &amp; Studio Tours
            </span>
            <h3
              className="text-xl sm:text-2xl font-serif text-white mt-1"
              style={{ fontFamily: '"DM Serif Display", serif' }}
            >
              Want your child or yourself to perform like this?
            </h3>
            <p className="text-sm mt-2" style={{ color: "#b8c4cd" }}>
              Our seasoned conservatory tutors provide structured 1-on-1 coaching,
              ensemble coordination, and stage presence training in Kaduna.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {go && (
              <Button
                variant="primary"
                onClick={() => go("apply")}
                className="font-bold whitespace-nowrap"
              >
                Apply for Admission
              </Button>
            )}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg text-xs md:text-sm font-semibold text-[var(--whatsapp-text)] bg-[var(--whatsapp-bg-soft)] border border-[var(--whatsapp-border)] hover:bg-[var(--whatsapp)] hover:text-white transition-all shadow-xs flex items-center gap-2 whitespace-nowrap"
            >
              <WhatsAppIcon size={18} />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Lightbox Modal ───────────────────────────────────────────────────── */}
      {lightboxIndex !== null && activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm animate-fadeIn"
          style={{ background: "rgba(11,11,11,0.92)" }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-60 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/10"
            aria-label="Close photo preview"
          >
            <Icon name="close" size={22} />
          </button>

          {/* Navigation Prev */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-60 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/10"
            aria-label="Previous photo"
          >
            <Icon name="arrow" size={20} className="rotate-180" />
          </button>

          {/* Navigation Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-60 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/10"
            aria-label="Next photo"
          >
            <Icon name="arrow" size={20} />
          </button>

          {/* Modal Content Box (Obsidian Navy Brand Card) */}
          <div
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl border"
            style={{
              background: "var(--navy)",
              borderColor: "rgba(201,107,50,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image viewport */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[58vh] lg:max-h-[85vh] overflow-hidden">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Sidebar Details */}
            <div
              className="w-full lg:w-88 p-6 flex flex-col justify-between text-white border-t lg:border-t-0 lg:border-l"
              style={{
                background: "var(--navy2)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span
                    className="px-2.5 py-0.5 rounded-full font-semibold border"
                    style={{
                      background: "rgba(201,107,50,0.18)",
                      color: "var(--gold2)",
                      borderColor: "rgba(201,107,50,0.4)",
                    }}
                  >
                    {activeItem.category}
                  </span>
                  <span className="font-mono" style={{ color: "#b8c4cd" }}>
                    {lightboxIndex + 1} / {filteredItems.length}
                  </span>
                </div>

                <h3
                  className="text-xl font-bold font-serif text-white mb-2"
                  style={{ fontFamily: '"DM Serif Display", serif' }}
                >
                  {activeItem.title}
                </h3>

                {activeItem.caption && (
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "#b8c4cd" }}
                  >
                    {activeItem.caption}
                  </p>
                )}

                <div
                  className="text-xs flex items-center gap-2 mb-6"
                  style={{ color: "#8e8984" }}
                >
                  <Icon name="calendar" size={14} />
                  <span>{activeItem.date || "Vivadoxa Academic Session"}</span>
                </div>
              </div>

              <div
                className="pt-4 border-t flex flex-col gap-2.5"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                {go && (
                  <Button
                    variant="primary"
                    full
                    onClick={() => {
                      handleClose()
                      go("apply")
                    }}
                  >
                    Apply for this Instrument
                  </Button>
                )}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs md:text-sm text-center transition-all flex items-center justify-center gap-2 text-[var(--whatsapp-text)] bg-[var(--whatsapp-bg-soft)] border border-[var(--whatsapp-border)] hover:bg-[var(--whatsapp)] hover:text-white"
                >
                  <WhatsAppIcon size={16} />
                  <span>Ask Admissions via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default GallerySection
