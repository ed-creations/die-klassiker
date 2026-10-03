const CACHE_NAME = 'soundboard-v1';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './sounds.json',
  './manifest.json',
  './icon.svg',
  './src/app.js',
  './src/access.js',
  './src/audio-controller.js',
  './src/catalog.js',
  './src/theme.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await cache.addAll(APP_SHELL);
    const response = await fetch('./sounds.json');
    const catalog = await response.json();
    await cache.addAll(catalog.sounds.flatMap(sound => [sound.src, ...(sound.image ? [sound.image] : [])]));
  }));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
