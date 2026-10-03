import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manifest = await readFile(new URL('../manifest.json', import.meta.url), 'utf8');
const worker = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const workflow = await readFile(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8');

test('PWA metadata and cache include the application', () => {
  assert.match(manifest, /"display": "standalone"/);
  assert.match(worker, /CACHE_NAME/);
  assert.match(worker, /sounds\.json/);
});

test('deployment is manual-only while pull requests validate', () => {
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /github\.event_name == 'workflow_dispatch'/);
  assert.doesNotMatch(workflow, /branches:\s*\[main\]/);
});
