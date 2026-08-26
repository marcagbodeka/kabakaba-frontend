const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kabakaba-backend.vercel.app/api/v1';

const TOKEN_KEY = 'kbb_web_session_token';

// Nom de l'événement global émis quand une requête échoue en 401 (token
// expiré ou invalide). AuthContext l'écoute pour nettoyer la session et
// déclencher la redirection vers le login — évite à chaque page du
// dashboard de devoir gérer elle-même ce cas.
export const AUTH_EXPIRED_EVENT = 'kbb:auth-expired';

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = true, headers = {} } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };

  if (auth) {
    const token = getStoredToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    // 401 = session expirée ou invalide. On ne laisse pas chaque page
    // décider quoi en faire : on nettoie tout de suite et on prévient
    // globalement, pour une redirection immédiate vers le login plutôt
    // qu'un message d'erreur affiché dans le tableau de bord.
    if (res.status === 401 && auth) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }

    const rawMessage = (data && (data.message || data.error)) || `Erreur ${res.status}`;
    throw new ApiError(res.status, Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage, data);
  }

  return data;
}