"use client";

import { RefreshCw } from "lucide-react";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";

import { DashboardCard } from "./DashboardCard";
import { DashboardReservationList } from "./DashboardReservationList";

function formatCurrency(
  value: number,
  currency: string,
): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency:
      currency === "MIXED"
        ? "RON"
        : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatGeneratedAt(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "ro-RO",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

export function AdminDashboard() {
  const {
    dashboard,
    isLoading,
    error,
    refresh,
  } = useAdminDashboard();

  if (isLoading && !dashboard) {
    return (
      <section className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-gold border-t-transparent" />

          <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/35">
            Se încarcă dashboard-ul
          </p>
        </div>
      </section>
    );
  }

  if (error || !dashboard) {
    return (
      <section className="border border-red-300/20 bg-red-300/5 px-8 py-12 text-center">
        <h1 className="heading text-4xl font-light text-white">
          Dashboard-ul nu a putut fi încărcat.
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-red-200">
          {error ??
            "Datele operaționale nu sunt disponibile momentan."}
        </p>

        <button
          type="button"
          onClick={() => {
            void refresh();
          }}
          className="mt-8 border border-red-200/25 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-red-100 transition hover:border-red-100"
        >
          Încearcă din nou
        </button>
      </section>
    );
  }

  const metrics = [
    {
      id: "pending-approval",
      label:
        "În așteptarea aprobării",
      value:
        dashboard.metrics
          .pendingApprovalCount,
      description:
        "Cereri care necesită verificarea administratorului.",
    },
    {
      id: "awaiting-payment",
      label:
        "În așteptarea plății",
      value:
        dashboard.metrics
          .awaitingPaymentCount,
      description:
        "Rezervări aprobate care blochează temporar inventarul.",
    },
    {
      id: "check-ins",
      label:
        "Check-in astăzi",
      value:
        dashboard.metrics
          .checkInsTodayCount,
      description:
        "Sosiri programate pentru ziua curentă.",
    },
    {
      id: "check-outs",
      label:
        "Check-out astăzi",
      value:
        dashboard.metrics
          .checkOutsTodayCount,
      description:
        "Plecări programate pentru ziua curentă.",
    },
    {
      id: "occupancy",
      label:
        "Grad de ocupare",
      value: `${dashboard.metrics.occupancyRate}%`,
      description: `${dashboard.metrics.occupiedRoomsCount} din ${dashboard.metrics.activeRoomsCount} apartamente sunt ocupate.`,
    },
    {
      id: "revenue",
      label:
        "Venit încasat",
      value: formatCurrency(
        dashboard.metrics
          .paidRevenue,
        dashboard.metrics.currency,
      ),
      description:
        dashboard.metrics.currency ===
        "MIXED"
          ? "Încasări agregate în mai multe monede."
          : "Valoarea netă a plăților înregistrate.",
    },
  ];

  return (
    <section className="space-y-10">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Overview
          </p>

          <h1 className="heading mt-4 text-5xl font-light md:text-7xl">
            Dashboard
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Situația operațională a
            Sunshine Resort, rezervările
            active și activitatea zilei.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">
            Actualizat{" "}
            {formatGeneratedAt(
              dashboard.generatedAt,
            )}
          </p>

          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            disabled={isLoading}
            aria-label="Reîncarcă dashboard-ul"
            className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/45 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading
                  ? "animate-spin"
                  : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            description={
              metric.description
            }
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 border border-white/10 bg-[#0b0b0b] px-5 py-4">
          <div className="h-4 w-4 animate-spin rounded-full border border-gold border-t-transparent" />

          <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
            Se actualizează datele
          </span>
        </div>
      )}

      <div className="grid items-start gap-8 xl:grid-cols-2">
        <DashboardReservationList
          eyebrow="Approval Queue"
          title="Cereri de aprobat"
          description="Rezervări noi care așteaptă verificarea și decizia administratorului."
          reservations={
            dashboard.pendingApprovals
          }
          emptyTitle="Nu există cereri noi."
          emptyDescription="Toate cererile de rezervare au fost procesate."
          variant="default"
        />

        <DashboardReservationList
          eyebrow="Payment Queue"
          title="În așteptarea plății"
          description="Rezervări aprobate care păstrează inventarul blocat până la plată sau expirare."
          reservations={
            dashboard.awaitingPayments
          }
          emptyTitle="Nu există plăți în așteptare."
          emptyDescription="Toate rezervările aprobate au fost achitate sau au expirat."
          variant="warning"
          showPaymentDeadline
        />
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-2">
        <DashboardReservationList
          eyebrow="Arrivals"
          title="Check-in astăzi"
          description="Oaspeții care trebuie primiți și cazați în cursul zilei."
          reservations={
            dashboard.checkInsToday
          }
          emptyTitle="Nu există sosiri astăzi."
          emptyDescription="Nu sunt programate check-in-uri pentru ziua curentă."
          variant="success"
        />

        <DashboardReservationList
          eyebrow="Departures"
          title="Check-out astăzi"
          description="Rezervările care trebuie încheiate și camerele care urmează să fie eliberate."
          reservations={
            dashboard.checkOutsToday
          }
          emptyTitle="Nu există plecări astăzi."
          emptyDescription="Nu sunt programate check-out-uri pentru ziua curentă."
          variant="danger"
        />
      </div>

      <DashboardReservationList
        eyebrow="Recent Activity"
        title="Rezervări recente"
        description="Cele mai recente rezervări create în sistem, indiferent de status sau sursă."
        reservations={
          dashboard.recentReservations
        }
        emptyTitle="Nu există rezervări."
        emptyDescription="Rezervările noi vor apărea aici după ce sunt create."
      />
    </section>
  );
}