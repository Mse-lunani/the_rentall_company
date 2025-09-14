import { insertRow, updateRow, deleteRow } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
export async function POST(req) {
  const body = await req.json();
  const { 
    tenant_id, 
    amount_paid, 
    date_paid, 
    notes,
    // New Phase 2 fields
    tenancy_id,
    unit_id,
    // Backward compatibility
    use_legacy_only = false 
  } = body;

  if (!tenant_id || !amount_paid || !date_paid) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Enhanced Phase 2: Support both legacy and new payment tracking
    let paymentData = {
      tenant_id,
      amount_paid,
      date_paid,
      notes
    };

    if (!use_legacy_only) {
      // Get current tenancy info if not provided
      if (!tenancy_id || !unit_id) {
        const [currentTenancy] = await sql`
          SELECT tu.id as tenancy_id, tu.unit_id
          FROM tenants_units tu
          WHERE tu.tenant_id = ${tenant_id} AND tu.occupancy_status = 'active'
          LIMIT 1
        `;

        if (currentTenancy) {
          paymentData.tenancy_id = tenancy_id || currentTenancy.tenancy_id;
          paymentData.unit_id = unit_id || currentTenancy.unit_id;
        }
      } else {
        paymentData.tenancy_id = tenancy_id;
        paymentData.unit_id = unit_id;
      }
    }

    // Create payment record
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
      message: payment.tenancy_id ? "Payment linked to specific tenancy" : "Payment created in legacy mode"
    });

  } catch (error) {
    console.error("POST /api/payments error:", error);
    return Response.json(
      { error: "Failed to record payment", details: error.message },
      { status: 500 }
    );
  }
}
// get payments - Updated for Phase 2: Enhanced with tenancy tracking
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const tenant_id = searchParams.get("tenant_id");
  const tenancy_id = searchParams.get("tenancy_id");
  const unit_id = searchParams.get("unit_id");
  
  if (!id || isNaN(id)) {
    try {
      // Enhanced query supporting both legacy and new structure
      let payments;
      
      if (tenant_id && tenancy_id && unit_id) {
        payments = await sql`
          SELECT 
            p.id, p.tenant_id, t.full_name, t.phone, t.email, 
            p.amount_paid, p.date_paid, p.notes, p.created_at,
            u_legacy.name as legacy_unit_number, b_legacy.name as legacy_building_name,
            p.unit_id as payment_unit_id, u_payment.name as payment_unit_name,
            b_payment.name as payment_building_name, p.tenancy_id,
            tu.start_date as tenancy_start, tu.occupancy_status, tu.monthly_rent as tenancy_rent,
            CASE 
              WHEN p.tenancy_id IS NOT NULL THEN 'LINKED_TO_TENANCY'
              WHEN p.unit_id IS NOT NULL THEN 'LINKED_TO_UNIT'
              ELSE 'LEGACY_ONLY'
            END as payment_tracking_status
          FROM payments p
          JOIN tenants t ON p.tenant_id = t.id
          LEFT JOIN units u_legacy ON t.unit_id = u_legacy.id
          LEFT JOIN buildings b_legacy ON u_legacy.building_id = b_legacy.id
          LEFT JOIN units u_payment ON p.unit_id = u_payment.id
          LEFT JOIN buildings b_payment ON u_payment.building_id = b_payment.id
          LEFT JOIN tenants_units tu ON p.tenancy_id = tu.id
          WHERE p.tenant_id = ${tenant_id} AND p.tenancy_id = ${tenancy_id} AND p.unit_id = ${unit_id}
          ORDER BY p.date_paid DESC, p.created_at DESC
        `;
      } else if (tenant_id) {
        payments = await sql`
          SELECT 
            p.id, p.tenant_id, t.full_name, t.phone, t.email, 
            p.amount_paid, p.date_paid, p.notes, p.created_at,
            u_legacy.name as legacy_unit_number, b_legacy.name as legacy_building_name,
            p.unit_id as payment_unit_id, u_payment.name as payment_unit_name,
            b_payment.name as payment_building_name, p.tenancy_id,
            tu.start_date as tenancy_start, tu.occupancy_status, tu.monthly_rent as tenancy_rent,
            CASE 
              WHEN p.tenancy_id IS NOT NULL THEN 'LINKED_TO_TENANCY'
              WHEN p.unit_id IS NOT NULL THEN 'LINKED_TO_UNIT'
              ELSE 'LEGACY_ONLY'
            END as payment_tracking_status
          FROM payments p
          JOIN tenants t ON p.tenant_id = t.id
          LEFT JOIN units u_legacy ON t.unit_id = u_legacy.id
          LEFT JOIN buildings b_legacy ON u_legacy.building_id = b_legacy.id
          LEFT JOIN units u_payment ON p.unit_id = u_payment.id
          LEFT JOIN buildings b_payment ON u_payment.building_id = b_payment.id
          LEFT JOIN tenants_units tu ON p.tenancy_id = tu.id
          WHERE p.tenant_id = ${tenant_id}
          ORDER BY p.date_paid DESC, p.created_at DESC
        `;
      } else if (tenancy_id) {
        payments = await sql`
          SELECT 
            p.id, p.tenant_id, t.full_name, t.phone, t.email, 
            p.amount_paid, p.date_paid, p.notes, p.created_at,
            u_legacy.name as legacy_unit_number, b_legacy.name as legacy_building_name,
            p.unit_id as payment_unit_id, u_payment.name as payment_unit_name,
            b_payment.name as payment_building_name, p.tenancy_id,
            tu.start_date as tenancy_start, tu.occupancy_status, tu.monthly_rent as tenancy_rent,
            CASE 
              WHEN p.tenancy_id IS NOT NULL THEN 'LINKED_TO_TENANCY'
              WHEN p.unit_id IS NOT NULL THEN 'LINKED_TO_UNIT'
              ELSE 'LEGACY_ONLY'
            END as payment_tracking_status
          FROM payments p
          JOIN tenants t ON p.tenant_id = t.id
          LEFT JOIN units u_legacy ON t.unit_id = u_legacy.id
          LEFT JOIN buildings b_legacy ON u_legacy.building_id = b_legacy.id
          LEFT JOIN units u_payment ON p.unit_id = u_payment.id
          LEFT JOIN buildings b_payment ON u_payment.building_id = b_payment.id
          LEFT JOIN tenants_units tu ON p.tenancy_id = tu.id
          WHERE p.tenancy_id = ${tenancy_id}
          ORDER BY p.date_paid DESC, p.created_at DESC
        `;
      } else if (unit_id) {
        payments = await sql`
          SELECT 
            p.id, p.tenant_id, t.full_name, t.phone, t.email, 
            p.amount_paid, p.date_paid, p.notes, p.created_at,
            u_legacy.name as legacy_unit_number, b_legacy.name as legacy_building_name,
            p.unit_id as payment_unit_id, u_payment.name as payment_unit_name,
            b_payment.name as payment_building_name, p.tenancy_id,
            tu.start_date as tenancy_start, tu.occupancy_status, tu.monthly_rent as tenancy_rent,
            CASE 
              WHEN p.tenancy_id IS NOT NULL THEN 'LINKED_TO_TENANCY'
              WHEN p.unit_id IS NOT NULL THEN 'LINKED_TO_UNIT'
              ELSE 'LEGACY_ONLY'
            END as payment_tracking_status
          FROM payments p
          JOIN tenants t ON p.tenant_id = t.id
          LEFT JOIN units u_legacy ON t.unit_id = u_legacy.id
          LEFT JOIN buildings b_legacy ON u_legacy.building_id = b_legacy.id
          LEFT JOIN units u_payment ON p.unit_id = u_payment.id
          LEFT JOIN buildings b_payment ON u_payment.building_id = b_payment.id
          LEFT JOIN tenants_units tu ON p.tenancy_id = tu.id
          WHERE p.unit_id = ${unit_id}
          ORDER BY p.date_paid DESC, p.created_at DESC
        `;
      } else {
        payments = await sql`
          SELECT 
            p.id, p.tenant_id, t.full_name, t.phone, t.email, 
            p.amount_paid, p.date_paid, p.notes, p.created_at,
            u_legacy.name as legacy_unit_number, b_legacy.name as legacy_building_name,
            p.unit_id as payment_unit_id, u_payment.name as payment_unit_name,
            b_payment.name as payment_building_name, p.tenancy_id,
            tu.start_date as tenancy_start, tu.occupancy_status, tu.monthly_rent as tenancy_rent,
            CASE 
              WHEN p.tenancy_id IS NOT NULL THEN 'LINKED_TO_TENANCY'
              WHEN p.unit_id IS NOT NULL THEN 'LINKED_TO_UNIT'
              ELSE 'LEGACY_ONLY'
            END as payment_tracking_status
          FROM payments p
          JOIN tenants t ON p.tenant_id = t.id
          LEFT JOIN units u_legacy ON t.unit_id = u_legacy.id
          LEFT JOIN buildings b_legacy ON u_legacy.building_id = b_legacy.id
          LEFT JOIN units u_payment ON p.unit_id = u_payment.id
          LEFT JOIN buildings b_payment ON u_payment.building_id = b_payment.id
          LEFT JOIN tenants_units tu ON p.tenancy_id = tu.id
          ORDER BY p.date_paid DESC, p.created_at DESC
        `;
      }
      return Response.json(payments);

    } catch (error) {
      console.error("GET /api/payments error:", error);
      return Response.json(
        { error: "Failed to fetch payments", details: error.message },
        { status: 500 }
      );
    }
  } else {
    // Get single payment with enhanced details
    try {
      const [payment] = await sql`
        SELECT 
          p.*,
          t.full_name, 
          t.phone, 
          t.email,
          -- Legacy unit info
          u_legacy.name as legacy_unit_number,
          b_legacy.name as legacy_building_name,
          -- Payment-linked unit info
          u_payment.name as unit_name,
          b_payment.name as building_name,
          -- Tenancy info
          tu.start_date as tenancy_start,
          tu.end_date as tenancy_end,
          tu.occupancy_status,
          tu.monthly_rent as tenancy_rent,
          tu.termination_reason
        FROM payments p
        JOIN tenants t ON p.tenant_id = t.id
        LEFT JOIN units u_legacy ON t.unit_id = u_legacy.id
        LEFT JOIN buildings b_legacy ON u_legacy.building_id = b_legacy.id
        LEFT JOIN units u_payment ON p.unit_id = u_payment.id
        LEFT JOIN buildings b_payment ON u_payment.building_id = b_payment.id
        LEFT JOIN tenants_units tu ON p.tenancy_id = tu.id
        WHERE p.id = ${Number(id)}
      `;

      if (!payment) {
        return Response.json({ error: "Payment not found" }, { status: 404 });
      }

      return Response.json(payment);
    } catch (error) {
      console.error("GET /api/payments/:id error:", error);
      return Response.json(
        { error: "Failed to fetch payment", details: error.message },
        { status: 500 }
      );
    }
  }
}
export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid payment ID" }, { status: 400 });
  }

  const data = await req.json();

  try {
    await updateRow("payments", data, { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/payments error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid payment ID" }, { status: 400 });
  }

  try {
    await deleteRow("payments", { id: Number(id) });

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/payments error:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
