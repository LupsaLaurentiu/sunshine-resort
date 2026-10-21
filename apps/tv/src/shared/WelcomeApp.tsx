import { useEffect, useRef, useState } from 'react';
import type { TvPlatform, WelcomeContent } from './contracts';
import { paginateText } from './resort-information';

type Category = 'wifi' | 'houseRules' | 'facilities' | 'attractions' | 'usefulInfo' | 'contact';
const categories: Category[] = ['wifi', 'facilities', 'houseRules', 'attractions', 'usefulInfo', 'contact'];
const translations = {
  ro: {
    eyebrow: 'UN SEJUR DOAR AL TĂU', welcome: 'Bine ai venit,', standard: 'Bine ai venit la',
    explore: 'Descoperă resortul', exit: 'Înapoi la televizor', back: 'Înapoi la întâmpinare',
    info: 'Totul pentru sejurul tău.', infoEyebrow: 'DETALII CARE FAC DIFERENȚA',
    wifi: 'Wi-Fi', facilities: 'Facilități', houseRules: 'Regulile casei', attractions: 'Atracții turistice', usefulInfo: 'Informații utile', contact: 'Contact',
    network: 'Numele rețelei', password: 'Parolă', missing: 'Informațiile vor fi disponibile în curând.',
    wifiMissing: 'Datele de conectare nu au fost încă publicate.',
    previous: 'Pagina anterioară', next: 'Pagina următoare', page: 'Pagina',
    keys: 'Săgeți · Navigare     OK · Selectare     Back · Înapoi     Home · Meniul TV',
    checkout: 'Check-out până la 10:00', pairing: 'Cod de asociere TV', pairingHint: 'Introdu codul în PMS → Camere, în cardul apartamentului. Valabil 10 minute.',
    exitTitle: 'Închizi Sunshine Welcome?', exitHint: 'Poți continua cu televiziunea și aplicațiile tale preferate.', stay: 'Rămân aici', close: 'Închide aplicația',
    offline: 'Conexiune indisponibilă · reîncercăm automat',
  },
  en: {
    eyebrow: 'A STAY TO CALL YOUR OWN', welcome: 'Welcome,', standard: 'Welcome to',
    explore: 'Explore the resort', exit: 'Back to your television', back: 'Back to welcome',
    info: 'Your stay, considered.', infoEyebrow: 'THOUGHTFUL DETAILS, BETTER STAYS',
    wifi: 'Wi-Fi', facilities: 'Facilities', houseRules: 'House rules', attractions: 'Local discoveries', usefulInfo: 'Useful information', contact: 'Contact',
    network: 'Network name', password: 'Password', missing: 'Information will be available soon.',
    wifiMissing: 'Connection details have not been published yet.',
    previous: 'Previous page', next: 'Next page', page: 'Page',
    keys: 'Arrows · Navigate     OK · Select     Back · Return     Home · TV launcher',
    checkout: 'Check-out by 10:00', pairing: 'TV pairing code', pairingHint: 'Enter the code in PMS → Camere, on the apartment card. Valid for 10 minutes.',
    exitTitle: 'Leave Sunshine Welcome?', exitHint: 'Continue with your television and favourite applications.', stay: 'Stay here', close: 'Exit application',
    offline: 'Connection unavailable · retrying automatically',
  },
};

export function WelcomeApp({ content, platform, connectionStatus, pairingCode }: { content: WelcomeContent; platform: TvPlatform; connectionStatus?: string; pairingCode?: string }) {
  const [screen, setScreen] = useState<'welcome' | 'information'>('welcome');
  const [language, setLanguage] = useState<'ro' | 'en'>('ro');
  const [category, setCategory] = useState<Category>('wifi');
  const [page, setPage] = useState(0);
  const [exitRequested, setExitRequested] = useState(false);
  const [clock, setClock] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const t = translations[language];
  const resort = content.resortInformation;
  const localized = resort?.[language];
  const pages = paginateText(category === 'wifi' ? '' : localized?.[category] ?? content.information.map(item => `${item.title}\n${item.text}`).join('\n\n'));
  const activePage = Math.min(page, Math.max(0, pages.length - 1));
  const offline = connectionStatus === 'Offline' || /unavailable|expired/i.test(connectionStatus ?? '');

  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' }).format(new Date()));
    update(); const timer = window.setInterval(update, 10000);
    const unsubscribe = platform.subscribeLifecycle(name => {
      console.info('[Sunshine lifecycle]', name);
      if (name !== 'hidden') { update(); root.current?.querySelector<HTMLButtonElement>('[role="dialog"] button, [data-initial]')?.focus(); }
    });
    return () => { clearInterval(timer); unsubscribe(); };
  }, [platform]);

  useEffect(() => {
    root.current?.querySelector<HTMLButtonElement>(exitRequested ? '[role="dialog"] button' : '[data-initial]')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'GoBack' || event.keyCode === 461) {
        event.preventDefault();
        if (exitRequested) setExitRequested(false);
        else if (screen === 'information') setScreen('welcome');
        else setExitRequested(true);
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>(exitRequested ? '[role="dialog"] button:not(:disabled)' : 'button:not(:disabled)') ?? []);
      const current = document.activeElement as HTMLElement;
      if (!buttons.includes(current as HTMLButtonElement)) { buttons[0]?.focus(); return; }
      const box = current.getBoundingClientRect();
      const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
      const sign = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
      const ranked = buttons.filter(button => button !== current).map(button => {
        const next = button.getBoundingClientRect();
        const dx = (next.left + next.width / 2) - (box.left + box.width / 2);
        const dy = (next.top + next.height / 2) - (box.top + box.height / 2);
        return { button, forward: (horizontal ? dx : dy) * sign, cross: Math.abs(horizontal ? dy : dx) };
      }).filter(candidate => candidate.forward > 8).sort((a, b) => (a.forward + a.cross * 3) - (b.forward + b.cross * 3));
      ranked[0]?.button.focus();
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [screen, platform, exitRequested]);

  return <div className="tv-shell" ref={root} lang={language}>
    <header className="topbar">
      <div className="brand"><img className="brand-logo" src="./logo-sunshine.png" alt="Sunshine Resort" /><div>{content.resortName}<small>ADULTS ONLY · MARAMUREȘ</small></div></div>
      <div className="header-actions"><button className="language-button" onClick={() => setLanguage(value => value === 'ro' ? 'en' : 'ro')} aria-label={language === 'ro' ? 'Switch to English' : 'Schimbă în română'}><span className={language === 'ro' ? 'selected-language' : ''}>RO</span><span className="language-divider">/</span><span className={language === 'en' ? 'selected-language' : ''}>EN</span></button><time>{clock}<small>BUCHAREST</small></time></div>
    </header>
    <main>
      {screen === 'welcome' ? <section className="welcome">
        <div className="welcome-copy"><p className="eyebrow">{t.eyebrow}</p><h1>{content.guest ? <>{t.welcome}<br /><span>{content.guest.displayName}</span></> : <>{t.standard}<br /><span>Sunshine Resort</span></>}</h1><div className="gold-line" /><p className="tagline">{localized?.tagline || (language === 'ro' ? 'Refugiul tău privat, în inima Maramureșului.' : content.tagline)}</p>
        {pairingCode && <div className="pairing" role="status"><small>{t.pairing}</small><strong>{pairingCode}</strong><p>{t.pairingHint}</p></div>}
        <nav className="welcome-actions"><button data-initial onClick={() => setScreen('information')}>{t.explore}<span aria-hidden="true">↗</span></button><button className="secondary" onClick={() => setExitRequested(true)}>{t.exit}</button></nav></div>
        <div className="welcome-emblem" aria-hidden="true"><div className="emblem-orbit" /><img src="./logo-sunshine.png" alt="" /><p>PRIVATE STAYS<br /><span>EXCEPTIONAL MOMENTS</span></p></div>
      </section> : <section className="information">
        <div className="information-heading"><div><p className="eyebrow">{t.infoEyebrow}</p><h1>{t.info}</h1></div><button className="secondary back-button" onClick={() => setScreen('welcome')}>← {t.back}</button></div>
        <div className="information-layout"><nav className="section-menu" aria-label={language === 'ro' ? 'Informații resort' : 'Resort information'}>{categories.map((key, index) => <button key={key} data-initial={category === key ? true : undefined} aria-pressed={category === key} className={category === key ? 'active' : ''} onClick={() => { setCategory(key); setPage(0); }}><span className="menu-number">0{index + 1}</span>{t[key]}<span className="menu-arrow" aria-hidden="true">↗</span></button>)}</nav>
          <article className="information-panel"><p className="eyebrow">SUNSHINE RESORT</p><h2>{t[category]}</h2>
            {category === 'wifi' ? <div className="wifi-details">{resort?.wifi.ssid ? <><p className="field-label">{t.network}</p><p className="wifi-network">{resort.wifi.ssid}</p><p className="field-label">{t.password}</p><p className="wifi-password">{resort.wifi.password || '—'}</p></> : <p className="empty-copy">{t.wifiMissing}</p>}</div> : <p className="information-copy">{pages[activePage] || t.missing}</p>}
            {category !== 'wifi' && pages.length > 1 && <div className="pagination"><span>{t.page} {activePage + 1} / {pages.length}</span><div><button className="secondary" disabled={activePage === 0} onClick={() => setPage(activePage - 1)} aria-label={t.previous}>←</button><button className="secondary" disabled={activePage >= pages.length - 1} onClick={() => setPage(activePage + 1)} aria-label={t.next}>→</button></div></div>}
          </article>
        </div>
      </section>}
    </main>
    <footer><span>{t.keys}</span><span className={offline ? 'offline-note' : ''}>{offline ? t.offline : t.checkout}</span></footer>
    {exitRequested && <div className="overlay"><section role="dialog" aria-modal="true" aria-labelledby="exit-title"><p className="eyebrow">SUNSHINE RESORT</p><h2 id="exit-title">{t.exitTitle}</h2><p>{t.exitHint}</p><nav><button onClick={() => setExitRequested(false)}>{t.stay}</button><button className="secondary" onClick={platform.exit}>{t.close}</button></nav></section></div>}
  </div>;
}
