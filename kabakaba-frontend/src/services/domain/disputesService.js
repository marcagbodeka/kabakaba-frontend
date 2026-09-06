import { apiFetch } from '../httpClient';

// Même convention que analyticsService : { from: Date, to: Date } -> query params ISO.
function rangeParams(range) {
  if (!range?.from || !range?.to) return {};
  return { from: range.from.toISOString(), to: range.to.toISOString() };
}

// GET /disputes/stats — KPIs de la page Litiges.
export function getDisputesStats() {
  return apiFetch('/disputes/stats');
}

// GET /disputes — liste paginée. filters: { status, campusId, vendorId, studentId }
// range: { from: Date, to: Date } — optionnel, filtre par date de signalement.
export function getDisputes(page = 1, limit = 10, filters = {}, range) {
  const params = new URLSearchParams({ page, limit, ...rangeParams(range) });
  if (filters.status) params.set('status', filters.status);
  if (filters.campusId) params.set('campusId', filters.campusId);
  if (filters.vendorId) params.set('vendorId', filters.vendorId);
  if (filters.studentId) params.set('studentId', filters.studentId);
  return apiFetch(`/disputes?${params.toString()}`);
}

// GET /disputes/:id/context — détail enrichi (parties, timeline, signaux).
export function getDisputeContext(id) {
  return apiFetch(`/disputes/${id}/context`);
}

// GET /disputes/:id
export function getDispute(id) {
  return apiFetch(`/disputes/${id}`);
}

// PATCH /disputes/:id — { status, decision, decisionNote }
export function updateDispute(id, patch) {
  return apiFetch(`/disputes/${id}`, { method: 'PATCH', body: patch });
}
