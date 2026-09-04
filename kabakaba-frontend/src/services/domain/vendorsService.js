import { apiFetch } from '../httpClient';

// GET /vendors est public, pagination simple (page, limit — max 100).
// Forme : { data: [{ id, canteenName, logoUrl, bannerUrl, description,
//   isActive, isOpen, createdAt }], meta: { page, limit, total, totalPages } }
export function getVendors(page = 1, limit = 100) {
  return apiFetch(`/vendors?page=${page}&limit=${limit}`);
}

// POST /vendors — crée le compte vendeur (User) et la cantine (Vendor) en
// une seule opération. body: { vendor: {firstName,lastName,phone,email,
// temporaryPassword}, canteen: {canteenName,campusIds,...} }
export function createVendor(vendor, canteen) {
  return apiFetch('/vendors', { method: 'POST', body: { vendor, canteen } });
}
// GET /vendors/admin/list — liste enrichie (propriétaire, créance, commandes
// du jour, campus) pour le dashboard admin. filters: { search, campusId,
// status: 'active'|'suspended', hasDebt: 'true' }
export function getVendorsForAdmin(page = 1, limit = 10, filters = {}) {
  const params = new URLSearchParams({ page, limit });
  if (filters.search) params.set('search', filters.search);
  if (filters.campusId) params.set('campusId', filters.campusId);
  if (filters.status) params.set('status', filters.status);
  if (filters.hasDebt) params.set('hasDebt', filters.hasDebt);
  return apiFetch(`/vendors/admin/list?${params.toString()}`);
}

// GET /vendors/admin/:id — détail complet pour la fiche admin (contact
// vendeur, créance, suspension, campus en entier). Différent de
// GET /vendors/:id, qui est la route publique vitrine étudiante.
export function getVendorForAdmin(id) {
  return apiFetch(`/vendors/admin/${id}`);
}

// PATCH /vendors/:id — canteenName, isActive/suspensionReason, isOpen,
// campusIds (remplace intégralement la liste des campus affiliés).
export function updateVendor(id, patch) {
  return apiFetch(`/vendors/${id}`, { method: 'PATCH', body: patch });
}

// GET /vendors/:vendorId/schedules — horaires typiques d'ouverture.
export function getVendorSchedules(vendorId) {
  return apiFetch(`/vendors/${vendorId}/schedules`);
}

// POST /vendors/:vendorId/schedules — { day, startTime, endTime }.
export function createVendorSchedule(vendorId, schedule) {
  return apiFetch(`/vendors/${vendorId}/schedules`, { method: 'POST', body: schedule });
}

// DELETE /vendors/:vendorId/schedules/:id
export function deleteVendorSchedule(vendorId, id) {
  return apiFetch(`/vendors/${vendorId}/schedules/${id}`, { method: 'DELETE' });
}
