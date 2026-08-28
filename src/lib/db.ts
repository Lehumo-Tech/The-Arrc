/**
 * Database access layer.
 *
 * This project uses two database systems:
 * - Supabase (PostgreSQL) for member management, auth, etc.
 * - Prisma (SQLite) for content management (events, news, policies, etc.)
 */

// Supabase exports (for members, admins, etc.)
export {
  getSupabaseAdmin,
  getSupabasePublic,
  isSupabaseConfigured,
  generateMemberId,
  mapMemberToClient,
  mapAdminToClient,
  type DbMember,
  type DbCrmAdmin,
} from "./supabase";

// Prisma client (for content management)
//
// IMPORTANT — serverless / read-only safety:
//   On Vercel the build swaps in the PostgreSQL schema and the runtime may
//   have no (or an unreachable) DATABASE_URL. `new PrismaClient()` is lazy
//   about connecting, but we wrap instantiation in a try/catch anyway so a
//   module-load crash can NEVER propagate. If instantiation fails we export a
//   `null`-typed-as-PrismaClient sentinel; any subsequent `prisma.*` call will
//   throw, which every consumer already guards with try/catch (falling back to
//   the static content snapshot / /content.json). This guarantees the public
//   content route can never be hard-bricked by a Prisma load failure.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient();
  } catch (err) {
    console.error("[db] PrismaClient instantiation failed — content route will use static fallback:", err);
    // Return a proxy that throws on any access; callers' try/catch handles it.
    return new Proxy({} as PrismaClient, {
      get() {
        throw new Error("PrismaClient unavailable — using static content fallback");
      },
    });
  }
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
