import { apiFetch } from '../httpClient';
import { extractList } from './usersService';

// GET /campuses est public (aucun guard côté backend).
export async function findAllCampuses() {
  const response = await apiFetch('/campuses?limit=100', { auth: false });
  return extractList(response).items;
}

export function createCampus(payload) {
  return apiFetch('/campuses', { method: 'POST', body: payload });
}

export function updateCampus(id, payload) {
  return apiFetch(`/campuses/${id}`, { method: 'PATCH', body: payload });
}