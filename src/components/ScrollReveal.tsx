import { useEffect, useRef, useState, type ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  direction?: "left" | "right" | "up" | "none"
  delay?: number // milliseconds
  className?: string
  threshold?: number
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  threshold = 0.15,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Immediately show if user prefers reduced motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px", // triggers slightly before center
      },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  const directionClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
        ? "reveal-right"
        : direction === "up"
          ? "reveal-up"
          : ""

  return (
    <div
      ref={ref}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={`reveal-base ${directionClass} ${
        isRevealed ? "is-revealed" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default ScrollReveal
