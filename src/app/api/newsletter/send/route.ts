import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { NextRequest } from "next/server";
import { auth } from "@/auth";

export const preferredRegion = "sin1";

// Newsletter HTML template
function newsletterTemplate(subject: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
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
              <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">${subject}</h2>
              <div style="color: #cccccc; font-size: 16px; line-height: 1.7;">
                ${content}
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 30px 40px; border-top: 1px solid #262626; text-align: center;">
              <p style="margin: 0; color: #555555; font-size: 12px;">
                © ${new Date().getFullYear()} AL AQMAR Photography. All rights reserved.
              </p>
              <p style="margin: 12px 0 0; color: #444444; font-size: 11px;">
                You received this because you subscribed to our newsletter.
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

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, content } = body;

    if (!subject || !content) {
      return Response.json(
        { error: "Subject and content are required" },
        { status: 400 },
      );
    }

    // Get all active subscribers
    const subscribers = await db.subscriber.findMany({
      where: { isActive: true },
    });

    if (subscribers.length === 0) {
      return Response.json(
        { error: "No active subscribers found" },
        { status: 400 },
      );
    }

    // Create newsletter record
    const newsletter = await db.newsletter.create({
      data: {
        subject,
        content,
      },
    });

    // Send emails to all subscribers
    let sentCount = 0;
    const html = newsletterTemplate(subject, content);

    for (const subscriber of subscribers) {
      const success = await sendEmail({
        to: subscriber.email,
        subject,
        html,
      });
      if (success) sentCount++;
    }

    // Update newsletter with sent info
    await db.newsletter.update({
      where: { id: newsletter.id },
      data: {
        sentAt: new Date(),
        sentCount,
      },
    });

    return Response.json({
      success: true,
      sentCount,
      totalSubscribers: subscribers.length,
    });
  } catch (error) {
    console.error("Newsletter send error:", error);
    return Response.json(
      { error: "Failed to send newsletter" },
      { status: 500 },
    );
  }
}
