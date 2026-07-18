import {
  LayoutDashboard,
  Building2,
  Utensils,
  Users,
  Star,
  Trophy,
  Settings,
} from 'lucide-react';

// Une seule source de vérité pour la sidebar.
// Chaque page n'a plus besoin de redéclarer son propre HTML de nav.
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
    items: [{ label: 'Paramètres', path: '/supervision/parametres', icon: Settings }],
  },
];
