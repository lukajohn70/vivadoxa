// ─── Shared primitive UI components ──────────────────────────────────────────

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import brandLogo from "@/assets/vivadoxa-logo.png"
import { ScrollReveal } from "@/components/ScrollReveal"
import type { Page } from "@/types"

// ── Icon ──────────────────────────────────────────────────────────────────────
export function WhatsAppIcon({
  size = 20,
  className = "",
  fill = "currentColor",
}: {
  size?: number
  className?: string
  fill?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      className={`icon-whatsapp shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.403 5.638A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.2 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.345m-6.35 13.91h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.278 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.466 7.462m4.095-5.593c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.113-.149.224-.579.73-.71 1-.13.112-.262.13-.487.019-.225-.113-.949-.35-1.808-1.115-.668-.596-1.119-1.332-1.25-1.557-.13-.225-.014-.347.099-.459.101-.1.225-.262.337-.393.113-.131.15-.225.225-.375.075-.15.038-.281-.019-.394-.056-.112-.505-1.217-.692-1.666-.182-.438-.367-.378-.504-.385-.13-.007-.28-.008-.43-.008-.15 0-.393.056-.599.281-.206.225-.786.768-.786 1.872 0 1.104.805 2.171.917 2.321.113.15 1.584 2.418 3.838 3.391.536.232.954.37 1.28.473.538.171 1.028.147 1.415.089.432-.065 1.327-.543 1.514-1.067.187-.525.187-.974.131-1.068-.056-.093-.206-.15-.431-.262"
      />
    </svg>
  )
}

export function GoogleIcon({
  size = 20,
  className = "",
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function TikTokIcon({
  size = 20,
  className = "",
  fill = "currentColor",
}: {
  size?: number
  className?: string
  fill?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.25 1.25 2.27 2.5 2.51.59.13 1.2.11 1.78-.05 1.05-.27 1.92-1.08 2.27-2.11.13-.39.2-.8.2-1.21V.02z" />
    </svg>
  )
}

export function FacebookIcon({
  size = 20,
  className = "",
  fill = "currentColor",
}: {
  size?: number
  className?: string
  fill?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function YouTubeIcon({
  size = 20,
  className = "",
  fill = "currentColor",
}: {
  size?: number
  className?: string
  fill?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function InstagramIcon({
  size = 20,
  className = "",
  fill = "currentColor",
}: {
  size?: number
  className?: string
  fill?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

export function GmailIcon({
  size = 20,
  className = "",
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      />
    </svg>
  )
}

export const Icon = ({
  name,
  size = 20,
  className = "",
}: {
  name: string
  size?: number
  className?: string
}) => {
  if (name === "whatsapp") {
    return <WhatsAppIcon size={size} className={className} />
  }
  if (name === "google") {
    return <GoogleIcon size={size} className={className} />
  }
  if (name === "tiktok") {
    return <TikTokIcon size={size} className={className} />
  }
  if (name === "facebook") {
    return <FacebookIcon size={size} className={className} />
  }
  if (name === "youtube") {
    return <YouTubeIcon size={size} className={className} />
  }
  if (name === "instagram") {
    return <InstagramIcon size={size} className={className} />
  }
  if (name === "gmail") {
    return <GmailIcon size={size} className={className} />
  }

  const paths: Record<string, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    arrowUp: (
      <>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </>
    ),
    arrowDown: (
      <>
        <path d="M12 5v14M19 12l-7 7-7-7" />
      </>
    ),
    arrowLeft: (
      <>
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m0 0L7 9m5-5 5 5" />
        <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </>
    ),
    lock: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeoff: (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ),
    warning: (
      <>
        <path d="m10.29 3.86-8.26 14.22A1 1 0 0 0 2.89 20h16.22a1 1 0 0 0 .86-1.5L11.71 3.86a1 1 0 0 0-1.72-.86z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.912 5.885a2 2 0 0 0 1.272 1.272L21 12l-5.816 1.843a2 2 0 0 0-1.272 1.272L12 21l-1.912-5.885a2 2 0 0 0-1.272-1.272L3 12l5.816-1.843a2 2 0 0 0 1.272-1.272L12 3z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    video: (
      <>
        <rect width="14" height="12" x="2" y="6" rx="2" />
        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      </>
    ),
    calendar: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
    tool: (
      <>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </>
    ),
    wrench: (
      <>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </>
    ),
    star: (
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="currentColor"
      />
    ),
    external: (
      <>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
      </>
    ),
    academic: (
      <>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    user: (
      <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    creditCard: (
      <>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </>
    ),
    dollar: (
      <>
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
    message: (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </>
    ),
    edit: (
      <>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </>
    ),
    plane: (
      <>
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </>
    ),
    refresh: (
      <>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 21h5v-5" />
      </>
    ),
    clipboard: (
      <>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    store: (
      <>
        <path d="M3 9l2-5h14l2 5" />
        <path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
        <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
        <path d="M9 21V12h6v9" />
      </>
    ),
    shoppingBag: (
      <>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" x2="21" y1="6" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
    rental: (
      <>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),
    rentals: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    repeat: (
      <>
        <path d="m17 2 4 4-4 4" />
        <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
        <path d="m7 22-4-4 4-4" />
        <path d="M21 13v1a4 4 0 0 1-4 4H3" />
      </>
    ),
    mic: (
      <>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </>
    ),
    academy: (
      <>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
      </>
    ),
    tag: (
      <>
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <path d="M7 7h.01" />
      </>
    ),
  }
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? "logo-light" : ""}`}>
      <div className="logo-badge">
        <img
          src={brandLogo}
          alt="VivaDoxa Music School — Actualize your passion"
        />
      </div>
    </div>
  )
}

