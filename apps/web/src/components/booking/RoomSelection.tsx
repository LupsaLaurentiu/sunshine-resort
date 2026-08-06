"use client";

import Image from "next/image";

import {
  usePathname,
} from "next/navigation";

import {
  getLocaleFromPathname,
} from "@/lib/public-routes";

import type {
  NightlyRate,
  NightRateType,
} from "@/types/availability";

export type BookingRoom = {
  roomTypeId: string;
  slug: string;
  title: string;
  description: string;
  image: string;

  maxAdults: number;
  maxExtraAdultsPerRoom: number;

  allowsExtraAdult: boolean;
  availableExtraAdultUnits: number;
  extraAdultPrice: number;

  sizeSqm: number | null;

  totalUnits: number;
  availableUnits: number;

  totalPrice: number;
  averagePricePerNight: number;

  hasPromotion: boolean;
  nightlyRates: NightlyRate[];
};

type RoomSelectionProps = {
  rooms: BookingRoom[];

  selectedRooms: Record<
    string,
    number
  >;

  selectedExtraAdults: Record<
    string,
    number
  >;

  onQuantityChange: (
    slug: string,
    quantity: number,
  ) => void;

  onExtraAdultQuantityChange: (
    slug: string,
    quantity: number,
  ) => void;
};

type RateOverview = {
  minimumPrice: number;
  maximumPrice: number;

  minimumOriginalPrice:
    | number
    | null;

  maximumOriginalPrice:
    | number
    | null;

  hasPromotion: boolean;
};

type Locale =
  | "ro"
  | "en";

const ROOM_SELECTION_CONTENT = {
  ro: {
    availableApartments:
      "Apartamente disponibile",

    chooseApartment:
      "Alege apartamentul.",

    promotion:
      "Promoție",

    maximum:
      "Maximum",

    adults:
      "adulți",

    available:
      "disponibile",

    of:
      "din",

    extraAdult:
      "Adult suplimentar",

    perNight:
      "/ noapte",

    stayTotal:
      "Total sejur",

    approximately:
      "aproximativ",

    rates:
      "Tarife",

    weekday:
      "În timpul săptămânii",

    weekend:
      "Weekend",

    notApplicable:
      "Nu se aplică",

    apartmentCount:
      "Număr de apartamente",

    apartmentCountDescription:
      "Totalul se actualizează în funcție de cantitatea selectată.",

    extraAdults:
      "Adulți suplimentari",

    extraAdultsAllowedDescription:
      "Maximum unul pentru fiecare apartament eligibil.",

    extraAdultsNotAllowedDescription:
      "Acest tip de apartament nu permite adulți suplimentari.",

    noEligibleApartment:
      "Niciun apartament eligibil disponibil pentru această perioadă.",

    apartmentQuantityAriaLabel:
      "Număr de apartamente pentru",

    extraAdultsAriaLabel:
      "Adulți suplimentari pentru",
  },

  en: {
    availableApartments:
      "Available apartments",

    chooseApartment:
      "Choose your apartment.",

    promotion:
      "Promotion",

    maximum:
      "Maximum",

    adults:
      "adults",

    available:
      "available",

    of:
      "of",

    extraAdult:
      "Extra adult",

    perNight:
      "/ night",

    stayTotal:
      "Stay total",

    approximately:
      "approximately",

    rates:
      "Rates",

    weekday:
      "Weekdays",

    weekend:
      "Weekend",

    notApplicable:
      "Not applicable",

    apartmentCount:
      "Number of apartments",

    apartmentCountDescription:
      "The total updates according to the selected quantity.",

    extraAdults:
      "Extra adults",

    extraAdultsAllowedDescription:
      "Maximum one for each eligible apartment.",

    extraAdultsNotAllowedDescription:
      "This apartment type does not allow extra adults.",

    noEligibleApartment:
      "No eligible apartment is available for this period.",

    apartmentQuantityAriaLabel:
      "Number of apartments for",

    extraAdultsAriaLabel:
      "Extra adults for",
  },
} as const;

function formatPrice(
  value: number,
  locale: Locale,
): string {
  return new Intl.NumberFormat(
    locale === "ro"
      ? "ro-RO"
      : "en-GB",
    {
      style:
        "currency",

      currency:
        "RON",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    },
  ).format(
    value,
  );
}

function getRateOverview(
  nightlyRates: NightlyRate[],
  rateType: NightRateType,
): RateOverview | null {
  const matchingRates =
    nightlyRates.filter(
      (
        night,
      ) =>
        night.rateType ===
        rateType,
    );

  if (
    matchingRates.length ===
    0
  ) {
    return null;
  }

  const prices =
    matchingRates.map(
      (
        night,
      ) =>
        night.price,
    );

  const originalPrices =
    matchingRates
      .map(
        (
          night,
        ) =>
          night.originalPrice,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== null,
      );

  return {
    minimumPrice:
      Math.min(
        ...prices,
      ),

    maximumPrice:
      Math.max(
        ...prices,
      ),

    minimumOriginalPrice:
      originalPrices.length >
      0
        ? Math.min(
            ...originalPrices,
          )
        : null,

    maximumOriginalPrice:
      originalPrices.length >
      0
        ? Math.max(
            ...originalPrices,
          )
        : null,

    hasPromotion:
      matchingRates.some(
        (
          night,
        ) =>
          night.isPromotion,
      ),
  };
}

