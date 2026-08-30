import { apiFetch } from '../httpClient';

// GET /vendors est public, pagination simple (page, limit — max 100).
// Forme : { data: [{ id, canteenName, logoUrl, bannerUrl, description,
//   isActive, isOpen, createdAt }], meta: { page, limit, total, totalPages } }
export function getVendors(page = 1, limit = 100) {
  return apiFetch(`/vendors?page=${page}&limit=${limit}`);
}
