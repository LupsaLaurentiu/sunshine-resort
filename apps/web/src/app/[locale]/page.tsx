import { HomeHero } from "@/components/hero/HomeHero";
import { EditorialIntroSection } from "@/components/home/EditorialIntroSection";
import { ResortExperienceSection } from "@/components/home/ResortExperienceSection";
import { PoolStorySection } from "@/components/home/PoolStorySection";
import { ApartmentsSection } from "@/components/home/ApartmentsStorySection";
import { GallerySection } from "@/components/home/GalleryEditorialSection";
import { AttractionsSection } from "@/components/home/AttractionsSection";
import { BookingCTASection } from "@/components/home/BookingCTASection";

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <EditorialIntroSection />
      <ResortExperienceSection />
      <PoolStorySection />
      <ApartmentsSection />
      <GallerySection />
      <AttractionsSection />
      <BookingCTASection />
    </main>
  );
}