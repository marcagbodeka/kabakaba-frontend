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
  const response = await apiFetch(`/reviews${buildQuery({ page, limit, vendorId, rating, search, sortBy })}`, { auth: false });
  return extractList(response);
}