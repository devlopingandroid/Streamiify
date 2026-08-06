import { Resend } from "resend";
import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || "");
  }

  generatePasswordResetHtml(name, resetUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Streamify</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f0f12; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #1a1a24; border-radius: 12px; border: 1px solid #2d2d3d; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">Streamify</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin-top: 0; font-size: 22px; color: #ffffff;">Password Reset Request</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                Hello ${name || "User"},
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                We received a request to reset your password for your Streamify account. Click the button below to set a new password:
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                  Reset Password
                </a>
              </div>

              <!-- Expiry Note -->
              <div style="padding: 16px; background-color: #242433; border-left: 4px solid #6366f1; border-radius: 4px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 14px; color: #e4e4e7;">
                  ⏱️ <strong>Expiry Notice:</strong> This password reset link is valid for <strong>15 minutes</strong> only.
                </p>
              </div>

              <!-- Security Note -->
              <div style="padding: 16px; background-color: #2b231d; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 13px; color: #fbbf24;">
                  🛡️ <strong>Security Note:</strong> If you did not request this password reset, please ignore this email or contact support. Your password will remain unchanged.
                </p>
              </div>

              <p style="font-size: 13px; line-height: 1.5; color: #71717a; margin-top: 30px;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #8b5cf6; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #12121a; text-align: center; border-top: 1px solid #2d2d3d;">
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                &copy; ${new Date().getFullYear()} Streamify. All rights reserved.
              </p>
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

  async sendPasswordResetEmail(email, name, rawToken) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;
    const htmlContent = this.generatePasswordResetHtml(name, resetUrl);

    try {
      const apiKey = process.env.RESEND_API_KEY;
      const fromEmail =
        process.env.EMAIL_FROM || "Streamify <onboarding@resend.dev>";

      // If API key is dummy or not set in dev, log reset link to console for testing
      if (!apiKey || apiKey.startsWith("re_123456789")) {
        logger.info(`[Dev Mode] Password Reset Link for ${email}: ${resetUrl}`);
      }

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: "Password Reset Request - Streamify",
        html: htmlContent,
      });

      if (error) {
        logger.error(
          { error },
          "Resend API error sending password reset email"
        );
        const isSandboxError =
          error?.statusCode === 403 ||
          error?.name === "validation_error" ||
          (error?.message && error.message.includes("testing emails"));

        if (
          !apiKey ||
          apiKey.startsWith("re_123456789") ||
          fromEmail.includes("resend.dev") ||
          isSandboxError
        ) {
          logger.info(
            `[Resend Sandbox Fallback] Reset email simulated for ${email}. Token link: ${resetUrl}`
          );
          return true;
        }
        throw new ApiError(500, error?.message || "Email send failure");
      }

      logger.info(
        { email, emailId: data?.id },
        "Password reset email sent successfully"
      );
      return true;
    } catch (error) {
      logger.error(
        { error: error.message },
        "Failed to send password reset email"
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Email send failure");
    }
  }
}

export default new EmailService();
