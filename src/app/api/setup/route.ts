import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export const preferredRegion = "sin1";

export async function POST(request: NextRequest) {
  try {
    // Check if any user already exists
    const existingUserCount = await db.user.count();

    if (existingUserCount > 0) {
      return Response.json(
        { error: "Setup has already been completed. An admin account exists." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the first admin user with hashed password
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
    });

    return Response.json(
      { success: true, message: "Admin account created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Setup error:", error);
    return Response.json(
      { error: "Failed to create admin account" },
      { status: 500 },
    );
  }
}
