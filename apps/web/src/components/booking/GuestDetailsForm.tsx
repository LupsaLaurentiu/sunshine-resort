"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  getLocaleFromPathname,
  getPublicHref,
} from "@/lib/public-routes";

export type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  acceptedTerms: boolean;
};

type GuestDetailsFormProps = {
  guest: GuestDetails;

  onChange: (
    guest: GuestDetails,
  ) => void;
};

const GUEST_DETAILS_CONTENT = {
  ro: {
    eyebrow:
      "Datele oaspetelui",

    title:
      "Spune-ne câteva lucruri despre tine.",

    description:
      "Completează datele de contact ale persoanei responsabile pentru rezervare.",

    firstNameLabel:
      "Prenume",

    firstNamePlaceholder:
      "Prenumele tău",

    lastNameLabel:
      "Nume",

    lastNamePlaceholder:
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
      "Mesaj sau solicitări speciale",

    messagePlaceholder:
      "Spune-ne dacă există detalii importante pentru sejurul tău.",

    termsPrefix:
      "Am citit și accept",

    terms:
      "termenii și condițiile",

    privacyConnector:
      "și",

    privacy:
      "politica de confidențialitate",

    bookingConditions:
      "aplicabile rezervării.",
  },

  en: {
    eyebrow:
      "Guest details",

    title:
      "Tell us a little about yourself.",

    description:
      "Enter the contact details of the person responsible for the booking.",

    firstNameLabel:
      "First name",

    firstNamePlaceholder:
      "Your first name",

    lastNameLabel:
      "Last name",

    lastNamePlaceholder:
      "Your last name",

    emailLabel:
      "Email",

    emailPlaceholder:
      "name@email.com",

    phoneLabel:
      "Phone",

    phonePlaceholder:
      "+40 700 000 000",

    messageLabel:
      "Message or special requests",

    messagePlaceholder:
      "Let us know if there are any important details about your stay.",

    termsPrefix:
      "I have read and accept the",

    terms:
      "terms and conditions",

    privacyConnector:
      "and",

    privacy:
      "privacy policy",

    bookingConditions:
      "applicable to this booking.",
  },
} as const;

export function GuestDetailsForm({
  guest,
  onChange,
}: GuestDetailsFormProps) {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    GUEST_DETAILS_CONTENT[
      locale
    ];

  const termsHref =
    getPublicHref(
      "terms",
      locale,
    );

  const privacyHref =
    getPublicHref(
      "privacyPolicy",
      locale,
    );

  function updateField<
    K extends keyof GuestDetails,
  >(
    field: K,
    value: GuestDetails[K],
  ) {
    onChange({
      ...guest,
      [field]: value,
    });
  }

  const inputClassName =
    "mt-2 w-full border-b border-white/20 bg-transparent py-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/25 focus:border-gold sm:text-[15px]";

  const labelClassName =
    "block text-[9px] font-medium uppercase tracking-[0.32em] text-white/45 transition duration-300 group-focus-within:text-gold sm:text-[10px]";

  return (
    <section
      aria-labelledby="guest-details-title"
      className="relative overflow-hidden border border-white/10 bg-[#0b0b0b] p-6 text-[#f5f2eb] sm:p-8 md:p-10"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full bg-gold/[0.02] blur-3xl" />

      <div className="relative">
        <p className="text-[9px] font-medium uppercase tracking-[0.45em] text-gold sm:text-[10px] md:text-xs">
          {content.eyebrow}
        </p>

        <h2
          id="guest-details-title"
          className="heading mt-5 text-4xl font-light leading-[1.05] tracking-[-0.015em] sm:text-5xl"
        >
          {content.title}
        </h2>

        <p className="mt-5 max-w-2xl text-sm leading-8 text-white/45 sm:text-[15px]">
          {content.description}
        </p>

        <div className="mt-10 grid gap-x-8 gap-y-7 md:grid-cols-2">
          <div className="group">
            <label
              htmlFor="booking-first-name"
              className={labelClassName}
            >
              {content.firstNameLabel}
            </label>

            <input
              id="booking-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={
                guest.firstName
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "firstName",
                  event.target
                    .value,
                )
              }
              placeholder={
                content.firstNamePlaceholder
              }
              className={
                inputClassName
              }
            />
          </div>

          <div className="group">
            <label
              htmlFor="booking-last-name"
              className={labelClassName}
            >
              {content.lastNameLabel}
            </label>

            <input
              id="booking-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={
                guest.lastName
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "lastName",
                  event.target
                    .value,
                )
              }
              placeholder={
                content.lastNamePlaceholder
              }
              className={
                inputClassName
              }
            />
          </div>

          <div className="group">
            <label
              htmlFor="booking-email"
              className={labelClassName}
            >
              {content.emailLabel}
            </label>

            <input
              id="booking-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={
                guest.email
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "email",
                  event.target
                    .value,
                )
              }
              placeholder={
                content.emailPlaceholder
              }
              className={
                inputClassName
              }
            />
          </div>

          <div className="group">
            <label
              htmlFor="booking-phone"
              className={labelClassName}
            >
              {content.phoneLabel}
            </label>

            <input
              id="booking-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              value={
                guest.phone
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "phone",
                  event.target
                    .value,
                )
              }
              placeholder={
                content.phonePlaceholder
              }
              className={
                inputClassName
              }
            />
          </div>
        </div>

        <div className="group mt-8">
          <label
            htmlFor="booking-message"
            className={
              labelClassName
            }
          >
            {
              content.messageLabel
            }
          </label>

          <textarea
            id="booking-message"
            name="message"
            rows={5}
            value={
              guest.message
            }
            onChange={(
              event,
            ) =>
              updateField(
                "message",
                event.target
                  .value,
              )
            }
            placeholder={
              content.messagePlaceholder
            }
            className={`${inputClassName} min-h-36 resize-y leading-8`}
          />
        </div>

        <label
          htmlFor="booking-terms"
          className="group mt-9 flex cursor-pointer items-start gap-4 pt-7"
        >
          <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              id="booking-terms"
              name="acceptedTerms"
              type="checkbox"
              required
              checked={
                guest.acceptedTerms
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "acceptedTerms",
                  event.target
                    .checked,
                )
              }
              className="peer h-5 w-5 cursor-pointer appearance-none border border-white/25 bg-transparent transition duration-300 checked:border-gold checked:bg-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            />

            <span className="pointer-events-none absolute h-2 w-1 rotate-45 border-b border-r border-black opacity-0 transition peer-checked:opacity-100" />
          </span>

          <span className="text-xs leading-7 text-white/45 sm:text-[13px]">
            {
              content.termsPrefix
            }{" "}

            <Link
              href={
                termsHref
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/75 underline decoration-white/20 underline-offset-4 transition duration-300 hover:text-gold hover:decoration-gold/50"
            >
              {
                content.terms
              }
            </Link>{" "}

            {
              content.privacyConnector
            }{" "}

            <Link
              href={
                privacyHref
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/75 underline decoration-white/20 underline-offset-4 transition duration-300 hover:text-gold hover:decoration-gold/50"
            >
              {
                content.privacy
              }
            </Link>{" "}

            {
              content.bookingConditions
            }
          </span>
        </label>
      </div>
    </section>
  );
}