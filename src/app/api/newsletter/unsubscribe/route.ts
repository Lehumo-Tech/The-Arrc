import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/newsletter/unsubscribe — Public endpoint to unsubscribe.
 * Accepts email or token. Marks subscriber as "unsubscribed".
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token } = body;

    if (!email && !token) {
      return NextResponse.json(
        { error: "Email or token is required" },
        { status: 400 }
      );
    }

    const where = email
      ? { email: (email as string).toLowerCase() }
      : { confirmToken: token as string };

    const subscriber = await prisma.newsletterSubscriber.findFirst({ where });

    if (!subscriber) {
      return NextResponse.json(
        { message: "If this email is subscribed, it has been unsubscribed." },
        { status: 200 }
      );
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "unsubscribed",
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "You have been successfully unsubscribed from the ARRC newsletter.",
    });
  } catch (error) {
    console.error("[api/newsletter/unsubscribe] POST error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
