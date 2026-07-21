import Link from "next/link";

import type {
  CalendarUnassignedReservation,
} from "@/types/admin-calendar";

type UnassignedReservationsProps = {
  reservations: CalendarUnassignedReservation[];
};

export function UnassignedReservations({
  reservations,
}: UnassignedReservationsProps) {
  if (reservations.length === 0) {
    return null;
  }

  return (
    <section className="border border-amber-500/20 bg-amber-500/5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-amber-400">
            Room Allocation
          </p>

          <h2 className="heading mt-3 text-3xl font-light">
            Rezervări fără cameră alocată
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
            Aceste rezervări au un tip de apartament rezervat,
            însă încă nu există o cameră fizică alocată.
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
          <span className="heading text-2xl font-light text-amber-300">
            {reservations.length}
          </span>
        </div>
      </div>

      <div className="mt-8 overflow-hidden border border-white/10">
        <table className="w-full border-collapse">
          <thead className="bg-white/[0.03]">
            <tr>
              <HeaderCell>Client</HeaderCell>
              <HeaderCell>Tip cameră</HeaderCell>
              <HeaderCell>Perioadă</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell> </HeaderCell>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr
                key={reservation.reservationRoomId}
                className="border-t border-white/10"
              >
                <BodyCell>
                  {reservation.guestName}
                </BodyCell>

                <BodyCell>
                  {reservation.roomTypeName}
                </BodyCell>

                <BodyCell>
                  {reservation.start} – {reservation.end}
                </BodyCell>

                <BodyCell>
                  {reservation.status}
                </BodyCell>

                <BodyCell className="text-right">
                  <Link
                    href={`/admin/reservation/${reservation.reservationId}`}
                    className="text-xs uppercase tracking-[0.2em] text-gold transition hover:text-white"
                  >
                    Deschide →
                  </Link>
                </BodyCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type CellProps = {
  children: React.ReactNode;
  className?: string;
};

function HeaderCell({
  children,
}: CellProps) {
  return (
    <th className="px-5 py-4 text-left text-[10px] font-medium uppercase tracking-[0.25em] text-white/35">
      {children}
    </th>
  );
}

function BodyCell({
  children,
  className,
}: CellProps) {
  return (
    <td
      className={`px-5 py-5 text-sm text-white/75 ${
        className ?? ""
      }`}
    >
      {children}
    </td>
  );
}