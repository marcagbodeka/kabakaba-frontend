import { apiFetch } from '../httpClient';
import { extractList } from './usersService';
import { buildQuery } from '../buildQuery';

export async function findSuspensionEvents({ page = 1, limit = 50, status, studentId } = {}) {
  const response = await apiFetch(`/suspension-events${buildQuery({ page, limit, status, studentId })}`);
  return extractList(response);
}