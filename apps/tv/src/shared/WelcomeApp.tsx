import { useEffect, useRef, useState } from 'react';
import type { TvPlatform, WelcomeContent } from './contracts';

export function WelcomeApp({ content, platform, connectionStatus, pairingCode }: { content: WelcomeContent; platform: TvPlatform; connectionStatus?: string; pairingCode?: string }) {
  const [screen, setScreen] = useState<'welcome' | 'information'>('welcome');
  const [exitRequested, setExitRequested] = useState(false);
  const [event, setEvent] = useState('launched');
  const [clock, setClock] = useState('');
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit',
    }).format(new Date()));
    update();
    const timer = window.setInterval(update, 10000);
    const unsubscribe = platform.subscribeLifecycle((name) => {
      console.info('[Sunshine lifecycle]', name, new Date().toISOString());
      setEvent(name);
      if (name !== 'hidden') { update(); root.current?.querySelector<HTMLButtonElement>('button')?.focus(); }
    });
    console.info('[Sunshine lifecycle] mounted', new Date().toISOString());
    return () => { clearInterval(timer); unsubscribe(); };
  }, [platform]);

  useEffect(() => {
    root.current?.querySelector<HTMLButtonElement>(exitRequested ? '[role="dialog"] button' : 'button')?.focus();
    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'GoBack' || e.keyCode === 461) {
        e.preventDefault();
        if (exitRequested) setExitRequested(false);
        else if (screen === 'information') setScreen('welcome');
        else setExitRequested(true);
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>(exitRequested ? '[role="dialog"] button' : 'button') ?? []);
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const delta = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
      buttons[Math.max(0, Math.min(buttons.length - 1, index + delta))]?.focus();
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [screen, platform, exitRequested]);

  return <div className="tv-shell" ref={root}>
    <header><div className="brand"><span className="sun">☼</span>{content.resortName}<small>PRIVATE STAYS · EXCEPTIONAL MOMENTS</small></div><time>{clock}<small>BUCHAREST</small></time></header>
    <main>
      {screen === 'welcome' ? <section className="welcome">
        <p className="eyebrow">A STAY TO CALL YOUR OWN</p>
        <h1>{content.guest ? <>Welcome,<br /><span>{content.guest.displayName}</span></> : <>Welcome to<br /><span>Sunshine Resort</span></>}</h1>
        <div className="gold-line" />
        <p className="tagline">{content.tagline}</p>
        {pairingCode && <p className="pairing" role="status">TV pairing code: <strong>{pairingCode}</strong><br /><small>Enter this code in PMS → Televizoare. Valid for 10 minutes.</small></p>}
        <nav><button onClick={() => setScreen('information')}>Explore the resort <span>→</span></button><button className="secondary" onClick={() => setExitRequested(true)}>Exit welcome</button></nav>
      </section> : <section className="information">
        <p className="eyebrow">MAKE YOURSELF AT HOME</p><h1>Your stay, considered.</h1>
        <div className="cards">{content.information.map((item, index) => <article key={item.title}><span className="number">0{index + 1}</span><h2>{item.title}</h2><p>{item.text}</p></article>)}</div>
        <button onClick={() => setScreen('welcome')}>← Back to welcome</button>
      </section>}
    </main>
    <footer><span>↑ ↓ ← → Navigate · OK Select · Back Return / Exit · Home TV launcher</span><span>{content.mode === 'MOCK' ? 'DEMO · ' : ''}{connectionStatus ?? 'MOCK GUEST'} · {event}</span></footer>
    {exitRequested && <div className="overlay"><section role="dialog" aria-modal="true" aria-labelledby="exit-title"><h2 id="exit-title">Leave Sunshine Welcome?</h2><p>Return to your television and other applications.</p><nav><button onClick={() => setExitRequested(false)}>Stay here</button><button onClick={platform.exit}>Exit application</button></nav></section></div>}
  </div>;
}
