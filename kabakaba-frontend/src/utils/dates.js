/** Minuit (heure locale) du jour de la date donnée. */
export function startOfDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Minuit (heure locale) d'il y a `n` jours. */
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}
