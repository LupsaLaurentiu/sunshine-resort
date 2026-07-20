"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLoginPage() {
  const router = useRouter();

  const {
    error,
    isInitialized,
    isAuthenticated,
    isLoading,
    login,
    clearError,
  } = useAdminAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  useEffect(() => {
    if (
      isInitialized &&
      isAuthenticated
    ) {
      router.replace("/admin");
    }
  }, [
    isAuthenticated,
    isInitialized,
    router,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const success = await login({
      email: email.trim(),
      password,
    });

    if (success) {
      router.replace("/admin");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f5f2eb]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/hero-mockup.jpg')",
        }}
      />

      <div className="absolute inset-0 bg-black/75" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-[#050505]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <Image
              src="/logo-sunshine.png"
              alt="Sunshine Resort"
              width={150}
              height={90}
              priority
              className="mx-auto h-auto w-[135px]"
            />

            <p className="mt-8 text-[10px] uppercase tracking-[0.45em] text-gold">
              Administration
            </p>

            <h1 className="heading mt-4 text-5xl font-light">
              Admin Login
            </h1>

            <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-white/45">
              Autentifică-te pentru a administra
              rezervările și operațiunile
              Sunshine Resort.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-white/10 bg-black/50 p-8 backdrop-blur-md md:p-10"
          >
            <div className="space-y-7">
              <label className="block">
                <span className="mb-3 block text-[10px] uppercase tracking-[0.35em] text-gold">
                  Email
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError();
                  }}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  placeholder="admin@sunshineresort.ro"
                  className="w-full border-b border-white/20 bg-transparent py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-3 block text-[10px] uppercase tracking-[0.35em] text-gold">
                  Parolă
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError();
                  }}
                  autoComplete="current-password"
                  minLength={8}
                  required
                  disabled={isLoading}
                  placeholder="Minimum 8 caractere"
                  className="w-full border-b border-white/20 bg-transparent py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-6 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-6 text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                isLoading ||
                !email.trim() ||
                password.length < 8
              }
              className="mt-8 w-full bg-gold px-8 py-5 text-xs font-semibold uppercase tracking-[0.32em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isLoading
                ? "Se autentifică..."
                : "Autentificare"}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-white/25">
            Sunshine Resort · Internal Access
          </p>
        </div>
      </section>
    </main>
  );
}