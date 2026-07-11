import { FadeIn } from "@/components/animations/FadeIn";

export function FacilitiesIntro() {
  return (
    <section className="bg-[#050505] px-8 py-44 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
            Designed for Rest
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
            Every detail is created to make your stay feel calm, effortless and
            deeply comfortable.
          </h2>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-12 max-w-2xl text-sm leading-8 text-white/55 md:text-base">
            From the indoor salt water pool to the intimate adults-only
            atmosphere, Sunshine Resort offers facilities designed around
            privacy, relaxation and quiet moments in nature.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}