import { apiFetch } from '../httpClient';

export function findWebUsers() {
  return apiFetch('/web-auth/web-users');
}

export function provisionWebUser(data) {
  return apiFetch('/web-auth/web-users', { method: 'POST', body: data });
}

export function findPendingDeletionRequests() {
  return apiFetch('/web-auth/web-users/deletion-requests');
}

export function getDeletionRequestProgress(requestId) {
  return apiFetch(`/web-auth/web-users/deletion-requests/${requestId}`);
}

export function initiateDeletion(id, reason) {
  return apiFetch(`/web-auth/web-users/${id}/deletion-requests`, { method: 'POST', body: { reason } });
}

export function confirmDeletion(requestId) {
  return apiFetch(`/web-auth/web-users/deletion-requests/${requestId}/confirm`, { method: 'POST' });
}

export function cancelDeletion(requestId) {
  return apiFetch(`/web-auth/web-users/deletion-requests/${requestId}/cancel`, { method: 'POST' });
}

export function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  // crypto.getRandomValues() plutôt que Math.random() : ce mot de passe,
  // même temporaire et à usage unique, protège l'accès initial à un compte
  // admin — Math.random() n'est pas un générateur cryptographiquement sûr.
  //
  // Rejection sampling plutôt qu'un simple modulo : `valeur % chars.length`
  // introduirait un biais résiduel (2^32 n'est pas un multiple exact de 62),
  // cryptographiquement négligeable ici mais évitable à coût nul — on
  // retire du tirage la tranche haute qui casserait l'uniformité et on
  // retire une nouvelle valeur si on tombe dedans.
  const maxUint32 = 0x100000000;
  const limit = maxUint32 - (maxUint32 % chars.length);

  let pw = '';
  const buffer = new Uint32Array(1);
  while (pw.length < 14) {
    window.crypto.getRandomValues(buffer);
    if (buffer[0] >= limit) continue; // tranche haute biaisée : on retire
    pw += chars[buffer[0] % chars.length];
  }
  return pw;
}