"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Download,
  FileSpreadsheet,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import { getAdminAccessToken } from "@/lib/admin-auth";
import {
  exportReservations,
  type ExportReservationsFilters,
} from "@/services/export-reservations.service";

import type {
  ReservationSource,
  ReservationStatus,
} from "@/types/reservation";

type ExportFormState = {
  status: "" | ReservationStatus;
  source: "" | ReservationSource;
  from: string;
  to: string;
  search: string;
};

const INITIAL_FORM: ExportFormState = {
  status: "",
  source: "",
  from: "",
  to: "",
  search: "",
};

const STATUS_OPTIONS: Array<{
  value: ReservationStatus;
  label: string;
}> = [
  {
    value: "PENDING_APPROVAL",
    label: "În așteptarea aprobării",
  },
  {
    value: "APPROVED_AWAITING_PAYMENT",
    label: "Aprobată — așteaptă plata",
  },
  {
    value: "CONFIRMED",
    label: "Confirmată",
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
    label: "Respinsă",
  },
  {
    value: "CANCELLED",
    label: "Anulată",
  },
  {
    value: "EXPIRED",
    label: "Expirată",
  },
];

const SOURCE_OPTIONS: Array<{
  value: ReservationSource;
  label: string;
}> = [
  {
    value: "DIRECT_WEBSITE",
    label: "Website",
  },
  {
    value: "MANUAL_ADMIN",
    label: "Rezervare manuală",
  },
  {
    value: "BOOKING_COM",
    label: "Booking.com",
  },
];

export function ExportReservationsCard() {
  const [
    form,
    setForm,
  ] = useState<ExportFormState>(
    INITIAL_FORM,
  );

  const [
    isExporting,
    setIsExporting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  );

  const hasActiveFilters =
    useMemo(
      () =>
        Boolean(
          form.status ||
            form.source ||
            form.from ||
            form.to ||
            form.search.trim(),
        ),
      [form],
    );

  function updateField<
    Key extends keyof ExportFormState,
  >(
    field: Key,
    value: ExportFormState[Key],
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setError(null);
    setSuccessMessage(null);
  }

  function validateForm():
    | string
    | null {
    if (
      form.from &&
      form.to &&
      form.from > form.to
    ) {
      return "Data de început nu poate fi după data de final.";
    }

    return null;
  }

  function buildFilters(): ExportReservationsFilters {
    return {
      status:
        form.status ||
        undefined,

      source:
        form.source ||
        undefined,

      from:
        form.from ||
        undefined,

      to:
        form.to ||
        undefined,

      search:
        form.search.trim() ||
        undefined,
    };
  }

  async function handleExport() {
    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError,
      );

      return;
    }

    const token =
      getAdminAccessToken();

    if (!token) {
      setError(
        "Sesiunea administratorului a expirat. Autentifică-te din nou.",
      );

      return;
    }

    setIsExporting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await exportReservations(
        buildFilters(),
        token,
      );

      setSuccessMessage(
        "Fișierul Excel a fost generat și descărcat.",
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Exportul rezervărilor nu a putut fi generat.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  function handleReset() {
    setForm(
      INITIAL_FORM,
    );

    setError(null);
    setSuccessMessage(null);
  }

  return (
    <section className="border border-white/10 bg-[#0b0b0b]">
      <header className="flex flex-col gap-5 border-b border-white/10 px-6 py-6 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold/25 bg-gold/[0.06] text-gold">
            <FileSpreadsheet className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">
              Excel export
            </p>

            <h2 className="heading mt-2 text-3xl font-light">
              Export rezervări
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
              Generează un fișier Excel cu toate rezervările sau aplică filtre după perioadă, status, sursă și client.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            disabled={
              isExporting
            }
            onClick={
              handleReset
            }
            className="inline-flex h-11 items-center justify-center gap-2 self-start border border-white/10 px-4 text-[9px] uppercase tracking-[0.22em] text-white/40 transition hover:border-white/25 hover:text-white disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />

            Resetează filtrele
          </button>
        )}
      </header>

      <div className="px-6 py-7 md:px-8 md:py-8">
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <FormField label="Status rezervare">
            <select
              value={
                form.status
              }
              disabled={
                isExporting
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "status",
                  event.target
                    .value as
                    | ""
                    | ReservationStatus,
                )
              }
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
            >
              <option value="">
                Toate statusurile
              </option>

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </FormField>

          <FormField label="Sursă rezervare">
            <select
              value={
                form.source
              }
              disabled={
                isExporting
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "source",
                  event.target
                    .value as
                    | ""
                    | ReservationSource,
                )
              }
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
            >
              <option value="">
                Toate sursele
              </option>

              {SOURCE_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </FormField>

          <FormField label="De la data">
            <input
              type="date"
              value={
                form.from
              }
              max={
                form.to ||
                undefined
              }
              disabled={
                isExporting
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "from",
                  event.target
                    .value,
                )
              }
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
            />
          </FormField>

          <FormField label="Până la data">
            <input
              type="date"
              value={
                form.to
              }
              min={
                form.from ||
                undefined
              }
              disabled={
                isExporting
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "to",
                  event.target
                    .value,
                )
              }
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition focus:border-gold disabled:cursor-wait disabled:opacity-50"
            />
          </FormField>
        </div>

        <div className="mt-6">
          <FormField label="Caută rezervare sau client">
            <input
              type="search"
              value={
                form.search
              }
              disabled={
                isExporting
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "search",
                  event.target
                    .value,
                )
              }
              placeholder="Nume client, email, telefon sau număr rezervare"
              className="h-12 w-full border border-white/10 bg-[#050505] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-gold disabled:cursor-wait disabled:opacity-50"
            />
          </FormField>
        </div>

        <div className="mt-6 border border-white/10 bg-[#050505] px-5 py-4">
          <p className="text-xs leading-6 text-white/35">
            Câmpurile sunt opționale. Fără filtre, fișierul va conține toate rezervările. Filtrele completate sunt aplicate simultan.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 border border-red-300/20 bg-red-300/5 px-5 py-4 text-sm leading-7 text-red-200"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-6 border border-emerald-300/20 bg-emerald-300/5 px-5 py-4 text-sm leading-7 text-emerald-200"
          >
            {
              successMessage
            }
          </div>
        )}

        <footer className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
              Format export
            </p>

            <p className="mt-2 text-sm text-white/55">
              Microsoft Excel (.xlsx)
            </p>
          </div>

          <button
            type="button"
            disabled={
              isExporting
            }
            onClick={() => {
              void handleExport();
            }}
            className="inline-flex h-13 items-center justify-center gap-3 bg-gold px-7 py-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
          >
            {isExporting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}

            {isExporting
              ? "Se generează..."
              : "Exportă Excel"}
          </button>
        </footer>
      </div>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FormField({
  label,
  children,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-3 block text-[10px] uppercase tracking-[0.24em] text-white/40">
        {label}
      </span>

      {children}
    </label>
  );
}