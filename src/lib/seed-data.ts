/**
 * Seed data — SINGLE SOURCE OF TRUTH for all default content.
 *
 * This module contains the same content that `auto-seed.ts` writes into the
 * SQLite database (news, videos, events, leaders, policies, gallery, FAQs,
 * values, documents). It is pure data with no DB dependency.
 *
 * Why this exists:
 *   The public site fetches content from `/api/content`, which reads from the
 *   local SQLite database. On sandbox / writable-filesystem deployments the DB
 *   is auto-seeded and everything works. But on read-only / serverless
 *   deployments (e.g. Vercel) the SQLite file cannot be created or written, so
 *   the DB stays empty and `/api/content` would return empty arrays — meaning
 *   the live site would show NO news, NO videos, NO events.
 *
 *   To guarantee the live site always shows all news & media, `/api/content`
 *   falls back to `getStaticContentSnapshot()` (this module) whenever the
 *   database is unavailable or returns no rows.
 *
 * `auto-seed.ts` imports these arrays so the DB-seeded content and the static
 * fallback never drift apart.
 */
import { MEDIA_BASE, VIDEO_BASE } from "./media-urls";

/* ─── Shared timestamp for all static items (stable so snapshots are deterministic) ─── */
const NOW = new Date("2026-07-09T00:00:00.000Z").toISOString();

