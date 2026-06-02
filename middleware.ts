import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const locales = ["en", "cz", "de", "uk"];

function getLocaleAndPathname(pathname: string) {
  const segments = pathname.split("/");
  if (segments.length > 1 && locales.includes(segments[1])) {
    const locale = segments[1];
    const rest = "/" + segments.slice(2).join("/");
    return { locale, cleanPathname: rest };
  }
  return { locale: "en", cleanPathname: pathname };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the path is static or API
  if (
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Parse locale and normalized pathname
  const { locale, cleanPathname } = getLocaleAndPathname(pathname);

  // 3. Skip auth checks for public pages
  const isPublicPage = 
    cleanPathname === "/" ||
    cleanPathname === "/pricing" ||
    cleanPathname === "/privacy" ||
    cleanPathname === "/terms" ||
    cleanPathname.includes("/sign-in") || 
    cleanPathname.includes("/sign-up");

  if (isPublicPage) {
    return intlMiddleware(request);
  }

  // 4. Get authentication session safely
  let session: Session | null = null;
  try {
    const { data } = await betterFetch<Session>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );
    session = data;
  } catch (error) {
    console.error("Middleware session fetch failed:", error);
  }

  // 5. If no session, redirect to sign-in with correct locale
  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  // 6. Check superadmin routes
  if (cleanPathname.startsWith("/superadmin")) {
    if (!session.user.isSuperAdmin && session.user.role !== "superadmin") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // 7. If everything is fine, pass to intlMiddleware to handle dynamic locale negotiation
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
