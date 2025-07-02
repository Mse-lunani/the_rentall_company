import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("session");

  const isAuth = session !== undefined;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
