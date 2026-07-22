import Image from "next/image";

import { FadeIn } from "@/components/animations/FadeIn";

export function BookingHeader() {
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden px-6 text-center text-white md:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/hero-mockup.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-[#050505]" />

      <Image
        src="/logo-sunshine.png"
        alt="Sunshine Resort"
        width={150}
        height={90}
        priority
        className="absolute left-1/2 top-8 z-20 h-auto w-[125px] -translate-x-1/2 md:w-[150px]"
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <FadeIn>
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
            Reserve Your Stay
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 className="heading text-6xl font-light leading-tight md:text-8xl">
            Begin your escape.
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-white/70">
            Select your dates and preferred
            apartments. Every request is
            reviewed personally before
            confirmation.
          </p>
        </FadeIn>
      </div>

      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="mb-2 text-[10px] uppercase tracking-[0.4em] text-white/70">
          Scroll
        </p>

        <div className="mx-auto h-8 w-px bg-white/50" />
      </div>
    </section>
  );
}