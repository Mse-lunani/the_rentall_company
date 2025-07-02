import { insertRow, updateRow, deleteRow } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
export async function POST(req) {
  const body = await req.json();
  const { tenant_id, amount_paid, date_paid, notes } = body;

  if (!tenant_id || !amount_paid || !date_paid) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const payment = await insertRow(
      "payments",
      {
        tenant_id,
        amount_paid,
        date_paid,
        notes,
      },
      "id"
    );

    return Response.json({ success: true, payment_id: payment.id });
  } catch (error) {
    return Response.json(
      { error: "Failed to record payment", details: error.message },
      { status: 500 }
    );
  }
}
// get payments
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || isNaN(id)) {
    try {
      const payments = await sql`
      SELECT p.id, t.id as tenant_id,t.full_name, t.phone, t.email, u.name as unit_number, b.name AS building_name, p.amount_paid, p.date_paid, p.notes 
      FROM tenants t
      JOIN units u ON t.unit_id = u.id
      JOIN buildings b ON u.building_id = b.id
      JOIN payments p ON t.id = p.tenant_id
    `;

      return Response.json(payments);
    } catch (error) {
      console.error("GET /api/payments error:", error);
      return Response.json(
        { error: "Failed to fetch payments", details: error.message },
        { status: 500 }
      );
    }
  } else {
    //get single payment
    try {
      const payment = await await sql`
            SELECT p.id, t.id as tenant_id, t.full_name, t.phone, t.email, u.name as unit_number, b.name AS building_name, p.amount_paid, p.date_paid, p.notes
            FROM tenants t
            JOIN units u ON t.unit_id = u.id
            JOIN buildings b ON u.building_id = b.id
            JOIN payments p ON t.id = p.tenant_id
            WHERE p.id = ${Number(id)}
          `;
      if (payment.length === 0) {
        return Response.json({ error: "Payment not found" }, { status: 404 });
      }
      return Response.json(payment[0]);
    } catch (error) {
      console.error("GET /api/payment error:", error);
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
