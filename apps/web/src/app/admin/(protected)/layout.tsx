"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    isInitialized,
    isAuthenticated,
  } = useAdminAuth();

  useEffect(() => {
    if (
      isInitialized &&
      !isAuthenticated
    ) {
      router.replace("/admin/login");
    }
  }, [
    isAuthenticated,
    isInitialized,
    router,
  ]);

  if (
    !isInitialized ||
    !isAuthenticated
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-gold border-t-transparent" />

          <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/40">
            Se verifică accesul
          </p>
        </div>
      </main>
    );
  }

  return children;
}