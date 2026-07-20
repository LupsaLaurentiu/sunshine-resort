export type NightRateType = "WEEKDAY" | "WEEKEND";

export type NightlyRate = {
  date: string;
  rateType: NightRateType;
  price: number;
  originalPrice: number | null;
  isPromotion: boolean;
  promotionTitleRo: string | null;
  promotionTitleEn: string | null;
};

export type AvailabilityQuery = {
  checkIn: string;
  checkOut: string;
  adults: number;
};

export type AvailableRoomType = {
  id: string;
  slug: string;
  nameRo: string;
  nameEn: string;
  descriptionRo: string | null;
  descriptionEn: string | null;

  maxAdults: number;
  sizeSqm: number | null;

  totalUnits: number;
  availableUnits: number;

  totalPrice: number;
  averagePricePerNight: number;

  hasPromotion: boolean;
  nightlyRates: NightlyRate[];
};

export type AvailabilityResponse = {
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  minimumStay: number;
  roomTypes: AvailableRoomType[];
};