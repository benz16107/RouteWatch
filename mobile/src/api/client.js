/**
 * API client for RouteWatch backend.
 * Base URL from EXPO_PUBLIC_API_URL. Supports optional Bearer token via getToken.
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

let tokenGetter = null;

export function setTokenGetter(getter) {
  tokenGetter = getter;
}

export function getApiBase() {
  return API_BASE.replace(/\/$/, '');
}

export async function fetchJson(path, options = {}) {
  const url = path.startsWith('http') ? path : `${getApiBase()}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = { ...(options.headers || {}) };
  let body = options.body;
  if (typeof body === 'object' && body !== null && !(body instanceof FormData)) {
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const token = tokenGetter ? await tokenGetter() : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers, body });
  } catch (e) {
    const msg = e?.message || String(e);
    if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network') || e?.name === 'TypeError') {
      throw new Error('Cannot reach the server. Make sure the backend is running and EXPO_PUBLIC_API_URL is correct.');
    }
    throw e;
  }

  const text = await res.text();
  if (!text || !text.trim()) {
    throw new Error(res.ok ? 'Empty response' : `Request failed: ${res.status}`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response: ${text.slice(0, 100)}...`);
  }
  if (!res.ok) {
    if (res.status === 401 && data?.authEnabled) {
      const e = new Error(data?.error || 'Not authenticated');
      e.status = 401;
      e.authEnabled = true;
      throw e;
    }
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}
