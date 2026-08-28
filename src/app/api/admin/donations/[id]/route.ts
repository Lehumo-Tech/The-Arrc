import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

/**
 * PATCH /api/admin/donations/[id] — Update a donation's status (admin only).
 * Used to confirm, reject, or refund a donation.
 * When marking as completed, updates the campaign's raisedAmount.
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
    const { status, notes, receiptSent } = body;

    const existing = await prisma.donation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (receiptSent !== undefined) updateData.receiptSent = receiptSent;

    const updated = await prisma.donation.update({
      where: { id },
      data: updateData,
    });

    // If status changed to "completed" and it wasn't before, increment campaign raisedAmount
    if (
      status === "completed" &&
      existing.status !== "completed" &&
      existing.campaignId
    ) {
      await prisma.campaign.update({
        where: { id: existing.campaignId },
        data: { raisedAmount: { increment: existing.amount } },
      }).catch(() => {});
    }

    // If status changed from "completed" to something else, decrement campaign raisedAmount
    if (
      existing.status === "completed" &&
      status &&
      status !== "completed" &&
      existing.campaignId
    ) {
      await prisma.campaign.update({
        where: { id: existing.campaignId },
        data: { raisedAmount: { decrement: existing.amount } },
      }).catch(() => {});
    }

    return NextResponse.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("[api/admin/donations/[id]] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/donations/[id] — Delete a donation (admin only).
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

    const existing = await prisma.donation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // If donation was completed and linked to a campaign, decrement raisedAmount
    if (existing.status === "completed" && existing.campaignId) {
      await prisma.campaign.update({
        where: { id: existing.campaignId },
        data: { raisedAmount: { decrement: existing.amount } },
      }).catch(() => {});
    }

    await prisma.donation.delete({ where: { id } });

    return NextResponse.json({ message: "Donation deleted" });
  } catch (error) {
    console.error("[api/admin/donations/[id]] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
