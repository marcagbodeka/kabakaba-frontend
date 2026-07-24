import { apiFetch } from '../httpClient';

// Forme confirmée par un vrai appel :
// { totalUsers, totalVendors, totalOrders, totalPayments, totalTransactions,
//   activeSuspensions, suspensions30d, totalBanned }
export function getSupervisionStats() {
  return apiFetch('/admin/stats');
}