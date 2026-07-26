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

export async function findSuspensionEvents({ page = 1, limit = 50, status, trigger, studentId } = {}) {
  const response = await apiFetch(`/suspension-events${buildQuery({ page, limit, status, trigger, studentId })}`);
  return extractList(response);
}