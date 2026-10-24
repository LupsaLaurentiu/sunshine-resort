import { mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';
await mkdir('public', { recursive: true });
// Keep the website's canonical asset for platform icons.
await copyFile('../web/public/logo-sunshine.png', 'public/logo-sunshine.png');
// Prepare the same artwork for the small, light-on-dark TV header. Expanding
// the white mask slightly keeps fine strokes visible after downsampling.
// libvips morphology treats black as foreground, so erode expands white here.
const alpha = await sharp('public/logo-sunshine.png').ensureAlpha()
  .extractChannel('alpha').png().toBuffer();
const { data: mask, info } = await sharp(alpha).erode(2)
  .toColourspace('b-w').raw().toBuffer({ resolveWithObject: true });
const lightLogo = Buffer.alloc(info.width * info.height * 4, 255);
for (let pixel = 0; pixel < info.width * info.height; pixel++) {
  lightLogo[pixel * 4 + 3] = mask[pixel * info.channels];
}
await sharp(lightLogo, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim().resize({ height: 512, kernel: 'lanczos3' })
  .png().toFile('public/logo-sunshine-tv.png');
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
