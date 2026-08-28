/**
 * Auto-seed utility — ensures essential content (NEC leaders, values, FAQs,
 * policies, gallery, videos, documents, events) AND campaigns exist in the
 * local SQLite database. Also restores local image files (treasurer photo)
 * from the persistent upload folder if they go missing.
 *
 * The sandbox environment periodically resets the SQLite file and deletes
 * some public assets. This module detects empty tables and re-populates them
 * idempotently so the public site never appears blank.
 *
 * A module-level flag guarantees the check only runs once per process lifetime.
 */
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  LEADERS,
  VALUES,
  FAQS,
  POLICIES,
  VIDEOS,
  GALLERY,
  DOCUMENTS,
  EVENTS,
  NEWS,
  CAMPAIGNS,
} from "@/lib/seed-data";

let hasChecked = false;

/**
 * Mapping of local public assets to their persistent source in /upload.
 * The sandbox periodically wipes /public files; this restores them on every
 * auto-seed run so news, events, and media always have proper thumbnails.
 */
const LOCAL_ASSETS: Array<{ dest: string; src: string }> = [
  {
    dest: "public/leaders/president.jpeg",
    src: "upload/WhatsApp Image 2026-06-12 at 22.25.46.jpeg",
  },
  {
    dest: "public/leaders/chairperson.jpeg",
    src: "upload/WhatsApp Image 2026-07-30 at 12.04.22.jpeg",
  },
  {
    dest: "public/leaders/treasurer.jpeg",
    src: "upload/treasurer-landscape.jpeg",
  },
  {
    dest: "public/campaigns/door-to-door-campaign.jpeg",
    src: "upload/WhatsApp Image 2026-06-30 at 13.21.29.jpeg",
  },
  {
    dest: "public/videos/arrc-news-2026-06-30.mp4",
    src: "upload/WhatsApp Video 2026-06-30 at 20.47.44.mp4",
  },
  {
    dest: "public/videos/arrc-president-report-kaalfontein-2026-07-09.mp4",
    src: "upload/WhatsApp Video 2026-07-09 at 21.48.37.mp4",
  },
  {
    dest: "public/news/news-rally-2026.jpg",
    src: "upload/Screenshot 2026-05-27 102147.png",
  },
  {
    dest: "public/news/news-policy-2026.jpg",
    src: "upload/Screenshot 2026-05-27 102221.png",
  },
  {
    dest: "public/news/news-youth-2026.jpg",
    src: "upload/Screenshot 2026-05-28 104255.png",
  },
  {
    dest: "public/news/news-community-2026.jpg",
    src: "upload/Screenshot 2026-05-27 105757.png",
  },
  {
    dest: "public/news/news-door-to-door.jpg",
    src: "upload/WhatsApp Image 2026-06-09 at 10.45.27.jpeg",
  },
  // ─── July 2026 event posters (restore from /upload if sandbox wipes /public) ───
  {
    dest: "public/events/moretele-march.jpeg",
    src: "upload/WhatsApp Image 2026-07-09 at 09.31.12.jpeg",
  },
  {
    dest: "public/events/tshwane-door-to-door.jpeg",
    src: "upload/WhatsApp Image 2026-07-09 at 09.31.34.jpeg",
  },
  {
    dest: "public/events/vaal-tshepiso-door-to-door.jpeg",
    src: "upload/WhatsApp Image 2026-07-09 at 09.30.55.jpeg",
  },
  {
    dest: "public/events/march-with-purpose.jpeg",
    src: "upload/WhatsApp Image 2026-07-09 at 09.31.20.jpeg",
  },
  // ─── August 2026 event posters (voter registration + Soweto door-to-door) ───
  {
    dest: "public/events/voter-registration-weekend-president.jpeg",
    src: "upload/WhatsApp Image 2026-07-31 at 17.08.01.jpeg",
  },
  {
    dest: "public/events/voter-registration-weekend-deputy-president.jpeg",
    src: "upload/WhatsApp Image 2026-07-31 at 17.08.02.jpeg",
  },
  {
    dest: "public/events/ward-92-candidate-moretele.jpeg",
    src: "upload/WhatsApp Image 2026-08-02 at 07.38.15.jpeg",
  },
  {
    dest: "public/events/door-to-door-soweto-ward-14.jpeg",
    src: "upload/WhatsApp Image 2026-08-04 at 14.51.55.jpeg",
  },
];

