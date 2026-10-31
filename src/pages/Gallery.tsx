// ─── Vivadoxa Academy Photo Gallery Page ───────────────────────────────────────
// Dedicated page showcasing life, recitals, and practice moments at Vivadoxa Music Academy.

import { SEO } from "@/components/SEO"
import { PageHero, Cta } from "@/components/ui"
import { GallerySection } from "@/components/GallerySection"
import type { Page } from "@/types"

export function Gallery({ go }: { go: (p: Page) => void }) {
  return (
    <main>
      <SEO
        title="Photo Gallery | Vivadoxa Music Academy Kaduna"
        description="Explore authentic moments from Vivadoxa Music Academy: student recitals, violin and saxophone solos, keyboard labs, drum ensembles, and masterclasses in Kaduna."
        canonicalUrl="/gallery"
      />

      {/* Canonical Vivadoxa Page Hero with Signature Brand Canvas */}
      <PageHero
        eyebrow="Academy Photo Gallery"
        title="Where musical dedication comes to life."
        body="Step inside our Kaduna rehearsal labs, conservatory recitals, and live ensemble masterclasses. Real moments, real scholars, real progress."
        image="/media/gallery/gallery-05-full-ensemble-masterclass.jpeg"
      />

      {/* Standalone Gallery Section */}
      <GallerySection go={go} standalone />

      {/* Direct Call to Action */}
      <Cta go={go} />
    </main>
  )
}

export default Gallery
