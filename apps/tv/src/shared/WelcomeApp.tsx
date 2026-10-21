import { useEffect, useRef, useState } from 'react';
import type { TvPlatform, WelcomeContent } from './contracts';
import { paginateText } from './resort-information';
import { PhotoCarousel } from './PhotoCarousel';
import { ArrowIcon, TvIcon } from './ActionIcons';

const sections = ['welcome', 'attractions', 'wifi', 'houseRules', 'facilities', 'usefulInfo', 'contact'] as const;
type Section = typeof sections[number];
const translations = {
  ro: {
    eyebrow: 'UN SEJUR DOAR AL TĂU', welcomeHeading: 'Bine ai venit,', standard: 'Bine ai venit la',
    welcome: 'Acasă', explore: 'Descoperă Maramureșul', exit: 'Înapoi la televizor', navigation: 'Secțiunile resortului',
    infoEyebrow: 'DETALII CARE FAC DIFERENȚA',
    wifi: 'Wi-Fi', facilities: 'Facilități', houseRules: 'Regulile casei', attractions: 'Atracții turistice', usefulInfo: 'Informații utile', contact: 'Contact',
    network: 'Numele rețelei', password: 'Parolă', missing: 'Informațiile vor fi disponibile în curând.',
    wifiMissing: 'Datele de conectare nu au fost încă publicate.',
    previous: 'Pagina anterioară', next: 'Pagina următoare', page: 'Pagina',
    keys: 'Meniu: ↑ ↓     Limbă din meniu: →     OK · Selectare     Back · Înapoi     Home · Meniul TV',
    checkout: 'Check-out până la 10:00', pairing: 'Cod de asociere TV', pairingHint: 'Introdu codul în PMS → Camere, în cardul apartamentului. Valabil 10 minute.',
    exitTitle: 'Înapoi la televizor?', exitHint: 'Continuă cu televiziunea sau aplicațiile tale preferate.', stay: 'Rămân aici', close: 'Închide aplicația',
    exitSelect: 'pentru alegere', exitBack: 'pentru revenire',
    offline: 'Conexiune indisponibilă · reîncercăm automat',
  },
  en: {
    eyebrow: 'A STAY TO CALL YOUR OWN', welcomeHeading: 'Welcome,', standard: 'Welcome to',
    welcome: 'Home', explore: 'Explore Maramureș', exit: 'Back to your television', navigation: 'Resort sections',
    infoEyebrow: 'THOUGHTFUL DETAILS, BETTER STAYS',
    wifi: 'Wi-Fi', facilities: 'Facilities', houseRules: 'House rules', attractions: 'Local discoveries', usefulInfo: 'Useful information', contact: 'Contact',
    network: 'Network name', password: 'Password', missing: 'Information will be available soon.',
    wifiMissing: 'Connection details have not been published yet.',
    previous: 'Previous page', next: 'Next page', page: 'Page',
    keys: 'Menu: ↑ ↓     Language from menu: →     OK · Select     Back · Return     Home · TV launcher',
    checkout: 'Check-out by 10:00', pairing: 'TV pairing code', pairingHint: 'Enter the code in PMS → Camere, on the apartment card. Valid for 10 minutes.',
    exitTitle: 'Back to your television?', exitHint: 'Continue with your television or favourite applications.', stay: 'Stay here', close: 'Exit application',
    exitSelect: 'to select', exitBack: 'to return',
    offline: 'Connection unavailable · retrying automatically',
  },
};

