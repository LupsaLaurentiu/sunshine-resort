"use client";

import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-6"
    >
      <input className="w-full border-b border-white/20 bg-transparent py-4 text-sm outline-none placeholder:text-white/35 focus:border-gold" placeholder="Name" required />
      <input className="w-full border-b border-white/20 bg-transparent py-4 text-sm outline-none placeholder:text-white/35 focus:border-gold" placeholder="Email" type="email" required />
      <input className="w-full border-b border-white/20 bg-transparent py-4 text-sm outline-none placeholder:text-white/35 focus:border-gold" placeholder="Phone" />
      <textarea className="min-h-40 w-full border-b border-white/20 bg-transparent py-4 text-sm outline-none placeholder:text-white/35 focus:border-gold" placeholder="Message" required />

      <button className="bg-gold px-12 py-5 text-xs font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-white">
        Send Message
      </button>

      {sent && (
        <p className="text-sm text-gold">
          Message prepared. Email integration will be connected later.
        </p>
      )}
    </form>
  );
}