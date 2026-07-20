import type { ReservationStatus } from "@/types/reservation";

type StatusBadgeProps = {
  status: ReservationStatus;
};

const statusConfig: Record<
  ReservationStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING_APPROVAL: {
    label: "În așteptare",
    className:
      "border-amber-300/20 bg-amber-300/10 text-amber-200",
  },

  APPROVED_AWAITING_PAYMENT: {
    label: "Așteaptă plata",
    className:
      "border-sky-300/20 bg-sky-300/10 text-sky-200",
  },

  CONFIRMED: {
    label: "Confirmată",
    className:
      "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  },

  REJECTED: {
    label: "Respinsă",
    className:
      "border-red-300/20 bg-red-300/10 text-red-200",
  },

  CANCELLED: {
    label: "Anulată",
    className:
      "border-rose-300/20 bg-rose-300/10 text-rose-200",
  },

  EXPIRED: {
    label: "Expirată",
    className:
      "border-white/10 bg-white/5 text-white/35",
  },

  CHECKED_IN: {
    label: "Check-in efectuat",
    className:
      "border-violet-300/20 bg-violet-300/10 text-violet-200",
  },

  CHECKED_OUT: {
    label: "Check-out efectuat",
    className:
      "border-white/15 bg-white/10 text-white/55",
  },
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap border px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.22em] ${config.className}`}
    >
      {config.label}
    </span>
  );
}