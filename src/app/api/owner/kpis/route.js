import { sql, requireOwnerIdOr401 } from "../_common";

export async function GET(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  try {
    const [totalTenants] = await sql`
      SELECT COUNT(*)
      FROM tenants t
      JOIN units u ON t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    const [totalPayments] = await sql`
      SELECT COALESCE(SUM(p.amount_paid), 0)
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      LEFT JOIN units u ON COALESCE(p.unit_id, t.unit_id) = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE DATE_TRUNC('month', p.date_paid) = DATE_TRUNC('month', CURRENT_DATE)
        AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    const [occupiedUnits] = await sql`
      SELECT COUNT(*)
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
        AND u.id IN (SELECT unit_id FROM tenants WHERE unit_id IS NOT NULL)
    `;

    const [totalMaintenance] = await sql`
      SELECT COUNT(*)
      FROM maintenance_logs m
      JOIN units u ON m.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
    `;

    const monthlyPayments = await sql`
      SELECT 
        DATE_TRUNC('month', p.date_paid) AS month,
        SUM(p.amount_paid) AS total
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      LEFT JOIN units u ON COALESCE(p.unit_id, t.unit_id) = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
      GROUP BY DATE_TRUNC('month', p.date_paid)
      ORDER BY month
      LIMIT 12
    `;

    const occupancyData = await sql`
      SELECT 
        b.name AS building,
        COUNT(u.id) FILTER (WHERE u.id IN (SELECT unit_id FROM tenants)) AS occupied,
        COUNT(u.id) FILTER (WHERE u.id NOT IN (SELECT unit_id FROM tenants WHERE unit_id IS NOT NULL)) AS vacant
      FROM buildings b
      LEFT JOIN units u ON b.id = u.building_id
      WHERE b.owner_id = ${ownerId}
      GROUP BY b.name
      ORDER BY b.name
    `;

    return Response.json({
      totalTenants: totalTenants.count,
      totalPayments: totalPayments.coalesce,
      occupiedUnits: occupiedUnits.count,
      totalMaintenance: totalMaintenance.count,
      monthlyPayments: monthlyPayments,
      occupancyData: occupancyData,
    });
  } catch (error) {
    console.error("Failed to load owner dashboard KPIs:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to load owner dashboard KPIs",
        totalTenants: 0,
        totalPayments: 0,
        occupiedUnits: 0,
        totalMaintenance: 0,
        monthlyPayments: [],
        occupancyData: [],
      }),
      { status: 500 }
    );
  }
}
