function defaultAudio() {
  return new Audio();
}

export class AudioController {
  constructor(sounds, { audioFactory = defaultAudio, random = Math.random } = {}) {
    this.sounds = sounds;
    this.random = random;
    this.activeId = null;
    this.listeners = new Set();
    this.audio = new Map();

    for (const sound of sounds) {
      const element = audioFactory();
      element.preload = 'auto';
      element.src = sound.src;
      element.load?.();
      element.addEventListener('ended', () => this.finish(sound.id));
      element.addEventListener('error', event => this.fail(sound.id, event));
      this.audio.set(sound.id, element);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(state) {
    for (const listener of this.listeners) listener(state);
  }

  stop() {
    if (!this.activeId) return;
    const id = this.activeId;
    const active = this.audio.get(id);
    active.pause();
    active.currentTime = 0;
    this.activeId = null;
    this.emit({ type: 'stopped', id });
  }

  async play(id) {
    const selected = this.audio.get(id);
    if (!selected) throw new Error(`Unknown sound: ${id}`);

    // Clear the previous sound immediately, before any browser playback wait.
    this.stop();
    this.activeId = id;
    this.emit({ type: 'playing', id });
    try {
      await selected.play();
    } catch (error) {
      this.fail(id, error);
      throw error;
    }
  }

  playRandom() {
    if (!this.sounds.length) throw new Error('No sounds available.');
    const index = Math.floor(this.random() * this.sounds.length);
    return this.play(this.sounds[index].id);
  }

  finish(id) {
    if (this.activeId !== id) return;
    this.activeId = null;
    this.emit({ type: 'ended', id });
  }

  fail(id, error) {
    if (this.activeId === id) {
      this.activeId = null;
      this.emit({ type: 'error', id, error });
    }
  }
}
