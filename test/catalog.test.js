import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalog } from '../src/catalog.js';

test('accepts a valid catalog', () => {
  assert.deepEqual(validateCatalog({ sounds: [{ id: 'one', title: 'Eins', src: 'one.mp3' }] }), [
    { id: 'one', title: 'Eins', src: 'one.mp3' }
  ]);
});

test('rejects duplicate ids', () => {
  assert.throws(() => validateCatalog({ sounds: [
    { id: 'one', title: 'Eins', src: 'one.mp3' },
    { id: 'one', title: 'Noch eins', src: 'two.mp3' }
  ] }), /unique/);
});

test('rejects missing titles and sources', () => {
  assert.throws(() => validateCatalog({ sounds: [{ id: 'one', src: 'one.mp3' }] }), /title/);
  assert.throws(() => validateCatalog({ sounds: [{ id: 'one', title: 'Eins' }] }), /source/);
});

test('accepts an optional thumbnail path', () => {
  assert.doesNotThrow(() => validateCatalog({ sounds: [{ id: 'one', title: 'Eins', src: 'one.mp3', image: 'one.svg' }] }));
  assert.throws(() => validateCatalog({ sounds: [{ id: 'one', title: 'Eins', src: 'one.mp3', image: 42 }] }), /image/);
});
