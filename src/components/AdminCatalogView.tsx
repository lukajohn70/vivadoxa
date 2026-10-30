// ─── Admin Shop & Rental Catalog Manager ────────────────────────────────────────
// Add, edit, remove items, descriptions, clinic notes, and stock status.

import React, { useState, useEffect } from "react"
import { Icon, Button, Field, Textarea } from "@/components/ui"
import {
  fetchCatalogStore,
  saveStoreProduct,
  deleteStoreProduct,
  toggleStoreStock,
  fetchCatalogRentals,
  saveRentalGear,
  deleteRentalGear,
  toggleRentalStock,
  resetCatalogDefaults,
} from "@/lib/api"

export function ShopAndRentalsView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [activeSubTab, setActiveSubTab] = useState<"store" | "rentals">("store")
  const [loading, setLoading] = useState(true)
  const [storeProducts, setStoreProducts] = useState<any[]>([])
  const [rentalItems, setRentalItems] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Modals
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form Fields
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState("Guitars")
  const [formBrand, setFormBrand] = useState("")
  const [formBadge, setFormBadge] = useState("")
  const [formImage, setFormImage] = useState("/media/programs/guitar-acoustic-recital.jpeg")
  const [formSetupNote, setFormSetupNote] = useState("")
  const [formSpecs, setFormSpecs] = useState("")
  const [formInStock, setFormInStock] = useState(true)
  const [formRentalType, setFormRentalType] = useState<"student" | "event">("student")
  const [formRecommendedFor, setFormRecommendedFor] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const [products, rentals] = await Promise.all([
        fetchCatalogStore(),
        fetchCatalogRentals(),
      ])
      setStoreProducts(products || [])
      setRentalItems(rentals || [])
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openAddModal = () => {
    setEditingItem(null)
    setFormName("")
    setFormCategory(activeSubTab === "store" ? "Guitars" : "Strings")
    setFormBrand("")
    setFormBadge("")
    setFormImage(
      activeSubTab === "store"
        ? "/media/programs/guitar-acoustic-recital.jpeg"
        : "/media/programs/violin-solo-rainbow.jpeg",
    )
    setFormSetupNote(
      activeSubTab === "store"
        ? "Action adjusted and pre-delivery intonation verified"
        : "",
    )
    setFormSpecs("")
    setFormInStock(true)
    setFormRentalType("student")
    setFormRecommendedFor("Beginner & Intermediate scholars")
    setShowItemModal(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setFormName(item.name || "")
    setFormCategory(item.category || "Guitars")
    setFormBrand(item.brand || "")
    setFormBadge(item.badge || "")
    setFormImage(item.image || "/media/programs/guitar-acoustic-recital.jpeg")
    setFormSetupNote(item.setupNote || "")
    const specsList = Array.isArray(item.specs)
      ? item.specs.join("\n")
      : Array.isArray(item.inclusions)
      ? item.inclusions.join("\n")
      : typeof item.specs === "string"
      ? item.specs
      : ""
    setFormSpecs(specsList)
    setFormInStock(item.inStock !== false)
    setFormRentalType(item.type || "student")
    setFormRecommendedFor(item.recommendedFor || item.idealFor || "")
    setShowItemModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      alert("Please provide an item name.")
      return
    }

    setSaving(true)
    const specsArray = formSpecs
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

    if (activeSubTab === "store") {
      const payload = {
        id: editingItem ? editingItem.id : undefined,
        name: formName.trim(),
        category: formCategory,
        brand: formBrand.trim() || "Vivadoxa Certified",
        badge: formBadge.trim(),
        image: formImage.trim(),
        setupNote: formSetupNote.trim() || "Pre-delivery clinic inspection passed",
        specs: specsArray,
        inStock: formInStock,
      }

      const res = await saveStoreProduct(payload)
      setSaving(false)
      if (res?.success) {
        setActionNotice(
          editingItem
            ? `Updated "${formName}" in Store.`
            : `Added "${formName}" to Store showcase.`,
        )
        setShowItemModal(false)
        loadData()
      } else {
        alert(res?.error || "Failed to save product.")
      }
    } else {
      const payload = {
        id: editingItem ? editingItem.id : undefined,
        name: formName.trim(),
        category: formCategory,
        type: formRentalType,
        image: formImage.trim(),
        recommendedFor: formRecommendedFor.trim(),
        idealFor: formRecommendedFor.trim(),
        inclusions: specsArray,
        features: specsArray,
        inStock: formInStock,
      }

      const res = await saveRentalGear(payload)
      setSaving(false)
      if (res?.success) {
        setActionNotice(
          editingItem
            ? `Updated "${formName}" in Rental fleet.`
            : `Added "${formName}" to Rental fleet.`,
        )
        setShowItemModal(false)
        loadData()
      } else {
        alert(res?.error || "Failed to save rental item.")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (activeSubTab === "store") {
      const res = await deleteStoreProduct(id)
      if (res?.success) {
        setActionNotice("Product removed from showcase.")
        setDeleteConfirmId(null)
        loadData()
      } else {
        alert(res?.error || "Failed to delete product.")
      }
    } else {
      const res = await deleteRentalGear(id)
      if (res?.success) {
        setActionNotice("Rental gear removed from fleet.")
        setDeleteConfirmId(null)
        loadData()
      } else {
        alert(res?.error || "Failed to delete rental gear.")
      }
    }
  }

  const handleToggleStock = async (id: string) => {
    if (activeSubTab === "store") {
      await toggleStoreStock(id)
      setActionNotice("Product stock status updated.")
      loadData()
    } else {
      await toggleRentalStock(id)
      setActionNotice("Rental availability updated.")
      loadData()
    }
  }

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to restore the default showcase products and rental fleet?",
      )
    ) {
      return
    }
    const res = await resetCatalogDefaults()
    if (res?.success) {
      setActionNotice("Showcase reset to default inventory.")
      loadData()
    } else {
      alert("Failed to reset catalog.")
    }
  }

  // Filter items
  const currentList = activeSubTab === "store" ? storeProducts : rentalItems
  const filteredList = currentList.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const storeCategories = [
    "all",
    "Guitars",
    "Strings",
    "Keys",
    "Woodwinds",
    "Brass",
    "Percussion",
    "Accessories",
  ]
  const rentalCategories = [
    "all",
    "Strings",
    "Keys",
    "Guitars",
    "Woodwinds",
    "Brass",
    "PA & Sound",
    "Backline",
  ]

  const activeCategories =
    activeSubTab === "store" ? storeCategories : rentalCategories

  return (
    <div className="space-y-6">
      {/* ── SubTab Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[var(--line)] shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("store")
              setCategoryFilter("all")
              setSearch("")
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "store"
                ? "bg-[var(--navy)] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-[var(--navy)]"
            }`}
          >
            Store Inventory Showcase ({storeProducts.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("rentals")
              setCategoryFilter("all")
              setSearch("")
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "rentals"
                ? "bg-[var(--navy)] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-[var(--navy)]"
            }`}
          >
            Rental Fleet ({rentalItems.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={openAddModal}
            className="!py-2 !px-4 !text-xs flex items-center gap-1.5"
          >
            <Icon name="plus" size={14} />
            <span>
              {activeSubTab === "store" ? "Add Product" : "Add Rental Gear"}
            </span>
          </Button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-lg border border-[var(--line)] text-slate-500 hover:text-[var(--navy)] hover:bg-slate-50 text-xs"
            title="Reset catalog to showroom defaults"
          >
            <Icon name="refresh" size={14} />
          </button>
        </div>
      </div>

      {/* ── Filters & Search ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search items, brands, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[var(--line)] shadow-xs focus:outline-none focus:border-[var(--gold)]"
          />
          <span className="absolute left-3 top-2.5 text-[var(--muted)]">
            <Icon name="search" size={14} />
          </span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-black text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto max-w-full">
          {activeCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[var(--gold)] text-white shadow-xs"
                  : "bg-white border border-[var(--line)] text-slate-600 hover:text-[var(--navy)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Items Grid / List ──────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[var(--line)]">
          <Icon name="refresh" size={24} className="animate-spin mx-auto text-[var(--muted)] mb-2" />
          <p className="text-xs text-[var(--muted)]">Loading catalog items...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[var(--line)]">
          <Icon name="info" size={28} className="mx-auto text-[var(--muted)] mb-2" />
          <h4 className="text-sm font-bold text-[var(--navy)]">No items match your filter</h4>
          <p className="text-xs text-[var(--muted)] mt-1 mb-4">
            Try adjusting your search query or add a new item to this category.
          </p>
          <Button onClick={openAddModal} className="!text-xs">
            Add New Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[var(--line)] p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-900 border border-[var(--line)] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] uppercase font-bold text-[var(--gold)] truncate">
                        {item.category} {item.brand ? `· ${item.brand}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          item.inStock !== false
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                        title="Click to toggle availability"
                      >
                        {item.inStock !== false ? "● In Stock" : "○ Unavailable"}
                      </button>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-[var(--navy)] line-clamp-2 leading-snug">
                      {item.name}
                    </h4>

                    {item.badge && (
                      <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Setup note or description */}
                {item.setupNote && (
                  <p className="text-[11px] text-slate-600 bg-[#FAF8F5] p-2 rounded border border-[var(--line)] mb-2 line-clamp-2 leading-tight">
                    <strong className="text-[10px] text-[var(--navy)] block">Clinic Setup:</strong>
                    {item.setupNote}
                  </p>
                )}

                {item.recommendedFor && (
                  <p className="text-[11px] text-slate-500 mb-2 line-clamp-1">
                    <strong>For:</strong> {item.recommendedFor}
                  </p>
                )}

                {/* Specs / Inclusions Preview */}
                <div className="space-y-0.5 mb-3">
                  {((item.specs || item.inclusions || []) as string[])
                    .slice(0, 2)
                    .map((s, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] text-slate-500 truncate flex items-center gap-1"
                      >
                        <span className="text-[var(--gold)]">•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-2 mt-auto">
                <span className="text-[10px] text-[var(--muted)]">
                  ID: <code className="text-slate-600">{item.id.slice(0, 16)}</code>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-[var(--line)] text-slate-600 hover:text-[var(--navy)] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Edit Item"
                  >
                    <Icon name="pen" size={12} />
                    <span>Edit</span>
                  </button>

                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 rounded bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs cursor-pointer"
                      title="Remove Item"
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ───────────────────────────────────────── */}
      {showItemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[var(--line)] relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowItemModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[var(--navy)] p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <Icon name="close" size={18} />
            </button>

            <h3 className="font-bold text-base sm:text-lg text-[var(--navy)] mb-1">
              {editingItem
                ? `Edit ${activeSubTab === "store" ? "Store Product" : "Rental Gear"}`
                : `Add ${activeSubTab === "store" ? "New Product" : "New Rental Gear"}`}
            </h3>
            <p className="text-xs text-[var(--muted)] mb-5">
              Enter details for the public showcase. No prices will be displayed publicly.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <Field
                label="Item Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Yamaha F310 Natural Dreadnought Acoustic Guitar"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--navy)] mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[var(--line)] focus:outline-none focus:border-[var(--gold)]"
                  >
                    {activeCategories
                      .filter((c) => c !== "all")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                {activeSubTab === "store" ? (
                  <Field
                    label="Brand / Manufacturer"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Yamaha, Fender, D'Addario"
                  />
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[var(--navy)] mb-1.5">
                      Rental Fleet Type
                    </label>
                    <select
                      value={formRentalType}
                      onChange={(e) =>
                        setFormRentalType(e.target.value as "student" | "event")
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[var(--line)] focus:outline-none focus:border-[var(--gold)]"
                    >
                      <option value="student">Student Home Practice</option>
                      <option value="event">Stage &amp; Event Backline</option>
                    </select>
                  </div>
                )}
              </div>

              {activeSubTab === "store" && (
                <Field
                  label="Badge Label (Optional)"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="e.g. Bestseller, Faculty Choice, French Import"
                />
              )}

              {activeSubTab === "rentals" && (
                <Field
                  label="Recommended For / Ideal Usage"
                  value={formRecommendedFor}
                  onChange={(e) => setFormRecommendedFor(e.target.value)}
                  placeholder="e.g. Beginner violin scholars, Sunday service recitals"
                />
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--navy)] mb-1.5">
                  Image Path / URL
                </label>
                <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[var(--line)] focus:outline-none focus:border-[var(--gold)]"
                    placeholder="/media/programs/guitar-acoustic-recital.jpeg"
                    required
                  />
                <div className="flex flex-wrap gap-1 mt-1.5 text-[10px] text-slate-500">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormImage("/media/programs/guitar-acoustic-recital.jpeg")
                    }
                    className="underline hover:text-[var(--gold)]"
                  >
                    Guitar
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormImage("/media/programs/violin-solo-rainbow.jpeg")
                    }
                    className="underline hover:text-[var(--gold)]"
                  >
                    Violin
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormImage("/media/programs/piano-recital-mastery.jpeg")
                    }
                    className="underline hover:text-[var(--gold)]"
                  >
                    Piano
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormImage("/media/programs/saxophone-solo-stage.jpeg")
                    }
                    className="underline hover:text-[var(--gold)]"
                  >
                    Sax
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormImage("/media/programs/drums-contemporary-groove.jpeg")
                    }
                    className="underline hover:text-[var(--gold)]"
                  >
                    Drums
                  </button>
                </div>
                {/* 16:9 image preview */}
                <div className="mt-2 w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-[var(--line)]">
                  <img
                    src={formImage}
                    alt="Image preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.opacity = "0.2"
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">16:9 preview — as it appears on product cards</p>
              </div>

              {activeSubTab === "store" ? (
                <Field
                  label="Clinic Setup Guarantee Note"
                  value={formSetupNote}
                  onChange={(e) => setFormSetupNote(e.target.value)}
                  placeholder="e.g. Fret leveling, low-action string tension adjustment completed"
                />
              ) : null}

              <Textarea
                label={
                  activeSubTab === "store"
                    ? "Specifications (One per line)"
                    : "Included Accessories / Features (One per line)"
                }
                value={formSpecs}
                onChange={(e) => setFormSpecs(e.target.value)}
                placeholder={"Spruce top with rosewood fretboard\nDie-cast chrome tuners\nIncludes padded gig bag"}
                rows={3}
              />

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formInStockCheck"
                  checked={formInStock}
                  onChange={(e) => setFormInStock(e.target.checked)}
                  className="rounded text-[var(--gold)] focus:ring-[var(--gold)]"
                />
                <label
                  htmlFor="formInStockCheck"
                  className="text-xs font-semibold text-[var(--navy)] cursor-pointer"
                >
                  Mark as Available / In Stock for immediate handover
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowItemModal(false)}
                  className="!text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="!text-xs">
                  {saving ? "Saving..." : editingItem ? "Update Item" : "Add to Showcase"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
