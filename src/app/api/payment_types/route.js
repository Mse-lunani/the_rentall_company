import { insertRow } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  const body = await req.json();
  const { name, type, amount, owner_id } = body;

  if (!name) {
    return Response.json(
      { error: "Missing required field: name" },
      { status: 400 }
    );
  }

  const payload = {
    name,
    type: type || "dynamic",
    amount: amount ?? null,
    owner_id: owner_id ?? null,
  };

  try {
    const inserted = await insertRow("payment_types", payload, "id");
    return Response.json({ success: true, payment_type_id: inserted.id });
  } catch (error) {
    console.error("POST /api/payment_types error:", error);
    return Response.json(
      { error: "Failed to create payment type", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const rows =
      await sql`SELECT id, name, type, amount, owner_id FROM payment_types ORDER BY id`;
    return Response.json(rows);
  } catch (error) {
    console.error("GET /api/payment_types error:", error);
    return Response.json(
      { error: "Failed to fetch payment types", details: error.message },
      { status: 500 }
    );
  }
}
