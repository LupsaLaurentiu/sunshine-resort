import Link from "next/link";
import { FadeIn } from "../animations/FadeIn";

const apartments = [
  {
    title: "Deluxe Apartment",
    description:
      "Elegant interiors, generous space and carefully selected materials designed for complete comfort.",
    image: "/images/apps-1.jpg",
  },
  {
    title: "Premium Apartment",
    description:
      "Natural textures, warm lighting and peaceful surroundings create a refined adults-only experience.",
    image: "/images/apps-2.jpg",
  },
];

export function ApartmentsSection() {
  return (
    <section className="bg-[#050505] py-44 text-[#f5f2eb]">
      <div className="mx-auto max-w-[1380px] px-8">
        <div className="mb-28 text-center">
          <FadeIn>
            <p className="mb-4 text-xs uppercase tracking-[0.45em] text-gold">
              Accommodation
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-6xl font-light md:text-7xl">
              Only eight apartments.
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mx-auto mt-8 max-w-2xl text-white/60">
              Designed for guests who appreciate intimacy, silence and premium
              hospitality.
            </p>
          </FadeIn>
        </div>

        <div className="space-y-40">
          {apartments.map((room, index) => (
            <div
              key={room.title}
              className={`grid items-center gap-20 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <FadeIn delay={0.1}>
                <div
                  className="aspect-[4/5] bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${room.image}')`,
                  }}
                />
              </FadeIn>

              <FadeIn delay={0.25}>
                <div className="max-w-xl">
                  <h3 className="heading text-5xl font-light">{room.title}</h3>

                  <p className="mt-8 leading-8 text-white/60">
                    {room.description}
                  </p>

                  <Link
                    href="/ro/rooms"
                    className="mt-10 inline-block border border-gold px-8 py-4 text-xs uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-black"
                  >
                    Explore Apartment
                  </Link>
                </div>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}