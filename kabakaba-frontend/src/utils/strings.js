/** Initiales (2 lettres majuscules) d'un prénom et d'un nom ; "?" si absent. */
export function initials(firstName, lastName) {
  return `${(firstName || '?')[0]}${(lastName || '?')[0]}`.toUpperCase();
}
