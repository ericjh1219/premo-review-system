export type CustomerTrackingEvent = {
  id: string;
  timestamp: string;
  visitorId: string;
  platform: string;
  action: string;
  browser: string;
  device: string;
};

const VISITOR_ID_KEY = "premo-visitor-id";
const MAX_EVENTS = 200;

function storageKey(businessId: string) {
  return `premo-customer-tracking:${businessId}`;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "SSR";

  let visitorId = window.localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `VIS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function detectBrowser(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;

  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Chrome/") && !ua.includes("Chromium")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  return "Other";
}

export function detectDevice(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;

  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "Mobile";
  return "Desktop";
}

export function loadCustomerEvents(businessId: string): CustomerTrackingEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    return raw ? (JSON.parse(raw) as CustomerTrackingEvent[]) : [];
  } catch {
    return [];
  }
}

export function recordCustomerEvent(businessId: string, platform: string, action: string) {
  if (typeof window === "undefined") return;

  const event: CustomerTrackingEvent = {
    id: `CEV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    visitorId: getOrCreateVisitorId(),
    platform,
    action,
    browser: detectBrowser(),
    device: detectDevice(),
  };

  const events = [event, ...loadCustomerEvents(businessId)].slice(0, MAX_EVENTS);
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(events));
}
