import { AdultsOnlyFeature } from "@/components/facilities/AdultsOnlyFeature";
import { FacilitiesCTA } from "@/components/facilities/FacilitiesCTA";
import { FacilitiesGrid } from "@/components/facilities/FacilitiesGrid";
import { FacilitiesHero } from "@/components/facilities/FacilitiesHero";
import { FacilitiesIntro } from "@/components/facilities/FacilitiesIntro";
import { SaltWaterPoolFeature } from "@/components/facilities/SaltWaterPoolFeature";

export default function FacilitiesPage() {
  return (
    <main>
      <FacilitiesHero />
      <FacilitiesIntro />
      <SaltWaterPoolFeature />
      <FacilitiesGrid />
      <AdultsOnlyFeature />
      <FacilitiesCTA />
    </main>
  );
}