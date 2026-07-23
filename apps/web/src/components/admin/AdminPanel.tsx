"use client";

import { useState } from "react";

import type { AdminSection } from "@/types/admin";

import { AdminCalendar } from "./calendar/AdminCalendar";
import { AdminDashboard } from "./dashboard/AdminDashboard";
import { AdminRates } from "./rates/AdminRates";
import { ReservationsSection } from "./reservations/ReservationsSection";
import { RoomsSection } from "./rooms/RoomsSection";
import { AdminEmptySection } from "./shared/AdminEmptySection";
import { AdminBlockedPeriods } from "./blocked-periods/AdminBlockedPeriods";

import { AdminHeader } from "@/components/layout/admin/AdminHeader";
import { AdminNavigation } from "@/components/layout/admin/AdminNavigation";

function renderSection(
  section: AdminSection,
) {
  switch (section) {
    case "dashboard":
      return <AdminDashboard />;

    case "reservations":
      return <ReservationsSection />;

    case "calendar":
      return <AdminCalendar />;

    case "rooms":
      return <RoomsSection />;

    case "rates":
      return <AdminRates />;

    case "blocked-periods":
      return <AdminBlockedPeriods />;

    case "settings":
      return (
        <AdminEmptySection
          eyebrow="Configuration"
          title="Setări"
          description="Configurarea generală a aplicației și a integrărilor Sunshine Resort."
        />
      );

    default:
      return <AdminDashboard />;
  }
}

export function AdminPanel() {
  const [
    activeSection,
    setActiveSection,
  ] = useState<AdminSection>(
    "dashboard",
  );

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f2eb]">
      <AdminHeader />

      <AdminNavigation
        activeSection={
          activeSection
        }
        onSectionChange={
          setActiveSection
        }
      />

      <div className="mx-auto w-full max-w-[1800px] px-6 py-12 md:px-10 md:py-16">
        {renderSection(
          activeSection,
        )}
      </div>
    </main>
  );
}