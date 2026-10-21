"use client";

import { TvResortSettings } from "./TvResortSettings";

import { ExportReservationsCard } from "./ExportReservationsCard";

export function AdminSettingsSection() {
  return (
    <section>
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
          Configuration
        </p>

        <h1 className="heading mt-4 text-5xl font-light md:text-7xl">
          Setări
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
          Configurează funcțiile administrative și informațiile folosite de
          sistemul TV Welcome al Sunshine Resort.
        </p>
      </div>

      <div className="mt-12 space-y-8">
        <ExportReservationsCard />

        <TvResortSettings />
      </div>
    </section>
  );
}
