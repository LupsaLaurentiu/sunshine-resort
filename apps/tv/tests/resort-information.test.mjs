import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginateText, parseResortInformation, withoutGuest } from '../src/shared/resort-information.ts';

const language = { tagline: 'Stay', houseRules: 'Rule', facilities: '', attractions: 'Discover', usefulInfo: '', contact: '' };
const info = { wifi: { ssid: 'Guest', password: ' secret ' }, ro: { ...language, houseRules: 'Regulă' }, en: language, version: null };
test('validates both translations and strips unexpected fields', () => {
  const parsed = parseResortInformation({ ...info, guestName: 'not resort data' });
  assert.equal(parsed.ro.houseRules, 'Regulă'); assert.equal(parsed.en.houseRules, 'Rule');
  assert.equal(parsed.wifi.password, ' secret '); assert.equal('guestName' in parsed, false);
  for (const bad of [null, {}, { ...info, en: null }, { ...info, wifi: { ssid: 123 } }, { ...info, ro: { ...language, houseRules: 'x'.repeat(6001) } }]) assert.throws(() => parseResortInformation(bad));
});
test('guest expiry preserves resort information without retaining the name', () => {
  const standard = withoutGuest({ mode: 'GUEST', guest: { displayName: 'Guest Name' }, resortName: 'SUNSHINE RESORT', tagline: '', information: [], resortInformation: info });
  assert.equal(standard.mode, 'STANDARD'); assert.equal(standard.guest, null);
  assert.deepEqual(standard.resortInformation, info); assert.equal(JSON.stringify(standard).includes('Guest Name'), false);
});
test('paginates long paragraphs, long words and many short lines within TV bounds', () => {
  for (const text of ['word '.repeat(1200), 'x'.repeat(6000), Array(200).fill('A short rule').join('\n')]) {
    const pages = paginateText(text); assert.ok(pages.length > 1);
    for (const page of pages) { assert.ok(page.split('\n').length <= 8); assert.ok(page.split('\n').every(line => line.length <= 58)); }
  }
  assert.deepEqual(paginateText(''), []);
});
