import { apiFetch } from '../httpClient';

// Forme confirmée par un vrai appel :
// { totalUsers, totalVendors, totalOrders, totalPayments, totalTransactions,
//   activeSuspensions, suspensions30d, totalBanned }
export function getSupervisionStats() {
  return apiFetch('/admin/stats');
}

// Forme : { events: [{ id, type, message, occurredAt }], count, since }
// Se réinitialise chaque jour à minuit (fenêtre = depuis le début de la journée).
export function getTodayEvents() {
  return apiFetch('/admin/events/today');
}