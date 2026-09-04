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

// PATCH /ambassadors/:id — accepter une candidature. Le backend génère le
// code promo lui-même dès que status passe à ACTIVE (aucun code n'est fourni
// ici) et le renvoie dans la réponse.
export function acceptAmbassadorApplication(id) {
  return apiFetch(`/ambassadors/${id}`, { method: 'PATCH', body: { status: 'ACTIVE' } });
}

// PATCH /ambassadors/:id — refuser une candidature avec motif obligatoire.
export function refuseAmbassadorApplication(id, decisionReason) {
  return apiFetch(`/ambassadors/${id}`, { method: 'PATCH', body: { status: 'REJECTED', decisionReason } });
}

// GET /partner-applications?status=... — une page de candidatures partenaires
// pour un statut donné (NEW | CONTACTED | ACCEPTED | REJECTED).
export function getPartnerApplicationsByStatus(status, limit = 50) {
  return apiFetch(`/partner-applications?status=${status}&page=1&limit=${limit}`);
}

// PATCH /partner-applications/:id — faire évoluer le statut d'une candidature.
export function updatePartnerApplicationStatus(id, status) {
  return apiFetch(`/partner-applications/${id}`, { method: 'PATCH', body: { status } });
}
