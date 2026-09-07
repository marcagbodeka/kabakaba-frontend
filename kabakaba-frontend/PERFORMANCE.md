# Optimisations performance

- Toutes les pages dashboard sont chargées à la demande via React.lazy : le premier chargement ne télécharge plus toutes les pages Admin/Supervision.
- Les GET authentifiés sont mis en cache 5 secondes en mémoire côté navigateur pour éviter les appels identiques déclenchés par plusieurs widgets.
- Toute mutation invalide ce cache.
- Le JWT Web reste HttpOnly et n'est jamais mis en cache par le code JavaScript.

# Validation

npm run build

Le warning Vite sur un chunk > 500 kB doit disparaître ou diminuer après le code-splitting. S'il reste, ce n'est pas bloquant.
