"use client";

import type {
  AdminNavigationItem,
  AdminSection,
} from "@/types/admin";

const navigationItems: AdminNavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
  },
  {
    id: "reservations",
    label: "Rezervări",
  },
  {
    id: "calendar",
    label: "Calendar",
  },
  {
    id: "rooms",
    label: "Camere",
  },
  {
    id: "rates",
    label: "Tarife",
  },
  {
    id: "blocked-periods",
    label: "Blocări",
  },
  {
    id: "settings",
    label: "Setări",
  },
];

type AdminNavigationProps = {
  activeSection: AdminSection;
  onSectionChange: (
    section: AdminSection,
  ) => void;
};

export function AdminNavigation({
  activeSection,
  onSectionChange,
}: AdminNavigationProps) {
  return (
    <nav className="border-b border-white/10 bg-[#080808]">
      <div className="mx-auto max-w-[1600px] overflow-x-auto px-6 md:px-10">
        <div className="flex min-w-max items-center gap-9">
          {navigationItems.map((item) => {
            const isActive =
              activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onSectionChange(item.id)
                }
                className={`relative py-5 text-[10px] uppercase tracking-[0.28em] transition ${
                  isActive
                    ? "text-gold"
                    : "text-white/40 hover:text-white/80"
                }`}
              >
                {item.label}

                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-px bg-gold" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}