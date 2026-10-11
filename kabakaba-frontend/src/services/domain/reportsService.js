import { apiFetch } from '../httpClient';

// Même convention que analyticsService : { from: Date, to: Date } -> query params ISO.
function rangeParams(range) {
  if (!range?.from || !range?.to) return {};
  return { from: range.from.toISOString(), to: range.to.toISOString() };
}

// GET /reports/stats — KPIs de la page Signalements.
export function getReportsStats() {
  return apiFetch('/reports/stats');
}

// GET /reports — liste paginée. filters: { status, type, campusId, vendorId, studentId }
// range: { from: Date, to: Date } — optionnel, filtre par date de signalement.
export function getReports(page = 1, limit = 10, filters = {}, range) {
  const params = new URLSearchParams({ page, limit, ...rangeParams(range) });
  if (filters.status) params.set('status', filters.status);
  if (filters.type) params.set('type', filters.type);
  if (filters.campusId) params.set('campusId', filters.campusId);
  if (filters.vendorId) params.set('vendorId', filters.vendorId);
  if (filters.studentId) params.set('studentId', filters.studentId);
  return apiFetch(`/reports?${params.toString()}`);
}

// GET /reports/:id — signalement avec étudiant, cantine et résumé de la commande.
export function getReport(id) {
  return apiFetch(`/reports/${id}`);
}

// PATCH /reports/:id — { status, treatedByWebUserId }
export function updateReport(id, patch) {
  return apiFetch(`/reports/${id}`, { method: 'PATCH', body: patch });
}
