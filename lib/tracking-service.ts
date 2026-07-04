export type TrackingEvent = {
  id: string;
  businessId: string;
  platform: string;
  action: string;
  timestamp: string;
  sessionId: string;
  visitorId: string;
  browser: string;
  device: string;
  link?: string;
};

/**
 * Every platform this tracking system records. Kept as a single source of
 * truth so the Customer Share Page (writer) and the Admin Dashboard
 * (reader) always agree on the same vocabulary.
 */
export const TRACKED_PLATFORMS = [
  "Page Entry",
  "Google Review",
  "Facebook",
  "Instagram Story",
  "TikTok",
  "Rednote",
  "Lemon8",
  "Weixin",
  "WiFi Connect",
  "Custom Webpage",
  "Upload Proof",
  "Lucky Draw Entry",
  "Facebook Follow",
  "Instagram Follow",
  "Tiktok Follow",
  "Lemon8 Follow",
  "XHS Follow",
] as const;

export type TrackedPlatform = (typeof TRACKED_PLATFORMS)[number];

const STORAGE_PREFIX = "premo-tracking";
const VISITOR_ID_KEY = "premo-visitor-id";
const SESSION_ID_KEY = "premo-session-id";
const MAX_EVENTS_PER_BUSINESS = 1000;

function storageKey(businessId: string) {
  return `${STORAGE_PREFIX}:${businessId}`;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "SSR";

  let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `VIS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

/**
 * A session id identifies one browsing session (tab/window), distinct
 * from the visitor id which persists across visits. Uses sessionStorage
 * so it naturally resets when the browser session ends.
 */
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "SSR";

  let sessionId = window.sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `SES-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    window.sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

function detectBrowser(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;

  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Chrome/") && !ua.includes("Chromium")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  return "Other";
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;

  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "Mobile";
  return "Desktop";
}

function readEvents(businessId: string): TrackingEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    return raw ? (JSON.parse(raw) as TrackingEvent[]) : [];
  } catch {
    return [];
  }
}

/**
 * A single reusable service for recording and reading tracking events.
 * Every business id is stored independently, keeping the system
 * multi-tenant friendly without requiring a backend.
 */
export const trackingService = {
  recordEvent(businessId: string, platform: string, action: string, link?: string): TrackingEvent {
    const event: TrackingEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      businessId,
      platform,
      action,
      timestamp: new Date().toISOString(),
      sessionId: getOrCreateSessionId(),
      visitorId: getOrCreateVisitorId(),
      browser: detectBrowser(),
      device: detectDevice(),
      link,
    };

    if (typeof window !== "undefined") {
      const events = [event, ...readEvents(businessId)].slice(0, MAX_EVENTS_PER_BUSINESS);
      window.localStorage.setItem(storageKey(businessId), JSON.stringify(events));
    }

    return event;
  },

  getEvents(businessId: string): TrackingEvent[] {
    return readEvents(businessId);
  },

  getEventsInRange(businessId: string, startMs: number, endMs: number): TrackingEvent[] {
    return readEvents(businessId).filter((event) => {
      const time = new Date(event.timestamp).getTime();
      return time >= startMs && time <= endMs;
    });
  },
};
