import { FadeIn } from "@/components/animations/FadeIn";

export function AttractionsIntro() {
  return (
    <section className="bg-[#050505] px-8 py-44 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
            Around Sunshine Resort
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
            Nature, tradition and quiet landscapes surround every stay.
          </h2>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-12 max-w-2xl text-sm leading-8 text-white/55 md:text-base">
            From wooden churches and traditional villages to lakes, forests and
            mountain roads, the region invites you to explore at a slower pace.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}