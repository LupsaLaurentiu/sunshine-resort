"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowUp,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  publicRooms,
} from "@/data/rooms";

import {
  useAvailability,
} from "@/hooks/useAvailability";

import {
  useCreateReservation,
} from "@/hooks/useCreateReservation";

import {
  AvailabilitySearch,
} from "./AvailabilitySearch";

import {
  BookingHeader,
} from "./BookingHeader";

import {
  BookingSummary,
} from "./BookingSummary";

import {
  BookingSuccess,
} from "./BookingSuccess";

import {
  GuestDetailsForm,
  type GuestDetails,
} from "./GuestDetailsForm";

import {
  RoomSelection,
  type BookingRoom,
} from "./RoomSelection";

const DEFAULT_ADULTS_PER_ROOM =
  2;

const FALLBACK_ROOM_IMAGE =
  "/hero-mockup.jpg";

const initialGuest: GuestDetails = {
  firstName:
    "",

  lastName:
    "",

  email:
    "",

  phone:
    "",

  message:
    "",

  acceptedTerms:
    false,
};

const BOOKING_PAGE_CONTENT = {
  ro: {
    availabilityEyebrow:
      "Disponibilitate",

    noAvailabilityTitle:
      "Nu există apartamente disponibile.",

    noAvailabilityDescription:
      "Selectează o altă perioadă pentru a verifica disponibilitatea.",

    chooseAnotherPeriod:
      "Alege altă perioadă",
  },

  en: {
    availabilityEyebrow:
      "Availability",

    noAvailabilityTitle:
      "No apartments are available.",

    noAvailabilityDescription:
      "Select another period to check availability.",

    chooseAnotherPeriod:
      "Choose another period",
  },
} as const;

function calculateNights(
  checkIn: string,
  checkOut: string,
): number {
  if (
    !checkIn ||
    !checkOut
  ) {
    return 0;
  }

  const start =
    new Date(
      `${checkIn}T12:00:00`,
    );

  const end =
    new Date(
      `${checkOut}T12:00:00`,
    );

  return Math.max(
    0,
    Math.round(
      (
        end.getTime() -
        start.getTime()
      ) /
        86_400_000,
    ),
  );
}

