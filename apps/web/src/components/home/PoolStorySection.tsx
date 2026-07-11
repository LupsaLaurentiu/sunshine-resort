import Link from "next/link";
import { FadeIn } from "../animations/FadeIn";

export function PoolStorySection() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/images/pool-salt.jpg')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-8 lg:px-16">
          <div className="max-w-3xl">
            <FadeIn>
              <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
                Wellness Experience
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="heading text-5xl font-light leading-tight text-white md:text-8xl">
                Indoor
                <br />
                Salt Water Pool
              </h2>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-10 max-w-xl text-base leading-8 text-white/75">
                Warm water, natural minerals and a peaceful atmosphere designed
                for complete relaxation, regardless of the season.
              </p>
            </FadeIn>

            <FadeIn delay={0.45}>
              <Link
                href="/ro/salt-water-pool"
                className="mt-12 inline-flex border border-gold px-10 py-4 text-xs uppercase tracking-[0.35em] text-gold transition duration-500 hover:bg-gold hover:text-black"
              >
                Explore Wellness
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}