import { apiRequest } from "@/lib/api";
import type { ApiRoom } from "@/types/room";

export function getRooms(): Promise<ApiRoom[]> {
  return apiRequest<ApiRoom[]>("/rooms", {
    method: "GET",
    cache: "no-store",
  });
}

export function getRoomById(id: string): Promise<ApiRoom> {
  return apiRequest<ApiRoom>(
    `/rooms/${encodeURIComponent(id)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

