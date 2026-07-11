import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";

export function HomeHero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-mockup.jpg')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

      <Link
        href="/ro"
        className="absolute left-1/2 top-8 z-20 -translate-x-1/2"
      >
        <Image
          src="/logo-sunshine.png"
          alt="Sunshine Resort"
          width={150}
          height={90}
          priority
          className="h-auto w-[125px] md:w-[150px]"
        />
      </Link>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-16 text-center text-white">
        <FadeIn delay={0.15}>
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.55em] text-gold md:text-sm">
            Adults Only
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <h1 className="heading text-5xl font-light uppercase tracking-[0.18em] md:text-7xl xl:text-8xl">
            Sunshine Resort
          </h1>
        </FadeIn>

        <FadeIn delay={0.45}>
          <div className="my-8 h-px w-32 bg-gold" />
        </FadeIn>

        <FadeIn delay={0.6}>
          <p className="mb-10 text-xs uppercase tracking-[0.4em] text-white/85 md:text-base">
            Boutique Escape in Nature
          </p>
        </FadeIn>

        <FadeIn delay={0.75}>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/ro/about"
              className="min-w-[170px] border border-gold bg-black/10 px-10 py-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition duration-300 hover:bg-gold hover:text-black"
            >
              Discover
            </Link>

            <Link
              href="/ro/book"
              className="min-w-[170px] border border-gold bg-gold px-10 py-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-black transition duration-300 hover:border-white hover:bg-white"
            >
              Book Now
            </Link>
          </div>
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