import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'Testifaith <noreply@testifaith.com>';
const REPLY_TO = process.env.REPLY_TO_EMAIL || 'testifaith2025@gmail.com';

function getWelcomeEmailHtml(firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Testifaith</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #111111; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Space Grotesk', 'Segoe UI', sans-serif; font-size: 36px; font-weight: 700; color: #FFFFFF; letter-spacing: 1px;">
                TESTIFAITH
              </h1>
              <p style="margin: 10px 0 0; font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 2px; text-transform: uppercase;">
                Share Your Faith Journey
              </p>
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-family: 'Space Grotesk', 'Segoe UI', sans-serif; font-size: 28px; color: #FFFFFF;">
                Welcome, ${firstName}!
              </h2>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #CCCCCC;">
                We're blessed to have you join our faith community. Testifaith is a place where believers come together to share testimonies of God's goodness and encourage one another in faith.
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #CCCCCC;">
                <em>"They triumphed over him by the blood of the Lamb and by the word of their testimony."</em>
                <br>
                <span style="color: #EF4444;">— Revelation 12:11</span>
              </p>
            </td>
          </tr>
          
          <!-- Getting Started Section -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h3 style="margin: 0 0 20px; font-size: 20px; color: #FFFFFF; font-family: 'Space Grotesk', 'Segoe UI', sans-serif;">
                Here's How to Get Started:
              </h3>
              
              <!-- Step 1 -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td width="50" valign="top">
                    <div style="width: 36px; height: 36px; background-color: #EF4444; border-radius: 50%; text-align: center; line-height: 36px; color: #FFFFFF; font-weight: bold; font-size: 16px;">1</div>
                  </td>
                  <td style="padding-left: 15px;">
                    <h4 style="margin: 0 0 5px; font-size: 16px; color: #FFFFFF;">Share Your Testimony</h4>
                    <p style="margin: 0; font-size: 14px; color: #999999; line-height: 1.5;">Tell your story of faith, healing, breakthrough, or any way God has moved in your life.</p>
                  </td>
                </tr>
              </table>
              
              <!-- Step 2 -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td width="50" valign="top">
                    <div style="width: 36px; height: 36px; background-color: #EF4444; border-radius: 50%; text-align: center; line-height: 36px; color: #FFFFFF; font-weight: bold; font-size: 16px;">2</div>
                  </td>
                  <td style="padding-left: 15px;">
                    <h4 style="margin: 0 0 5px; font-size: 16px; color: #FFFFFF;">Explore Categories</h4>
                    <p style="margin: 0; font-size: 14px; color: #999999; line-height: 1.5;">Browse testimonies in Healing, Marriage, Fruitfulness, Finance, Breakthrough, Deliverance, and more.</p>
                  </td>
                </tr>
              </table>
              
              <!-- Step 3 -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td width="50" valign="top">
                    <div style="width: 36px; height: 36px; background-color: #EF4444; border-radius: 50%; text-align: center; line-height: 36px; color: #FFFFFF; font-weight: bold; font-size: 16px;">3</div>
                  </td>
                  <td style="padding-left: 15px;">
                    <h4 style="margin: 0 0 5px; font-size: 16px; color: #FFFFFF;">Encourage Others</h4>
                    <p style="margin: 0; font-size: 14px; color: #999999; line-height: 1.5;">Say "Amen" or send encouragement to uplift fellow believers in their faith journey.</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://testifaith.com" style="display: inline-block; padding: 16px 40px; background-color: #EF4444; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; letter-spacing: 0.5px;">
                      Start Exploring
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Daily Feature Highlight -->
          <tr>
            <td style="padding: 30px 40px; background-color: #1A1A1A; border-top: 1px solid #333333;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px; font-size: 14px; color: #EF4444; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Daily Inspiration
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #CCCCCC; line-height: 1.5;">
                      Visit daily for a featured "Testimony of the Day" and faith declarations to strengthen your walk with God.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-top: 1px solid #333333;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                With love and blessings,<br>
                <span style="color: #CCCCCC;">The Testifaith Team</span>
              </p>
              <p style="margin: 20px 0 0; font-size: 12px; color: #555555;">
                © ${new Date().getFullYear()} Testifaith. All rights reserved.
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

function getWelcomeEmailText(firstName: string): string {
  return `
Welcome to Testifaith, ${firstName}!

We're blessed to have you join our faith community. Testifaith is a place where believers come together to share testimonies of God's goodness and encourage one another in faith.

"They triumphed over him by the blood of the Lamb and by the word of their testimony." — Revelation 12:11

HERE'S HOW TO GET STARTED:

1. Share Your Testimony
   Tell your story of faith, healing, breakthrough, or any way God has moved in your life.

2. Explore Categories
   Browse testimonies in Healing, Marriage, Fruitfulness, Finance, Breakthrough, Deliverance, and more.

3. Encourage Others
   Say "Amen" or send encouragement to uplift fellow believers in their faith journey.

Visit us at: https://testifaith.com

DAILY INSPIRATION
Visit daily for a featured "Testimony of the Day" and faith declarations to strengthen your walk with God.

With love and blessings,
The Testifaith Team

© ${new Date().getFullYear()} Testifaith. All rights reserved.
`;
}

function getPasswordResetEmailHtml(firstName: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password — Testifaith</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #111111; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 36px 40px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Space Grotesk', 'Segoe UI', sans-serif; font-size: 32px; font-weight: 700; color: #FFFFFF; letter-spacing: 1px;">TESTIFAITH</h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.85); letter-spacing: 2px; text-transform: uppercase;">Password Reset</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-family: 'Space Grotesk', 'Segoe UI', sans-serif; font-size: 24px; color: #FFFFFF;">Hi ${firstName},</h2>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #CCCCCC;">
                We received a request to reset the password for your Testifaith account. Click the button below to choose a new password.
              </p>
              <p style="margin: 0 0 32px; font-size: 14px; color: #999999;">This link will expire in <strong style="color: #CCCCCC;">1 hour</strong>. If you didn't request this, you can safely ignore this email — your password won't change.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 48px; background-color: #EF4444; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; letter-spacing: 0.5px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 32px 0 0; font-size: 13px; color: #666666; word-break: break-all;">
                Or copy this link into your browser:<br>
                <a href="${resetUrl}" style="color: #EF4444; text-decoration: none;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #333333;">
              <p style="margin: 0; font-size: 12px; color: #555555;">© ${new Date().getFullYear()} Testifaith. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(email: string, firstName: string | undefined, resetToken: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping password reset email');
    return false;
  }

  const baseUrl = process.env.NODE_ENV === "production"
    ? "https://testifaith.com"
    : `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost"}`;
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const displayName = firstName || "Friend";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      reply_to: REPLY_TO,
      to: email,
      subject: "Reset your Testifaith password",
      html: getPasswordResetEmailHtml(displayName, resetUrl),
      text: `Hi ${displayName},\n\nReset your Testifaith password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.\n\n© ${new Date().getFullYear()} Testifaith`,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }

    console.log("Password reset email sent:", data?.id);
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping welcome email');
    return false;
  }

  const displayName = firstName || 'Friend';

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      reply_to: REPLY_TO,
      to: email,
      subject: `Welcome to Testifaith, ${displayName}!`,
      html: getWelcomeEmailHtml(displayName),
      text: getWelcomeEmailText(displayName),
    });

    if (error) {
      console.error('Welcome email error from Resend:', JSON.stringify(error));
      return false;
    }

    console.log('Welcome email sent successfully:', data?.id, '→', email);
    return true;
  } catch (error: any) {
    console.error('Welcome email exception:', error?.message || error);
    return false;
  }
}