export function WelcomeApp({ content, platform, connectionStatus, pairingCode }: { content: WelcomeContent; platform: TvPlatform; connectionStatus?: string; pairingCode?: string }) {
  const [section, setSection] = useState<Section>('welcome');
  const [language, setLanguage] = useState<'ro' | 'en'>('ro');
  const [page, setPage] = useState(0);
  const [exitRequested, setExitRequested] = useState(false);
  const [clock, setClock] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const lastSidebarSection = useRef<Section>('welcome');
  const t = translations[language];
  const resort = content.resortInformation;
  const localized = resort?.[language];
  const isGallery = section === 'welcome' || section === 'attractions';
  const text = section !== 'welcome' && section !== 'wifi' ? localized?.[section] ?? content.information.map(item => `${item.title}\n${item.text}`).join('\n\n') : '';
  const pages = paginateText(text);
  const activePage = Math.min(page, Math.max(0, pages.length - 1));
  const offline = connectionStatus === 'Offline' || /unavailable|expired/i.test(connectionStatus ?? '');
  const navigate = (value: Section) => { setSection(value); setPage(0); };

  useEffect(() => {
    const update = () => setClock(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' }).format(new Date()));
    update(); const timer = window.setInterval(update, 10000);
    const unsubscribe = platform.subscribeLifecycle(name => {
      if (name !== 'hidden') {
        update();
        root.current?.querySelector<HTMLButtonElement>('[role="dialog"] button, .section-navigation [aria-current="page"]')?.focus();
      }
    });
    return () => { clearInterval(timer); unsubscribe(); };
  }, [platform]);

  useEffect(() => {
    root.current?.querySelector<HTMLButtonElement>(exitRequested ? '[role="dialog"] button' : `.section-navigation [data-section="${section}"]`)?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'GoBack' || event.keyCode === 461) {
        event.preventDefault();
        if (exitRequested) setExitRequested(false);
        else if (section !== 'welcome') { setSection('welcome'); setPage(0); }
        else setExitRequested(true);
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const current = document.activeElement as HTMLElement;
      // The dialog has a fixed two-button row; no layout measurements are needed.
      if (exitRequested) {
        const buttons = root.current?.querySelectorAll<HTMLButtonElement>('[role="dialog"] button');
        if (!current.matches('[role="dialog"] button')) buttons?.[0]?.focus();
        else if (event.key === 'ArrowLeft') buttons?.[0]?.focus();
        else if (event.key === 'ArrowRight') buttons?.[1]?.focus();
        return;
      }
      // Section items and the language row form an explicit remote-control path.
      if (!exitRequested && current.matches('.section-navigation [data-section]')) {
        const items = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.section-navigation [data-section]') ?? []);
        const position = items.indexOf(current as HTMLButtonElement);
        lastSidebarSection.current = current.dataset.section as Section;
        if (event.key === 'ArrowRight' || (event.key === 'ArrowDown' && position === items.length - 1)) {
          root.current?.querySelector<HTMLButtonElement>('.language-choice[aria-pressed="true"]')?.focus();
          return;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          if (position === 0 && event.key === 'ArrowUp') root.current?.querySelector<HTMLButtonElement>('.exit-button')?.focus();
          else items[position + (event.key === 'ArrowDown' ? 1 : -1)]?.focus();
          return;
        }
      }
      if (!exitRequested && current.matches('.language-choice')) {
        const choices = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.language-choice') ?? []);
        const position = choices.indexOf(current as HTMLButtonElement);
        if (event.key === 'ArrowUp' || (event.key === 'ArrowLeft' && position === 0)) {
          root.current?.querySelector<HTMLButtonElement>(`.section-navigation [data-section="${lastSidebarSection.current}"]`)?.focus();
        } else if (event.key === 'ArrowLeft') choices[position - 1]?.focus();
        else if (event.key === 'ArrowRight') choices[position + 1]?.focus();
        return;
      }
      if (!exitRequested && current.matches('.exit-button') && event.key === 'ArrowDown') {
        root.current?.querySelector<HTMLButtonElement>(`.section-navigation [data-section="${section}"]`)?.focus();
        return;
      }
      const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []).filter(button => !button.closest('.overlay') && button.getClientRects().length > 0);
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
  }, [section, platform, exitRequested]);

  return <div className={`tv-shell${isGallery ? ' tv-shell--gallery' : ''}${exitRequested ? ' tv-shell--dialog' : ''}`} ref={root} lang={language} data-section={section}>
    {isGallery && <PhotoCarousel key={section} gallery={section === 'welcome' ? 'resort' : 'attractions'} language={language} paused={exitRequested} recommendations={localized?.attractions} />}
    <header className="topbar">
      <div className="brand"><img className="brand-logo" src="./logo-sunshine.png" alt="Sunshine Resort" /><div>{content.resortName}<small>ADULTS ONLY · MARAMUREȘ</small></div></div>
      <div className="header-actions"><button className="secondary exit-button" onClick={() => setExitRequested(true)}><TvIcon /><span>{t.exit}</span></button><time>{clock}<small>BUCHAREST</small></time></div>
    </header>
    <nav className="section-navigation" aria-label={t.navigation}>
      <ul>{sections.map(key => <li key={key}><button type="button" data-section={key} aria-current={section === key ? 'page' : undefined} onFocus={() => { lastSidebarSection.current = key; }} onClick={() => navigate(key)}><span className="section-label">{t[key]}</span><span className="section-dot" aria-hidden="true" /></button></li>)}</ul>
      <div className="sidebar-language"><p id="language-label">Limbă / Language</p><div className="language-options" role="group" aria-labelledby="language-label">{(['ro', 'en'] as const).map(value => <button key={value} className="language-choice" data-language={value} type="button" aria-label={value === 'ro' ? 'Română' : 'English'} aria-pressed={language === value} onClick={() => setLanguage(value)}><span className="language-code">{value.toUpperCase()}</span><span className="language-name">{value === 'ro' ? 'Română' : 'English'}</span></button>)}</div></div>
    </nav>
    <main id="resort-main">
      {section === 'welcome' ? <section className="welcome">
        <div className="welcome-copy"><p className="eyebrow">{t.eyebrow}</p><h1 className={content.guest && content.guest.displayName.length > 70 ? 'compact-welcome' : undefined}>{content.guest ? <>{t.welcomeHeading}<br /><span>{content.guest.displayName}</span></> : <>{t.standard}<br /><span>Sunshine Resort</span></>}</h1><div className="gold-line" /><p className="tagline">{localized?.tagline || (language === 'ro' ? 'Refugiul tău privat, în inima Maramureșului.' : content.tagline)}</p>
        {pairingCode && <div className="pairing" role="status"><small>{t.pairing}</small><strong>{pairingCode}</strong><p>{t.pairingHint}</p></div>}
        <div className="welcome-actions"><button className="action-button" onClick={() => navigate('attractions')}><span>{t.explore}</span><ArrowIcon /></button><button className="secondary wifi-shortcut" onClick={() => navigate('wifi')}>{t.wifi}</button></div></div>
      </section> : section === 'attractions' ? <h1 className="visually-hidden">{t.attractions}</h1> : <section className="information-page" aria-labelledby="information-title">
        <div className="information-sheet"><p className="eyebrow">{t.infoEyebrow}</p><h1 id="information-title">{t[section]}</h1><div className="gold-line" />
          {section === 'wifi' ? <div className="wifi-details">{resort?.wifi.ssid ? <><p className="field-label">{t.network}</p><p className="wifi-network">{resort.wifi.ssid}</p><p className="field-label">{t.password}</p><p className="wifi-password">{resort.wifi.password || '—'}</p></> : <p className="empty-copy">{t.wifiMissing}</p>}</div> : <p className="information-copy" key={`${section}-${language}-${activePage}`}>{pages[activePage] || t.missing}</p>}
          {section !== 'wifi' && pages.length > 1 && <div className="pagination"><span>{t.page} {activePage + 1} / {pages.length}</span><div><button className="secondary" disabled={activePage === 0} onClick={() => setPage(activePage - 1)} aria-label={t.previous}><ArrowIcon direction="left" /></button><button className="secondary" disabled={activePage >= pages.length - 1} onClick={() => setPage(activePage + 1)} aria-label={t.next}><ArrowIcon /></button></div></div>}
        </div>
      </section>}
    </main>
    <footer><span>{t.keys}</span><span className={offline ? 'offline-note' : ''}>{offline ? t.offline : t.checkout}</span></footer>
    <div className={`overlay${exitRequested ? ' is-open' : ''}`} inert={!exitRequested} aria-hidden={!exitRequested}><section className="exit-dialog" role={exitRequested ? 'dialog' : undefined} aria-modal={exitRequested ? true : undefined} aria-labelledby="exit-title" aria-describedby="exit-description">
      <div className="exit-dialog-mark" aria-hidden="true"><img src="./logo-sunshine.png" alt="" /></div>
      <p className="eyebrow">SUNSHINE RESORT</p><div className="exit-dialog-divider" />
      <h2 id="exit-title">{t.exitTitle}</h2><p id="exit-description" className="exit-dialog-description">{t.exitHint}</p>
      <div className="exit-dialog-actions"><button className="exit-dialog-stay action-button" onClick={() => setExitRequested(false)}><ArrowIcon direction="left" /><span>{t.stay}</span></button><button className="exit-dialog-leave action-button" onClick={platform.exit}><TvIcon /><span>{t.close}</span></button></div>
      <p className="exit-dialog-help"><span><kbd>OK</kbd> {t.exitSelect}</span><span><kbd>Back</kbd> {t.exitBack}</span></p>
    </section></div>
  </div>;
}
