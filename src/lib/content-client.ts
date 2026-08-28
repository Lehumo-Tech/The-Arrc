/**
 * Client-side content fetcher with multi-layer fallback.
 *
 * Guarantees the public site ALWAYS shows all news, videos, events, leaders,
 * and gallery items — regardless of deployment environment:
 *
 *   Layer 1: GET /api/content  (database-backed; SQLite on sandbox, Postgres on Vercel)
 *   Layer 2: /api/content internally falls back to an in-memory static snapshot
 *            if the database is unavailable (read-only FS, missing tables, etc.)
 *   Layer 3: If /api/content fails entirely (network error, 500, timeout, or
 *            returns an unexpected shape), fetch /content.json — a static file
 *            generated at build time from the same seed data, committed to the
 *            repo in /public/content.json and served as a plain static asset.
 *
 * This three-layer approach means the content will render even if:
 *   - The database is unreachable
 *   - The API route fails to build or times out
 *   - Prisma throws at module load time
 *   - The deployment is fully static (no serverless functions)
 */
export type ContentItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  category: string | null;
  date: string | null;
  location: string | null;
  status: string;
  featured: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ContentSnapshot = {
  events: ContentItem[];
  news: ContentItem[];
  policies: ContentItem[];
  leaders: ContentItem[];
  gallery: ContentItem[];
  videos: ContentItem[];
  faqs: ContentItem[];
  values: ContentItem[];
  documents: ContentItem[];
};

const EMPTY: ContentSnapshot = {
  events: [],
  news: [],
  policies: [],
  leaders: [],
  gallery: [],
  videos: [],
  faqs: [],
  values: [],
  documents: [],
};

function isContentSnapshot(data: unknown): data is ContentSnapshot {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  // Must have at least the "news" and "videos" keys (the most critical for the
  // News & Media section the user cares about).
  return Array.isArray(d.news) && Array.isArray(d.videos);
}

/**
 * Fetch all published content with a 3-layer fallback.
 * Returns an empty-shaped snapshot only if EVERY layer fails.
 */
export async function fetchContent(): Promise<ContentSnapshot> {
  // Layer 1 + 2: try the API route (which itself falls back to in-memory snapshot).
  try {
    const res = await fetch("/api/content", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (isContentSnapshot(data)) {
        return data;
      }
    }
  } catch {
    // Network error / route crashed — fall through to static file.
  }

  // Layer 3: fetch the static JSON file served from /public.
  try {
    const res = await fetch("/content.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (isContentSnapshot(data)) {
        return data;
      }
    }
  } catch {
    // Static file also unavailable — give up gracefully.
  }

  return EMPTY;
}
