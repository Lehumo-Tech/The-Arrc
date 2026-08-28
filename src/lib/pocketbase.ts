/**
 * PocketBase REST API helper module for the Next.js backend.
 *
 * All calls to PocketBase go through here so every route uses the
 * same base URL, auth logic, and error handling.
 */

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

/* ─── Token cache ─── */
interface CachedToken {
  token: string;
  expiresAt: number; // unix-ms when we consider it expired (5 min before actual)
}

let superuserCache: CachedToken | null = null;

/* ─── Generic fetch wrapper ─── */
export async function pbFetch<T = unknown>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${PB_URL}${path}`, {
    ...fetchOpts,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new PbError(res.status, body);
  }

  // Some endpoints (e.g. DELETE) may return 204 with no body
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/* ─── Custom error ─── */
export class PbError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`PocketBase ${status}: ${body.slice(0, 200)}`);
    this.status = status;
    this.body = body;
  }
}

/* ─── Superuser auth ─── */
const SUPERUSER_EMAIL = "admin@arrc.co.za";
const SUPERUSER_PASSWORD = "ARRC@2026!Secure";

export async function getSuperuserToken(): Promise<string> {
  // Return cached token if still valid (with 5-minute safety margin)
  if (superuserCache && Date.now() < superuserCache.expiresAt) {
    return superuserCache.token;
  }

  const data = await pbFetch<{ token: string }>(
    "/api/collections/_superusers/auth-with-password",
    {
      method: "POST",
      body: JSON.stringify({
        identity: SUPERUSER_EMAIL,
        password: SUPERUSER_PASSWORD,
      }),
    }
  );

  // Cache for 23 hours (PocketBase default is 24 h)
  superuserCache = {
    token: data.token,
    expiresAt: Date.now() + 23 * 60 * 60 * 1000,
  };

  return data.token;
}

/** Clear the cached superuser token (call when a 401 is received) */
export function clearSuperuserCache(): void {
  superuserCache = null;
}

/** Fetch with automatic superuser auth */
export async function pbSuperFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getSuperuserToken();
  try {
    return await pbFetch<T>(path, { ...options, token });
  } catch (err) {
    // If token expired, clear cache and retry once
    if (err instanceof PbError && err.status === 401) {
      clearSuperuserCache();
      const newToken = await getSuperuserToken();
      return pbFetch<T>(path, { ...options, token: newToken });
    }
    throw err;
  }
}

/* ─── CRM Admin auth ─── */
export async function authenticateAdmin(
  identity: string,
  password: string
): Promise<{ token: string; record: CrmAdminRecord }> {
  return pbFetch<{ token: string; record: CrmAdminRecord }>(
    "/api/collections/crm_admins/auth-with-password",
    {
      method: "POST",
      body: JSON.stringify({ identity, password }),
    }
  );
}

export async function refreshAdminToken(
  token: string
): Promise<{ token: string; record: CrmAdminRecord }> {
  return pbFetch<{ token: string; record: CrmAdminRecord }>(
    "/api/collections/crm_admins/auth-refresh",
    {
      method: "POST",
      token,
    }
  );
}

/* ─── Types ─── */
export interface CrmAdminRecord {
  id: string;
  email: string;
  displayName: string;
  role: string;
  created: string;
  updated: string;
}

export interface PbRecord {
  id: string;
  created: string;
  updated: string;
  [key: string]: unknown;
}

export interface PbListResult<T = PbRecord> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

/* ─── Member helpers ─── */
export interface MemberRecord {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  province: string;
  occupation: string;
  wardBranch: string;
  paymentMethod: string;
  paymentStatus: string;
  membershipStatus: string;
  cardGenerated: boolean;
  selfieUrl: string;
  notes: string;
  created: string;
  updated: string;
}

/**
 * Map a PocketBase member record to the shape expected by the
 * existing CRM frontend (createdAt / updatedAt instead of created / updated).
 */
export function mapMemberToClient(m: MemberRecord) {
  return {
    id: m.id,
    memberId: m.memberId || "",
    firstName: m.firstName,
    lastName: m.lastName,
    idNumber: m.idNumber,
    email: m.email,
    phone: m.phone,
    dateOfBirth: m.dateOfBirth,
    gender: m.gender,
    address: m.address || null,
    province: m.province,
    occupation: m.occupation || null,
    wardBranch: m.wardBranch || null,
    paymentMethod: m.paymentMethod,
    paymentStatus: m.paymentStatus,
    membershipStatus: m.membershipStatus,
    cardGenerated: m.cardGenerated,
    selfieUrl: m.selfieUrl || null,
    notes: m.notes || null,
    createdAt: m.created,
    updatedAt: m.updated,
  };
}

/**
 * Fetch ALL member records from PocketBase, paginating automatically.
 * Uses superuser auth.
 */
export async function fetchAllMembers(): Promise<MemberRecord[]> {
  const all: MemberRecord[] = [];
  let page = 1;
  const perPage = 500;

  while (true) {
    const result = await pbSuperFetch<PbListResult<MemberRecord>>(
      `/api/collections/members/records?page=${page}&perPage=${perPage}`
    );
    all.push(...result.items);
    if (page >= result.totalPages) break;
    page++;
  }

  return all;
}

/** Generate ARRC-XXXXXX memberId from PocketBase record id */
export function generateMemberId(id: string): string {
  return "ARRC-" + id.slice(-6).toUpperCase();
}
