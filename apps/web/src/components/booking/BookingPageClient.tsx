"use client";

import { useMemo, useState } from "react";
import { AvailabilitySearch } from "./AvailabilitySearch";
import { BookingHeader } from "./BookingHeader";
import { BookingSummary } from "./BookingSummary";
import { BookingSuccess } from "./BookingSuccess";
import {
  GuestDetailsForm,
  type GuestDetails,
} from "./GuestDetailsForm";
import {
  RoomSelection,
  type BookingRoom,
} from "./RoomSelection";

const mockRooms: BookingRoom[] = [
  {
    slug: "signature-apartment",
    title: "Signature Apartment",
    description:
      "The largest Sunshine Resort apartment, arranged on one generous level.",
    image: "/images/room-signature-1.jpg",
    availableUnits: 1,
    pricePerNight: 900,
  },
  {
    slug: "intimate-apartment",
    title: "Intimate Apartment",
    description:
      "A compact and elegant apartment designed for quiet stays in two.",
    image: "/images/room-intimate-1.jpg",
    availableUnits: 1,
    pricePerNight: 600,
  },
  {
    slug: "deluxe-apartment",
    title: "Deluxe Apartment",
    description:
      "A spacious duplex with two bathrooms, kitchen and bar beneath the stairs.",
    image: "/images/room-deluxe-1.jpg",
    availableUnits: 2,
    pricePerNight: 800,
  },
  {
    slug: "premium-apartment",
    title: "Premium Apartment",
    description:
      "A refined duplex with the bedroom upstairs and living area below.",
    image: "/images/room-premium-1.jpg",
    availableUnits: 4,
    pricePerNight: 700,
  },
];

const initialGuest: GuestDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  acceptedTerms: false,
};

function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  const difference = end.getTime() - start.getTime();

  return Math.max(0, Math.round(difference / 86_400_000));
}

function getMinimumNightsForCheckIn(checkIn: string): number {
  if (!checkIn) {
    return 1;
  }

  const checkInDate = new Date(`${checkIn}T12:00:00`);
  const dayOfWeek = checkInDate.getDay();

  return dayOfWeek === 5 || dayOfWeek === 6 ? 2 : 1;
}

export function BookingPageClient() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [searched, setSearched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>(
    {},
  );
  const [guest, setGuest] = useState(initialGuest);

  const nights = useMemo(
    () => calculateNights(checkIn, checkOut),
    [checkIn, checkOut],
  );

  const minimumNights = useMemo(
    () => getMinimumNightsForCheckIn(checkIn),
    [checkIn],
  );

  const selectedRoomCount = Object.values(selectedRooms).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );

  const canSubmit =
    searched &&
    nights >= minimumNights &&
    selectedRoomCount > 0 &&
    guest.firstName.trim().length > 0 &&
    guest.lastName.trim().length > 0 &&
    guest.email.trim().length > 0 &&
    guest.phone.trim().length > 0 &&
    guest.acceptedTerms;

  function handleSearch() {
    if (!checkIn || !checkOut) {
      setError("Selectează data sosirii și data plecării.");
      setSearched(false);
      return;
    }

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const selectedCheckIn = new Date(`${checkIn}T12:00:00`);

    if (selectedCheckIn < tomorrow) {
      setError("Rezervările pot începe cel mai devreme de mâine.");
      setSearched(false);
      return;
    }

    if (nights < minimumNights) {
      setError(
        minimumNights === 2
          ? "Pentru sosirile de vineri sau sâmbătă, sejurul minim este de 2 nopți."
          : "Sejurul minim este de o noapte.",
      );
      setSearched(false);
      return;
    }

    setError("");
    setSelectedRooms({});
    setSearched(true);
  }

  if (submitted) {
    return (
      <main>
        <BookingSuccess />
      </main>
    );
  }

  return (
    <main className="bg-[#050505] text-[#f5f2eb]">
      <BookingHeader />

      <section className="px-6 py-28 md:px-8 md:py-36">
        <div className="mx-auto max-w-[1380px]">
          <AvailabilitySearch
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={(value) => {
              setCheckIn(value);
              setSearched(false);
              setError("");
            }}
            onCheckOutChange={(value) => {
              setCheckOut(value);
              setSearched(false);
              setError("");
            }}
            onSearch={handleSearch}
          />

          {error && <p className="mt-5 text-sm text-red-400">{error}</p>}

          {searched && (
            <div className="mt-28 grid items-start gap-16 xl:grid-cols-[1fr_390px]">
              <div className="space-y-24">
                <RoomSelection
                  rooms={mockRooms}
                  selectedRooms={selectedRooms}
                  onQuantityChange={(slug, quantity) =>
                    setSelectedRooms((current) => ({
                      ...current,
                      [slug]: quantity,
                    }))
                  }
                />

                <GuestDetailsForm guest={guest} onChange={setGuest} />
              </div>

              <BookingSummary
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                rooms={mockRooms}
                selectedRooms={selectedRooms}
                canSubmit={canSubmit}
                onSubmit={() => setSubmitted(true)}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}