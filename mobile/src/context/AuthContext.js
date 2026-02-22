import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { fetchJson, setTokenGetter } from '../api/client.js';

const AUTH_TOKEN_KEY = 'routewatch_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(false);
  const [authConfig, setAuthConfig] = useState({ passwordAuth: true, googleAuth: false });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(null);

  const persistToken = useCallback(async (token) => {
    tokenRef.current = token;
    if (token) await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  }, []);

  useEffect(() => {
    setTokenGetter(() => tokenRef.current);
  }, []);

  const checkAuth = useCallback(async () => {
    const timeoutMs = 8000;
    let done = false;
    const t = setTimeout(() => {
      if (done) return;
      done = true;
      setLoading(false);
      setIsAuthenticated(false);
      setAuthEnabled(true);
    }, timeoutMs);
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      tokenRef.current = token;
      const data = await fetchJson('/api/auth/me');
      if (done) return;
      done = true;
      setIsAuthenticated(true);
      setAuthEnabled(data?.authEnabled ?? false);
      setUser(data?.user ?? null);
    } catch {
      if (done) return;
      done = true;
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      tokenRef.current = null;
      setIsAuthenticated(false);
      setAuthEnabled(true);
      setUser(null);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchJson('/api/auth/config');
        if (!cancelled) setAuthConfig({ passwordAuth: !!data?.passwordAuth, googleAuth: !!data?.googleAuth });
      } catch {
        if (!cancelled) setAuthConfig({ passwordAuth: true, googleAuth: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data?.token) await persistToken(data.token);
    setIsAuthenticated(true);
    setAuthEnabled(data?.authEnabled ?? true);
    setUser(data?.user ?? null);
  }, [persistToken]);

  const register = useCallback(async (name, email, password) => {
    const data = await fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data?.token) await persistToken(data.token);
    setIsAuthenticated(true);
    setAuthEnabled(data?.authEnabled ?? true);
    setUser(data?.user ?? null);
  }, [persistToken]);

  const logout = useCallback(async () => {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    await persistToken(null);
    setIsAuthenticated(false);
    setUser(null);
  }, [persistToken]);

  const setUserFromResponse = useCallback((userFromApi) => {
    if (userFromApi && typeof userFromApi === 'object') {
      setUser((prev) => (prev ? { ...prev, ...userFromApi } : userFromApi));
    }
  }, []);

  const refreshToken = useCallback(async (newToken) => {
    if (newToken) await persistToken(newToken);
  }, [persistToken]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, authEnabled, authConfig, user, loading, login, register, logout, checkAuth, setUserFromResponse, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
