// Existing resort website photographs. Captions describe the actual images;
// they do not imply these are photographs of specific monuments.
export const GALLERY_SLIDE_MS = 8000;
export type GallerySlide = { image: string; ro: { title: string; description: string; alt: string }; en: { title: string; description: string; alt: string } };
export const resortSlides: readonly GallerySlide[] = [
  { image: './resort/deluxe.jpg',
    ro: { title: 'Un spațiu doar al tău', description: 'Confort, lumină și detalii care te invită să încetinești.', alt: 'Dormitor din galeria de apartamente a resortului' },
    en: { title: 'A space to call your own', description: 'Comfort, light and thoughtful details that invite you to slow down.', alt: 'Bedroom from the resort apartment gallery' } },
  { image: './resort/pool.jpg',
    ro: { title: 'Momente de relaxare', description: 'Timp pentru tine, în propriul tău ritm.', alt: 'Piscină din galeria resortului' },
    en: { title: 'Moments of relaxation', description: 'Time for yourself, at your own pace.', alt: 'Swimming pool from the resort gallery' } },
  { image: './resort/premium.jpg',
    ro: { title: 'Detalii care fac diferența', description: 'Descoperă interioarele din galeria Sunshine Resort.', alt: 'Interior luminos din galeria de apartamente' },
    en: { title: 'Details that make a difference', description: 'Discover the interiors in the Sunshine Resort gallery.', alt: 'Bright interior from the apartment gallery' } },
  { image: './resort/intimate.jpg',
    ro: { title: 'Bucură-te de sejur', description: 'Un refugiu pentru zile fără grabă.', alt: 'Cameră din galeria de apartamente Intimate' },
    en: { title: 'Make yourself at home', description: 'A retreat for unhurried days.', alt: 'Room from the Intimate apartment gallery' } },
];
export const attractionSlides = [
  { image: './attractions/maramures-1.jpg',
    ro: { title: 'În ritmul naturii', description: 'Dealuri, liniște și plimbări fără grabă în Maramureș.', alt: 'Cal pe un deal verde, la apus' },
    en: { title: 'At nature’s pace', description: 'Rolling hills, peaceful moments and unhurried walks in Maramureș.', alt: 'Horse on a green hillside at sunset' } },
  { image: './attractions/maramures-2.jpg',
    ro: { title: 'Sate cu poveste', description: 'Arhitectură din lemn și farmecul satelor tradiționale.', alt: 'Casă tradițională din lemn, sub cerul de seară' },
    en: { title: 'Villages with a story', description: 'Wooden architecture and the charm of traditional villages.', alt: 'Traditional wooden house beneath an evening sky' } },
  { image: './attractions/maramures-3.jpg',
    ro: { title: 'Orizonturi de descoperit', description: 'Peisaje și drumuri panoramice, în propriul tău ritm.', alt: 'Lumina apusului peste dealuri împădurite' },
    en: { title: 'Horizons to discover', description: 'Landscapes and scenic roads to explore at your own pace.', alt: 'Sunset over wooded hills' } },
  { image: './attractions/maramures-4.jpg',
    ro: { title: 'Tradiții vii', description: 'Port popular, dans și bucuria întâlnirilor din Maramureș.', alt: 'Oameni în port popular la un dans tradițional' },
    en: { title: 'Living traditions', description: 'Traditional dress, dancing and the joy of gathering in Maramureș.', alt: 'People in traditional dress dancing together' } },
] as const;
