import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

/**
 * POST /api/newsletter/subscribe — Public endpoint to subscribe to the newsletter.
 * Creates a NewsletterSubscriber record with POPIA consent flags.
 * If email already exists and is unsubscribed, reactivates them.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, consentProcessing, consentMarketing } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // POPIA: processing consent is required
    if (!consentProcessing) {
      return NextResponse.json(
        { error: "You must consent to the processing of your information to subscribe" },
        { status: 400 }
      );
    }

    const confirmToken = crypto.randomBytes(32).toString("hex");

    // Check if subscriber already exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { message: "You are already subscribed to our newsletter", alreadySubscribed: true },
          { status: 200 }
        );
      }
      // Reactivate unsubscribed subscriber
      const reactivated = await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          fullName: fullName || existing.fullName,
          consentProcessing: true,
          consentMarketing: Boolean(consentMarketing),
          status: "active",
          confirmToken,
          confirmedAt: new Date(),
          unsubscribedAt: null,
        },
      });
      return NextResponse.json(
        { message: "Welcome back! You have been resubscribed.", id: reactivated.id },
        { status: 200 }
      );
    }

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        fullName: fullName || null,
        consentProcessing: true,
        consentMarketing: Boolean(consentMarketing),
        status: "active",
        source: "website",
        confirmToken,
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Successfully subscribed to the ARRC newsletter",
        id: subscriber.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/newsletter/subscribe] POST error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
