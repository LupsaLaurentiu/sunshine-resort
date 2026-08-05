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
  const internalPath =
    getInternalPathFromPublicPath(
      request.nextUrl.pathname,
    );

  if (
    !internalPath ||
    internalPath ===
      request.nextUrl.pathname
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