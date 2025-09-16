import { cookies } from "next/headers";

export async function GET(request) {
  // Clear the tenant session cookie
  const cookieStore = await cookies();
  await cookieStore.set("tenant_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  return Response.redirect(new URL("/tenant_login", request.url));
}