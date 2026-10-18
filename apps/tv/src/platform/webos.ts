import type { TvPlatform } from '../shared/contracts';

export const webosPlatform: TvPlatform = {
  readIdentity(api) {
    return localStorage.getItem(`sunshine.tv.identity:${new URL(api).origin}`);
  },
  saveIdentity(api, secret) {
    // App-origin storage contains only a revocable credential, never guest data.
    localStorage.setItem(`sunshine.tv.identity:${new URL(api).origin}`, secret);
  },
  exit() {
    // LG-supported close after the shared UI's custom exit confirmation.
    window.close();
  },
  subscribeLifecycle(listener) {
    const visibility = () => listener(document.hidden ? 'hidden' : 'visible');
    const relaunch = () => listener('webOSRelaunch');
    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('webOSRelaunch', relaunch);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('webOSRelaunch', relaunch);
    };
  },
};
