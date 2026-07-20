"use client";

import { useState } from "react";

import type { AdminSection } from "@/types/admin";

import { AdminDashboard } from "./dashboard/AdminDashboard";
import { ReservationsSection } from "./reservations/ReservationsSection";
import { AdminEmptySection } from "./shared/AdminEmptySection";

import { AdminHeader } from "@/components/layout/admin/AdminHeader";
import { AdminNavigation } from "@/components/layout/admin/AdminNavigation";

function renderSection(section: AdminSection) {
  switch (section) {
    case "dashboard":
      return <AdminDashboard />;

    case "reservations":
      return <ReservationsSection />;

    case "calendar":
      return (
        <AdminEmptySection
          eyebrow="PMS Calendar"
          title="Calendar"
          description="Calendarul central cu ocuparea celor opt apartamente și perioadele blocate."
        />
      );

    case "rooms":
      return (
        <AdminEmptySection
          eyebrow="Inventory"
          title="Camere"
          description="Administrarea apartamentelor fizice, codurilor și dispozitivelor TV."
        />
      );

    case "rates":
      return (
        <AdminEmptySection
          eyebrow="Pricing"
          title="Tarife"
          description="Administrarea tarifelor weekday, weekend și a perioadelor tarifare."
        />
      );

    case "promotions":
      return (
        <AdminEmptySection
          eyebrow="Offers"
          title="Promoții"
          description="Crearea și administrarea ofertelor aplicate automat rezervărilor eligibile."
        />
      );

    case "blocked-periods":
      return (
        <AdminEmptySection
          eyebrow="Availability"
          title="Blocări"
          description="Blocarea camerelor pentru mentenanță, utilizare internă sau indisponibilitate."
        />
      );

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
  const [activeSection, setActiveSection] =
    useState<AdminSection>("dashboard");

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f2eb]">
      <AdminHeader />

      <AdminNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="mx-auto max-w-[1600px] px-6 py-12 md:px-10 md:py-16">
        {renderSection(activeSection)}
      </div>
    </main>
  );
}