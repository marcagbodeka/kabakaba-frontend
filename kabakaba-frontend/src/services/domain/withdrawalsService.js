import { apiFetch } from '../httpClient';

// Même convention que analyticsService : { from: Date, to: Date } -> query params ISO.
function rangeParams(range) {
  if (!range?.from || !range?.to) return {};
  return { from: range.from.toISOString(), to: range.to.toISOString() };
}

// GET /withdrawals — liste des retraits vendeur (Admin/Supervision), filtrable
// par statut et par plage de dates. Le retrait est automatique côté plateforme
// (payout FedaPay) : cette page est un récapitulatif en lecture seule, pas un
// outil de traitement manuel — pas de PATCH exposé ici volontairement.
export function getWithdrawals(page = 1, limit = 10, status, range) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit), ...rangeParams(range) });
  if (status && status !== 'all') qs.set('status', status);
  return apiFetch(`/withdrawals?${qs.toString()}`);
}

// GET /withdrawals/stats — agrégat par statut (count + total débité), pour
// les KPI cards de la page Retraits.
export function getWithdrawalsStats() {
  return apiFetch('/withdrawals/stats');
}

// POST /withdrawals/:id/sync — synchronisation ponctuelle avec le payout fournisseur.
// Intentionnellement non exposé dans l'interface : réservé aux workflows internes
// ou à une future action opérateur explicitement autorisée.
export function syncWithdrawal(id) {
  if (!id || typeof id !== 'string') throw new TypeError('Identifiant de retrait invalide');
  return apiFetch(`/withdrawals/${encodeURIComponent(id)}/sync`, { method: 'POST' });
}
