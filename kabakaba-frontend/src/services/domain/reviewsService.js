import { apiFetch } from '../httpClient';
import { extractList } from './usersService';

function buildQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') usp.set(key, value);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export async function findReviews({ page = 1, limit = 20, vendorId, rating, search, sortBy = 'recent' } = {}) {
  // CDC 4.6/9.7 : les avis sont internes, réservés au rôle Supervision — le
  // backend exige désormais une authentification (WebUserRole.SUPERVISION),
  // il ne les sert plus publiquement. auth: false ferait échouer cet appel
  // en 401.
  const response = await apiFetch(`/reviews${buildQuery({ page, limit, vendorId, rating, search, sortBy })}`);
  return extractList(response);
}