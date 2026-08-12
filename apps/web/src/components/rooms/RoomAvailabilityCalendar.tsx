"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import type {
  PublicLocale,
} from "@/lib/public-routes";

type CalendarDay = {
  date: string;

  rateType:
    | "WEEKDAY"
    | "WEEKEND";

  price: number;

  originalPrice:
    | number
    | null;

  isPromotion: boolean;

  promotionTitleRo:
    | string
    | null;

  promotionTitleEn:
    | string
    | null;

  availableUnits: number;

  isAvailable: boolean;

  minimumStay: number;
};

type CalendarResponse = {
  roomType: {
    id: string;
    slug: string;

    nameRo: string;
    nameEn: string;
  };

  from: string;
  to: string;

  days:
    CalendarDay[];
};

type AvailabilityResponse = {
  roomTypes: Array<{
    slug: string;
    availableUnits: number;
  }>;
};

type RoomAvailabilityCalendarProps = {
  roomSlug: string;

  locale:
    PublicLocale;

  bookingHref:
    string;
};

const CONTENT = {
  ro: {
    eyebrow:
      "Disponibilitate & tarife",

    title:
      "Alege perioada sejurului.",

    description:
      "Selectează data sosirii și data plecării. Tarifele afișate sunt calculate pentru fiecare noapte.",

    weekdays: [
      "Lu",
      "Ma",
      "Mi",
      "Jo",
      "Vi",
      "Sâ",
      "Du",
    ],

    promotion:
      "Promoție",

    unavailable:
      "Indisponibil",

    unavailableNight:
      "Noapte indisponibilă",

    checkIn:
      "Sosire",

    checkOut:
      "Plecare",

    nightsLabel:
      "Nopți",

    total:
      "Total",

    reserve:
      "Rezervă",

    selectCheckIn:
      "Selectează data sosirii.",

    selectCheckOut:
      "Acum selectează data plecării.",

    invalidRange:
      "Perioada selectată conține nopți indisponibile.",

    minimumStay:
      "Pentru sosirile de vineri sau sâmbătă sunt necesare minimum 2 nopți.",

    noAvailability:
      "Apartamentul nu mai este disponibil pentru întreaga perioadă selectată.",

    loading:
      "Se încarcă disponibilitatea...",

    error:
      "Disponibilitatea nu a putut fi încărcată.",

    validating:
      "Se verifică...",
  },

  en: {
    eyebrow:
      "Availability & rates",

    title:
      "Choose your stay.",

    description:
      "Select your arrival and departure dates. The displayed rates are calculated for each night.",

    weekdays: [
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa",
      "Su",
    ],

    promotion:
      "Promotion",

    unavailable:
      "Unavailable",

    unavailableNight:
      "Unavailable night",

    checkIn:
      "Check-in",

    checkOut:
      "Check-out",

    nightsLabel:
      "Nights",

    total:
      "Total",

    reserve:
      "Book",

    selectCheckIn:
      "Select your arrival date.",

    selectCheckOut:
      "Now select your departure date.",

    invalidRange:
      "The selected stay contains unavailable nights.",

    minimumStay:
      "Friday and Saturday arrivals require a minimum stay of 2 nights.",

    noAvailability:
      "This apartment is no longer available for the entire selected stay.",

    loading:
      "Loading availability...",

    error:
      "Availability could not be loaded.",

    validating:
      "Checking...",
  },
} as const;

/**
 * Slug-urile publice sunt SEO-friendly și nu sunt
 * neapărat identice cu slug-urile RoomType din DB.
 *
 * IMPORTANT:
 * - URL-ul public continuă să folosească deluxe-apartment etc.
 * - doar request-ul către backend folosește slug-ul DB.
 */
function getBackendRoomSlug(
  publicSlug: string,
): string {
  const slugMap:
    Record<
      string,
      string
    > = {
    "signature-apartment":
      "signature-apartment",

    "deluxe-apartment":
      "deluxe",

    "premium-apartment":
      "premium",

    "intimate-apartment":
      "intimate",
  };

  return (
    slugMap[
      publicSlug
    ] ??
    publicSlug
  );
}

