import { apiFetch } from '../httpClient';
import { extractList } from './usersService';

// GET /campuses est public (aucun guard côté backend).
export async function findAllCampuses() {
  const response = await apiFetch('/campuses?limit=100', { auth: false });
  return extractList(response).items;
}