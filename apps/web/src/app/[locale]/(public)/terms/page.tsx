type TermsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function TermsPage({
  params,
}: TermsPageProps) {
  const {
    locale,
  } = await params;

  const isEnglish =
    locale === "en";

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-32 text-[#f5f2eb] sm:px-8">
      <section className="mx-auto max-w-4xl">
        <p className="text-[10px] uppercase tracking-[0.45em] text-gold">
          Sunshine Resort
        </p>

        <h1 className="heading mt-6 text-5xl font-light leading-tight md:text-7xl">
          {isEnglish
            ? "Terms & Conditions"
            : "Termeni și condiții"}
        </h1>

        <div className="mt-8 h-px w-16 bg-gold/70" />

        <p className="mt-8 max-w-2xl text-sm leading-8 text-white/50 md:text-base">
          {isEnglish
            ? "The complete Sunshine Resort terms and conditions will be available here."
            : "Termenii și condițiile complete Sunshine Resort vor fi disponibile aici."}
        </p>
      </section>
    </main>
  );
}