import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
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

  if (cleanPathname.startsWith("/auth/callback")) {
    return NextResponse.next();
  }

  // 3. Skip auth checks for public pages
  const isPublicPage = 
    cleanPathname === "/" ||
    cleanPathname === "/pricing" ||
    cleanPathname === "/privacy" ||
    cleanPathname === "/terms" ||
    cleanPathname.includes("/sign-in") || 
    cleanPathname.includes("/sign-up") || cleanPathname.includes("/admin/whatsapp");

  if (isPublicPage) {
    return intlMiddleware(request);
  }

  // 4. Supabase Auth Check
  const { supabase, response: res } = await updateSession(request);
  const { data: { user } } = await supabase.auth.getUser();

  // 5. If no session, redirect to sign-in with correct locale
  if (!user) {
    const redirectResponse = NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
    res.headers.forEach((value, key) => {
      redirectResponse.headers.set(key, value);
    });
    return redirectResponse;
  }

  // 6. Check superadmin routes (fetch user role from database if needed)
  if (cleanPathname.startsWith("/superadmin")) {
    const { data: dbUser } = await supabase.from('Users').select('isSuperAdmin, role').eq('id', user.id).single();
    if (!dbUser?.isSuperAdmin && dbUser?.role !== "superadmin") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // 7. Pass to intlMiddleware and append any headers from updateSession
  const intlResponse = intlMiddleware(request);
  res.headers.forEach((value, key) => {
     intlResponse.headers.set(key, value);
  });
  
  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
