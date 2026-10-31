// ─── Vivadoxa Admin Gallery Manager ──────────────────────────────────────────
// Full control over the academy showcase photos:
// Upload new photos, edit titles/captions/categories, toggle featured, reorder, delete, and reset.

import React, { useState, useEffect, useRef } from "react"
import { Icon, Button, Field, Textarea, Badge } from "@/components/ui"
import {
  fetchGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  toggleGalleryFeatured,
  reorderGallery,
  resetGalleryDefaults,
  uploadGalleryPhoto,
} from "@/lib/api"
import type { GalleryItem } from "@/types"

const DEFAULT_CATEGORIES = [
  "Piano & Keys",
  "Strings & Violin",
  "Brass & Woodwinds",
  "Guitars",
  "Drums & Rhythm",
  "Ensembles & Bands",
  "Community & Recitals",
]

export function AdminGalleryView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form Fields
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState("Piano & Keys")
  const [formCustomCategory, setFormCustomCategory] = useState("")
  const [formCaption, setFormCaption] = useState("")
  const [formImage, setFormImage] = useState("")
  const [formDate, setFormDate] = useState("October 2026")
  const [formFeatured, setFormFeatured] = useState(false)

  // Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState<GalleryItem | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchGalleryItems()
      setItems(data || [])
    } catch {
      setActionNotice("Failed to fetch gallery items.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openAddModal = () => {
    setEditingItem(null)
    setFormTitle("")
    setFormCategory("Piano & Keys")
    setFormCustomCategory("")
    setFormCaption("")
    setFormImage("/media/gallery/gallery-01-youth-saxophone.jpeg")
    setFormDate("October 2026")
    setFormFeatured(false)
    setShowModal(true)
  }

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item)
    setFormTitle(item.title || "")
    if (DEFAULT_CATEGORIES.includes(item.category)) {
      setFormCategory(item.category)
      setFormCustomCategory("")
    } else {
      setFormCategory("Custom")
      setFormCustomCategory(item.category)
    }
    setFormCaption(item.caption || "")
    setFormImage(item.image || "")
    setFormDate(item.date || "October 2026")
    setFormFeatured(Boolean(item.featured))
    setShowModal(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const res = await uploadGalleryPhoto(file)
      if (res && res.success && res.image_url) {
        setFormImage(res.image_url)
        setActionNotice("Photo uploaded successfully!")
      } else {
        // Fallback for offline dev: create object URL or base64 preview
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormImage(event.target.result as string)
            setActionNotice("Image loaded into editor.")
          }
        }
        reader.readAsDataURL(file)
      }
    } catch {
      setActionNotice("Failed to upload image. Please enter an image path.")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      alert("Please provide a title for the photo.")
      return
    }
    if (!formImage.trim()) {
      alert("Please provide an image URL or upload a photo.")
      return
    }

    const finalCategory =
      formCategory === "Custom"
        ? formCustomCategory.trim() || "General Showcase"
        : formCategory

    setSaving(true)
    const payload: Partial<GalleryItem> = {
      id: editingItem ? editingItem.id : undefined,
      title: formTitle.trim(),
      category: finalCategory,
      caption: formCaption.trim(),
      image: formImage.trim(),
      date: formDate.trim() || "October 2026",
      featured: formFeatured,
      sort_order: editingItem
        ? editingItem.sort_order
        : items.length + 1,
    }

    try {
      const res = await saveGalleryItem(payload)
      if (res && res.success) {
        setActionNotice(
          editingItem
            ? "Photo updated successfully!"
            : "New photo added to academy gallery!",
        )
        setShowModal(false)
        await loadData()
      } else {
        // Local state update fallback
        if (editingItem) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === editingItem.id ? ({ ...i, ...payload } as GalleryItem) : i,
            ),
          )
        } else {
          const newItem: GalleryItem = {
            id: `gal-${Date.now()}`,
            ...payload,
          } as GalleryItem
          setItems((prev) => [newItem, ...prev])
        }
        setShowModal(false)
        setActionNotice("Photo saved locally.")
      }
    } catch {
      setActionNotice("Error saving gallery photo.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteGalleryItem(id)
      if (res && res.success) {
        setActionNotice("Photo removed from gallery.")
      } else {
        setItems((prev) => prev.filter((i) => i.id !== id))
        setActionNotice("Photo deleted locally.")
      }
      setDeleteConfirmId(null)
      await loadData()
    } catch {
      setActionNotice("Error deleting photo.")
    }
  }

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await toggleGalleryFeatured(id)
      if (res && res.success) {
        setActionNotice("Updated featured status.")
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, featured: !i.featured } : i)),
        )
      }
      await loadData()
    } catch {
      setActionNotice("Failed to toggle featured status.")
    }
  }

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    setItems(newItems)
    const orderIds = newItems.map((i) => i.id)

    try {
      await reorderGallery(orderIds)
      setActionNotice("Gallery display order updated.")
    } catch {
      setActionNotice("Order updated locally.")
    }
  }

  const handleResetDefaults = async () => {
    try {
      const res = await resetGalleryDefaults()
      if (res && res.success) {
        setActionNotice("Gallery restored to the initial 16 photos.")
      }
      setResetConfirm(false)
      await loadData()
    } catch {
      setActionNotice("Failed to reset defaults.")
    }
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.caption?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" ||
      item.category?.toLowerCase() === categoryFilter.toLowerCase()

    return matchesSearch && matchesCategory
  })

  const featuredCount = items.filter((i) => i.featured).length

  return (
    <div className="space-y-6">
      {/* ── Summary & Actions Bar ────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Icon name="music" className="text-[var(--gold)]" />
            <span>Academy Photo Gallery Management</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage public website showcase moments, recitals, and rehearsal photos.
            Changes update immediately on the live website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            onClick={openAddModal}
            className="flex items-center gap-2 shadow-xs"
          >
            <Icon name="plus" size={16} />
            <span>Add New Photo</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setResetConfirm(true)}
            className="text-xs text-slate-600 hover:text-red-700"
            title="Reset gallery to the 16 original imported photos"
          >
            Reset Defaults
          </Button>
        </div>
      </div>

      {/* ── Metric Highlights ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Photos
          </span>
          <p className="text-2xl font-bold font-serif text-slate-900 mt-1">
            {items.length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Featured
          </span>
          <p className="text-2xl font-bold font-serif text-[var(--gold)] mt-1">
            {featuredCount}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Instruments Covered
          </span>
          <p className="text-2xl font-bold font-serif text-emerald-600 mt-1">
            {new Set(items.map((i) => i.category)).size}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Live Status
          </span>
          <p className="text-2xl font-bold font-serif text-blue-600 mt-1 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base text-slate-800">Synced</span>
          </p>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size={16} />
          </div>
          <input
            type="text"
            placeholder="Search titles, captions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)]"
          >
            <option value="all">All Categories ({items.length})</option>
            {Array.from(new Set(items.map((i) => i.category))).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Gallery Items Table / Grid ───────────────────────────────────── */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-2"
            style={{ borderColor: "var(--gold)" }}
          />
          <p className="text-sm text-slate-500">Loading gallery data…</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <Icon name="image" className="mx-auto text-slate-400 mb-2" size={36} />
          <p className="text-base font-semibold text-slate-700">No photos match your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 w-16">Order</th>
                  <th className="py-3.5 px-4 w-24">Photo</th>
                  <th className="py-3.5 px-4">Title &amp; Story</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 w-28">Featured</th>
                  <th className="py-3.5 px-4 w-28">Date</th>
                  <th className="py-3.5 px-4 text-right w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Reorder Buttons */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                            idx === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                          }`}
                          title="Move Up"
                        >
                          <Icon name="arrow-up" size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === filteredItems.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                            idx === filteredItems.length - 1
                              ? "opacity-30 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          title="Move Down"
                        >
                          <Icon name="arrow-down" size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div
                        className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden cursor-pointer border border-slate-200 group relative"
                        onClick={() => setPreviewPhoto(item)}
                        title="Click to preview"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Icon name="search" size={14} className="text-white" />
                        </div>
                      </div>
                    </td>

                    {/* Title & Caption */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">
                        {item.title}
                      </p>
                      {item.caption && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                          {item.caption}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          item.featured
                            ? "bg-[rgba(201,107,50,0.14)] text-[var(--gold-text)] hover:bg-[rgba(201,107,50,0.22)] border border-[rgba(201,107,50,0.35)]"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-200"
                        }`}
                      >
                        {item.featured ? "★ Featured" : "Standard"}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                      {item.date || "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
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
        </div>
      )}

      {/* ── Add / Edit Photo Modal ────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <h3 className="text-lg font-bold font-serif text-slate-900">
                {editingItem ? "Edit Gallery Photo" : "Add New Gallery Photo"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Photo Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Photo Asset
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-36 h-28 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
                    {formImage ? (
                      <img
                        src={formImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="image" size={32} className="text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full sm:w-auto text-xs flex items-center gap-2 justify-center"
                    >
                      <Icon name="upload" size={14} />
                      <span>{uploading ? "Uploading…" : "Upload from Computer"}</span>
                    </Button>
                    <p className="text-[11px] text-slate-400">
                      Supports high-res JPG, PNG, or WebP.
                    </p>

                    <div>
                      <input
                        type="text"
                        placeholder="Or enter image URL path (e.g. /media/gallery/...)"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Youth Alto Saxophone Soloist"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </div>

              {/* Category & Date in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category</option>
                  </select>
                  {formCategory === "Custom" && (
                    <input
                      type="text"
                      placeholder="Type category name"
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      className="mt-2 w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date / Session Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. October 2026"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Story Caption / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the moment, musical technique, instrument model, or student achievement..."
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </div>

              {/* Featured toggle */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{
                  background: "rgba(201,107,50,0.08)",
                  borderColor: "rgba(201,107,50,0.25)",
                }}
              >
                <input
                  type="checkbox"
                  id="featured-toggle"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                  style={{ accentColor: "var(--gold)" }}
                />
                <label
                  htmlFor="featured-toggle"
                  className="text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  Mark as Featured Highlight
                  <span className="block text-[11px] font-normal text-slate-500">
                    Featured photos get highlighted status and priority placement.
                  </span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving…" : editingItem ? "Update Photo" : "Add to Gallery"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Icon name="trash" size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Delete this Photo?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              This photo will be removed from the public website gallery. You can
              always re-add it or reset defaults later.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Confirmation Modal ─────────────────────────────────────── */}
      {resetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{
                background: "rgba(201,107,50,0.12)",
                color: "var(--gold-text)",
              }}
            >
              <Icon name="history" size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">
              Restore Default Photos?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              This will re-initialize the gallery with the 16 imported photos from the
              academy recital session.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="ghost" onClick={() => setResetConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleResetDefaults}
              >
                Reset to 16 Defaults
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Photo Preview Lightbox ─────────────────────────────────── */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(11,11,11,0.85)" }}
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border"
            style={{ borderColor: "var(--line)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-4/3 bg-black flex items-center justify-center">
              <img
                src={previewPhoto.image}
                alt={previewPhoto.title}
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{
                    background: "rgba(201,107,50,0.12)",
                    color: "var(--gold-text)",
                    borderColor: "rgba(201,107,50,0.25)",
                  }}
                >
                  {previewPhoto.category}
                </span>
                <span className="text-xs text-slate-400">{previewPhoto.date}</span>
              </div>
              <h4 className="font-serif font-bold text-slate-900 text-base">
                {previewPhoto.title}
              </h4>
              {previewPhoto.caption && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {previewPhoto.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminGalleryView
