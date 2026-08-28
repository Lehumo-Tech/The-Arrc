import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, ensureDefaultAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/admin/seed-admin
 * One-time endpoint to seed the default CRM admin into the Prisma/SQLite DB.
 * Does NOT require authentication (since no admin exists yet).
 * Will not overwrite existing admins unless forceUpdate=true.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as {
      forceUpdate?: boolean;
      password?: string;
      username?: string;
    };

    const targetUsername = body.username || "arrc.admin";

    // ensureDefaultAdmin only creates the default arrc.admin account if missing.
    // For forceUpdate / custom usernames we handle manually below.
    if (targetUsername === "arrc.admin" && !body.forceUpdate) {
      await ensureDefaultAdmin();
      const existing = await prisma.admin.findUnique({ where: { username: "arrc.admin" } });
      if (!existing) {
        return NextResponse.json(
          { error: "Failed to seed default admin" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        message: "Admin ready",
        username: existing.username,
        credentials: {
          username: "arrc.admin",
          password: "ARRC@2026!Secure",
        },
      });
    }

    // Force-update or custom-username path
    const password = body.password || "ARRC@2026!Secure";
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await prisma.admin.findUnique({ where: { username: targetUsername } });
    if (existing) {
      if (body.forceUpdate) {
        await prisma.admin.update({
          where: { id: existing.id },
          data: { passwordHash },
        });
        return NextResponse.json({
          message: "Admin password updated",
          username: targetUsername,
        });
      }
      return NextResponse.json({ message: "Admin already exists", username: targetUsername });
    }

    const newAdmin = await prisma.admin.create({
      data: {
        username: targetUsername,
        passwordHash,
        displayName: "ARRC Administrator",
        role: "admin",
      },
    });

    return NextResponse.json(
      {
        message: "Admin created successfully",
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          displayName: newAdmin.displayName,
          role: newAdmin.role,
        },
        credentials: {
          username: targetUsername,
          password,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[seed-admin] Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/seed-admin
 * Check if the default admin exists (no auth required).
 */
export async function GET() {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username: "arrc.admin" },
      select: { id: true, username: true, displayName: true, role: true },
    });

    return NextResponse.json({
      configured: true,
      adminExists: !!admin,
      admin: admin
        ? {
            username: admin.username,
            displayName: admin.displayName,
            role: admin.role,
          }
        : null,
    });
  } catch (err) {
    return NextResponse.json({
      configured: true,
      adminExists: false,
      error: err instanceof Error ? err.message : "Unknown",
    });
  }
}
