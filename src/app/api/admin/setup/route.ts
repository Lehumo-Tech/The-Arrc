import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { verifyAdmin, ensureDefaultAdmin } from "@/lib/admin-auth";
import { ensureContentSeeded } from "@/lib/auto-seed";

/**
 * GET /api/admin/setup
 * Checks database health — verifies Prisma/SQLite is reachable.
 * Requires admin auth.
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseConfigured = isSupabaseConfigured(); // always false in this deployment

  // Check Prisma/SQLite tables
  let contentDbReady = false;
  let membersDbReady = false;
  try {
    await prisma.contentItem.count();
    contentDbReady = true;
  } catch {
    contentDbReady = false;
  }
  try {
    await prisma.member.count();
    membersDbReady = true;
  } catch {
    membersDbReady = false;
  }

  return NextResponse.json({
    configured: !supabaseConfigured ? true : supabaseConfigured, // Prisma is configured
    contentDbReady,
    membersDbReady,
    allReady: contentDbReady && membersDbReady,
    supabaseConfigured,
    tables: {
      prisma: contentDbReady && membersDbReady ? "connected" : "missing",
      content_items: contentDbReady ? "ready" : "missing",
      members: membersDbReady ? "ready" : "missing",
    },
  });
}

/**
 * POST /api/admin/setup
 * Bootstrap the database: seed the default admin and essential content.
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDefaultAdmin();
    await ensureContentSeeded();

    return NextResponse.json({
      success: true,
      message: "Database seeded: default admin + essential content",
      contentDbReady: true,
      membersDbReady: true,
    });
  } catch (err) {
    console.error("[admin/setup] POST error:", err);
    return NextResponse.json(
      {
        success: false,
        error: `Setup failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
