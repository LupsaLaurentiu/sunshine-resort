import { FadeIn } from "@/components/animations/FadeIn";

export function AboutPhilosophy() {
  return (
    <section className="bg-[#050505] px-8 py-52 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
            Our Philosophy
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-6xl font-light leading-tight md:text-8xl">
            Less noise.
            <br />
            More presence.
          </h2>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="mx-auto mt-12 max-w-2xl text-sm leading-8 text-white/55 md:text-base">
            We believe that true comfort begins where distractions end. Only
            eight apartments. Adults only. Spaces created for calm mornings,
            slow evenings and unforgettable moments shared together.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}