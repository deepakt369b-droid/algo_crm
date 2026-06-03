import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Admin-only API paths — cookie presence checked here, role checked server-side
const ADMIN_ONLY_PATHS = [
  "/api/user/activateAdmin",
  "/api/user/deactivateAdmin",
  "/api/user/activate",
  "/api/user/deactivate",
  "/api/user/inviteuser",
  "/api/admin",
];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Inngest webhook — pass through, Inngest handles its own auth via signing key
  if (path.startsWith("/api/inngest")) {
    return NextResponse.next();
  }

  // better-auth API routes — pass through to better-auth handler
  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);

  // Admin-only routes — require session cookie (role checked server-side)
  if (ADMIN_ONLY_PATHS.some((p) => path.startsWith(p))) {
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Non-API routes — redirect to sign-in if no session cookie
  if (!path.startsWith("/api")) {
    if (!sessionCookie) {
      // Allow public pages and auth pages without redirecting to sign-in
      const allowedPaths = ["/sign-in", "/register", "/pending", "/inactive", "/pricing", "/privacy", "/terms", "/sign-up"];
      const localeRoots = ["/", "/en", "/cz", "/de", "/uk", "/en/", "/cz/", "/de/", "/uk/"];
      const isAllowed = allowedPaths.some((p) => path.includes(p)) || localeRoots.includes(path);
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
      }
    } else {
      // Authenticated user visiting the landing page or locale roots — redirect to dashboard cockpit
      const localeRoots = ["/", "/en", "/cz", "/de", "/uk", "/en/", "/cz/", "/de/", "/uk/"];
      if (localeRoots.includes(path)) {
        const targetPath = path === "/" ? "/dashboard" : `${path.endsWith("/") ? path.slice(0, -1) : path}/dashboard`;
        return NextResponse.redirect(new URL(targetPath, req.nextUrl));
      }
    }
  }

  // Non-API routes — delegate to next-intl
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Admin-only API paths
    "/api/user/activateAdmin/:path*",
    "/api/user/deactivateAdmin/:path*",
    "/api/user/activate/:path*",
    "/api/user/deactivate/:path*",
    "/api/user/inviteuser",
    "/api/admin/:path*",
    // better-auth API
    "/api/auth/:path*",
    // All non-API routes (existing intl matcher)
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
