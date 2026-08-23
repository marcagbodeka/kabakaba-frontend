import {
  LayoutDashboard,
  Building2,
  Utensils,
  Users,
  Star,
  Trophy,
  ShieldCheck,
  Settings,
} from 'lucide-react';

export const navSections = [
  {
    label: 'Tableau de bord',
    items: [
      { label: 'Vue générale', path: '/supervision/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Analyse',
    items: [
      {
        label: 'Par campus',
        icon: Building2,
        children: [
          { label: 'Comparaison campus', path: '/supervision/campus' },
          { label: 'Volume & revenus', path: '/supervision/campus/revenus' },
        ],
      },
      {
        label: 'Par cantine',
        icon: Utensils,
        children: [
          { label: 'Performance vendeurs', path: '/supervision/cantines/performance' },
          { label: 'Solde & créances', path: '/supervision/cantines/solde' },
        ],
      },
      {
        label: 'Étudiants',
        icon: Users,
        children: [
          { label: 'Comportement étudiants', path: '/supervision/etudiants' },
          { label: 'Comptes suspendus', path: '/supervision/etudiants/suspendus' },
          { label: 'Historique des suspensions', path: '/supervision/etudiants/historique' },
        ],
      },
    ],
  },
  {
    label: 'Qualité',
    items: [
      {
        label: 'Avis & qualité',
        icon: Star,
        children: [
          { label: 'Notes & alertes', path: '/supervision/qualite/notes' },
          { label: 'Commentaires', path: '/supervision/qualite/commentaires' },
        ],
      },
    ],
  },
  {
    label: 'Programme',
    items: [
      {
        label: 'Ambassadeurs',
        icon: Trophy,
        children: [
          { label: 'Supervision ambassadeurs', path: '/supervision/ambassadeurs' },
        ],
      },
    ],
  },
  {
    label: 'Compte',
    items: [
      {
        label: 'Gestion des comptes',
        icon: ShieldCheck,
        children: [
          { label: 'Comptes Supervision', path: '/supervision/comptes/supervision' },
          { label: 'Comptes Admin', path: '/supervision/comptes/admin' },
        ],
      },
      { label: 'Paramètres', path: '/supervision/parametres', icon: Settings },
    ],
  },
];