import { apiFetch } from '../httpClient';

// On ne récupère que meta.total (limit=1) : ce service sert uniquement à
// compter les commandes par statut, pas à lister leur contenu.
export function countOrdersByStatus(status) {
  return apiFetch(`/orders?status=${status}&page=1&limit=1`).then((res) => res.meta?.total ?? 0);
}
