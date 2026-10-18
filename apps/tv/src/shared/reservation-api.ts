import type { WelcomeContent } from './contracts';

export function validateTvApi(base: string): string {
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('A trusted HTTPS TV API URL is required.');
  return url.href.replace(/\/$/, '');
}

export function newTvIdentity(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function parseReservationContent(value: unknown): { content: WelcomeContent; leaseMs: number } {
  if (!value || typeof value !== 'object') throw new Error('Invalid TV response');
  const data = value as Record<string, unknown>;
  const guest = data.guest as { displayName?: unknown } | null;
  const server = Date.parse(String(data.serverTime)), until = Date.parse(String(data.validUntil));
  if (!Number.isFinite(server) || !Number.isFinite(until) || until <= server ||
    !['GUEST', 'STANDARD'].includes(String(data.mode)) ||
    (data.mode === 'GUEST' && (!guest || typeof guest.displayName !== 'string' || !guest.displayName.trim() || guest.displayName.length > 100)) ||
    (data.mode === 'STANDARD' && guest !== null) ||
    typeof data.resortName !== 'string' || typeof data.tagline !== 'string' ||
    !Array.isArray(data.information) || data.information.length > 8 ||
    !data.information.every(item => item && typeof item.title === 'string' && typeof item.text === 'string')) throw new Error('Invalid TV response');
  return { content: { mode: data.mode as 'GUEST' | 'STANDARD',
    guest: data.mode === 'GUEST' ? { displayName: guest!.displayName as string } : null,
    resortName: data.resortName, tagline: data.tagline,
    information: data.information.map(item => ({ title: item.title, text: item.text })) },
    leaseMs: Math.min(45000, until - server) };
}
