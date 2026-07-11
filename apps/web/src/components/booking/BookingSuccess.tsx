import Link from "next/link";
import { Check } from "lucide-react";

export function BookingSuccess() {
  return (
    <section className="bg-[#050505] px-8 py-52 text-center text-[#f5f2eb]">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold text-gold">
          <Check className="h-9 w-9 stroke-[1.2]" />
        </div>

        <p className="mt-10 text-xs uppercase tracking-[0.45em] text-gold">
          Request Received
        </p>

        <h1 className="heading mt-6 text-6xl font-light leading-tight md:text-8xl">
          Your escape begins here.
        </h1>

        <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-white/55">
          Your request is now pending approval. After it is reviewed, you will
          receive a confirmation and secure payment link by email.
        </p>

        <Link
          href="/ro"
          className="mt-14 inline-block border border-gold px-12 py-5 text-xs uppercase tracking-[0.3em] text-gold transition hover:bg-gold hover:text-black"
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}