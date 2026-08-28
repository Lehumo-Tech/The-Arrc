import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureContentSeeded } from "@/lib/auto-seed";

/**
 * GET /api/donations/campaigns — Public endpoint to list active campaigns.
 * Returns campaigns with status "active" or "completed", sorted by sortOrder then createdAt.
 */
export async function GET(req: NextRequest) {
  try {
    // Auto-seed campaigns if the DB was wiped.
    await ensureContentSeeded();

    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get("featured") === "true";
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {
      status: { in: ["active", "completed"] },
    };

    if (featuredOnly) {
      where.featured = true;
    }
    if (category && category !== "all") {
      where.category = category;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // Serialize dates for client
    const serialized = campaigns.map((c) => ({
      ...c,
      startDate: c.startDate?.toISOString() || null,
      endDate: c.endDate?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      // Calculate progress percentage
      progressPercent:
        c.goalAmount > 0
          ? Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
          : 0,
      supporterProgressPercent:
        c.supporterGoal > 0
          ? Math.min(100, Math.round((c.supporterCount / c.supporterGoal) * 100))
          : 0,
    }));

    return NextResponse.json({ campaigns: serialized });
  } catch (error) {
    console.error("[api/donations/campaigns] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns", campaigns: [] },
      { status: 500 }
    );
  }
}
