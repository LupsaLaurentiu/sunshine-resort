import { apiRequest } from "@/lib/api";
import type { ApiRoomType } from "@/types/room-type";

export function getRoomTypes(): Promise<ApiRoomType[]> {
  return apiRequest<ApiRoomType[]>("/room-types", {
    method: "GET",
    cache: "no-store",
  });
}

export function getRoomTypeBySlug(
  slug: string,
): Promise<ApiRoomType> {
  return apiRequest<ApiRoomType>(
    `/room-types/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}