import { apiRequest } from "@/lib/api";

import type {
  AdminBlockedPeriod,
  CreateAdminBlockedPeriodRequest,
  DeleteAdminBlockedPeriodResponse,
  GetAdminBlockedPeriodsQuery,
  UpdateAdminBlockedPeriodRequest,
} from "@/types/admin-blocked-period";

const BLOCKED_PERIODS_ENDPOINT =
  "/blocked-periods";

function buildBlockedPeriodsPath(
  query?: GetAdminBlockedPeriodsQuery,
): string {
  if (!query) {
    return BLOCKED_PERIODS_ENDPOINT;
  }

  const searchParams =
    new URLSearchParams();

  if (query.roomId) {
    searchParams.set(
      "roomId",
      query.roomId,
    );
  }

  if (query.from) {
    searchParams.set(
      "from",
      query.from,
    );
  }

  if (query.to) {
    searchParams.set(
      "to",
      query.to,
    );
  }

  const queryString =
    searchParams.toString();

  return queryString
    ? `${BLOCKED_PERIODS_ENDPOINT}?${queryString}`
    : BLOCKED_PERIODS_ENDPOINT;
}

export async function getAdminBlockedPeriods(
  query?: GetAdminBlockedPeriodsQuery,
): Promise<AdminBlockedPeriod[]> {
  return apiRequest<AdminBlockedPeriod[]>(
    buildBlockedPeriodsPath(query),
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

export async function getAdminBlockedPeriodById(
  blockedPeriodId: string,
): Promise<AdminBlockedPeriod> {
  return apiRequest<AdminBlockedPeriod>(
    `${BLOCKED_PERIODS_ENDPOINT}/${blockedPeriodId}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

export async function createAdminBlockedPeriod(
  payload: CreateAdminBlockedPeriodRequest,
): Promise<AdminBlockedPeriod> {
  return apiRequest<AdminBlockedPeriod>(
    BLOCKED_PERIODS_ENDPOINT,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateAdminBlockedPeriod(
  blockedPeriodId: string,
  payload: UpdateAdminBlockedPeriodRequest,
): Promise<AdminBlockedPeriod> {
  return apiRequest<AdminBlockedPeriod>(
    `${BLOCKED_PERIODS_ENDPOINT}/${blockedPeriodId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function deleteAdminBlockedPeriod(
  blockedPeriodId: string,
): Promise<DeleteAdminBlockedPeriodResponse> {
  return apiRequest<DeleteAdminBlockedPeriodResponse>(
    `${BLOCKED_PERIODS_ENDPOINT}/${blockedPeriodId}`,
    {
      method: "DELETE",
    },
  );
}