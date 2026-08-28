/**
 * Admin authentication helpers using Prisma (SQLite) + bcrypt.
 *
 * In this deployment Supabase is not configured, so all authentication goes
 * through Prisma. Verifies admin identity by looking up the `crm_admins` table
 * and validating the password with bcrypt.
 */
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface VerifiedAdmin {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  role: string;
  lastLogin: string | null;
}

/**
 * Authenticate a CRM admin by username + password.
 * Returns admin info + a simple base64url token if valid, null otherwise.
 */
export async function authenticateAdmin(
  username: string,
  password: string
): Promise<{ token: string; admin: VerifiedAdmin } | null> {
  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return null;

    // Try bcrypt first
    let valid = await bcrypt.compare(password, admin.passwordHash);

    // Fallback to SHA-256 for legacy seeded passwords
    if (!valid) {
      const shaHash = crypto.createHash("sha256").update(password).digest("hex");
      if (shaHash === admin.passwordHash) {
        valid = true;
        // Upgrade the hash to bcrypt
        const newHash = await bcrypt.hash(password, 10);
        await prisma.admin.update({
          where: { id: admin.id },
          data: { passwordHash: newHash },
        });
        console.log("[admin-auth] Upgraded password hash from SHA-256 to bcrypt for", username);
      }
    }

    if (!valid) return null;

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const mapped: VerifiedAdmin = {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      email: admin.username,
      role: admin.role,
      lastLogin: new Date().toISOString(),
    };

    const token = Buffer.from(`${admin.id}:${admin.username}:${Date.now()}`).toString("base64url");

    return { token, admin: mapped };
  } catch (err) {
    console.error("[admin-auth] Prisma auth error:", err);
    return null;
  }
}

/**
 * Verify an admin token (from the Authorization header).
 * Looks up the admin by the username embedded in the token.
 */
export async function verifyAdmin(authHeader: string | null): Promise<VerifiedAdmin | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  try {
    // Decode the token to get admin username
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [, username] = decoded.split(":");
    if (!username) return null;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return null;

    return {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      email: admin.username,
      role: admin.role,
      lastLogin: admin.lastLogin?.toISOString() || null,
    };
  } catch {
    return null;
  }
}

/**
 * Ensure a default admin exists in the local Prisma/SQLite database.
 * Credentials: username `arrc.admin`, password `ARRC@2026!Secure`.
 * Allows CRM login. Safe to call on every login attempt — no-op if the admin
 * already exists.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  try {
    const existing = await prisma.admin.findUnique({ where: { username: "arrc.admin" } });
    if (existing) return;
    const passwordHash = await bcrypt.hash("ARRC@2026!Secure", 10);
    await prisma.admin.create({
      data: {
        username: "arrc.admin",
        passwordHash,
        displayName: "ARRC Administrator",
        role: "admin",
      },
    });
    console.log("[admin-auth] Seeded default admin: arrc.admin");
  } catch (err) {
    console.error("[admin-auth] Failed to seed default admin:", err);
  }
}
