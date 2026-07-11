"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { motion } from "framer-motion";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

const links = [
  { label: "Acasă", href: "/ro" },
  { label: "Camere", href: "/ro/rooms" },
  { label: "Facilități", href: "/ro/facilities" },
  { label: "Piscină cu apă sărată", href: "/ro/salt-water-pool" },
  { label: "Atracții turistice", href: "/ro/attractions" },
  { label: "Galerie", href: "/ro/gallery" },
  { label: "Despre noi", href: "/ro/about" },
  { label: "Contact", href: "/ro/contact" },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] overflow-hidden bg-[#050505]/95 text-[#f5f2eb] backdrop-blur-xl"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('/hero-mockup.jpg')" }}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute left-8 top-8 z-20 flex h-10 w-10 items-center justify-center text-white/80 transition hover:text-gold"
      >
        <X className="h-8 w-8 stroke-[1.2]" />
      </button>

      <div className="absolute right-8 top-9 z-20 flex items-center gap-6 text-xs uppercase tracking-[0.3em]">
        <Link href="/ro" className="text-gold" onClick={onClose}>
          RO
        </Link>
        <span className="text-white/40">/</span>
        <Link href="/en" onClick={onClose}>
          EN
        </Link>
        <span className="h-5 w-px bg-white/30" />
        <Link href="/ro/book" className="text-gold" onClick={onClose}>
          Book
        </Link>
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex justify-center pt-10">
          <Image
            src="/logo-sunshine.png"
            alt="Sunshine Resort"
            width={130}
            height={90}
            className="h-auto w-[115px] opacity-90"
          />
        </div>

        <nav className="flex flex-1 items-center justify-center px-8">
          <ul className="space-y-2 text-center">
            {links.map((link, index) => (
              <motion.li
                key={link.href}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.045 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="group relative inline-block heading text-4xl font-light uppercase tracking-[0.18em] text-white/75 transition duration-300 hover:text-gold md:text-6xl"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-gold transition-all duration-500 group-hover:w-full" />
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-3 px-8 pb-8 text-xs uppercase tracking-[0.25em] text-white/40">
          <div>
            <p className="text-gold">Sunshine Resort</p>
            <p className="mt-2">Adults Only</p>
          </div>

          <div className="text-center">
            <p>România</p>
            <p className="mt-2">Boutique Escape</p>
          </div>

          <div className="text-right">
            <p>Instagram</p>
            <p className="mt-2">Facebook</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}