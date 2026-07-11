import { FadeIn } from "@/components/animations/FadeIn";

export function SlowLuxurySection() {
  return (
    <section className="grid min-h-screen bg-[#0b0b0b] text-[#f5f2eb] lg:grid-cols-2">
      <FadeIn>
        <div
          className="min-h-[620px] bg-cover bg-center lg:min-h-screen"
          style={{ backgroundImage: "url('/images/about-slow.webp')" }}
        />
      </FadeIn>

      <div className="flex items-center px-8 py-32 lg:px-20">
        <div className="max-w-xl">
          <FadeIn>
            <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
              The Art of Slow Luxury
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
              Luxury is no longer measured by excess.
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-10 text-sm leading-8 text-white/55 md:text-base">
              It is found in quiet mornings, warm light entering the room, the
              scent of nature after rain and conversations that never need to
              hurry.
            </p>
          </FadeIn>

          <FadeIn delay={0.45}>
            <p className="mt-8 text-sm leading-8 text-white/55 md:text-base">
              Sunshine Resort embraces a slower rhythm, where every detail has
              been thoughtfully designed to create space for rest, privacy and
              meaningful experiences.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}