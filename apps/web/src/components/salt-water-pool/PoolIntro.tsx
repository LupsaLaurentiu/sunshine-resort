import { FadeIn } from "@/components/animations/FadeIn";

export function PoolIntro() {
  return (
    <section className="bg-[#050505] px-8 py-44 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
            Warm Water. Quiet Ritual.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
            A peaceful wellness experience designed for every season.
          </h2>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-12 max-w-2xl text-sm leading-8 text-white/55 md:text-base">
            The indoor salt water pool is created as a calm ritual of warmth,
            silence and relaxation — a place to slow down and reconnect.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}