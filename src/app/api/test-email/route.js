import { sendEmail } from "../../../lib/mailer";

export async function GET(request) {
  try {
    // YOU MUST REPLACE THIS with a real email address for testing
    const recipient =
      process.env.TEST_EMAIL_RECIPIENT || "put-your-email-here@example.com";

    if (recipient === "put-your-email-here@example.com") {
      return Response.json(
        {
          success: false,
          message:
            "Please configure the TEST_EMAIL_RECIPIENT environment variable or edit the test API route with a valid email address.",
        },
        { status: 400 }
      );
    }

    const testEmail = {
      to: recipient,
      subject: "Test Email from Rentall",
      html: "<h1>Hello!</h1><p>This is a test email from your Rentall application setup.</p>",
    };

    await sendEmail(testEmail);

    return Response.json({
      success: true,
      message: `Test email sent to ${testEmail.to}`,
    });
  } catch (error) {
    console.error("Failed to send test email:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to send test email",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
