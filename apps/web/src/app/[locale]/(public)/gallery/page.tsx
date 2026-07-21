import { GalleryCarousel } from "@/components/gallery/GalleryCarousel";
import { GalleryCTA } from "@/components/gallery/GalleryCTA";
import { GalleryHero } from "@/components/gallery/GalleryHero";
import { GalleryIntro } from "@/components/gallery/GalleryIntro";

export default function GalleryPage() {
  return (
    <main>
      <GalleryHero />
      <GalleryIntro />
      <GalleryCarousel />
      <GalleryCTA />
    </main>
  );
}