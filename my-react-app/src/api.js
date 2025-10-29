// Lightweight API helper with environment-configurable base and a simple fallback
// Use REACT_APP_API_URL to override (create a .env.development if needed)
const DEFAULTS = [process.env.REACT_APP_API_URL, 'http://localhost:4000', 'http://localhost:4001']
  .filter(Boolean)
  .map(u => u.replace(/\/$/, ''));

// expose for debugging in browser console
window.__API_CANDIDATES = DEFAULTS;

export async function apiFetch(path, opts = {}) {
  // allow absolute URLs to bypass base selection
  if (/^https?:\/\//.test(path)) {
    console.debug('[apiFetch] absolute URL', path, opts);
    return fetch(path, opts);
  }

  let lastErr;
  for (const base of DEFAULTS) {
    const url = `${base}${path.startsWith('/') ? path : '/' + path}`;
    try {
      console.debug('[apiFetch] trying', url, opts);
      const res = await fetch(url, { mode: 'cors', ...opts });
      // log network-level failures as response status for easier debugging
      console.debug('[apiFetch] got', url, res && res.status);
      return res;
    } catch (err) {
      lastErr = err;
      console.warn('[apiFetch] failed', url, err && err.message ? err.message : err);
      // try next candidate
    }
  }
  // If all attempts failed, throw the last caught error
  console.error('[apiFetch] all candidates failed', DEFAULTS, lastErr);
  throw lastErr || new Error('apiFetch: no available backend');
}

export const API_BASE = DEFAULTS[0];
// also expose currently chosen base for quick UI display in dev
window.__API_BASE = API_BASE;
