import Link from "next/link";
import { FadeIn } from "../animations/FadeIn";

export function RoomCTA() {
  return (
    <section className="bg-[#050505] px-8 py-48 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
            Book your stay
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-6xl font-light leading-tight md:text-8xl">
            Choose your apartment.
            <br />
            Begin your escape.
          </h2>
        </FadeIn>

        <FadeIn delay={0.35}>
          <Link
            href="/ro/book"
            className="mt-14 inline-block bg-gold px-14 py-5 text-xs font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-white"
          >
            Reserve Now
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}