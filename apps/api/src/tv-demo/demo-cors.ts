// Only this public, fictional response is readable from packaged TV origins.
export function isTvDemoRequest(path: string, method: string): boolean {
  return /^\/api\/tv\/demo\/content\/?$/.test(path) &&
    (method === 'GET' || method === 'OPTIONS');
}
