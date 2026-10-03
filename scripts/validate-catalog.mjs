import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { validateCatalog } from '../src/catalog.js';

const catalog = JSON.parse(await readFile(new URL('../sounds.json', import.meta.url)));
validateCatalog(catalog);
for (const sound of catalog.sounds) {
  if (sound.src.startsWith('data:')) continue;
  await access(new URL(`../${sound.src}`, import.meta.url));
}
console.log(`Catalog valid: ${catalog.sounds.length} sounds`);
