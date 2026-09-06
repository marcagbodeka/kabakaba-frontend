const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL est obligatoire en production.');
}

const API_BASE_URL = configuredApiBaseUrl || 'http://localhost:3000/api/v1';
const LEGACY_TOKEN_KEY = 'kbb_web_session_token';
const CSRF_COOKIE_NAME = 'kabakaba_web_csrf';

export const AUTH_EXPIRED_EVENT = 'kbb:auth-expired';

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

export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  clearLegacyToken();
  const normalizedMethod = method.toUpperCase();
  const finalHeaders = { ...headers };

  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json';

  // Les routes de session Web utilisent le cookie HttpOnly. Le cookie CSRF
  // est volontairement lisible par JS et doit être renvoyé pour les mutations.
  if (auth && !['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)) {
    const csrf = getCsrfToken();
    if (csrf) finalHeaders['X-CSRF-Token'] = csrf;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: normalizedMethod,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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

  return data;
}
