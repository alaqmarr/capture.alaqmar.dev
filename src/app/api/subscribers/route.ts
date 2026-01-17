import { db } from "@/lib/db";
import { NextRequest } from "next/server";

export const preferredRegion = "sin1";

// GET - List all subscribers
export async function GET() {
  try {
    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(subscribers);
  } catch (error) {
    console.error("Subscriber list error:", error);
    return Response.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 },
    );
  }
}

// POST - Add new subscriber
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await db.subscriber.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      if (existing.isActive) {
        return Response.json({ error: "Already subscribed" }, { status: 400 });
      }
      // Reactivate subscriber
      await db.subscriber.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
      return Response.json({
        success: true,
        message: "Subscription reactivated",
      });
    }

    // Create new subscriber
    const subscriber = await db.subscriber.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
      },
    });

    return Response.json(subscriber, { status: 201 });
  } catch (error) {
    console.error("Subscriber add error:", error);
    return Response.json(
      { error: "Failed to add subscriber" },
      { status: 500 },
    );
  }
}

// DELETE - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    await db.subscriber.update({
      where: { email: email.trim().toLowerCase() },
      data: { isActive: false },
    });

    return Response.json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return Response.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
