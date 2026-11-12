// ─── Admin Shop & Rental Catalog Manager ────────────────────────────────────────
// Add, edit, remove items, descriptions, clinic notes, stock, and fleet types.

import React, { useState, useEffect } from "react"
import { Icon, Button, Field, Textarea } from "@/components/ui"
import {
  fetchCatalogStore,
  saveStoreProduct,
  deleteStoreProduct,
  toggleStoreStock,
  fetchCatalogRentalsData,
  saveRentalGear,
  deleteRentalGear,
  toggleRentalStock,
  toggleRentalActive,
  saveFleetType,
  toggleFleetTypeStatus,
  deleteFleetType,
  resetCatalogDefaults,
} from "@/lib/api"

export interface RentalFleetType {
  id: string
  name: string
  description?: string
  badge?: string
  isActive?: boolean
  order?: number
}

const DEFAULT_FLEET_TYPES: RentalFleetType[] = [
  {
    id: "student",
    name: "Student Home Practice",
    description: "Vetted practice instruments for students, scholars and home learners with clinic maintenance included.",
    badge: "Student Practice Fleet",
    isActive: true,
    order: 1,
  },
  {
    id: "event",
    name: "Stage, PA & Event Backline",
    description: "Professional concert sound systems, stage backline amps, drum kits, and live event gear in Kaduna.",
    badge: "Concert & Event Gear",
    isActive: true,
    order: 2,
  },
]

