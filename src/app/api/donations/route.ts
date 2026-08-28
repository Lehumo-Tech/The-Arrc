import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/donations — Public endpoint to submit a donation.
 * Creates a donation record with status "pending" (or "completed" for EFT/cash).
 * Also updates the campaign's raisedAmount if a campaignId is provided.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      amount,
      currency,
      reference,
      paymentMethod,
      campaignId,
      campaignTitle,
      recurring,
      recurringPeriod,
      anonymous,
      message,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !amount) {
      return NextResponse.json(
        { error: "Missing required fields. Please provide firstName, lastName, email, phone, and amount." },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number." },
        { status: 400 }
      );
    }

    // Generate a unique reference if not provided
    const donationReference =
      reference ||
      `ARRC-DON-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

    // For EFT/cash, mark as completed immediately (manual confirmation flow)
    // For card/online, mark as pending until payment provider confirms
    const method = paymentMethod || "eft";
    const initialStatus = method === "eft" || method === "cash" ? "completed" : "pending";

    const donation = await prisma.donation.create({
      data: {
        firstName: anonymous ? "Anonymous" : firstName,
        lastName: anonymous ? "Donor" : lastName,
        email,
        phone,
        amount: parsedAmount,
        currency: currency || "ZAR",
        reference: donationReference,
        status: initialStatus,
        paymentMethod: method,
        campaignId: campaignId || null,
        campaignTitle: campaignTitle || null,
        recurring: Boolean(recurring),
        recurringPeriod: recurring ? recurringPeriod || "monthly" : null,
        anonymous: Boolean(anonymous),
        message: message || null,
      },
    });

    // If donation is completed and linked to a campaign, update raisedAmount
    if (initialStatus === "completed" && campaignId) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { raisedAmount: { increment: parsedAmount } },
      }).catch(() => {
        // Campaign may not exist in local DB — ignore
      });
    }

    return NextResponse.json(
      {
        message: "Donation recorded successfully",
        id: donation.id,
        reference: donation.reference,
        status: donation.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/donations] POST error:", error);
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 }
    );
  }
}
