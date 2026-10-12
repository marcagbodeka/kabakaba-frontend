import { apiFetch } from '../httpClient';
import { extractList } from './usersService';
import { buildQuery } from '../buildQuery';

export async function findReviews({ page = 1, limit = 20, vendorId, rating, search, sortBy = 'recent' } = {}) {
  // Avis internes (CDC 36 et 49) : réservés aux rôles web Supervision et Admin.
  // Le backend exige une authentification et ne les sert jamais publiquement :
  // auth: false ferait échouer cet appel en 401.
  const response = await apiFetch(`/reviews${buildQuery({ page, limit, vendorId, rating, search, sortBy })}`);
  return extractList(response);
}