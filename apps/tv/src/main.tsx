import { createRoot } from 'react-dom/client';
import { ConnectedWelcome } from './shared/ConnectedWelcome';
import { ReservationWelcome } from './shared/ReservationWelcome';
import { webosPlatform } from './platform/webos';
import { androidPlatform } from './platform/android';
import '@fontsource-variable/montserrat/wght.css';
import '@fontsource-variable/montserrat/wght-italic.css';
import './style.css';

const api = import.meta.env.VITE_TV_API_URL;
const platform = typeof window.SunshineAndroid?.closeApp === 'function' ? androidPlatform : webosPlatform;
createRoot(document.getElementById('root')!).render(api
  ? <ReservationWelcome api={api} platform={platform} />
  : <ConnectedWelcome url={import.meta.env.VITE_TV_DEMO_CONTENT_URL ?? ''} platform={platform} />);
