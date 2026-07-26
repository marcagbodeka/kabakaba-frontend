import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStoredToken, setStoredToken } from '../services/httpClient';
import * as webAuth from '../services/webAuthService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);

  const isAuthenticated = Boolean(token);

  const applySession = useCallback((sessionToken, sessionUser) => {
    setStoredToken(sessionToken);
    setToken(sessionToken);
    if (sessionUser) setUser(sessionUser);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await webAuth.getMe();
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    if (!token || user) return;
    refreshMe().catch(() => {
      setStoredToken(null);
      setToken(null);
    });
  }, [token, user, refreshMe]);

  const value = { token, user, isAuthenticated, applySession, logout, refreshMe };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}