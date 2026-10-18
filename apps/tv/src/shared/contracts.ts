// Shared UI shape. Real reservation responses are validated before rendering.
export type WelcomeContent = {
  mode: 'MOCK' | 'GUEST' | 'STANDARD';
  guest: { displayName: string } | null;
  resortName: string;
  tagline: string;
  information: { title: string; text: string }[];
};

export type TvPlatform = {
  readIdentity?: (api: string) => string | null;
  saveIdentity?: (api: string, secret: string) => void;
  exit: () => void;
  subscribeLifecycle: (listener: (event: string) => void) => () => void;
};
