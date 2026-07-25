import { apiFetch } from '../httpClient';

export function getCampusComparison(days = 30) {
  return apiFetch(`/admin/analytics/campuses?days=${days}`);
}

export function getTopCanteens(days = 30, limit = 10) {
  return apiFetch(`/admin/analytics/top-canteens?days=${days}&limit=${limit}`);
}

export function getRevenueBreakdown(days = 30) {
  return apiFetch(`/admin/analytics/revenue?days=${days}`);
}