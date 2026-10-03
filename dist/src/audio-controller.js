function defaultContext() {
  const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Context) throw new Error('Web Audio is not supported in this browser.');
  return new Context();
}

export class AudioController {
  constructor(sounds, { contextFactory = defaultContext, fetchImpl = fetch, random = Math.random } = {}) {
    this.sounds = sounds;
    this.random = random;
    this.context = contextFactory();
    this.activeId = null;
    this.activeSource = null;
    this.listeners = new Set();
    this.buffers = new Map();
    this.ready = this.preload(fetchImpl);
  }

  async preload(fetchImpl) {
    await Promise.all(this.sounds.map(async sound => {
      const response = await fetchImpl(sound.src);
      if (!response.ok) throw new Error(`Sound could not be loaded: ${sound.id}`);
      const buffer = await response.arrayBuffer();
      this.buffers.set(sound.id, await this.context.decodeAudioData(buffer));
    }));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(state) {
    for (const listener of this.listeners) listener(state);
  }

  stop() {
    if (!this.activeSource) return;
    const id = this.activeId;
    this.activeSource.onended = null;
    try { this.activeSource.stop(0); } catch {}
    this.activeSource.disconnect?.();
    this.activeSource = null;
    this.activeId = null;
    this.emit({ type: 'stopped', id });
  }

  async play(id) {
    // Clear the previous sound immediately, before any iOS audio-context wait.
    this.stop();
    const resume = this.context.resume();
    if (!this.buffers.has(id)) await this.ready;
    const buffer = this.buffers.get(id);
    if (!buffer) throw new Error(`Unknown sound: ${id}`);
    await resume;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.onended = () => this.finish(id, source);
    this.activeId = id;
    this.activeSource = source;
    this.emit({ type: 'playing', id });
    source.start(0);
  }

  playRandom() {
    if (!this.sounds.length) throw new Error('No sounds available.');
    const index = Math.floor(this.random() * this.sounds.length);
    return this.play(this.sounds[index].id);
  }

  finish(id, source) {
    if (this.activeSource !== source) return;
    this.activeSource = null;
    this.activeId = null;
    source.disconnect?.();
    this.emit({ type: 'ended', id });
  }

  fail(id, error) {
    if (this.activeId === id) this.stop();
    this.emit({ type: 'error', id, error });
  }
}
