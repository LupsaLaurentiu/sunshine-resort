import { useParams } from "next/navigation";

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

function formatPrice(value: number, locale: "ro" | "en"): string {
  return new Intl.NumberFormat(
    locale === "ro" ? "ro-RO" : "en-GB",
    {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatDate(value: string, locale: "ro" | "en"): string {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(
    locale === "ro" ? "ro-RO" : "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

export function BookingSummary({
  checkIn,
  checkOut,
  nights,
  rooms,
  selectedRooms,
  onSubmit,
  canSubmit,
}: BookingSummaryProps) {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale === "en" ? "en" : "ro";

  const selected = rooms.filter(
    (room) => (selectedRooms[room.slug] ?? 0) > 0,
  );

  const total = selected.reduce((sum, room) => {
    const quantity = selectedRooms[room.slug] ?? 0;

    return sum + room.totalPrice * quantity;
  }, 0);

  return (
    <aside className="sticky top-28 border border-white/10 bg-[#0b0b0b] p-8">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">
        {locale === "en" ? "Your Request" : "Cererea ta"}
      </p>

      <h2 className="heading mt-4 text-4xl font-light">
        {locale === "en"
          ? "Booking summary"
          : "Rezumatul rezervării"}
      </h2>

      <div className="mt-8 space-y-5 border-y border-white/10 py-7 text-sm">
        <div className="flex justify-between gap-5 text-white/55">
          <span>
            {locale === "en" ? "Check-in" : "Sosire"}
          </span>

          <span className="text-white">
            {formatDate(checkIn, locale)}
          </span>
        </div>

        <div className="flex justify-between gap-5 text-white/55">
          <span>
            {locale === "en" ? "Check-out" : "Plecare"}
          </span>

          <span className="text-white">
            {formatDate(checkOut, locale)}
          </span>
        </div>

        <div className="flex justify-between gap-5 text-white/55">
          <span>
            {locale === "en" ? "Nights" : "Nopți"}
          </span>

          <span className="text-white">
            {nights || "—"}
          </span>
        </div>
      </div>

      <div className="space-y-5 py-7">
        {selected.length === 0 ? (
          <p className="text-sm text-white/40">
            {locale === "en"
              ? "No apartments selected yet."
              : "Nu ai selectat încă niciun apartament."}
          </p>
        ) : (
          selected.map((room) => {
            const quantity = selectedRooms[room.slug] ?? 0;
            const roomTotal = room.totalPrice * quantity;

            return (
              <div
                key={room.roomTypeId}
                className="flex justify-between gap-5"
              >
                <div>
                  <p className="text-sm">
                    {room.title}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    {quantity} ×{" "}
                    {locale === "en"
                      ? `${nights} nights`
                      : `${nights} nopți`}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {formatPrice(room.totalPrice, locale)}{" "}
                    {locale === "en"
                      ? "per apartment"
                      : "per apartament"}
                  </p>
                </div>

                <span className="text-sm">
                  {formatPrice(roomTotal, locale)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <div className="flex items-end justify-between gap-6">
          <span className="text-xs uppercase tracking-[0.25em] text-white/45">
            {locale === "en"
              ? "Estimated total"
              : "Total estimat"}
          </span>

          <span className="heading text-3xl">
            {formatPrice(total, locale)}
          </span>
        </div>

        <p className="mt-5 text-xs leading-6 text-white/35">
          {locale === "en"
            ? "This is a booking request. No payment is collected now. After manual approval, you will receive a secure payment link by email."
            : "Aceasta este o cerere de rezervare. Plata nu se efectuează acum. După aprobarea manuală, vei primi pe email un link securizat pentru plată."}
        </p>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="mt-8 w-full bg-gold px-8 py-5 text-xs font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          {locale === "en"
            ? "Send Booking Request"
            : "Trimite cererea de rezervare"}
        </button>
      </div>
    </aside>
  );
}