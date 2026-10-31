// ─── Application-wide type definitions ───────────────────────────────────────

export type Page = "home" | "about" | "programs" | "modes" | "repairs" | "studio" | "performances" | "reviews" | "gallery" | "apply" | "payment" | "status" | "portal" | "portal-login" | "contact" | "admin" | "admin-login" | "privacy" | "terms" | "tuition-policy" | "safeguarding" | "cookies" | "cookie-policy" | "rentals" | "store"

// Photo Gallery Item
export interface GalleryItem {
  id: string
  title: string
  category: string
  caption?: string
  image: string
  featured?: boolean
  date?: string
  sort_order?: number
}

// Application form data
export interface ApplicationData {
  // Step 1 – Personal (Section A)
  fullName: string
  firstName?: string
  surname?: string
  dateOfBirth: string
  stateOfOrigin?: string
  maritalStatus?: string
  nationality?: string
  gender: string
  occupation?: string
  residentialAddress?: string
  address: string
  state: string
  phone: string
  email: string

  // Step 2 – Sponsor / Guardian
  sponsor?: string
  guardianName: string
  relationship: string
  guardianPhone: string
  guardianEmail: string

  // Step 3 – Program & Class Options (Sections B, C, D)
  classType?: "Regular classes" | "Private classes" | "Group classes" | "Scholarship" | string
  category: string
  program: string
  planTier?: string
  duration?: string
  sessionTime?: string
  level: string
  schedule: string
  studyMode: "Onsite" | "Online" | "Home Lessons"
  currency?: "NGN" | "USD"

  // Meta
  referenceNo: string
  amount: number
  passportPhoto?: string
  signature?: string
}

// Payment proof submission
export interface PaymentProof {
  payerName: string
  paymentDate: string
  amountPaid: string
  currency?: "NGN" | "USD"
  transactionRef: string
  receiptFile: File | null
}

// Repair request
export interface RepairRequest {
  fullName: string
  phone: string
  email: string
  instrumentType: string
  issueDescription: string
  photos: FileList | null
}

// Contact message
export interface ContactMessage {
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
}

// Admin credentials (client-side only; real auth needs a backend)
export interface AdminSession {
  email: string
  role: "super_admin" | "staff"
}

// Program definition
export interface Program {
  name: string
  tag: string
  image: string
  fee?: string
  feeAmount?: number
  desc: string
  category: "Instruments" | "Vocals" | "Composition" | "Music Production"
  ageGroup?: "Kids (4–12)" | "Teens (13–19)" | "Adults & Professionals" | "All Ages"
  level?: "Beginner" | "Intermediate" | "Advanced"
}
