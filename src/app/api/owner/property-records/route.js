import { getRows, query } from "../../../../lib/db.js";
import { neon } from "@neondatabase/serverless";
import { sql, requireOwnerIdOr401 } from "../_common";

export async function GET(req) {
  const { error, ownerId } = requireOwnerIdOr401(req);
  const { searchParams } = new URL(req.url);
  const includeOccupied = searchParams.get("include_occupied") === "true";
  const currentTenantId = searchParams.get("current_tenant_id");
  const unitType = searchParams.get("unit_type"); // 'all', 'standalone', 'building'
  const buildingId = searchParams.get("building_id");

  const buildings = await sql`
    SELECT b.*, o.full_name as owner_name, o.id as owner_id
    FROM buildings b
    JOIN owners o ON b.owner_id = o.id
    WHERE o.id = ${ownerId}
  `;

  // Build the WHERE clause based on filters
  let whereConditions = [`o.id = ${ownerId}`];

  // Occupancy filter
  if (!includeOccupied) {
    if (currentTenantId) {
      whereConditions.push(
        `(tu.id IS NULL OR tu.tenant_id = ${Number(currentTenantId)})`
      );
    } else {
      whereConditions.push(`tu.id IS NULL`);
    }
  }

  // Unit type filter
  if (unitType === "standalone") {
    whereConditions.push(`u.building_id IS NULL`);
  } else if (unitType === "building" && buildingId) {
    whereConditions.push(`u.building_id = ${Number(buildingId)}`);
  }

  // Combine WHERE conditions
  let whereClause = sql``;
  if (whereConditions.length > 0) {
    const conditionString = whereConditions.join(" AND ");
    whereClause = sql.unsafe(`WHERE ${conditionString}`);
  }

  const units = await sql`
    SELECT 
      u.*,
      COALESCE(b.name, 'Standalone') AS building_name,
      o.full_name as owner_name,
      o.id as owner_id,
      CASE WHEN tu.id IS NOT NULL THEN true ELSE false END as is_occupied,
      t.full_name as tenant_name,
      t.id as tenant_id
    FROM units u
    LEFT JOIN buildings b ON u.building_id = b.id
    JOIN owners o ON u.owner_id = o.id
    LEFT JOIN tenants_units tu ON u.id = tu.unit_id AND tu.occupancy_status = 'active'
    LEFT JOIN tenants t ON tu.tenant_id = t.id
    ${whereClause}
    ORDER BY b.name, u.name
  `;

  return Response.json({ buildings, units });
}
