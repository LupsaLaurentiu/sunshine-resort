import { FadeIn } from "@/components/animations/FadeIn";

const facilities = [
  "Indoor salt water pool",
  "Adults only",
  "Private parking",
  "Free Wi-Fi",
  "Smart TV",
  "Kitchen area",
  "Coffee station",
  "Bar under the stairs",
  "Premium bathroom",
  "Quiet natural setting",
  "Mountain atmosphere",
  "Romantic stays",
];

export function FacilitiesGrid() {
  return (
    <section className="bg-[#0b0b0b] px-8 py-44 text-[#f5f2eb]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-20 text-center">
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
              Included Facilities
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light md:text-7xl">
              Everything you need.
              <br />
              Nothing unnecessary.
            </h2>
          </FadeIn>
        </div>

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {facilities.map((item, index) => (
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