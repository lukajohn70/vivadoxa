import { GoogleIcon, Icon } from "@/components/ui"
import { GOOGLE_REVIEWS_URL } from "@/lib/utils"
import { ALL_REVIEWS } from "@/components/ReviewsHub"
import type { Page } from "@/types"

export function HomeReviewsSpotlight({ go }: { go: (p: Page) => void }) {
  // Curate 3 diverse, authentic verified reviews from local students/parents
  const topReviews = ALL_REVIEWS.slice(0, 3)

  return (
    <section className="section" style={{ background: "var(--cream)", borderTop: "1px solid var(--line)" }}>
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GoogleIcon size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Verified Google Reviews · 4.9 ★ Rating
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[var(--navy)] m-0">
              Trusted by 130+ musicians across Kaduna.
            </h2>
            <p className="text-sm md:text-base text-[var(--muted)] mt-2 max-w-2xl">
              From children taking their first piano steps to church instrumentalists and adult learners. Read direct experiences from our Kaduna community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => go("reviews")}
              className="btn btn-primary inline-flex items-center gap-2 text-xs"
            >
              Read all reviews <Icon name="arrow" size={13} />
            </button>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary inline-flex items-center gap-1.5 text-xs"
              title="Review Vivadoxa on Google Maps"
            >
              <GoogleIcon size={14} /> Review us
            </a>
          </div>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topReviews.map((r) => (
            <article
              key={r.id}
              className="p-6 rounded-2xl bg-white border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    {"★".repeat(r.rating)}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified Google Review
                  </span>
                </div>
                <blockquote className="text-sm text-[var(--ink)] leading-relaxed italic m-0 mb-4">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                  style={{ background: r.avatarColor }}
                >
                  {r.author[0]}
                </div>
                <div>
                  <strong className="block text-sm text-[var(--navy)] leading-tight">
                    {r.author}
                  </strong>
                  <span className="text-xs text-[var(--muted)] block">
                    {r.role} · {r.location}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 p-4 rounded-xl bg-white border border-[var(--line)] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-base">
              <span>4.9</span>
              <span className="text-amber-400 text-sm">★★★★★</span>
            </div>
            <span className="text-slate-600">
              Aggregated from <strong>130+ verified Google Maps reviews</strong> for Vivadoxa Music School Kaduna
            </span>
          </div>
          <button
            onClick={() => go("reviews")}
            className="text-[var(--gold)] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Explore all 10 categories &amp; student stories in our Reviews Hub →
          </button>
        </div>
      </div>
    </section>
  )
}
