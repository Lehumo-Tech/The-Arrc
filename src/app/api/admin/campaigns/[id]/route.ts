import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * PATCH /api/admin/campaigns/[id] — Update a campaign (admin only).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req.headers.get("authorization"));
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title", "summary", "description", "imageUrl", "category",
      "status", "featured", "sortOrder",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.goalAmount !== undefined) {
      updateData.goalAmount = parseFloat(body.goalAmount) || 0;
    }
    if (body.supporterGoal !== undefined) {
      updateData.supporterGoal = parseInt(body.supporterGoal) || 0;
    }
    if (body.raisedAmount !== undefined) {
      updateData.raisedAmount = parseFloat(body.raisedAmount) || 0;
    }
    if (body.supporterCount !== undefined) {
      updateData.supporterCount = parseInt(body.supporterCount) || 0;
    }
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }
    if (body.slug !== undefined && body.slug !== existing.slug) {
      // Check slug uniqueness
      const slugExists = await prisma.campaign.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: "A campaign with this slug already exists" },
          { status: 409 }
        );
      }
      updateData.slug = body.slug;
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      startDate: updated.startDate?.toISOString() || null,
      endDate: updated.endDate?.toISOString() || null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[api/admin/campaigns/[id]] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/campaigns/[id] — Delete a campaign (admin only).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req.headers.get("authorization"));
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await prisma.campaign.delete({ where: { id } });

    return NextResponse.json({ message: "Campaign deleted" });
  } catch (error) {
    console.error("[api/admin/campaigns/[id]] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
