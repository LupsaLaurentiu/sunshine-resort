import type { BookingRoom } from "./RoomSelection";

type BookingSummaryProps = {
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: BookingRoom[];
  selectedRooms: Record<string, number>;
  onSubmit: () => void;
  canSubmit: boolean;
};

export function BookingSummary({
  checkIn,
  checkOut,
  nights,
  rooms,
  selectedRooms,
  onSubmit,
  canSubmit,
}: BookingSummaryProps) {
  const selected = rooms.filter(
    (room) => (selectedRooms[room.slug] ?? 0) > 0,
  );

  const total = selected.reduce((sum, room) => {
    const quantity = selectedRooms[room.slug] ?? 0;
    return sum + room.pricePerNight * nights * quantity;
  }, 0);

  return (
    <aside className="sticky top-28 border border-white/10 bg-[#0b0b0b] p-8">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">
        Your Request
      </p>

      <h2 className="heading mt-4 text-4xl font-light">Booking summary</h2>

      <div className="mt-8 space-y-5 border-y border-white/10 py-7 text-sm">
        <div className="flex justify-between gap-5 text-white/55">
          <span>Check-in</span>
          <span className="text-white">{checkIn || "—"}</span>
        </div>

        <div className="flex justify-between gap-5 text-white/55">
          <span>Check-out</span>
          <span className="text-white">{checkOut || "—"}</span>
        </div>

        <div className="flex justify-between gap-5 text-white/55">
          <span>Nights</span>
          <span className="text-white">{nights || "—"}</span>
        </div>
      </div>

      <div className="space-y-5 py-7">
        {selected.length === 0 ? (
          <p className="text-sm text-white/40">
            No apartments selected yet.
          </p>
        ) : (
          selected.map((room) => {
            const quantity = selectedRooms[room.slug] ?? 0;

            return (
              <div key={room.slug} className="flex justify-between gap-5">
                <div>
                  <p className="text-sm">{room.title}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {quantity} × {nights} nights
                  </p>
                </div>

                <span className="text-sm">
                  {room.pricePerNight * nights * quantity} RON
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <div className="flex items-end justify-between">
          <span className="text-xs uppercase tracking-[0.25em] text-white/45">
            Estimated total
          </span>

          <span className="heading text-3xl">{total} RON</span>
        </div>

        <p className="mt-5 text-xs leading-6 text-white/35">
          This is a booking request. Payment is not collected now. After manual
          approval, you will receive a secure payment link by email.
        </p>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="mt-8 w-full bg-gold px-8 py-5 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Send Booking Request
        </button>
      </div>
    </aside>
  );
}