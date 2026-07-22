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
  const locale = segments[0];

  if (!isAppLocale(locale ?? "")) {
    const saved = request.cookies.get("NEXT_LOCALE")?.value;
    const targetLocale = isAppLocale(saved ?? "") ? saved : "uz";
    return secure(
      NextResponse.redirect(
        new URL(
          `/${targetLocale}${pathname === "/" ? "" : pathname}${search}`,
          request.url,
        ),
      ),
    );
  }

  const internalPath = `/${segments.slice(1).join("/")}`;
  if (internalPath.startsWith("/products/")) {
    const legacy = await findActiveRedirect(pathname);
    if (legacy?.destinationPath.startsWith("/")) {
      return secure(
        NextResponse.redirect(
          new URL(legacy.destinationPath, request.url),
          301,
        ),
      );
    }
  }
  const isAdmin =
    internalPath === "/admin" || internalPath.startsWith("/admin/");
  const isLogin = internalPath === "/admin/login";
  if (isAdmin && !request.auth && !isLogin) {
    const login = new URL(`/${locale}/admin/login`, request.url);
    login.searchParams.set("redirectTo", `${pathname}${search}`);
    return secure(NextResponse.redirect(login));
  }
  if (isAdmin && request.auth && isLogin)
    return secure(
      NextResponse.redirect(new URL(`/${locale}/admin`, request.url)),
    );

  const url = request.nextUrl.clone();
  url.pathname = internalPath;
  const headers = new Headers(request.headers);
  headers.set("x-motobike-locale", locale);
  const response = NextResponse.rewrite(url, { request: { headers } });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 31_536_000,
  });
  return secure(response);
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
