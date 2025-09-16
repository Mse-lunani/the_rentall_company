import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

export async function POST(request) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  // Validate inputs
  if (!email || !password) {
    return Response.redirect(
      new URL("/owner-login?error=missing_fields", request.url)
    );
  }

  // Hash password
  const passwordHash = crypto.createHash("md5").update(password).digest("hex");

  // Database query
  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`
      SELECT id, email FROM owners
      WHERE email = ${email} AND password = ${passwordHash}
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.redirect(
        new URL("/owner-login?error=invalid_credentials", request.url)
      );
    }

    // Determine if we're on HTTPS
    const protocol =
      request.headers.get("x-forwarded-proto") ||
      new URL(request.url).protocol.replace(":", "");
    const isHttps = protocol === "https";

    // Get the current hostname for domain setting
    const hostname = new URL(request.url).hostname;
    const isLocalhost = hostname.includes("localhost");

    // Set owner session cookie
    const cookieStore = await cookies();
    await cookieStore.set("owner_session", result[0].id.toString(), {
      httpOnly: true,
      secure: isHttps, // Set based on actual protocol
      sameSite: "lax", // More compatible than 'strict'
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      // Only set domain in production (non-localhost HTTPS)
      domain: isHttps && !isLocalhost ? `.${hostname}` : undefined,
    });

    return Response.redirect(new URL("/owner_dashboard", request.url));
  } catch (error) {
    console.error("Owner login database error:", error);
    return Response.redirect(
      new URL("/owner-login?error=server_error", request.url)
    );
  }
}