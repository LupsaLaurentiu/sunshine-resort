import { AboutCTA } from "@/components/about/AboutCTA";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutIntro } from "@/components/about/AboutIntro";
import { AboutPhilosophy } from "@/components/about/AboutPhilosophy";
import { AdultsOnlySection } from "@/components/about/AdultsOnlySection";
import { SlowLuxurySection } from "@/components/about/SlowLuxurySection";

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutIntro />
      <SlowLuxurySection />
      <AboutPhilosophy />
      <AdultsOnlySection />
      <AboutCTA />
    </main>
  );
}