/** Restore local image / video files from the persistent upload folder if missing. */
function restoreLocalImages() {
  try {
    const cwd = process.cwd();
    for (const asset of LOCAL_ASSETS) {
      const destPath = path.join(cwd, asset.dest);
      const srcPath = path.join(cwd, asset.src);
      if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        console.log(`[auto-seed] Restored local asset: ${asset.dest}`);
      }
    }
    // Ensure video thumbnails exist; regenerate from video if missing
    const thumbDir = path.join(cwd, "public/videos/thumbnails");
    fs.mkdirSync(thumbDir, { recursive: true });
    const videoThumbs: Array<{ thumb: string; video: string; ts: number }> = [
      { thumb: "arrc-news-2026-06-30.jpg", video: "public/videos/arrc-news-2026-06-30.mp4", ts: 8 },
      { thumb: "arrc-president-report-kaalfontein-2026-07-09.jpg", video: "public/videos/arrc-president-report-kaalfontein-2026-07-09.mp4", ts: 25 },
      { thumb: "arrc-campaign.jpg", video: "public/videos/arrc-campaign.mp4", ts: 5 },
      { thumb: "secretary-general-lgbtq.jpg", video: "public/videos/secretary-general-lgbtq.mp4", ts: 8 },
    ];
    for (const vt of videoThumbs) {
      const thumbPath = path.join(thumbDir, vt.thumb);
      const videoPath = path.join(cwd, vt.video);
      if (!fs.existsSync(thumbPath) && fs.existsSync(videoPath)) {
        try {
          execSync(
            `ffmpeg -y -ss ${vt.ts} -i "${videoPath}" -vframes 1 -q:v 2 -update 1 "${thumbPath}"`,
            { stdio: "ignore" }
          );
          console.log(`[auto-seed] Regenerated video thumbnail: ${vt.thumb}`);
        } catch {
          console.warn(`[auto-seed] ffmpeg not available — skipping ${vt.thumb}.`);
        }
      }
    }
  } catch (err) {
    console.error("[auto-seed] Could not restore local images:", err);
  }
}

/** Check once per process; if tables are empty, seed essential items. */
export async function ensureContentSeeded() {
  if (hasChecked) return;
  hasChecked = true;

  try {
    // Restore local image files first (treasurer photo, etc.)
    restoreLocalImages();

    const contentCount = await prisma.contentItem.count();
    const campaignCount = await prisma.campaign.count();
    const eventCount = await prisma.contentItem.count({ where: { type: "event" } });
    const newsCount = await prisma.contentItem.count({ where: { type: "news" } });

    if (contentCount === 0) {
      console.log("[auto-seed] Content table empty — seeding essential data...");
      await seedLeaders();
      await seedValues();
      await seedFaqs();
      await seedPolicies();
      await seedVideos();
      await seedGallery();
      await seedDocuments();
      console.log("[auto-seed] Essential content seeded successfully.");
    }

    if (eventCount === 0) {
      console.log("[auto-seed] No events found — seeding recent events...");
      await seedEvents();
      console.log("[auto-seed] Events seeded successfully.");
    }

    if (newsCount === 0) {
      console.log("[auto-seed] No news found — seeding recent news articles...");
      await seedNews();
      console.log("[auto-seed] News seeded successfully.");
    }

    if (campaignCount === 0) {
      console.log("[auto-seed] Campaigns table empty — seeding campaigns...");
      await seedCampaigns();
      console.log("[auto-seed] Campaigns seeded successfully.");
    }
  } catch (err) {
    hasChecked = false;
    console.error("[auto-seed] Failed:", err);
  }
}

