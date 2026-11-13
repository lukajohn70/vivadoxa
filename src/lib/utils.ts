// ─── Shared utilities ─────────────────────────────────────────────────────────

/** Generate a unique Vivadoxa application reference number */
export function generateReference(): string {
  const year = new Date().getFullYear()
  const num = Math.floor(10000 + Math.random() * 90000)
  return `VIV-${year}-${num}`
}

/** Format a number as Nigerian Naira */
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`
}

/** Return program fee amount from formatted fee string */
export function parseFee(fee: string): number {
  return parseInt(fee.replace(/[₦,]/g, ""), 10)
}

/** Validate an email address */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Validate a Nigerian phone number */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "").replace(/^0/, "+234")
  return /^(\+234|0)[789][01]\d{8}$/.test(cleaned)
}

/** Format a date string into "14 Oct 2026, 10:07 AM" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Automatically compress and downscale high-resolution images on the client
 * before uploading to the server. Shrinks 10MB+ smartphone photos to ~300-500KB
 * in milliseconds for instant, lightweight uploads.
 */
export async function compressImageForUpload(
  file: File,
  maxDimension = 1920,
  quality = 0.88,
): Promise<File> {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return file
  }

  // If already under 600KB, skip compression
  if (file.size < 600 * 1024) {
    return file
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file)
            } else {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".jpeg"),
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                },
              )
              resolve(compressedFile)
            }
          },
          "image/jpeg",
          quality,
        )
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

/** WhatsApp deep-link with pre-filled admissions message */
export const WHATSAPP_URL =
  "https://wa.me/2349075330330?text=Hello%20Vivadoxa%2C%20I%20have%20an%20enquiry%20about%20admissions."

// ─── School constants ─────────────────────────────────────────────────────────
export const BANK_NAME = "Guaranty Trust Bank (GTBank)"
export const BANK_ACCOUNT_NO = "0236649229"
export const BANK_ACCOUNT_NAME = "Frederick Chrysantius"
export const SCHOOL_PHONE = "09075330330"
export const SCHOOL_PHONE_2 = "09010267234"
export const SCHOOL_WHATSAPP = "09075330330"
export const SCHOOL_EMAIL = "vivadoxa@gmail.com"
export const SCHOOL_EMAIL_SECONDARY = "hello@vivadoxamusic.com"
export const SCHOOL_ADDRESS =
  "No. 49B Umaru Ibrahim Street, off Super Market Street beside Angwan Sunday Market, Angwan Sunday, Kaduna, Nigeria"
export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=vivadoxa+music+kaduna"
export const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37924.33986039267!2d7.4159621583716335!3d10.484287637413248!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104d35db9f99eb49%3A0x471df620fbec8cb4!2sVIVADOXA%20MUSIC%20SCHOOL!5e1!3m2!1sen!2sng!4v1792240428882!5m2!1sen!2sng"
export const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/place/VIVADOXA+MUSIC+SCHOOL/@10.4842876,7.4159622,14z/data=!4m6!3m5!1s0x104d35db9f99eb49:0x471df620fbec8cb4!8m2!3d10.4842876!4d7.4159622!16s%2Fg%2F11b8v2_y8z"
export const YOUTUBE_URL = "https://www.youtube.com/@vivadoxa"
export const TIKTOK_URL = "https://www.tiktok.com/@vivadoxa"
export const FACEBOOK_URL = "https://www.facebook.com/vivadoxa"
export const INSTAGRAM_URL = "https://www.instagram.com/vivadoxamusic"
