import Link from "next/link";
import { FadeIn } from "../animations/FadeIn";

export function BookingCTASection() {
  return (
    <section className="bg-[#050505] px-8 py-52 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-gold">
            Sunshine Resort
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-6xl font-light leading-tight md:text-8xl">
            Your next
            <br />
            escape starts here.
          </h2>
        </FadeIn>

        <FadeIn delay={0.35}>
          <Link
            href="/ro/book"
            className="mt-16 inline-block bg-gold px-14 py-5 text-xs font-semibold uppercase tracking-[0.35em] text-black transition duration-300 hover:bg-white"
          >
            Reserve Your Stay
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}