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

export function getVendorPerformance(days = 30) {
  return apiFetch(`/admin/analytics/vendors?days=${days}`);
}

export function getVendorFinancials(days = 30) {
  return apiFetch(`/admin/analytics/vendor-financials?days=${days}`);
}

export function getStudentBehavior(days = 30) {
  return apiFetch(`/admin/analytics/students?days=${days}`);
}

export function getReviewsQuality(days = 30) {
  return apiFetch(`/admin/analytics/reviews?days=${days}`);
}