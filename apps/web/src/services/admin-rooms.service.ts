import { apiRequest } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/admin-auth";

import type {
  AdminRoom,
  CreateAdminRoomRequest,
  UpdateAdminRoomRequest,
} from "@/types/admin-room";

function getRequiredAdminToken(): string {
  const token = getAdminAccessToken();

  if (!token) {
    throw new Error(
      "Administratorul nu este autentificat.",
    );
  }

  return token;
}

export function getAdminRooms(): Promise<AdminRoom[]> {
  const token = getRequiredAdminToken();

  return apiRequest<AdminRoom[]>(
    "/rooms",
    {
      method: "GET",
      token,
      cache: "no-store",
    },
  );
}

export function createAdminRoom(
  payload: CreateAdminRoomRequest,
): Promise<AdminRoom> {
  const token = getRequiredAdminToken();

  return apiRequest<AdminRoom>(
    "/rooms",
    {
      method: "POST",
      token,
      body: payload,
      cache: "no-store",
    },
  );
}

export function updateAdminRoom(
  roomId: string,
  payload: UpdateAdminRoomRequest,
): Promise<AdminRoom> {
  const token = getRequiredAdminToken();

  return apiRequest<AdminRoom>(
    `/rooms/${encodeURIComponent(roomId)}`,
    {
      method: "PATCH",
      token,
      body: payload,
      cache: "no-store",
    },
  );
}

export function deactivateAdminRoom(
  roomId: string,
): Promise<AdminRoom> {
  const token = getRequiredAdminToken();

  return apiRequest<AdminRoom>(
    `/rooms/${encodeURIComponent(roomId)}`,
    {
      method: "DELETE",
      token,
      cache: "no-store",
    },
  );
}