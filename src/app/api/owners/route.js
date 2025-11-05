import { insertRow, updateRow, deleteRow } from "../../../lib/db.js";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { sendEmail } from "../../../lib/mailer.js";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  const body = await req.json();
  const { full_name, phone, email, national_id, address } = body;

  if (!full_name || !phone || !email) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Generate random password (1000-9999)
    const randomPassword = Math.floor(Math.random() * 9000) + 1000;
    const passwordHash = crypto
      .createHash("md5")
      .update(randomPassword.toString())
      .digest("hex");

    const owner = await insertRow(
      "owners",
      {
        full_name,
        phone,
        email,
        national_id,
        address,
        password: passwordHash,
        password_text: randomPassword.toString(),
      },
      "id"
    );

    // Send welcome email with password
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to The Rentall Company!",
        title: "Welcome to The Rentall Company!",
        body: `
          <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Congratulations, ${full_name}!</h2>
          
          <p style="margin: 0 0 15px 0; font-size: 16px; color: #555555; line-height: 1.6;">
            We're thrilled to have you onboard as a property owner with The Rentall Company. Your account has been successfully created, and you can now start managing your properties with ease.
          </p>
          
          <!-- Credentials Table -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0; background-color: #f8f9fa; border-left: 4px solid #4CAF50; border-radius: 4px;">
            <tr>
              <td style="padding: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Your Login Credentials</h3>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #666666;">Email:</strong>
                      <span style="color: #333333; margin-left: 10px;">${email}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #666666;">Password:</strong>
                      <span style="font-size: 24px; font-weight: bold; color: #4CAF50; letter-spacing: 2px; margin-left: 10px;">${randomPassword}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin: 15px 0 0 0; padding: 12px; background-color: #fff3cd; border-radius: 4px; font-size: 14px; color: #856404;">
                  <strong>⚠️ Important:</strong> Please keep this password secure. We recommend changing it after your first login.
                </p>
              </td>
            </tr>
          </table>
          
          <h3 style="margin: 25px 0 15px 0; color: #333333; font-size: 18px;">What's Next?</h3>
          <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #555555; line-height: 1.8;">
            <li>Log in to your dashboard using the credentials above</li>
            <li>Add your properties and units</li>
            <li>Start managing tenants and leases</li>
            <li>Track rent payments and analytics</li>
          </ul>
          
          <!-- CTA Button -->
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <a href="${
                  process.env.NEXT_PUBLIC_BASE_URL ||
                  "https://therentallcompany.co.ke"
                }/login" 
                   style="display: inline-block; padding: 14px 40px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Login to Dashboard
                </a>
              </td>
            </tr>
          </table>
          
          <p style="margin: 25px 0 0 0; font-size: 15px; color: #555555; line-height: 1.6;">
            If you have any questions or need assistance, our team is here to help!
          </p>
        `,
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the request if email fails, just log it
    }

    return Response.json({
      success: true,
      owner_id: owner.id,
      password: randomPassword,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to add owner", details: error.message },
      { status: 500 }
    );
  }
}

// Get owners
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    try {
      const owners = await sql`
        SELECT id, full_name, phone, email, national_id, address, created_at, password_text
        FROM owners
        ORDER BY created_at DESC
      `;

      return Response.json(owners);
    } catch (error) {
      console.error("GET /api/owners error:", error);
      return Response.json(
        { error: "Failed to fetch owners", details: error.message },
        { status: 500 }
      );
    }
  } else {
    // Get single owner
    try {
      const owner = await sql`
        SELECT id, full_name, phone, email, national_id, address, created_at, password_text
        FROM owners
        WHERE id = ${Number(id)}
      `;

      if (owner.length === 0) {
        return Response.json({ error: "Owner not found" }, { status: 404 });
      }
      return Response.json(owner[0]);
    } catch (error) {
      console.error("GET /api/owners error:", error);
      return Response.json(
        { error: "Failed to fetch owner", details: error.message },
        { status: 500 }
      );
    }
  }
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid owner ID" }, { status: 400 });
  }

  const data = await req.json();

  // If updating password, generate new random password and hash
  if (data.regenerate_password) {
    const randomPassword = Math.floor(Math.random() * 9000) + 1000;
    const passwordHash = crypto
      .createHash("md5")
      .update(randomPassword.toString())
      .digest("hex");
    data.password = passwordHash;
    data.password_text = randomPassword.toString();
    delete data.regenerate_password;
  }

  try {
    await updateRow("owners", data, { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/owners error:", err);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || isNaN(id)) {
    return Response.json({ error: "Invalid owner ID" }, { status: 400 });
  }

  try {
    // Check if owner has buildings
    const buildings = await sql`
      SELECT COUNT(*)::int AS count
      FROM buildings
      WHERE owner_id = ${Number(id)}
    `;

    if (buildings[0]?.count > 0) {
      return Response.json(
        { error: "Owner has buildings. Cannot delete." },
        { status: 400 }
      );
    }

    await deleteRow("owners", { id: Number(id) });
    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/owners error:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