function normalizeRoomSlug(
  slug: string,
): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(
      /^apartament-/,
      "",
    )
    .replace(
      /^apartment-/,
      "",
    )
    .replace(
      /-apartament$/,
      "",
    )
    .replace(
      /-apartment$/,
      "",
    );
}

function toDate(
  value: string,
): Date {
  return new Date(
    `${value}T12:00:00`,
  );
}

function toDateString(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function addMonths(
  date: Date,
  amount: number,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() +
      amount,
    1,
    12,
  );
}

function endOfMonth(
  date: Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() +
      1,
    0,
    12,
  );
}

function differenceInDays(
  start: string,
  end: string,
): number {
  return Math.round(
    (
      toDate(
        end,
      ).getTime() -
      toDate(
        start,
      ).getTime()
    ) /
      86_400_000,
  );
}

function formatMonth(
  date: Date,
  locale: PublicLocale,
): string {
  return new Intl.DateTimeFormat(
    locale === "ro"
      ? "ro-RO"
      : "en-GB",
    {
      month:
        "long",

      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function formatDate(
  value: string,
  locale: PublicLocale,
): string {
  return new Intl.DateTimeFormat(
    locale === "ro"
      ? "ro-RO"
      : "en-GB",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(
    toDate(
      value,
    ),
  );
}

function formatPrice(
  value: number,
  locale: PublicLocale,
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

      maximumFractionDigits:
        0,
    },
  ).format(
    value,
  );
}

export function RoomAvailabilityCalendar({
  roomSlug,
  locale,
  bookingHref,
}: RoomAvailabilityCalendarProps) {
  const router =
    useRouter();

  const content =
    CONTENT[
      locale
    ];

  const tomorrow =
    useMemo(
      () => {
        const date =
          new Date();

        date.setHours(
          12,
          0,
          0,
          0,
        );

        date.setDate(
          date.getDate() +
            1,
        );

        return date;
      },
      [],
    );

  const [
    firstMonth,
    setFirstMonth,
  ] =
    useState(
      new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        1,
        12,
      ),
    );

  const [
    calendar,
    setCalendar,
  ] =
    useState<
      CalendarResponse | null
    >(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    isValidating,
    setIsValidating,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );

  const [
    checkIn,
    setCheckIn,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    checkOut,
    setCheckOut,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const secondMonth =
    useMemo(
      () =>
        addMonths(
          firstMonth,
          1,
        ),
      [
        firstMonth,
      ],
    );

  useEffect(
    () => {
      const controller =
        new AbortController();

      async function loadCalendar() {
        setIsLoading(
          true,
        );

        setError(
          "",
        );

        const fromDate =
          firstMonth <
          new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(),
            tomorrow.getDate(),
            12,
          )
            ? tomorrow
            : firstMonth;

        const to =
          endOfMonth(
            secondMonth,
          );

        try {
          const apiUrl =
            process.env
              .NEXT_PUBLIC_API_URL;

          if (
            !apiUrl
          ) {
            throw new Error(
              "NEXT_PUBLIC_API_URL is missing.",
            );
          }

          /*
           * Aici folosim slug-ul real din DB.
           *
           * Exemplu:
           *
           * /ro/camere/deluxe-apartment
           *
           * devine pentru backend:
           *
           * roomTypeSlug=deluxe
           */
          const backendRoomSlug =
            getBackendRoomSlug(
              roomSlug,
            );

          const searchParams =
            new URLSearchParams({
              roomTypeSlug:
                backendRoomSlug,

              from:
                toDateString(
                  fromDate,
                ),

              to:
                toDateString(
                  to,
                ),
            });

          const response =
            await fetch(
              `${apiUrl}/availability/calendar?${searchParams.toString()}`,
              {
                signal:
                  controller.signal,

                cache:
                  "no-store",
              },
            );

          if (
            !response.ok
          ) {
            throw new Error(
              `Calendar request failed: ${response.status}`,
            );
          }

          const data =
            (await response.json()) as CalendarResponse;

          setCalendar(
            data,
          );
        } catch (
          requestError
        ) {
          if (
            requestError instanceof
              DOMException &&
            requestError.name ===
              "AbortError"
          ) {
            return;
          }

          console.error(
            requestError,
          );

          setCalendar(
            null,
          );

          setError(
            content.error,
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      }

      void loadCalendar();

      return () => {
        controller.abort();
      };
    },
    [
      content.error,
      firstMonth,
      roomSlug,
      secondMonth,
      tomorrow,
    ],
  );

  const dayByDate =
    useMemo(
      () =>
        new Map(
          (
            calendar
              ?.days ??
            []
          ).map(
            (
              day,
            ) => [
              day.date,
              day,
            ],
          ),
        ),
      [
        calendar,
      ],
    );

  const selectedNights =
    useMemo(
      () => {
        if (
          !checkIn ||
          !checkOut
        ) {
          return [];
        }

        return (
          calendar
            ?.days.filter(
              (
                day,
              ) =>
                day.date >=
                  checkIn &&
                day.date <
                  checkOut,
            ) ??
          []
        );
      },
      [
        calendar,
        checkIn,
        checkOut,
      ],
    );

  const totalPrice =
    useMemo(
      () =>
        selectedNights.reduce(
          (
            total,
            day,
          ) =>
            total +
            day.price,
          0,
        ),
      [
        selectedNights,
      ],
    );

  const nights =
    checkIn &&
    checkOut
      ? differenceInDays(
          checkIn,
          checkOut,
        )
      : 0;

  function isRangeAvailable(
    start: string,
    end: string,
  ): boolean {
    const current =
      new Date(
        toDate(
          start,
        ),
      );

    const endDate =
      toDate(
        end,
      );

    /*
     * Check-out-ul nu reprezintă o noapte consumată,
     * deci verificăm doar [checkIn, checkOut).
     */
    while (
      current <
      endDate
    ) {
      const day =
        dayByDate.get(
          toDateString(
            current,
          ),
        );

      if (
        !day ||
        !day.isAvailable
      ) {
        return false;
      }

      current.setDate(
        current.getDate() +
          1,
      );
    }

    return true;
  }

  function handleDayClick(
    date: string,
  ) {
    setError(
      "",
    );

    const day =
      dayByDate.get(
        date,
      );

    if (
      !day
    ) {
      return;
    }

    /*
     * Primul click = check-in.
     *
     * Dacă exista deja un interval complet,
     * primul click începe o selecție nouă.
     */
    if (
      !checkIn ||
      checkOut
    ) {
      if (
        !day.isAvailable
      ) {
        return;
      }

      setCheckIn(
        date,
      );

      setCheckOut(
        null,
      );

      return;
    }

    /*
     * Click înainte de check-in-ul actual:
     * mutăm check-in-ul.
     */
    if (
      date <=
      checkIn
    ) {
      if (
        day.isAvailable
      ) {
        setCheckIn(
          date,
        );

        setCheckOut(
          null,
        );
      }

      return;
    }

    const requestedNights =
      differenceInDays(
        checkIn,
        date,
      );

    const checkInDay =
      dayByDate.get(
        checkIn,
      );

    const minimumStay =
      checkInDay
        ?.minimumStay ??
      1;

    if (
      requestedNights <
      minimumStay
    ) {
      setError(
        content.minimumStay,
      );

      return;
    }

    if (
      !isRangeAvailable(
        checkIn,
        date,
      )
    ) {
      setError(
        content.invalidRange,
      );

      return;
    }

    setCheckOut(
      date,
    );
  }

  async function handleReserve() {
    if (
      !checkIn ||
      !checkOut
    ) {
      return;
    }

    setError(
      "",
    );

    setIsValidating(
      true,
    );

    try {
      const apiUrl =
        process.env
          .NEXT_PUBLIC_API_URL;

      if (
        !apiUrl
      ) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is missing.",
        );
      }

      /*
       * Înainte de redirect facem încă o verificare
       * pe endpoint-ul principal de availability.
       *
       * Calendarul este pentru UX.
       * Endpoint-ul principal rămâne sursa finală
       * pentru validarea întregului sejur.
       */
      const params =
        new URLSearchParams({
          checkIn,
          checkOut,

          adults:
            "2",
        });

      const response =
        await fetch(
          `${apiUrl}/availability?${params.toString()}`,
          {
            cache:
              "no-store",
          },
        );

      if (
        !response.ok
      ) {
        throw new Error(
          `Availability validation failed: ${response.status}`,
        );
      }

      const availability =
        (await response.json()) as AvailabilityResponse;

      const requestedSlug =
        normalizeRoomSlug(
          roomSlug,
        );

      const roomStillAvailable =
        availability.roomTypes.some(
          (
            room,
          ) =>
            room.availableUnits >
              0 &&
            normalizeRoomSlug(
              room.slug,
            ) ===
              requestedSlug,
        );

      if (
        !roomStillAvailable
      ) {
        setError(
          content.noAvailability,
        );

        return;
      }

      /*
       * Pentru redirect păstrăm slug-ul PUBLIC.
       *
       * BookingPageClient îl normalizează pentru
       * preselectarea camerei.
       */
      const query =
        new URLSearchParams({
          checkIn,
          checkOut,

          roomType:
            roomSlug,
        });

      router.push(
        `${bookingHref}?${query.toString()}`,
      );
    } catch (
      requestError
    ) {
      console.error(
        requestError,
      );

      setError(
        content.error,
      );
    } finally {
      setIsValidating(
        false,
      );
    }
  }

  function renderMonth(
    month: Date,
  ) {
    const year =
      month.getFullYear();

    const monthIndex =
      month.getMonth();

    const firstDay =
      new Date(
        year,
        monthIndex,
        1,
        12,
      );

    const lastDay =
      endOfMonth(
        month,
      );

    const mondayBasedOffset =
      (
        firstDay.getDay() +
        6
      ) %
      7;

    const cells:
      Array<
        Date | null
      > =
      Array.from(
        {
          length:
            mondayBasedOffset,
        },
        () =>
          null,
      );

    for (
      let day = 1;
      day <=
      lastDay.getDate();
      day += 1
    ) {
      cells.push(
        new Date(
          year,
          monthIndex,
          day,
          12,
        ),
      );
    }

    return (
      <div>
        <h3 className="heading text-center text-3xl font-light capitalize text-white/90">
          {formatMonth(
            month,
            locale,
          )}
        </h3>

        <div
          className="mt-8 grid"
          style={{
            gridTemplateColumns:
              "repeat(7, minmax(0, 1fr))",
          }}
        >
          {content.weekdays.map(
            (
              weekday,
            ) => (
              <div
                key={
                  weekday
                }
                className="pb-4 text-center text-[9px] uppercase tracking-[0.18em] text-white/30"
              >
                {
                  weekday
                }
              </div>
            ),
          )}

          {cells.map(
            (
              cell,
              index,
            ) => {
              if (
                !cell
              ) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[82px] border-t border-white/[0.06]"
                  />
                );
              }

              const date =
                toDateString(
                  cell,
                );

              const day =
                dayByDate.get(
                  date,
                );

              const isBeforeTomorrow =
                cell <
                tomorrow;

              const isAvailable =
                Boolean(
                  day?.isAvailable,
                ) &&
                !isBeforeTomorrow;

              /*
               * Noaptea este ocupată, dar ziua poate fi
               * folosită drept check-out dacă toate nopțile
               * anterioare din interval sunt disponibile.
               */
              const isUnavailableNight =
                Boolean(
                  day,
                ) &&
                !isBeforeTomorrow &&
                !day?.isAvailable;

              const isCheckIn =
                date ===
                checkIn;

              const isCheckOut =
                date ===
                checkOut;

              const isInsideRange =
                Boolean(
                  checkIn &&
                  checkOut &&
                  date >
                    checkIn &&
                  date <
                    checkOut,
                );

              const canBeCheckout =
                Boolean(
                  checkIn &&
                  !checkOut &&
                  date >
                    checkIn &&
                  isRangeAvailable(
                    checkIn,
                    date,
                  ),
                );

              const canClick =
                isAvailable ||
                canBeCheckout;

              return (
                <div
                  key={
                    date
                  }
                  className="group relative border-t border-white/[0.06]"
                >
                  <button
                    type="button"
                    disabled={
                      !canClick
                    }
                    onClick={() =>
                      handleDayClick(
                        date,
                      )
                    }
                    title={
                      isUnavailableNight
                        ? content.unavailableNight
                        : undefined
                    }
                    className={[
                      "relative flex min-h-[82px] w-full flex-col items-center justify-center overflow-hidden px-1 py-3 transition duration-300",

                      canClick
                        ? "cursor-pointer hover:bg-white/[0.035]"
                        : "cursor-default",

                      isBeforeTomorrow
                        ? "opacity-15"
                        : "",

                      isUnavailableNight
                        ? "bg-white/[0.012]"
                        : "",

                      isInsideRange
                        ? "bg-gold/[0.055]"
                        : "",

                      isCheckIn ||
                      isCheckOut
                        ? "bg-gold text-black hover:bg-gold"
                        : "",
                    ].join(
                      " ",
                    )}
                  >
                    {isUnavailableNight &&
                      !isCheckIn &&
                      !isCheckOut && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 opacity-40"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 7px)",
                          }}
                        />
                      )}

                    <span
                      className={[
                        "relative z-10 text-[11px]",

                        isCheckIn ||
                        isCheckOut
                          ? "font-semibold text-black"
                          : isUnavailableNight
                            ? "text-white/35"
                            : "text-white/75",
                      ].join(
                        " ",
                      )}
                    >
                      {
                        cell.getDate()
                      }
                    </span>

                    {day &&
                      !isBeforeTomorrow && (
                        <>
                          <span
                            className={[
                              "relative z-10 mt-2 text-[10px] font-medium",

                              isCheckIn ||
                              isCheckOut
                                ? "text-black"
                                : isUnavailableNight
                                  ? "text-white/25"
                                  : day.isPromotion
                                    ? "text-gold"
                                    : "text-white/50",
                            ].join(
                              " ",
                            )}
                          >
                            {
                              day.price
                            }
                          </span>

                          <span
                            className={[
                              "relative z-10 mt-0.5 text-[7px] uppercase tracking-[0.12em]",

                              isCheckIn ||
                              isCheckOut
                                ? "text-black/65"
                                : isUnavailableNight
                                  ? "text-white/15"
                                  : "text-white/20",
                            ].join(
                              " ",
                            )}
                          >
                            RON
                          </span>

                          {day.isPromotion &&
                            !isUnavailableNight &&
                            !isCheckIn &&
                            !isCheckOut && (
                              <span className="relative z-10 mt-1.5 h-1 w-1 rounded-full bg-gold" />
                            )}
                        </>
                      )}
                  </button>

                  {day?.isPromotion &&
                    !isUnavailableNight &&
                    canClick && (
                      <div className="pointer-events-none absolute bottom-[calc(100%-4px)] left-1/2 z-30 hidden w-48 -translate-x-1/2 border border-gold/25 bg-[#111] p-4 text-left shadow-2xl group-hover:block">
                        <p className="text-[8px] uppercase tracking-[0.26em] text-gold">
                          {
                            content.promotion
                          }
                        </p>

                        <p className="mt-2 text-xs leading-5 text-white/75">
                          {locale ===
                          "ro"
                            ? day.promotionTitleRo ??
                              content.promotion
                            : day.promotionTitleEn ??
                              content.promotion}
                        </p>

                        {day.originalPrice && (
                          <p className="mt-2 text-[10px] text-white/35 line-through">
                            {formatPrice(
                              day.originalPrice,
                              locale,
                            )}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-gold">
                          {formatPrice(
                            day.price,
                            locale,
                          )}
                        </p>
                      </div>
                    )}
                </div>
              );
            },
          )}
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="room-availability-title"
      className="bg-[#080808] px-6 py-28 text-[#f5f2eb] sm:px-8 sm:py-32 md:py-40"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-3xl">
          <p className="text-[9px] font-medium uppercase tracking-[0.46em] text-gold sm:text-[10px]">
            {
              content.eyebrow
            }
          </p>

          <h2
            id="room-availability-title"
            className="heading mt-7 text-4xl font-light leading-[1.04] sm:text-5xl md:text-6xl"
          >
            {
              content.title
            }
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-8 text-white/45 sm:text-[15px]">
            {
              content.description
            }
          </p>
        </div>

        <div className="mt-14 border-y border-white/10 py-8">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setFirstMonth(
                  (
                    current,
                  ) =>
                    addMonths(
                      current,
                      -1,
                    ),
                )
              }
              disabled={
                firstMonth.getFullYear() ===
                  tomorrow.getFullYear() &&
                firstMonth.getMonth() ===
                  tomorrow.getMonth()
              }
              className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/50 transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-20"
              aria-label={
                locale ===
                "ro"
                  ? "Luna anterioară"
                  : "Previous month"
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <p className="text-center text-[9px] uppercase tracking-[0.28em] text-white/30">
              {checkIn
                ? checkOut
                  ? `${formatDate(
                      checkIn,
                      locale,
                    )} — ${formatDate(
                      checkOut,
                      locale,
                    )}`
                  : content.selectCheckOut
                : content.selectCheckIn}
            </p>

            <button
              type="button"
              onClick={() =>
                setFirstMonth(
                  (
                    current,
                  ) =>
                    addMonths(
                      current,
                      1,
                    ),
                )
              }
              className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/50 transition hover:border-gold hover:text-gold"
              aria-label={
                locale ===
                "ro"
                  ? "Luna următoare"
                  : "Next month"
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-white/30">
                <LoaderCircle className="h-4 w-4 animate-spin" />

                {
                  content.loading
                }
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
                {
                  renderMonth(
                    firstMonth,
                  )
                }

                <div className="hidden lg:block">
                  {
                    renderMonth(
                      secondMonth,
                    )
                  }
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/[0.06] pt-5">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />

                  <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                    {
                      content.promotion
                    }
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 border border-white/10"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(135deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1px, transparent 1px, transparent 5px)",
                    }}
                  />

                  <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">
                    {
                      content.unavailable
                    }
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 border-l border-red-400/60 pl-4 text-sm leading-7 text-red-300"
          >
            {
              error
            }
          </p>
        )}

        {checkIn &&
          checkOut && (
            <div className="mt-8 border border-white/10 bg-[#0b0b0b]">
              <div className="flex flex-col gap-8 p-7 sm:p-8 lg:flex-row lg:items-center lg:gap-12">
                <div className="grid flex-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.26em] text-white/30">
                      {
                        content.checkIn
                      }
                    </p>

                    <p className="mt-3 text-sm text-white/80">
                      {formatDate(
                        checkIn,
                        locale,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.26em] text-white/30">
                      {
                        content.checkOut
                      }
                    </p>

                    <p className="mt-3 text-sm text-white/80">
                      {formatDate(
                        checkOut,
                        locale,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.26em] text-white/30">
                      {
                        content.nightsLabel
                      }
                    </p>

                    <p className="mt-3 text-sm text-white/80">
                      {
                        nights
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.26em] text-white/30">
                      {
                        content.total
                      }
                    </p>

                    <p className="heading mt-2 text-2xl font-light text-gold">
                      {formatPrice(
                        totalPrice,
                        locale,
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void handleReserve()
                  }
                  disabled={
                    isValidating
                  }
                  className="group inline-flex min-h-14 shrink-0 items-center justify-center gap-4 bg-gold px-10 py-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-black transition duration-500 hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:text-[10px]"
                >
                  {isValidating
                    ? content.validating
                    : content.reserve}

                  {isValidating ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                  )}
                </button>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}