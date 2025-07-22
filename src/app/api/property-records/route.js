import { getRows, query } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const includeOccupied = searchParams.get("include_occupied") === "true";
  const currentTenantId = searchParams.get("current_tenant_id");
  const unitType = searchParams.get("unit_type"); // 'all', 'standalone', 'building'
  const buildingId = searchParams.get("building_id");

  const buildings = await sql`
    SELECT b.*, o.full_name as owner_name, o.id as owner_id
    FROM buildings b
    LEFT JOIN owners o ON b.owner_id = o.id
  `;

  // Build the WHERE clause based on filters
  let whereConditions = [];
  
  // Occupancy filter
  if (!includeOccupied) {
    if (currentTenantId) {
      whereConditions.push(`(t.unit_id IS NULL OR t.id = ${Number(currentTenantId)})`);
    } else {
      whereConditions.push(`t.unit_id IS NULL`);
    }
  }

  // Unit type filter
  if (unitType === 'standalone') {
    whereConditions.push(`u.building_id IS NULL`);
  } else if (unitType === 'building' && buildingId) {
    whereConditions.push(`u.building_id = ${Number(buildingId)}`);
  }

  // Combine WHERE conditions
  let whereClause = sql``;
  if (whereConditions.length > 0) {
    const conditionString = whereConditions.join(' AND ');
    whereClause = sql.unsafe(`WHERE ${conditionString}`);
  }

  const units = await sql`
    SELECT 
      u.*,
      COALESCE(b.name, 'Standalone') AS building_name,
      o.full_name as owner_name,
      o.id as owner_id,
      CASE WHEN t.unit_id IS NOT NULL THEN true ELSE false END as is_occupied,
      t.full_name as tenant_name,
      t.id as tenant_id
    FROM units u
    LEFT JOIN buildings b ON u.building_id = b.id
    LEFT JOIN owners o ON u.owner_id = o.id
    LEFT JOIN tenants t ON u.id = t.unit_id
    ${whereClause}
    ORDER BY b.name, u.name
  `;

  return Response.json({ buildings, units });
}
