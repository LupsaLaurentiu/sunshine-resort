"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import {
  usePathname,
} from "next/navigation";

import type {
  EmblaCarouselType,
} from "embla-carousel";

import useEmblaCarousel from "embla-carousel-react";

import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

type GalleryCategory =
  | "all"
  | "pool"
  | "wellness"
  | "apartments"
  | "nature"
  | "resort";

type ImageCategory = Exclude<
  GalleryCategory,
  "all"
>;

type GalleryImage = {
  src: string;
  category: ImageCategory;

  title: {
    ro: string;
    en: string;
  };

  alt: {
    ro: string;
    en: string;
  };
};

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src:
      "/images/pool-gallery-1.jpg",

    category:
      "pool",

    title: {
      ro:
        "Apă caldă și liniște",

      en:
        "Warm mineral water",
    },

    alt: {
      ro:
        "Piscina interioară cu apă sărată de la Sunshine Resort",

      en:
        "The indoor saltwater pool at Sunshine Resort",
    },
  },

  {
    src:
      "/images/pool-gallery-2.jpg",

    category:
      "wellness",

    title: {
      ro:
        "Ritualuri de relaxare",

      en:
        "Quiet rituals",
    },

    alt: {
      ro:
        "Atmosfera wellness de la Sunshine Resort",

      en:
        "The wellness atmosphere at Sunshine Resort",
    },
  },

  {
    src:
      "/images/pool-gallery-3.jpg",

    category:
      "apartments",

    title: {
      ro:
        "Interioare private",

      en:
        "Private interiors",
    },

    alt: {
      ro:
        "Interior elegant al unui apartament Sunshine Resort",

      en:
        "The elegant interior of a Sunshine Resort apartment",
    },
  },

  {
    src:
      "/images/about-slow.webp",

    category:
      "nature",

    title: {
      ro:
        "Dimineți fără grabă",

      en:
        "Slow mornings",
    },

    alt: {
      ro:
        "Atmosferă liniștită în natură la Sunshine Resort",

      en:
        "A peaceful morning in nature at Sunshine Resort",
    },
  },

  {
    src:
      "/images/ogna-sugatag-3.png",

    category:
      "resort",

    title: {
      ro:
        "Lumină discretă",

      en:
        "Soft light",
    },

    alt: {
      ro:
        "Atmosfera resortului Sunshine Resort",

      en:
        "The atmosphere of Sunshine Resort",
    },
  },

  {
    src:
      "/images/ogna-sugatag-2.png",

    category:
      "resort",

    title: {
      ro:
        "Texturi elegante",

      en:
        "Elegant textures",
    },

    alt: {
      ro:
        "Detalii și texturi elegante la Sunshine Resort",

      en:
        "Elegant details and textures at Sunshine Resort",
    },
  },
];

const GALLERY_CONTENT = {
  ro: {
    eyebrow:
      "Galerie",

    title:
      "Momente în fiecare anotimp.",

    description:
      "Dimineți fără grabă, apă caldă, interioare discrete și liniște în inima Maramureșului.",

    view:
      "Vezi",

    previousImage:
      "Imaginea anterioară",

    nextImage:
      "Imaginea următoare",

    closeImage:
      "Închide imaginea",

    previousFullscreenImage:
      "Imaginea anterioară în modul ecran complet",

    nextFullscreenImage:
      "Imaginea următoare în modul ecran complet",

    categories: {
      all:
        "Toate",

      pool:
        "Piscină",

      wellness:
        "Wellness",

      apartments:
        "Apartamente",

      nature:
        "Natură",

      resort:
        "Resort",
    } satisfies Record<
      GalleryCategory,
      string
    >,
  },

  en: {
    eyebrow:
      "Gallery",

    title:
      "Seasonal moments.",

    description:
      "Slow mornings, warm water, soft interiors and quiet luxury in the heart of Maramureș.",

    view:
      "View",

    previousImage:
      "Previous image",

    nextImage:
      "Next image",

    closeImage:
      "Close image",

    previousFullscreenImage:
      "Previous fullscreen image",

    nextFullscreenImage:
      "Next fullscreen image",

    categories: {
      all:
        "All",

      pool:
        "Pool",

      wellness:
        "Wellness",

      apartments:
        "Apartments",

      nature:
        "Nature",

      resort:
        "Resort",
    } satisfies Record<
      GalleryCategory,
      string
    >,
  },
} as const;

const CATEGORIES: GalleryCategory[] = [
  "all",
  "pool",
  "wellness",
  "apartments",
  "nature",
  "resort",
];

