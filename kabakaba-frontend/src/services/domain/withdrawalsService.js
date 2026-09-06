import { apiFetch } from '../httpClient';

// GET /withdrawals — liste des retraits vendeur (Admin/Supervision), filtrable
// par statut. Le retrait est automatique côté plateforme (payout FedaPay) :
// cette page est un récapitulatif en lecture seule, pas un outil de
// traitement manuel — pas de PATCH exposé ici volontairement.
export function getWithdrawals(page = 1, limit = 10, status) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status && status !== 'all') qs.set('status', status);
  return apiFetch(`/withdrawals?${qs.toString()}`);
}
