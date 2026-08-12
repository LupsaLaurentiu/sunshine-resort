import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  RoomAvailabilityCalendar,
} from "@/components/rooms/RoomAvailabilityCalendar";

import {
  RoomDetailsScrollButton,
} from "@/components/rooms/RoomDetailsScrollButton";

import {
  getPublicRoomContent,
  publicRooms,
} from "@/data/rooms";

import {
  getPublicHref,
  isPublicLocale,
  type PublicLocale,
} from "@/lib/public-routes";

type RoomDetailsPageProps = {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
};

const PAGE_CONTENT = {
  ro: {
    scroll:
      "Descoperă",

    scrollAriaLabel:
      "Derulează la prezentarea apartamentului",

    backToRooms:
      "Înapoi la toate apartamentele",

    experienceEyebrow:
      "Experiența apartamentului",

    experienceTitle:
      "Creat pentru intimitate și confort.",

    galleryEyebrow:
      "Galerie",

    galleryTitle:
      "Descoperă fiecare detaliu.",

    includedEyebrow:
      "Incluse în sejur",

    amenitiesTitle:
      "Facilități",

    reserveEyebrow:
      "Rezervă direct",

    reserveTitlePrefix:
      "Apartamentul",

    reserveTitleSuffix:
      "te așteaptă.",

    reserveDescription:
      "Verifică disponibilitatea în timp real și rezervă direct pe site experiența Sunshine Resort.",

    reserveButton:
      "Verifică disponibilitatea",

    galleryAlt:
      "Imagine din",

    logoAriaLabel:
      "Mergi la pagina principală Sunshine Resort",
  },

  en: {
    scroll:
      "Explore",

    scrollAriaLabel:
      "Scroll to the apartment presentation",

    backToRooms:
      "Back to all apartments",

    experienceEyebrow:
      "Apartment experience",

    experienceTitle:
      "Designed for privacy and comfort.",

    galleryEyebrow:
      "Gallery",

    galleryTitle:
      "Discover every detail.",

    includedEyebrow:
      "Included in your stay",

    amenitiesTitle:
      "Amenities",

    reserveEyebrow:
      "Book direct",

    reserveTitlePrefix:
      "Your",

    reserveTitleSuffix:
      "awaits.",

    reserveDescription:
      "Check real-time availability and book your Sunshine Resort experience directly through our website.",

    reserveButton:
      "Check availability",

    galleryAlt:
      "Image of",

    logoAriaLabel:
      "Go to the Sunshine Resort homepage",
  },
} as const;

function resolveLocale(
  value: string,
): PublicLocale {
  return isPublicLocale(
    value,
  )
    ? value
    : "ro";
}

function getRoomPublicHref(
  locale: PublicLocale,
  slug: string,
): string {
  return `${getPublicHref(
    "rooms",
    locale,
  )}/${slug}`;
}

export async function generateStaticParams() {
  return publicRooms.flatMap(
    (
      room,
    ) => [
      {
        locale:
          "ro",

        slug:
          room.slug,
      },

      {
        locale:
          "en",

        slug:
          room.slug,
      },
    ],
  );
}

export async function generateMetadata({
  params,
}: RoomDetailsPageProps): Promise<Metadata> {
  const {
    slug,
    locale:
      localeParam,
  } =
    await params;

  const locale =
    resolveLocale(
      localeParam,
    );

  const room =
    getPublicRoomContent(
      slug,
    );

  if (
    !room
  ) {
    return {};
  }

  const localizedRoom =
    room.content[
      locale
    ];

  const romanianHref =
    getRoomPublicHref(
      "ro",
      slug,
    );

  const englishHref =
    getRoomPublicHref(
      "en",
      slug,
    );

  const canonicalHref =
    locale === "ro"
      ? romanianHref
      : englishHref;

  const metadataTitle =
    `${localizedRoom.title} | Sunshine Resort`;

  return {
    title:
      metadataTitle,

    description:
      localizedRoom.shortDescription,

    alternates: {
      canonical:
        canonicalHref,

      languages: {
        ro:
          romanianHref,

        en:
          englishHref,

        "x-default":
          romanianHref,
      },
    },

    openGraph: {
      title:
        metadataTitle,

      description:
        localizedRoom.shortDescription,

      type:
        "website",

      locale:
        locale ===
        "ro"
          ? "ro_RO"
          : "en_US",

      images: [
        {
          url:
            room.image,

          alt:
            localizedRoom.title,
        },
      ],
    },
  };
}

