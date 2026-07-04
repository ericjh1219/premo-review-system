import { DEMO_BUSINESS } from "@/lib/business";

export type LuckyDrawStatus = "Pending" | "Winner" | "Not Selected";

export type LuckyDrawParticipant = {
  id: string;
  name: string;
  phone: string;
  email: string;
  submittedAt: string;
  status: LuckyDrawStatus;
};

export const PLATFORM_OPTIONS = [
  "WiFi Connect",
  "Facebook",
  "Google Review",
  "Instagram Story",
  "Rednote",
  "Lemon8",
  "TikTok",
  "Weixin",
  "Facebook Follow",
  "Instagram Follow",
  "Tiktok Follow",
  "Lemon8 Follow",
  "XHS Follow",
  "Custom Webpage",
  "Upload Proof",
];

const FIRST_NAMES = [
  "Sarah",
  "James",
  "Maria",
  "David",
  "Emily",
  "Alex",
  "Priya",
  "Wei",
  "Noah",
  "Olivia",
  "Liam",
  "Grace",
];
const LAST_NAMES = [
  "Tan",
  "Lim",
  "Chen",
  "Wong",
  "Kumar",
  "Ng",
  "Reyes",
  "Santos",
  "Ibrahim",
  "Lee",
];

function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash;
}

const NOW = new Date("2026-07-03T12:00:00Z").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Generates deterministic mock Lucky Draw participants, seeded per business
 * so every business gets its own distinct (but stable) mock report instead
 * of all businesses sharing the demo business's data.
 */
function generateLuckyDrawParticipants(businessId: string): LuckyDrawParticipant[] {
  const seed = businessId === DEMO_BUSINESS.id ? 42 : hashSeed(businessId);
  const random = mulberry32(seed);
  const participants: LuckyDrawParticipant[] = [];
  const statuses: LuckyDrawStatus[] = ["Pending", "Winner", "Not Selected"];

  for (let i = 0; i < 42; i++) {
    const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const daysAgo = Math.floor(random() * 60);
    const hourOffset = Math.floor(random() * 24);
    const submittedAt = new Date(NOW - daysAgo * DAY_MS - hourOffset * 60 * 60 * 1000);
    const status = statuses[Math.floor(random() * statuses.length)];
    const phoneSuffix = (1000000 + Math.floor(random() * 8999999)).toString();

    participants.push({
      id: `LD-${1000 + i}`,
      name: `${firstName} ${lastName}`,
      phone: `+1 555 ${phoneSuffix.slice(0, 3)}${phoneSuffix.slice(3, 7)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      submittedAt: submittedAt.toISOString(),
      status,
    });
  }

  return participants.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

const participantsCache = new Map<string, LuckyDrawParticipant[]>();

export function getMockLuckyDrawParticipants(businessId: string): LuckyDrawParticipant[] {
  const cached = participantsCache.get(businessId);
  if (cached) return cached;

  const participants = generateLuckyDrawParticipants(businessId);
  participantsCache.set(businessId, participants);
  return participants;
}
