import type {
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  ReservationChangeStatus,
} from "@/types/admin-reservation-details";
import type { ReservationSource } from "@/types/admin-reservation";

export function formatAdminPrice(
  value: number | string,
  currency = "RON",
): string {
  const numericValue =
    typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatAdminDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  const date = dateOnlyPattern.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatAdminDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getReservationSourceLabel(
  source: ReservationSource,
): string {
  switch (source) {
    case "DIRECT_WEBSITE":
      return "Website direct";

    case "MANUAL_ADMIN":
      return "Rezervare manuală";

    case "BOOKING_COM":
      return "Booking.com";
  }
}

export function getPaymentTypeLabel(type: PaymentType): string {
  switch (type) {
    case "DEPOSIT":
      return "Avans";

    case "FULL":
      return "Plată integrală";

    case "REMAINING_BALANCE":
      return "Diferență de plată";

    case "MODIFICATION_DIFFERENCE":
      return "Diferență modificare";
  }
}

export function getPaymentStatusLabel(
  status: PaymentStatus,
): string {
  switch (status) {
    case "PENDING":
      return "În așteptare";

    case "PAID":
      return "Achitată";

    case "FAILED":
      return "Eșuată";

    case "CANCELLED":
      return "Anulată";

    case "REFUNDED":
      return "Rambursată";
  }
}

export function getPaymentProviderLabel(
  provider: PaymentProvider,
): string {
  switch (provider) {
    case "STRIPE":
      return "Stripe";

    case "CASH":
      return "Numerar";

    case "POS":
      return "POS";

    case "BANK_TRANSFER":
      return "Transfer bancar";

    case "MANUAL":
      return "Manual";
  }
}

export function getChangeStatusLabel(
  status: ReservationChangeStatus,
): string {
  switch (status) {
    case "PENDING_APPROVAL":
      return "Așteaptă aprobarea";

    case "APPROVED_AWAITING_PAYMENT":
      return "Așteaptă plata";

    case "APPLIED":
      return "Aplicată";

    case "REJECTED":
      return "Respinsă";

    case "EXPIRED":
      return "Expirată";

    case "CANCELLED":
      return "Anulată";
  }
}