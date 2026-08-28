import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * GET /api/admin/campaigns — List all campaigns (admin only).
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req.headers.get("authorization"));
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await prisma.campaign.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const serialized = campaigns.map((c) => ({
      ...c,
      startDate: c.startDate?.toISOString() || null,
      endDate: c.endDate?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ campaigns: serialized });
  } catch (error) {
    console.error("[api/admin/campaigns] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/campaigns — Create a new campaign (admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req.headers.get("authorization"));
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      summary,
      description,
      imageUrl,
      category,
      status,
      goalAmount,
      supporterGoal,
      featured,
      sortOrder,
      startDate,
      endDate,
    } = body;

    if (!title || !summary) {
      return NextResponse.json(
        { error: "Title and summary are required" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug =
      body.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 80);

    // Check slug uniqueness
    const existing = await prisma.campaign.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A campaign with this slug already exists" },
        { status: 409 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        slug,
        title,
        summary,
        description: description || null,
        imageUrl: imageUrl || null,
        category: category || "general",
        status: status || "active",
        goalAmount: parseFloat(goalAmount) || 0,
        raisedAmount: 0,
        supporterGoal: parseInt(supporterGoal) || 0,
        supporterCount: 0,
        featured: Boolean(featured),
        sortOrder: parseInt(sortOrder) || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(
      {
        ...campaign,
        startDate: campaign.startDate?.toISOString() || null,
        endDate: campaign.endDate?.toISOString() || null,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/admin/campaigns] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
