export type NightRateType =
  | 'WEEKDAY'
  | 'WEEKEND';

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
   * Capacitatea standard a unei camere din acest tip.
   */
  maxAdults: number;

  /**
   * Numărul maxim de adulți suplimentari per cameră.
   * Pentru Sunshine Resort este întotdeauna 1.
   */
  maxExtraAdultsPerRoom: number;

  /**
   * Indică dacă există cel puțin o cameră fizică disponibilă
   * în perioada selectată care permite un adult suplimentar.
   */
  allowsExtraAdult: boolean;

  /**
   * Numărul camerelor fizice disponibile care permit
   * un adult suplimentar.
   */
  availableExtraAdultUnits: number;

  /**
   * Tariful per noapte pentru un adult suplimentar.
   */
  extraAdultPrice: number;

  sizeSqm: number | null;

  totalUnits: number;
  availableUnits: number;

  /**
   * Prețul unei singure camere pentru perioada selectată,
   * fără adult suplimentar.
   */
  totalPrice: number;

  /**
   * Prețul mediu per noapte pentru o singură cameră,
   * fără adult suplimentar.
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