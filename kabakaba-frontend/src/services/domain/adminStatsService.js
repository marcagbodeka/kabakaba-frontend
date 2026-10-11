import { apiFetch } from '../httpClient';

// Forme (admin.service.ts, getSupervisionStatsUncached) :
// { totalStudents, totalVendors, totalOrders, cancelledOrders, unclaimedOrders, revenueTickets,
//   totalPayments, totalTransactions, activeSuspensions, suspensions30d,
//   activeStudents30d, activeVendors30d }
export function getSupervisionStats() {
  return apiFetch('/admin/stats');
}

// Forme : { events: [{ id, type, message, occurredAt }], count, since }
// Se réinitialise chaque jour à minuit (fenêtre = depuis le début de la journée).
export function getTodayEvents() {
  return apiFetch('/admin/events/today');
}