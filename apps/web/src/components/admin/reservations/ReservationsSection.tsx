"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { useAdminReservations } from "@/hooks/useAdminReservations";

import type {
  ReservationSource,
} from "@/types/admin-reservation";
import type {
  ReservationStatus,
} from "@/types/reservation";

import { ReservationsTable } from "./ReservationsTable";

const reservationStatuses: Array<{
  value: "" | ReservationStatus;
  label: string;
}> = [
  {
    value: "",
    label: "Toate statusurile",
  },
  {
    value: "PENDING_APPROVAL",
    label: "În așteptarea aprobării",
  },
  {
    value: "APPROVED_AWAITING_PAYMENT",
    label: "Așteaptă plata",
  },
  {
    value: "CONFIRMED",
    label: "Confirmate",
  },
  {
    value: "CHECKED_IN",
    label: "Check-in efectuat",
  },
  {
    value: "CHECKED_OUT",
    label: "Check-out efectuat",
  },
  {
    value: "REJECTED",
    label: "Respinse",
  },
  {
    value: "CANCELLED",
    label: "Anulate",
  },
  {
    value: "EXPIRED",
    label: "Expirate",
  },
];

const reservationSources: Array<{
  value: "" | ReservationSource;
  label: string;
}> = [
  {
    value: "",
    label: "Toate sursele",
  },
  {
    value: "DIRECT_WEBSITE",
    label: "Website",
  },
  {
    value: "MANUAL_ADMIN",
    label: "Manual",
  },
  {
    value: "BOOKING_COM",
    label: "Booking.com",
  },
];

export function ReservationsSection() {
  const [searchInput, setSearchInput] = useState("");

  const {
    reservations,
    pagination,
    query,
    error,
    isLoading,
    updateFilters,
    setPage,
    resetFilters,
    refresh,
  } = useAdminReservations({
    page: 1,
    limit: 20,
  });

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        query.status ||
          query.source ||
          query.from ||
          query.to ||
          query.search,
      ),
    [
      query.from,
      query.search,
      query.source,
      query.status,
      query.to,
    ],
  );

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    updateFilters({
      search: searchInput.trim() || undefined,
    });
  }

  function handleResetFilters() {
    setSearchInput("");
    resetFilters();
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Operations
          </p>

          <h1 className="heading mt-4 text-5xl font-light md:text-7xl">
            Rezervări
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Vizualizează și filtrează toate rezervările Sunshine Resort.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/30">
              Total rezervări
            </p>

            <p className="heading mt-1 text-3xl font-light text-white/80">
              {pagination.totalItems}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isLoading}
            className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/50 transition hover:border-gold hover:text-gold disabled:cursor-wait disabled:opacity-40"
            aria-label="Reîncarcă rezervările"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-12 border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
        <form
          onSubmit={handleSearchSubmit}
          className="grid gap-5 lg:grid-cols-2 xl:grid-cols-12"
        >
          <label className="block xl:col-span-4">
            <span className="mb-3 block text-[9px] uppercase tracking-[0.28em] text-white/35">
              Caută
            </span>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Nume, email sau telefon"
                className="h-12 w-full border border-white/10 bg-[#050505] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-gold"
              />
            </div>
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-3 block text-[9px] uppercase tracking-[0.28em] text-white/35">
              Status
            </span>

            <select
              value={query.status ?? ""}
              onChange={(event) =>
                updateFilters({
                  status:
                    (event.target.value as ReservationStatus) ||
                    undefined,
                })
              }
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white/75 outline-none transition focus:border-gold"
            >
              {reservationStatuses.map((status) => (
                <option
                  key={status.value || "all-statuses"}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-3 block text-[9px] uppercase tracking-[0.28em] text-white/35">
              Sursă
            </span>

            <select
              value={query.source ?? ""}
              onChange={(event) =>
                updateFilters({
                  source:
                    (event.target.value as ReservationSource) ||
                    undefined,
                })
              }
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white/75 outline-none transition focus:border-gold"
            >
              {reservationSources.map((source) => (
                <option
                  key={source.value || "all-sources"}
                  value={source.value}
                >
                  {source.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-3 block text-[9px] uppercase tracking-[0.28em] text-white/35">
              Check-in de la
            </span>

            <input
              type="date"
              value={query.from ?? ""}
              onChange={(event) =>
                updateFilters({
                  from: event.target.value || undefined,
                })
              }
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white/75 outline-none transition focus:border-gold"
            />
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-3 block text-[9px] uppercase tracking-[0.28em] text-white/35">
              Check-out până la
            </span>

            <input
              type="date"
              value={query.to ?? ""}
              onChange={(event) =>
                updateFilters({
                  to: event.target.value || undefined,
                })
              }
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white/75 outline-none transition focus:border-gold"
            />
          </label>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-6 lg:col-span-2 xl:col-span-12">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex h-12 items-center justify-center gap-3 border border-white/10 px-6 text-[10px] uppercase tracking-[0.25em] text-white/45 transition hover:border-white/25 hover:text-white"
              >
                <X className="h-4 w-4" />
                Resetează
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 min-w-[160px] bg-gold px-8 text-[10px] font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
            >
              {isLoading ? "Se caută..." : "Aplică filtrele"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mt-6 border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm leading-6 text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8">
        {isLoading && reservations.length === 0 ? (
          <div className="border border-white/10 bg-[#0b0b0b] px-8 py-24 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-gold border-t-transparent" />

            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/35">
              Se încarcă rezervările
            </p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="border border-white/10 bg-[#0b0b0b] px-8 py-24 text-center">
            <p className="heading text-3xl font-light text-white/60">
              Nu există rezervări.
            </p>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/35">
              Nu au fost găsite rezervări pentru filtrele selectate.
            </p>
          </div>
        ) : (
          <ReservationsTable reservations={reservations} />
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/35">
            Pagina {pagination.page} din {pagination.totalPages}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={
                pagination.page <= 1 || isLoading
              }
              onClick={() =>
                setPage(pagination.page - 1)
              }
              className="border border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-white/55 transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={
                pagination.page >=
                  pagination.totalPages || isLoading
              }
              onClick={() =>
                setPage(pagination.page + 1)
              }
              className="border border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.25em] text-white/55 transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
            >
              Următor
            </button>
          </div>
        </div>
      )}
    </section>
  );
}