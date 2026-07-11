"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 top-0 z-[300] w-full px-8 py-7 text-white">
        <div className="relative flex items-center justify-between">
          <button
            type="button"
            onClick={() =>{ 
                setIsMenuOpen(true);}
            }
            className="relative z-[301] flex h-10 w-10 items-center justify-center"
          >
            <Menu className="h-8 w-8 stroke-[1.4]" />
          </button>

          <div className="flex items-center gap-6 text-xs uppercase tracking-[0.3em]">
            <div className="flex gap-2">
              <Link href="/ro" className="text-gold">
                RO
              </Link>
              <span>/</span>
              <Link href="/en">EN</Link>
            </div>

            <span className="h-5 w-px bg-white/40" />

            <Link href="/ro/book" className="text-gold">
              Book
            </Link>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}