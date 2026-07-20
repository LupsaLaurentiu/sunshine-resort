import type { ApiErrorResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorResponse;

  constructor(
    message: string,
    status: number,
    payload?: ApiErrorResponse,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL nu este configurat în apps/web/.env.local.",
    );
  }

  const normalizedBaseUrl = API_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function getErrorMessage(
  payload: ApiErrorResponse | undefined,
  fallback: string,
): string {
  if (!payload?.message) {
    return fallback;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(" ");
  }

  return payload.message;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...requestOptions } = options;

  const response = await fetch(getApiUrl(path), {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(body !== undefined
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let payload: ApiErrorResponse | undefined;

    try {
      payload = (await response.json()) as ApiErrorResponse;
    } catch {
      payload = undefined;
    }

    throw new ApiError(
      getErrorMessage(
        payload,
        `Cererea API a eșuat cu statusul ${response.status}.`,
      ),
      response.status,
      payload,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}