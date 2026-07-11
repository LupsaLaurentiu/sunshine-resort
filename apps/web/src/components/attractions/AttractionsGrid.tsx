import { FadeIn } from "@/components/animations/FadeIn";

const attractions = [
  "Ocna Șugatag",
  "Lacurile sărate",
  "Bârsana Monastery",
  "Merry Cemetery",
  "Mocănița",
  "Traditional Villages",
  "Wooden Churches",
  "Mountain Roads",
];

export function AttractionsGrid() {
  return (
    <section className="bg-[#0b0b0b] px-8 py-44 text-[#f5f2eb]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-20 text-center">
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
              Nearby Experiences
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light md:text-7xl">
              Places worth discovering.
            </h2>
          </FadeIn>
        </div>

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
          {attractions.map((item, index) => (
            <FadeIn key={item} delay={index * 0.04}>
              <div className="bg-[#0b0b0b] px-8 py-10 text-center text-xs uppercase tracking-[0.25em] text-white/65 transition hover:text-gold">
                {item}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}