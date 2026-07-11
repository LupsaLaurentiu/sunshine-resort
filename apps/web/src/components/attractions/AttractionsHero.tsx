import Image from "next/image";
import { FadeIn } from "@/components/animations/FadeIn";

export function AttractionsHero() {
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden px-8 text-center text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/ogna-sugatag-3.png')" }}
      />

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />

      <Image
        src="/logo-sunshine.png"
        alt="Sunshine Resort"
        width={150}
        height={90}
        priority
        className="absolute left-1/2 top-8 z-20 h-auto w-[125px] -translate-x-1/2 md:w-[150px] brightness-0 invert"
      />

      <div className="relative z-10 max-w-5xl pt-16">
        <FadeIn>
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
            Attractions
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 className="heading text-6xl font-light leading-tight md:text-8xl">
            Discover Maramureș.
          </h1>
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