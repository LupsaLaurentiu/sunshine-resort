import {
  AttractionShowcase,
} from "@/components/attractions/AttractionShowcase";

import {
  AttractionsCTA,
} from "@/components/attractions/AttractionsCTA";

import {
  AttractionsGrid,
} from "@/components/attractions/AttractionsGrid";

import {
  AttractionsHero,
} from "@/components/attractions/AttractionsHero";

import {
  AttractionsIntro,
} from "@/components/attractions/AttractionsIntro";

import {
  isPublicLocale,
  type PublicLocale,
} from "@/lib/public-routes";

type AttractionsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type AttractionHighlight = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

const ATTRACTIONS_CONTENT = {
  ro: {
    highlights: [
      {
        title:
          "Ocna Șugatag",

        description:
          "O destinație cunoscută pentru lacurile sărate, peisajele liniștite și atmosfera balneoclimaterică, potrivită pentru plimbări fără grabă și după-amiezi relaxante.",

        image:
          "/images/ogna-sugatag-1.png",

        imageAlt:
          "Peisaj din Ocna Șugatag, în apropierea Sunshine Resort",
      },

      {
        title:
          "Tradițiile Maramureșului",

        description:
          "Descoperă porțile din lemn, satele tradiționale și meșteșugurile locale care păstrează autenticitatea și ritmul firesc al regiunii.",

        image:
          "/images/ogna-sugatag-4.png",

        imageAlt:
          "Arhitectură și tradiții specifice Maramureșului",
      },

      {
        title:
          "Refugii în natură",

        description:
          "Pădurile, dealurile și drumurile panoramice te invită să explorezi natura în propriul ritm, înainte de a reveni la liniștea resortului.",

        image:
          "/images/ogna-sugatag-2.png",

        imageAlt:
          "Peisaj montan și păduri din Maramureș",
      },
    ] satisfies AttractionHighlight[],
  },

  en: {
    highlights: [
      {
        title:
          "Ocna Șugatag",

        description:
          "A destination known for its salt lakes, peaceful landscapes and balneoclimatic atmosphere, ideal for slow walks and relaxing afternoons.",

        image:
          "/images/ogna-sugatag-1.png",

        imageAlt:
          "Landscape in Ocna Șugatag near Sunshine Resort",
      },

      {
        title:
          "Maramureș Traditions",

        description:
          "Discover wooden gates, traditional villages and local craftsmanship that preserve the authentic character and natural rhythm of the region.",

        image:
          "/images/ogna-sugatag-4.png",

        imageAlt:
          "Traditional architecture and craftsmanship in Maramureș",
      },

      {
        title:
          "Nature Escapes",

        description:
          "Forests, hills and scenic roads invite you to explore nature at your own pace before returning to the tranquillity of the resort.",

        image:
          "/images/ogna-sugatag-2.png",

        imageAlt:
          "Mountain landscape and forests in Maramureș",
      },
    ] satisfies AttractionHighlight[],
  },
} as const;

export default async function AttractionsPage({
  params,
}: AttractionsPageProps) {
  const {
    locale: localeParam,
  } = await params;

  const locale: PublicLocale =
    isPublicLocale(
      localeParam,
    )
      ? localeParam
      : "ro";

  const content =
    ATTRACTIONS_CONTENT[
      locale
    ];

  return (
    <main>
      <AttractionsHero />

      <AttractionsIntro />

      {content.highlights.map(
        (
          attraction,
          index,
        ) => (
          <AttractionShowcase
            key={
              attraction.title
            }
            title={
              attraction.title
            }
            description={
              attraction.description
            }
            image={
              attraction.image
            }
            imageAlt={
              attraction.imageAlt
            }
            reverse={
              index % 2 === 1
            }
          />
        ),
      )}

      <AttractionsGrid />

      <AttractionsCTA />
    </main>
  );
}