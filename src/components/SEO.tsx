import { useEffect } from "react"

interface SEOProps {
  title: string
  description: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: string
  schema?: Record<string, any> | Array<Record<string, any>>
}

const DEFAULT_KEYWORDS =
  "music schools, music schools in kaduna, music school kaduna, instrument repair, instrument repair kaduna, musical instrument repair, music studio, music studio kaduna, recording studio kaduna, music lessons, guitar repair, saxophone repair, piano lessons kaduna, voice training, audio mixing studio"

const SITE_URL = "https://vivadoxa.ng"
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

export function SEO({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  schema,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title.includes("Vivadoxa")
      ? title
      : `${title} | Vivadoxa Music School, Instrument Repair & Studio`
    document.title = formattedTitle

    // Helper to set or update meta tag
    const setMeta = (
      nameAttr: "name" | "property",
      key: string,
      val: string,
    ) => {
      let tag = document.querySelector(
        `meta[${nameAttr}="${key}"]`,
      ) as HTMLMetaElement | null
      if (!tag) {
        tag = document.createElement("meta")
        tag.setAttribute(nameAttr, key)
        document.head.appendChild(tag)
      }
      tag.setAttribute("content", val)
    }

    // 2. Standard Meta Tags
    setMeta("name", "description", description)
    setMeta("name", "keywords", keywords)
    setMeta(
      "name",
      "robots",
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    )

    // 3. Open Graph
    setMeta("property", "og:title", formattedTitle)
    setMeta("property", "og:description", description)
    setMeta("property", "og:type", ogType)
    setMeta(
      "property",
      "og:image",
      ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`,
    )
    if (canonicalUrl) {
      setMeta(
        "property",
        "og:url",
        canonicalUrl.startsWith("http")
          ? canonicalUrl
          : `${SITE_URL}${canonicalUrl}`,
      )
    }

    // 4. Twitter Cards
    setMeta("name", "twitter:card", "summary_large_image")
    setMeta("name", "twitter:title", formattedTitle)
    setMeta("name", "twitter:description", description)
    setMeta(
      "name",
      "twitter:image",
      ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`,
    )

    // 5. Canonical Link
    const targetCanonical = canonicalUrl
      ? canonicalUrl.startsWith("http")
        ? canonicalUrl
        : `${SITE_URL}${canonicalUrl}`
      : window.location.href.split("?")[0]

    let canonicalTag = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null
    if (!canonicalTag) {
      canonicalTag = document.createElement("link")
      canonicalTag.setAttribute("rel", "canonical")
      document.head.appendChild(canonicalTag)
    }
    canonicalTag.setAttribute("href", targetCanonical)

    // 6. Page-Specific JSON-LD Schema
    const schemaId = "dynamic-page-schema"
    let scriptTag = document.getElementById(
      schemaId,
    ) as HTMLScriptElement | null

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script")
        scriptTag.id = schemaId
        scriptTag.type = "application/ld+json"
        document.head.appendChild(scriptTag)
      }
      scriptTag.textContent = JSON.stringify(schema)
    } else if (scriptTag) {
      scriptTag.remove()
    }

    return () => {
      // Clean up dynamic schema when leaving the page
      const currentScript = document.getElementById(schemaId)
      if (currentScript) {
        currentScript.remove()
      }
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, schema])

  return null
}
