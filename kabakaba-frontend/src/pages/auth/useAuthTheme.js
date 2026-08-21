import { useEffect, useState } from 'react';

const THEME_KEY = 'kabakaba-auth-theme';

/**
 * Thème clair/sombre partagé entre toutes les pages d'authentification
 * (Login, FirstLoginOnboarding). Persisté dans localStorage pour que le
 * choix survive à une navigation entre ces deux pages.
 */
export default function useAuthTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem(THEME_KEY) || 'light';
  });

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggle];
}
