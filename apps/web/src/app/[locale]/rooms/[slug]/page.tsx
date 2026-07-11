import { notFound } from "next/navigation";
import Link from "next/link";
import { rooms } from "@/data/rooms";
import { FadeIn } from "@/components/animations/FadeIn";
import Image from "next/image";


type RoomDetailsPageProps = {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
};

export default async function RoomDetailsPage({
  params,
}: RoomDetailsPageProps) {
  const { slug, locale } = await params;
  const room = rooms.find((item) => item.slug === slug);

  if (!room) {
    notFound();
  }

  return (
    <main className="bg-[#050505] text-[#f5f2eb]">
      <section className="relative flex h-screen items-center justify-center overflow-hidden px-8 text-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${room.image}')` }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75" />

        <Image
            src="/logo-sunshine.png"
            alt="Sunshine Resort"
            width={150}
            height={90}
            priority
            className="absolute left-1/2 top-8 z-20 h-auto w-[120px] -translate-x-1/2 md:w-[145px]"
        />

        <div className="relative z-10 max-w-5xl">
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
              Sunshine Resort
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h1 className="heading text-6xl font-light uppercase tracking-[0.12em] md:text-8xl">
              {room.title}
            </h1>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-white/75 md:text-base">
              {room.shortDescription}
            </p>
          </FadeIn>
        </div>
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-center">
            <p className="mb-2 text-[10px] uppercase tracking-[0.4em] text-white/70">
                Scroll
            </p>
            <div className="mx-auto h-8 w-px bg-white/50" />
        </div>
      </section>

      <section className="px-8 py-36">
        <div className="mx-auto grid max-w-[1300px] gap-20 lg:grid-cols-[0.9fr_1.1fr]">
          <FadeIn>
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.45em] text-gold">
                Apartment Experience
              </p>

              <h2 className="heading text-5xl font-light md:text-7xl">
                Designed for privacy and comfort.
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div>
              <p className="text-base leading-9 text-white/60">
                {room.description}
              </p>

              <div className="mt-12 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
                {room.details.map((detail) => (
                  <div
                    key={detail}
                    className="bg-[#050505] px-6 py-6 text-xs uppercase tracking-[0.25em] text-white/65"
                  >
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="px-8 pb-36">
        <div className="mx-auto grid max-w-[1380px] gap-8 md:grid-cols-3">
          {room.gallery.map((image, index) => (
            <FadeIn key={image} delay={index * 0.12}>
              <div
                className="h-[520px] bg-cover bg-center"
                style={{ backgroundImage: `url('${image}')` }}
              />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-[#0b0b0b] px-8 py-36">
        <div className="mx-auto max-w-[1200px]">
          <FadeIn>
            <div className="mb-16 text-center">
              <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
                Included
              </p>
              <h2 className="heading text-5xl font-light md:text-7xl">
                Amenities
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
            {room.amenities.map((amenity, index) => (
              <FadeIn key={amenity} delay={index * 0.05}>
                <div className="bg-[#0b0b0b] px-8 py-10 text-center text-xs uppercase tracking-[0.25em] text-white/65">
                  {amenity}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-44 text-center">
        <FadeIn>
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
            Reserve
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h2 className="heading mx-auto max-w-4xl text-6xl font-light leading-tight md:text-8xl">
            Begin your stay at Sunshine Resort.
          </h2>
        </FadeIn>

        <FadeIn delay={0.35}>
          <Link
            href={`/${locale}/book`}
            className="mt-14 inline-block bg-gold px-14 py-5 text-xs font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-white"
          >
            Reserve Now
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}