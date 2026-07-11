import { FadeIn } from "@/components/animations/FadeIn";

export function ContactLocation() {
  return (
    <section className="bg-[#050505] py-44 text-[#f5f2eb]">
      <div className="mx-auto max-w-[1380px] px-8">

        <div className="grid items-center gap-24 lg:grid-cols-[0.9fr_1.1fr]">

          <div>
            <FadeIn>
              <p className="mb-5 text-xs uppercase tracking-[0.5em] text-gold">
                Location
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
                Close to nature.
                <br />
                Away from noise.
              </h2>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-10 max-w-lg text-sm leading-8 text-white/55 md:text-base">
                Surrounded by forests, lakes and mountain landscapes,
                Sunshine Resort offers the perfect setting for slow mornings,
                quiet evenings and meaningful escapes.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <div
              className="aspect-[4/5] bg-cover bg-center"
              style={{
                backgroundImage: "url('/images/atractions-4.jpg')",
              }}
            />
          </FadeIn>

        </div>

        <FadeIn delay={0.4}>
          <div className="mt-32 overflow-hidden border border-white/10">

            <iframe
              src="https://www.google.com/maps?q=Ocna+Sugatag+Maramures&output=embed"
              className="h-[520px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

          </div>
        </FadeIn>

      </div>
    </section>
  );
}