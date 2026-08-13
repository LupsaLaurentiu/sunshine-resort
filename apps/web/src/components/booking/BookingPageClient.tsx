"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
} from "lucide-react";

import {
  useParams,
  useSearchParams,
} from "next/navigation";

import {
  FadeIn,
} from "@/components/animations/FadeIn";

import {
  useSmoothScroll,
} from "@/components/animations/SmoothScroll";

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
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  acceptedTerms: false,
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

    invalidDates:
      "Selectează data sosirii și data plecării.",

    pastCheckIn:
      "Rezervările pot începe cel mai devreme de mâine.",

    minimumTwoNights:
      "Pentru sosirile de vineri sau sâmbătă, sejurul minim este de 2 nopți.",

    minimumOneNight:
      "Sejurul minim este de o noapte.",

    requestedRoomUnavailable:
      "Apartamentul selectat anterior nu mai este disponibil pentru această perioadă. Poți alege un alt apartament disponibil.",

    selectRoom:
      "Selectează cel puțin un apartament.",

    completeGuest:
      "Completează datele oaspetelui înainte de a trimite cererea de rezervare.",

    oneApartmentSelected:
      "1 apartament selectat",

    apartmentsSelected:
      "apartamente selectate",

    continueGuest:
      "Continuă cu datele oaspetelui",

    confirmReservation:
      "Confirmă rezervarea",
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

    invalidDates:
      "Select the arrival and departure dates.",

    pastCheckIn:
      "Reservations can begin no earlier than tomorrow.",

    minimumTwoNights:
      "For arrivals on Friday or Saturday, the minimum stay is 2 nights.",

    minimumOneNight:
      "The minimum stay is one night.",

    requestedRoomUnavailable:
      "The apartment selected on the previous page is no longer available for this stay. You can choose another available apartment.",

    selectRoom:
      "Select at least one apartment.",

    completeGuest:
      "Complete the guest details before submitting the reservation request.",

    oneApartmentSelected:
      "1 apartment selected",

    apartmentsSelected:
      "apartments selected",

    continueGuest:
      "Continue with guest details",

    confirmReservation:
      "Confirm reservation",
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

  const searchParams =
    useSearchParams();

  const {
    lenis,
  } =
    useSmoothScroll();

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

  const guestDetailsSectionRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const bookingSummarySectionRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const initialQueryHandledRef =
    useRef(false);

  const requestedRoomSlugRef =
    useRef<string | null>(
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
    guestValidationError,
    setGuestValidationError,
  ] =
    useState("");

  const [
    isBookingSummaryVisible,
    setIsBookingSummaryVisible,
  ] =
    useState(false);

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
    >(
      () => {
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
      },
      [
        availability,
        locale,
      ],
    );

  useEffect(
    () => {
      const requestedRoomSlug =
        requestedRoomSlugRef.current;

      if (
        !searched ||
        !availability ||
        !requestedRoomSlug
      ) {
        return;
      }

      const normalizedRequestedSlug =
        normalizeRoomSlug(
          requestedRoomSlug,
        );

      const requestedRoom =
        availableRooms.find(
          (
            room,
          ) =>
            normalizeRoomSlug(
              room.slug,
            ) ===
            normalizedRequestedSlug,
        );

      requestedRoomSlugRef.current =
        null;

      if (!requestedRoom) {
        setValidationError(
          content.requestedRoomUnavailable,
        );

        return;
      }

      setSelectedRooms(
        (
          current,
        ) => ({
          ...current,

          [requestedRoom.slug]:
            Math.max(
              1,
              current[
                requestedRoom.slug
              ] ?? 0,
            ),
        }),
      );
    },
    [
      availability,
      availableRooms,
      content.requestedRoomUnavailable,
      searched,
    ],
  );

  useEffect(
    () => {
      const target =
        bookingSummarySectionRef.current;

      if (!target) {
        setIsBookingSummaryVisible(
          false,
        );

        return;
      }

      const observer =
        new IntersectionObserver(
          (
            entries,
          ) => {
            const [
              entry,
            ] =
              entries;

            setIsBookingSummaryVisible(
              entry.isIntersecting,
            );
          },
          {
            threshold:
              0.18,

            rootMargin:
              "-40px 0px -80px 0px",
          },
        );

      observer.observe(
        target,
      );

      return () => {
        observer.disconnect();
      };
    },
    [
      searched,
      availability,
      availableRooms.length,
    ],
  );

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

  const isGuestFormComplete =
    useMemo(
      () =>
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
        guest.acceptedTerms,
      [
        guest,
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
    isGuestFormComplete &&
    !isCreatingReservation;

  const shouldShowMobileCta =
    searched &&
    availability !==
      null &&
    availableRooms.length >
      0 &&
    selectedRoomCount >
      0 &&
    !isBookingSummaryVisible;

  function scrollWithFallback(
    target: HTMLElement,
    offset: number,
  ) {
    if (lenis) {
      lenis.scrollTo(
        target,
        {
          offset,
          duration:
            1.15,
        },
      );

      return;
    }

    const targetTop =
      target
        .getBoundingClientRect()
        .top +
      window.scrollY +
      offset;

    window.scrollTo({
      top:
        Math.max(
          0,
          targetTop,
        ),

      left:
        0,

      behavior:
        "smooth",
    });
  }

  function scrollToAvailability() {
    const section =
      availabilitySectionRef.current;

    if (!section) {
      return;
    }

    scrollWithFallback(
      section,
      -80,
    );
  }

  function scrollToResults() {
    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            const section =
              resultsSectionRef.current;

            if (!section) {
              return;
            }

            scrollWithFallback(
              section,
              -80,
            );
          },
        );
      },
    );
  }

  function scrollToGuestDetails() {
    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            const section =
              guestDetailsSectionRef.current;

            if (!section) {
              return;
            }

            scrollWithFallback(
              section,
              -110,
            );
          },
        );
      },
    );
  }

  function scrollToBookingSummary() {
    window.requestAnimationFrame(
      () => {
        window.requestAnimationFrame(
          () => {
            const section =
              bookingSummarySectionRef.current;

            if (!section) {
              return;
            }

            scrollWithFallback(
              section,
              -90,
            );
          },
        );
      },
    );
  }

  function handleMobileCta() {
    if (
      isGuestFormComplete
    ) {
      scrollToBookingSummary();

      return;
    }

    scrollToGuestDetails();
  }

  function resetSearchResults() {
    setSearched(
      false,
    );

    setValidationError(
      "",
    );

    setGuestValidationError(
      "",
    );

    setSelectedRooms(
      {},
    );

    setSelectedExtraAdults(
      {},
    );

    setIsBookingSummaryVisible(
      false,
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

  function validateSearchPeriod(
    selectedCheckIn:
      string,
    selectedCheckOut:
      string,
  ): string | null {
    if (
      !selectedCheckIn ||
      !selectedCheckOut
    ) {
      return content.invalidDates;
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

    const selectedCheckInDate =
      new Date(
        `${selectedCheckIn}T12:00:00`,
      );

    if (
      selectedCheckInDate <
      tomorrow
    ) {
      return content.pastCheckIn;
    }

    const selectedNights =
      calculateNights(
        selectedCheckIn,
        selectedCheckOut,
      );

    const selectedMinimumNights =
      getMinimumNightsForCheckIn(
        selectedCheckIn,
      );

    if (
      selectedNights <
      selectedMinimumNights
    ) {
      return selectedMinimumNights ===
        2
        ? content.minimumTwoNights
        : content.minimumOneNight;
    }

    return null;
  }

  async function performAvailabilitySearch(
    selectedCheckIn:
      string,
    selectedCheckOut:
      string,
    options?: {
      scroll?: boolean;
    },
  ) {
    const periodError =
      validateSearchPeriod(
        selectedCheckIn,
        selectedCheckOut,
      );

    if (periodError) {
      setValidationError(
        periodError,
      );

      setSearched(
        false,
      );

      return;
    }

    setValidationError(
      "",
    );

    setGuestValidationError(
      "",
    );

    setSelectedRooms(
      {},
    );

    setSelectedExtraAdults(
      {},
    );

    setIsBookingSummaryVisible(
      false,
    );

    resetReservation();

    const response =
      await searchAvailability({
        checkIn:
          selectedCheckIn,

        checkOut:
          selectedCheckOut,

        adults:
          DEFAULT_ADULTS_PER_ROOM,
      });

    if (!response) {
      setSearched(
        false,
      );

      return;
    }

    setSearched(
      true,
    );

    if (
      options?.scroll !==
      false
    ) {
      scrollToResults();
    }
  }

  useEffect(
    () => {
      if (
        initialQueryHandledRef.current
      ) {
        return;
      }

      initialQueryHandledRef.current =
        true;

      const initialCheckIn =
        searchParams.get(
          "checkIn",
        );

      const initialCheckOut =
        searchParams.get(
          "checkOut",
        );

      const initialRoomType =
        searchParams.get(
          "roomType",
        );

      if (initialRoomType) {
        requestedRoomSlugRef.current =
          initialRoomType;
      }

      if (
        !initialCheckIn ||
        !initialCheckOut
      ) {
        return;
      }

      setCheckIn(
        initialCheckIn,
      );

      setCheckOut(
        initialCheckOut,
      );

      void performAvailabilitySearch(
        initialCheckIn,
        initialCheckOut,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  async function handleSearch() {
    if (
      !requestedRoomSlugRef.current
    ) {
      const requestedRoomType =
        searchParams.get(
          "roomType",
        );

      if (requestedRoomType) {
        requestedRoomSlugRef.current =
          requestedRoomType;
      }
    }

    await performAvailabilitySearch(
      checkIn,
      checkOut,
    );
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

    setGuestValidationError(
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

    if (!selectedRoom) {
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

    setGuestValidationError(
      "",
    );

    resetReservation();
  }

  async function handleSubmitReservation() {
    if (!availability) {
      return;
    }

    if (
      selectedRoomCount <=
      0
    ) {
      setGuestValidationError(
        "",
      );

      setValidationError(
        content.selectRoom,
      );

      return;
    }

    if (
      !isGuestFormComplete
    ) {
      setValidationError(
        "",
      );

      setGuestValidationError(
        content.completeGuest,
      );

      scrollToGuestDetails();

      return;
    }

    if (
      isCreatingReservation
    ) {
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
      setGuestValidationError(
        "",
      );

      setValidationError(
        content.selectRoom,
      );

      return;
    }

    setValidationError(
      "",
    );

    setGuestValidationError(
      "",
    );

    const response =
      await submitReservation({
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
      });

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
    <main
      className={`bg-[#050505] text-[#f5f2eb] ${
        shouldShowMobileCta
          ? "pb-28 xl:pb-0"
          : ""
      }`}
    >
      <BookingHeader />

      <section
        ref={
          availabilitySectionRef
        }
        className="px-6 py-24 md:px-8 md:py-32"
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
                          onContinueToGuestDetails={
                            scrollToGuestDetails
                          }
                        />

                        <div
                          ref={
                            guestDetailsSectionRef
                          }
                        >
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

                              setGuestValidationError(
                                "",
                              );

                              setValidationError(
                                "",
                              );

                              resetReservation();
                            }}
                          />
                        </div>
                      </div>

                      <div
                        ref={
                          bookingSummarySectionRef
                        }
                        className="xl:sticky xl:top-24"
                      >
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

                        {guestValidationError && (
                          <p
                            role="alert"
                            className="mt-4 border-l border-red-400/70 bg-red-400/[0.025] px-4 py-3 text-[11px] leading-6 text-red-300"
                          >
                            {
                              guestValidationError
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                )}
              </div>
            )}
        </div>
      </section>

      <div
        className={`fixed inset-x-0 bottom-0 z-[70] border-t border-white/10 bg-[#080808]/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-all duration-500 xl:hidden ${
          shouldShowMobileCta
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-medium uppercase tracking-[0.28em] text-gold">
              {selectedRoomCount ===
              1
                ? content.oneApartmentSelected
                : `${selectedRoomCount} ${content.apartmentsSelected}`}
            </p>

            <p className="mt-1 truncate text-[10px] leading-5 text-white/35">
              {isGuestFormComplete
                ? locale ===
                  "ro"
                  ? "Verifică rezumatul înainte de trimitere."
                  : "Review the summary before submitting."
                : locale ===
                  "ro"
                ? "Completează datele pentru a continua."
                : "Complete your details to continue."}
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleMobileCta
            }
            className="group flex min-h-[52px] shrink-0 items-center justify-center gap-3 border border-gold bg-gold px-5 text-[8px] font-semibold uppercase tracking-[0.22em] text-black transition duration-500 active:scale-[0.98] sm:px-7 sm:text-[9px]"
          >
            <span>
              {isGuestFormComplete
                ? content.confirmReservation
                : content.continueGuest}
            </span>

            {isGuestFormComplete ? (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-y-1" />
            )}
          </button>
        </div>
      </div>
    </main>
  );
}