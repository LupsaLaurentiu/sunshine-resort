export type AdminRoomTypeSummary = {
  id: string;

  nameRo: string;
  nameEn: string;
  slug: string;

  maxAdults: number;

  /**
   * Indică dacă tipul de apartament permite
   * maximum un adult suplimentar.
   *
   * Temporar opțional până la actualizarea backend-ului.
   */
  allowsExtraAdult?: boolean;

  /**
   * Prețul pentru adultul suplimentar, per noapte.
   *
   * Temporar opțional până la actualizarea backend-ului.
   */
  extraAdultPrice?: number | null;

  isActive: boolean;
};

export type AdminRoom = {
  id: string;

  name: string;
  code: string;

  roomTypeId: string;

  floor: number | null;
  tvDeviceId: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  roomType: AdminRoomTypeSummary;
};

export type CreateAdminRoomRequest = {
  name: string;
  code: string;
  roomTypeId: string;

  floor?: number;
  tvDeviceId?: string;

  isActive?: boolean;
};

export type UpdateAdminRoomRequest =
  Partial<CreateAdminRoomRequest>;