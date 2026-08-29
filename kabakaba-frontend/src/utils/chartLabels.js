const DAY_LABELS_FR = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam', 0: 'Dim' };

/**
 * Formate les labels (dates ISO "YYYY-MM-DD") d'un graphique journalier
 * renvoyé par le backend. Le nombre de points s'adapte désormais à la
 * période choisie (voir DateRangePicker) au lieu d'être figé à 7 jours :
 * - période courte (<= 7 jours) : nom du jour ("Lun", "Mar"...)
 * - période plus longue : "JJ/MM" pour éviter les noms de jour répétés/ambigus
 */
export function formatChartDayLabels(isoLabels) {
  const labels = isoLabels ?? [];
  if (labels.length <= 7) {
    return labels.map((d) => DAY_LABELS_FR[new Date(d).getDay()]);
  }
  return labels.map((d) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
}

/** Titre de section adaptatif : "(7 jours)" devient "(30 jours)", etc. */
export function chartPeriodTitle(baseTitle, pointCount) {
  const n = pointCount ?? 0;
  return `${baseTitle} (${n} jour${n > 1 ? 's' : ''})`;
}
