import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioController } from '../src/audio-controller.js';

function fakeAudio() {
  const listeners = new Map();
  return {
    preload: '', src: '', currentTime: 0, paused: true,
    addEventListener(type, handler) { listeners.set(type, handler); },
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
    trigger(type) { listeners.get(type)?.(); }
  };
}

test('plays one sound and stops the previous sound', async () => {
  const audios = [];
  const controller = new AudioController([
    { id: 'one', title: 'Eins', src: 'one.mp3' },
    { id: 'two', title: 'Zwei', src: 'two.mp3' }
  ], { audioFactory: () => { const audio = fakeAudio(); audios.push(audio); return audio; } });
  const events = [];
  controller.subscribe(event => events.push(event.type));
  await controller.play('one');
  await controller.play('two');
  assert.equal(audios[0].paused, true);
  assert.equal(controller.activeId, 'two');
  assert.deepEqual(events, ['playing', 'stopped', 'playing']);
});

test('shuffle selects from the catalog', async () => {
  let chosen;
  const controller = new AudioController([
    { id: 'one', title: 'Eins', src: 'one.mp3' },
    { id: 'two', title: 'Zwei', src: 'two.mp3' }
  ], { audioFactory: fakeAudio, random: () => 0.99 });
  controller.subscribe(event => { if (event.type === 'playing') chosen = event.id; });
  await controller.playRandom();
  assert.equal(chosen, 'two');
});
