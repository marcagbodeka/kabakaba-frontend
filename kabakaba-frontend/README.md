# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Configuration de l'API

Le build de production exige `VITE_API_BASE_URL`. Copiez `.env.example` vers un fichier d'environnement adapté à votre déploiement et renseignez l'URL HTTPS du backend.

Le service `syncWithdrawal()` existe pour permettre une future synchronisation opérateur d'un retrait avec le fournisseur de payout. Cette action n'est volontairement pas exposée dans l'interface actuelle.

## Sécurité de session Web

Le JWT de session Web n'est pas accessible au JavaScript : il est porté par un cookie `HttpOnly` émis par le backend. Les requêtes mutantes authentifiées utilisent le cookie CSRF `kabakaba_web_csrf` via l'en-tête `X-CSRF-Token`. Les tokens Bearer d'onboarding/réinitialisation restent des tokens de flux courts et ne sont pas stockés dans `sessionStorage`.
