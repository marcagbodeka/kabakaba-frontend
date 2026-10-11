import {
  LayoutDashboard,
  Utensils,
  AlertTriangle,
  Users,
  UserPlus,
  Monitor,
  Banknote,
  Package,
  Settings,
} from 'lucide-react';

// Une seule source de vérité pour la sidebar Admin web.
// `count` affiche un badge numéroté (ex: demandes en attente) — à brancher
// sur l'API plus tard (nombre réel de lignes en attente de traitement).
export const navSections = [
  {
    label: 'Tableau de bord',
    items: [{ label: 'Vue vendeurs', path: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Gestion',
    items: [
      {
        label: 'Cantines',
        icon: Utensils,
        children: [
          { label: 'Liste des cantines', path: '/admin/cantines' },
          { label: 'Créer une cantine', path: '/admin/cantines/creer' },
          { label: 'Campus', path: '/admin/cantines/campus' },
        ],
      },
      {
        label: 'Signalements',
        icon: AlertTriangle,
        children: [{ label: 'File des signalements', path: '/admin/signalements' }],
      },
      {
        label: 'Étudiants',
        icon: Users,
        children: [{ label: 'Comptes suspendus', path: '/admin/etudiants/suspensions' }],
      },
      {
        label: 'Partenaires',
        icon: UserPlus,
        children: [{ label: 'Candidatures', path: '/admin/partenaires', count: 2 }],
      },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { label: 'Transactions', path: '/admin/transactions', icon: Monitor },
      { label: 'Retraits', path: '/admin/retraits', icon: Banknote },
      { label: 'Suivi du stock', path: '/admin/stock', icon: Package },
    ],
  },
  {
    label: 'Compte',
    items: [{ label: 'Paramètres', path: '/admin/parametres', icon: Settings }],
  },
];