function formatRateRange(
  minimumPrice: number,
  maximumPrice: number,
  locale: Locale,
): string {
  if (
    minimumPrice ===
    maximumPrice
  ) {
    return formatPrice(
      minimumPrice,
      locale,
    );
  }

  return `${formatPrice(
    minimumPrice,
    locale,
  )} – ${formatPrice(
    maximumPrice,
    locale,
  )}`;
}

function RateCard({
  label,
  overview,
  locale,
  perNightLabel,
  notApplicableLabel,
}: {
  label: string;
  overview: RateOverview | null;
  locale: Locale;
  perNightLabel: string;
  notApplicableLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-white/35">
          {label}
        </p>

        {overview ? (
          <div className="mt-1 flex items-baseline gap-2">
            <p
              className={[
                "text-sm",
                overview.hasPromotion
                  ? "text-gold"
                  : "text-white/75",
              ].join(
                " ",
              )}
            >
              {formatRateRange(
                overview.minimumPrice,
                overview.maximumPrice,
                locale,
              )}
            </p>

            <span className="text-[10px] text-white/30">
              {perNightLabel}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-sm text-white/25">
            {notApplicableLabel}
          </p>
        )}
      </div>

      {overview?.hasPromotion &&
        overview.minimumOriginalPrice !==
          null &&
        overview.maximumOriginalPrice !==
          null && (
          <p className="text-xs text-white/25 line-through">
            {formatRateRange(
              overview.minimumOriginalPrice,
              overview.maximumOriginalPrice,
              locale,
            )}
          </p>
        )}
    </div>
  );
}

