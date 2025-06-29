import { sql } from "@vercel/postgres";

export async function GET() {
  const result = await sql`SELECT * FROM admins`;
  return Response.json(result.rows);
}
