import Link from "next/link";
import { FadeIn } from "../animations/FadeIn";

const images = [
  "/images/atractions-1.jpg",
  "/images/atractions-2.jpg",
  "/images/atractions-3.jpg",
];

export function GallerySection() {
  return (
    <section className="bg-[#050505] py-44 text-[#f5f2eb]">
      <div className="mx-auto max-w-[1380px] px-8">
        <div className="mb-20 flex items-end justify-between">
          <div>
            <FadeIn>
              <p className="mb-4 text-xs uppercase tracking-[0.45em] text-gold">
                Gallery
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="heading text-6xl font-light md:text-7xl">
                Moments of silence
              </h2>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <Link
              href="/ro/gallery"
              className="hidden text-xs uppercase tracking-[0.3em] text-gold transition hover:text-white md:block"
            >
              View Gallery
            </Link>
          </FadeIn>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_.8fr_.95fr]">
          {images.map((image, index) => (
            <FadeIn key={image} delay={index * 0.12}>
              <div
                className={`bg-cover bg-center ${
                  index === 0
                    ? "h-[700px]"
                    : index === 1
                      ? "mt-16 h-[520px]"
                      : "mt-6 h-[620px]"
                }`}
                style={{
                  backgroundImage: `url('${image}')`,
                }}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}