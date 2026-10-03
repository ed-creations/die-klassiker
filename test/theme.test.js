import test from 'node:test';
import assert from 'node:assert/strict';
import { createThemeController } from '../src/theme.js';

function setup(saved = null, prefersDark = false) {
  const values = new Map(saved ? [['soundboard-theme', saved]] : []);
  const documentRef = { documentElement: { dataset: {} } };
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  return { controller: createThemeController({ documentRef, storage, mediaQuery: { matches: prefersDark } }), documentRef, storage };
}

test('follows device preference without a saved choice', () => {
  assert.equal(setup(null, true).controller.initialize(), 'dark');
  assert.equal(setup(null, false).controller.initialize(), 'light');
});

test('restores and persists an explicit theme choice', () => {
  const { controller, documentRef } = setup('light', true);
  assert.equal(controller.initialize(), 'light');
  assert.equal(controller.toggle(), 'dark');
  assert.equal(documentRef.documentElement.dataset.theme, 'dark');
});
