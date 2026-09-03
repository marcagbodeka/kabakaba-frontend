import { apiFetch } from '../httpClient';

// GET /ambassadors?status=PENDING — candidatures ambassadeur en attente de décision.
// Forme : { data: [...], meta: { total, ... } }
export function getPendingAmbassadors(limit = 20) {
  return apiFetch(`/ambassadors?status=PENDING&page=1&limit=${limit}`);
}

// GET /partner-applications?status=NEW — candidatures partenaires pas encore
// traitées. PartnerApplicationStatus n'a pas de valeur "PENDING" : le statut
// "reçue, pas encore contactée" s'appelle NEW dans ce modèle.
export function getNewPartnerApplications(limit = 20) {
  return apiFetch(`/partner-applications?status=NEW&page=1&limit=${limit}`);
}

// PATCH /ambassadors/:id — suspendre un ambassadeur avec motif obligatoire.
export function suspendAmbassador(id, decisionReason) {
  return apiFetch(`/ambassadors/${id}`, {
    method: 'PATCH',
    body: { status: 'SUSPENDED', decisionReason, suspendedAt: new Date().toISOString() },
  });
}
