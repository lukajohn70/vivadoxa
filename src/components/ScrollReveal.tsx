import React, { useEffect, useRef, useState, type ReactNode } from "react"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

interface ScrollRevealProps {
  children: ReactNode
  direction?: "left" | "right" | "up" | "none"
  delay?: number // milliseconds
  className?: string
  style?: React.CSSProperties
  threshold?: number
  rootMargin?: string
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  style,
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const { isSlow } = useNetworkStatus()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Immediately show if user prefers reduced motion OR is on a slow connection
    // This gives an instantaneous, snappy, frustration-free experience on 2G/3G
    if (
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
      isSlow
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
        rootMargin,
      },
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, isSlow])

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
      style={{
        transitionDelay: !isSlow && delay ? `${delay}ms` : undefined,
        ...style,
      }}
      className={`reveal-base ${directionClass} ${
        isRevealed ? "is-revealed" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default ScrollReveal
