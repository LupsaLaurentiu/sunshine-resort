import { apiRequest } from "@/lib/api";

import type {
  AdminRoomType,
  CreateAdminRoomTypePayload,
  UpdateAdminRoomTypePayload,
} from "@/types/admin-room-type";

const ROOM_TYPES_ENDPOINT =
  "/room-types";

export async function getAdminRoomTypes(): Promise<
  AdminRoomType[]
> {
  return apiRequest<AdminRoomType[]>(
    ROOM_TYPES_ENDPOINT,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

export async function getAdminRoomTypeById(
  roomTypeId: string,
): Promise<AdminRoomType> {
  return apiRequest<AdminRoomType>(
    `${ROOM_TYPES_ENDPOINT}/${roomTypeId}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

export async function createAdminRoomType(
  payload: CreateAdminRoomTypePayload,
): Promise<AdminRoomType> {
  return apiRequest<AdminRoomType>(
    ROOM_TYPES_ENDPOINT,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateAdminRoomType(
  roomTypeId: string,
  payload: UpdateAdminRoomTypePayload,
): Promise<AdminRoomType> {
  return apiRequest<AdminRoomType>(
    `${ROOM_TYPES_ENDPOINT}/${roomTypeId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function deactivateAdminRoomType(
  roomTypeId: string,
): Promise<AdminRoomType> {
  return apiRequest<AdminRoomType>(
    `${ROOM_TYPES_ENDPOINT}/${roomTypeId}/deactivate`,
    {
      method: "PATCH",
    },
  );
}