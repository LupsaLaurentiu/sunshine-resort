"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FadeIn } from "@/components/animations/FadeIn";

const galleryImages = [
  {
    src: "/images/pool-gallery-1.jpg",
    category: "Pool",
    title: "Warm mineral water",
  },
  {
    src: "/images/pool-gallery-2.jpg",
    category: "Wellness",
    title: "Quiet rituals",
  },
  {
    src: "/images/pool-gallery-3.jpg",
    category: "Apartments",
    title: "Private interiors",
  },
  {
    src: "/images/about-slow.webp",
    category: "Nature",
    title: "Slow mornings",
  },
  {
    src: "/images/ogna-sugatag-3.png",
    category: "Resort",
    title: "Soft light",
  },
  {
    src: "/images/ogna-sugatag-2.png",
    category: "Details",
    title: "Elegant textures",
  },
];

const categories = ["All", "Pool", "Wellness", "Apartments", "Nature", "Resort"];

export function GalleryCarousel() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeImage, setActiveImage] = useState<number | null>(null);

  const images = useMemo(() => {
    if (selectedCategory === "All") return galleryImages;
    return galleryImages.filter((image) => image.category === selectedCategory);
  }, [selectedCategory]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    setSelectedIndex(0);
    emblaApi?.scrollTo(0);
    emblaApi?.reInit();
  }, [selectedCategory, emblaApi]);

  const current = images[selectedIndex];
  const progress =
    images.length > 1 ? (selectedIndex / (images.length - 1)) * 100 : 0;

  function openPreviousImage() {
    if (activeImage === null) return;
    setActiveImage((activeImage - 1 + images.length) % images.length);
  }

  function openNextImage() {
    if (activeImage === null) return;
    setActiveImage((activeImage + 1) % images.length);
  }

  return (
    <section className="bg-[#050505] px-8 pb-44 text-[#f5f2eb]">
      <div className="mx-auto max-w-[1380px]">
        <div className="mb-20 grid gap-12 lg:grid-cols-[0.55fr_0.45fr]">
          <FadeIn>
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
                Gallery
              </p>

              <h2 className="heading text-6xl font-light leading-tight md:text-8xl">
                Seasonal moments.
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex flex-col justify-end lg:items-end lg:text-right">
              <p className="max-w-md text-sm leading-8 text-white/55">
                Slow mornings, warm water, soft interiors and quiet luxury in
                the heart of Maramureș.
              </p>

              <div className="mt-10 flex items-center gap-8">
                <span className="text-xs uppercase tracking-[0.35em] text-white/45">
                  {String(selectedIndex + 1).padStart(2, "0")} /{" "}
                  {String(images.length).padStart(2, "0")}
                </span>

                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={scrollPrev}
                    className="text-white/65 transition hover:text-gold"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-7 w-7 stroke-[1.2]" />
                  </button>

                  <button
                    type="button"
                    onClick={scrollNext}
                    className="text-white/65 transition hover:text-gold"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-7 w-7 stroke-[1.2]" />
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {images.map((image, index) => (
              <div
                key={image.src}
                className="min-w-[60%] px-4 md:min-w-[60%] lg:min-w-[68%]"
              >
                <button
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className="group block w-full text-left"
                >
                  <div className="relative h-[300px] lg:h-[400px] overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.035]"
                    />

                    <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/20" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-500 group-hover:opacity-100">
                      <span className="border border-white/50 px-8 py-4 text-xs uppercase tracking-[0.35em] text-white">
                        View
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-start justify-between gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-gold">
                        {image.category}
                      </p>
                      <h3 className="heading mt-3 text-3xl font-light text-white/90">
                        {image.title}
                      </h3>
                    </div>

                    <span className="text-xs uppercase tracking-[0.3em] text-white/35">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="relative h-px bg-white/15">
            <div
              className="absolute left-0 top-0 h-px bg-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold transition-all duration-500"
              style={{ left: `calc(${progress}% - 4px)` }}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs uppercase tracking-[0.35em] transition ${
                  selectedCategory === category
                    ? "text-gold"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeImage !== null && (
        <div className="fixed inset-0 z-[1000] bg-black/95 p-6">
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-8 top-8 z-20 text-white/75 transition hover:text-gold"
            aria-label="Close image"
          >
            <X className="h-8 w-8 stroke-[1.2]" />
          </button>

          <button
            type="button"
            onClick={openPreviousImage}
            className="absolute left-8 top-1/2 z-20 -translate-y-1/2 text-white/60 transition hover:text-gold"
            aria-label="Previous fullscreen image"
          >
            <ChevronLeft className="h-10 w-10 stroke-[1.2]" />
          </button>

          <button
            type="button"
            onClick={openNextImage}
            className="absolute right-8 top-1/2 z-20 -translate-y-1/2 text-white/60 transition hover:text-gold"
            aria-label="Next fullscreen image"
          >
            <ChevronRight className="h-10 w-10 stroke-[1.2]" />
          </button>

          <div className="relative h-full w-full">
            <Image
              src={images[activeImage].src}
              alt={images[activeImage].title}
              fill
              priority
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-gold">
              {images[activeImage].category}
            </p>
            <p className="heading mt-2 text-2xl font-light text-white">
              {images[activeImage].title}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}