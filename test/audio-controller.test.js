import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioController } from '../src/audio-controller.js';

function fakeContext() {
  const sources = [];
  return {
    sources, destination: {}, resumed: false,
    async resume() { this.resumed = true; },
    async decodeAudioData(buffer) { return { buffer }; },
    createBufferSource() {
      const source = { buffer: null, startedAt: null, stopped: false, onended: null,
        connect() {}, disconnect() {}, start(at) { this.startedAt = at; }, stop() { this.stopped = true; } };
      sources.push(source);
      return source;
    }
  };
}

function fetchImpl() {
  return Promise.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
}

test('starts a buffer at zero and stops the previous source', async () => {
  const context = fakeContext();
  const controller = new AudioController([
    { id: 'one', title: 'Eins', src: 'one.mp3' },
    { id: 'two', title: 'Zwei', src: 'two.mp3' }
  ], { contextFactory: () => context, fetchImpl });
  const events = [];
  controller.subscribe(event => events.push(event.type));
  await controller.ready;
  await controller.play('one');
  await controller.play('two');
  assert.equal(context.resumed, true);
  assert.equal(context.sources[0].startedAt, 0);
  assert.equal(context.sources[0].stopped, true);
  assert.equal(controller.activeId, 'two');
  assert.deepEqual(events, ['playing', 'stopped', 'playing']);
});

test('clears the previous active state before audio context resume completes', async () => {
  let resolveResume;
  const context = fakeContext();
  context.resume = () => new Promise(resolve => { resolveResume = resolve; });
  const controller = new AudioController([
    { id: 'one', title: 'Eins', src: 'one.mp3' },
    { id: 'two', title: 'Zwei', src: 'two.mp3' }
  ], { contextFactory: () => context, fetchImpl });
  await controller.ready;
  context.resume = async () => {};
  await controller.play('one');
  context.resume = () => new Promise(resolve => { resolveResume = resolve; });
  const nextPlay = controller.play('two');
  assert.equal(controller.activeId, null);
  resolveResume();
  await nextPlay;
  assert.equal(controller.activeId, 'two');
});

test('shuffle selects from the catalog', async () => {
  const context = fakeContext();
  const controller = new AudioController([
    { id: 'one', title: 'Eins', src: 'one.mp3' },
    { id: 'two', title: 'Zwei', src: 'two.mp3' }
  ], { contextFactory: () => context, fetchImpl, random: () => 0.99 });
  const events = [];
  controller.subscribe(event => events.push(event));
  await controller.ready;
  await controller.playRandom();
  assert.equal(events.find(event => event.type === 'playing').id, 'two');
});
