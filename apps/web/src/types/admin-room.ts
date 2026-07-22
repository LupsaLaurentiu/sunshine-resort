export type AdminRoomTypeSummary = {
  id: string;

  nameRo: string;
  nameEn: string;
  slug: string;

  maxAdults: number;

  /**
   * Tariful pentru un adult suplimentar,
   * aplicat pentru fiecare noapte.
   */
  extraAdultPrice: number;

  isActive: boolean;
};

export type AdminRoom = {
  id: string;

  name: string;
  code: string;

  roomTypeId: string;

  floor: number | null;
  tvDeviceId: string | null;

  /**
   * Indică dacă apartamentul fizic permite
   * maximum un adult suplimentar.
   */
  allowsExtraAdult: boolean;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  roomType: AdminRoomTypeSummary;
};

export type CreateAdminRoomRequest = {
  name: string;
  code: string;
  roomTypeId: string;

  tvDeviceId?: string;

  allowsExtraAdult: boolean;
};

export type UpdateAdminRoomRequest =
  Partial<CreateAdminRoomRequest>;