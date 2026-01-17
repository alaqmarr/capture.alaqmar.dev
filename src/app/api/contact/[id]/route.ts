import { db } from "@/lib/db";
import { logApiError, createErrorResponse } from "@/lib/error-logger";
import { NextRequest } from "next/server";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/contact/[id] - Mark submission as read/unread
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isRead } = body;

    const submission = await db.contactSubmission.update({
      where: { id },
      data: { isRead: isRead ?? true },
    });

    return Response.json(submission);
  } catch (error) {
    await logApiError(error, "/api/contact/[id]", "PATCH");
    return createErrorResponse("Failed to update submission", 500);
  }
}

// DELETE /api/contact/[id] - Delete submission
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await db.contactSubmission.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    await logApiError(error, "/api/contact/[id]", "DELETE");
    return createErrorResponse("Failed to delete submission", 500);
  }
}
