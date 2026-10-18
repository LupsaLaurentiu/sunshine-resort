import { loadEnv } from 'vite';
const { VITE_TV_API_URL: base } = loadEnv('reservations', process.cwd());
try {
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error();
} catch {
  console.error('Set VITE_TV_API_URL to the trusted HTTPS API base (including /api) in .env.reservations.local before building the real-reservation package.');
  process.exit(1);
}
