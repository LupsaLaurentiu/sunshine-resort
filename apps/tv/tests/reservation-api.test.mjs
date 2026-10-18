import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newTvIdentity, parseReservationContent, validateTvApi } from '../src/shared/reservation-api.ts';

const response = { mode: 'GUEST', guest: { displayName: 'Guest', phone: 'private' }, resortName: 'SUNSHINE RESORT', tagline: 'Welcome', information: [], serverTime: '2026-11-18T07:59:50Z', validUntil: '2026-11-18T08:00:00Z' };

test('real mode rejects HTTP and embedded credentials; device identity is random', () => {
  assert.equal(validateTvApi('https://api.example/api/'), 'https://api.example/api');
  for (const url of ['http://api.example', 'https://user:password@api.example', 'https://api.example/?token=secret']) assert.throws(() => validateTvApi(url));
  const first = newTvIdentity(); assert.match(first, /^[a-f0-9]{64}$/); assert.notEqual(first, newTvIdentity());
});
test('honors checkout expiry, drops extra guest fields, and bounds lease length', () => {
  const parsed = parseReservationContent(response);
  assert.equal(parsed.leaseMs, 10000);
  assert.deepEqual(parsed.content.guest, { displayName: 'Guest' });
  assert.equal(parseReservationContent({ ...response, validUntil: '2026-11-18T09:00:00Z' }).leaseMs, 45000);
});
test('rejects malformed, expired or inconsistent real responses', () => {
  for (const bad of [null, {}, { ...response, guest: null }, { ...response, mode: 'MOCK' },
    { ...response, mode: 'STANDARD' }, { ...response, validUntil: response.serverTime },
    { ...response, serverTime: 'invalid' }]) assert.throws(() => parseReservationContent(bad));
  assert.equal(parseReservationContent({ ...response, mode: 'STANDARD', guest: null }).content.guest, null);
});
