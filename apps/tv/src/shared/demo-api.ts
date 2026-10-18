import type { WelcomeContent } from './contracts';

export const standardContent: WelcomeContent = {
  mode: 'STANDARD', guest: null, resortName: 'SUNSHINE RESORT',
  tagline: 'Your private escape into luxury.', information: [
    { title: 'Resort information', text: 'Information is temporarily unavailable. Please try again shortly.' },
  ],
};

export function parseDemoContent(value: unknown): WelcomeContent {
  if (!value || typeof value !== 'object') throw new Error('Invalid demo response');
  const data = value as Record<string, unknown>;
  const guest = data.guest as Record<string, unknown> | null;
  if (data.mode !== 'MOCK' || !guest || typeof guest.displayName !== 'string' ||
    !guest.displayName.trim() || guest.displayName.length > 100 ||
    typeof data.resortName !== 'string' || typeof data.tagline !== 'string' ||
    !Array.isArray(data.information) || data.information.length > 8 ||
    !data.information.every((item: unknown) => !!item && typeof item === 'object' &&
      typeof (item as Record<string, unknown>).title === 'string' &&
      typeof (item as Record<string, unknown>).text === 'string')) throw new Error('Invalid demo response');
  // Pick only the UI fields, never forward unexpected server fields.
  return { mode: 'MOCK', guest: { displayName: guest.displayName },
    resortName: data.resortName, tagline: data.tagline,
    information: data.information.map(item => ({ title: item.title, text: item.text })) };
}

export async function loadDemoContent(url: string, signal: AbortSignal): Promise<WelcomeContent> {
  const response = await fetch(url, { signal, cache: 'no-store', credentials: 'omit' });
  if (!response.ok) throw new Error(`Demo API HTTP ${response.status}`);
  return parseDemoContent(await response.json());
}
