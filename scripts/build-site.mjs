import { mkdir, copyFile, cp } from 'node:fs/promises';

const files = ['index.html', 'styles.css', 'sounds.json', 'manifest.json', 'service-worker.js', 'icon.svg'];
await mkdir('dist', { recursive: true });
await mkdir('dist/src', { recursive: true });
await mkdir('dist/audio', { recursive: true });
await mkdir('dist/images', { recursive: true });
for (const file of files) await copyFile(file, `dist/${file}`);
await cp('src', 'dist/src', { recursive: true });
await cp('audio', 'dist/audio', { recursive: true });
await cp('images', 'dist/images', { recursive: true });
console.log('Static site staged in dist/');
