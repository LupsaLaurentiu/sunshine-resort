// Shared UI shape. Real reservation responses are validated before rendering.
export type WelcomeContent = {
  resortInformation?: ResortInformation;
  mode: 'MOCK' | 'GUEST' | 'STANDARD';
  guest: { displayName: string } | null;
  resortName: string;
  tagline: string;
  information: { title: string; text: string }[];
};

export type ResortLanguage = { tagline: string; houseRules: string; facilities: string; attractions: string; usefulInfo: string; contact: string };
export type ResortInformation = { wifi: { ssid: string; password: string }; ro: ResortLanguage; en: ResortLanguage; version: string | null };

export type TvPlatform = {
  readIdentity?: (api: string) => string | null;
  saveIdentity?: (api: string, secret: string) => void;
  exit: () => void;
  subscribeLifecycle: (listener: (event: string) => void) => () => void;
};
