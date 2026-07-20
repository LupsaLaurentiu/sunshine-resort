export type ApiRoomType = {
  id: string;
  slug: string;

  nameRo: string;
  nameEn: string;

  weekdayBasePrice: number;
  weekendBasePrice: number;

  maxAdults: number;

  createdAt?: string;
  updatedAt?: string;
};