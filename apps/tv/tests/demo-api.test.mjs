import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDemoContent, loadDemoContent, standardContent } from '../src/shared/demo-api.ts';

const data = { mode: 'MOCK', guest: { displayName: 'John Smith', email: 'not-for-tv' },
  resortName: 'SUNSHINE RESORT', tagline: 'Demo', information: [{ title: 'Wi-Fi', text: 'Demo' }], payments: [] };

test('validates the network response and picks only supported UI fields', () => {
  const parsed = parseDemoContent(data);
  assert.deepEqual(parsed.guest, { displayName: 'John Smith' });
  assert.equal('payments' in parsed, false);
  for (const bad of [null, {}, { ...data, mode: 'GUEST' }, { ...data, guest: null },
    { ...data, information: [{ title: 123 }] }]) assert.throws(() => parseDemoContent(bad));
  assert.equal(standardContent.guest, null);
});

test('HTTP failures and cancellation reject instead of returning a stale mock guest', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('Unavailable', { status: 503 });
    await assert.rejects(loadDemoContent('http://demo', new AbortController().signal), /503/);
    const controller = new AbortController(); controller.abort();
    globalThis.fetch = async (_url, options) => { options.signal.throwIfAborted(); };
    await assert.rejects(loadDemoContent('http://demo', controller.signal));
  } finally { globalThis.fetch = original; }
});
