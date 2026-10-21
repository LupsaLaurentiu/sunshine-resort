import { copyFile } from 'node:fs/promises';
import sharp from 'sharp';

await copyFile('webos/appinfo.json', 'dist/appinfo.json');
await copyFile('node_modules/@fontsource-variable/montserrat/LICENSE', 'dist/Montserrat-OFL.txt');
// The same white rendition as the in-app logo, preserving the original alpha.
const { data, info } = await sharp('public/logo-sunshine.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let pixel = 0; pixel < data.length; pixel += 4) {
  data[pixel] = 245; data[pixel + 1] = 242; data[pixel + 2] = 235;
}
for (const [name, size] of [['icon.png', 80], ['largeIcon.png', 130]]) {
  const inset = Math.round(size * .06);
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim().resize(size - inset * 2, size - inset * 2, { fit: 'contain', background: '#080908' })
    .flatten({ background: '#080908' }).extend({ top: inset, bottom: inset, left: inset, right: inset, background: '#080908' })
    .png().toFile(`dist/${name}`);
}
console.info('webOS manifest and Sunshine Resort launcher icons prepared in dist/');
