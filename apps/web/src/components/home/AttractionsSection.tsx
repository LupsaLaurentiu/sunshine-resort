import Link from "next/link";
import { FadeIn } from "../animations/FadeIn";

export function AttractionsSection() {
  return (
    <section className="grid min-h-screen bg-[#0b0b0b] lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex items-center px-8 py-32 text-[#f5f2eb] lg:px-20">
        <div className="max-w-xl">
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-gold">
              Discover
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-6xl font-light">
              Explore Transylvania.
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-8 leading-8 text-white/60">
              Lakes, forests, traditional villages and mountain landscapes are
              only minutes away from Sunshine Resort.
            </p>
          </FadeIn>

          <FadeIn delay={0.45}>
            <Link
              href="/ro/attractions"
              className="mt-10 inline-block border border-gold px-8 py-4 text-xs uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-black"
            >
              Discover More
            </Link>
          </FadeIn>
        </div>
      </div>

      <FadeIn delay={0.2}>
        <div
          className="min-h-screen bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/atractions-4.jpg')",
          }}
        />
      </FadeIn>
    </section>
  );
}