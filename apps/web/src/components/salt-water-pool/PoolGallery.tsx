import { FadeIn } from "@/components/animations/FadeIn";

const images = [
  "/images/pool-gallery-1.jpg",
  "/images/pool-gallery-2.jpg",
  "/images/pool-gallery-3.jpg",
];

export function PoolGallery() {
  return (
    <section className="bg-[#0b0b0b] px-8 py-44 text-[#f5f2eb]">
      <div className="mx-auto grid max-w-[1380px] gap-8 lg:grid-cols-[1.05fr_.8fr_.95fr]">
        {images.map((image, index) => (
          <FadeIn key={image} delay={index * 0.1}>
            <div
              className={`bg-cover bg-center ${
                index === 0
                  ? "h-[700px]"
                  : index === 1
                  ? "mt-16 h-[520px]"
                  : "mt-6 h-[620px]"
              }`}
              style={{ backgroundImage: `url('${image}')` }}
            />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}