import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isAppLocale } from "@/i18n/routing";
import { findActiveRedirect } from "@/server/repositories/redirect-repository";
import { contentSecurityPolicy } from "@/server/security/headers";

function secure(response: NextResponse) {
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicy(process.env.NODE_ENV === "development"),
  );
  return response;
}

export default auth(async (request) => {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const prefix = segments[0];

  if (isAppLocale(prefix ?? "")) {
    const cleanPath = `/${segments.slice(1).join("/")}`;
    const response = NextResponse.redirect(
      new URL(`${cleanPath === "/" ? "/" : cleanPath}${search}`, request.url),
    );
    response.cookies.set("NEXT_LOCALE", prefix, {
      path: "/",
      sameSite: "lax",
      maxAge: 31_536_000,
    });
    return secure(response);
  }

  const saved = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = saved && isAppLocale(saved) ? saved : "uz";
  if (pathname.startsWith("/products/")) {
    const legacy = await findActiveRedirect(pathname);
    if (legacy?.destinationPath.startsWith("/")) {
      const destination =
        legacy.destinationPath.replace(/^\/(uz|ru|en)(?=\/|$)/, "") || "/";
      return secure(
        NextResponse.redirect(new URL(destination, request.url), 301),
      );
    }
  }
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname === "/admin/login";
  if (isAdmin && !request.auth && !isLogin) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("redirectTo", `${pathname}${search}`);
    return secure(NextResponse.redirect(login));
  }
  if (isAdmin && request.auth && isLogin)
    return secure(NextResponse.redirect(new URL("/admin", request.url)));

  const headers = new Headers(request.headers);
  headers.set("x-motobike-locale", locale);
  return secure(
    NextResponse.next({
      request: { headers },
    }),
  );
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
