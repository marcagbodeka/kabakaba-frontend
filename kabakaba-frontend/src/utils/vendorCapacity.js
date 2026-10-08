// Statut de capacité d'une cantine (VendorCapacity côté backend) : libellés et classes d'affichage.
export const CAPACITY_LABEL = { OPEN: 'Ouverte', BUSY: 'Occupée', CLOSED: 'Fermée' };
export const CAPACITY_BADGE = { OPEN: 'badge-green', BUSY: 'badge-orange', CLOSED: 'badge-gray' };
export const CAPACITY_DOT = { OPEN: 'dot-green', BUSY: 'dot-orange', CLOSED: 'dot-gray' };
// Ordre d'affichage : ouvertes d'abord, puis occupées, puis fermées.
export const CAPACITY_RANK = { OPEN: 0, BUSY: 1, CLOSED: 2 };
