import { apiRequest } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/admin-auth";

import type {
  AdminDashboardResponse,
} from "@/types/admin-dashboard";

export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const token = getAdminAccessToken();

  if (!token) {
    throw new Error(
      "Administratorul nu este autentificat.",
    );
  }

  return apiRequest<AdminDashboardResponse>(
    "/admin/dashboard",
    {
      method: "GET",
      token,
      cache: "no-store",
    },
  );
}