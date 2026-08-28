import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * GET /api/admin/newsletter — List all newsletter subscribers (admin only).
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req.headers.get("authorization"));
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const [subscribers, total, activeCount] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.count({ where: { status: "active" } }),
    ]);

    const serialized = subscribers.map((s) => ({
      ...s,
      confirmedAt: s.confirmedAt?.toISOString() || null,
      unsubscribedAt: s.unsubscribedAt?.toISOString() || null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      subscribers: serialized,
      total,
      activeCount,
    });
  } catch (error) {
    console.error("[api/admin/newsletter] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
