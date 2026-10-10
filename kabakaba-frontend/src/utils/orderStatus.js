// Statut d'une commande (OrderStatus côté backend) : libellés d'affichage.
export const ORDER_STATUS_LABEL = {
  CONFIRMED: 'Confirmée',
  IN_PREPARATION: 'En préparation',
  READY: 'Prête',
  RECEIVED: 'Récupérée',
  CANCELLED: 'Annulée',
};
// Commandes dont le montant est « en attente » : tickets débités à l'étudiant, pas encore
// crédités à la cantine (le crédit se produit au passage à READY, voir orders.service.ts).
export const PENDING_AMOUNT_STATUSES = ['CONFIRMED', 'IN_PREPARATION'];
