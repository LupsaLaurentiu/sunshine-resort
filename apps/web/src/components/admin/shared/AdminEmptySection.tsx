type AdminEmptySectionProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function AdminEmptySection({
  eyebrow,
  title,
  description,
}: AdminEmptySectionProps) {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
        {eyebrow}
      </p>

      <h1 className="heading mt-4 text-5xl font-light md:text-7xl">
        {title}
      </h1>

      <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
        {description}
      </p>

      <div className="mt-12 border border-white/10 bg-[#0b0b0b] px-8 py-24 text-center">
        <p className="heading text-3xl font-light text-white/60">
          Secțiunea este pregătită.
        </p>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/35">
          Interfața și integrarea cu endpoint-urile
          backend vor fi implementate în etapa
          următoare.
        </p>
      </div>
    </section>
  );
}