/** Shape of a content item as returned by the /api/content endpoint. */
export type ContentItemDTO = {
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

/* ════════════════════════════════════════════════════════════════════════
   LEADERS
   ════════════════════════════════════════════════════════════════════════ */
export const LEADERS = [
  { title: "Thabiso Mabetwa", subtitle: "President & Commander in Chief", description: "Thabiso Mabetwa is the President and Commander in Chief of the African Royal Rainbow Congress (ARRC). As the principal leader of the movement, President Mabetwa provides strategic direction and serves as the foremost representative of the organisation.", imageUrl: `/leaders/president.jpeg`, featured: true, sortOrder: 1 },
  { title: "Tidimalo Tsatsi Esq.", subtitle: "Vice Chairperson", description: "Tidimalo Tsatsi Esq. serves as the Vice Chairperson of the African Royal Rainbow Congress (ARRC). A legal professional and passionate advocate for justice, Tsatsi deputises for the Chairperson and plays a central role in guiding the organisation's governance and strategic direction.", imageUrl: `/leaders/vice-president.png`, featured: false, sortOrder: 2 },
  { title: "Aaron Matsimela", subtitle: "Chairperson", description: "Aaron Matsimela is the Chairperson of the African Royal Rainbow Congress (ARRC). A visionary leader and passionate advocate for social justice, economic empowerment, and the restoration of African dignity.", imageUrl: `/leaders/chairperson.jpeg`, featured: false, sortOrder: 3 },
  { title: "Johanna Mapeko", subtitle: "Secretary General", description: "Johanna Mapeko serves as the Secretary General of the African Royal Rainbow Congress (ARRC), the chief administrative officer of the organisation.", imageUrl: `${MEDIA_BASE}/leaders/secretary-general.png`, featured: false, sortOrder: 4 },
  { title: "Pule Mokwena", subtitle: "Youth President", description: "Pule Mokwena serves as the Youth President of the African Royal Rainbow Congress (ARRC), leading the party's Youth League and championing the voices, aspirations, and political participation of young South Africans. A dynamic organiser and passionate advocate for youth empowerment, President Mokwena has driven the rollout of leadership workshops and community mobilisation programmes across the provinces.", imageUrl: `/leaders/youth-president.png`, featured: false, sortOrder: 5 },
  { title: "Happy Mokoena", subtitle: "Youth Chairperson", description: "Happy Mokoena serves as the Youth Chairperson of the African Royal Rainbow Congress (ARRC), bringing passionate leadership and a relentless drive for youth empowerment.", imageUrl: `${MEDIA_BASE}/leaders/youth-chairperson.png`, featured: false, sortOrder: 6 },
  { title: "Thabiso Ntshabeleng", subtitle: "Treasurer", description: 'Thabiso Ntshabeleng is a driven and ambitious professional known for his commitment to excellence, leadership, and personal growth. Personal Motto: "Leadership is not about power; it is about service, accountability, and creating opportunities for others to succeed."', imageUrl: `/leaders/treasurer.jpeg`, featured: false, sortOrder: 7 },
  { title: "Tenecious Mokholo", subtitle: "National Speaker", description: "Tenecious Mokholo serves as the National Speaker of the African Royal Rainbow Congress (ARRC). As the official voice of the movement, Speaker Mokholo is responsible for articulating the party's vision, policies, and positions to the public, the media, and across all nine provinces. A compelling orator and principled communicator, he ensures that the ARRC's message of transparency, justice, progress, and unity reaches every South African community.", imageUrl: `/leaders/speaker.jpeg`, featured: false, sortOrder: 8 },
];

/* ════════════════════════════════════════════════════════════════════════
   VALUES
   ════════════════════════════════════════════════════════════════════════ */
export const VALUES = [
  { title: "Ubuntu", description: "I am because we are. Our humanity is interconnected — the ARRC governs with compassion and collective responsibility." },
  { title: "Integrity", description: "Transparency and accountability are non-negotiable. The ARRC leads with honesty and serves the people, not special interests." },
  { title: "Justice", description: "Economic, social, and criminal justice for all South Africans. The ARRC will fight systemic inequality and corruption." },
  { title: "Unity", description: "United in diversity. The ARRC brings together all South Africans — regardless of race, gender, or background — under a shared vision." },
  { title: "Service", description: "Leadership is service. The ARRC exists to serve the people, not to be served. Every member is accountable to the community." },
];

/* ════════════════════════════════════════════════════════════════════════
   FAQs
   ════════════════════════════════════════════════════════════════════════ */
export const FAQS = [
  { title: "How do I become a member?", description: "Joining is simple — fill out the membership form on this website or visit your nearest ARRC branch. Membership costs just R20 per year.", sortOrder: 1 },
  { title: "What does membership include?", description: "As an ARRC member, you get a membership card, access to branch meetings, voting rights in organisational elections, and the opportunity to shape the future of South Africa.", sortOrder: 2 },
  { title: "Can I volunteer without being a member?", description: "Yes! We welcome volunteers who share our vision. You can participate in campaigns, community events, and outreach programmes without formal membership.", sortOrder: 3 },
  { title: "How is the ARRC funded?", description: "The ARRC is 100% people-funded through R20 annual membership fees. This ensures our loyalty remains with the people, not corporate donors or special interests.", sortOrder: 4 },
  { title: "What are the ARRC's core policies?", description: "Our core policies include economic freedom, quality education, universal healthcare, land reform, environmental justice, and community safety.", sortOrder: 5 },
];

/* ════════════════════════════════════════════════════════════════════════
   POLICIES
   ════════════════════════════════════════════════════════════════════════ */
export const POLICIES = [
  { title: "Economic Freedom", description: "Breaking economic chains. The ARRC is committed to radical economic transformation that ensures wealth is shared, not hoarded.", imageUrl: "/policies/economic-freedom.jpg", bullets: ["Radical economic transformation", "Shared wealth, not hoarded wealth", "Black economic empowerment"] },
  { title: "Quality Education", description: "Education is liberation. The ARRC will fight for free, quality education from early childhood to university.", imageUrl: "/policies/quality-education.jpg", bullets: ["Free, quality education", "Early childhood to university", "Skills for the future"] },
  { title: "Healthcare for All", description: "Health is a right, not a privilege. The ARRC will work towards a universal healthcare system that serves every South African.", imageUrl: "/policies/healthcare-for-all.jpg", bullets: ["Universal healthcare", "Accessible clinics", "Quality public health"] },
  { title: "Land Reform", description: "Land belongs to the people. The ARRC advocates for equitable land redistribution that addresses historical injustices.", imageUrl: null, bullets: ["Equitable redistribution", "Address historical injustice", "Productive land use"] },
  { title: "Environmental Justice", description: "Protecting our land, air, and water. The ARRC recognises that environmental justice is inseparable from social justice.", imageUrl: null, bullets: ["Clean air & water", "Renewable energy", "Climate justice"] },
  { title: "Safety & Security", description: "Every South African deserves to feel safe. The ARRC will overhaul policing and justice systems to serve communities.", imageUrl: null, bullets: ["Community policing", "Justice reform", "Safe neighbourhoods"] },
];

/* ════════════════════════════════════════════════════════════════════════
   VIDEOS
   ════════════════════════════════════════════════════════════════════════ */
export const VIDEOS = [
  {
    title: "ARRC President Delivers Community Report at Kaalfontein",
    description: "The President of the African Royal Rainbow Congress addresses a live community gathering in Kaalfontein Ext 7 (Ward 92 & 111), delivering a report on organisational activities and local issues. Broadcast live under the \"BUILDING BRIDGE\" banner, the outdoor address underscores the ARRC's commitment to grassroots engagement, accountability, and direct dialogue with the communities it serves.",
    imageUrl: "/videos/thumbnails/arrc-president-report-kaalfontein-2026-07-09.jpg",
    date: "9 July 2026",
    featured: true,
    sortOrder: 1,
    metadata: { videoUrl: "/videos/arrc-president-report-kaalfontein-2026-07-09.mp4", thumbnailUrl: "/videos/thumbnails/arrc-president-report-kaalfontein-2026-07-09.jpg", duration: "1:08", location: "Kaalfontein Ext 7, Ward 92 & 111" },
  },
  {
    title: "ARRC Community Rally — Mabahambe",
    description: "A vibrant community rally in Mabahambe brought together residents, leaders, and supporters for a powerful display of grassroots unity. With the South African flag waving and community members documenting the moment, the ARRC continues its mission of listening to the people, engaging with communities, and delivering real solutions for a better South Africa.",
    imageUrl: "/videos/thumbnails/arrc-news-2026-06-30.jpg",
    date: "30 June 2026",
    featured: false,
    sortOrder: 2,
    metadata: { videoUrl: "/videos/arrc-news-2026-06-30.mp4", thumbnailUrl: "/videos/thumbnails/arrc-news-2026-06-30.jpg", duration: "0:35" },
  },
  {
    title: "ARRC Campaign Rally",
    description: "Highlights from the ARRC campaign rally — uniting communities across South Africa for change, justice, and economic freedom.",
    imageUrl: "/videos/thumbnails/arrc-campaign.jpg",
    date: null,
    featured: false,
    sortOrder: 3,
    metadata: { videoUrl: `${VIDEO_BASE}/arrc-campaign.mp4`, thumbnailUrl: "/videos/thumbnails/arrc-campaign.jpg", duration: "3:45" },
  },
  {
    title: "SG Johanna Mapeko — LGBTQ Press Conference",
    description: "Secretary General Johanna Mapeko addresses the press on ARRC's stance on LGBTQ rights and equality for all South Africans.",
    imageUrl: "/videos/thumbnails/secretary-general-lgbtq.jpg",
    date: null,
    featured: false,
    sortOrder: 4,
    metadata: { videoUrl: `${VIDEO_BASE}/secretary-general-lgbtq.mp4`, thumbnailUrl: "/videos/thumbnails/secretary-general-lgbtq.jpg", duration: "5:12" },
  },
];

/* ════════════════════════════════════════════════════════════════════════
   GALLERY
   ════════════════════════════════════════════════════════════════════════ */
export const GALLERY = [
  { title: "Community Rally for Change", description: "ARRC supporters gather for a community rally calling for change.", imageUrl: "/events/march-with-purpose.jpeg", badge: "Rally" },
  { title: "Door-to-Door Campaign", description: "Volunteers going door-to-door spreading the ARRC message.", imageUrl: "/gallery/door-to-door-campaign.jpeg", badge: "Campaign" },
  { title: "Campaign March", description: "ARRC supporters march for justice and equality.", imageUrl: "/events/moretele-march.jpeg", badge: "March" },
  { title: "Community Supporters", description: "Community members showing their support for the ARRC.", imageUrl: "/events/voter-registration-weekend-president.jpeg", badge: "Community" },
  { title: "Campaign Trail", description: "On the campaign trail across South Africa.", imageUrl: "/events/door-to-door-soweto-ward-14.jpeg", badge: "Campaign" },
  { title: "Door-to-Door Campaign — Mathibestad", description: "ARRC volunteers engaging with residents in Mathibestad, North-West Province.", imageUrl: "/gallery/door-to-door-campaign.jpeg", badge: "Campaign" },
  { title: "Ward 132 Campaign Billboard — Tenecious Sello Mokholo", description: "ARRC Councillor Candidate billboard for Ward 132, City of Johannesburg. \"Your Voice. Your Rights. Our Future.\"", imageUrl: "/gallery/mokholo-ward-132-billboard.jpeg", badge: "Billboard" },
];

/* ════════════════════════════════════════════════════════════════════════
   DOCUMENTS
   ════════════════════════════════════════════════════════════════════════ */
export const DOCUMENTS = [
  { title: "ARRC Constitution", description: "The founding constitution of the African Royal Rainbow Congress — our guiding framework for governance, democracy, and organisational structure.", category: "Governance", pdfId: "constitution", icon: "Scale", sortOrder: 1 },
  { title: "ARRC 2026 Manifesto", description: "The official 2026 Manifesto of the African Royal Rainbow Congress — our vision and plan for a better South Africa.", category: "Manifesto", pdfId: "arrc-2026-manifesto", icon: "ScrollText", sortOrder: 2 },
  { title: "Finance & Admin Policy", description: "The financial administration policy of the ARRC — ensuring transparency, accountability, and proper management of organisational resources.", category: "Policy", pdfId: "finance-admin-policy", icon: "ScrollText", sortOrder: 3 },
  { title: "Draft Admin Policy", description: "The draft administrative policy of the ARRC — outlining procedures and governance for effective organisational administration.", category: "Policy", pdfId: "draft-admin-policy", icon: "ScrollText", sortOrder: 4 },
  { title: "Members Code of Conduct", description: "The code of conduct for all ARRC members — defining the standards of behaviour, integrity, and accountability expected of every member.", category: "Governance", pdfId: "members-code", icon: "Shield", sortOrder: 5 },
];

/* ════════════════════════════════════════════════════════════════════════
   EVENTS
   ════════════════════════════════════════════════════════════════════════ */
export const EVENTS = [
  // ─── UPCOMING — July 2026 poster events (sortOrder 1–8, nearest first) ───
  { title: "March in Moretele — #Abahambe", description: "A peaceful community march through Moretele. Route: Makapanstad → Mathibestad → Danhouse. Together we stand, together we win. NO WEAPONS ALLOWED. March peacefully, march responsibly.", imageUrl: "/events/moretele-march.jpeg", category: "Community March", date: "2026-07-09", location: "Makapanstad, Moretele (North-West)", featured: true, sortOrder: 1 },
  { title: "Tshwane Door-to-Door — Ward 07 (Nkomo Village)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: Nkomo Village, Ward 07. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-11", location: "Ward 07, Nkomo Village (Tshwane)", featured: false, sortOrder: 2 },
  { title: "Tshwane Door-to-Door — Ward 68 (Saulsville Station)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: Saulsville Station, Ward 68. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-12", location: "Ward 68, Saulsville Station (Tshwane)", featured: false, sortOrder: 3 },
  { title: "Vaal 2587 Phase 3 — Tshepiso Sharpeville Door to Door", description: "Door-to-door community engagement in Vaal 2587 Phase 3, Tshepiso Sharpeville. Connecting with residents around jobs & opportunities, education & skills, safe & strong communities, and economic growth. Together we can build a better future!", imageUrl: "/events/vaal-tshepiso-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-18", location: "Vaal 2587 Phase 3, Tshepiso Sharpeville", featured: false, sortOrder: 4 },
  { title: "Tshwane Door-to-Door — Ward 107 (Dumping)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: Dumping, Ward 107. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-18", location: "Ward 107, Dumping (Tshwane)", featured: false, sortOrder: 5 },
  { title: "Tshwane Door-to-Door — Ward 71 (Marastart)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: Marastart, Ward 71. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-19", location: "Ward 71, Marastart (Tshwane)", featured: false, sortOrder: 6 },
  { title: "Tshwane Door-to-Door — Ward 72 (White House)", description: "Tshwane Region, Sub-Region 03 door-to-door mobilization. Starting point: White House, Ward 72. Part of the July mobilization series led by Sub-Region 03 Chairperson SD Chabalala.", imageUrl: "/events/tshwane-door-to-door.jpeg", category: "Door-to-Door Mobilization", date: "2026-07-25", location: "Ward 72, White House (Tshwane)", featured: false, sortOrder: 7 },
  { title: "March with Purpose — March for Our Future", description: "A national call to peaceful, responsible mobilization. Our voice. Our rights. Our South Africa. Let your voice be heard — peacefully. Stay safe. Stand united. Date and venue to be announced.", imageUrl: "/events/march-with-purpose.jpeg", category: "National Mobilization", date: "Date to be announced", location: "South Africa (venue TBA)", featured: false, sortOrder: 8 },
  // ─── UPCOMING — August 2026 voter registration & door-to-door events ───
  { title: "Final Voter Registration Weekend — President Thabiso Mabetwa", description: "The ARRC calls on all eligible South Africans to register to vote during the final voter registration weekend. Your voice. Your rights. Our future. Register to vote on 4 November. President Dr Thabiso Mabetwa urges every citizen to participate in shaping our democracy.", imageUrl: "/events/voter-registration-weekend-president.jpeg", category: "Voter Registration", date: "2026-08-01", location: "Nationwide (all IEC voting stations)", featured: true, sortOrder: 9 },
  { title: "Final Voter Registration Weekend — Deputy President Calvin Nkosi", description: "Deputy President Calvin Nkosi joins the call for mass voter registration. The ARRC mobilises supporters across South Africa to ensure every eligible citizen is registered to vote. Final registration weekend: 1–2 August 2026, from 8AM to 5PM. Register to vote on 4 November.", imageUrl: "/events/voter-registration-weekend-deputy-president.jpeg", category: "Voter Registration", date: "2026-08-01", location: "Nationwide (all IEC voting stations)", featured: false, sortOrder: 10 },
  { title: "Ward 92 Candidate — Maropeng Flora Setwaba (Moretele)", description: "ARRC Ward 92 candidate Maropeng Flora Setwaba leads voter registration mobilization in Moretele. Final voter registration weekend: 1–2 August 2026, from 8AM to 5PM. Register to vote on 4 November. Your voice. Your rights. Our future.", imageUrl: "/events/ward-92-candidate-moretele.jpeg", category: "Voter Registration", date: "2026-08-01", location: "Ward 92, Moretele (North-West)", featured: false, sortOrder: 11 },
  { title: "Door-to-Door Activation — Soweto Ward 14 (Naledi Ext 2)", description: "The ARRC goes to every home in Soweto to listen, engage, and serve. Door-to-door activation in Ward 14, Naledi Ext 2. We are going to every home, to listen, to engage and to serve. People first. Unity in diversity. Service excellence. A better tomorrow.", imageUrl: "/events/door-to-door-soweto-ward-14.jpeg", category: "Door-to-Door Mobilization", date: "2026-08-15", location: "96a Mthini Street, Naledi Ext 2, Soweto (Ward 14)", featured: false, sortOrder: 12 },
  // ─── PAST events (sortOrder 50+, kept for the record) ───
  { title: "Door to Door Campaign — Mathibestad", description: "ARRC volunteers take our movement to the people of Mathibestad, North-West Province. Listening to residents, engaging with communities, and delivering real solutions. Bojanala District, Moretele Local Municipality, Ward 18.", imageUrl: "/campaigns/door-to-door-campaign.jpeg", category: "Community Outreach", date: "2026-07-04", location: "Mathibestad, North-West Province", featured: false, sortOrder: 50 },
  { title: "Community Engagement Forum", description: "ARRC hosted a community engagement forum to hear directly from residents about local issues, service delivery, and the challenges facing our communities. A platform for the people's voice.", imageUrl: "/news/news-community-2026.jpg", category: "Community Forum", date: "2026-06-28", location: "Soshanguve, Gauteng", featured: false, sortOrder: 51 },
  { title: "Youth Leadership Workshop", description: "The ARRC Youth League hosted a leadership workshop empowering young South Africans with skills in community organising, civic participation, and advocacy. Building tomorrow's leaders today.", imageUrl: "/news/news-youth-2026.jpg", category: "Youth Development", date: "2026-06-26", location: "Mamelodi, Gauteng", featured: false, sortOrder: 52 },
  { title: "Women's Solidarity March", description: "ARRC members and supporters marched in solidarity for women's rights, dignity, and safety. United against gender-based violence and for a South Africa where every woman is safe and empowered.", imageUrl: null, category: "Solidarity March", date: "2026-06-25", location: "Pretoria CBD, Gauteng", featured: false, sortOrder: 53 },
  { title: "Volunteer Mobilization Drive", description: "ARRC volunteer teams mobilised across communities for a weekend of door-to-door outreach, voter registration assistance, and community service. Together we build better communities.", imageUrl: "/news/news-door-to-door.jpg", category: "Volunteer Drive", date: "2026-06-24", location: "Tembisa, Gauteng", featured: false, sortOrder: 54 },
];

/* ════════════════════════════════════════════════════════════════════════
   NEWS
   ════════════════════════════════════════════════════════════════════════ */
export const NEWS = [
  {
    title: "ARRC President Delivers Community Report at Kaalfontein Gathering",
    subtitle: "Live address highlights local engagement and organisational updates",
    description: "The ARRC President addresses community members in Kaalfontein Ext 7 (Ward 92 & 111), delivering a report on organisational activities and local issues. The outdoor gathering, marked by ARRC branding and a live broadcast, emphasises community engagement and accountability. Attendees in branded apparel reflect strong organisational presence and participation.",
    content: "The President of the African Royal Rainbow Congress (ARRC) addressed a live gathering in Kaalfontein Ext 7, delivering a report to community members on the state of the organisation and the issues facing their wards. The outdoor setting, with visible residential structures and construction activity nearby, underscored a focus on local development and direct engagement. The President, speaking into a microphone, was flanked by supporters in ARRC-branded attire, reinforcing organisational unity. Broadcast live under the \"BUILDING BRIDGE\" banner, the address highlighted themes of governance, community accountability, and grassroots participation, as attendees gathered to hear updates on initiatives affecting their communities. A full recording of the President's report is available in the media gallery.",
    imageUrl: "/videos/thumbnails/arrc-president-report-kaalfontein-2026-07-09.jpg",
    category: "Presidential Report",
    date: "2026-07-09",
    featured: true,
    sortOrder: 1,
  },
  {
    title: "ARRC Launches Door-to-Door Campaign in Mathibestad",
    subtitle: "Grassroots outreach kicks off in North-West Province",
    description: "The African Royal Rainbow Congress officially launched its Door-to-Door Campaign in Mathibestad on 4 July 2026, with volunteers engaging residents across Ward 18 of the Moretele Local Municipality. The campaign focuses on listening to community concerns, registering new members, and sharing the ARRC vision for a better South Africa.",
    content: "President Thabiso Mabetwa addressed volunteers ahead of the launch, emphasising that the ARRC's strength lies in its connection to the people. \"We are not a party of boardrooms and backrooms — we are a party of the streets, the townships, and the villages,\" he said. The campaign will continue across the Bojanala District throughout July, with plans to expand to other provinces in August.",
    imageUrl: "/news/news-door-to-door.jpg",
    category: "Campaigns",
    date: "2026-07-04",
    featured: false,
    sortOrder: 2,
  },
  {
    title: "ARRC Unveils Bold New Policy Framework",
    subtitle: "Six-pillar plan targets economic freedom, education, and justice",
    description: "The ARRC has unveiled its comprehensive 2026 policy framework, outlining a six-pillar agenda for transforming South Africa. The framework covers economic freedom, quality education, universal healthcare, land reform, environmental justice, and community safety.",
    content: "Chairperson Aaron Matsimela presented the framework at a press conference in Pretoria, calling it \"a blueprint for the South Africa we want to build.\" The full manifesto is available for download in the documents section of this website.",
    imageUrl: "/news/news-policy-2026.jpg",
    category: "Policy",
    date: "2026-06-29",
    featured: false,
    sortOrder: 3,
  },
  {
    title: "Youth League Hosts Inaugural Leadership Workshop",
    subtitle: "Young South Africans trained in community organising and advocacy",
    description: "The ARRC Youth League successfully hosted its inaugural Leadership Workshop in Mamelodi on 26 June 2026, bringing together over 80 young leaders from across Gauteng for a day of skills-building, dialogue, and strategising.",
    content: "Youth President Pule Mokwena opened the workshop with a call to action: \"The future of South Africa belongs to you. We must organise, we must mobilise, and we must lead.\" Sessions covered community organising, civic participation, digital advocacy, and policy development. The Youth League plans to roll out similar workshops in every province before the end of 2026.",
    imageUrl: "/news/news-youth-2026.jpg",
    category: "Youth",
    date: "2026-06-26",
    featured: false,
    sortOrder: 4,
  },
  {
    title: "ARRC Holds First Community Engagement Forum in Soshanguve",
    subtitle: "Residents raise concerns about service delivery and safety",
    description: "On 28 June 2026, the ARRC held its first Community Engagement Forum in Soshanguve, giving residents a direct platform to raise concerns about service delivery, infrastructure, and community safety with party leadership.",
    content: "Secretary General Johanna Mapeko facilitated the forum, which drew over 200 residents. Key issues raised included water shortages, electricity outages, inadequate policing, and youth unemployment. Mapeko committed the ARRC to producing a community report and following up with relevant authorities. \"This is what democracy looks like — leaders listening to the people,\" she said.",
    imageUrl: "/news/news-community-2026.jpg",
    category: "Community",
    date: "2026-06-28",
    featured: false,
    sortOrder: 5,
  },
  {
    title: "ARRC Rally Draws Thousands in Mabahambe",
    subtitle: "Movement gains momentum ahead of national campaign",
    description: "A vibrant community rally in Mabahambe brought together residents, leaders, and supporters on 30 June 2026 for a powerful display of grassroots unity. With the South African flag waving and community members documenting the moment, the ARRC continues its mission of listening to the people and delivering real solutions.",
    content: "Speakers at the rally reinforced the ARRC's commitment to people-powered politics and outlined the movement's plans for the coming months. A short documentary of the rally is available in the news video section.",
    imageUrl: "/videos/thumbnails/arrc-news-2026-06-30.jpg",
    category: "Rally",
    date: "2026-06-30",
    featured: false,
    sortOrder: 6,
  },
  {
    title: "ARRC Unveils Ward 132 Campaign Billboard for Local Elections",
    subtitle: "Tenecious Sello Mokholo announced as Councillor Candidate for City of Johannesburg",
    description: "The African Royal Rainbow Congress has unveiled its first campaign billboard ahead of the 4 November 2026 local government elections, featuring Tenecious Sello Mokholo as the party's Councillor Candidate for Ward 132 in the City of Johannesburg. The billboard carries the slogan \"Your Voice. Your Rights. Our Future.\" and the rallying call \"Together, we build a better tomorrow!\"",
    content: "The billboard, prominently displayed across Ward 132, marks the ARRC's formal entry into the Johannesburg municipal elections. It features the party's signature rainbow branding and positions the ARRC as the voice of residents who have been forgotten by the established parties.\n\nTenecious Sello Mokholo, who also serves as the ARRC's National Speaker, said: \"This billboard is more than a campaign poster — it is a contract with the people of Ward 132. We are saying: your voice matters, your rights will be defended, and together we will build a better tomorrow. For too long, our communities have been ignored. The ARRC is here to change that.\"\n\nThe campaign centres on three pillars — Your Voice, Your Rights, and Our Future — reflecting the party's commitment to transparent governance, accountable leadership, and community-driven development. The ARRC encourages all eligible voters in Ward 132 to register and make their voices heard on 4 November 2026.\n\nMembership is open to all South Africans aged 16 and above for just R20 per year. Join the movement today.",
    imageUrl: "/news/mokholo-ward-132-billboard.jpeg",
    category: "Campaigns",
    date: "2026-08-28",
    featured: true,
    sortOrder: 7,
  },
];

/* ════════════════════════════════════════════════════════════════════════
   CAMPAIGNS (used by auto-seed only; not part of the content snapshot)
   ════════════════════════════════════════════════════════════════════════ */
export const CAMPAIGNS = [
  { slug: "door-to-door-campaign-mathibestad", title: "Door to Door Campaign — Mathibestad", summary: "Listening. Engaging. Delivering. Support our grassroots outreach in Mathibestad, North-West Province as we build better communities together.", description: "The ARRC Door to Door Campaign brings our movement directly to the people. On 04 July 2026, our volunteers will be in Mathibestad (Bojanala District, Moretele Local Municipality, Ward 18) listening to residents, engaging with communities, and delivering real solutions. Together we build better communities — secure neighbourhoods, accountable governance, and a better future for all South Africans. Your donation funds campaign materials, transport for volunteers, and community engagement events.", imageUrl: "/campaigns/door-to-door-campaign.jpeg", category: "community", status: "active", goalAmount: 50000, raisedAmount: 18500, supporterGoal: 500, supporterCount: 237, featured: true, sortOrder: 1, startDate: new Date("2026-07-04") },
  { slug: "march-with-purpose-moretele", title: "March With Purpose — Moretele", summary: "Standing together for justice and accountability. Join thousands of ARRC supporters marching for a fairer South Africa.", description: "The March With Purpose campaign unites communities across Moretele to demand transparent governance, safer neighbourhoods, and economic justice. Every step is a statement. Every voice matters. Your support funds permits, transport, banners, and community safety marshals.", imageUrl: "/events/march-with-purpose.jpeg", category: "community", status: "active", goalAmount: 75000, raisedAmount: 41200, supporterGoal: 1000, supporterCount: 648, featured: true, sortOrder: 2, startDate: new Date("2026-08-16") },
  { slug: "voter-registration-drive", title: "Voter Registration Drive 2026", summary: "Every voice deserves a vote. Help us register 100,000 new voters across all nine provinces ahead of 2026.", description: "Our national Voter Registration Drive mobilises volunteers in every province to assist eligible citizens with voter registration. From rural towns to township centres, we ensure every South African can exercise their democratic right. Donations fuel registration materials, volunteer training, and transport to remote areas.", imageUrl: "/events/voter-registration-weekend-president.jpeg", category: "community", status: "active", goalAmount: 120000, raisedAmount: 67500, supporterGoal: 2000, supporterCount: 1192, featured: true, sortOrder: 3, startDate: new Date("2026-09-05") },
  { slug: "youth-leadership-workshop", title: "Youth Leadership Workshop Series", summary: "Investing in the next generation of South African leaders. Workshops in every province for ages 18–35.", description: "The ARRC Youth Leadership Workshop Series equips young South Africans with the skills, networks, and confidence to lead change in their communities. Covering civic education, public speaking, campaign organising, and policy literacy, these workshops build the leaders of tomorrow. Your contribution covers venues, materials, meals, and mentor stipends.", imageUrl: "/news/news-youth-2026.jpg", category: "education", status: "active", goalAmount: 60000, raisedAmount: 22800, supporterGoal: 300, supporterCount: 154, featured: false, sortOrder: 4, startDate: new Date("2026-10-10") },
];

/* ════════════════════════════════════════════════════════════════════════
   STATIC CONTENT SNAPSHOT
   Builds the grouped object in the exact shape returned by /api/content.
   Used as a fallback when the SQLite DB is unavailable (serverless deploys).
   ════════════════════════════════════════════════════════════════════════ */
export function getStaticContentSnapshot(): Record<string, ContentItemDTO[]> {
  const leaders: ContentItemDTO[] = LEADERS.map((l, i) => ({
    id: `static-leader-${i + 1}`,
    type: "leader",
    title: l.title,
    subtitle: l.subtitle,
    description: l.description,
    content: null,
    imageUrl: l.imageUrl,
    category: "nec",
    date: null,
    location: null,
    status: "published",
    featured: l.featured,
    sortOrder: l.sortOrder,
    metadata: {},
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const values: ContentItemDTO[] = VALUES.map((v, i) => ({
    id: `static-value-${i + 1}`,
    type: "value",
    title: v.title,
    subtitle: null,
    description: v.description,
    content: null,
    imageUrl: null,
    category: null,
    date: null,
    location: null,
    status: "published",
    featured: false,
    sortOrder: i + 1,
    metadata: {},
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const faqs: ContentItemDTO[] = FAQS.map((f) => ({
    id: `static-faq-${f.sortOrder}`,
    type: "faq",
    title: f.title,
    subtitle: null,
    description: f.description,
    content: null,
    imageUrl: null,
    category: null,
    date: null,
    location: null,
    status: "published",
    featured: false,
    sortOrder: f.sortOrder,
    metadata: {},
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const policies: ContentItemDTO[] = POLICIES.map((p, i) => ({
    id: `static-policy-${i + 1}`,
    type: "policy",
    title: p.title,
    subtitle: null,
    description: p.description,
    content: null,
    imageUrl: p.imageUrl,
    category: null,
    date: null,
    location: null,
    status: "published",
    featured: false,
    sortOrder: i + 1,
    metadata: { bullets: p.bullets },
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const videos: ContentItemDTO[] = VIDEOS.map((v, i) => ({
    id: `static-video-${i + 1}`,
    type: "video",
    title: v.title,
    subtitle: null,
    description: v.description,
    content: null,
    imageUrl: v.imageUrl,
    category: null,
    date: v.date,
    location: null,
    status: "published",
    featured: v.featured,
    sortOrder: v.sortOrder,
    metadata: v.metadata,
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const gallery: ContentItemDTO[] = GALLERY.map((g, i) => ({
    id: `static-gallery-${i + 1}`,
    type: "gallery",
    title: g.title,
    subtitle: null,
    description: g.description,
    content: null,
    imageUrl: g.imageUrl,
    category: null,
    date: null,
    location: null,
    status: "published",
    featured: false,
    sortOrder: i + 1,
    metadata: g.badge ? { badge: g.badge } : {},
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const documents: ContentItemDTO[] = DOCUMENTS.map((d) => ({
    id: `static-document-${d.sortOrder}`,
    type: "document",
    title: d.title,
    subtitle: null,
    description: d.description,
    content: null,
    imageUrl: null,
    category: d.category,
    date: null,
    location: null,
    status: "published",
    featured: false,
    sortOrder: d.sortOrder,
    metadata: { pdfId: d.pdfId, icon: d.icon },
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const events: ContentItemDTO[] = EVENTS.map((e, i) => ({
    id: `static-event-${i + 1}`,
    type: "event",
    title: e.title,
    subtitle: null,
    description: e.description,
    content: null,
    imageUrl: e.imageUrl,
    category: e.category,
    date: e.date,
    location: e.location,
    status: "published",
    featured: e.featured,
    sortOrder: e.sortOrder,
    metadata: {},
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const news: ContentItemDTO[] = NEWS.map((n) => ({
    id: `static-news-${n.sortOrder}`,
    type: "news",
    title: n.title,
    subtitle: n.subtitle,
    description: n.description,
    content: n.content,
    imageUrl: n.imageUrl,
    category: n.category,
    date: n.date,
    location: null,
    status: "published",
    featured: n.featured,
    sortOrder: n.sortOrder,
    metadata: { thumbnailUrl: n.imageUrl },
    createdAt: NOW,
    updatedAt: NOW,
  }));

  return { events, news, policies, leaders, gallery, videos, faqs, values, documents };
}
