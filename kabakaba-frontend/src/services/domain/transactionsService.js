import { apiFetch } from '../httpClient';

// GET /transactions/stats — KPIs de la page Transactions.
export function getTransactionsStats() {
  return apiFetch('/transactions/stats');
}

// GET /transactions/debts — créances vendeur actives.
export function getActiveDebts() {
  return apiFetch('/transactions/debts');
}

// GET /transactions — liste paginée. filters: { type, status, vendorId, campusId }
export function getTransactions(page = 1, limit = 10, filters = {}) {
  const params = new URLSearchParams({ page, limit });
  if (filters.type) params.set('type', filters.type);
  if (filters.status) params.set('status', filters.status);
  if (filters.vendorId) params.set('vendorId', filters.vendorId);
  if (filters.campusId) params.set('campusId', filters.campusId);
  return apiFetch(`/transactions?${params.toString()}`);
}

// GET /transactions/:id
export function getTransaction(id) {
  return apiFetch(`/transactions/${id}`);
}