export function GalleryCarousel() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    GALLERY_CONTENT[
      locale
    ];

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<GalleryCategory>(
      "all",
    );

  const [
    selectedIndex,
    setSelectedIndex,
  ] =
    useState(0);

  const [
    activeImage,
    setActiveImage,
  ] =
    useState<number | null>(
      null,
    );

  const images =
    useMemo(() => {
      if (
        selectedCategory ===
        "all"
      ) {
        return GALLERY_IMAGES;
      }

      return GALLERY_IMAGES.filter(
        (image) =>
          image.category ===
          selectedCategory,
      );
    }, [
      selectedCategory,
    ]);

  const [
    emblaRef,
    emblaApi,
  ] =
    useEmblaCarousel({
      align:
        "center",

      loop:
        false,

      dragFree:
        false,

      containScroll:
        "trimSnaps",
    });

  const handleEmblaSelect =
    useCallback(
      (
        api: EmblaCarouselType,
      ) => {
        setSelectedIndex(
          api.selectedScrollSnap(),
        );
      },
      [],
    );

  const scrollPrev =
    useCallback(() => {
      emblaApi?.scrollPrev();
    }, [
      emblaApi,
    ]);

  const scrollNext =
    useCallback(() => {
      emblaApi?.scrollNext();
    }, [
      emblaApi,
    ]);

  const openPreviousImage =
    useCallback(() => {
      setActiveImage(
        (currentIndex) => {
          if (
            currentIndex ===
              null ||
            images.length ===
              0
          ) {
            return null;
          }

          return (
            currentIndex -
            1 +
            images.length
          ) %
            images.length;
        },
      );
    }, [
      images.length,
    ]);

  const openNextImage =
    useCallback(() => {
      setActiveImage(
        (currentIndex) => {
          if (
            currentIndex ===
              null ||
            images.length ===
              0
          ) {
            return null;
          }

          return (
            currentIndex +
            1
          ) %
            images.length;
        },
      );
    }, [
      images.length,
    ]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    handleEmblaSelect(
      emblaApi,
    );

    emblaApi.on(
      "select",
      handleEmblaSelect,
    );

    emblaApi.on(
      "reInit",
      handleEmblaSelect,
    );

    return () => {
      emblaApi.off(
        "select",
        handleEmblaSelect,
      );

      emblaApi.off(
        "reInit",
        handleEmblaSelect,
      );
    };
  }, [
    emblaApi,
    handleEmblaSelect,
  ]);

  useEffect(() => {
    setSelectedIndex(
      0,
    );

    setActiveImage(
      null,
    );

    if (!emblaApi) {
      return;
    }

    emblaApi.reInit();

    emblaApi.scrollTo(
      0,
      true,
    );
  }, [
    selectedCategory,
    emblaApi,
  ]);

  useEffect(() => {
    if (
      activeImage ===
      null
    ) {
      return;
    }

    const previousBodyOverflow =
      document.body.style
        .overflow;

    const previousHtmlOverflow =
      document.documentElement
        .style.overflow;

    document.body.style.overflow =
      "hidden";

    document.documentElement.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setActiveImage(
          null,
        );

        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        openPreviousImage();

        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        openNextImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    activeImage,
    openNextImage,
    openPreviousImage,
  ]);

  const safeSelectedIndex =
    Math.min(
      selectedIndex,
      Math.max(
        images.length - 1,
        0,
      ),
    );

  const progress =
    images.length > 1
      ? (
          safeSelectedIndex /
          (
            images.length -
            1
          )
        ) *
        100
      : 0;

  const activeGalleryImage =
    activeImage !== null
      ? images[
          activeImage
        ]
      : null;

  return (
    <section
      aria-labelledby="gallery-carousel-title"
      className="bg-[#050505] px-6 pb-32 text-[#f5f2eb] sm:px-8 md:pb-40"
    >
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-12 grid gap-12 md:mb-16 lg:grid-cols-[0.55fr_0.45fr]">
          <FadeIn>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.5em] text-gold sm:text-[10px] md:text-xs">
                {
                  content.eyebrow
                }
              </p>

              <h2
                id="gallery-carousel-title"
                className="heading mt-6 text-5xl font-light leading-[1.02] tracking-[-0.015em] sm:text-6xl md:text-7xl lg:text-8xl"
              >
                {
                  content.title
                }
              </h2>
            </div>
          </FadeIn>

          <FadeIn
            delay={0.2}
            distance={28}
          >
            <div className="flex flex-col lg:items-end lg:pt-12 lg:text-right">
              <p className="max-w-md text-sm leading-8 text-white/55 sm:text-[15px] md:text-base md:leading-9">
                {
                  content.description
                }
              </p>

              <div className="mt-7 flex items-center gap-8">
                <span className="text-[9px] uppercase tracking-[0.35em] text-white/45 sm:text-[10px]">
                  {String(
                    safeSelectedIndex +
                      1,
                  ).padStart(
                    2,
                    "0",
                  )}{" "}
                  /{" "}
                  {String(
                    images.length,
                  ).padStart(
                    2,
                    "0",
                  )}
                </span>

                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={
                      scrollPrev
                    }
                    className="text-white/65 transition duration-300 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label={
                      content.previousImage
                    }
                    disabled={
                      safeSelectedIndex ===
                      0
                    }
                  >
                    <ChevronLeft className="h-7 w-7 stroke-[1.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={
                      scrollNext
                    }
                    className="text-white/65 transition duration-300 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label={
                      content.nextImage
                    }
                    disabled={
                      safeSelectedIndex ===
                      images.length -
                        1
                    }
                  >
                    <ChevronRight className="h-7 w-7 stroke-[1.2]" />
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div
          ref={emblaRef}
          className="overflow-hidden"
        >
          <div className="flex">
            {images.map(
              (
                image,
                index,
              ) => (
                <div
                  key={
                    image.src
                  }
                  className="min-w-[88%] px-2 sm:min-w-[76%] sm:px-3 md:min-w-[68%] lg:min-w-[68%] lg:px-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage(
                        index,
                      )
                    }
                    className="group block w-full text-left"
                  >
                    <div className="relative h-[280px] overflow-hidden sm:h-[360px] lg:h-[460px]">
                      <Image
                        src={
                          image.src
                        }
                        alt={
                          image.alt[
                            locale
                          ]
                        }
                        fill
                        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 76vw, 68vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      />

                      <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/20" />

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-500 group-hover:opacity-100">
                        <span className="border border-white/50 px-8 py-4 text-[9px] uppercase tracking-[0.35em] text-white sm:text-[10px]">
                          {
                            content.view
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-start justify-between gap-6">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-gold sm:text-[10px]">
                          {
                            content
                              .categories[
                              image
                                .category
                            ]
                          }
                        </p>

                        <h3 className="heading mt-3 text-3xl font-light text-white/90 sm:text-4xl">
                          {
                            image.title[
                              locale
                            ]
                          }
                        </h3>
                      </div>

                      <span className="text-[9px] uppercase tracking-[0.3em] text-white/35 sm:text-[10px]">
                        {String(
                          index +
                            1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>
                    </div>
                  </button>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-16">
          <div className="relative h-px bg-white/15">
            <div
              className="absolute left-0 top-0 h-px bg-gold transition-all duration-500"
              style={{
                width:
                  `${progress}%`,
              }}
            />

            <div
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold transition-all duration-500"
              style={{
                left:
                  `calc(${progress}% - 4px)`,
              }}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            {CATEGORIES.map(
              (
                category,
              ) => (
                <button
                  key={
                    category
                  }
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      category,
                    )
                  }
                  className={[
                    "text-[9px] uppercase tracking-[0.35em] transition duration-300 sm:text-[10px]",
                    selectedCategory ===
                    category
                      ? "text-gold"
                      : "text-white/40 hover:text-white",
                  ].join(
                    " ",
                  )}
                >
                  {
                    content
                      .categories[
                      category
                    ]
                  }
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {activeGalleryImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            activeGalleryImage
              .title[locale]
          }
          className="fixed inset-0 z-[1000] bg-black/95 p-4 sm:p-6"
        >
          <button
            type="button"
            onClick={() =>
              setActiveImage(
                null,
              )
            }
            className="absolute right-5 top-5 z-20 text-white/75 transition duration-300 hover:text-gold sm:right-8 sm:top-8"
            aria-label={
              content.closeImage
            }
          >
            <X className="h-8 w-8 stroke-[1.2]" />
          </button>

          {images.length >
            1 && (
            <>
              <button
                type="button"
                onClick={
                  openPreviousImage
                }
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 text-white/60 transition duration-300 hover:text-gold sm:left-8"
                aria-label={
                  content.previousFullscreenImage
                }
              >
                <ChevronLeft className="h-9 w-9 stroke-[1.2] sm:h-10 sm:w-10" />
              </button>

              <button
                type="button"
                onClick={
                  openNextImage
                }
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-white/60 transition duration-300 hover:text-gold sm:right-8"
                aria-label={
                  content.nextFullscreenImage
                }
              >
                <ChevronRight className="h-9 w-9 stroke-[1.2] sm:h-10 sm:w-10" />
              </button>
            </>
          )}

          <div className="relative h-full w-full">
            <Image
              src={
                activeGalleryImage.src
              }
              alt={
                activeGalleryImage
                  .alt[locale]
              }
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <div className="pointer-events-none absolute bottom-6 left-1/2 w-[calc(100%-3rem)] -translate-x-1/2 text-center sm:bottom-8">
            <p className="text-[9px] uppercase tracking-[0.35em] text-gold sm:text-[10px]">
              {
                content
                  .categories[
                  activeGalleryImage
                    .category
                ]
              }
            </p>

            <p className="heading mt-2 text-2xl font-light text-white sm:text-3xl">
              {
                activeGalleryImage
                  .title[locale]
              }
            </p>
          </div>
        </div>
      )}
    </section>
  );
}