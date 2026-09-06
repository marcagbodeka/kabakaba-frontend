import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { clearLegacyToken, AUTH_EXPIRED_EVENT } from '../services/httpClient';
import * as webAuth from '../services/webAuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const isAuthenticated = Boolean(user);

  const applySession = useCallback((_sessionToken, sessionUser) => {
    // Le JWT de session est HttpOnly et n'est volontairement jamais exposé
    // ni stocké côté JavaScript. Le premier argument est conservé pour la
    // compatibilité avec les écrans existants.
    clearLegacyToken();
    if (sessionUser) setUser(sessionUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await webAuth.logout();
    } catch {
      // Même si le serveur est indisponible, on purge l'état local et le
      // navigateur supprimera le cookie lors du prochain appel réussi.
    } finally {
      clearLegacyToken();
      setUser(null);
      setSessionChecked(true);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await webAuth.getMe();
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    let active = true;
    clearLegacyToken();
    refreshMe()
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setSessionChecked(true); });
    return () => { active = false; };
  }, [refreshMe]);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearLegacyToken();
      setUser(null);
      setSessionChecked(true);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  const value = {
    token: null,
    user,
    isAuthenticated,
    sessionChecked,
    applySession,
    logout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}
