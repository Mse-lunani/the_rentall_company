import { sendEmail } from "../../../lib/mailer";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const testEmail = {
      to: "dummye72@gmail.com",
      subject: "Test Email from Rentall",
      html: "<h1>Hello!</h1><p>This is a test email from your Rentall application setup.</p>",
    };
    await sendEmail(testEmail);
    return res.status(200).json({ message: "Task completed successfully" });
  } catch (error) {
    console.error("Cron task error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
