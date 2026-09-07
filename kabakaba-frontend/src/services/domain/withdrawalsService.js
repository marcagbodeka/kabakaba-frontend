import { apiFetch, apiFetchBlob } from '../httpClient';

function rangeParams(range) {
  if (!range?.from || !range?.to) return {};
  return { from: range.from.toISOString(), to: range.to.toISOString() };
}

export function getWithdrawals(page = 1, limit = 10, status, range) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit), ...rangeParams(range) });
  if (status && status !== 'all') qs.set('status', status);
  return apiFetch(`/withdrawals?${qs.toString()}`);
}

export function getWithdrawalsStats() {
  return apiFetch('/withdrawals/stats');
}

export function getWithdrawal(id) {
  if (!id || typeof id !== 'string') throw new TypeError('Identifiant de retrait invalide');
  return apiFetch(`/withdrawals/${encodeURIComponent(id)}`);
}

export function acceptWithdrawal(id) {
  return apiFetch(`/withdrawals/${encodeURIComponent(id)}/accept`, { method: 'PATCH' });
}

export function uploadWithdrawalProof(id, file) {
  if (!id || typeof id !== 'string') throw new TypeError('Identifiant de retrait invalide');
  if (!(file instanceof File)) throw new TypeError('Fichier de preuve invalide');
  const form = new FormData();
  form.append('file', file);
  return apiFetch(`/withdrawals/${encodeURIComponent(id)}/proof`, {
    method: 'POST',
    body: form,
  });
}

export function getWithdrawalProof(id) {
  if (!id || typeof id !== 'string') throw new TypeError('Identifiant de retrait invalide');
  return apiFetchBlob(`/withdrawals/${encodeURIComponent(id)}/proof`);
}

export function confirmWithdrawal(id) {
  return apiFetch(`/withdrawals/${encodeURIComponent(id)}/confirm`, { method: 'POST' });
}

export function failWithdrawal(id, reason) {
  return apiFetch(`/withdrawals/${encodeURIComponent(id)}/fail`, {
    method: 'POST',
    body: { reason },
  });
}

export function cancelWithdrawal(id, reason) {
  return apiFetch(`/withdrawals/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    body: { reason },
  });
}

export function resolveWithdrawalAppeal(appealId, resolutionNote, approved) {
  const qs = new URLSearchParams({ approved: String(Boolean(approved)) });
  return apiFetch(`/withdrawals/appeals/${encodeURIComponent(appealId)}/resolve?${qs.toString()}`, {
    method: 'PATCH',
    body: { resolutionNote },
  });
}

// Réservé aux workflows internes : aucune action Sync fournisseur n'est exposée.
export function syncWithdrawal(id) {
  if (!id || typeof id !== 'string') throw new TypeError('Identifiant de retrait invalide');
  return apiFetch(`/withdrawals/${encodeURIComponent(id)}/sync`, { method: 'POST' });
}
