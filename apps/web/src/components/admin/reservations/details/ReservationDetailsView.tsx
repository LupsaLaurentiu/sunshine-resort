"use client";

import { useAdminReservationDetails } from "@/hooks/useAdminReservationDetails";

import { ReservationActions } from "./ReservationActions";
import { ReservationChangesCard } from "./ReservationChangesCard";
import { ReservationGuestCard } from "./ReservationGuestCard";
import { ReservationHeader } from "./ReservationHeader";
import { ReservationNotesCard } from "./ReservationNotesCard";
import { ReservationPaymentsCard } from "./ReservationPaymentsCard";
import { ReservationRoomsCard } from "./ReservationRoomsCard";
import { ReservationStayCard } from "./ReservationStayCard";
import { ReservationSummaryCard } from "./ReservationSummaryCard";
import { ReservationTimelineCard } from "./ReservationTimelineCard";

type ReservationDetailsViewProps = {
  reservationId: string;
};

export function ReservationDetailsView({
  reservationId,
}: ReservationDetailsViewProps) {
  const {
    reservation,
    error,
    isLoading,
    refresh,
  } = useAdminReservationDetails(reservationId);

  if (isLoading && !reservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border border-gold border-t-transparent" />

          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/35">
            Se încarcă rezervarea
          </p>
        </div>
      </main>
    );
  }

  if (error || !reservation) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f5f2eb] md:px-10">
        <div className="mx-auto max-w-4xl border border-red-400/20 bg-red-400/5 px-8 py-16 text-center">
          <h1 className="heading text-4xl font-light">
            Rezervarea nu a putut fi încărcată.
          </h1>

          <p className="mt-5 text-sm text-red-300">
            {error || "Rezervarea nu există."}
          </p>

          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-8 border border-red-300/30 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-red-200"
          >
            Încearcă din nou
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-[#f5f2eb] md:px-10 md:py-16">
      <div className="mx-auto max-w-[1600px]">
        <ReservationHeader
          reservation={reservation}
          isRefreshing={isLoading}
          onRefresh={() => void refresh()}
        />

        <div className="mt-12 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <ReservationGuestCard guest={reservation.guest} />

              <ReservationStayCard reservation={reservation} />
            </div>

            <ReservationRoomsCard rooms={reservation.rooms} />

            <ReservationPaymentsCard payments={reservation.payments} />

            <ReservationChangesCard changes={reservation.changes} />
          </div>

          <aside className="space-y-8 xl:sticky xl:top-8">
            <ReservationActions
              reservation={reservation}
              onActionCompleted={refresh}
            />

            <ReservationSummaryCard reservation={reservation} />

            <ReservationTimelineCard reservation={reservation} />

            <ReservationNotesCard reservation={reservation} />
          </aside>
        </div>
      </div>
    </main>
  );
}