async function seedLeaders() {
  for (const l of LEADERS) {
    await prisma.contentItem.create({ data: { type: "leader", title: l.title, subtitle: l.subtitle, description: l.description, content: null, imageUrl: l.imageUrl, category: "nec", status: "published", featured: l.featured, sortOrder: l.sortOrder, metadata: "{}" } });
  }
}

async function seedValues() {
  for (let i = 0; i < VALUES.length; i++) {
    const v = VALUES[i];
    await prisma.contentItem.create({ data: { type: "value", title: v.title, subtitle: null, description: v.description, content: null, imageUrl: null, category: null, status: "published", featured: false, sortOrder: i + 1, metadata: "{}" } });
  }
}

async function seedFaqs() {
  for (const f of FAQS) {
    await prisma.contentItem.create({ data: { type: "faq", title: f.title, subtitle: null, description: f.description, content: null, imageUrl: null, category: null, status: "published", featured: false, sortOrder: f.sortOrder, metadata: "{}" } });
  }
}

async function seedPolicies() {
  for (let i = 0; i < POLICIES.length; i++) {
    const p = POLICIES[i];
    await prisma.contentItem.create({ data: { type: "policy", title: p.title, subtitle: null, description: p.description, content: null, imageUrl: p.imageUrl, category: null, status: "published", featured: false, sortOrder: i + 1, metadata: JSON.stringify({ bullets: p.bullets }) } });
  }
}

async function seedVideos() {
  for (const v of VIDEOS) {
    await prisma.contentItem.create({ data: { type: "video", title: v.title, subtitle: null, description: v.description, content: null, imageUrl: v.imageUrl, category: null, date: v.date || null, status: "published", featured: v.featured, sortOrder: v.sortOrder, metadata: JSON.stringify(v.metadata) } });
  }
}

async function seedGallery() {
  for (let i = 0; i < GALLERY.length; i++) {
    const item = GALLERY[i];
    await prisma.contentItem.create({ data: { type: "gallery", title: item.title, subtitle: null, description: item.description, content: null, imageUrl: item.imageUrl, category: null, status: "published", featured: false, sortOrder: i + 1, metadata: item.badge ? JSON.stringify({ badge: item.badge }) : "{}" } });
  }
}

async function seedDocuments() {
  for (const d of DOCUMENTS) {
    await prisma.contentItem.create({ data: { type: "document", title: d.title, subtitle: null, description: d.description, content: null, imageUrl: null, category: d.category, status: "published", featured: false, sortOrder: d.sortOrder, metadata: JSON.stringify({ pdfId: d.pdfId, icon: d.icon }) } });
  }
}

async function seedEvents() {
  for (const e of EVENTS) {
    await prisma.contentItem.create({ data: { type: "event", title: e.title, subtitle: null, description: e.description, content: null, imageUrl: e.imageUrl, category: e.category, date: e.date, location: e.location, status: "published", featured: e.featured, sortOrder: e.sortOrder, metadata: "{}" } });
  }
}

/** Seed recent news articles with proper thumbnails (local + Supabase-hosted). */
async function seedNews() {
  for (const n of NEWS) {
    await prisma.contentItem.create({
      data: {
        type: "news",
        title: n.title,
        subtitle: n.subtitle,
        description: n.description,
        content: n.content,
        imageUrl: n.imageUrl,
        category: n.category,
        date: n.date,
        status: "published",
        featured: n.featured,
        sortOrder: n.sortOrder,
        metadata: JSON.stringify({ thumbnailUrl: n.imageUrl }),
      },
    });
  }
}

async function seedCampaigns() {
  for (const c of CAMPAIGNS) {
    await prisma.campaign.create({ data: c });
  }
}
