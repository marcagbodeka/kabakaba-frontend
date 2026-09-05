import { apiFetch } from '../httpClient';

// GET /campuses/:campusId/faculties — public.
export function getFaculties(campusId) {
  return apiFetch(`/campuses/${campusId}/faculties`, { auth: false });
}

export function createFaculty(campusId, name) {
  return apiFetch(`/campuses/${campusId}/faculties`, { method: 'POST', body: { name } });
}

export function updateFaculty(campusId, id, patch) {
  return apiFetch(`/campuses/${campusId}/faculties/${id}`, { method: 'PATCH', body: patch });
}
