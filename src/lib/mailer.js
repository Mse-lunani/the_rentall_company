import nodemailer from "nodemailer";

/**
 * Generate HTML email template with proper table-based layout
 * @param {string} title - Email header title
 * @param {string} bodyContent - Main HTML content for the email body
 * @returns {string} Complete HTML email
 */
function getEmailTemplate(title, bodyContent) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            <!-- Main Container -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #4CAF50; padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${title}</h1>
                </td>
              </tr>
              
              <!-- Body Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${bodyContent}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding-bottom: 15px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #333333; font-weight: bold;">Contact Us</p>
                        <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.6;">
                           <a href="mailto:info@therentallcompany.co.ke" style="color: #4CAF50; text-decoration: none;">info@therentallcompany.co.ke</a><br>
                          <a href="tel:+254723052500" style="color: #4CAF50; text-decoration: none;">+254 723 052 500</a><br>
                           Monday-Friday: 9AM - 6PM
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 15px; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          © ${new Date().getFullYear()} The Rentall Company. All Rights Reserved.
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999999;">
                          Wu Yi Plaza, Galana Road, Nairobi, Kenya
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Send email using Resend with HTML template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.title - Email header title
 * @param {string} options.body - HTML content for email body
 * @returns {Promise} Email send result
 */
/**
 * Send email using nodemailer with HTML template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.title - Email header title
 * @param {string} options.body - HTML content for email body
 * @returns {Promise} Email send result
 */
export async function sendEmail({ to, subject, title, body }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true, // Enable debug output
    logger: true, // Log to console
  });

  const html = getEmailTemplate(title || subject, body);

  try {
    // Verify connection
    await transporter.verify();
    console.log("SMTP connection verified");

    const info = await transporter.sendMail({
      from: `The Rentall Company <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
