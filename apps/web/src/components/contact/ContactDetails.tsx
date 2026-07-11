import { FadeIn } from "@/components/animations/FadeIn";
import { ContactForm } from "./ContactForm";

export function ContactDetails() {
  return (
    <section className="bg-[#0b0b0b] px-8 py-44 text-[#f5f2eb]">
      <div className="mx-auto grid max-w-[1300px] gap-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <FadeIn>
            <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold">
              Contact Details
            </p>

            <h2 className="heading text-5xl font-light leading-tight md:text-7xl">
              Begin the conversation.
            </h2>
          </FadeIn>

          <div className="mt-14 space-y-8 text-sm leading-8 text-white/60">
            <p>
              <span className="text-gold">Email</span>
              <br />
              contact@sunshineresort.ro
            </p>

            <p>
              <span className="text-gold">Phone</span>
              <br />
              +40 700 000 000
            </p>

            <p>
              <span className="text-gold">Location</span>
              <br />
              România
            </p>
          </div>
        </div>

        <FadeIn delay={0.2}>
          <ContactForm />
        </FadeIn>
      </div>
    </section>
  );
}