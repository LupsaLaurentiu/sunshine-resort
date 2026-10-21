import { useEffect, useState } from 'react';
import { GALLERY_SLIDE_MS, attractionSlides, resortSlides } from './gallery-slides';
import { paginateText } from './resort-information';
import { ArrowIcon } from './ActionIcons';

export function PhotoCarousel({ language, paused, recommendations = '', gallery }: { language: 'ro' | 'en'; paused: boolean; recommendations?: string; gallery: 'resort' | 'attractions' }) {
  const slides = gallery === 'resort' ? resortSlides : attractionSlides;
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(!document.hidden);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [page, setPage] = useState(0);
  const [failedImages, setFailedImages] = useState<number[]>([]);
  const ro = language === 'ro';
  const playing = !reducedMotion && visible && !paused && !showRecommendations;
  const copy = slides[index][language];
  const pages = paginateText(recommendations);
  const activePage = Math.min(page, Math.max(0, pages.length - 1));

  useEffect(() => {
    const visibility = () => setVisible(!document.hidden);
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motionPreference = () => setReducedMotion(media.matches);
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', motionPreference);
    // webOS can become visible between the initial render and effect setup.
    visibility();
    motionPreference();
    return () => { document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', motionPreference); };
  }, []);

  return <div className={`photo-carousel photo-carousel--${gallery}`} role="region" aria-roledescription={ro ? 'carusel' : 'carousel'} aria-label={gallery === 'resort' ? (ro ? 'Fotografii cu resortul și camerele' : 'Resort and room photographs') : (ro ? 'Fotografii din Maramureș' : 'Photographs of Maramureș')} data-slide={index} data-playing={playing}>
    <div className="attraction-stage" aria-live="off">
      {slides.map((slide, slideIndex) => <div className={`attraction-frame${slideIndex === index ? ' is-active' : ''}`} key={slide.image} aria-hidden={slideIndex !== index}>
        {!failedImages.includes(slideIndex) && <img src={slide.image} alt={slide[language].alt} onError={() => setFailedImages(current => [...current, slideIndex])} />}
      </div>)}
      <div className="attraction-shade" />
      {failedImages.includes(index) && <p className="attraction-image-missing">{ro ? 'Imagine indisponibilă' : 'Image unavailable'}</p>}
      {!showRecommendations && <div className="attraction-caption" key={`${index}-${language}`}><p className="eyebrow">{gallery === 'resort' ? 'SUNSHINE RESORT' : 'MARAMUREȘ'} · {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</p><h2>{copy.title}</h2><p>{copy.description}</p></div>}
      <div className="carousel-progress" aria-hidden="true"><span className="carousel-progress-fill" style={{ animationDuration: `${GALLERY_SLIDE_MS}ms`, animationPlayState: playing ? 'running' : 'paused' }} onAnimationIteration={event => {
        if (event.animationName === 'gallery-progress' && playing) setIndex(current => (current + 1) % slides.length);
      }} /></div>
    </div>
    {showRecommendations && <div className="attraction-recommendations">
      <p className="eyebrow">{ro ? 'DESCOPERĂ ÎMPREJURIMILE' : 'EXPLORE THE SURROUNDINGS'}</p>
      <h2>{ro ? 'Recomandări pentru tine' : 'Recommended for you'}</h2>
      <p className="information-copy" key={`${language}-${activePage}`}>{pages[activePage] || (ro ? 'Recomandările vor fi disponibile în curând.' : 'Recommendations will be available soon.')}</p>
      {pages.length > 1 && <div className="pagination"><span>{ro ? 'Pagina' : 'Page'} {activePage + 1} / {pages.length}</span><div><button className="secondary" disabled={activePage === 0} onClick={() => setPage(activePage - 1)} aria-label={ro ? 'Pagina anterioară' : 'Previous page'}><ArrowIcon direction="left" /></button><button className="secondary" disabled={activePage >= pages.length - 1} onClick={() => setPage(activePage + 1)} aria-label={ro ? 'Pagina următoare' : 'Next page'}><ArrowIcon /></button></div></div>}
    </div>}
    {gallery === 'attractions' && <div className="gallery-actions"><button className="secondary recommendations-toggle action-button" aria-pressed={showRecommendations} onClick={() => setShowRecommendations(value => !value)}>{showRecommendations && <ArrowIcon direction="left" />}<span>{showRecommendations ? (ro ? 'Galerie foto' : 'Photo gallery') : (ro ? 'Recomandări' : 'Recommendations')}</span>{!showRecommendations && <ArrowIcon />}</button></div>}
  </div>;
}
