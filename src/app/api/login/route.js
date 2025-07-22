import { cookies } from "next/headers";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

export async function POST(request) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const passwordHash = crypto.createHash("md5").update(password).digest("hex");

  const sql = neon(process.env.DATABASE_URL);
  const result = await sql`
    SELECT id, email FROM admins
    WHERE email = ${email} AND password = ${passwordHash}
    LIMIT 1
  `;

  if (result.length === 0) {
    return Response.redirect(new URL("/login?error=1", request.url));
  }

  // Store session in cookie (just the user ID, or JWT if needed)
  const cookieStore = cookies();
  await cookieStore.set("session", result[0].id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return Response.redirect(new URL("/dashboard", request.url));
}
