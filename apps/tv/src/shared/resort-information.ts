import type { ResortInformation, ResortLanguage, WelcomeContent } from './contracts';

export function parseResortInformation(input: unknown): ResortInformation | undefined {
  if (input === undefined) return undefined; // compatibility with the previous API
  if (!input || typeof input !== 'object') throw new Error('Invalid resort information');
  const data = input as Record<string, unknown>;
  const wifi = data.wifi as Record<string, unknown> | null;
  if (!wifi || typeof wifi.ssid !== 'string' || wifi.ssid.length > 128 || typeof wifi.password !== 'string' || wifi.password.length > 128 ||
    (data.version !== null && typeof data.version !== 'string')) throw new Error('Invalid resort information');
  const language = (input: unknown): ResortLanguage => {
    if (!input || typeof input !== 'object') throw new Error('Invalid resort language');
    const source = input as Record<string, unknown>;
    const result = {} as ResortLanguage;
    for (const key of ['tagline', 'houseRules', 'facilities', 'attractions', 'usefulInfo', 'contact'] as const) {
      const value = source[key];
      const limit = key === 'tagline' ? 160 : key === 'contact' ? 2000 : 6000;
      if (typeof value !== 'string' || value.length > limit) throw new Error('Invalid resort text');
      result[key] = value;
    }
    return result;
  };
  return { wifi: { ssid: wifi.ssid, password: wifi.password }, ro: language(data.ro), en: language(data.en), version: data.version as string | null };
}

export function withoutGuest(content: WelcomeContent): WelcomeContent {
  return { ...content, mode: 'STANDARD', guest: null };
}

// Bound both line count and line length so a long admin text stays readable on TV.
export function paginateText(text: string): string[] {
  if (!text.trim()) return [];
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r/g, '').split('\n')) {
    let remaining = paragraph.trim();
    if (!remaining) { lines.push(''); continue; }
    while (remaining.length > 58) {
      const space = remaining.lastIndexOf(' ', 58);
      const cut = space > 0 ? space : 58;
      lines.push(remaining.slice(0, cut)); remaining = remaining.slice(cut).trimStart();
    }
    if (remaining) lines.push(remaining);
  }
  const pages: string[] = [];
  for (let start = 0; start < lines.length; start += 8) pages.push(lines.slice(start, start + 8).join('\n'));
  return pages;
}
