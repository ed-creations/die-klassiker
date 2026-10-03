export function createThemeController({
  documentRef = document,
  storage = localStorage,
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)'),
  key = 'soundboard-theme'
} = {}) {
  const saved = storage.getItem(key);
  const initial = saved || (mediaQuery.matches ? 'dark' : 'light');

  function apply(theme) {
    documentRef.documentElement.dataset.theme = theme;
    storage.setItem(key, theme);
    return theme;
  }

  return {
    get() { return documentRef.documentElement.dataset.theme || initial; },
    set(theme) { return apply(theme === 'light' ? 'light' : 'dark'); },
    toggle() { return apply(this.get() === 'dark' ? 'light' : 'dark'); },
    initialize() {
      documentRef.documentElement.dataset.theme = initial;
      return initial;
    }
  };
}
