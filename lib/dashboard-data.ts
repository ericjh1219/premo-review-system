export type TrackingAction = "Page Entry" | "Click";

export type TrackingEvent = {
  id: string;
  timestamp: string;
  visitorId: string;
  platform: string;
  action: TrackingAction;
  link: string;
  device: string;
};

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

const PLATFORM_LINK_CODES: Record<string, string> = {
  "WiFi Connect": "WFC8",
  Facebook: "FB29",
  "Google Review": "GRV1",
  "Instagram Story": "IGS7",
  Rednote: "RDN3",
  Lemon8: "LM82",
  TikTok: "TTK5",
  Weixin: "WXN6",
  "Facebook Follow": "FBF4",
  "Instagram Follow": "IGF8",
  "Tiktok Follow": "TTF9",
  "Lemon8 Follow": "LMF1",
  "XHS Follow": "XHF2",
  "Custom Webpage": "CWP0",
  "Upload Proof": "UPR3",
};

const DEVICES = ["Mobile", "Desktop", "Tablet"];

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

const NOW = new Date("2026-07-03T12:00:00Z").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

function generateTrackingEvents(): TrackingEvent[] {
  const random = mulberry32(20260703);
  const events: TrackingEvent[] = [];
  let counter = 1;

  for (let daysAgo = 0; daysAgo < 60; daysAgo++) {
    const eventsToday = 1 + Math.floor(random() * 5);

    for (let i = 0; i < eventsToday; i++) {
      const hourOffset = Math.floor(random() * 24);
      const minuteOffset = Math.floor(random() * 60);
      const timestamp = new Date(
        NOW - daysAgo * DAY_MS - hourOffset * 60 * 60 * 1000 - minuteOffset * 60 * 1000
      );

      const isPageEntry = random() < 0.3;
      const device = DEVICES[Math.floor(random() * DEVICES.length)];
      const visitorId = `VIS-${(1000 + Math.floor(random() * 8999)).toString()}`;

      if (isPageEntry) {
        events.push({
          id: `EVT-${counter++}`,
          timestamp: timestamp.toISOString(),
          visitorId,
          platform: "-",
          action: "Page Entry",
          link: "https://jshare.link/share/Premo/ZT68/",
          device,
        });
      } else {
        const platform = PLATFORM_OPTIONS[Math.floor(random() * PLATFORM_OPTIONS.length)];
        events.push({
          id: `EVT-${counter++}`,
          timestamp: timestamp.toISOString(),
          visitorId,
          platform,
          action: "Click",
          link: `https://jshare.link/share/Premo/${PLATFORM_LINK_CODES[platform]}`,
          device,
        });
      }
    }
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateLuckyDrawParticipants(): LuckyDrawParticipant[] {
  const random = mulberry32(42);
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

export const MOCK_TRACKING_EVENTS: TrackingEvent[] = generateTrackingEvents();
export const MOCK_LUCKY_DRAW_PARTICIPANTS: LuckyDrawParticipant[] = generateLuckyDrawParticipants();
