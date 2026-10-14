// ─── Shared utilities ─────────────────────────────────────────────────────────

/** Generate a unique Vivadoxa application reference number */
export function generateReference(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(10000 + Math.random() * 90000);
  return `VIV-${year}-${num}`;
}

/** Format a number as Nigerian Naira */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/** Return program fee amount from formatted fee string */
export function parseFee(fee: string): number {
  return parseInt(fee.replace(/[₦,]/g, ""), 10);
}

/** Validate an email address */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate a Nigerian phone number */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "").replace(/^0/, "+234");
  return /^(\+234|0)[789][01]\d{8}$/.test(cleaned);
}

/** Format a date string into "14 Oct 2026, 10:07 AM" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** WhatsApp deep-link with pre-filled admissions message */
export const WHATSAPP_URL =
  "https://wa.me/2348031308881?text=Hello%20Vivadoxa%2C%20I%20have%20an%20enquiry%20about%20admissions.";

// ─── School constants ─────────────────────────────────────────────────────────
export const BANK_NAME = "Guaranty Trust Bank (GTBank)";
export const BANK_ACCOUNT_NO = "0123456789";
export const BANK_ACCOUNT_NAME = "Vivadoxa Music School";
export const SCHOOL_PHONE = "+234 803 130 8881";
export const SCHOOL_EMAIL = "hello@vivadoxa.ng";
export const SCHOOL_ADDRESS = "U/Sunday, Television, Kaduna, Nigeria";
