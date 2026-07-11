import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";

export function AboutCTA() {
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
            Slow down.
            <br />
            Stay longer.
          </h2>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/55">
            Some places are visited. Others are remembered.
          </p>
        </FadeIn>

        <FadeIn delay={0.5}>
          <Link
            href="/ro/book"
            className="mt-14 inline-block bg-gold px-14 py-5 text-xs font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-white"
          >
            Reserve Your Stay
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}