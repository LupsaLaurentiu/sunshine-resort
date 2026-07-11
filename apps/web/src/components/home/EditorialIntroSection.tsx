import { FadeIn } from "../animations/FadeIn";

export function EditorialIntroSection() {
  return (
    <section className="bg-[#050505] px-8 py-44 text-[#f5f2eb]">
      <div className="mx-auto max-w-6xl text-center">
        <FadeIn>
          <p className="mb-10 text-xs uppercase tracking-[0.5em] text-gold">
            Adults-Only Boutique Resort
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
            A quiet escape shaped by nature, intimacy and the slow rhythm of
            premium hospitality.
          </h2>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-12 max-w-2xl text-sm leading-8 text-white/50 md:text-base">
            Sunshine Resort is designed for adults seeking silence, comfort and
            romantic moments away from the noise of everyday life.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}