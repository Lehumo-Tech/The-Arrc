import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, ensureDefaultAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // Ensure the default admin exists in the local DB before authenticating.
    await ensureDefaultAdmin();

    const result = await authenticateAdmin(username, password);
    if (!result) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      token: result.token,
      admin: {
        username: result.admin.username,
        displayName: result.admin.displayName,
      },
    });
  } catch (error) {
    console.error("[admin/login] Error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
