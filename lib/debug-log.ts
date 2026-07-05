// TEMPORARY FILE — added only to diagnose the Chrome vs Safari login
// discrepancy. Delete this file and every authDebugLog() call site once the
// diagnosis is done.
export function authDebugLog(label: string, data?: unknown): void {
  try {
    console.log(`[AUTH-DEBUG] ${label} :: ${JSON.stringify(data)}`);
  } catch {
    console.log(`[AUTH-DEBUG] ${label} :: <unserializable>`, data);
  }
}
