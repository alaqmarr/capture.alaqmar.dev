import nodemailer from "nodemailer";

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"AL AQMAR Photography" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

// Base email template with AL AQMAR branding
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AL AQMAR Photography</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141414; border-radius: 16px; overflow: hidden; border: 1px solid #262626;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #262626;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.1em;">
                <span style="color: #d4af37;">AL</span>
                <span style="display: inline-block; width: 6px; height: 6px; background-color: #d4af37; border-radius: 50%; margin: 0 8px; vertical-align: middle;"></span>
                <span style="color: #ffffff;">AQMAR</span>
              </h1>
              <p style="margin: 12px 0 0; color: #888888; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase;">Photography</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 30px 40px; border-top: 1px solid #262626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 12px; color: #888888; font-size: 13px;">
                      Capturing moments, one frame at a time.
                    </p>
                    <p style="margin: 0; color: #555555; font-size: 12px;">
                      © ${new Date().getFullYear()} AL AQMAR Photography. All rights reserved.
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

// Thank you email for client
export function thankYouEmailTemplate(name: string): string {
  const content = `
    <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 24px; font-weight: 600;">
      Thank You, ${name}!
    </h2>
    
    <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.7;">
      We've received your message and truly appreciate you reaching out to us. Your interest in AL AQMAR Photography means a lot.
    </p>
    
    <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%); border-left: 3px solid #d4af37; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
      <p style="margin: 0; color: #d4af37; font-size: 14px; font-weight: 500;">
        What happens next?
      </p>
      <p style="margin: 12px 0 0; color: #bbbbbb; font-size: 14px; line-height: 1.6;">
        We typically respond within 24-48 hours. In the meantime, feel free to browse our gallery to see more of our work.
      </p>
    </div>
    
    <p style="margin: 24px 0; color: #cccccc; font-size: 16px; line-height: 1.7;">
      Every moment tells a story. We're excited to help capture yours.
    </p>
    
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px 0 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); border-radius: 8px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://alaqmar.com"}/gallery" style="display: inline-block; padding: 14px 28px; color: #0a0a0a; text-decoration: none; font-size: 14px; font-weight: 600;">
            View Our Gallery →
          </a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 32px 0 0; color: #888888; font-size: 14px;">
      Warm regards,<br>
      <span style="color: #d4af37; font-weight: 500;">AL AQMAR Photography</span>
    </p>
  `;

  return baseTemplate(content);
}

// Enquiry notification for owner
export function enquiryEmailTemplate(data: {
  name: string;
  email: string;
  phone: string | null;
  message: string;
}): string {
  const content = `
    <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%); padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; color: #d4af37; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
        📩 New Enquiry Received
      </p>
    </div>
    
    <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">
      New Contact Form Submission
    </h2>
    
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #262626;">
          <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Name</p>
          <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500;">${data.name}</p>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #262626;">
          <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Email</p>
          <a href="mailto:${data.email}" style="margin: 0; color: #d4af37; font-size: 16px; text-decoration: none;">${data.email}</a>
        </td>
      </tr>
      ${
        data.phone
          ? `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #262626;">
          <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Phone</p>
          <a href="tel:${data.phone}" style="margin: 0; color: #d4af37; font-size: 16px; text-decoration: none;">${data.phone}</a>
        </td>
      </tr>
      `
          : ""
      }
      <tr>
        <td style="padding: 16px 0;">
          <p style="margin: 0 0 4px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
          <div style="margin-top: 8px; padding: 16px; background-color: #0a0a0a; border-radius: 8px; border: 1px solid #262626;">
            <p style="margin: 0; color: #cccccc; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${data.message}</p>
          </div>
        </td>
      </tr>
    </table>
    
    <table role="presentation" cellspacing="0" cellpadding="0">
      <tr>
        <td style="padding-right: 12px;">
          <a href="mailto:${data.email}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); color: #0a0a0a; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
            Reply to ${data.name.split(" ")[0]}
          </a>
        </td>
        ${
          data.phone
            ? `
        <td>
          <a href="tel:${data.phone}" style="display: inline-block; padding: 12px 24px; background-color: #262626; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 8px; border: 1px solid #333333;">
            📞 Call
          </a>
        </td>
        `
            : ""
        }
      </tr>
    </table>
    
    <p style="margin: 32px 0 0; color: #555555; font-size: 12px;">
      Received on ${new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
    </p>
  `;

  return baseTemplate(content);
}

// Login alert email for admin
export function loginAlertTemplate(data: {
  name: string;
  email: string;
  ip?: string;
}): string {
  const content = `
    <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">
      🔐 Login Alert
    </h2>
    
    <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.7;">
      A successful login was detected on your AL AQMAR Photography account.
    </p>
    
    <div style="background-color: #0a0a0a; border: 1px solid #262626; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px; color: #888888; font-size: 12px;">Account</p>
      <p style="margin: 0; color: #ffffff; font-size: 14px;">${data.name} (${data.email})</p>
    </div>
    
    <p style="margin: 0; color: #888888; font-size: 13px;">
      Time: ${new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
    </p>
    
    <p style="margin: 24px 0 0; color: #cccccc; font-size: 14px; line-height: 1.6;">
      If this wasn't you, please secure your account immediately.
    </p>
  `;

  return baseTemplate(content);
}

// Account creation welcome email
export function accountCreatedTemplate(name: string): string {
  const content = `
    <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 24px; font-weight: 600;">
      Welcome, ${name}! 🎉
    </h2>
    
    <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.7;">
      Your admin account for AL AQMAR Photography has been created successfully.
    </p>
    
    <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%); border-left: 3px solid #d4af37; padding: 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
      <p style="margin: 0; color: #d4af37; font-size: 14px; font-weight: 500;">
        What you can do now:
      </p>
      <ul style="margin: 12px 0 0; padding-left: 20px; color: #bbbbbb; font-size: 14px; line-height: 1.8;">
        <li>Create and manage photography events</li>
        <li>Upload photos and organize galleries</li>
        <li>View contact submissions</li>
        <li>Send newsletters to subscribers</li>
      </ul>
    </div>
    
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px 0 0;">
      <tr>
        <td style="background: linear-gradient(135deg, #d4af37 0%, #b8962e 100%); border-radius: 8px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://alaqmar.com"}/dashboard" style="display: inline-block; padding: 14px 28px; color: #0a0a0a; text-decoration: none; font-size: 14px; font-weight: 600;">
            Go to Dashboard →
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(content);
}

// Event created notification
export function eventCreatedTemplate(eventTitle: string): string {
  const content = `
    <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">
      📸 Event Created
    </h2>
    
    <p style="margin: 0 0 20px; color: #cccccc; font-size: 16px; line-height: 1.7;">
      A new event has been created in your portfolio.
    </p>
    
    <div style="background-color: #0a0a0a; border: 1px solid #262626; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 8px; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Event Name</p>
      <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">${eventTitle}</p>
    </div>
    
    <p style="margin: 0; color: #888888; font-size: 13px;">
      Created on ${new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
    </p>
  `;

  return baseTemplate(content);
}
