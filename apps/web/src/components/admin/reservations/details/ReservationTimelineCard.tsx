import type { AdminReservationDetails } from "@/types/admin-reservation-details";

import { formatAdminDateTime } from "./reservation-formatters";

type ReservationTimelineCardProps = {
  reservation: AdminReservationDetails;
};

type TimelineItem = {
  label: string;
  value: string | null;
};

export function ReservationTimelineCard({
  reservation,
}: ReservationTimelineCardProps) {
  const items: TimelineItem[] = [
    {
      label: "Rezervare creată",
      value: reservation.createdAt,
    },
    {
      label: "Rezervare aprobată",
      value: reservation.approvedAt,
    },
    {
      label: "Rezervare confirmată",
      value: reservation.confirmedAt,
    },
    {
      label: "Check-in efectuat",
      value: reservation.checkedInAt,
    },
    {
      label: "Check-out efectuat",
      value: reservation.checkedOutAt,
    },
    {
      label: "Rezervare respinsă",
      value: reservation.rejectedAt,
    },
    {
      label: "Rezervare anulată",
      value: reservation.cancelledAt,
    },
  ].filter((item) => item.value !== null);

  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-7">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
        Istoric
      </p>

      <h2 className="heading mt-3 text-3xl font-light">
        Timeline
      </h2>

      <div className="mt-7 space-y-0">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${item.value}`}
            className="relative flex gap-5 pb-7 last:pb-0"
          >
            {index < items.length - 1 && (
              <span className="absolute left-[5px] top-3 h-full w-px bg-white/10" />
            )}

            <span className="relative mt-1.5 h-3 w-3 shrink-0 rounded-full border border-gold bg-[#0b0b0b]" />

            <div>
              <p className="text-sm text-white/70">{item.label}</p>
              <p className="mt-1 text-xs text-white/30">
                {formatAdminDateTime(item.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}