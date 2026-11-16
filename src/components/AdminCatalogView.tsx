// ─── Admin Shop & Rental Catalog Manager ────────────────────────────────────────
// Add, edit, remove items, descriptions, clinic notes, stock, fleet types, and categories.

import React, { useState, useEffect, useRef } from "react"
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
  saveRentalCategory,
  deleteRentalCategory,
  uploadCatalogImage,
  resetCatalogDefaults,
} from "@/lib/api"
import { compressImageForUpload } from "@/lib/utils"

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

const DEFAULT_RENTAL_CATEGORIES = [
  "Strings",
  "Keys",
  "Guitars",
  "Woodwinds",
  "Brass",
  "PA & Sound",
  "Backline",
  "Percussion",
  "Microphones",
  "Accessories",
]

export function ShopAndRentalsView({
  setActionNotice,
}: {
  setActionNotice: (msg: string) => void
}) {
  const [activeSubTab, setActiveSubTab] = useState<"store" | "rentals">("store")
  const [rentalSection, setRentalSection] = useState<"equipment" | "fleet_types" | "categories">("equipment")
  const [loading, setLoading] = useState(true)
  const [storeProducts, setStoreProducts] = useState<any[]>([])
  const [rentalItems, setRentalItems] = useState<any[]>([])
  const [fleetTypes, setFleetTypes] = useState<RentalFleetType[]>(DEFAULT_FLEET_TYPES)
  const [rentalCategories, setRentalCategories] = useState<string[]>(DEFAULT_RENTAL_CATEGORIES)
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
  const [formPriceLabel, setFormPriceLabel] = useState("")
  const [formRentalType, setFormRentalType] = useState<string>("student")
  const [formRecommendedFor, setFormRecommendedFor] = useState("")
  const [formDailyRateLabel, setFormDailyRateLabel] = useState("")
  const [formWeeklyRateLabel, setFormWeeklyRateLabel] = useState("")
  const [formMonthlyRateLabel, setFormMonthlyRateLabel] = useState("")

  // Multi-Image & Featured Image State
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [imageUploadMode, setImageUploadMode] = useState<"upload" | "url">("upload")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [formImages, setFormImages] = useState<string[]>([])
  const [formFeaturedImage, setFormFeaturedImage] = useState<string>("")
  const [customImageUrl, setCustomImageUrl] = useState("")

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

  // Categories Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [formCategoryName, setFormCategoryName] = useState("")
  const [savingCategory, setSavingCategory] = useState(false)
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<string | null>(null)

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
      if (rentalsData?.categories && rentalsData.categories.length > 0) {
        setRentalCategories(rentalsData.categories)
      } else {
        setRentalCategories(DEFAULT_RENTAL_CATEGORIES)
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
    setFormCategory(
      activeSubTab === "store"
        ? "Guitars"
        : rentalCategories[0] || "Strings",
    )
    setFormBrand("")
    setFormBadge("")
    const defaultImg = activeSubTab === "store"
      ? "/media/programs/guitar-acoustic-recital.jpeg"
      : "/media/programs/violin-solo-rainbow.jpeg"
    setFormImage(defaultImg)
    setFormImages([defaultImg])
    setFormFeaturedImage(defaultImg)
    setFormSetupNote(
      activeSubTab === "store"
        ? "Action adjusted and pre-delivery intonation verified"
        : "",
    )
    setFormSpecs("")
    setFormInStock(true)
    setFormIsActive(true)
    setFormPriceLabel("")
    setFormRentalType(fleetTypes[0]?.id || "student")
    setFormRecommendedFor("Beginner & Intermediate scholars")
    setFormDailyRateLabel("")
    setFormWeeklyRateLabel("")
    setFormMonthlyRateLabel("")
    setImageUploadMode("upload")
    setImageUploadError(null)
    setUploadProgress("")
    setCustomImageUrl("")
    setShowItemModal(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setFormName(item.name || "")
    setFormCategory(item.category || (activeSubTab === "store" ? "Guitars" : "Strings"))
    setFormBrand(item.brand || "")
    setFormBadge(item.badge || "")
    
    // Multi-image and featured cover initialization
    const existingImages: string[] = Array.isArray(item.images) && item.images.length > 0
      ? item.images.filter((img: any) => typeof img === "string" && img.trim() !== "")
      : item.image ? [item.image] : []
    const fallbackCover = activeSubTab === "store"
      ? "/media/programs/guitar-acoustic-recital.jpeg"
      : "/media/programs/violin-solo-rainbow.jpeg"
    const featured = item.image || existingImages[0] || fallbackCover
    const finalImages = existingImages.length > 0 ? [...existingImages] : [featured]
    if (!finalImages.includes(featured)) {
      finalImages.unshift(featured)
    }
    setFormImages(finalImages)
    setFormFeaturedImage(featured)
    setFormImage(featured)

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
    setFormPriceLabel(item.priceLabel || "")
    setFormRentalType(item.type || "student")
    setFormRecommendedFor(item.recommendedFor || item.idealFor || "")
    setFormDailyRateLabel(item.dailyRateLabel || (item.dailyRate ? `₦${Number(item.dailyRate).toLocaleString()}` : ""))
    setFormWeeklyRateLabel(item.weeklyRateLabel || (item.weeklyRate ? `₦${Number(item.weeklyRate).toLocaleString()}` : ""))
    setFormMonthlyRateLabel(item.monthlyRateLabel || (item.monthlyRate ? `₦${Number(item.monthlyRate).toLocaleString()}` : ""))
    setImageUploadMode("upload")
    setImageUploadError(null)
    setUploadProgress("")
    setCustomImageUrl("")
    setShowItemModal(true)
  }

  // ── Multi-Image File Upload Handler ─────────────────────────────────────────
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImageUploadError(null)
    setUploadingImage(true)

    const subfolder = activeSubTab === "store" ? "store" : "rentals"
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Client validation
      if (!file.type.startsWith("image/")) {
        setImageUploadError(`"${file.name}" is not a valid image format.`)
        continue
      }
      if (file.size > 15 * 1024 * 1024) {
        setImageUploadError(`"${file.name}" exceeds 15MB limit. Please choose a smaller photo.`)
        continue
      }

      setUploadProgress(`Optimizing & uploading ${i + 1} of ${files.length}...`)

      try {
        const compressed = await compressImageForUpload(file)
        const res = await uploadCatalogImage(compressed, subfolder)
        if (res?.success && res.image_url) {
          uploadedUrls.push(res.image_url)
        } else {
          setImageUploadError(res?.error || `Upload failed for ${file.name}`)
        }
      } catch (err: any) {
        setImageUploadError(err.message || `Upload error on ${file.name}`)
      }
    }

    if (uploadedUrls.length > 0) {
      setFormImages((prev) => {
        const updated = [...prev, ...uploadedUrls]
        // If current featured cover is empty or invalid, set the first newly uploaded image
        if (!formFeaturedImage || !updated.includes(formFeaturedImage)) {
          setFormFeaturedImage(updated[0])
          setFormImage(updated[0])
        }
        return updated
      })
      setActionNotice(
        `Added ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""} to product gallery.`,
      )
    }

    setUploadingImage(false)
    setUploadProgress("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Set an image as the Featured (Cover) image
  const handleSetFeaturedImage = (url: string) => {
    setFormFeaturedImage(url)
    setFormImage(url)
    setActionNotice("Selected as Featured Cover Photo!")
  }

  // Remove an image from the gallery
  const handleRemoveImage = (urlToRemove: string) => {
    const updated = formImages.filter((u) => u !== urlToRemove)
    setFormImages(updated)
    if (formFeaturedImage === urlToRemove) {
      const nextFeatured = updated[0] || ""
      setFormFeaturedImage(nextFeatured)
      setFormImage(nextFeatured)
    }
    setActionNotice("Photo removed from gallery.")
  }

  // Move image left / right in the gallery order
  const handleMoveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= formImages.length) return
    const updated = [...formImages]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setFormImages(updated)
  }

  // Add image by URL or Preset
  const handleAddCustomImageUrl = (urlToAdd: string) => {
    const trimmed = urlToAdd.trim()
    if (!trimmed) return
    if (!formImages.includes(trimmed)) {
      const updated = [...formImages, trimmed]
      setFormImages(updated)
      if (!formFeaturedImage) {
        setFormFeaturedImage(trimmed)
        setFormImage(trimmed)
      }
      setActionNotice("Photo added to gallery.")
    }
    setCustomImageUrl("")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      alert("Please provide an item name.")
      return
    }

    if (uploadingImage) {
      alert("Please wait for photo upload to finish.")
      return
    }

    const featured = (formFeaturedImage && formFeaturedImage.trim()) || formImages[0] || formImage.trim()
    if (!featured || featured.startsWith("blob:")) {
      alert("Please upload at least one photo or enter an image URL.")
      return
    }

    const cleanGallery = formImages.filter((img) => img && typeof img === "string" && !img.startsWith("blob:"))
    if (cleanGallery.length === 0) {
      cleanGallery.push(featured)
    } else if (!cleanGallery.includes(featured)) {
      cleanGallery.unshift(featured)
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
        image: featured,
        images: cleanGallery,
        setupNote: formSetupNote.trim() || "Pre-delivery clinic inspection passed",
        specs: specsArray,
        priceLabel: formPriceLabel.trim(),
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
        image: featured,
        images: cleanGallery,
        recommendedFor: formRecommendedFor.trim(),
        idealFor: formRecommendedFor.trim(),
        dailyRateLabel: formDailyRateLabel.trim(),
        weeklyRateLabel: formWeeklyRateLabel.trim(),
        monthlyRateLabel: formMonthlyRateLabel.trim(),
        dailyRate: parseInt(formDailyRateLabel.replace(/[^0-9]/g, "")) || 0,
        weeklyRate: parseInt(formWeeklyRateLabel.replace(/[^0-9]/g, "")) || 0,
        monthlyRate: parseInt(formMonthlyRateLabel.replace(/[^0-9]/g, "")) || 0,
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

  // ── Category Handlers ─────────────────────────────────────────────────────
  const openAddCategoryModal = () => {
    setEditingCategory(null)
    setFormCategoryName("")
    setShowCategoryModal(true)
  }

  const openEditCategoryModal = (cat: string) => {
    setEditingCategory(cat)
    setFormCategoryName(cat)
    setShowCategoryModal(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCategoryName.trim()) {
      alert("Please provide a category name.")
      return
    }
    setSavingCategory(true)
    const res = await saveRentalCategory({
      name: formCategoryName.trim(),
      oldName: editingCategory || undefined,
    })
    setSavingCategory(false)
    if (res?.success) {
      setActionNotice(
        editingCategory
          ? `Renamed category to "${formCategoryName}".`
          : `Added new category "${formCategoryName}".`,
      )
      // If currently in item modal, update formCategory to the new category name
      if (showItemModal) {
        setFormCategory(formCategoryName.trim())
      }
      setShowCategoryModal(false)
      loadData()
    } else {
      alert(res?.error || "Failed to save category.")
    }
  }

  const handleDeleteCategory = async (cat: string) => {
    const res = await deleteRentalCategory(cat)
    if (res?.success) {
      setActionNotice(`Category "${cat}" removed.`)
      setDeleteConfirmCat(null)
      loadData()
    } else {
      alert(res?.error || "Failed to delete category.")
    }
  }

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to restore the default showcase products, rental fleet, categories, and fleet types?",
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
      categoryFilter === "all" ||
      (item.category && item.category.toLowerCase() === categoryFilter.toLowerCase())

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

  const activeCategories =
    activeSubTab === "store"
      ? storeCategories
      : ["all", ...rentalCategories]

  return (
    <div className="space-y-6">
      {/* ── Add / Edit Item Dedicated Page ────────────────────────── */}
      {showItemModal ? (
        <div
          className="admin-page-view"
          style={{
            maxWidth: 840,
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
                Enter gear details and upload photos for the public catalog showcase.
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[var(--navy)]">
                        Category *
                      </label>
                      {activeSubTab === "rentals" && (
                        <button
                          type="button"
                          onClick={openAddCategoryModal}
                          className="text-[11px] font-bold text-[var(--gold)] hover:underline cursor-pointer"
                        >
                          + New Category
                        </button>
                      )}
                    </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="Selling Price / Price Label"
                      value={formPriceLabel}
                      onChange={(e) => setFormPriceLabel(e.target.value)}
                      placeholder="e.g. ₦85,000 or Enquire for Quote"
                    />
                    <Field
                      label="Badge Label (Optional)"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="e.g. Bestseller, Faculty Choice, French Import"
                    />
                  </div>
                )}

                {activeSubTab === "rentals" && (
                  <>
                    <Field
                      label="Recommended For / Ideal Usage"
                      value={formRecommendedFor}
                      onChange={(e) => setFormRecommendedFor(e.target.value)}
                      placeholder="e.g. Beginner violin scholars, Sunday service recitals, church sound rigs"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/40 p-3.5 rounded-xl border border-[var(--gold)]/20">
                      <Field
                        label="Daily Rate"
                        value={formDailyRateLabel}
                        onChange={(e) => setFormDailyRateLabel(e.target.value)}
                        placeholder="e.g. ₦4,000"
                      />
                      <Field
                        label="Weekly Rate"
                        value={formWeeklyRateLabel}
                        onChange={(e) => setFormWeeklyRateLabel(e.target.value)}
                        placeholder="e.g. ₦18,000"
                      />
                      <Field
                        label="Monthly Rate"
                        value={formMonthlyRateLabel}
                        onChange={(e) => setFormMonthlyRateLabel(e.target.value)}
                        placeholder="e.g. ₦40,000"
                      />
                    </div>
                  </>
                )}

                {/* ── Product / Gear Multi-Photo Gallery & Featured Image Manager ──── */}
                <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[var(--line)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-[var(--navy)] uppercase tracking-wider flex items-center gap-1.5">
                          <span>Product Photos &amp; Gallery *</span>
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          {formImages.length} {formImages.length === 1 ? "Photo" : "Photos"}
                        </span>
                        {uploadingImage && (
                          <span className="text-[10px] text-[var(--gold)] font-bold animate-pulse">
                            ({uploadProgress || "Uploading..."})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">
                        Add multiple photos from different angles. Click <strong>"Set as Featured"</strong> on any photo to choose the primary cover image.
                      </p>
                    </div>

                    {/* Mode switcher pills */}
                    <div className="inline-flex p-0.5 rounded-lg bg-white border border-[var(--line)] text-[11px] shrink-0 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode("upload")}
                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          imageUploadMode === "upload"
                            ? "bg-[var(--gold)] text-white shadow-xs"
                            : "text-slate-600 hover:text-[var(--navy)]"
                        }`}
                      >
                        📷 Upload Photos
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode("url")}
                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          imageUploadMode === "url"
                            ? "bg-[var(--gold)] text-white shadow-xs"
                            : "text-slate-600 hover:text-[var(--navy)]"
                        }`}
                      >
                        🔗 URL &amp; Presets
                      </button>
                    </div>
                  </div>

                  {/* Hidden native file input (supports MULTIPLE files) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  {imageUploadMode === "upload" ? (
                    <div>
                      {/* Clickable multi-upload dropzone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all bg-white hover:border-[var(--gold)] hover:bg-amber-50/20 ${
                          uploadingImage ? "opacity-60 pointer-events-none" : "border-slate-300"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-full bg-amber-50 text-[var(--gold)] flex items-center justify-center mx-auto mb-2">
                          {uploadingImage ? (
                            <Icon name="refresh" size={20} className="animate-spin" />
                          ) : (
                            <Icon name="upload" size={20} />
                          )}
                        </div>
                        <p className="text-xs font-bold text-[var(--navy)]">
                          {uploadingImage
                            ? uploadProgress || "Uploading photos to server..."
                            : "Click here to select single or multiple photos from your device"}
                        </p>
                        <p className="text-[11px] text-[var(--muted)] mt-1">
                          Supports multiple selection (JPG, PNG, WEBP, GIF up to 15MB each). Web compression applied automatically.
                        </p>
                      </div>

                      {imageUploadError && (
                        <p className="text-xs text-red-600 font-semibold mt-2">
                          ⚠️ {imageUploadError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-3.5 rounded-xl border border-[var(--line)] space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddCustomImageUrl(customImageUrl)
                            }
                          }}
                          className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#FAF8F5] border border-[var(--line)] focus:outline-none focus:border-[var(--gold)]"
                          placeholder="Paste image path or URL (e.g. /media/programs/guitar-acoustic-recital.jpeg or https://...)"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomImageUrl(customImageUrl)}
                          className="btn btn-primary !py-1.5 !px-3 !text-xs cursor-pointer shrink-0"
                        >
                          + Add Photo
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Quick Presets:</span>
                        {[
                          { label: "Acoustic Guitar", url: "/media/programs/guitar-acoustic-recital.jpeg" },
                          { label: "Electric Guitar", url: "/media/programs/guitar-electric-player.jpeg" },
                          { label: "Violin", url: "/media/programs/violin-solo-rainbow.jpeg" },
                          { label: "Keyboard", url: "/media/programs/piano-syllabus.jpeg" },
                          { label: "Saxophone", url: "/media/programs/sax-solo-grey.jpeg" },
                          { label: "Flute", url: "/media/programs/flute-recital-boy.jpeg" },
                          { label: "Trumpet", url: "/media/programs/trumpet-brass.jpeg" },
                          { label: "Drum Kit", url: "/media/programs/drums-tama-red.jpeg" },
                          { label: "Studio PA", url: "/media/studio/multi-instrument-lab.jpeg" },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddCustomImageUrl(preset.url)}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 hover:text-amber-900 transition-colors text-[10px] font-medium cursor-pointer border border-slate-200"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Interactive Multi-Photo Gallery Grid ──────────────────────── */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[var(--navy)] uppercase tracking-wider">
                        Attached Photos ({formImages.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-[var(--gold)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="plus" size={12} />
                        <span>Add More Photos</span>
                      </button>
                    </div>

                    {formImages.length === 0 ? (
                      <div className="text-center p-6 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
                        No photos added yet. Upload or add at least one photo above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formImages.map((imgUrl, idx) => {
                          const isFeatured = imgUrl === formFeaturedImage
                          return (
                            <div
                              key={idx}
                              className={`group relative bg-white rounded-xl overflow-hidden border transition-all flex flex-col justify-between ${
                                isFeatured
                                  ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/30 shadow-md"
                                  : "border-[var(--line)] hover:border-slate-300"
                              }`}
                            >
                              {/* Thumbnail preview */}
                              <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                                <img
                                  src={imgUrl}
                                  alt={`Product photo ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).style.opacity = "0.3"
                                  }}
                                />

                                {/* Featured Badge */}
                                {isFeatured ? (
                                  <span className="absolute top-1.5 left-1.5 z-10 bg-[var(--gold)] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                    ⭐ Featured Cover
                                  </span>
                                ) : (
                                  <span className="absolute top-1.5 left-1.5 z-10 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                                    #{idx + 1}
                                  </span>
                                )}

                                {/* Delete / Remove Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveImage(imgUrl)
                                  }}
                                  className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer text-xs"
                                  title="Remove photo"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Bottom Tile Controls */}
                              <div className="p-2 bg-white flex items-center justify-between gap-1 border-t border-[var(--line)]">
                                {isFeatured ? (
                                  <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                                    ✓ Active Cover
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSetFeaturedImage(imgUrl)}
                                    className="text-[10px] font-bold text-[var(--gold)] hover:text-amber-800 transition-colors cursor-pointer"
                                    title="Make this photo the primary cover image"
                                  >
                                    ★ Set as Featured
                                  </button>
                                )}

                                {/* Order arrange buttons */}
                                <div className="flex items-center gap-0.5 ml-auto">
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveImage(idx, "left")}
                                      className="w-5 h-5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-[10px] cursor-pointer"
                                      title="Move earlier"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {idx < formImages.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveImage(idx, "right")}
                                      className="w-5 h-5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-[10px] cursor-pointer"
                                      title="Move later"
                                    >
                                      →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Featured Cover Spotlight ─────────────────────────────────── */}
                  {formFeaturedImage && (
                    <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/80 flex items-center gap-3.5">
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-900 border border-amber-300 shadow-xs shrink-0">
                        <img
                          src={formFeaturedImage}
                          alt="Featured Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-black text-amber-900">
                            ⭐ Primary Catalog Cover Photo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 m-0 leading-tight">
                          This is the cover photo displayed on public showroom cards, search results, and quote inquiries.
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate font-mono">
                          {formFeaturedImage}
                        </p>
                      </div>
                    </div>
                  )}
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
                  <Button type="submit" disabled={saving || uploadingImage}>
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
              ) : activeSubTab === "rentals" && rentalSection === "categories" ? (
                <Button
                  type="button"
                  onClick={openAddCategoryModal}
                  className="!py-2 !px-4 !text-xs flex items-center gap-1.5"
                >
                  <Icon name="plus" size={14} />
                  <span>Add Category</span>
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
                title="Reset catalog, fleet types, and categories to showroom defaults"
              >
                <Icon name="refresh" size={14} />
              </button>
            </div>
          </div>

          {/* ── Rentals Management Sub-Bar (Equipment vs Fleet Types vs Categories) ──── */}
          {activeSubTab === "rentals" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[var(--line)] shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
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

                <button
                  type="button"
                  onClick={() => setRentalSection("categories")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    rentalSection === "categories"
                      ? "bg-[var(--gold)] text-white shadow-xs"
                      : "bg-[#FAF8F5] border border-[var(--line)] text-slate-700 hover:text-[var(--navy)]"
                  }`}
                >
                  <Icon name="file" size={13} />
                  <span>Fleet Categories ({rentalCategories.length})</span>
                </button>
              </div>

              <div className="text-xs text-[var(--muted)] flex items-center gap-2">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {fleetTypes.filter((ft) => ft.isActive !== false).length} Active Types
                </span>
                <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {rentalCategories.length} Categories
                </span>
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
          ) : activeSubTab === "rentals" && rentalSection === "categories" ? (
            /* ── SECTION B: Manage Rental Categories ────────────────────── */
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[var(--line)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-[var(--navy)]">
                    Rental Fleet Categories
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Classify your rental gear by instrument family or audio department. When you rename a category, all equipment items under it are automatically updated.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={openAddCategoryModal}
                  className="!py-2 !px-4 !text-xs shrink-0 flex items-center gap-1.5"
                >
                  <Icon name="plus" size={14} />
                  <span>Add Category</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rentalCategories.map((cat) => {
                  const gearCount = rentalItems.filter(
                    (r) => r.category && r.category.toLowerCase() === cat.toLowerCase(),
                  ).length

                  return (
                    <div
                      key={cat}
                      className="bg-white rounded-xl border border-[var(--line)] p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] uppercase font-bold text-[var(--gold)]">
                            Rental Classification
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {gearCount} items
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[var(--navy)]">{cat}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {gearCount > 0
                            ? `${gearCount} gear piece${gearCount > 1 ? "s" : ""} currently listed`
                            : "No equipment assigned yet"}
                        </p>
                      </div>

                      <div className="pt-3 mt-4 border-t border-[var(--line)] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openEditCategoryModal(cat)}
                          className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-slate-700 hover:text-[var(--navy)] hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Icon name="pen" size={12} />
                          <span>Rename</span>
                        </button>

                        {deleteConfirmCat === cat ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmCat(null)}
                              className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmCat(cat)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs cursor-pointer"
                            title={`Delete ${cat} category`}
                          >
                            <Icon name="trash" size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* ── SECTION C: Equipment Catalog Grid ──────────────────────── */
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
                    Try adjusting your search query, status, or category filter.
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
                              className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-[var(--line)] shrink-0 relative"
                              style={{ width: "64px", height: "64px", minWidth: "64px", maxWidth: "64px" }}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              {item.images && item.images.length > 1 && (
                                <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[8px] font-black px-1 rounded-tl">
                                  {item.images.length}📷
                                </span>
                              )}
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

                              {activeSubTab === "store" && item.priceLabel && (
                                <p className="text-xs font-black text-[var(--gold)] mt-0.5">
                                  {item.priceLabel}
                                </p>
                              )}

                              {activeSubTab === "rentals" && (item.dailyRateLabel || item.weeklyRateLabel || item.monthlyRateLabel) && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-700 mt-1">
                                  {item.dailyRateLabel && <span className="bg-amber-50 text-amber-900 border border-amber-200/60 px-1.5 py-0.5 rounded">{item.dailyRateLabel}/d</span>}
                                  {item.weeklyRateLabel && <span className="bg-amber-50 text-amber-900 border border-amber-200/60 px-1.5 py-0.5 rounded">{item.weeklyRateLabel}/w</span>}
                                  {item.monthlyRateLabel && <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.5 rounded">{item.monthlyRateLabel}/m</span>}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {item.images && item.images.length > 1 && (
                                  <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">
                                    📷 {item.images.length} photos
                                  </span>
                                )}
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

      {/* ── CATEGORY MODAL (Add / Edit Rental Category) ──────────────── */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          <div className="bg-white rounded-2xl border border-[var(--line)] shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-[var(--line)] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--navy)]">
                  {editingCategory ? "Rename Rental Category" : "Add New Rental Category"}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {editingCategory
                    ? `Renaming "${editingCategory}" will automatically update all equipment in this category.`
                    : "Create a new category classification for rental instruments and gear."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-black text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="p-6 space-y-4">
                <Field
                  label="Category Name *"
                  value={formCategoryName}
                  onChange={(e) => setFormCategoryName(e.target.value)}
                  placeholder="e.g. Percussion, Microphones, DJ & FX, Traditional"
                  required
                />
              </div>

              <div className="p-4 border-t border-[var(--line)] bg-[#FAF8F5] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingCategory}>
                  {savingCategory
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Add Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
