import { FadeIn } from "@/components/animations/FadeIn";

const benefits = [
  "Salt water",
  "Indoor pool",
  "All-season wellness",
  "Warm atmosphere",
  "Adults only",
  "Relaxation ritual",
];

export function PoolBenefits() {
  return (
    <section className="bg-[#050505] px-8 py-44 text-[#f5f2eb]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-20 text-center">
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
              Pool Benefits
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light md:text-7xl">
              A slower kind of wellness.
            </h2>
          </FadeIn>
        </div>

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {benefits.map((item, index) => (
            <FadeIn key={item} delay={index * 0.05}>
              <div className="bg-[#050505] px-8 py-10 text-center text-xs uppercase tracking-[0.25em] text-white/65 transition hover:text-gold">
                {item}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}