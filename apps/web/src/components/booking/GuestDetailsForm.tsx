"use client";

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
  onChange: (guest: GuestDetails) => void;
};

export function GuestDetailsForm({
  guest,
  onChange,
}: GuestDetailsFormProps) {
  function updateField<K extends keyof GuestDetails>(
    field: K,
    value: GuestDetails[K],
  ) {
    onChange({
      ...guest,
      [field]: value,
    });
  }

  const inputClassName =
    "w-full border-b border-white/20 bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold";

  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-8 md:p-10">
      <p className="mb-4 text-xs uppercase tracking-[0.45em] text-gold">
        Guest Details
      </p>

      <h2 className="heading text-4xl font-light md:text-5xl">
        Tell us about yourself.
      </h2>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <input
          value={guest.firstName}
          onChange={(event) => updateField("firstName", event.target.value)}
          placeholder="First name"
          className={inputClassName}
        />

        <input
          value={guest.lastName}
          onChange={(event) => updateField("lastName", event.target.value)}
          placeholder="Last name"
          className={inputClassName}
        />

        <input
          type="email"
          value={guest.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="Email"
          className={inputClassName}
        />

        <input
          type="tel"
          value={guest.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          placeholder="Phone"
          className={inputClassName}
        />
      </div>

      <textarea
        value={guest.message}
        onChange={(event) => updateField("message", event.target.value)}
        placeholder="Special requests or message"
        className={`${inputClassName} mt-8 min-h-36 resize-none`}
      />

      <label className="mt-8 flex cursor-pointer items-start gap-4 text-sm leading-6 text-white/50">
        <input
          type="checkbox"
          checked={guest.acceptedTerms}
          onChange={(event) =>
            updateField("acceptedTerms", event.target.checked)
          }
          className="mt-1 h-4 w-4 accent-[#c9a65a]"
        />

        <span>
          I have read and accept the terms, privacy policy and booking
          conditions.
        </span>
      </label>
    </section>
  );
}