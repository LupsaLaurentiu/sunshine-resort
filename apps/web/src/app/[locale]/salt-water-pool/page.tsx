import { PoolBenefits } from "@/components/salt-water-pool/PoolBenefits";
import { PoolCTA } from "@/components/salt-water-pool/PoolCTA";
import { PoolExperience } from "@/components/salt-water-pool/PoolExperience";
import { PoolGallery } from "@/components/salt-water-pool/PoolGallery";
import { PoolHero } from "@/components/salt-water-pool/PoolHero";
import { PoolIntro } from "@/components/salt-water-pool/PoolIntro";

export default function SaltWaterPoolPage() {
  return (
    <main>
      <PoolHero />
      <PoolIntro />
      <PoolExperience />
      <PoolBenefits />
      <PoolGallery />
      <PoolCTA />
    </main>
  );
}