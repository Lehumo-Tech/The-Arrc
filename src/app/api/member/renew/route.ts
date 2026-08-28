import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/member/renew — Public endpoint for member self-service renewal.
 * Verifies member identity (idNumber + email), then renews their membership card
 * for another 1 year (sets issueDate=now, expiryDate=now+365 days, status=active).
 * Also updates the member's membershipStatus to "active" in Prisma.
 *
 * This is the self-service "Renew My Membership" feature (like the DA's membership portal).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idNumber, email } = body;

    if (!idNumber || !email) {
      return NextResponse.json(
        { error: "ID number and email are required to renew your membership." },
        { status: 400 }
      );
    }

    // Verify member identity
    const member = await prisma.member.findFirst({
      where: {
        idNumber,
        email: email.toLowerCase().trim(),
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found. Please verify your ID number and email." },
        { status: 404 }
      );
    }

    // Check if member has a card to renew
    const existingCard = await prisma.membershipCard.findUnique({
      where: { memberId: member.id },
    });

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    if (!existingCard) {
      // No card exists yet — set membership status to pending (awaiting admin/payment)
      await prisma.member.update({
        where: { id: member.id },
        data: {
          membershipStatus: "pending",
          paymentStatus: "pending",
        },
      });

      return NextResponse.json({
        message: "Renewal recorded. Your membership card will be issued after payment verification.",
        renewedUntil: null,
      });
    }

    // Renew the card
    const renewedCard = await prisma.membershipCard.update({
      where: { id: existingCard.id },
      data: {
        status: "active",
        issueDate: now,
        expiryDate: expiryDate,
        notes: (existingCard.notes || "") + `\n[Self-renewed on ${now.toISOString()}]`,
      },
    });

    // Update member status in Prisma
    await prisma.member.update({
      where: { id: member.id },
      data: {
        membershipStatus: "active",
        paymentStatus: "confirmed",
      },
    });

    return NextResponse.json({
      message: "Membership renewed successfully for 1 year!",
      card: {
        cardNumber: renewedCard.cardNumber,
        status: renewedCard.status,
        issueDate: renewedCard.issueDate.toISOString(),
        expiryDate: renewedCard.expiryDate?.toISOString() || null,
      },
      renewedUntil: expiryDate.toISOString(),
    });
  } catch (error) {
    console.error("[api/member/renew] POST error:", error);
    return NextResponse.json(
      { error: "Failed to renew membership. Please try again or contact us." },
      { status: 500 }
    );
  }
}
