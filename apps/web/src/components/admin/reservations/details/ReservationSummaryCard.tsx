import type { AdminReservationDetails } from "@/types/admin-reservation-details";

import { formatAdminPrice } from "./reservation-formatters";

type ReservationSummaryCardProps = {
  reservation: AdminReservationDetails;
};

export function ReservationSummaryCard({
  reservation,
}: ReservationSummaryCardProps) {
  const remainingAmount = Math.max(
    0,
    reservation.totalPrice - reservation.paidAmount,
  );

  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-7">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
        Financiar
      </p>

      <h2 className="heading mt-3 text-3xl font-light">
        Rezumat financiar
      </h2>

      <div className="mt-7 space-y-4 text-sm">
        <div className="flex items-center justify-between gap-6 text-white/45">
          <span>Subtotal</span>
          <span className="text-white/75">
            {formatAdminPrice(reservation.subtotalPrice)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6 text-white/45">
          <span>Reducere</span>
          <span className="text-white/75">
            {formatAdminPrice(reservation.discountAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6 text-white/45">
          <span>Avans minim ({reservation.depositPercentage}%)</span>
          <span className="text-white/75">
            {formatAdminPrice(reservation.depositAmount)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6 text-white/45">
          <span>Achitat</span>
          <span className="text-emerald-300">
            {formatAdminPrice(reservation.paidAmount)}
          </span>
        </div>

        <div className="border-t border-white/10 pt-5">
          <div className="flex items-end justify-between gap-6">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              Total rezervare
            </span>

            <span className="heading text-3xl">
              {formatAdminPrice(reservation.totalPrice)}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-6 border-t border-white/10 pt-5">
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
            Rămas de plată
          </span>

          <span className="heading text-3xl text-gold">
            {formatAdminPrice(remainingAmount)}
          </span>
        </div>
      </div>

      {reservation.isComplimentary && (
        <div className="mt-6 border border-gold/20 bg-gold/5 px-4 py-3 text-xs text-gold">
          Rezervare marcată drept gratuită.
        </div>
      )}
    </section>
  );
}