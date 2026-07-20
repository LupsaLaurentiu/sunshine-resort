import { apiRequest } from "@/lib/api";

import type {
  CurrentAdminResponse,
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

export function loginAdmin(
  payload: LoginRequest,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    cache: "no-store",
  });
}

export function getCurrentAdmin(
  accessToken: string,
): Promise<CurrentAdminResponse> {
  return apiRequest<CurrentAdminResponse>("/auth/me", {
    method: "GET",
    token: accessToken,
    cache: "no-store",
  });
}