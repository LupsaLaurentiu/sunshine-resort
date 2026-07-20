import type { ReservationPaymentDetails } from "@/types/admin-reservation-details";

import {
  formatAdminDateTime,
  formatAdminPrice,
  getPaymentProviderLabel,
  getPaymentStatusLabel,
  getPaymentTypeLabel,
} from "./reservation-formatters";

type ReservationPaymentsCardProps = {
  payments: ReservationPaymentDetails[];
};

export function ReservationPaymentsCard({
  payments,
}: ReservationPaymentsCardProps) {
  return (
    <section className="border border-white/10 bg-[#0b0b0b]">
      <div className="border-b border-white/10 px-7 py-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
          Tranzacții
        </p>

        <h2 className="heading mt-3 text-3xl font-light">
          Plăți
        </h2>
      </div>

      {payments.length === 0 ? (
        <div className="px-7 py-14 text-center">
          <p className="text-sm text-white/40">
            Nu există plăți înregistrate.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {payments.map((payment) => (
            <article
              key={payment.id}
              className="grid gap-5 px-7 py-6 md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-sm text-white/80">
                    {getPaymentTypeLabel(payment.type)}
                  </p>

                  <span className="border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-white/45">
                    {getPaymentStatusLabel(payment.status)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/30">
                  <span>
                    {getPaymentProviderLabel(payment.provider)}
                  </span>

                  <span>
                    Creată: {formatAdminDateTime(payment.createdAt)}
                  </span>

                  {payment.paidAt && (
                    <span>
                      Achitată: {formatAdminDateTime(payment.paidAt)}
                    </span>
                  )}
                </div>

                {payment.failureReason && (
                  <p className="mt-3 text-xs text-red-300">
                    {payment.failureReason}
                  </p>
                )}

                {payment.refundReason && (
                  <p className="mt-3 text-xs text-amber-200">
                    Rambursare: {payment.refundReason}
                  </p>
                )}
              </div>

              <div className="md:text-right">
                <p className="heading text-2xl">
                  {formatAdminPrice(payment.amount, payment.currency)}
                </p>

                {Number(payment.refundedAmount) > 0 && (
                  <p className="mt-2 text-xs text-amber-200">
                    Rambursat:{" "}
                    {formatAdminPrice(
                      payment.refundedAmount,
                      payment.currency,
                    )}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}