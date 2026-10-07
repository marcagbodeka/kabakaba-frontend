import { apiFetch } from '../httpClient';

// GET /partner-applications?status=NEW — candidatures partenaires pas encore
// traitées. PartnerApplicationStatus n'a pas de valeur "PENDING" : le statut
// "reçue, pas encore contactée" s'appelle NEW dans ce modèle.
export function getNewPartnerApplications(limit = 20) {
  return apiFetch(`/partner-applications?status=NEW&page=1&limit=${limit}`);
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

// POST /partner-applications — public (CDC 8.2, formulaire "Devenir
// partenaire" du site vitrine). Le DTO backend attend structureName,
// contactName, phone, email, targetCampus, message — noms différents des
// champs du formulaire, mappés par l'appelant.
export function submitPartnerApplication(payload) {
  return apiFetch('/partner-applications', { method: 'POST', body: payload, auth: false });
}
