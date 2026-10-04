# Kabakaba — Dashboard web

Application React (Vite) d'administration et de supervision de Kabakaba. Elle consomme l'API du
dépôt `kabakaba-backend` (préfixe `/api/v1`).

## Démarrage local

```bash
npm install
npm run dev        # http://localhost:5173
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Prévisualise le build |

## Configuration de l'API

L'URL de l'API est résolue dans `src/services/httpClient.js` :

1. `VITE_API_BASE_URL` si elle est définie (par exemple pour un environnement de staging) ;
2. sinon `/api/v1` en production (redirigé vers le backend par `vercel.json`) ;
3. sinon `http://localhost:3000/api/v1` en développement.

## Structure de `src/`

| Dossier | Contenu |
|---|---|
| `pages/` | Écrans (admin, supervision, authentification, site vitrine) |
| `components/` | Composants partagés (`Topbar`, sélecteur de dates, modales de compte…) |
| `layouts/` | Mise en page du dashboard |
| `router/` | Entrées de navigation (`navConfigAdmin.js`, `navConfigSupervision.js`) ; les routes sont déclarées dans `App.jsx` |
| `services/` | Client HTTP (`httpClient.js`) et appels par domaine (`services/domain/`) |
| `context/` | Contexte d'authentification |
| `utils/` | Fonctions utilitaires partagées (dates, chaînes…) |
| `styles/` | Styles globaux et tokens |

## Déploiement (Vercel)

`vercel.json` redirige `/api/v1/*` vers le backend déployé, renvoie `index.html` pour les autres
chemins (application monopage) et définit les en-têtes de sécurité, dont la Content-Security-Policy.
Si l'URL du backend change, mettre à jour à la fois la redirection et la directive `connect-src`.
