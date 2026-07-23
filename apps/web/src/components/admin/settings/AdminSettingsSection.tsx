"use client";

import {
  Monitor,
  Wifi,
} from "lucide-react";

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

        <TvWelcomePlaceholder />
      </div>
    </section>
  );
}

function TvWelcomePlaceholder() {
  return (
    <section className="border border-white/10 bg-[#0b0b0b]">
      <header className="flex flex-col gap-5 border-b border-white/10 px-6 py-6 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold/25 bg-gold/[0.06] text-gold">
            <Monitor className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
              TV Welcome
            </p>

            <h2 className="heading mt-2 text-3xl font-light">
              Mesajele televizoarelor
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
              Configurează mesajul de întâmpinare, informațiile Wi-Fi și
              programul de activare pentru televizoarele asociate
              apartamentelor.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 px-6 py-7 md:grid-cols-2 md:px-8 md:py-8 xl:grid-cols-4">
        <SettingPreviewCard
          icon={<Wifi className="h-4 w-4" />}
          label="Wi-Fi"
          value="Nume rețea și parolă"
        />

        <SettingPreviewCard
          icon={<Monitor className="h-4 w-4" />}
          label="Mesaj welcome"
          value="Template personalizat"
        />

        <SettingPreviewCard
          icon={<Monitor className="h-4 w-4" />}
          label="Ecran standard"
          value="Mesaj RO și EN"
        />

        <SettingPreviewCard
          icon={<Monitor className="h-4 w-4" />}
          label="Program"
          value="Activare și dezactivare"
        />
      </div>

      <footer className="border-t border-white/10 px-6 py-5 md:px-8">
        <p className="text-xs leading-6 text-white/30">
          Configurarea TV Welcome va fi conectată după adăugarea modelului și a
          endpoint-urilor dedicate în backend.
        </p>
      </footer>
    </section>
  );
}

type SettingPreviewCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function SettingPreviewCard({
  icon,
  label,
  value,
}: SettingPreviewCardProps) {
  return (
    <article className="border border-white/10 bg-[#050505] p-5">
      <div className="flex h-9 w-9 items-center justify-center border border-white/10 text-gold">
        {icon}
      </div>

      <p className="mt-5 text-[9px] uppercase tracking-[0.25em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-sm text-white/60">
        {value}
      </p>
    </article>
  );
}