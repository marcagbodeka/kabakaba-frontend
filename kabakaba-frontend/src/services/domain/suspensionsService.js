import { apiFetch } from '../httpClient';
import { extractList } from './usersService';
import { buildQuery } from '../buildQuery';

export async function findSuspensionEvents({ page = 1, limit = 50, status, trigger, studentId } = {}) {
  const response = await apiFetch(`/suspension-events${buildQuery({ page, limit, status, trigger, studentId })}`);
  return extractList(response);
}