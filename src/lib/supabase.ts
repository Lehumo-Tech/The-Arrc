/**
 * Supabase client stub for the ARRC backend.
 *
 * In this deployment we run Prisma/SQLite as the single source of truth for ALL
 * data (members, admins, content, donations, etc.). Supabase is not configured,
 * so `isSupabaseConfigured()` always returns false and the admin-auth / chat
 * routes fall back to Prisma. The type + helper exports below are preserved so
 * the rest of the codebase compiles unchanged.
 *
 * If you later want to switch to Supabase, install `@supabase/supabase-js`,
 * restore the original createClient() logic, and set the env vars.
 */

/* ─── Types ─── */

export interface DbMember {
  id: string;
  member_id: string | null;
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string | null;
  province: string;
  occupation: string | null;
  ward_branch: string | null;
  payment_method: string;
  payment_status: string;
  membership_status: string;
  card_generated: boolean;
  selfie_url: string | null;
  proof_of_payment_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCrmAdmin {
  id: string;
  username: string;
  display_name: string | null;
  password_hash: string;
  role: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Configuration check ─── */

/** Supabase is never configured in this Prisma-only deployment. */
export function isSupabaseConfigured(): boolean {
  return false;
}

/** @throws always — Supabase is not configured; use Prisma instead. */
export function getSupabaseAdmin(): never {
  throw new Error(
    "Supabase is not configured. This deployment uses Prisma/SQLite for all data."
  );
}

/** @throws always — Supabase is not configured; use Prisma instead. */
export function getSupabasePublic(): never {
  throw new Error(
    "Supabase is not configured. This deployment uses Prisma/SQLite for all data."
  );
}

/* ─── Member helpers ─── */

/** Map a database row to the client-facing shape */
export function mapMemberToClient(m: DbMember) {
  return {
    id: m.id,
    memberId: m.member_id || "",
    firstName: m.first_name,
    lastName: m.last_name,
    idNumber: m.id_number,
    email: m.email,
    phone: m.phone,
    dateOfBirth: m.date_of_birth,
    gender: m.gender,
    address: m.address || null,
    province: m.province,
    occupation: m.occupation || null,
    wardBranch: m.ward_branch || null,
    paymentMethod: m.payment_method,
    paymentStatus: m.payment_status,
    membershipStatus: m.membership_status,
    cardGenerated: m.card_generated,
    selfieUrl: m.selfie_url || null,
    proofOfPaymentUrl: m.proof_of_payment_url || null,
    notes: m.notes || null,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  };
}

/** Generate ARRC-XXXXXX memberId from UUID */
export function generateMemberId(id: string): string {
  return "ARRC-" + id.replace(/-/g, "").slice(-6).toUpperCase();
}

/** Map a CRM admin row to the verified admin shape */
export function mapAdminToClient(a: DbCrmAdmin) {
  return {
    id: a.id,
    username: a.username,
    displayName: a.display_name || null,
    email: a.username, // username serves as email
    role: a.role,
    lastLogin: a.last_login || null,
  };
}
