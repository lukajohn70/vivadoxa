import { useEffect, useRef, useState } from "react"
import { ScrollReveal } from "@/components/ScrollReveal"

interface StatItem {
  id: string
  targetValue: number
  suffix?: string
  prefix?: string
  label: string
  sublabel: string
}

const STATS_DATA: StatItem[] = [
  {
    id: "musicians",
    targetValue: 500,
    suffix: "+",
    label: "Musicians Trained",
    sublabel: "Studio & private home coaching in Kaduna",
  },
  {
    id: "disciplines",
    targetValue: 13,
    suffix: "",
    label: "Core Disciplines",
    sublabel: "Woodwinds, keys, strings, brass & voice",
  },
  {
    id: "success",
    targetValue: 100,
    suffix: "%",
    label: "Exam Pass Rate",
    sublabel: "MUSON & ABRSM graded exam candidates",
  },
  {
    id: "recitals",
    targetValue: 5,
    suffix: "+",
    label: "Annual Recital Stages",
    sublabel: "Live concerts & ensemble showcases",
  },
]

function SingleStatCounter({
  item,
  triggerAnimation,
}: {
  item: StatItem
  triggerAnimation: boolean
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const animatedRef = useRef(false)

  useEffect(() => {
    if (!triggerAnimation || animatedRef.current) return
    animatedRef.current = true

    // Check for prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayValue(item.targetValue)
      return
    }

    const duration = 1400 // ms
    const startTime = performance.now()

    let frameId: number

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic curve: fast start, soft deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(item.targetValue * easeOut)

      setDisplayValue(current)

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setDisplayValue(item.targetValue)
      }
    }

    frameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [triggerAnimation, item.targetValue])

  return (
    <div className="stat-counter-cell group">
      <div className="flex items-baseline gap-1">
        {item.prefix && (
          <span className="text-xl sm:text-2xl font-serif text-[var(--gold2)] select-none">
            {item.prefix}
          </span>
        )}
        <span
          className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-[var(--gold2)] tracking-tight leading-none group-hover:text-white transition-colors duration-300"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          {displayValue}
        </span>
        {item.suffix && (
          <span className="text-2xl sm:text-3xl font-serif text-[var(--gold)] font-bold select-none">
            {item.suffix}
          </span>
        )}
      </div>
      <h3 className="text-xs sm:text-[13px] font-bold text-white tracking-wide uppercase mt-2.5 mb-1 group-hover:text-[var(--gold2)] transition-colors duration-300">
        {item.label}
      </h3>
      <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed m-0 line-clamp-2">
        {item.sublabel}
      </p>
    </div>
  )
}

export function StatCounters() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setHasEnteredViewport(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section
      ref={containerRef}
      aria-label="Vivadoxa Academy Key Milestones"
      className="stat-counters-section overflow-hidden"
      style={{
        background: "#12100e",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="container py-8 sm:py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {STATS_DATA.map((item, idx) => (
            <ScrollReveal
              key={item.id}
              direction={idx < 2 ? "left" : "right"}
              delay={(idx % 2) * 100}
            >
              <SingleStatCounter
                item={item}
                triggerAnimation={hasEnteredViewport}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatCounters
