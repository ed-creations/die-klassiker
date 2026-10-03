export function createAccessGate({ storage, passcode, key = 'soundboard-access' }) {
  return {
    isRemembered() {
      return storage.getItem(key) === 'granted';
    },
    verify(value) {
      const granted = value === passcode;
      if (granted) storage.setItem(key, 'granted');
      return granted;
    }
  };
}
