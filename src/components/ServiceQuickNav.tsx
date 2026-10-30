import React from "react"
import { Icon } from "@/components/ui"
import type { Page } from "@/types"

export interface ServiceQuickNavItem {
  id: "academy" | "studio" | "repairs" | "rentals" | "store"
  name: string
  subtitle: string
  page: Page
  iconName: string
  color: string
  bgColor: string
  badge?: string
}

export const CORE_SERVICES: ServiceQuickNavItem[] = [
  {
    id: "academy",
    name: "Academy",
    subtitle: "Curriculum, 17 Disciplines & Tuition",
    page: "programs",
    iconName: "academic",
    color: "var(--gold)",
    bgColor: "rgba(201, 107, 50, 0.12)",
    badge: "17 Courses",
  },
  {
    id: "studio",
    name: "Studio",
    subtitle: "Recording Booths & Rehearsal Hall",
    page: "studio",
    iconName: "mic",
    color: "#2563EB",
    bgColor: "rgba(37, 99, 235, 0.12)",
    badge: "Pro Audio",
  },
  {
    id: "repairs",
    name: "Repairs & Service",
    subtitle: "Precision Clinic, Setup & Overhaul",
    page: "repairs",
    iconName: "wrench",
    color: "#D97706",
    bgColor: "rgba(217, 119, 6, 0.12)",
    badge: "In-House Clinic",
  },
  {
    id: "rentals",
    name: "Rentals",
    subtitle: "Home Practice & Event Sound Hire",
    page: "rentals",
    iconName: "repeat",
    color: "#059669",
    bgColor: "rgba(5, 150, 105, 0.12)",
    badge: "From ₦8,000/mo",
  },
  {
    id: "store",
    name: "Store",
    subtitle: "Instruments, Strings, Reeds & Gear",
    page: "store",
    iconName: "store",
    color: "#7C3AED",
    bgColor: "rgba(124, 58, 237, 0.12)",
    badge: "Vetted Gear",
  },
]

interface ServiceQuickNavProps {
  go: (p: Page | string) => void
  activePage?: string
  variant?: "homepage" | "dashboard"
  className?: string
}

export function ServiceQuickNav({
  go,
  activePage,
  variant = "homepage",
  className = "",
}: ServiceQuickNavProps) {
  return (
    <nav
      className={`service-quicknav-container ${
        variant === "dashboard" ? "service-quicknav-dashboard" : "service-quicknav-home"
      } ${className}`}
      aria-label="Core Services & Rentals Navigation Bar"
    >
      <div className="container">
        {/* Subtle Section Label */}
        <div className="flex items-center justify-between gap-3 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--gold)]">
              Core Pillars &amp; Direct Services
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)] hidden sm:inline-block">
            Quick 1-Tap Access
          </span>
        </div>

        {/* 5 Tap Service Bar */}
        <div className="service-quicknav-grid" role="menubar">
          {CORE_SERVICES.map((item) => {
            const isActive =
              activePage === item.page ||
              (item.id === "academy" && (activePage === "programs" || activePage === "modes"))

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => go(item.page)}
                className={`service-quicknav-card group ${
                  isActive ? "is-active" : ""
                }`}
                title={`Open Vivadoxa ${item.name} (${item.subtitle})`}
              >
                <div
                  className="service-quicknav-icon"
                  style={{
                    color: item.color,
                    backgroundColor: item.bgColor,
                  }}
                >
                  <Icon name={item.iconName} size={18} />
                </div>

                <div className="service-quicknav-text">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="service-quicknav-title">
                      {item.name}
                    </strong>
                    {item.badge && (
                      <span className="service-quicknav-badge">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="service-quicknav-sub">
                    {item.subtitle}
                  </span>
                </div>

                <span
                  className="service-quicknav-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
