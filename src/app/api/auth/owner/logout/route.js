import { cookies } from "next/headers";

export async function GET(request) {
  try {
    // Clear the owner session cookie
    const cookieStore = await cookies();
    await cookieStore.set("owner_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    // Redirect to owner login page
    return Response.redirect(new URL("/owner-login", request.url));
  } catch (error) {
    console.error("Owner logout error:", error);
    return Response.redirect(new URL("/owner-login", request.url));
  }
}