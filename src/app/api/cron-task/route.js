import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/mailer";

export async function POST(request) {
  // Check if method is POST (redundant in App Router since this is the POST export, but good practice)
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Verify authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const testEmail = {
      to: "dummye72@gmail.com",
      subject: "Test Email from Rentall",
      html: "<h1>Hello!</h1><p>This is a test email from your Rentall application setup.</p>",
    };
    await sendEmail(testEmail);
    return NextResponse.json(
      { message: "Task completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
