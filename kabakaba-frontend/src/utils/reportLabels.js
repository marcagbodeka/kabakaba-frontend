// Signalement d'un problème de commande (Report côté backend) : libellés et classes d'affichage.
export const REPORT_TYPE_LABEL = {
  WRONG_MEAL: 'Mauvais repas',
  MISSING_COMPONENT: 'Composant manquant',
  INCOMPLETE_ORDER: 'Commande incomplète',
  OTHER: 'Autre problème',
};
export const REPORT_STATUS_LABEL = { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Traité' };
// Classes de badge partagées (styles/dashboard.css).
export const REPORT_STATUS_BADGE = { OPEN: 'badge-red', IN_PROGRESS: 'badge-orange', RESOLVED: 'badge-green' };
