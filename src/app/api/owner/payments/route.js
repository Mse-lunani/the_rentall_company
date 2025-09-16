import { sql, requireOwnerIdOr401 } from "../_common";

export async function GET(request) {
  const { error, ownerId } = requireOwnerIdOr401(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenant_id");

  try {
    const rows = await sql`
      SELECT p.*, t.full_name, u.name as unit_name, b.name as building_name
      FROM payments p
      JOIN tenants t ON p.tenant_id = t.id
      LEFT JOIN tenants_units tu ON p.tenancy_id = tu.id
      LEFT JOIN units u ON tu.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
      ${tenantId ? sql.unsafe(`AND t.id = ${Number(tenantId)}`) : sql``}
      ORDER BY p.date_paid DESC, p.created_at DESC
    `;
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/owner/payments error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
    const { error, ownerId } = requireOwnerIdOr401(req);
    if (error) return error;

    const body = await req.json();
    const { 
        tenant_id, 
        amount_paid, 
        date_paid, 
        notes,
        tenancy_id,
        unit_id
    } = body;

    if (!tenant_id || !amount_paid || !date_paid) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        let paymentData = {
            tenant_id,
            amount_paid,
            date_paid,
            notes,
            tenancy_id,
            unit_id
        };

        if (tenancy_id) {
            const [tenancy] = await sql`
                SELECT tu.id
                FROM tenants_units tu
                JOIN units u ON tu.unit_id = u.id
                LEFT JOIN buildings b ON u.building_id = b.id
                WHERE tu.id = ${tenancy_id} AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
            `;

            if (!tenancy) {
                return Response.json({ error: "Tenancy not found or not owned by you." }, { status: 403 });
            }
        } else {
            const activeTenancies = await sql`
                SELECT tu.id as tenancy_id, tu.unit_id
                FROM tenants_units tu
                JOIN units u ON tu.unit_id = u.id
                LEFT JOIN buildings b ON u.building_id = b.id
                WHERE tu.tenant_id = ${tenant_id} AND tu.occupancy_status = 'active' AND (u.owner_id = ${ownerId} OR b.owner_id = ${ownerId})
            `;

            if (activeTenancies.length > 1) {
                return Response.json({ error: "Tenant has multiple active tenancies. Please specify which unit to pay for." }, { status: 400 });
            }

            if (activeTenancies.length === 1) {
                paymentData.tenancy_id = activeTenancies[0].tenancy_id;
                paymentData.unit_id = activeTenancies[0].unit_id;
            }
        }

        const [payment] = await sql`
            INSERT INTO payments (
                tenant_id, amount_paid, date_paid, notes, tenancy_id, unit_id
            ) VALUES (
                ${paymentData.tenant_id},
                ${paymentData.amount_paid},
                ${paymentData.date_paid},
                ${paymentData.notes || null},
                ${paymentData.tenancy_id || null},
                ${paymentData.unit_id || null}
            ) RETURNING *
        `;

        return Response.json({ 
            success: true, 
            payment_id: payment.id,
            linked_to_tenancy: !!payment.tenancy_id,
            message: payment.tenancy_id ? "Payment linked to specific tenancy" : "Payment created without tenancy link"
        });

    } catch (error) {
        console.error("POST /api/owner/payments error:", error);
        return Response.json(
            { error: "Failed to record payment", details: error.message },
            { status: 500 }
        );
    }
}
