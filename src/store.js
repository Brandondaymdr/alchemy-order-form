const PREFIX = 'alchemy_';

export const store = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },
  remove(key) {
    try { localStorage.removeItem(PREFIX + key); } catch {}
  },
};
