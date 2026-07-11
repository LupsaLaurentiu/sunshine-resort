import { FadeIn } from "@/components/animations/FadeIn";

export function GalleryIntro() {
  return (
    <section className="bg-[#050505] px-8 py-40 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-8 text-xs uppercase tracking-[0.5em] text-gold">
            Visual Story
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
            A quiet collection of textures, light, nature and slow luxury.
          </h2>
        </FadeIn>
      </div>
    </section>
  );
}