export const SUPPORTED_LOCALES = [
  "ro",
  "en",
] as const;

export type PublicLocale =
  (typeof SUPPORTED_LOCALES)[number];

export type PublicRouteKey =
  | "home"
  | "rooms"
  | "facilities"
  | "saltWaterPool"
  | "attractions"
  | "gallery"
  | "about"
  | "contact"
  | "book";

export type PublicRouteDefinition = {
  internalPath: string;

  paths: Record<
    PublicLocale,
    string
  >;

  labels: Record<
    PublicLocale,
    string
  >;

  eyebrow: Record<
    PublicLocale,
    string
  >;
};

export const PUBLIC_ROUTES: Record<
  PublicRouteKey,
  PublicRouteDefinition
> = {
  home: {
    internalPath: "",

    paths: {
      ro: "",
      en: "",
    },

    labels: {
      ro: "Acasă",
      en: "Home",
    },

    eyebrow: {
      ro: "Sunshine Resort",
      en: "Sunshine Resort",
    },
  },

  rooms: {
    internalPath: "/rooms",

    paths: {
      ro: "/camere",
      en: "/rooms",
    },

    labels: {
      ro: "Camere",
      en: "Rooms",
    },

    eyebrow: {
      ro: "Apartamente",
      en: "Apartments",
    },
  },

  facilities: {
    internalPath: "/facilities",

    paths: {
      ro: "/facilitati",
      en: "/facilities",
    },

    labels: {
      ro: "Facilități",
      en: "Facilities",
    },

    eyebrow: {
      ro: "Experiența resortului",
      en: "The resort experience",
    },
  },

  saltWaterPool: {
    internalPath:
      "/salt-water-pool",

    paths: {
      ro: "/piscina-cu-apa-sarata",
      en: "/salt-water-pool",
    },

    labels: {
      ro: "Piscină cu apă sărată",
      en: "Saltwater Pool",
    },

    eyebrow: {
      ro: "Wellness",
      en: "Wellness",
    },
  },

  attractions: {
    internalPath: "/attractions",

    paths: {
      ro: "/atractii-turistice",
      en: "/attractions",
    },

    labels: {
      ro: "Atracții turistice",
      en: "Local Attractions",
    },

    eyebrow: {
      ro: "Descoperă împrejurimile",
      en: "Explore the surroundings",
    },
  },

  gallery: {
    internalPath: "/gallery",

    paths: {
      ro: "/galerie",
      en: "/gallery",
    },

    labels: {
      ro: "Galerie",
      en: "Gallery",
    },

    eyebrow: {
      ro: "Momente Sunshine",
      en: "Sunshine moments",
    },
  },

  about: {
    internalPath: "/about",

    paths: {
      ro: "/despre-noi",
      en: "/about",
    },

    labels: {
      ro: "Despre noi",
      en: "About Us",
    },

    eyebrow: {
      ro: "Povestea resortului",
      en: "Our story",
    },
  },

  contact: {
    internalPath: "/contact",

    paths: {
      ro: "/contact",
      en: "/contact",
    },

    labels: {
      ro: "Contact",
      en: "Contact",
    },

    eyebrow: {
      ro: "Suntem aici pentru tine",
      en: "We are here for you",
    },
  },

  book: {
    internalPath: "/book",

    paths: {
      ro: "/rezerva",
      en: "/book",
    },

    labels: {
      ro: "Rezervă",
      en: "Book",
    },

    eyebrow: {
      ro: "Rezervare directă",
      en: "Book direct",
    },
  },
};

export function isPublicLocale(
  value: string | undefined,
): value is PublicLocale {
  return (
    value === "ro" ||
    value === "en"
  );
}

export function getLocaleFromPathname(
  pathname: string,
): PublicLocale {
  const locale =
    pathname
      .split("/")
      .filter(Boolean)[0];

  return locale === "en"
    ? "en"
    : "ro";
}

export function getPublicHref(
  routeKey: PublicRouteKey,
  locale: PublicLocale,
): string {
  const localizedPath =
    PUBLIC_ROUTES[
      routeKey
    ].paths[locale];

  return `/${locale}${localizedPath}`;
}

export function getPublicRoomHref(
  slug: string,
  locale: PublicLocale,
): string {
  return `${getPublicHref(
    "rooms",
    locale,
  )}/${slug}`;
}

export function getPublicRouteKeyFromPathname(
  pathname: string,
): PublicRouteKey | null {
  const segments =
    pathname
      .split("/")
      .filter(Boolean);

  const locale =
    segments[0];

  if (!isPublicLocale(locale)) {
    return null;
  }

  const pathWithoutLocale =
    segments.length > 1
      ? `/${segments
          .slice(1)
          .join("/")}`
      : "";

  const routeEntry =
    (
      Object.entries(
        PUBLIC_ROUTES,
      ) as Array<
        [
          PublicRouteKey,
          PublicRouteDefinition,
        ]
      >
    ).find(
      ([, route]) =>
        route.paths[locale] ===
          pathWithoutLocale ||
        route.internalPath ===
          pathWithoutLocale,
    );

  return routeEntry?.[0] ?? null;
}

function getRoomSlugFromPathname(
  pathname: string,
): string | null {
  const segments =
    pathname
      .split("/")
      .filter(Boolean);

  const locale =
    segments[0];

  if (!isPublicLocale(locale)) {
    return null;
  }

  if (segments.length !== 3) {
    return null;
  }

  const roomsSegment =
    segments[1];

  const isPublicRoomsSegment =
    roomsSegment ===
    PUBLIC_ROUTES.rooms
      .paths[locale]
      .replace(
        /^\//,
        "",
      );

  const isInternalRoomsSegment =
    roomsSegment ===
    PUBLIC_ROUTES.rooms
      .internalPath
      .replace(
        /^\//,
        "",
      );

  if (
    !isPublicRoomsSegment &&
    !isInternalRoomsSegment
  ) {
    return null;
  }

  return (
    segments[2] ??
    null
  );
}

export function getEquivalentLocaleHref(
  pathname: string,
  targetLocale: PublicLocale,
): string {
  const roomSlug =
    getRoomSlugFromPathname(
      pathname,
    );

  if (roomSlug) {
    return getPublicRoomHref(
      roomSlug,
      targetLocale,
    );
  }

  const routeKey =
    getPublicRouteKeyFromPathname(
      pathname,
    );

  if (!routeKey) {
    return `/${targetLocale}`;
  }

  return getPublicHref(
    routeKey,
    targetLocale,
  );
}

export function getInternalPathFromPublicPath(
  pathname: string,
): string | null {
  const segments =
    pathname
      .split("/")
      .filter(Boolean);

  const locale =
    segments[0];

  if (!isPublicLocale(locale)) {
    return null;
  }

  const roomSlug =
    getRoomSlugFromPathname(
      pathname,
    );

  if (roomSlug) {
    return `/${locale}/rooms/${roomSlug}`;
  }

  const publicPath =
    segments.length > 1
      ? `/${segments
          .slice(1)
          .join("/")}`
      : "";

  const routeEntry =
    Object.values(
      PUBLIC_ROUTES,
    ).find(
      (route) =>
        route.paths[locale] ===
        publicPath,
    );

  if (!routeEntry) {
    return null;
  }

  return `/${locale}${routeEntry.internalPath}`;
}