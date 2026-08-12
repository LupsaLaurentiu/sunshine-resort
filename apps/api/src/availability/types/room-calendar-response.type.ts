import type {
  NightRateType,
} from './availability-response.type';

export type RoomCalendarDay = {
  date: string;

  rateType: NightRateType;

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

export type RoomCalendarResponse = {
  roomType: {
    id: string;
    slug: string;

    nameRo: string;
    nameEn: string;
  };

  from: string;
  to: string;

  days:
    RoomCalendarDay[];
};