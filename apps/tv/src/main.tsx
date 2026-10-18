import { createRoot } from 'react-dom/client';
import { ConnectedWelcome } from './shared/ConnectedWelcome';
import { ReservationWelcome } from './shared/ReservationWelcome';
import { webosPlatform } from './platform/webos';
import './style.css';

const api = import.meta.env.VITE_TV_API_URL;
createRoot(document.getElementById('root')!).render(api
  ? <ReservationWelcome api={api} platform={webosPlatform} />
  : <ConnectedWelcome url={import.meta.env.VITE_TV_DEMO_CONTENT_URL ?? ''} platform={webosPlatform} />);
