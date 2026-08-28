import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const totalMembers = await prisma.member.count();
    const totalRaised = await prisma.donation
      .aggregate({ _sum: { amount: true } })
      .then((r) => r._sum.amount || 0)
      .catch(() => 0);

    return NextResponse.json({ totalMembers, totalRaised });
  } catch (error) {
    console.error("[stats] Error:", error);
    return NextResponse.json({ totalMembers: 0, totalRaised: 0 });
  }
}
