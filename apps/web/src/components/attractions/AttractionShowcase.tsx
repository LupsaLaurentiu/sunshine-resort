import { FadeIn } from "@/components/animations/FadeIn";

type AttractionShowcaseProps = {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
};

export function AttractionShowcase({
  title,
  description,
  image,
  reverse = false,
}: AttractionShowcaseProps) {
  return (
    <section className="bg-[#050505] px-8 py-28 text-[#f5f2eb]">
      <div
        className={`mx-auto grid max-w-[1380px] items-center gap-20 lg:grid-cols-2 ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <FadeIn>
          <div
            className="min-h-[650px] bg-cover bg-center"
            style={{ backgroundImage: `url('${image}')` }}
          />
        </FadeIn>

        <div className="max-w-xl">
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-gold">
              Explore
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="heading text-5xl font-light md:text-7xl">
              {title}
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-8 text-sm leading-8 text-white/60 md:text-base">
              {description}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}