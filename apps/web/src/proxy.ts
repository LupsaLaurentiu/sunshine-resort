import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getInternalPathFromPublicPath,
} from "./lib/public-routes";

export function proxy(
  request: NextRequest,
) {
  const pathname =
    request.nextUrl.pathname;

  /*
   * Rute dinamice pentru apartamente:
   *
   * /ro/camere/premium-apartment
   *      ↓ rewrite intern
   * /ro/rooms/premium-apartment
   */
  const romanianRoomMatch =
    pathname.match(
      /^\/ro\/camere\/([^/]+)\/?$/,
    );

  if (
    romanianRoomMatch?.[1]
  ) {
    const rewriteUrl =
      request.nextUrl.clone();

    rewriteUrl.pathname =
      `/ro/rooms/${romanianRoomMatch[1]}`;

    return NextResponse.rewrite(
      rewriteUrl,
    );
  }

  /*
   * Ruta engleză este deja identică
   * structurii interne:
   *
   * /en/rooms/premium-apartment
   */
  const internalPath =
    getInternalPathFromPublicPath(
      pathname,
    );

  if (
    !internalPath ||
    internalPath ===
      pathname
  ) {
    return NextResponse.next();
  }

  const rewriteUrl =
    request.nextUrl.clone();

  rewriteUrl.pathname =
    internalPath;

  return NextResponse.rewrite(
    rewriteUrl,
  );
}

export const config = {
  matcher: [
    "/((?!api|admin|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};