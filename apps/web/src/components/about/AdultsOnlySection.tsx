import { FadeIn } from "@/components/animations/FadeIn";

export function AdultsOnlySection() {
  return (
    <section className="grid min-h-screen bg-[#0b0b0b] text-[#f5f2eb] lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex items-center px-8 py-32 lg:px-20">
        <div className="max-w-xl">
          <FadeIn>
            <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
              Adults Only
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
              A resort created for tranquility.
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-10 text-sm leading-8 text-white/55 md:text-base">
              Without crowds. Without noise. Simply space to unwind, reconnect
              and enjoy the quiet luxury of nature.
            </p>
          </FadeIn>
        </div>
      </div>

      <FadeIn delay={0.2}>
        <div
          className="min-h-[620px] bg-cover bg-center lg:min-h-screen"
          style={{ backgroundImage: "url('/images/about-adults.jpg')" }}
        />
      </FadeIn>
    </section>
  );
}