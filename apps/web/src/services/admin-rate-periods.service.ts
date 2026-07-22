import { apiRequest } from "@/lib/api";

import type {
  AdminRatePeriod,
  CreateAdminRatePeriodRequest,
  UpdateAdminRatePeriodRequest,
} from "@/types/admin-rate-period";

const RATE_PERIODS_ENDPOINT =
  "/rate-periods";

export type GetAdminRatePeriodsQuery = {
  roomTypeId?: string;
  from?: string;
  to?: string;
};

function buildRatePeriodsPath(
  query?: GetAdminRatePeriodsQuery,
): string {
  if (!query) {
    return RATE_PERIODS_ENDPOINT;
  }

  const searchParams =
    new URLSearchParams();

  if (query.roomTypeId) {
    searchParams.set(
      "roomTypeId",
      query.roomTypeId,
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
    ? `${RATE_PERIODS_ENDPOINT}?${queryString}`
    : RATE_PERIODS_ENDPOINT;
}

export async function getAdminRatePeriods(
  query?: GetAdminRatePeriodsQuery,
): Promise<AdminRatePeriod[]> {
  return apiRequest<
    AdminRatePeriod[]
  >(
    buildRatePeriodsPath(query),
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

export async function getAdminRatePeriodById(
  ratePeriodId: string,
): Promise<AdminRatePeriod> {
  return apiRequest<
    AdminRatePeriod
  >(
    `${RATE_PERIODS_ENDPOINT}/${ratePeriodId}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
}

export async function createAdminRatePeriod(
  payload: CreateAdminRatePeriodRequest,
): Promise<AdminRatePeriod> {
  return apiRequest<
    AdminRatePeriod
  >(
    RATE_PERIODS_ENDPOINT,
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function updateAdminRatePeriod(
  ratePeriodId: string,
  payload: UpdateAdminRatePeriodRequest,
): Promise<AdminRatePeriod> {
  return apiRequest<
    AdminRatePeriod
  >(
    `${RATE_PERIODS_ENDPOINT}/${ratePeriodId}`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export async function deactivateAdminRatePeriod(
  ratePeriodId: string,
): Promise<void> {
  await apiRequest<void>(
    `${RATE_PERIODS_ENDPOINT}/${ratePeriodId}`,
    {
      method: "DELETE",
    },
  );
}