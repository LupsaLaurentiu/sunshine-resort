import { copyFile, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

// Deterministic, dependency-free PNG icons; no remote assets or runtime network.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([size, name, data, crc]);
}
function icon(size) {
  const pixels = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = x - size / 2, dy = y - size / 2;
    const r = Math.hypot(dx, dy);
    const gold = (r > size * .23 && r < size * .27) ||
      (r > size * .34 && r < size * .42 && Math.abs(Math.sin(Math.atan2(dy, dx) * 8)) < .22);
    const at = y * (size * 4 + 1) + 1 + x * 4;
    pixels.set(gold ? [211, 188, 136, 255] : [12, 13, 13, 255], at);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
await copyFile('webos/appinfo.json', 'dist/appinfo.json');
await writeFile('dist/icon.png', icon(80));
await writeFile('dist/largeIcon.png', icon(130));
console.info('webOS manifest and icons prepared in dist/');
