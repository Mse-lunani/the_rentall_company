// app/api/kpis/route.js
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Basic KPIs
    const [totalTenants] = await sql`SELECT COUNT(*) FROM tenants`;
    const [totalPayments] = await sql`
      SELECT COALESCE(SUM(amount_paid), 0) 
      FROM payments 
      WHERE DATE_TRUNC('month', date_paid) = DATE_TRUNC('month', CURRENT_DATE)
    `;
    const [occupiedUnits] = await sql`
      SELECT COUNT(*) 
      FROM units 
      WHERE id IN (SELECT unit_id FROM tenants_units WHERE occupancy_status = 'active')
    `;
    const [totalMaintenance] = await sql`SELECT COUNT(*) FROM maintenance_logs`;

    // Monthly payments data
    const monthlyPayments = await sql`
      SELECT 
        DATE_TRUNC('month', date_paid) AS month,
        SUM(amount_paid) AS total
      FROM payments
      GROUP BY DATE_TRUNC('month', date_paid)
      ORDER BY month
      LIMIT 12
    `;

    // Corrected occupancy data query
    const occupancyData = await sql`
      SELECT 
        b.name AS building,
        COUNT(u.id) FILTER (WHERE u.id IN (SELECT unit_id FROM tenants_units WHERE occupancy_status = 'active')) AS occupied,
        COUNT(u.id) FILTER (WHERE u.id NOT IN (SELECT unit_id FROM tenants_units WHERE occupancy_status = 'active')) AS vacant
      FROM buildings b
      LEFT JOIN units u ON b.id = u.building_id
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
    console.error("Failed to load dashboard KPIs:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to load dashboard KPIs",
        totalTenants: 0,
        totalPayments: 0,
        occupiedUnits: 0,
        totalMaintenance: 0,
        monthlyPayments: [],
        occupancyData: [],
      }),
      {
        status: 500,
      }
    );
  }
}