function getMinimumNightsForCheckIn(
  checkIn: string,
): number {
  if (!checkIn) {
    return 1;
  }

  const checkInDate =
    new Date(
      `${checkIn}T12:00:00`,
    );

  const dayOfWeek =
    checkInDate.getDay();

  return dayOfWeek === 5 ||
    dayOfWeek === 6
    ? 2
    : 1;
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

export function BookingPageClient() {
  const params =
    useParams<{
      locale?: string;
    }>();

  const locale =
    params.locale === "en"
      ? "en"
      : "ro";

  const content =
    BOOKING_PAGE_CONTENT[
      locale
    ];

  const availabilitySectionRef =
    useRef<HTMLElement | null>(
      null,
    );

  const resultsSectionRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    checkIn,
    setCheckIn,
  ] =
    useState("");

  const [
    checkOut,
    setCheckOut,
  ] =
    useState("");

  const [
    searched,
    setSearched,
  ] =
    useState(false);

  const [
    submitted,
    setSubmitted,
  ] =
    useState(false);

  const [
    validationError,
    setValidationError,
  ] =
    useState("");

  const [
    selectedRooms,
    setSelectedRooms,
  ] =
    useState<
      Record<
        string,
        number
      >
    >({});

  const [
    selectedExtraAdults,
    setSelectedExtraAdults,
  ] =
    useState<
      Record<
        string,
        number
      >
    >({});

  const [
    guest,
    setGuest,
  ] =
    useState<GuestDetails>(
      initialGuest,
    );

  const {
    availability,
    error:
      availabilityError,
    isLoading:
      isCheckingAvailability,
    searchAvailability,
    resetAvailability,
  } =
    useAvailability();

  const {
    reservation,
    error:
      reservationError,
    isLoading:
      isCreatingReservation,
    submitReservation,
    resetReservation,
  } =
    useCreateReservation();

  const nights =
    useMemo(
      () =>
        calculateNights(
          checkIn,
          checkOut,
        ),
      [
        checkIn,
        checkOut,
      ],
    );

  const minimumNights =
    useMemo(
      () =>
        getMinimumNightsForCheckIn(
          checkIn,
        ),
      [
        checkIn,
      ],
    );

  const availableRooms =
  useMemo<
    BookingRoom[]
  >(() => {
    if (!availability) {
      return [];
    }

    return availability.roomTypes
      .filter(
        (
          roomType,
        ) =>
          roomType.availableUnits >
          0,
      )
      .map(
        (
          roomType,
        ) => {
          const normalizedBackendSlug =
            normalizeRoomSlug(
              roomType.slug,
            );

          const publicContent =
            publicRooms.find(
              (
                room,
              ) =>
                normalizeRoomSlug(
                  room.slug,
                ) ===
                normalizedBackendSlug,
            );

          const backendDescription =
            locale === "en"
              ? roomType.descriptionEn
              : roomType.descriptionRo;

          const fallbackDescription =
            publicContent
              ?.content[
                locale
              ]
              .shortDescription ??
            "";

          return {
            roomTypeId:
              roomType.id,

            slug:
              roomType.slug,

            title:
              locale === "en"
                ? roomType.nameEn
                : roomType.nameRo,

            description:
              backendDescription?.trim() ||
              fallbackDescription,

            image:
              publicContent
                ?.image ??
              FALLBACK_ROOM_IMAGE,

            maxAdults:
              roomType.maxAdults,

            maxExtraAdultsPerRoom:
              roomType.maxExtraAdultsPerRoom,

            allowsExtraAdult:
              roomType.allowsExtraAdult,

            availableExtraAdultUnits:
              roomType.availableExtraAdultUnits,

            extraAdultPrice:
              roomType.extraAdultPrice,

            sizeSqm:
              roomType.sizeSqm,

            totalUnits:
              roomType.totalUnits,

            availableUnits:
              roomType.availableUnits,

            totalPrice:
              roomType.totalPrice,

            averagePricePerNight:
              roomType.averagePricePerNight,

            hasPromotion:
              roomType.hasPromotion,

            nightlyRates:
              roomType.nightlyRates,
          };
        },
      );
  }, [
    availability,
    locale,
  ]);

  const selectedRoomCount =
    useMemo(
      () =>
        Object.values(
          selectedRooms,
        ).reduce(
          (
            total,
            quantity,
          ) =>
            total +
            quantity,
          0,
        ),
      [
        selectedRooms,
      ],
    );

  const canSubmit =
    searched &&
    availability !==
      null &&
    nights >=
      minimumNights &&
    selectedRoomCount >
      0 &&
    guest.firstName
      .trim()
      .length >
      0 &&
    guest.lastName
      .trim()
      .length >
      0 &&
    guest.email
      .trim()
      .length >
      0 &&
    guest.phone
      .trim()
      .length >
      0 &&
    guest.acceptedTerms &&
    !isCreatingReservation;

  function scrollToAvailability() {
    const section =
      availabilitySectionRef.current;

    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior:
        "smooth",

      block:
        "start",
    });
  }

  function scrollToResults() {
    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            const resultsSection =
              resultsSectionRef.current;

            if (
              !resultsSection
            ) {
              return;
            }

            const targetTop =
              resultsSection
                .getBoundingClientRect()
                .top +
              window.scrollY -
              80;

            window.scrollTo({
              top:
                targetTop,

              left:
                0,

              behavior:
                "smooth",
            });
          },
        );
      },
    );
  }

  function resetSearchResults() {
    setSearched(
      false,
    );

    setValidationError(
      "",
    );

    setSelectedRooms(
      {},
    );

    setSelectedExtraAdults(
      {},
    );

    resetAvailability();
    resetReservation();
  }

  function handleCheckInChange(
    value: string,
  ) {
    setCheckIn(
      value,
    );

    setCheckOut(
      "",
    );

    resetSearchResults();
  }

  function handleCheckOutChange(
    value: string,
  ) {
    setCheckOut(
      value,
    );

    resetSearchResults();
  }

  async function handleSearch() {
    if (
      !checkIn ||
      !checkOut
    ) {
      setValidationError(
        locale ===
        "en"
          ? "Select the arrival and departure dates."
          : "Selectează data sosirii și data plecării.",
      );

      setSearched(
        false,
      );

      return;
    }

    const tomorrow =
      new Date();

    tomorrow.setHours(
      0,
      0,
      0,
      0,
    );

    tomorrow.setDate(
      tomorrow.getDate() +
        1,
    );

    const selectedCheckIn =
      new Date(
        `${checkIn}T12:00:00`,
      );

    if (
      selectedCheckIn <
      tomorrow
    ) {
      setValidationError(
        locale ===
        "en"
          ? "Reservations can begin no earlier than tomorrow."
          : "Rezervările pot începe cel mai devreme de mâine.",
      );

      setSearched(
        false,
      );

      return;
    }

    if (
      nights <
      minimumNights
    ) {
      setValidationError(
        minimumNights ===
          2
          ? locale ===
            "en"
            ? "For arrivals on Friday or Saturday, the minimum stay is 2 nights."
            : "Pentru sosirile de vineri sau sâmbătă, sejurul minim este de 2 nopți."
          : locale ===
              "en"
            ? "The minimum stay is one night."
            : "Sejurul minim este de o noapte.",
      );

      setSearched(
        false,
      );

      return;
    }

    setValidationError(
      "",
    );

    setSelectedRooms(
      {},
    );

    setSelectedExtraAdults(
      {},
    );

    resetReservation();

    const response =
      await searchAvailability(
        {
          checkIn,
          checkOut,
          adults:
            DEFAULT_ADULTS_PER_ROOM,
        },
      );

    if (!response) {
      setSearched(
        false,
      );

      return;
    }

    setSearched(
      true,
    );

    scrollToResults();
  }

  function handleRoomQuantityChange(
    slug: string,
    quantity: number,
  ) {
    setSelectedRooms(
      (
        current,
      ) => ({
        ...current,

        [slug]:
          quantity,
      }),
    );

    const selectedRoom =
      availableRooms.find(
        (
          room,
        ) =>
          room.slug ===
          slug,
      );

    setSelectedExtraAdults(
      (
        current,
      ) => {
        const currentValue =
          current[
            slug
          ] ?? 0;

        const maximum =
          selectedRoom
            ? Math.min(
                quantity,
                selectedRoom.availableExtraAdultUnits,
              )
            : 0;

        return {
          ...current,

          [slug]:
            Math.min(
              currentValue,
              maximum,
            ),
        };
      },
    );

    setValidationError(
      "",
    );

    resetReservation();
  }

  function handleExtraAdultQuantityChange(
    slug: string,
    quantity: number,
  ) {
    const selectedRoom =
      availableRooms.find(
        (
          room,
        ) =>
          room.slug ===
          slug,
      );

    if (
      !selectedRoom
    ) {
      return;
    }

    const selectedQuantity =
      selectedRooms[
        slug
      ] ?? 0;

    const maximum =
      Math.min(
        selectedQuantity,
        selectedRoom.availableExtraAdultUnits,
      );

    const normalizedQuantity =
      Math.max(
        0,
        Math.min(
          quantity,
          maximum,
        ),
      );

    setSelectedExtraAdults(
      (
        current,
      ) => ({
        ...current,

        [slug]:
          normalizedQuantity,
      }),
    );

    setValidationError(
      "",
    );

    resetReservation();
  }

  async function handleSubmitReservation() {
    if (
      !availability ||
      !canSubmit
    ) {
      setValidationError(
        locale ===
        "en"
          ? "Complete all required fields and select at least one apartment."
          : "Completează toate câmpurile obligatorii și selectează cel puțin un apartament.",
      );

      return;
    }

    const rooms =
      availableRooms
        .map(
          (
            room,
          ) => {
            const quantity =
              selectedRooms[
                room.slug
              ] ?? 0;

            const maximumExtraAdults =
              Math.min(
                quantity,
                room.availableExtraAdultUnits,
              );

            const extraAdultQuantity =
              Math.max(
                0,
                Math.min(
                  selectedExtraAdults[
                    room.slug
                  ] ?? 0,
                  maximumExtraAdults,
                ),
              );

            return {
              roomTypeId:
                room.roomTypeId,

              quantity,

              adultsPerRoom:
                Math.min(
                  DEFAULT_ADULTS_PER_ROOM,
                  room.maxAdults,
                ),

              extraAdultQuantity,
            };
          },
        )
        .filter(
          (
            room,
          ) =>
            room.quantity >
            0,
        );

    if (
      rooms.length ===
      0
    ) {
      setValidationError(
        locale ===
        "en"
          ? "Select at least one apartment."
          : "Selectează cel puțin un apartament.",
      );

      return;
    }

    setValidationError(
      "",
    );

    const response =
      await submitReservation(
        {
          checkIn:
            availability.checkIn,

          checkOut:
            availability.checkOut,

          locale:
            locale ===
            "en"
              ? "EN"
              : "RO",

          guest: {
            firstName:
              guest.firstName.trim(),

            lastName:
              guest.lastName.trim(),

            email:
              guest.email.trim(),

            phone:
              guest.phone.trim(),
          },

          rooms,

          guestNotes:
            guest.message.trim() ||
            undefined,
        },
      );

    if (!response) {
      return;
    }

    setSubmitted(
      true,
    );
  }

  if (
    submitted &&
    reservation
  ) {
    return (
      <main className="bg-[#050505] text-[#f5f2eb]">
        <BookingSuccess
          reservation={
            reservation
          }
        />
      </main>
    );
  }

  const displayedError =
    validationError ||
    reservationError ||
    availabilityError;

  return (
    <main className="bg-[#050505] text-[#f5f2eb]">
      <BookingHeader />

      <section
        ref={
          availabilitySectionRef
        }
        className="scroll-mt-20 px-6 py-24 md:px-8 md:py-32"
      >
        <div className="mx-auto max-w-[1260px]">
          <AvailabilitySearch
            checkIn={
              checkIn
            }
            checkOut={
              checkOut
            }
            onCheckInChange={
              handleCheckInChange
            }
            onCheckOutChange={
              handleCheckOutChange
            }
            onSearch={
              handleSearch
            }
            isLoading={
              isCheckingAvailability
            }
          />

          {displayedError && (
            <p
              role="alert"
              className="mt-5 border-l border-red-400/70 pl-4 text-sm leading-7 text-red-300"
            >
              {
                displayedError
              }
            </p>
          )}

          {searched &&
            availability && (
              <div
                ref={
                  resultsSectionRef
                }
                className="scroll-mt-20"
              >
                {availableRooms.length ===
                0 ? (
                  <FadeIn
                    distance={
                      30
                    }
                  >
                    <section className="mt-16 border border-white/10 bg-[#0b0b0b] px-6 py-16 text-center sm:px-8 md:py-20">
                      <p className="text-[9px] font-medium uppercase tracking-[0.45em] text-gold sm:text-[10px] md:text-xs">
                        {
                          content.availabilityEyebrow
                        }
                      </p>

                      <h2 className="heading mx-auto mt-6 max-w-3xl text-4xl font-light leading-[1.05] tracking-[-0.015em] sm:text-5xl md:text-6xl">
                        {
                          content.noAvailabilityTitle
                        }
                      </h2>

                      <div className="mx-auto mt-8 h-px w-16 bg-gold/70" />

                      <p className="mx-auto mt-8 max-w-xl text-sm leading-8 text-white/50 sm:text-[15px] md:text-base">
                        {
                          content.noAvailabilityDescription
                        }
                      </p>

                      <button
                        type="button"
                        onClick={
                          scrollToAvailability
                        }
                        className="group mt-10 inline-flex min-h-12 items-center justify-center gap-4 border border-gold px-8 py-3.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold transition duration-500 hover:bg-gold hover:text-black sm:px-10 sm:text-[10px]"
                      >
                        <ArrowUp className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-1" />

                        {
                          content.chooseAnotherPeriod
                        }
                      </button>
                    </section>
                  </FadeIn>
                ) : (
                  <FadeIn
                    distance={
                      32
                    }
                  >
                    <div className="mt-16 grid items-start gap-14 xl:grid-cols-[minmax(0,1fr)_370px]">
                      <div className="space-y-20">
                        <RoomSelection
                          rooms={
                            availableRooms
                          }
                          selectedRooms={
                            selectedRooms
                          }
                          selectedExtraAdults={
                            selectedExtraAdults
                          }
                          onQuantityChange={
                            handleRoomQuantityChange
                          }
                          onExtraAdultQuantityChange={
                            handleExtraAdultQuantityChange
                          }
                        />

                        <GuestDetailsForm
                          guest={
                            guest
                          }
                          onChange={(
                            updatedGuest,
                          ) => {
                            setGuest(
                              updatedGuest,
                            );

                            setValidationError(
                              "",
                            );

                            resetReservation();
                          }}
                        />
                      </div>

                      <div className="xl:sticky xl:top-24">
                        <BookingSummary
                          checkIn={
                            availability.checkIn
                          }
                          checkOut={
                            availability.checkOut
                          }
                          nights={
                            availability.nights
                          }
                          rooms={
                            availableRooms
                          }
                          selectedRooms={
                            selectedRooms
                          }
                          selectedExtraAdults={
                            selectedExtraAdults
                          }
                          canSubmit={
                            canSubmit
                          }
                          onSubmit={
                            handleSubmitReservation
                          }
                        />
                      </div>
                    </div>
                  </FadeIn>
                )}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}