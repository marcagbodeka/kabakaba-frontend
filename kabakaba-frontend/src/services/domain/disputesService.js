import { apiFetch } from '../httpClient';

// GET /disputes/stats — KPIs de la page Litiges.
export function getDisputesStats() {
  return apiFetch('/disputes/stats');
}

// GET /disputes — liste paginée. filters: { status, campusId, vendorId, studentId, days }
export function getDisputes(page = 1, limit = 10, filters = {}) {
  const params = new URLSearchParams({ page, limit });
  if (filters.status) params.set('status', filters.status);
  if (filters.campusId) params.set('campusId', filters.campusId);
  if (filters.vendorId) params.set('vendorId', filters.vendorId);
  if (filters.studentId) params.set('studentId', filters.studentId);
  if (filters.days) params.set('days', filters.days);
  return apiFetch(`/disputes?${params.toString()}`);
}

// GET /disputes/:id
export function getDispute(id) {
  return apiFetch(`/disputes/${id}`);
}

// PATCH /disputes/:id — { status, decision, decisionNote }
export function updateDispute(id, patch) {
  return apiFetch(`/disputes/${id}`, { method: 'PATCH', body: patch });
}
