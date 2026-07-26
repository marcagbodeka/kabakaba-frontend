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
  let pw = '';
  for (let i = 0; i < 14; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}