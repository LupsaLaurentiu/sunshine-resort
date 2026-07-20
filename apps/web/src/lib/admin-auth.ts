const ADMIN_ACCESS_TOKEN_KEY = "sunshine_admin_access_token";

export function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(accessToken: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ADMIN_ACCESS_TOKEN_KEY,
    accessToken,
  );
}

export function removeAdminAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function hasAdminAccessToken(): boolean {
  return getAdminAccessToken() !== null;
}