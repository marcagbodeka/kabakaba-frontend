import { apiFetch } from '../httpClient';

// Construit le suffixe de query string pour une plage personnalisée
// { from: Date, to: Date }. Si absente, on retombe sur `days` (comportement historique).
function rangeParams(range) {
  if (!range?.from || !range?.to) return '';
  return `&from=${range.from.toISOString()}&to=${range.to.toISOString()}`;
}

export function getCampusComparison(days = 30, range) {
  return apiFetch(`/admin/analytics/campuses?days=${days}${rangeParams(range)}`);
}

export function getTopCanteens(days = 30, limit = 10) {
  return apiFetch(`/admin/analytics/top-canteens?days=${days}&limit=${limit}`);
}

export function getRevenueBreakdown(days = 30, range) {
  return apiFetch(`/admin/analytics/revenue?days=${days}${rangeParams(range)}`);
}

export function getVendorPerformance(days = 30, range) {
  return apiFetch(`/admin/analytics/vendors?days=${days}${rangeParams(range)}`);
}

export function getStudentBehavior(days = 30) {
  return apiFetch(`/admin/analytics/students?days=${days}`);
}

export function getVendorFinancials(days = 30) {
  return apiFetch(`/admin/analytics/vendor-financials?days=${days}`);
}

export function getReviewsQuality(days = 30) {
  return apiFetch(`/admin/analytics/reviews?days=${days}`);
}

export function getAmbassadorRanking(days = 30) {
  return apiFetch(`/admin/analytics/ambassadors?days=${days}`);
}

export function getAmbassadorDetail(id, days = 30) {
  return apiFetch(`/admin/analytics/ambassadors/${id}?days=${days}`);
}