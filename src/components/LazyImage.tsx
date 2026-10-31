import { useState, useEffect, useRef, type ImgHTMLAttributes } from "react"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
  aspectRatio?: string
  containerClassName?: string
}

export function LazyImage({
  src,
  alt,
  fallbackSrc = "/media/studio/multi-instrument-lab.jpeg",
  className = "",
  containerClassName = "",
  aspectRatio,
  style,
  loading: initialLoading = "lazy",
  ...props
}: LazyImageProps) {
  const { isSlow } = useNetworkStatus()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!isSlow) // On slow networks, wait for intersection
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldLoad) return

    const el = containerRef.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true)
      return
    }

    // On slow network, only trigger load when within 150px of viewport to preserve bandwidth
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: "150px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [shouldLoad])

  const imageSrc = hasError ? fallbackSrc : src

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{
        aspectRatio,
        backgroundColor: "#FAF7F2",
      }}
    >
      {/* Warm skeleton placeholder visible while image is fetching */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#F5F2EB] via-[#FAF8F5] to-[#F5F2EB] animate-pulse"
          style={{
            zIndex: 1,
          }}
        />
      )}

      {shouldLoad && (
        <img
          src={imageSrc}
          alt={alt}
          loading={initialLoading}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (!hasError) {
              setHasError(true)
            } else {
              setIsLoaded(true)
            }
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          style={style}
          {...props}
        />
      )}
    </div>
  )
}

export default LazyImage
