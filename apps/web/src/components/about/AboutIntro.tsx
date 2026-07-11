import { FadeIn } from "@/components/animations/FadeIn";

export function AboutIntro() {
  return (
    <section className="bg-[#050505] px-8 py-44 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
            Slow Luxury
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
            Some journeys are not about discovering new places. They are about
            rediscovering yourself.
          </h2>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-12 max-w-2xl text-sm leading-8 text-white/55 md:text-base">
            Hidden between nature and silence, Sunshine Resort was imagined as a
            destination where every moment invites you to slow down, breathe
            deeply and reconnect with what truly matters.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}