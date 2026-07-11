import { FadeIn } from "@/components/animations/FadeIn";

export function ContactIntro() {
  return (
    <section className="bg-[#050505] px-8 py-40 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
            Reach Us
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
            Whether you are planning a romantic escape or a quiet weekend away,
            we are here to help.
          </h2>
        </FadeIn>
      </div>
    </section>
  );
}