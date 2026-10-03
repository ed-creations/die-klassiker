export function validateCatalog(catalog) {
  if (!catalog || !Array.isArray(catalog.sounds)) {
    throw new Error('Sound catalog must contain a sounds array.');
  }

  const ids = new Set();
  for (const sound of catalog.sounds) {
    if (!sound || typeof sound !== 'object') {
      throw new Error('Every sound must be an object.');
    }
    if (!sound.id || typeof sound.id !== 'string' || ids.has(sound.id)) {
      throw new Error(`Sound id must be unique: ${sound.id ?? '(missing)'}`);
    }
    if (!sound.title || typeof sound.title !== 'string') {
      throw new Error(`Sound title is missing for ${sound.id}.`);
    }
    if (!sound.src || typeof sound.src !== 'string') {
      throw new Error(`Sound source is missing for ${sound.id}.`);
    }
    if (sound.image !== undefined && typeof sound.image !== 'string') {
      throw new Error(`Sound image must be a path for ${sound.id}.`);
    }
    ids.add(sound.id);
  }

  return catalog.sounds;
}

export async function loadCatalog(fetchImpl = fetch, url = 'sounds.json') {
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error('Sound catalog could not be loaded.');
  return validateCatalog(await response.json());
}
