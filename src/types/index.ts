// ─── Application-wide type definitions ───────────────────────────────────────

export type Page =
  | "home"
  | "about"
  | "programs"
  | "modes"
  | "repairs"
  | "apply"
  | "payment"
  | "status"
  | "contact"
  | "admin"
  | "admin-login";

// Application form data
export interface ApplicationData {
  // Step 1 – Personal
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  state: string;
  address: string;
  // Step 2 – Guardian
  guardianName: string;
  relationship: string;
  guardianPhone: string;
  guardianEmail: string;
  // Step 3 – Program
  category: string;
  program: string;
  level: string;
  schedule: string;
  studyMode: "Onsite" | "Online" | "Home Lessons";
  // Meta
  referenceNo: string;
  amount: number;
}

// Payment proof submission
export interface PaymentProof {
  payerName: string;
  paymentDate: string;
  amountPaid: string;
  transactionRef: string;
  receiptFile: File | null;
}

// Repair request
export interface RepairRequest {
  fullName: string;
  phone: string;
  email: string;
  instrumentType: string;
  issueDescription: string;
  photos: FileList | null;
}

// Contact message
export interface ContactMessage {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Admin credentials (client-side only; real auth needs a backend)
export interface AdminSession {
  email: string;
  role: "super_admin" | "staff";
}

// Program definition
export interface Program {
  name: string;
  tag: string;
  image: string;
  fee: string;
  feeAmount: number;
  desc: string;
  category: "Instruments" | "Vocals" | "Composition" | "Music Production";
}