export default async function RoomDetailsPage({
  params,
}: RoomDetailsPageProps) {
  const {
    slug,
    locale:
      localeParam,
  } =
    await params;

  const locale =
    resolveLocale(
      localeParam,
    );

  const room =
    getPublicRoomContent(
      slug,
    );

  if (
    !room
  ) {
    notFound();
  }

  const localizedRoom =
    room.content[
      locale
    ];

  const pageContent =
    PAGE_CONTENT[
      locale
    ];

  const homeHref =
    getPublicHref(
      "home",
      locale,
    );

  const roomsHref =
    getPublicHref(
      "rooms",
      locale,
    );

  /*
   * URL-ul de bază este folosit de calendar.
   *
   * RoomAvailabilityCalendar va adăuga:
   *
   * ?checkIn=YYYY-MM-DD
   * &checkOut=YYYY-MM-DD
   * &roomType=...
   */
  const bookingBaseHref =
    getPublicHref(
      "book",
      locale,
    );

  /*
   * CTA-ul final rămâne disponibil chiar dacă utilizatorul
   * nu selectează o perioadă direct din calendar.
   *
   * În acest caz trimitem doar tipul apartamentului,
   * iar perioada va putea fi aleasă în pagina de booking.
   */
  const bookingHref =
    `${bookingBaseHref}?roomType=${encodeURIComponent(
      room.slug,
    )}`;

  const heroEyebrow =
    localizedRoom
      .details[0] ??
    localizedRoom.title;

  const reservationTitle =
    locale === "ro"
      ? `${pageContent.reserveTitlePrefix} ${localizedRoom.title.replace(
          /^Apartament\s+/i,
          "",
        )} ${pageContent.reserveTitleSuffix}`
      : `${pageContent.reserveTitlePrefix} ${localizedRoom.title} ${pageContent.reserveTitleSuffix}`;

  return (
    <main className="bg-[#050505] text-[#f5f2eb]">
      {/* HERO */}
      <section
        aria-labelledby="room-details-title"
        className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-6 text-center text-white sm:px-8"
      >
        <Image
          src={
            room.image
          }
          alt={
            localizedRoom.title
          }
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/85" />

        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/15" />

        <Link
          href={
            homeHref
          }
          aria-label={
            pageContent.logoAriaLabel
          }
          className="absolute left-1/2 top-7 z-20 -translate-x-1/2 md:top-8"
        >
          <Image
            src="/logo-sunshine.png"
            alt="Sunshine Resort"
            width={
              190
            }
            height={
              125
            }
            priority
            style={{
              width:
                "180px",

              height:
                "auto",
            }}
            className="brightness-0 invert transition-opacity duration-300 hover:opacity-80"
          />
        </Link>

        <div className="relative z-10 mx-auto max-w-4xl pt-24 md:pt-28">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-gold sm:text-[10px] md:text-xs">
              {
                heroEyebrow
              }
            </p>
          </FadeIn>

          <FadeIn
            delay={
              0.15
            }
            distance={
              48
            }
          >
            <h1
              id="room-details-title"
              className="heading mx-auto mt-8 max-w-4xl text-5xl font-light leading-[0.94] tracking-[0.005em] sm:text-6xl md:text-7xl lg:text-[6.5rem]"
            >
              {
                localizedRoom.title
              }
            </h1>
          </FadeIn>

          <FadeIn
            delay={
              0.28
            }
            distance={
              22
            }
          >
            <div className="mx-auto mt-9 h-px w-16 bg-gold/80 md:w-20" />
          </FadeIn>

          <FadeIn
            delay={
              0.36
            }
            distance={
              24
            }
          >
            <p className="mx-auto mt-9 max-w-2xl text-sm leading-8 text-white/70 sm:text-[15px] md:text-base md:leading-9">
              {
                localizedRoom.shortDescription
              }
            </p>
          </FadeIn>
        </div>

        <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 md:bottom-9">
          <RoomDetailsScrollButton
            label={
              pageContent.scroll
            }
            ariaLabel={
              pageContent.scrollAriaLabel
            }
            targetId="apartment-experience"
          />
        </div>
      </section>

      {/* EXPERIENCE */}
      <section
        id="apartment-experience"
        aria-labelledby="apartment-experience-title"
        className="scroll-mt-24 px-6 py-28 sm:px-8 sm:py-32 md:py-40"
      >
        <div className="mx-auto max-w-[1300px]">
          <FadeIn
            distance={
              20
            }
          >
            <Link
              href={
                roomsHref
              }
              className="group mb-16 inline-flex items-center gap-4 text-[9px] font-semibold uppercase tracking-[0.28em] text-white/40 transition duration-500 hover:text-gold md:mb-20"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-x-1" />

              {
                pageContent.backToRooms
              }
            </Link>
          </FadeIn>

          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 xl:gap-28">
            <FadeIn>
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.46em] text-gold sm:text-[10px] md:text-xs">
                  {
                    pageContent.experienceEyebrow
                  }
                </p>

                <h2
                  id="apartment-experience-title"
                  className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
                >
                  {
                    pageContent.experienceTitle
                  }
                </h2>
              </div>
            </FadeIn>

            <FadeIn
              delay={
                0.2
              }
              distance={
                32
              }
            >
              <div>
                <p className="text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
                  {
                    localizedRoom.description
                  }
                </p>

                <div className="mt-12 grid gap-x-12 gap-y-6 border-y border-white/10 py-9 sm:grid-cols-2">
                  {localizedRoom.details.map(
                    (
                      detail,
                    ) => (
                      <p
                        key={
                          detail
                        }
                        className="text-[10px] uppercase leading-6 tracking-[0.22em] text-white/55"
                      >
                        {
                          detail
                        }
                      </p>
                    ),
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section
        aria-labelledby="room-gallery-title"
        className="px-6 pb-28 sm:px-8 sm:pb-32 md:pb-40"
      >
        <div className="mx-auto max-w-[1380px]">
          <div className="mb-14 md:mb-20">
            <FadeIn>
              <p className="text-[9px] font-medium uppercase tracking-[0.46em] text-gold sm:text-[10px] md:text-xs">
                {
                  pageContent.galleryEyebrow
                }
              </p>
            </FadeIn>

            <FadeIn
              delay={
                0.12
              }
              distance={
                38
              }
            >
              <h2
                id="room-gallery-title"
                className="heading mt-7 max-w-3xl text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl"
              >
                {
                  pageContent.galleryTitle
                }
              </h2>
            </FadeIn>
          </div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {room.gallery.map(
              (
                image,
                index,
              ) => {
                const isFirstImage =
                  index ===
                  0;

                return (
                  <FadeIn
                    key={
                      image
                    }
                    delay={
                      index *
                      0.1
                    }
                    distance={
                      28
                    }
                    className={
                      isFirstImage
                        ? "md:col-span-2"
                        : undefined
                    }
                  >
                    <div
                      className={[
                        "group relative overflow-hidden bg-[#111]",

                        isFirstImage
                          ? "h-[460px] sm:h-[580px] md:h-[720px]"
                          : "h-[420px] sm:h-[520px] md:h-[620px]",
                      ].join(
                        " ",
                      )}
                    >
                      <Image
                        src={
                          image
                        }
                        alt={`${pageContent.galleryAlt} ${localizedRoom.title}`}
                        fill
                        sizes={
                          isFirstImage
                            ? "100vw"
                            : "(max-width: 768px) 100vw, 50vw"
                        }
                        className="object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />

                      <span className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.3em] text-white/55 sm:bottom-8 sm:left-8">
                        {String(
                          index +
                            1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>
                    </div>
                  </FadeIn>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* AMENITIES */}
      <section
        aria-labelledby="room-amenities-title"
        className="relative overflow-hidden bg-[#0b0b0b] px-6 py-28 sm:px-8 sm:py-32 md:py-40"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(88vw,1200px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="mx-auto max-w-[1200px]">
          <div className="mb-16 text-center md:mb-20">
            <FadeIn>
              <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-gold sm:text-[10px] md:text-xs">
                {
                  pageContent.includedEyebrow
                }
              </p>
            </FadeIn>

            <FadeIn
              delay={
                0.12
              }
              distance={
                40
              }
            >
              <h2
                id="room-amenities-title"
                className="heading mt-8 text-4xl font-light leading-[1.04] tracking-[-0.015em] sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {
                  pageContent.amenitiesTitle
                }
              </h2>
            </FadeIn>
          </div>

          <div className="grid overflow-hidden border border-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {localizedRoom.amenities.map(
              (
                amenity,
                index,
              ) => (
                <FadeIn
                  key={
                    amenity
                  }
                  delay={
                    index *
                    0.045
                  }
                  distance={
                    18
                  }
                  className="h-full"
                >
                  <div className="group flex h-full min-h-[130px] items-center justify-center border-b border-r border-white/10 bg-[#0b0b0b] px-7 py-8 text-center transition duration-500 hover:bg-white/[0.025]">
                    <p className="text-[9px] uppercase leading-6 tracking-[0.24em] text-white/55 transition duration-500 group-hover:text-gold sm:text-[10px]">
                      {
                        amenity
                      }
                    </p>
                  </div>
                </FadeIn>
              ),
            )}
          </div>
        </div>
      </section>

      {/* AVAILABILITY CALENDAR */}
      <RoomAvailabilityCalendar
        roomSlug={
          room.slug
        }
        locale={
          locale
        }
        bookingHref={
          bookingBaseHref
        }
      />

      {/* FINAL CTA */}
      <section className="relative isolate overflow-hidden px-6 py-36 text-center sm:px-8 md:py-44 lg:py-52">
        <Image
          src={
            room.image
          }
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-15"
        />

        <div className="absolute inset-0 bg-black/75" />

        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <FadeIn>
            <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-gold sm:text-[10px] md:text-xs">
              {
                pageContent.reserveEyebrow
              }
            </p>
          </FadeIn>

          <FadeIn
            delay={
              0.15
            }
            distance={
              48
            }
          >
            <h2 className="heading mx-auto mt-8 max-w-4xl text-5xl font-light leading-[0.98] tracking-[-0.02em] sm:text-6xl md:text-7xl lg:text-8xl">
              {
                reservationTitle
              }
            </h2>
          </FadeIn>

          <FadeIn
            delay={
              0.28
            }
            distance={
              24
            }
          >
            <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
              {
                pageContent.reserveDescription
              }
            </p>
          </FadeIn>

          <FadeIn
            delay={
              0.4
            }
            distance={
              20
            }
          >
            <Link
              href={
                bookingHref
              }
              className="group mt-14 inline-flex min-h-14 items-center justify-center gap-4 border border-gold bg-gold px-10 py-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-black transition duration-500 hover:border-white hover:bg-white sm:px-12 sm:text-[10px]"
            >
              {
                pageContent.reserveButton
              }

              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}