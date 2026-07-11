import { FadeIn } from "@/components/animations/FadeIn";

export function PoolExperience() {
  return (
    <section className="grid min-h-screen bg-[#0b0b0b] text-[#f5f2eb] lg:grid-cols-2">
      <FadeIn>
        <div
          className="min-h-[620px] bg-cover bg-center lg:min-h-screen"
          style={{ backgroundImage: "url('/images/salt-pool.webp')" }}
        />
      </FadeIn>

      <div className="flex items-center px-8 py-32 lg:px-20">
        <div className="max-w-xl">
          <FadeIn>
            <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
              The Experience
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
              Silence, warmth and mineral water.
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-10 text-sm leading-8 text-white/55 md:text-base">
              Designed for slow mornings and peaceful evenings, the pool offers
              a quiet wellness atmosphere where water, light and privacy become
              part of the stay.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}