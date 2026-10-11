import { apiFetch } from '../httpClient';

// Construit le suffixe de query string pour une plage personnalisée
// { from: Date, to: Date }. Si absente, on retombe sur `days` (comportement historique).
function rangeParams(range) {
  if (!range?.from || !range?.to) return '';
  return `&from=${range.from.toISOString()}&to=${range.to.toISOString()}`;
}

// Routes d'indicateurs d'administration (orders-summary, stock) : le backend lit `from` et `to`
// comme des jours UTC. On envoie donc le jour calendrier choisi (AAAA-MM-JJ), pas un instant.
function dayParam(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayRangeQuery(range, extra = {}) {
  const params = new URLSearchParams(extra);
  if (range?.from && range?.to) {
    params.set('from', dayParam(range.from));
    params.set('to', dayParam(range.to));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

// { totals: { orders, receivedOrders, cancelledOrders, unclaimedOrders, revenueTickets, completionRate },
//   daily: [{ date, orders, revenueTickets, cancelledOrders }] }
export function getOrdersSummary(range) {
  return apiFetch(`/admin/analytics/orders-summary${dayRangeQuery(range)}`);
}

// { topComponents, ruptures, peakHours, peakWeekdays }
export function getStockAnalytics(range, limit = 10) {
  return apiFetch(`/admin/analytics/stock${dayRangeQuery(range, { limit })}`);
}

export function getTopCanteens(days = 30, limit = 10, range) {
  return apiFetch(`/admin/analytics/top-canteens?days=${days}&limit=${limit}${rangeParams(range)}`);
}

export function getRevenueBreakdown(days = 30, range) {
  return apiFetch(`/admin/analytics/revenue?days=${days}${rangeParams(range)}`);
}

export function getVendorPerformance(days = 30, range) {
  return apiFetch(`/admin/analytics/vendors?days=${days}${rangeParams(range)}`);
}

export function getStudentBehavior(days = 30, range) {
  return apiFetch(`/admin/analytics/students?days=${days}${rangeParams(range)}`);
}

export function getVendorFinancials(days = 30, range) {
  return apiFetch(`/admin/analytics/vendor-financials?days=${days}${rangeParams(range)}`);
}

export function getReviewsQuality(days = 30, range) {
  return apiFetch(`/admin/analytics/reviews?days=${days}${rangeParams(range)}`);
}
