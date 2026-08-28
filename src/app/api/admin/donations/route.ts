import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * GET /api/admin/donations — List all donations (admin only).
 * Supports filtering by status, campaignId, and pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req.headers.get("authorization"));
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaignId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (campaignId && campaignId !== "all") {
      where.campaignId = campaignId;
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.donation.count({ where }),
    ]);

    // Compute summary stats
    const completedDonations = await prisma.donation.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
      _count: true,
    });

    const pendingDonations = await prisma.donation.aggregate({
      where: { status: "pending" },
      _sum: { amount: true },
      _count: true,
    });

    const serialized = donations.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      donations: serialized,
      total,
      stats: {
        totalRaised: completedDonations._sum.amount || 0,
        totalCompleted: completedDonations._count,
        totalPending: pendingDonations._count,
        pendingAmount: pendingDonations._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error("[api/admin/donations] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
