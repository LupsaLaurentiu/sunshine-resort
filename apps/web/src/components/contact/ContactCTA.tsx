import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";

export function ContactCTA() {
  return (
    <section className="bg-[#050505] px-8 py-52 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
            Sunshine Resort
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-6xl font-light leading-tight md:text-8xl">
            Ready to slow down?
          </h2>
        </FadeIn>

        <FadeIn delay={0.35}>
          <Link
            href="/ro/book"
            className="mt-14 inline-block bg-gold px-14 py-5 text-xs font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-white"
          >
            Reserve Your Stay
          </Link>
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