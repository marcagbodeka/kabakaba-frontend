import { apiFetch } from '../httpClient';

// On ne récupère que meta.total (limit=1) : ce service sert uniquement à
// compter les commandes par statut, pas à lister leur contenu.
export function countOrdersByStatus(status) {
  return apiFetch(`/orders?status=${status}&page=1&limit=1`).then((res) => res.meta?.total ?? 0);
}

// GET /orders — liste enrichie (étudiant, campus, cantine). filters:
// { status, statuses: ['A','B'], vendorId, campusId }
export function getOrders(page = 1, limit = 10, filters = {}) {
  const params = new URLSearchParams({ page, limit });
  if (filters.status) params.set('status', filters.status);
  if (filters.statuses?.length) params.set('statuses', filters.statuses.join(','));
  if (filters.vendorId) params.set('vendorId', filters.vendorId);
  if (filters.campusId) params.set('campusId', filters.campusId);
  return apiFetch(`/orders?${params.toString()}`);
}
