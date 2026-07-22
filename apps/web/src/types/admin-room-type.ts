export type AdminRoomType = {
  id: string;

  nameRo: string;
  nameEn: string;
  slug: string;

  descriptionRo: string | null;
  descriptionEn: string | null;

  weekdayBasePrice: number;
  weekendBasePrice: number;

  maxAdults: number;

  /**
   * Tarif per noapte pentru un adult suplimentar.
   * Valoarea 0 înseamnă că tariful nu este configurat.
   */
  extraAdultPrice: number;

  sizeSqm: number | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

export type AdminRoomTypeSummary =
  AdminRoomType;

export type CreateAdminRoomTypePayload = {
  nameRo: string;
  nameEn: string;
  slug: string;

  descriptionRo?: string;
  descriptionEn?: string;

  weekdayBasePrice: number;
  weekendBasePrice: number;

  maxAdults: number;
  extraAdultPrice: number;

  sizeSqm?: number;

  isActive?: boolean;
};

export type UpdateAdminRoomTypePayload =
  Partial<CreateAdminRoomTypePayload>;