// ── VivadoxaSquircle — compact V-mark icon for avatars, PWA icons, badges ────
// size: px dimension (renders as a square). Matches brand palette exactly.
export function VivadoxaSquircle({
  size = 48,
  className = "",
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-label="Vivadoxa Music"
      role="img"
    >
      {/* Squircle background */}
      <rect width="506" height="506" x="3" y="3" rx="112" fill="#0b0b0b" />
      <rect
        width="506"
        height="506"
        x="3"
        y="3"
        rx="112"
        fill="none"
        stroke="#c96b32"
        strokeWidth="6"
        strokeOpacity="0.5"
      />
      {/* Left leg of V */}
      <polygon points="78,118 168,118 256,348 204,348" fill="#c96b32" />
      {/* Right leg of V */}
      <polygon points="344,118 434,118 308,348 256,348" fill="#c96b32" />
      {/* Record/disc highlight clipped to the left V leg */}
      <clipPath id="vmark-clip">
        <polygon points="78,118 168,118 256,348 204,348" />
      </clipPath>
      <g clipPath="url(#vmark-clip)">
        <circle
          cx="195"
          cy="152"
          r="52"
          fill="none"
          stroke="#e8e4df"
          strokeWidth="10"
          opacity="0.28"
        />
        <circle
          cx="195"
          cy="152"
          r="30"
          fill="none"
          stroke="#e8e4df"
          strokeWidth="7"
          opacity="0.18"
        />
        <circle cx="195" cy="152" r="10" fill="#e8e4df" opacity="0.35" />
        {/* Play arrow */}
        <polygon points="190,145 205,152 190,159" fill="#c96b32" opacity="0.9" />
      </g>
    </svg>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  type = "button",
  fullWidth = false,
  style,
  className = "",
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  onClick?: (e?: any) => void
  disabled?: boolean
  type?: "button" | "submit"
  fullWidth?: boolean
  style?: React.CSSProperties
  className?: string
  "aria-label"?: string
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={style}
      aria-label={ariaLabel}
      className={`btn btn-${variant}${fullWidth ? " btn-full" : ""}${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </button>
  )
}

// ── Form field primitives ─────────────────────────────────────────────────────
export const Field = ({
  label,
  placeholder,
  type = "text",
  value,
  defaultValue,
  onChange,
  required = false,
  readOnly = false,
  error,
  id,
  autoComplete,
}: {
  label: string
  placeholder?: string
  type?: string
  value?: string
  defaultValue?: string
  onChange?: (v: string) => void
  required?: boolean
  readOnly?: boolean
  error?: string
  id?: string
  autoComplete?: string
}) => (
  <label className={`field${error ? " field-error" : ""}`} htmlFor={id}>
    <span>
      {label}
      {required && (
        <span className="required-star" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </span>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      readOnly={readOnly}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      required={required}
      autoComplete={autoComplete}
      aria-describedby={error ? `${id}-err` : undefined}
      aria-invalid={!!error}
    />
    {error && (
      <span id={`${id}-err`} className="field-hint error" role="alert">
        {error}
      </span>
    )}
  </label>
)

export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  id,
  error,
}: {
  label: string
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  required?: boolean
  id?: string
  error?: string
}) => (
  <label className={`field full${error ? " field-error" : ""}`} htmlFor={id}>
    <span>
      {label}
      {required && (
        <span className="required-star" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </span>
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      required={required}
      aria-describedby={error ? `${id}-err` : undefined}
      aria-invalid={!!error}
    />
    {error && (
      <span id={`${id}-err`} className="field-hint error" role="alert">
        {error}
      </span>
    )}
  </label>
)

export const SelectField = ({
  label,
  value,
  onChange,
  required = false,
  id,
  placeholder = "Select an option",
  error,
  children,
}: {
  label: string
  value?: string
  onChange?: (v: string) => void
  required?: boolean
  id?: string
  placeholder?: string
  error?: string
  children: React.ReactNode
}) => (
  <label className={`field${error ? " field-error" : ""}`} htmlFor={id}>
    <span>
      {label}
      {required && (
        <span className="required-star" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </span>
    <select
      id={id}
      value={value ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      required={required}
      aria-describedby={error ? `${id}-err` : undefined}
      aria-invalid={!!error}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {children}
    </select>
    {error && (
      <span id={`${id}-err`} className="field-hint error" role="alert">
        {error}
      </span>
    )}
  </label>
)

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({
  children,
  tone = "navy",
}: {
  children: React.ReactNode
  tone?: "navy" | "gold" | "green" | "red"
}) => <span className={`badge badge-${tone}`}>{children}</span>

// ── Section heading ───────────────────────────────────────────────────────────
export const SectionHead = ({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow: string
  title: string
  body?: string
  center?: boolean
}) => (
  <div className={`section-head ${center ? "center" : ""}`}>
    <span className="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    {body && <p>{body}</p>}
  </div>
)

// ── Page hero banner with realistic back navigation ──────────────────────────
export function PageHero({
  eyebrow,
  badge,
  title,
  body,
  lead,
  image,
  backTo,
  backLabel = "Back",
  showBack = true,
}: {
  eyebrow?: string
  badge?: string
  title: string
  body?: string
  lead?: string
  image?: string
  backTo?: string
  backLabel?: string
  showBack?: boolean
}) {
  const navigate = useNavigate()
  const label = eyebrow || badge
  const description = body || lead || ""

  function handleBack() {
    if (backTo) {
      navigate(backTo)
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/")
    }
  }

  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <div>
          {showBack && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[var(--gold2)] hover:text-white transition-all cursor-pointer border border-white/10 backdrop-blur-sm"
                aria-label="Go back to previous page"
                title="Go back"
              >
                <Icon name="arrow" size={13} className="rotate-180" />
                <span>{backLabel}</span>
              </button>
            </div>
          )}
          {label && <span className="eyebrow">{label}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {image && <img src={image} alt="Vivadoxa music school" />}
      </div>
    </section>
  )
}

// ── Success / confirmation state ──────────────────────────────────────────────
export function Success({
  title,
  body,
  onReset,
  extra,
  action = "Send another request",
}: {
  title: string
  body: string
  onReset: () => void
  extra?: string
  action?: string
}) {
  return (
    <div className="success-state" role="status">
      <div className="success-icon">
        <Icon name="check" size={30} />
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      {extra && <strong className="ref-display">{extra}</strong>}
      <Button onClick={onReset}>{action}</Button>
    </div>
  )
}

// ── CTA strip ─────────────────────────────────────────────────────────────────
export function Cta({ go }: { go: (p: Page) => void }) {
  return (
    <section className="cta overflow-hidden">
      <div className="container">
        <ScrollReveal direction="left">
          <div>
            <span className="eyebrow">Your next chapter</span>
            <h2>
              There is music in you.
              <br />
              Let&apos;s bring it out.
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="right" delay={100}>
          <Button onClick={() => go("apply")}>
            Apply for admission <Icon name="arrow" />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  )
}

// ── Upload dropzone ───────────────────────────────────────────────────────────
export function UploadZone({
  label,
  hint,
  accept,
  onChange,
  fileName,
}: {
  label: string
  hint: string
  accept?: string
  onChange?: (files: FileList | null) => void
  fileName?: string
}) {
  return (
    <label className={`upload full${fileName ? " upload-has-file" : ""}`}>
      <Icon name="upload" />
      <strong>{fileName ? fileName : label}</strong>
      <span>{fileName ? "Click to replace" : hint}</span>
      <input
        type="file"
        accept={accept}
        onChange={onChange ? (e) => onChange(e.target.files) : undefined}
      />
    </label>
  )
}

// ── Copy-to-clipboard button ───────────────────────────────────────────────────
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }}
      aria-label={copied ? "Copied!" : `Copy ${text}`}
    >
      <Icon name="copy" />
      {copied ? "Copied" : "Copy"}
    </button>
  )
}
