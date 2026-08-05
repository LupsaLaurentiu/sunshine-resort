"use client";

import {
  Bath,
  BedDouble,
  Car,
  Coffee,
  Monitor,
  PersonStanding,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

type AmenityKey =
  | "adultsOnly"
  | "kingBed"
  | "smartTv"
  | "wifi"
  | "coffee"
  | "parking"
  | "pool"
  | "bathroom";

type AmenityDefinition = {
  key: AmenityKey;
  icon: LucideIcon;
};

const AMENITIES: AmenityDefinition[] = [
  {
    key: "adultsOnly",
    icon: PersonStanding,
  },
  {
    key: "kingBed",
    icon: BedDouble,
  },
  {
    key: "smartTv",
    icon: Monitor,
  },
  {
    key: "wifi",
    icon: Wifi,
  },
  {
    key: "coffee",
    icon: Coffee,
  },
  {
    key: "parking",
    icon: Car,
  },
  {
    key: "pool",
    icon: Waves,
  },
  {
    key: "bathroom",
    icon: Bath,
  },
];

const ROOM_AMENITIES_CONTENT = {
  ro: {
    eyebrow: "Incluse în sejur",

    title:
      "Confortul este în fiecare detaliu.",

    description:
      "Facilități atent alese pentru un sejur relaxant, confortabil și lipsit de griji.",

    amenities: {
      adultsOnly:
        "Exclusiv adulților",

      kingBed:
        "Pat king-size",

      smartTv:
        "Smart TV",

      wifi:
        "Wi-Fi gratuit",

      coffee:
        "Stație pentru cafea",

      parking:
        "Parcare privată",

      pool:
        "Acces la piscina cu apă sărată",

      bathroom:
        "Baie premium",
    } satisfies Record<
      AmenityKey,
      string
    >,
  },

  en: {
    eyebrow: "Included in your stay",

    title:
      "Comfort in every detail.",

    description:
      "Thoughtfully selected amenities for a relaxing, comfortable and effortless stay.",

    amenities: {
      adultsOnly:
        "Adults only",

      kingBed:
        "King-size bed",

      smartTv:
        "Smart TV",

      wifi:
        "Complimentary Wi-Fi",

      coffee:
        "Coffee station",

      parking:
        "Private parking",

      pool:
        "Saltwater pool access",

      bathroom:
        "Premium bathroom",
    } satisfies Record<
      AmenityKey,
      string
    >,
  },
} as const;

export function RoomAmenities() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ROOM_AMENITIES_CONTENT[
      locale
    ];

  return (
    <section
      aria-labelledby="room-amenities-title"
      className="relative overflow-hidden bg-[#0b0b0b] px-6 py-28 text-[#f5f2eb] sm:px-8 sm:py-32 md:py-40"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(88vw,1200px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.025] blur-3xl" />

      <div className="relative mx-auto max-w-[1200px]">
        <div className="mx-auto mb-16 max-w-3xl text-center md:mb-20">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.48em] text-gold sm:text-[10px] md:text-xs">
              {content.eyebrow}
            </p>
          </FadeIn>

          <FadeIn
            delay={0.12}
            distance={42}
          >
            <h2
              id="room-amenities-title"
              className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {content.title}
            </h2>
          </FadeIn>

          <FadeIn
            delay={0.24}
            distance={24}
          >
            <div className="mx-auto mt-10 h-px w-16 bg-gold/70" />
          </FadeIn>

          <FadeIn
            delay={0.32}
            distance={24}
          >
            <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/50 sm:text-[15px] md:text-base md:leading-9">
              {
                content.description
              }
            </p>
          </FadeIn>
        </div>

        <div className="grid overflow-hidden border border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {AMENITIES.map(
            (
              amenity,
              index,
            ) => {
              const Icon =
                amenity.icon;

              return (
                <FadeIn
                  key={
                    amenity.key
                  }
                  delay={
                    index * 0.045
                  }
                  distance={20}
                  className="h-full"
                >
                  <div className="group flex h-full min-h-[170px] flex-col items-center justify-center border-b border-r border-white/10 bg-[#0b0b0b] px-6 py-9 text-center transition duration-500 hover:bg-white/[0.025] sm:min-h-[180px]">
                    <Icon className="h-5 w-5 stroke-[1.2] text-gold/80 transition duration-500 group-hover:scale-110 group-hover:text-gold" />

                    <p className="mt-6 max-w-[190px] text-[9px] font-medium uppercase leading-6 tracking-[0.24em] text-white/55 transition duration-500 group-hover:text-white/85 sm:text-[10px]">
                      {
                        content
                          .amenities[
                          amenity.key
                        ]
                      }
                    </p>
                  </div>
                </FadeIn>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}