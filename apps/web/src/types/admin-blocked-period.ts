export type BlockedPeriodAdminSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type BlockedPeriodRoomType = {
  id: string;

  nameRo: string;
  nameEn: string;
  slug: string;

  weekdayBasePrice: number;
  weekendBasePrice: number;
  extraAdultPrice: number;

  maxAdults: number;
  sizeSqm: number | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type BlockedPeriodRoom = {
  id: string;

  name: string;
  code: string;

  roomTypeId: string;

  floor: number | null;
  tvDeviceId: string | null;

  allowsExtraAdult: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  roomType: BlockedPeriodRoomType;
};

export type AdminBlockedPeriod = {
  id: string;

  roomId: string;
  createdByAdminId: string | null;

  startDate: string;
  endDate: string;

  reason: string | null;

  createdAt: string;
  updatedAt: string;

  room: BlockedPeriodRoom;

  createdByAdmin: BlockedPeriodAdminSummary | null;
};

export type CreateAdminBlockedPeriodRequest = {
  roomId: string;

  startDate: string;
  endDate: string;

  reason?: string;
};

export type UpdateAdminBlockedPeriodRequest =
  Partial<CreateAdminBlockedPeriodRequest>;

export type GetAdminBlockedPeriodsQuery = {
  roomId?: string;
  from?: string;
  to?: string;
};

export type DeleteAdminBlockedPeriodResponse = {
  message: string;
};