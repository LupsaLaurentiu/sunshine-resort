import type { ApiRoomType } from "./room-type";

export type ApiRoom = {
  id: string;
  code: string;

  roomTypeId: string;
  roomType?: ApiRoomType;

  floor?: number | null;
  tvDeviceId?: string | null;

  createdAt?: string;
  updatedAt?: string;
};