import { FadeIn } from "../animations/FadeIn";

const amenities = [
  "Adults Only",
  "King Bed",
  "Smart TV",
  "Free Wi-Fi",
  "Coffee Station",
  "Private Parking",
  "Salt Water Pool Access",
  "Premium Bathroom",
];

export function RoomAmenities() {
  return (
    <section className="bg-[#0b0b0b] px-8 py-36 text-[#f5f2eb]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-20 text-center">
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
              Included
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light md:text-7xl">
              Room amenities
            </h2>
          </FadeIn>
        </div>

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
          {amenities.map((item, index) => (
            <FadeIn key={item} delay={index * 0.05}>
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