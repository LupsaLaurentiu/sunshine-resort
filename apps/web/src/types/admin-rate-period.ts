export type RatePeriodAdminSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type RatePeriodRoomType = {
  id: string;
  slug: string;

  nameRo: string;
  nameEn: string;

  weekdayBasePrice: number;
  weekendBasePrice: number;
  extraAdultPrice: number;

  isActive: boolean;
};

export type AdminRatePeriod = {
  id: string;

  roomTypeId: string;
  createdByAdminId: string | null;

  startDate: string;
  endDate: string;

  weekdayPrice: number;
  weekendPrice: number;

  isPromotion: boolean;

  originalWeekdayPrice: number | null;
  originalWeekendPrice: number | null;

  titleRo: string | null;
  titleEn: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  roomType: RatePeriodRoomType;
  createdByAdmin: RatePeriodAdminSummary | null;
};

export type CreateAdminRatePeriodRequest = {
  roomTypeId: string;

  startDate: string;
  endDate: string;

  weekdayPrice: number;
  weekendPrice: number;

  isPromotion?: boolean;

  originalWeekdayPrice?: number;
  originalWeekendPrice?: number;

  titleRo?: string;
  titleEn?: string;

  isActive?: boolean;
};

export type UpdateAdminRatePeriodRequest =
  Partial<CreateAdminRatePeriodRequest>;