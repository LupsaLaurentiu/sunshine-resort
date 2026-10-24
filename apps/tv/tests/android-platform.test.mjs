import assert from 'node:assert/strict';
import { test } from 'node:test';
import { androidPlatform } from '../src/platform/android.ts';

test('Android exit uses the native activity bridge', () => {
  let closed = 0;
  globalThis.window = { SunshineAndroid: { closeApp: () => closed++ } };
  androidPlatform.exit();
  assert.equal(closed, 1);
  globalThis.window = {};
  assert.doesNotThrow(() => androidPlatform.exit());
  delete globalThis.window;
});

test('Android lifecycle delivers native hide/resume and removes both listeners', () => {
  globalThis.window = new EventTarget();
  globalThis.document = Object.assign(new EventTarget(), { hidden: false });
  const events = [];
  const unsubscribe = androidPlatform.subscribeLifecycle(state => events.push(state));
  window.dispatchEvent(new CustomEvent('sunshine:android-lifecycle', { detail: 'hidden' }));
  window.dispatchEvent(new CustomEvent('sunshine:android-lifecycle', { detail: 'visible' }));
  window.dispatchEvent(new CustomEvent('sunshine:android-lifecycle', { detail: 'untrusted-state' }));
  document.hidden = true; document.dispatchEvent(new Event('visibilitychange'));
  unsubscribe();
  window.dispatchEvent(new CustomEvent('sunshine:android-lifecycle', { detail: 'visible' }));
  document.hidden = false; document.dispatchEvent(new Event('visibilitychange'));
  assert.deepEqual(events, ['hidden', 'visible', 'hidden']);
  delete globalThis.window; delete globalThis.document;
});
