import { useEffect, useState } from 'react';
import type { TvPlatform } from './contracts';
import { WelcomeApp } from './WelcomeApp';
import { loadDemoContent, standardContent } from './demo-api';

export function ConnectedWelcome({ platform, url }: { platform: TvPlatform; url: string }) {
  const [content, setContent] = useState(standardContent);
  const [status, setStatus] = useState('Connecting');
  useEffect(() => {
    let stopped = false;
    let request: AbortController | null = null;
    let poll: number | undefined;
    let expiry: number | undefined;
    const reset = () => { clearTimeout(expiry); setContent(standardContent); };
    const refresh = async () => {
      if (stopped || request || document.hidden) return;
      clearTimeout(poll);
      if (!url) { reset(); setStatus('API not configured'); return; }
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      try {
        const next = await loadDemoContent(url, controller.signal);
        if (stopped || document.hidden) return;
        setContent(next); setStatus('API connected');
        clearTimeout(expiry);
        expiry = window.setTimeout(() => { reset(); setStatus('Connection expired'); }, 45000);
      } catch {
        if (!stopped) { reset(); setStatus('API unavailable · retrying'); }
      } finally {
        clearTimeout(timeout);
        request = null;
        if (!stopped && !document.hidden) poll = window.setTimeout(refresh, 30000);
      }
    };
    const unsubscribe = platform.subscribeLifecycle(name => {
      reset();
      if (name === 'hidden') { clearTimeout(poll); request?.abort(); }
      else { setStatus('Connecting'); void refresh(); }
    });
    const online = () => { void refresh(); };
    const offline = () => { reset(); setStatus('Offline · retrying'); request?.abort(); };
    window.addEventListener('online', online); window.addEventListener('offline', offline);
    void refresh();
    return () => { stopped = true; request?.abort(); clearTimeout(poll); clearTimeout(expiry); unsubscribe(); window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, [url, platform]);
  return <WelcomeApp content={content} platform={platform} connectionStatus={status} />;
}
