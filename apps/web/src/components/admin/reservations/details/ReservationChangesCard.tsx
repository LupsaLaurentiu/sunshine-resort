import type { ReservationChangeDetails } from "@/types/admin-reservation-details";

import {
  formatAdminDate,
  formatAdminDateTime,
  formatAdminPrice,
  getChangeStatusLabel,
} from "./reservation-formatters";

type ReservationChangesCardProps = {
  changes: ReservationChangeDetails[];
};

export function ReservationChangesCard({
  changes,
}: ReservationChangesCardProps) {
  return (
    <section className="border border-white/10 bg-[#0b0b0b]">
      <div className="border-b border-white/10 px-7 py-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
          Modificări
        </p>

        <h2 className="heading mt-3 text-3xl font-light">
          Cereri de modificare
        </h2>
      </div>

      {changes.length === 0 ? (
        <div className="px-7 py-14 text-center">
          <p className="text-sm text-white/40">
            Nu există cereri de modificare.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {changes.map((change) => (
            <article key={change.id} className="px-7 py-7">
              <div className="flex flex-col justify-between gap-5 md:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-sm text-white/80">
                      {formatAdminDate(change.requestedCheckInDate)} —{" "}
                      {formatAdminDate(change.requestedCheckOutDate)}
                    </p>

                    <span className="border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white/45">
                      {getChangeStatusLabel(change.status)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-white/30">
                    Creată la {formatAdminDateTime(change.createdAt)}
                  </p>

                  {change.guestReason && (
                    <p className="mt-4 text-sm leading-7 text-white/50">
                      Motiv client: {change.guestReason}
                    </p>
                  )}

                  {change.rejectionReason && (
                    <p className="mt-3 text-sm leading-7 text-red-300">
                      Motiv respingere: {change.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="md:text-right">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                    Diferență
                  </p>

                  <p className="heading mt-2 text-2xl">
                    {formatAdminPrice(change.priceDifference)}
                  </p>

                  {change.amountDue > 0 && (
                    <p className="mt-2 text-xs text-gold">
                      De plată: {formatAdminPrice(change.amountDue)}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}