"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminHeader() {
  const router = useRouter();

  const {
    admin,
    logout,
  } = useAdminAuth();

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <header className="border-b border-white/10 bg-[#050505]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-8 px-6 py-6 md:px-10">
        <div className="flex items-center gap-5">
          <Image
            src="/logo-sunshine.png"
            alt="Sunshine Resort"
            width={90}
            height={54}
            priority
            className="h-auto w-[72px]"
          />

          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-gold">
              Sunshine Resort
            </p>

            <p className="heading mt-1 text-2xl font-light">
              Administration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {admin && (
            <div className="hidden text-right sm:block">
              <p className="text-sm text-white/85">
                {admin.firstName}{" "}
                {admin.lastName}
              </p>

              <p className="mt-1 text-xs text-white/35">
                {admin.email}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Deconectare"
            className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/55 transition hover:border-gold hover:text-gold"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}