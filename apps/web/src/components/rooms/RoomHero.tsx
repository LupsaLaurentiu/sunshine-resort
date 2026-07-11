import Image from "next/image";
import { FadeIn } from "../animations/FadeIn";

export function RoomHero() {
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden px-8 text-center text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-mockup.jpg')" }}
      />

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />

      <Image
        src="/logo-sunshine.png"
        alt="Sunshine Resort"
        width={150}
        height={90}
        priority
        className="absolute left-1/2 top-8 z-20 h-auto w-[120px] -translate-x-1/2 md:w-[145px]"
      />

      <div className="relative z-10 max-w-5xl pt-20">
        <FadeIn>
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
            Accommodation
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 className="heading text-6xl font-light uppercase tracking-[0.18em] md:text-8xl">
            Rooms
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-white/70 md:text-base">
            Private apartments designed for slow mornings, quiet evenings and
            refined adults-only comfort.
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