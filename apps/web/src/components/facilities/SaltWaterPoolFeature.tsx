import { FadeIn } from "@/components/animations/FadeIn";

export function SaltWaterPoolFeature() {
  return (
    <section className="relative h-screen overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/pool-salt.jpg')" }}
      />

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />

      <div className="relative z-10 flex h-full items-center px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <FadeIn>
              <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
                Indoor Salt Water Pool
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="heading text-5xl font-light leading-tight md:text-8xl">
                Warm water.
                <br />
                Quiet atmosphere.
              </h2>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-10 max-w-xl text-sm leading-8 text-white/70 md:text-base">
                A peaceful wellness space created for every season, where salt
                water, warmth and silence become part of the experience.
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}