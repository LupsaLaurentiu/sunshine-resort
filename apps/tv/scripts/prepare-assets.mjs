import { mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';
await mkdir('public', { recursive: true });
// Reuse the website's canonical asset. No replacement or generated logo.
await copyFile('../web/public/logo-sunshine.png', 'public/logo-sunshine.png');
await mkdir('public/attractions', { recursive: true });
for (const index of [1, 2, 3, 4]) {
  await sharp(`../web/public/images/ogna-sugatag-${index}.png`)
    .resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 86 })
    .toFile(`public/attractions/maramures-${index}.jpg`);
}
await mkdir('public/resort', { recursive: true });
for (const [name, source] of Object.entries({ deluxe: 'room-deluxe-1.jpg', pool: 'pool-gallery-1.jpg', premium: 'room-premium-1.jpg', intimate: 'room-intimate-1.jpg' })) {
  await sharp(`../web/public/images/${source}`)
    .resize({ width: 1920, withoutEnlargement: true }).jpeg({ quality: 86 })
    .toFile(`public/resort/${name}.jpg`);
}
