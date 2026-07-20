import type { AdminReservationDetails } from "@/types/admin-reservation-details";

type ReservationNotesCardProps = {
  reservation: AdminReservationDetails;
};

export function ReservationNotesCard({
  reservation,
}: ReservationNotesCardProps) {
  const hasNotes =
    reservation.guestNotes ||
    reservation.adminNotes ||
    reservation.rejectionReason ||
    reservation.cancellationReason;

  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-7">
      <p className="text-[10px] uppercase tracking-[0.32em] text-gold">
        Comunicare
      </p>

      <h2 className="heading mt-3 text-3xl font-light">
        Note și motive
      </h2>

      {!hasNotes ? (
        <p className="mt-7 text-sm text-white/35">
          Nu există note asociate rezervării.
        </p>
      ) : (
        <div className="mt-7 space-y-6">
          {reservation.guestNotes && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Nota clientului
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/60">
                {reservation.guestNotes}
              </p>
            </div>
          )}

          {reservation.adminNotes && (
            <div className="border-t border-white/10 pt-5">
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Nota administratorului
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/60">
                {reservation.adminNotes}
              </p>
            </div>
          )}

          {reservation.rejectionReason && (
            <div className="border-t border-white/10 pt-5">
              <p className="text-[9px] uppercase tracking-[0.25em] text-red-300/60">
                Motivul respingerii
              </p>

              <p className="mt-2 text-sm leading-7 text-red-200">
                {reservation.rejectionReason}
              </p>
            </div>
          )}

          {reservation.cancellationReason && (
            <div className="border-t border-white/10 pt-5">
              <p className="text-[9px] uppercase tracking-[0.25em] text-amber-200/60">
                Motivul anulării
              </p>

              <p className="mt-2 text-sm leading-7 text-amber-100">
                {reservation.cancellationReason}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}