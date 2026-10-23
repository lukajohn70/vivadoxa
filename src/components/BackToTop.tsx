import { useState, useEffect } from "react"
import { Icon } from "@/components/ui"

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 350) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`back-to-top-btn ${visible ? "visible" : ""}`}
      aria-label="Back to top of page"
      title="Back to top"
    >
      <Icon name="arrowUp" size={18} />
      <span className="back-to-top-tooltip">Back to top</span>
    </button>
  )
}
