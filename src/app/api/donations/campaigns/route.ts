import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureContentSeeded } from "@/lib/auto-seed";
import { CAMPAIGNS } from "@/lib/seed-data";

/**
 * GET /api/donations/campaigns — Public endpoint to list active campaigns.
 * Returns campaigns with status "active" or "completed", sorted by sortOrder.
 *
 * ─── Resilience model ───
 * On Vercel (serverless, read-only filesystem) the SQLite database cannot be
 * created, so Prisma throws. We catch that and fall back to the static
 * CAMPAIGNS snapshot from seed-data — guaranteeing the donate page always
 * shows campaigns even when the database is unreachable.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featuredOnly = searchParams.get("featured") === "true";
  const category = searchParams.get("category");

  // Build the static fallback snapshot (always available, no DB needed)
  const staticCampaigns = CAMPAIGNS.map((c) => ({
    id: `static-campaign-${c.sortOrder}`,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    description: c.description || null,
    imageUrl: c.imageUrl,
    category: c.category,
    status: c.status,
    goalAmount: c.goalAmount,
    raisedAmount: c.raisedAmount,
    supporterGoal: c.supporterGoal,
    supporterCount: c.supporterCount,
    featured: c.featured,
    sortOrder: c.sortOrder,
    startDate: c.startDate instanceof Date ? c.startDate.toISOString() : null,
    endDate: null,
    createdAt: new Date("2026-07-09").toISOString(),
    updatedAt: new Date("2026-07-09").toISOString(),
    progressPercent:
      c.goalAmount > 0
        ? Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
        : 0,
    supporterProgressPercent:
      c.supporterGoal > 0
        ? Math.min(100, Math.round((c.supporterCount / c.supporterGoal) * 100))
        : 0,
  }));

  // Filter the static fallback the same way as the DB query
  let staticFiltered = staticCampaigns;
  if (featuredOnly) {
    staticFiltered = staticFiltered.filter((c) => c.featured);
  }
  if (category && category !== "all") {
    staticFiltered = staticFiltered.filter((c) => c.category === category);
  }

  try {
    // Auto-seed campaigns if the DB was wiped (no-op on read-only filesystems)
    await ensureContentSeeded();

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

    if (campaigns.length === 0) {
      // DB reachable but empty — use static fallback
      return NextResponse.json({ campaigns: staticFiltered });
    }

    // Serialize dates for client
    const serialized = campaigns.map((c) => ({
      ...c,
      startDate: c.startDate?.toISOString() || null,
      endDate: c.endDate?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
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
    console.error("[api/donations/campaigns] DB error, using static fallback:", error);
    // DB unreachable (Vercel serverless) — return the static snapshot
    return NextResponse.json({ campaigns: staticFiltered });
  }
}
