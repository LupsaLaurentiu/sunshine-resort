import Link from "next/link";
import { FadeIn } from "../animations/FadeIn";

export function ResortExperienceSection() {
  return (
    <section className="grid min-h-screen bg-[#0b0b0b] text-[#f5f2eb] lg:grid-cols-[1.1fr_0.9fr]">
      <FadeIn>
        <div
          className="min-h-[620px] bg-cover bg-center lg:min-h-screen"
          style={{
            backgroundImage: "url('/images/apps-1.jpg')",
          }}
        />
      </FadeIn>

      <div className="flex items-center px-8 py-32 lg:px-20">
        <div className="max-w-xl">
          <FadeIn>
            <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
              The Resort
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
              Created for privacy, calm and refined comfort.
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-10 text-sm leading-8 text-white/50 md:text-base">
              With only eight apartments, Sunshine Resort offers an intimate
              adults-only atmosphere, where every detail is designed to feel
              quiet, personal and effortlessly elegant.
            </p>
          </FadeIn>

          <FadeIn delay={0.45}>
            <Link
              href="/ro/about"
              className="mt-12 inline-block border border-gold px-10 py-4 text-xs uppercase tracking-[0.3em] text-gold transition duration-300 hover:bg-gold hover:text-black"
            >
              Discover the Resort
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}