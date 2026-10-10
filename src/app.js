import { loadCatalog } from './catalog.js';
import { createAccessGate } from './access.js';
import { AudioController } from './audio-controller.js';
import { createThemeController } from './theme.js';

const PASSCODE = 'psggegenpsg';
const accessView = document.querySelector('#access-view');
const boardView = document.querySelector('#board-view');
const accessForm = document.querySelector('#access-form');
const accessMessage = document.querySelector('#access-message');
const grid = document.querySelector('#sound-grid');
const shuffleButton = document.querySelector('#shuffle-button');
const loadingMessage = document.querySelector('#loading-message');
const statusMessage = document.querySelector('#status-message');
const themeToggle = document.querySelector('#theme-toggle');
const theme = createThemeController();
const access = createAccessGate({ storage: localStorage, passcode: PASSCODE });
let controller;

theme.initialize();
updateThemeButton(theme.get());
themeToggle.addEventListener('click', () => updateThemeButton(theme.toggle()));

function updateThemeButton(current) {
  const dark = current === 'dark';
  themeToggle.textContent = dark ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', dark ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren');
}

function showBoard() {
  accessView.hidden = true;
  boardView.hidden = false;
  initializeBoard();
}

accessForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = new FormData(accessForm).get('passcode');
  if (access.verify(value)) {
    accessMessage.textContent = '';
    showBoard();
  } else {
    accessMessage.textContent = 'Passwort ungültig';
  }
});

if (access.isRemembered()) showBoard();

async function initializeBoard() {
  if (controller) return;
  try {
    const sounds = await loadCatalog();
    controller = new AudioController(sounds);
    renderSounds(sounds);
    controller.subscribe(updatePlaybackState);
    shuffleButton.addEventListener('click', () => playWithFeedback(() => controller.playRandom()));
    loadingMessage.hidden = true;
  } catch (error) {
    loadingMessage.textContent = 'Fehler ist aufgetreten, bitte versuche es erneut.';
    console.error(error);
  }
}

function renderSounds(sounds) {
  grid.replaceChildren();
  for (const sound of sounds) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sound-button';
    button.dataset.soundId = sound.id;
    if (sound.image) {
      const image = document.createElement('img');
      image.className = 'sound-thumbnail';
      image.src = sound.image;
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      button.append(image);
    }
    const title = document.createElement('span');
    title.className = 'sound-title';
    title.textContent = sound.title;
    button.append(title);
    button.setAttribute('aria-pressed', 'false');
    let pointerStart = null;
    let suppressClick = false;
    button.addEventListener('pointerdown', () => {
      button.classList.add('is-pressed');
    });
    button.addEventListener('pointerdown', event => {
      // A mobile browser may synthesize a click after a touch scroll.
      // Remember where the gesture started so that scrolling cannot play a sound.
      pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
      suppressClick = false;
    });
    button.addEventListener('pointermove', event => {
      if (!pointerStart || event.pointerId !== pointerStart.id) return;
      const movedX = event.clientX - pointerStart.x;
      const movedY = event.clientY - pointerStart.y;
      if (Math.hypot(movedX, movedY) > 10) {
        suppressClick = true;
        button.classList.remove('is-pressed');
      }
    });
    button.addEventListener('pointerup', () => button.classList.remove('is-pressed'));
    button.addEventListener('pointerup', event => {
      if (pointerStart?.id === event.pointerId) pointerStart = null;
    });
    button.addEventListener('pointercancel', event => {
      if (pointerStart?.id === event.pointerId) {
        pointerStart = null;
        suppressClick = true;
      }
      button.classList.remove('is-pressed');
    });
    button.addEventListener('pointerleave', () => button.classList.remove('is-pressed'));
    button.addEventListener('click', event => {
      if (suppressClick) {
        suppressClick = false;
        event.preventDefault();
        return;
      }
      if ('vibrate' in navigator) navigator.vibrate(10);
      playWithFeedback(() => controller.play(sound.id));
    });
    grid.append(button);
  }
}

function playWithFeedback(action) {
  statusMessage.textContent = '';
  action().catch(() => {
    statusMessage.textContent = 'Fehler ist aufgetreten, bitte versuche es erneut.';
  });
}

function updatePlaybackState(event) {
  const buttons = grid.querySelectorAll('.sound-button');
  for (const button of buttons) {
    const active = event.type === 'playing' && button.dataset.soundId === event.id;
    button.classList.toggle('is-playing', active);
    button.setAttribute('aria-pressed', String(active));
  }
  if (event.type === 'error') statusMessage.textContent = 'Fehler ist aufgetreten, bitte versuche es erneut.';
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
