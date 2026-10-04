import { apiFetch } from '../httpClient';
import { buildQuery } from '../buildQuery';

// Forme confirmée par le backend : { data: [...], meta: { page, limit, total, totalPages } }
export function extractList(response) {
  if (Array.isArray(response?.data)) {
    return { items: response.data, total: response.meta?.total ?? response.data.length };
  }
  if (Array.isArray(response)) return { items: response, total: response.length };
  return { items: [], total: 0 };
}

export function findUsers({ page = 1, limit = 20, role, campusId, isSuspended } = {}) {
  return apiFetch(`/users${buildQuery({ page, limit, role, campusId, isSuspended })}`);
}

export function updateUser(id, data) {
  return apiFetch(`/users/${id}`, { method: 'PATCH', body: data });
}