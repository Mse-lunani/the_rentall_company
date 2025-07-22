import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(req, { params }) {
  const resolvedParams = await params;
  const ownerId = resolvedParams.id;

  if (!ownerId || isNaN(ownerId)) {
    return Response.json({ error: "Invalid owner ID" }, { status: 400 });
  }

  try {
    // Get owner details
    const owner = await sql`
      SELECT id, full_name, phone, email, national_id, address, created_at, password_text
      FROM owners
      WHERE id = ${Number(ownerId)}
    `;

    if (owner.length === 0) {
      return Response.json({ error: "Owner not found" }, { status: 404 });
    }

    // Get owner's buildings
    const buildings = await sql`
      SELECT id, name, type, units_owned, total_space_sqm, occupancy_status, created_at
      FROM buildings
      WHERE owner_id = ${Number(ownerId)}
      ORDER BY created_at DESC
    `;

    // Get owner's units with building info and occupancy status
    const units = await sql`
      SELECT u.id, u.name, u.rent_amount_kes, u.created_at,
             b.name as building_name, b.id as building_id,
             CASE WHEN t.unit_id IS NOT NULL THEN 'occupied' ELSE 'vacant' END as status
      FROM units u
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN tenants t ON u.id = t.unit_id
      WHERE u.owner_id = ${Number(ownerId)}
      ORDER BY u.created_at DESC
    `;

    // Get owner's tenants
    const tenants = await sql`
      SELECT t.id, t.full_name, t.phone, t.email, t.created_at,
             u.name as unit_name, u.rent_amount_kes,
             b.name as building_name
      FROM tenants t
      JOIN units u ON t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.owner_id = ${Number(ownerId)}
      ORDER BY t.created_at DESC
    `;

    // Calculate KPIs
    const totalBuildings = buildings.length;
    const totalUnits = units.length;
    const totalTenants = tenants.length;
    const occupiedUnits = units.filter((u) => u.status === "occupied").length;
    const vacantUnits = totalUnits - occupiedUnits;

    // Calculate total monthly rent potential
    const totalRentPotential = units.reduce(
      (sum, unit) => sum + (parseFloat(unit.rent_amount_kes) || 0),
      0
    );
    const actualRentIncome = units
      .filter((u) => u.status === "occupied")
      .reduce((sum, unit) => sum + (parseFloat(unit.rent_amount_kes) || 0), 0);

    // Get recent payments for this owner's properties
    const recentPayments = await sql`
      SELECT p.id, p.amount_paid, p.date_paid as payment_date,
             t.full_name as tenant_name,
             u.name as unit_name,
             b.name as building_name
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      JOIN units u ON t.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.owner_id = ${Number(ownerId)}
      ORDER BY p.date_paid DESC
      LIMIT 10
    `;

    const kpis = {
      totalBuildings,
      totalUnits,
      totalTenants,
      occupiedUnits,
      vacantUnits,
      occupancyRate:
        totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
      totalRentPotential,
      actualRentIncome,
      revenueEfficiency:
        totalRentPotential > 0
          ? Math.round((actualRentIncome / totalRentPotential) * 100)
          : 0,
    };

    return Response.json({
      owner: owner[0],
      buildings,
      units,
      tenants,
      recentPayments,
      kpis,
    });
  } catch (error) {
    console.error("GET /api/owners/[id] error:", error);
    return Response.json(
      { error: "Failed to fetch owner details", details: error.message },
      { status: 500 }
    );
  }
}
