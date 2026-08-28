import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const supabaseConfigured = isSupabaseConfigured(); // always false in this deployment

  // Check Prisma — try a simple member count to verify connectivity
  let prismaReady = false;
  let prismaError: string | null = null;
  try {
    await prisma.member.count();
    prismaReady = true;
  } catch (err) {
    prismaError = err instanceof Error ? err.message : "Unknown error";
  }

  // Also check content table
  let contentDbReady = false;
  try {
    await prisma.contentItem.count();
    contentDbReady = true;
  } catch {
    // ignore
  }

  const crmReady = prismaReady;

  return NextResponse.json(
    {
      configured: prismaReady, // Prisma is the configured backend
      prisma: prismaReady ? "ok" : "error",
      prismaError,
      contentDbReady,
      supabaseConfigured,
      allReady: prismaReady && contentDbReady,
      crmReady,
    },
    { status: crmReady ? 200 : 503 }
  );
}
