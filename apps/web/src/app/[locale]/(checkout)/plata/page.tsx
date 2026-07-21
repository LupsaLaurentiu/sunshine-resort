import { Suspense } from "react";

import { PaymentPageClient } from "@/components/payment/PaymentPageClient";

function PaymentLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] text-[#f5f2eb]">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border border-gold border-t-transparent" />

        <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/40">
          Se încarcă...
        </p>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentPageClient />
    </Suspense>
  );
}