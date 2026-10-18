import { useEffect, useState } from 'react';
import type { TvPlatform } from './contracts';
import { standardContent } from './demo-api';
import { newTvIdentity, parseReservationContent, validateTvApi } from './reservation-api';
import { WelcomeApp } from './WelcomeApp';

export function ReservationWelcome({ platform, api }: { platform: TvPlatform; api: string }) {
  const [content, setContent] = useState(standardContent);
  const [status, setStatus] = useState('Connecting');
  const [pairingCode, setPairingCode] = useState('');
  useEffect(() => {
    let stopped = false;
    let request: AbortController | null = null;
    let timer: number | undefined, expiry: number | undefined;
    let pendingPairingUntil = 0, secret = '', base = '';
    const clear = () => { clearTimeout(expiry); setContent(standardContent); };
    try {
      base = validateTvApi(api);
      if (!platform.readIdentity || !platform.saveIdentity) throw new Error('Storage unavailable');
      secret = platform.readIdentity(base) ?? '';
      if (!/^[a-f0-9]{64}$/.test(secret)) { secret = newTvIdentity(); platform.saveIdentity(base, secret); }
    } catch { setStatus('Secure API or device storage unavailable'); return; }

    const refresh = async () => {
      if (stopped || request || document.hidden) return;
      clearTimeout(timer);
      const controller = new AbortController(); request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      const started = performance.now();
      try {
        const response = await fetch(`${base}/tv/me/content`, { signal: controller.signal, credentials: 'omit', cache: 'no-store', headers: { Authorization: `Bearer ${secret}` } });
        if (stopped || controller.signal.aborted || document.hidden) return;
        if (response.status === 401) {
          clear();
          const reason = await response.json();
          if (reason.code === 'TV_DISABLED') { setStatus('Apartment disabled · contact administrator'); return; }
          if (Date.now() >= pendingPairingUntil) {
            if (reason.code === 'TV_REVOKED') { secret = newTvIdentity(); platform.saveIdentity!(base, secret); }
            const registration = await fetch(`${base}/tv/pairing`, { method: 'POST', credentials: 'omit', cache: 'no-store', signal: controller.signal,
              headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret }) });
            if (!registration.ok) throw new Error('Pairing unavailable');
            const pair = await registration.json();
            if (!/^[A-F0-9]{8}$/.test(pair.code)) throw new Error('Invalid pairing response');
            if (stopped || controller.signal.aborted || document.hidden) return;
            pendingPairingUntil = Date.now() + 9 * 60_000; setPairingCode(pair.code);
          }
          setStatus('Waiting for administrator approval'); return;
        }
        if (!response.ok) throw new Error('TV API unavailable');
        const parsed = parseReservationContent(await response.json());
        const remaining = parsed.leaseMs - (performance.now() - started);
        if (stopped || controller.signal.aborted || document.hidden || remaining <= 0) return;
        pendingPairingUntil = 0; setPairingCode('');
        setContent(parsed.content); setStatus('Reservation API connected');
        clearTimeout(expiry);
        expiry = window.setTimeout(() => { clear(); setStatus('Refreshing welcome'); }, remaining);
      } catch { if (!stopped) { clear(); setStatus('Connection unavailable · retrying'); } }
      finally {
        clearTimeout(timeout); request = null;
        if (!stopped && !document.hidden) timer = window.setTimeout(refresh, pendingPairingUntil ? 5000 : 30000);
      }
    };
    const unsubscribe = platform.subscribeLifecycle(event => {
      clear(); clearTimeout(timer);
      if (event === 'hidden') request?.abort(); else void refresh();
    });
    const offline = () => { clear(); setStatus('Offline'); request?.abort(); };
    const online = () => { void refresh(); };
    window.addEventListener('offline', offline); window.addEventListener('online', online);
    void refresh();
    return () => { stopped = true; request?.abort(); clearTimeout(timer); clearTimeout(expiry); unsubscribe(); window.removeEventListener('offline', offline); window.removeEventListener('online', online); };
  }, [api, platform]);
  return <WelcomeApp content={content} platform={platform} connectionStatus={status} pairingCode={pairingCode} />;
}
