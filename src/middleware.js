import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("session"); // admin session
  const ownerSession = request.cookies.get("owner_session"); // owner session

  const { pathname } = request.nextUrl;

  const isAdminLogin = pathname.startsWith("/login");
  const isAdminProtected = pathname.startsWith("/dashboard");

  const isOwnerLogin = pathname.startsWith("/owner-login");
  const isOwnerDashboard = pathname.startsWith("/owner_dashboard");
  const isOwnerApi = pathname.startsWith("/api/owner/");

  // Admin protection
  if (isAdminProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAdminLogin && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Owner protection
  if ((isOwnerDashboard || isOwnerApi) && !ownerSession) {
    return NextResponse.redirect(new URL("/owner-login", request.url));
  }
  if (isOwnerLogin && ownerSession) {
    return NextResponse.redirect(new URL("/owner_dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/owner_dashboard/:path*",
    "/owner-login",
    "/api/owner/:path*",
  ],
};
