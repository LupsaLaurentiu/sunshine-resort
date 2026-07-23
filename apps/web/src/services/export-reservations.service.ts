import type {
  ReservationSource,
  ReservationStatus,
} from "@/types/reservation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_FILE_NAME =
  "rezervari.xlsx";

export type ExportReservationsFilters = {
  status?: ReservationStatus;
  source?: ReservationSource;
  from?: string;
  to?: string;
  search?: string;
};

function getApiUrl(
  path: string,
): string {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL nu este configurat în apps/web/.env.local.",
    );
  }

  const normalizedBaseUrl =
    API_URL.replace(/\/$/, "");

  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function buildExportPath(
  filters: ExportReservationsFilters,
): string {
  const searchParams =
    new URLSearchParams();

  if (filters.status) {
    searchParams.set(
      "status",
      filters.status,
    );
  }

  if (filters.source) {
    searchParams.set(
      "source",
      filters.source,
    );
  }

  if (filters.from) {
    searchParams.set(
      "from",
      filters.from,
    );
  }

  if (filters.to) {
    searchParams.set(
      "to",
      filters.to,
    );
  }

  const normalizedSearch =
    filters.search?.trim();

  if (normalizedSearch) {
    searchParams.set(
      "search",
      normalizedSearch,
    );
  }

  const query =
    searchParams.toString();

  return query
    ? `/reservations/export?${query}`
    : "/reservations/export";
}

function validateFilters(
  filters: ExportReservationsFilters,
): void {
  if (
    filters.from &&
    filters.to &&
    filters.from > filters.to
  ) {
    throw new Error(
      "Data de început nu poate fi după data de final.",
    );
  }
}

export async function exportReservations(
  filters: ExportReservationsFilters = {},
  token: string,
): Promise<void> {
  if (!token.trim()) {
    throw new Error(
      "Sesiunea administratorului nu este disponibilă.",
    );
  }

  validateFilters(filters);

  const response =
    await fetch(
      getApiUrl(
        buildExportPath(filters),
      ),
      {
        method: "GET",

        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          Authorization:
            `Bearer ${token}`,
        },

        cache: "no-store",
      },
    );

  if (!response.ok) {
    const errorBody:
      | {
          message?:
            | string
            | string[];
        }
      | null =
      await response
        .json()
        .catch(() => null);

    const message =
      Array.isArray(
        errorBody?.message,
      )
        ? errorBody.message.join(
            " ",
          )
        : errorBody?.message;

    throw new Error(
      message ??
        "Exportul rezervărilor nu a putut fi generat.",
    );
  }

  const blob =
    await response.blob();

  if (blob.size === 0) {
    throw new Error(
      "Fișierul Excel generat este gol.",
    );
  }

  const contentDisposition =
    response.headers.get(
      "content-disposition",
    );

  const fileName =
    extractFileName(
      contentDisposition,
    ) ??
    DEFAULT_FILE_NAME;

  downloadBlob(
    blob,
    fileName,
  );
}

function downloadBlob(
  blob: Blob,
  fileName: string,
): void {
  const objectUrl =
    URL.createObjectURL(blob);

  try {
    const anchor =
      document.createElement(
        "a",
      );

    anchor.href =
      objectUrl;

    anchor.download =
      fileName;

    anchor.style.display =
      "none";

    document.body.appendChild(
      anchor,
    );

    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(
      objectUrl,
    );
  }
}

function extractFileName(
  contentDisposition:
    | string
    | null,
): string | null {
  if (!contentDisposition) {
    return null;
  }

  const utf8Match =
    contentDisposition.match(
      /filename\*\s*=\s*UTF-8''([^;]+)/i,
    );

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(
        utf8Match[1].trim(),
      );
    } catch {
      return utf8Match[1].trim();
    }
  }

  const quotedMatch =
    contentDisposition.match(
      /filename\s*=\s*"([^"]+)"/i,
    );

  if (quotedMatch?.[1]) {
    return quotedMatch[1].trim();
  }

  const unquotedMatch =
    contentDisposition.match(
      /filename\s*=\s*([^;]+)/i,
    );

  return (
    unquotedMatch?.[1]?.trim() ??
    null
  );
}