import { sendEmail } from "../../../lib/mailer.js";

export async function GET(request) {
  try {
    console.log("Testing email configuration...");
    console.log("Email server:", process.env.EMAIL_SERVER_HOST);
    console.log("Email from:", process.env.EMAIL_FROM);
    console.log("Test recipient:", process.env.TEST_EMAIL_RECIPIENT);

    const recipient = process.env.TEST_EMAIL_RECIPIENT;

    if (!recipient) {
      return Response.json(
        {
          success: false,
          message:
            "Please configure the TEST_EMAIL_RECIPIENT environment variable in .env.local",
        },
        { status: 400 }
      );
    }

    await sendEmail({
      to: recipient,
      subject: "Test Email from The Rentall Company",
      title: "🧪 Email Test Successful!",
      body: `
        <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Email Configuration is Working!</h2>
        
        <p style="margin: 0 0 15px 0; font-size: 16px; color: #555555; line-height: 1.6;">
          Great news! Your email system is properly configured and working correctly.
        </p>
        
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0; background-color: #f8f9fa; border-left: 4px solid #4CAF50; border-radius: 4px;">
          <tr>
            <td style="padding: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">Test Details</h3>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #666666;">Sent From:</strong>
                    <span style="color: #333333; margin-left: 10px;">${
                      process.env.EMAIL_FROM
                    }</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #666666;">SMTP Server:</strong>
                    <span style="color: #333333; margin-left: 10px;">${
                      process.env.EMAIL_SERVER_HOST
                    }:${process.env.EMAIL_SERVER_PORT}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <strong style="color: #666666;">Test Time:</strong>
                    <span style="color: #333333; margin-left: 10px;">${new Date().toLocaleString()}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="margin: 25px 0 0 0; font-size: 15px; color: #555555; line-height: 1.6;">
          ✅ Your email notifications for owner onboarding, password resets, and other features will work perfectly!
        </p>
      `,
    });

    console.log("Test email sent successfully!");

    return Response.json({
      success: true,
      message: `Test email sent successfully to ${recipient}!`,
      recipient: recipient,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to send test email:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to send test email",
        error: error.message,
        details: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          from: process.env.EMAIL_FROM,
        },
      },
      { status: 500 }
    );
  }
}
