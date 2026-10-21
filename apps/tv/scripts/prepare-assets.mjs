import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('public', { recursive: true });
// Reuse the website's canonical asset. No replacement or generated logo.
await copyFile('../web/public/logo-sunshine.png', 'public/logo-sunshine.png');
