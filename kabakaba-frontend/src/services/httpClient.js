// En production, les appels passent par le rewrite Vercel défini dans
// vercel.json (/api/v1/:path* -> backend) : ils restent donc sur la même
// origine que le frontend (ka-bakaba.vercel.app), ce qui rend le cookie de
// session réellement de premier parti (same-site) plutôt que cross-site —
// voir le commentaire de sameSite() côté backend pour le contexte complet.
// VITE_API_BASE_URL reste disponible pour un override explicite (staging
// pointant vers un autre backend, environnement sans le rewrite, etc.).
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = configuredApiBaseUrl || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:3000/api/v1');
const LEGACY_TOKEN_KEY = 'kbb_web_session_token';
const CSRF_COOKIE_NAME = 'kabakaba_web_csrf';

export const AUTH_EXPIRED_EVENT = 'kbb:auth-expired';

const GET_CACHE_TTL_MS = 5000;
const getCache = new Map();

function getCachedGet(path) {
  const hit = getCache.get(path);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) { getCache.delete(path); return null; }
  return hit.value;
}

function setCachedGet(path, value) {
  getCache.set(path, { value, expiresAt: Date.now() + GET_CACHE_TTL_MS });
}

export function clearApiCache() {
  getCache.clear();
}

// Le JWT de session Web est désormais HttpOnly : le frontend ne peut ni le
// lire ni le stocker. On supprime aussi toute ancienne copie sessionStorage.
export function clearLegacyToken() {
  try { sessionStorage.removeItem(LEGACY_TOKEN_KEY); } catch {}
}

function getCookie(name) {
  const prefix = `${name}=`;
  const entry = document.cookie.split('; ').find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

export function getCsrfToken() {
  return getCookie(CSRF_COOKIE_NAME);
}

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}


export async function apiFetchBlob(path) {
  clearLegacyToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    let data = null;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch {}
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }
    const rawMessage = (data && (data.message || data.error)) || `Erreur ${res.status}`;
    throw new ApiError(res.status, Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage, data);
  }
  return res.blob();
}

export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  clearLegacyToken();
  const normalizedMethod = method.toUpperCase();
  const finalHeaders = { ...headers };

  // Petit cache mémoire uniquement pour GET : évite les appels identiques
  // déclenchés par plusieurs widgets/pages pendant quelques secondes.
  // Rien n'est persisté et toute mutation invalide le cache.
  if (normalizedMethod === 'GET' && auth) {
    const cached = getCachedGet(path);
    if (cached !== null) return cached;
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) finalHeaders['Content-Type'] = 'application/json';

  // Les routes de session Web utilisent le cookie HttpOnly. Le cookie CSRF
  // est volontairement lisible par JS et doit être renvoyé pour les mutations.
  if (auth && !['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)) {
    const csrf = getCsrfToken();
    if (csrf) finalHeaders['X-CSRF-Token'] = csrf;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: normalizedMethod,
    headers: finalHeaders,
    body: body !== undefined
      ? (isFormData ? body : JSON.stringify(body))
      : undefined,
    credentials: 'include',
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearLegacyToken();
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }

    const rawMessage = (data && (data.message || data.error)) || `Erreur ${res.status}`;
    throw new ApiError(res.status, Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage, data);
  }

  if (normalizedMethod === 'GET' && auth) setCachedGet(path, data);
  if (normalizedMethod !== 'GET' && normalizedMethod !== 'HEAD' && normalizedMethod !== 'OPTIONS') clearApiCache();
  return data;
}