export function ShopAndRentalsView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [activeSubTab, setActiveSubTab] = useState<"store" | "rentals">("store")
  const [rentalSection, setRentalSection] = useState<"equipment" | "fleet_types">("equipment")
  const [loading, setLoading] = useState(true)
  const [storeProducts, setStoreProducts] = useState<any[]>([])
  const [rentalItems, setRentalItems] = useState<any[]>([])
  const [fleetTypes, setFleetTypes] = useState<RentalFleetType[]>(DEFAULT_FLEET_TYPES)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [fleetTypeFilter, setFleetTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all")

  // Gear Modals
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Gear Form Fields
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState("Guitars")
  const [formBrand, setFormBrand] = useState("")
  const [formBadge, setFormBadge] = useState("")
  const [formImage, setFormImage] = useState("/media/programs/guitar-acoustic-recital.jpeg")
  const [formSetupNote, setFormSetupNote] = useState("")
  const [formSpecs, setFormSpecs] = useState("")
  const [formInStock, setFormInStock] = useState(true)
  const [formIsActive, setFormIsActive] = useState(true)
  const [formRentalType, setFormRentalType] = useState<string>("student")
  const [formRecommendedFor, setFormRecommendedFor] = useState("")

  // Fleet Types Modal State
  const [showFleetTypeModal, setShowFleetTypeModal] = useState(false)
  const [editingFleetType, setEditingFleetType] = useState<RentalFleetType | null>(null)
  const [formFtName, setFormFtName] = useState("")
  const [formFtId, setFormFtId] = useState("")
  const [formFtDescription, setFormFtDescription] = useState("")
  const [formFtBadge, setFormFtBadge] = useState("")
  const [formFtActive, setFormFtActive] = useState(true)
  const [savingFleetType, setSavingFleetType] = useState(false)
  const [deleteConfirmFtId, setDeleteConfirmFtId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [products, rentalsData] = await Promise.all([
        fetchCatalogStore(),
        fetchCatalogRentalsData(),
      ])
      setStoreProducts(products || [])
      setRentalItems(rentalsData?.rentals || [])
      if (rentalsData?.fleetTypes && rentalsData.fleetTypes.length > 0) {
        setFleetTypes(rentalsData.fleetTypes)
      } else {
        setFleetTypes(DEFAULT_FLEET_TYPES)
      }
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
    setFormIsActive(true)
    setFormRentalType(fleetTypes[0]?.id || "student")
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
    setFormIsActive(item.isActive !== false && item.is_active !== false)
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
        isActive: formIsActive,
        is_active: formIsActive,
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

  const handleToggleActive = async (id: string) => {
    const res = await toggleRentalActive(id)
    if (res?.success) {
      setActionNotice(res.message || "Rental equipment active status updated.")
      loadData()
    } else {
      alert(res?.error || "Failed to update gear active status.")
    }
  }

  // ── Fleet Type Handlers ───────────────────────────────────────────────────
  const openAddFleetTypeModal = () => {
    setEditingFleetType(null)
    setFormFtName("")
    setFormFtId("")
    setFormFtDescription("")
    setFormFtBadge("")
    setFormFtActive(true)
    setShowFleetTypeModal(true)
  }

  const openEditFleetTypeModal = (ft: RentalFleetType) => {
    setEditingFleetType(ft)
    setFormFtName(ft.name)
    setFormFtId(ft.id)
    setFormFtDescription(ft.description || "")
    setFormFtBadge(ft.badge || "")
    setFormFtActive(ft.isActive !== false)
    setShowFleetTypeModal(true)
  }

  const handleSaveFleetType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formFtName.trim()) {
      alert("Please provide a fleet type name.")
      return
    }
    setSavingFleetType(true)
    const res = await saveFleetType({
      id: editingFleetType ? editingFleetType.id : formFtId.trim(),
      name: formFtName.trim(),
      description: formFtDescription.trim(),
      badge: formFtBadge.trim(),
      isActive: formFtActive,
    })
    setSavingFleetType(false)
    if (res?.success) {
      setActionNotice(
        editingFleetType
          ? `Updated rental fleet type "${formFtName}".`
          : `Added new rental fleet type "${formFtName}".`,
      )
      setShowFleetTypeModal(false)
      loadData()
    } else {
      alert(res?.error || "Failed to save fleet type.")
    }
  }

  const handleToggleFleetTypeStatus = async (id: string) => {
    const res = await toggleFleetTypeStatus(id)
    if (res?.success) {
      setActionNotice(res.message || "Fleet type active status updated.")
      loadData()
    } else {
      alert(res?.error || "Failed to update fleet type status.")
    }
  }

  const handleDeleteFleetType = async (id: string) => {
    const res = await deleteFleetType(id)
    if (res?.success) {
      setActionNotice("Fleet type removed.")
      setDeleteConfirmFtId(null)
      loadData()
    } else {
      alert(res?.error || "Failed to delete fleet type.")
    }
  }

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to restore the default showcase products, rental fleet, and fleet types?",
      )
    ) {
      return
    }
    const res = await resetCatalogDefaults()
    if (res?.success) {
      setActionNotice("Showcase reset to default showroom inventory.")
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
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter

    const matchesFleetType =
      activeSubTab !== "rentals" ||
      fleetTypeFilter === "all" ||
      item.type === fleetTypeFilter ||
      (!item.type && fleetTypeFilter === "student")

    const matchesStatus =
      activeSubTab !== "rentals" ||
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive !== false && item.is_active !== false) ||
      (statusFilter === "disabled" && (item.isActive === false || item.is_active === false))

    return matchesSearch && matchesCategory && matchesFleetType && matchesStatus
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
      {/* ── Add / Edit Item Dedicated Page ────────────────────────── */}
      {showItemModal ? (
        <div
          className="admin-page-view"
          style={{
            maxWidth: 820,
            margin: "0 auto",
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
                  onClick={() => setShowItemModal(false)}
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
                  ← Back to {activeSubTab === "store" ? "Store Inventory" : "Rental Fleet"}
                </button>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>/</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  {editingItem ? "Edit Item" : "Add New Item"}
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
                {editingItem
                  ? `Edit ${activeSubTab === "store" ? "Store Product" : "Rental Gear"}`
                  : `Add ${activeSubTab === "store" ? "New Product" : "New Rental Gear"}`}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--muted)" }}>
                Enter details for the public showcase. No prices will be displayed publicly.
              </p>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ padding: "28px 32px" }} className="space-y-5">
                <Field
                  label="Item Name *"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Yamaha F310 Natural Dreadnought Acoustic Guitar"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--navy)] mb-1.5">
                      Category *
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-[var(--navy)]">
                          Rental Fleet Type *
                        </label>
                        <button
                          type="button"
                          onClick={openAddFleetTypeModal}
                          className="text-[11px] font-bold text-[var(--gold)] hover:underline cursor-pointer"
                        >
                          + New Fleet Type
                        </button>
                      </div>
                      <select
                        value={formRentalType}
                        onChange={(e) => setFormRentalType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[var(--line)] focus:outline-none focus:border-[var(--gold)]"
                      >
                        {fleetTypes.map((ft) => (
                          <option key={ft.id} value={ft.id}>
                            {ft.name} {ft.badge ? `(${ft.badge})` : ""} {ft.isActive === false ? "· [Disabled]" : ""}
                          </option>
                        ))}
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

                {/* Image URL & quick presets */}
                <div>
                  <label className="block text-xs font-bold text-[var(--navy)] mb-1.5">
                    Image Path / URL *
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
                      className="underline hover:text-[var(--gold)] cursor-pointer"
                    >
                      Guitar
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormImage("/media/programs/violin-solo-rainbow.jpeg")
                      }
                      className="underline hover:text-[var(--gold)] cursor-pointer"
                    >
                      Violin
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormImage("/media/programs/piano-syllabus.jpeg")
                      }
                      className="underline hover:text-[var(--gold)] cursor-pointer"
                    >
                      Piano
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormImage("/media/programs/sax-solo-grey.jpeg")
                      }
                      className="underline hover:text-[var(--gold)] cursor-pointer"
                    >
                      Sax
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormImage("/media/programs/drums-tama-red.jpeg")
                      }
                      className="underline hover:text-[var(--gold)] cursor-pointer"
                    >
                      Drums
                    </button>
                  </div>
                  {/* 4:3 image preview matching catalog showcase cards */}
                  <div className="mt-3 w-48 aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-[var(--line)]">
                    <img
                      src={formImage}
                      alt="Image preview"
                      className="w-full h-full object-cover"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.opacity = "0.2"
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">4:3 preview — as it appears on showcase cards</p>
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
                  rows={4}
                />

                <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center gap-2">
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

                  {activeSubTab === "rentals" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="formIsActiveCheck"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="rounded text-[var(--gold)] focus:ring-[var(--gold)]"
                      />
                      <label
                        htmlFor="formIsActiveCheck"
                        className="text-xs font-semibold text-[var(--navy)] cursor-pointer"
                      >
                        Active in Public Fleet (If unchecked, this gear is disabled and hidden from the website)
                      </label>
                    </div>
                  )}
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
                  variant="secondary"
                  onClick={() => setShowItemModal(false)}
                >
                  ← Back to Showcase
                </Button>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowItemModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingItem ? "Update Item" : "Add to Showcase"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
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
                  setFleetTypeFilter("all")
                  setStatusFilter("all")
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
              {activeSubTab === "rentals" && rentalSection === "fleet_types" ? (
                <Button
                  type="button"
                  onClick={openAddFleetTypeModal}
                  className="!py-2 !px-4 !text-xs flex items-center gap-1.5"
                >
                  <Icon name="plus" size={14} />
                  <span>Add Fleet Type</span>
                </Button>
              ) : (
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
              )}

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-lg border border-[var(--line)] text-slate-500 hover:text-[var(--navy)] hover:bg-slate-50 text-xs cursor-pointer"
                title="Reset catalog and fleet types to showroom defaults"
              >
                <Icon name="refresh" size={14} />
              </button>
            </div>
          </div>

          {/* ── Rentals Management Sub-Bar (Equipment vs Fleet Types) ──── */}
          {activeSubTab === "rentals" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[var(--line)] shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRentalSection("equipment")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    rentalSection === "equipment"
                      ? "bg-[var(--gold)] text-white shadow-xs"
                      : "bg-[#FAF8F5] border border-[var(--line)] text-slate-700 hover:text-[var(--navy)]"
                  }`}
                >
                  <Icon name="tag" size={13} />
                  <span>Fleet Equipment ({rentalItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRentalSection("fleet_types")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    rentalSection === "fleet_types"
                      ? "bg-[var(--gold)] text-white shadow-xs"
                      : "bg-[#FAF8F5] border border-[var(--line)] text-slate-700 hover:text-[var(--navy)]"
                  }`}
                >
                  <Icon name="settings" size={13} />
                  <span>Rental Fleet Types ({fleetTypes.length})</span>
                </button>
              </div>

              <div className="text-xs text-[var(--muted)] flex items-center gap-2">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {fleetTypes.filter((ft) => ft.isActive !== false).length} Active Fleet Types
                </span>
                {fleetTypes.some((ft) => ft.isActive === false) && (
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {fleetTypes.filter((ft) => ft.isActive === false).length} Disabled
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── SECTION A: Manage Fleet Types ──────────────────────────── */}
          {activeSubTab === "rentals" && rentalSection === "fleet_types" ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[var(--line)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">
                    Rental Fleet Types &amp; Divisions
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Configure your rental categories (e.g. Student Home Practice, Stage &amp; Event Backline, Studio Production). Disabling a fleet type hides that entire category and its equipment from the public rental catalog.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={openAddFleetTypeModal}
                  className="!py-2 !px-4 !text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Icon name="plus" size={14} />
                  <span>Add Fleet Type</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fleetTypes.map((ft) => {
                  const gearCount = rentalItems.filter(
                    (r) => r.type === ft.id || (!r.type && ft.id === "student"),
                  ).length
                  const isDefaultType = ft.id === "student" || ft.id === "event"
                  const isTypeActive = ft.isActive !== false

                  return (
                    <div
                      key={ft.id}
                      className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                        !isTypeActive ? "border-rose-200 bg-rose-50/15" : "border-[var(--line)]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              ID: {ft.id}
                            </span>
                            {ft.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                {ft.badge}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFleetTypeStatus(ft.id)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition-colors ${
                              isTypeActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                            }`}
                            title="Click to toggle whether this fleet type is active on the website"
                          >
                            {isTypeActive ? "● Active on Website" : "○ Disabled (Hidden)"}
                          </button>
                        </div>

                        <h4 className="font-bold text-base text-[var(--navy)]">{ft.name}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {ft.description || "No description provided."}
                        </p>

                        <div className="mt-3 text-xs text-[var(--muted)] font-semibold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                          <span>{gearCount} equipment items currently assigned</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[var(--line)] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleFleetTypeStatus(ft.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            isTypeActive
                              ? "border-rose-300 text-rose-700 hover:bg-rose-50"
                              : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {isTypeActive ? "Disable Fleet Type" : "Enable Fleet Type"}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditFleetTypeModal(ft)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-slate-700 hover:text-[var(--navy)] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Icon name="pen" size={12} />
                            <span>Edit</span>
                          </button>

                          {!isDefaultType && (
                            deleteConfirmFtId === ft.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFleetType(ft.id)}
                                  className="px-2.5 py-1.5 rounded bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmFtId(null)}
                                  className="px-2 py-1.5 rounded bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmFtId(ft.id)}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs cursor-pointer"
                                title="Delete Custom Fleet Type"
                              >
                                <Icon name="trash" size={12} />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* ── SECTION B: Equipment Catalog Grid ──────────────────────── */
            <>
              {/* ── Filters & Search ───────────────────────────────────────── */}
              <div className="space-y-3">
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
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-black text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Rental specific filters (Fleet Type & Active Status) */}
                  {activeSubTab === "rentals" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-bold text-[var(--navy)]">Fleet Type:</span>
                        <select
                          value={fleetTypeFilter}
                          onChange={(e) => setFleetTypeFilter(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[var(--line)] shadow-xs font-semibold focus:outline-none focus:border-[var(--gold)]"
                        >
                          <option value="all">All Fleet Types</option>
                          {fleetTypes.map((ft) => (
                            <option key={ft.id} value={ft.id}>
                              {ft.name} {ft.isActive === false ? "(Disabled)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-bold text-[var(--navy)]">Status:</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-white border border-[var(--line)] shadow-xs font-semibold focus:outline-none focus:border-[var(--gold)]"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active Only</option>
                          <option value="disabled">Disabled Only</option>
                        </select>
                      </div>
                    </div>
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
                    Try adjusting your search query, status, or fleet type filter.
                  </p>
                  <Button onClick={openAddModal} className="!text-xs">
                    {activeSubTab === "store" ? "Add New Product" : "Add New Rental Gear"}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredList.map((item) => {
                    const itemFleetType =
                      activeSubTab === "rentals"
                        ? fleetTypes.find((ft) => ft.id === (item.type || "student"))
                        : null
                    const isItemActive =
                      activeSubTab !== "rentals" ||
                      (item.isActive !== false && item.is_active !== false)

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative ${
                          !isItemActive ? "border-rose-200 bg-rose-50/15" : "border-[var(--line)]"
                        }`}
                      >
                        <div>
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-[var(--line)] shrink-0"
                              style={{ width: "64px", height: "64px", minWidth: "64px", maxWidth: "64px" }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
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

                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {itemFleetType && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 truncate">
                                    {itemFleetType.name}
                                  </span>
                                )}

                                {activeSubTab === "rentals" && (
                                  <span
                                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                      isItemActive
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-rose-100 text-rose-800 border border-rose-200"
                                    }`}
                                  >
                                    {isItemActive ? "Active" : "Disabled (Hidden)"}
                                  </span>
                                )}

                                {item.badge && (
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
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
                            ID: <code className="text-slate-600">{item.id.slice(0, 14)}</code>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {activeSubTab === "rentals" && (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(item.id)}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                                  isItemActive
                                    ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                }`}
                                title={
                                  isItemActive
                                    ? "Disable this item to hide it from the website"
                                    : "Enable this item to show on the website"
                                }
                              >
                                {isItemActive ? "Disable" : "Enable"}
                              </button>
                            )}

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
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── FLEET TYPE MODAL (Add / Edit Fleet Type) ────────────────── */}
      {showFleetTypeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          <div className="bg-white rounded-2xl border border-[var(--line)] shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-[var(--line)] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--navy)]">
                  {editingFleetType ? "Edit Fleet Type" : "Add New Rental Fleet Type"}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Fleet types organize your public rental catalog and customer inquiry routes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFleetTypeModal(false)}
                className="text-slate-400 hover:text-black text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFleetType}>
              <div className="p-6 space-y-4">
                <Field
                  label="Fleet Type Name *"
                  value={formFtName}
                  onChange={(e) => {
                    setFormFtName(e.target.value)
                    if (!editingFleetType && !formFtId) {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")
                      setFormFtId(slug)
                    }
                  }}
                  placeholder="e.g. Studio & Recording Lab, Church Outreach Fleet"
                  required
                />

                <Field
                  label="Unique Identifier / Slug *"
                  value={formFtId}
                  onChange={(e) =>
                    setFormFtId(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    )
                  }
                  placeholder="e.g. studio, outreach, junior"
                  disabled={
                    !!editingFleetType &&
                    (editingFleetType.id === "student" ||
                      editingFleetType.id === "event")
                  }
                  required
                />

                <Field
                  label="Badge Tag (Optional)"
                  value={formFtBadge}
                  onChange={(e) => setFormFtBadge(e.target.value)}
                  placeholder="e.g. Student Practice Fleet, Concert & Event Gear, Studio Rig"
                />

                <Textarea
                  label="Description / Purpose"
                  value={formFtDescription}
                  onChange={(e) => setFormFtDescription(e.target.value)}
                  placeholder="Short description of this fleet shown to prospective scholars and clients."
                  rows={3}
                />

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="formFtActiveCheck"
                    checked={formFtActive}
                    onChange={(e) => setFormFtActive(e.target.checked)}
                    className="rounded text-[var(--gold)] focus:ring-[var(--gold)]"
                  />
                  <label
                    htmlFor="formFtActiveCheck"
                    className="text-xs font-semibold text-[var(--navy)] cursor-pointer"
                  >
                    Active and visible on public rentals page
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-[var(--line)] bg-[#FAF8F5] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowFleetTypeModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingFleetType}>
                  {savingFleetType
                    ? "Saving..."
                    : editingFleetType
                    ? "Update Fleet Type"
                    : "Create Fleet Type"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
