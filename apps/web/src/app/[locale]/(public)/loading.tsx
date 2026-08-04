import Image from "next/image";

export default function PublicLoading() {
  return (
    <div
      role="status"
      aria-label="Pagina se încarcă"
      className="fixed inset-0 z-[850] flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] text-[#f5f2eb]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,165,92,0.07),transparent_42%)]" />

        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]" />

        <div className="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <div className="animate-[sunshine-loader-logo_1s_cubic-bezier(0.22,1,0.36,1)_both]">
          <Image
            src="/logo-sunshine.png"
            alt="Sunshine Resort"
            width={190}
            height={130}
            priority
            style={{
                width: "165px",
                height: "auto",
            }}
            className="brightness-0 invert"
            />
        </div>

        <p className="mt-8 animate-[sunshine-loader-content_0.8s_0.12s_cubic-bezier(0.22,1,0.36,1)_both] text-[9px] uppercase tracking-[0.5em] text-gold">
          Sunshine Resort
        </p>

        <p className="mt-4 animate-[sunshine-loader-content_0.8s_0.18s_cubic-bezier(0.22,1,0.36,1)_both] text-[9px] uppercase tracking-[0.34em] text-white/35">
          Adults Only Boutique Escape
        </p>

        <div className="mt-9 h-px w-36 overflow-hidden bg-white/10">
          <div className="h-full w-[45%] animate-[sunshine-loading-line_1.25s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gold" />
        </div>

        <p className="mt-5 text-[8px] uppercase tracking-[0.34em] text-white/20">
          Se încarcă
        </p>
      </div>
    </div>
  );
}