export function RoomSelection({
  rooms,
  selectedRooms,
  selectedExtraAdults,
  onQuantityChange,
  onExtraAdultQuantityChange,
}: RoomSelectionProps) {
  const pathname =
    usePathname();

  const locale =
    getLocaleFromPathname(
      pathname,
    );

  const content =
    ROOM_SELECTION_CONTENT[
      locale
    ];

  function handleRoomQuantityChange(
    room: BookingRoom,
    quantity: number,
  ) {
    onQuantityChange(
      room.slug,
      quantity,
    );

    const currentExtraAdultQuantity =
      selectedExtraAdults[
        room.slug
      ] ?? 0;

    const maximumExtraAdultQuantity =
      Math.min(
        quantity,
        room.availableExtraAdultUnits,
      );

    if (
      currentExtraAdultQuantity >
      maximumExtraAdultQuantity
    ) {
      onExtraAdultQuantityChange(
        room.slug,
        maximumExtraAdultQuantity,
      );
    }

    if (
      quantity === 0
    ) {
      onExtraAdultQuantityChange(
        room.slug,
        0,
      );
    }
  }

  return (
    <section>
      <div className="mb-12">
        <p className="mb-4 text-xs uppercase tracking-[0.45em] text-gold">
          {content.availableApartments}
        </p>

        <h2 className="heading text-5xl font-light md:text-7xl">
          {content.chooseApartment}
        </h2>
      </div>

      <div className="space-y-8">
        {rooms.map(
          (
            room,
          ) => {
            const selectedQuantity =
              selectedRooms[
                room.slug
              ] ?? 0;

            const selectedExtraAdultQuantity =
              selectedExtraAdults[
                room.slug
              ] ?? 0;

            const maximumExtraAdultQuantity =
              Math.min(
                selectedQuantity,
                room.availableExtraAdultUnits,
              );

            const canSelectExtraAdults =
              room.allowsExtraAdult &&
              room.maxExtraAdultsPerRoom >
                0 &&
              selectedQuantity >
                0 &&
              maximumExtraAdultQuantity >
                0;

            const weekdayOverview =
              getRateOverview(
                room.nightlyRates,
                "WEEKDAY",
              );

            const weekendOverview =
              getRateOverview(
                room.nightlyRates,
                "WEEKEND",
              );

            return (
              <article
                key={
                  room.roomTypeId
                }
                className="grid overflow-hidden border border-white/10 bg-[#0b0b0b] lg:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="relative min-h-[320px]">
                  <Image
                    src={
                      room.image
                    }
                    alt={
                      room.title
                    }
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />

                  {room.hasPromotion && (
                    <div className="absolute left-5 top-5 bg-gold px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black">
                      {
                        content.promotion
                      }
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between p-8 md:p-10">
                  <div>
                    <div className="flex flex-col justify-between gap-6 sm:flex-row">
                      <div className="max-w-xl">
                        <h3 className="heading text-4xl font-light">
                          {
                            room.title
                          }
                        </h3>

                        <p className="mt-5 text-sm leading-7 text-white/55">
                          {
                            room.description
                          }
                        </p>

                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.22em] text-white/40">
                          <span>
                            {
                              content.maximum
                            }{" "}
                            {
                              room.maxAdults
                            }{" "}
                            {
                              content.adults
                            }
                          </span>

                          {room.sizeSqm !==
                            null && (
                            <span>
                              {
                                room.sizeSqm
                              }{" "}
                              m²
                            </span>
                          )}

                          <span>
                            {
                              room.availableUnits
                            }{" "}
                            {
                              content.of
                            }{" "}
                            {
                              room.totalUnits
                            }{" "}
                            {
                              content.available
                            }
                          </span>
                        </div>

                        {room.allowsExtraAdult && (
                          <p className="mt-4 text-xs leading-6 text-white/35">
                            {
                              content.extraAdult
                            }
                            :{" "}
                            <span className="text-gold">
                              {formatPrice(
                                room.extraAdultPrice,
                                locale,
                              )}{" "}
                              {
                                content.perNight
                              }
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 sm:text-right">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                          {
                            content.stayTotal
                          }
                        </p>

                        <p className="heading mt-2 text-3xl">
                          {formatPrice(
                            room.totalPrice,
                            locale,
                          )}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {
                            content.approximately
                          }{" "}
                          {formatPrice(
                            room.averagePricePerNight,
                            locale,
                          )}{" "}
                          {
                            content.perNight
                          }
                        </p>
                      </div>
                    </div>

                    {room.nightlyRates.length >
                      0 && (
                      <div className="mt-8 border-t border-white/10 pt-5">
                        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold">
                          {
                            content.rates
                          }
                        </p>

                        <div>
                          <RateCard
                            label={
                              content.weekday
                            }
                            overview={
                              weekdayOverview
                            }
                            locale={
                              locale
                            }
                            perNightLabel={
                              content.perNight
                            }
                            notApplicableLabel={
                              content.notApplicable
                            }
                          />

                          <RateCard
                            label={
                              content.weekend
                            }
                            overview={
                              weekendOverview
                            }
                            locale={
                              locale
                            }
                            perNightLabel={
                              content.perNight
                            }
                            notApplicableLabel={
                              content.notApplicable
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 grid items-stretch gap-6 border-t border-white/10 pt-7 md:grid-cols-2">
                    <div className="flex flex-col">
                      <span className="block text-xs uppercase tracking-[0.25em] text-gold">
                        {
                          content.apartmentCount
                        }
                      </span>

                      <p className="mt-2 min-h-[48px] text-xs leading-6 text-white/35">
                        {
                          content.apartmentCountDescription
                        }
                      </p>

                      <select
                        aria-label={`${content.apartmentQuantityAriaLabel} ${room.title}`}
                        value={
                          selectedQuantity
                        }
                        onChange={(event) =>
                          handleRoomQuantityChange(
                            room,
                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                        className="mt-auto min-w-28 self-start border border-white/20 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-gold"
                      >
                        {Array.from(
                          {
                            length:
                              room.availableUnits +
                              1,
                          },
                          (
                            _,
                            index,
                          ) =>
                            index,
                        ).map(
                          (
                            quantity,
                          ) => (
                            <option
                              key={
                                quantity
                              }
                              value={
                                quantity
                              }
                            >
                              {
                                quantity
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div
                      className={[
                        "flex flex-col",
                        canSelectExtraAdults
                          ? ""
                          : "opacity-45",
                      ].join(
                        " ",
                      )}
                    >
                      <span className="block text-xs uppercase tracking-[0.25em] text-gold">
                        {
                          content.extraAdults
                        }
                      </span>

                      <p className="mt-2 min-h-[48px] text-xs leading-6 text-white/35">
                        {room.allowsExtraAdult
                          ? content.extraAdultsAllowedDescription
                          : content.extraAdultsNotAllowedDescription}
                      </p>

                      <select
                        aria-label={`${content.extraAdultsAriaLabel} ${room.title}`}
                        value={
                          selectedExtraAdultQuantity
                        }
                        disabled={
                          !canSelectExtraAdults
                        }
                        onChange={(event) =>
                          onExtraAdultQuantityChange(
                            room.slug,
                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                        className="mt-auto min-w-28 self-start border border-white/20 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {Array.from(
                          {
                            length:
                              maximumExtraAdultQuantity +
                              1,
                          },
                          (
                            _,
                            index,
                          ) =>
                            index,
                        ).map(
                          (
                            quantity,
                          ) => (
                            <option
                              key={
                                quantity
                              }
                              value={
                                quantity
                              }
                            >
                              {
                                quantity
                              }
                            </option>
                          ),
                        )}
                      </select>

                      {room.allowsExtraAdult &&
                        selectedQuantity >
                          0 &&
                        room.availableExtraAdultUnits ===
                          0 && (
                          <p className="mt-3 text-xs text-amber-200/60">
                            {
                              content.noEligibleApartment
                            }
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}