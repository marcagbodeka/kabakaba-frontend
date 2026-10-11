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

/** Date locale décalée de `n` jours calendaires (minuit local). */
export function addDays(d, n) {
  const copy = startOfDay(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Plage de même durée, immédiatement avant `range` ({ from, to } : jours inclus). */
export function previousRange(range) {
  const days = Math.round((startOfDay(range.to) - startOfDay(range.from)) / 86_400_000) + 1;
  const to = addDays(range.from, -1);
  return { from: addDays(to, -(days - 1)), to };
}
