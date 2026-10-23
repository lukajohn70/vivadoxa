import React from "react"
import { Icon } from "@/components/ui"
import type { Page } from "@/types"

interface LegalNavProps {
  currentPage: "privacy" | "terms" | "tuition-policy" | "safeguarding"
  go: (p: Page | string) => void
  lastUpdated?: string
}

const LEGAL_DOCS = [
  {
    id: "terms" as const,
    path: "/terms",
    title: "Terms of Service",
    shortTitle: "Terms of Service",
    description: "Enrollment contract, studio etiquette, attendance & conduct",
    badge: "Contract",
  },
  {
    id: "privacy" as const,
    path: "/privacy",
    title: "Privacy Policy",
    shortTitle: "Privacy & NDPA",
    description: "Nigeria Data Protection Act (NDPA 2023) compliance & minor data",
    badge: "NDPA 2023",
  },
  {
    id: "tuition-policy" as const,
    path: "/tuition-policy",
    title: "Tuition, Refund & Instrument Policy",
    shortTitle: "Tuition & Refunds",
    description: "Fees, installments, bring/rent instrument terms & refunds",
    badge: "Finance",
  },
  {
    id: "safeguarding" as const,
    path: "/safeguarding",
    title: "Child Safeguarding & Protection",
    shortTitle: "Child Safeguarding",
    description: "Child Rights Act adherence, tutor vetting & studio safety",
    badge: "Child Rights",
  },
]

export function LegalNav({ currentPage, go, lastUpdated = "October 2026" }: LegalNavProps) {
  return (
    <div className="legal-header-nav mb-8 border-b border-[var(--line)] pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3.5 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-gold !py-1 !px-3 font-mono text-[10px] tracking-wider uppercase">
            Official Regulatory Compliance
          </span>
          <span className="text-xs text-[var(--muted)]">
            Last Updated: <strong className="text-[var(--ink)] font-semibold">{lastUpdated}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) window.history.back()
              else go("home")
            }}
            className="btn btn-secondary !min-h-[34px] !py-1 !px-3 !text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
            title="Return to previous page"
            aria-label="Go back to previous page"
          >
            <Icon name="arrow" size={13} className="rotate-180" />
            <span>Back</span>
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary !min-h-[34px] !py-1 !px-3 !text-xs inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            title="Print or save this document as PDF"
          >
            <Icon name="file" size={13} />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={() => go("contact")}
            className="btn btn-secondary !min-h-[34px] !py-1 !px-3 !text-xs inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
          >
            <Icon name="mail" size={13} />
            <span>Contact Registrar</span>
          </button>
        </div>
      </div>

      {/* Document Switcher Tabs */}
      <nav aria-label="Legal Documents" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {LEGAL_DOCS.map((doc) => {
          const isActive = currentPage === doc.id
          return (
            <button
              key={doc.id}
              onClick={() => go(doc.id)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                isActive
                  ? "bg-white border-[var(--gold)] shadow-sm ring-1 ring-[var(--gold)]/20"
                  : "bg-[#fbfaf7] border-[var(--line)] hover:bg-white hover:border-[#cfcac2]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                      : "bg-zinc-200/70 text-zinc-600"
                  }`}
                >
                  {doc.badge}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" aria-hidden="true" />
                )}
              </div>
              <strong className={`block text-xs font-semibold ${isActive ? "text-[var(--ink)]" : "text-[#4b4743]"}`}>
                {doc.shortTitle}
              </strong>
              <small className="block text-[11px] text-[var(--muted)] leading-tight mt-0.5 line-clamp-1">
                {doc.description}
              </small>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default LegalNav
