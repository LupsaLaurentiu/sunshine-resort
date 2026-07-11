import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#050505] px-8 py-16 text-[#f5f0e8]">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Image
            src="/logo-sunshine.png"
            alt="Sunshine Resort"
            width={220}
            height={120}
            className="mb-6 h-auto w-[180px] brightness-0 invert"
          />

          <p className="max-w-sm text-sm leading-7 text-white/60">
            Adults-only boutique resort, creat pentru relaxare, romantism și
            confort premium în mijlocul naturii.
          </p>
        </div>

        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#d6b25e]">
            Resort
          </h3>

          <ul className="space-y-3 text-sm text-white/60">
            <li>
              <Link href="/ro/rooms">Camere</Link>
            </li>
            <li>
              <Link href="/ro/facilities">Facilități</Link>
            </li>
            <li>
              <Link href="/ro/salt-water-pool">Piscină cu apă sărată</Link>
            </li>
            <li>
              <Link href="/ro/gallery">Galerie</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#d6b25e]">
            Info
          </h3>

          <ul className="space-y-3 text-sm text-white/60">
            <li>
              <Link href="/ro/about">Despre noi</Link>
            </li>
            <li>
              <Link href="/ro/attractions">Atracții turistice</Link>
            </li>
            <li>
              <Link href="/ro/contact">Contact</Link>
            </li>
            <li>
              <Link href="/ro/book">Rezervă acum</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#d6b25e]">
            Legal
          </h3>

          <ul className="space-y-3 text-sm text-white/60">
            <li>
              <Link href="/ro/gdpr">GDPR</Link>
            </li>
            <li>
              <Link href="/ro/terms">Termeni și condiții</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl justify-between border-t border-white/10 pt-6 text-xs uppercase tracking-[0.25em] text-white/40">
        <span>© Sunshine Resort</span>
        <span>Adults Only</span>
      </div>
    </footer>
  );
}