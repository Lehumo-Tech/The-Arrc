import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/cards/[id]/renew
 * Renew a membership card for another year.
 * Sets issueDate to now and expiryDate to 1 year from now.
 * Works for expired, revoked, or active cards (renewal extends by 1 year).
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const admin = await verifyAdmin(request.headers.get("Authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const card = await prisma.membershipCard.findUnique({ where: { id } });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const now = new Date();
    const newExpiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    const updatedCard = await prisma.membershipCard.update({
      where: { id },
      data: {
        status: "active",
        issueDate: now,
        expiryDate: newExpiryDate,
        notes: card.notes
          ? `${card.notes}\n[Renewed on ${now.toISOString().split("T")[0]} by ${admin.displayName || admin.username}]`
          : `[Renewed on ${now.toISOString().split("T")[0]} by ${admin.displayName || admin.username}]`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Card renewed successfully for 1 year",
      card: {
        id: updatedCard.id,
        cardNumber: updatedCard.cardNumber,
        status: updatedCard.status,
        issueDate: updatedCard.issueDate.toISOString(),
        expiryDate: updatedCard.expiryDate?.toISOString() || null,
      },
    });
  } catch (err) {
    console.error("[admin/cards/[id]/renew] Error:", err);
    return NextResponse.json({ error: "Failed to renew card" }, { status: 500 });
  }
}
