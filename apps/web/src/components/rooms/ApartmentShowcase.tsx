import Link from "next/link";
import { FadeIn } from "../animations/FadeIn";

type ApartmentShowcaseProps = {
  title: string;
  description: string;
  image: string;
  href: string;
  reverse?: boolean;
  details: string[];
};

export function ApartmentShowcase({
  title,
  description,
  image,
  href,
  reverse = false,
  details,
}: ApartmentShowcaseProps) {
  return (
    <section className="bg-[#050505] px-8 py-28 text-[#f5f2eb]">
      <div
        className={`mx-auto grid max-w-[1380px] items-center gap-20 lg:grid-cols-2 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <FadeIn>
          <div
            className="min-h-[680px] bg-cover bg-center"
            style={{ backgroundImage: `url('${image}')` }}
          />
        </FadeIn>

        <div className="max-w-xl">
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-gold">
              Sunshine Resort
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light md:text-7xl">{title}</h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-8 text-sm leading-8 text-white/60 md:text-base">
              {description}
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-10 grid gap-4 border-y border-white/10 py-8 text-xs uppercase tracking-[0.25em] text-white/55 sm:grid-cols-2">
              {details.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <Link
              href={href}
              className="mt-10 inline-block border border-gold px-10 py-4 text-xs uppercase tracking-[0.3em] text-gold transition duration-300 hover:bg-gold hover:text-black"
            >
              Discover Apartment
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}