import { ref, computed } from 'vue';

const TOKEN_KEY = 'critic_token';
const USER_KEY  = 'critic_user';

// ── Shared reactive state (module-level singleton) ───────────────────────────
const token = ref(localStorage.getItem(TOKEN_KEY) || null);
const user  = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  // ── Persist helpers ────────────────────────────────────────────────────────
  function persist(t, u) {
    token.value = t;
    user.value  = u;
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }

  function clear() {
    token.value = null;
    user.value  = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // ── API call wrapper ───────────────────────────────────────────────────────
  async function authFetch(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // ── signup ─────────────────────────────────────────────────────────────────
  async function signup(name, email, password) {
    const data = await authFetch('/api/auth/signup', { name, email, password });
    persist(data.token, data.user);
    return data;
  }

  // ── login ──────────────────────────────────────────────────────────────────
  async function login(email, password) {
    const data = await authFetch('/api/auth/login', { email, password });
    persist(data.token, data.user);
    return data;
  }

  // ── logout ─────────────────────────────────────────────────────────────────
  function logout() {
    clear();
  }

  // ── getAuthHeaders (used by AuditView for /api/analyze) ───────────────────
  function getAuthHeaders() {
    return token.value
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` }
      : { 'Content-Type': 'application/json' };
  }

  return { token, user, isLoggedIn, signup, login, logout, getAuthHeaders };
}