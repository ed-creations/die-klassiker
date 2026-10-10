import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

test('interface opens directly to the soundboard', () => {
  assert.doesNotMatch(html, /id="access-form"/);
  assert.doesNotMatch(html, /type="password"/);
  assert.match(html, /id="board-view" class="board-view" aria-labelledby/);
  assert.match(html, />Shuffle</);
  assert.match(html, /lang="de"/);
});

test('interface defines an adaptive grid and accessible playback state', () => {
  assert.match(css, /grid-template-columns:\s*repeat\(auto-fit/);
  assert.match(css, /min-height:\s*3\.6em/);
  assert.match(app, /aria-pressed/);
  assert.match(app, /navigator\.vibrate/);
});

test('sound playback waits for a completed click', () => {
  assert.match(app, /pointerdown', \(\) => \{\s*button\.classList\.add\('is-pressed'\);\s*\}\)/);
  assert.match(app, /addEventListener\('click'[\s\S]*controller\.play/);
});

test('sound entries can render thumbnails', () => {
  assert.match(app, /sound-thumbnail/);
  assert.match(app, /sound.image/);
});
