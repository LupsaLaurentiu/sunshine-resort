import { AttractionShowcase } from "@/components/attractions/AttractionShowcase";
import { AttractionsCTA } from "@/components/attractions/AttractionsCTA";
import { AttractionsGrid } from "@/components/attractions/AttractionsGrid";
import { AttractionsHero } from "@/components/attractions/AttractionsHero";
import { AttractionsIntro } from "@/components/attractions/AttractionsIntro";

const highlights = [
  {
    title: "Ocna Șugatag",
    description:
      "A place known for its salt lakes, quiet landscapes and therapeutic atmosphere, ideal for slow walks and peaceful afternoons.",
    image: "/images/ogna-sugatag-1.png",
  },
  {
    title: "Maramureș Traditions",
    description:
      "Discover wooden gates, traditional villages and local craftsmanship that preserve the authentic rhythm of the region.",
    image: "/images/ogna-sugatag-4.png",
  },
  {
    title: "Mountain Escapes",
    description:
      "Forests, hills and scenic roads invite you to explore nature at your own pace, before returning to the calm of the resort.",
    image: "/images/ogna-sugatag-2.png",
  },
];

export default function AttractionsPage() {
  return (
    <main>
      <AttractionsHero />
      <AttractionsIntro />

      {highlights.map((item, index) => (
        <AttractionShowcase
          key={item.title}
          title={item.title}
          description={item.description}
          image={item.image}
          reverse={index % 2 === 1}
        />
      ))}

      <AttractionsGrid />
      <AttractionsCTA />
    </main>
  );
}