import { getRows, query } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  const buildings = await sql`SELECT * FROM buildings`;

  const units = await query(`
    SELECT 
      units.*,
      COALESCE(buildings.name, 'Standalone') AS building_name
    FROM units
    LEFT JOIN buildings ON units.building_id = buildings.id
  `);

  return Response.json({ buildings, units });
}
