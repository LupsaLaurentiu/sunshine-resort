import { FadeIn } from "../animations/FadeIn";

export function RoomIntro() {
  return (
    <section className="bg-[#050505] px-8 py-40 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
            Only Eight Apartments
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
            Every stay is shaped around privacy, silence and understated luxury.
          </h2>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/55 md:text-base">
            Sunshine Resort offers an intimate collection of apartments, each
            designed to create a calm and elegant retreat for adults.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}