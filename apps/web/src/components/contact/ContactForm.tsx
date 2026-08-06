"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Check,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

const CONTACT_FORM_CONTENT = {
  ro: {
    nameLabel:
      "Nume",

    namePlaceholder:
      "Numele tău",

    emailLabel:
      "Email",

    emailPlaceholder:
      "adresa@email.ro",

    phoneLabel:
      "Telefon",

    phonePlaceholder:
      "+40 700 000 000",

    messageLabel:
      "Mesaj",

    messagePlaceholder:
      "Cum te putem ajuta?",

    submit:
      "Trimite mesajul",

    successTitle:
      "Mesajul a fost pregătit.",

    successDescription:
      "Integrarea pentru trimiterea mesajelor va fi conectată ulterior.",

    formAriaLabel:
      "Formular de contact Sunshine Resort",
  },

  en: {
    nameLabel:
      "Name",

    namePlaceholder:
      "Your name",

    emailLabel:
      "Email",

    emailPlaceholder:
      "name@email.com",

    phoneLabel:
      "Phone",

    phonePlaceholder:
      "+40 700 000 000",

    messageLabel:
      "Message",

    messagePlaceholder:
      "How can we help?",

    submit:
      "Send message",

    successTitle:
      "Your message has been prepared.",

    successDescription:
      "The message delivery integration will be connected later.",

    formAriaLabel:
      "Sunshine Resort contact form",
  },
} as const;

export function ContactForm() {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    CONTACT_FORM_CONTENT[
      locale
    ];

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitted(
      true,
    );
  }

  return (
    <form
      aria-label={
        content.formAriaLabel
      }
      onSubmit={
        handleSubmit
      }
      className="w-full"
    >
      <div className="space-y-7">
        <div className="group">
          <label
            htmlFor="contact-name"
            className="block text-[9px] font-medium uppercase tracking-[0.32em] text-white/45 transition duration-300 group-focus-within:text-gold sm:text-[10px]"
          >
            {content.nameLabel}
          </label>

          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder={
              content.namePlaceholder
            }
            className="mt-2 w-full border-b border-white/20 bg-transparent py-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/25 focus:border-gold sm:text-[15px]"
          />
        </div>

        <div className="group">
          <label
            htmlFor="contact-email"
            className="block text-[9px] font-medium uppercase tracking-[0.32em] text-white/45 transition duration-300 group-focus-within:text-gold sm:text-[10px]"
          >
            {content.emailLabel}
          </label>

          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={
              content.emailPlaceholder
            }
            className="mt-2 w-full border-b border-white/20 bg-transparent py-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/25 focus:border-gold sm:text-[15px]"
          />
        </div>

        <div className="group">
          <label
            htmlFor="contact-phone"
            className="block text-[9px] font-medium uppercase tracking-[0.32em] text-white/45 transition duration-300 group-focus-within:text-gold sm:text-[10px]"
          >
            {content.phoneLabel}
          </label>

          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={
              content.phonePlaceholder
            }
            className="mt-2 w-full border-b border-white/20 bg-transparent py-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/25 focus:border-gold sm:text-[15px]"
          />
        </div>

        <div className="group">
          <label
            htmlFor="contact-message"
            className="block text-[9px] font-medium uppercase tracking-[0.32em] text-white/45 transition duration-300 group-focus-within:text-gold sm:text-[10px]"
          >
            {content.messageLabel}
          </label>

          <textarea
            id="contact-message"
            name="message"
            required
            rows={6}
            placeholder={
              content.messagePlaceholder
            }
            className="mt-2 min-h-40 w-full resize-y border-b border-white/20 bg-transparent py-4 text-sm leading-8 text-white outline-none transition duration-300 placeholder:text-white/25 focus:border-gold sm:text-[15px]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="group mt-9 inline-flex min-h-14 items-center justify-center gap-4 border border-gold bg-gold px-10 py-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-black transition duration-500 hover:border-white hover:bg-white sm:px-12 sm:text-[10px]"
      >
        {content.submit}

        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
      </button>

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="mt-8 flex max-w-lg items-start gap-4 border-l border-gold/70 pl-5"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-gold">
            <Check className="h-4 w-4 stroke-[1.5]" />
          </span>

          <div>
            <p className="text-sm text-gold">
              {
                content.successTitle
              }
            </p>

            <p className="mt-2 text-xs leading-7 text-white/40">
              {
                content.successDescription
              }
            </p>
          </div>
        </div>
      )}
    </form>
  );
}