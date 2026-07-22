"use client";

import { useParams } from "next/navigation";

import type {
  BookingRoom,
} from "./RoomSelection";

import "./booking-scrollbar.css";

type BookingSummaryProps = {
  checkIn: string;
  checkOut: string;
  nights: number;

  rooms: BookingRoom[];

  selectedRooms: Record<
    string,
    number
  >;

  selectedExtraAdults?: Record<
    string,
    number
  >;

  onSubmit: () => void;

  canSubmit: boolean;
};

type RateBreakdownItem = {
  rateType:
    | "WEEKDAY"
    | "WEEKEND";

  price: number;
  nights: number;
};

function formatPrice(
  value: number,
  locale: "ro" | "en",
): string {
  return new Intl.NumberFormat(
    locale === "ro"
      ? "ro-RO"
      : "en-GB",
    {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatDate(
  value: string,
  locale: "ro" | "en",
): string {
  if (!value) {
    return "—";
  }

  const [year, month, day] =
    value
      .split("-")
      .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return new Intl.DateTimeFormat(
    locale === "ro"
      ? "ro-RO"
      : "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function getExtraAdultLabel(
  quantity: number,
  locale: "ro" | "en",
): string {
  if (locale === "en") {
    return quantity === 1
      ? "1 extra adult"
      : `${quantity} extra adults`;
  }

  return quantity === 1
    ? "1 adult suplimentar"
    : `${quantity} adulți suplimentari`;
}

function getRateTypeLabel(
  rateType:
    | "WEEKDAY"
    | "WEEKEND",
  locale: "ro" | "en",
): string {
  if (rateType === "WEEKEND") {
    return "weekend";
  }

  return locale === "en"
    ? "weekday"
    : "în timpul săptămânii";
}

function getNightsLabel(
  nights: number,
  locale: "ro" | "en",
): string {
  if (locale === "en") {
    return nights === 1
      ? "night"
      : "nights";
  }

  return nights === 1
    ? "noapte"
    : "nopți";
}

function buildRateBreakdown(
  room: BookingRoom,
): RateBreakdownItem[] {
  const groupedRates =
    new Map<
      string,
      RateBreakdownItem
    >();

  for (
    const nightlyRate of
      room.nightlyRates
  ) {
    const key =
      `${nightlyRate.rateType}:${nightlyRate.price}`;

    const existing =
      groupedRates.get(key);

    if (existing) {
      existing.nights += 1;

      continue;
    }

    groupedRates.set(key, {
      rateType:
        nightlyRate.rateType,

      price:
        nightlyRate.price,

      nights: 1,
    });
  }

  return Array.from(
    groupedRates.values(),
  ).sort(
    (
      firstItem,
      secondItem,
    ) => {
      if (
        firstItem.rateType ===
        secondItem.rateType
      ) {
        return (
          firstItem.price -
          secondItem.price
        );
      }

      return firstItem.rateType ===
        "WEEKDAY"
        ? -1
        : 1;
    },
  );
}

export function BookingSummary({
  checkIn,
  checkOut,
  nights,
  rooms,
  selectedRooms,
  selectedExtraAdults = {},
  onSubmit,
  canSubmit,
}: BookingSummaryProps) {
  const params =
    useParams<{
      locale?: string;
    }>();

  const locale =
    params.locale === "en"
      ? "en"
      : "ro";

  const selectedRoomsList =
    rooms.filter(
      (room) =>
        (selectedRooms[
          room.slug
        ] ?? 0) > 0,
    );

  const displayedTotal =
    selectedRoomsList.reduce(
      (sum, room) => {
        const roomQuantity =
          selectedRooms[
            room.slug
          ] ?? 0;

        const extraAdultQuantity =
          selectedExtraAdults[
            room.slug
          ] ?? 0;

        const roomSubtotal =
          room.totalPrice *
          roomQuantity;

        const extraAdultSubtotal =
          room.extraAdultPrice *
          nights *
          extraAdultQuantity;

        return (
          sum +
          roomSubtotal +
          extraAdultSubtotal
        );
      },
      0,
    );

  return (
    <aside className="booking-scroll sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border border-white/10 bg-[#0b0b0b] p-7 xl:p-8">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">
        {locale === "en"
          ? "Your Request"
          : "Cererea ta"}
      </p>

      <h2 className="heading mt-4 text-4xl font-light">
        {locale === "en"
          ? "Booking summary"
          : "Rezumatul rezervării"}
      </h2>

      <div className="mt-7 space-y-4 border-y border-white/10 py-6 text-sm">
        <div className="flex justify-between gap-5 text-white/55">
          <span>
            {locale === "en"
              ? "Check-in"
              : "Sosire"}
          </span>

          <span className="text-white">
            {formatDate(
              checkIn,
              locale,
            )}
          </span>
        </div>

        <div className="flex justify-between gap-5 text-white/55">
          <span>
            {locale === "en"
              ? "Check-out"
              : "Plecare"}
          </span>

          <span className="text-white">
            {formatDate(
              checkOut,
              locale,
            )}
          </span>
        </div>

        <div className="flex justify-between gap-5 text-white/55">
          <span>
            {locale === "en"
              ? "Nights"
              : "Nopți"}
          </span>

          <span className="text-white">
            {nights || "—"}
          </span>
        </div>
      </div>

      <div className="space-y-6 py-6">
        {selectedRoomsList.length ===
        0 ? (
          <p className="text-sm text-white/40">
            {locale === "en"
              ? "No apartments selected yet."
              : "Nu ai selectat încă niciun apartament."}
          </p>
        ) : (
          selectedRoomsList.map(
            (room) => {
              const roomQuantity =
                selectedRooms[
                  room.slug
                ] ?? 0;

              const extraAdultQuantity =
                selectedExtraAdults[
                  room.slug
                ] ?? 0;

              const roomSubtotal =
                room.totalPrice *
                roomQuantity;

              const extraAdultSubtotal =
                room.extraAdultPrice *
                nights *
                extraAdultQuantity;

              const itemTotal =
                roomSubtotal +
                extraAdultSubtotal;

              const rateBreakdown =
                buildRateBreakdown(
                  room,
                );

              return (
                <div
                  key={
                    room.roomTypeId
                  }
                  className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-sm text-white">
                        {room.title}
                      </p>

                      <p className="mt-1 text-xs text-white/35">
                        {roomQuantity}{" "}
                        {locale ===
                        "en"
                          ? roomQuantity ===
                            1
                            ? "apartment"
                            : "apartments"
                          : roomQuantity ===
                              1
                            ? "apartament"
                            : "apartamente"}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm text-white/80">
                      {formatPrice(
                        roomSubtotal,
                        locale,
                      )}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 border-l border-white/10 pl-4">
                    {rateBreakdown.map(
                      (
                        breakdownItem,
                      ) => {
                        const lineSubtotal =
                          breakdownItem.nights *
                          breakdownItem.price *
                          roomQuantity;

                        return (
                          <div
                            key={`${breakdownItem.rateType}:${breakdownItem.price}`}
                            className="flex items-start justify-between gap-4 text-xs"
                          >
                            <p className="leading-5 text-white/35">
                              {
                                breakdownItem.nights
                              }{" "}
                              {getNightsLabel(
                                breakdownItem.nights,
                                locale,
                              )}{" "}
                              {getRateTypeLabel(
                                breakdownItem.rateType,
                                locale,
                              )}
                              {" × "}
                              {formatPrice(
                                breakdownItem.price,
                                locale,
                              )}

                              {roomQuantity >
                                1 && (
                                <>
                                  {" × "}
                                  {
                                    roomQuantity
                                  }
                                </>
                              )}
                            </p>

                            <span className="shrink-0 text-white/55">
                              {formatPrice(
                                lineSubtotal,
                                locale,
                              )}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {extraAdultQuantity >
                    0 && (
                    <div className="mt-4 border-l border-gold/40 pl-4">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="text-xs text-gold">
                            {getExtraAdultLabel(
                              extraAdultQuantity,
                              locale,
                            )}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-white/30">
                            {nights}{" "}
                            {getNightsLabel(
                              nights,
                              locale,
                            )}
                            {" × "}
                            {formatPrice(
                              room.extraAdultPrice,
                              locale,
                            )}

                            {extraAdultQuantity >
                              1 && (
                              <>
                                {" × "}
                                {
                                  extraAdultQuantity
                                }
                              </>
                            )}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-gold">
                          +
                          {formatPrice(
                            extraAdultSubtotal,
                            locale,
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between gap-5 border-t border-white/5 pt-4 text-xs">
                    <span className="text-white/35">
                      Subtotal
                    </span>

                    <span className="text-white/70">
                      {formatPrice(
                        itemTotal,
                        locale,
                      )}
                    </span>
                  </div>
                </div>
              );
            },
          )
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
            {formatPrice(
              displayedTotal,
              locale,
            )}
          </span>
        </div>

        <p className="mt-3 text-[11px] leading-5 text-white/25">
          {locale === "en"
            ? "The final price is recalculated and validated by the booking system when the request is submitted."
            : "Prețul final este recalculat și validat de sistemul de rezervări la trimiterea cererii."}
        </p>

        <p className="mt-4 text-xs leading-6 text-white/35">
          {locale === "en"
            ? "This is a booking request. No payment is collected now. After manual approval, you will receive a secure payment link by email."
            : "Aceasta este o cerere de rezervare. Plata nu se efectuează acum. După aprobarea manuală, vei primi pe email un link securizat pentru plată."}
        </p>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="mt-6 w-full bg-gold px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          {locale === "en"
            ? "Send Booking Request"
            : "Trimite cererea de rezervare"}
        </button>
      </div>
    </aside>
  );
}