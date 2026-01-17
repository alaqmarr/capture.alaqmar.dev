import { db } from "@/lib/db";
import { logApiError, createErrorResponse } from "@/lib/error-logger";
import {
  sendEmail,
  thankYouEmailTemplate,
  enquiryEmailTemplate,
} from "@/lib/email";
import { NextRequest } from "next/server";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

// GET /api/contact - List contact submissions (admin)
export async function GET() {
  try {
    const submissions = await db.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json(submissions);
  } catch (error) {
    await logApiError(error, "/api/contact", "GET");
    return createErrorResponse("Failed to fetch submissions", 500);
  }
}

// POST /api/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return createErrorResponse("Name, email, and message are required", 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse("Invalid email format", 400);
    }

    // Save to database
    const submission = await db.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
      },
    });

    // Send emails (non-blocking - don't wait for completion)
    const ownerEmail = process.env.GMAIL_USER;

    if (ownerEmail) {
      // Send thank you email to client
      sendEmail({
        to: email.trim().toLowerCase(),
        subject: "Thank you for contacting AL AQMAR Photography",
        html: thankYouEmailTemplate(name.trim()),
      }).catch((err) => console.error("Failed to send thank you email:", err));

      // Send enquiry notification to owner
      sendEmail({
        to: ownerEmail,
        subject: `New Enquiry from ${name.trim()}`,
        html: enquiryEmailTemplate({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,
          message: message.trim(),
        }),
      }).catch((err) => console.error("Failed to send enquiry email:", err));
    }

    return Response.json(submission, { status: 201 });
  } catch (error) {
    await logApiError(error, "/api/contact", "POST");
    return createErrorResponse("Failed to submit message", 500);
  }
}
