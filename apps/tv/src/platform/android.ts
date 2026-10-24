import type { TvPlatform } from '../shared/contracts';
import { webosPlatform } from './webos.ts';

declare global {
  interface Window {
    SunshineAndroid?: { closeApp: () => void };
  }
}

export const androidPlatform: TvPlatform = {
  readIdentity: webosPlatform.readIdentity,
  saveIdentity: webosPlatform.saveIdentity,
  exit() { window.SunshineAndroid?.closeApp(); },
  subscribeLifecycle(listener) {
    const visibility = () => listener(document.hidden ? 'hidden' : 'visible');
    const native = (event: Event) => {
      const state = (event as CustomEvent<string>).detail;
      if (state === 'hidden' || state === 'visible') listener(state);
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('sunshine:android-lifecycle', native);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('sunshine:android-lifecycle', native);
    };
  },
};
