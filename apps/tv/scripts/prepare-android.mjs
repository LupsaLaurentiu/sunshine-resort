import { mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';

const folder = 'android/app/src/main/res/drawable';
await mkdir(folder, { recursive: true });
const { data, info } = await sharp('public/logo-sunshine.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let pixel = 0; pixel < data.length; pixel += 4) {
  data[pixel] = 245; data[pixel + 1] = 242; data[pixel + 2] = 235;
}
const logo = sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).trim();
await logo.clone().resize(160, 160, { fit: 'contain', background: '#080908' })
  .flatten({ background: '#080908' }).extend({ top: 16, bottom: 16, left: 16, right: 16, background: '#080908' })
  .png().toFile(`${folder}/launcher.png`);
const mark = await logo.clone().resize(76, 116, { fit: 'inside' }).png().toBuffer();
const title = Buffer.from('<svg width="320" height="180"><text x="170" y="85" text-anchor="middle" fill="#ead09a" font-family="sans-serif" font-size="17" letter-spacing="2">SUNSHINE</text><text x="170" y="108" text-anchor="middle" fill="#f5f2eb" font-family="sans-serif" font-size="12" letter-spacing="4">RESORT</text></svg>');
await sharp({ create: { width: 320, height: 180, channels: 4, background: '#080908' } })
  .composite([{ input: mark, left: 18, top: 32 }, { input: title }]).png().toFile(`${folder}/banner.png`);
await copyFile('node_modules/@fontsource-variable/montserrat/LICENSE', 'dist-android/Montserrat-OFL.txt');
console.info('Android TV logo, launcher banner and font license prepared.');
