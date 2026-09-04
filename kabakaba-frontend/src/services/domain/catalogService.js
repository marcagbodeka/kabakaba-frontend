import { apiFetch } from '../httpClient';

// GET /catalog/menu-items?vendorId=... — public, pagination simple.
export function getMenuItemsByVendor(vendorId, limit = 50) {
  return apiFetch(`/catalog/menu-items?vendorId=${vendorId}&page=1&limit=${limit}`, { auth: false });
}

// GET /catalog/menu-items/:id — détail d'un article (public).
export function getMenuItem(id) {
  return apiFetch(`/catalog/menu-items/${id}`, { auth: false });
}

// GET /catalog/menu-components/:itemId — composants d'un article (public).
export function getMenuComponents(itemId, limit = 50) {
  return apiFetch(`/catalog/menu-components/${itemId}?page=1&limit=${limit}`, { auth: false });
}

// GET /catalog/packaging-options/:itemId — conditionnements (public).
export function getPackagingOptions(itemId, limit = 50) {
  return apiFetch(`/catalog/packaging-options/${itemId}?page=1&limit=${limit}`, { auth: false });
}

export function createMenuItem(payload) {
  return apiFetch('/catalog/menu-items', { method: 'POST', body: payload });
}
export function updateMenuItem(id, payload) {
  return apiFetch(`/catalog/menu-items/${id}`, { method: 'PATCH', body: payload });
}

export function createMenuComponent(payload) {
  return apiFetch('/catalog/menu-components', { method: 'POST', body: payload });
}
export function updateMenuComponent(id, payload) {
  return apiFetch(`/catalog/menu-components/${id}`, { method: 'PATCH', body: payload });
}
export function deleteMenuComponent(id) {
  return apiFetch(`/catalog/menu-components/${id}`, { method: 'DELETE' });
}

export function createPackagingOption(payload) {
  return apiFetch('/catalog/packaging-options', { method: 'POST', body: payload });
}
export function updatePackagingOption(id, payload) {
  return apiFetch(`/catalog/packaging-options/${id}`, { method: 'PATCH', body: payload });
}
export function deletePackagingOption(id) {
  return apiFetch(`/catalog/packaging-options/${id}`, { method: 'DELETE' });
}
