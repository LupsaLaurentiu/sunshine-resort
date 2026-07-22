export type NightRateType =
  | "WEEKDAY"
  | "WEEKEND";

export type AvailabilityQuery = {
  checkIn: string;
  checkOut: string;
  adults: number;
};

export type NightlyRate = {
  date: string;
  rateType: NightRateType;
  price: number;
  originalPrice: number | null;
  isPromotion: boolean;
  promotionTitleRo: string | null;
  promotionTitleEn: string | null;
};

export type AvailableRoomType = {
  id: string;
  slug: string;

  nameRo: string;
  nameEn: string;

  descriptionRo: string | null;
  descriptionEn: string | null;

  /**
   * Capacitatea standard inclusă într-o cameră.
   */
  maxAdults: number;

  /**
   * Pentru Sunshine Resort este maximum 1.
   */
  maxExtraAdultsPerRoom: number;

  /**
   * Există cel puțin o cameră fizică disponibilă
   * care permite adult suplimentar.
   */
  allowsExtraAdult: boolean;

  /**
   * Numărul camerelor disponibile care permit
   * adult suplimentar.
   */
  availableExtraAdultUnits: number;

  /**
   * Tarif per noapte pentru un adult suplimentar.
   */
  extraAdultPrice: number;

  sizeSqm: number | null;

  totalUnits: number;
  availableUnits: number;

  /**
   * Prețul unei camere pentru întregul sejur,
   * fără adulți suplimentari.
   */
  totalPrice: number;

  /**
   * Preț mediu per noapte pentru o cameră,
   * fără adulți suplimentari.
   */
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