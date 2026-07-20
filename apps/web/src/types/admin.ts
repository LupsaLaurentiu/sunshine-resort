export type AdminSection =
  | "dashboard"
  | "reservations"
  | "calendar"
  | "rooms"
  | "rates"
  | "promotions"
  | "blocked-periods"
  | "settings";

export type AdminNavigationItem = {
  id: AdminSection;
  label: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string | number;
  description?: string;
};