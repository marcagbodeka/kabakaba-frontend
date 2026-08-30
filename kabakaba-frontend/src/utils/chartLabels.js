/** Formate une date ISO ("YYYY-MM-DD") en "27 août" — utilisé par LineChart. */
export function formatChartDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

/** Titre de section adaptatif : "(7 jours)" devient "(30 jours)", etc. */
export function chartPeriodTitle(baseTitle, pointCount) {
  const n = pointCount ?? 0;
  return `${baseTitle} (${n} jour${n > 1 ? 's' : ''})`;
}
