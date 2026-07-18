import {
  LayoutDashboard,
  Utensils,
  AlertTriangle,
  Trophy,
  UserPlus,
  Monitor,
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
          { label: 'Campus & facultés', path: '/admin/cantines/campus' },
        ],
      },
      {
        label: 'Litiges',
        icon: AlertTriangle,
        children: [
          { label: 'File des litiges', path: '/admin/litiges' },
          { label: 'Comptes suspendus', path: '/admin/litiges/suspensions' },
        ],
      },
      {
        label: 'Ambassadeurs',
        icon: Trophy,
        children: [
          { label: 'Liste ambassadeurs', path: '/admin/ambassadeurs' },
          { label: 'Demandes en attente', path: '/admin/ambassadeurs/demandes', count: 3 },
        ],
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
    items: [{ label: 'Transactions', path: '/admin/transactions', icon: Monitor }],
  },
  {
    label: 'Compte',
    items: [{ label: 'Paramètres', path: '/admin/parametres', icon: Settings }],
  },
];
