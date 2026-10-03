import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccessGate } from '../src/access.js';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('grants and remembers the correct passcode', () => {
  const gate = createAccessGate({ storage: storage(), passcode: 'memes' });
  assert.equal(gate.isRemembered(), false);
  assert.equal(gate.verify('memes'), true);
  assert.equal(gate.isRemembered(), true);
});

test('rejects an incorrect passcode', () => {
  const gate = createAccessGate({ storage: storage(), passcode: 'memes' });
  assert.equal(gate.verify('wrong'), false);
  assert.equal(gate.isRemembered(), false);
});
