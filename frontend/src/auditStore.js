import { ref, computed } from 'vue';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ── Shared reactive state ─────────────────────────────────────────────────────
const history = ref([]);

function getToken() {
  return localStorage.getItem('critic_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export function useAuditStore() {

  // ── Load all audits from DB ─────────────────────────────────────────────────
  const fetchAudits = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/audits`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        // Normalize: map _id → id and createdAt → date to match existing view code
        history.value = data.audits.map(normalise);
      }
    } catch (err) {
      console.error('fetchAudits error:', err);
    }
  };

  // ── Save a new audit to DB ──────────────────────────────────────────────────
  const addAudit = async (audit) => {
    try {
      const res  = await fetch(`${API_BASE}/api/audits`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify(audit),
      });
      const data = await res.json();
      if (data.success) {
        history.value.unshift(normalise(data.audit));
      }
    } catch (err) {
      console.error('addAudit error:', err);
    }
  };

  // ── Delete a single audit ───────────────────────────────────────────────────
  const removeAudit = async (id) => {
    try {
      await fetch(`${API_BASE}/api/audits/${id}`, {
        method:  'DELETE',
        headers: authHeaders(),
      });
      history.value = history.value.filter(a => a.id !== id);
    } catch (err) {
      console.error('removeAudit error:', err);
    }
  };

  // ── Clear all audits ────────────────────────────────────────────────────────
  const clearHistory = async () => {
    try {
      await fetch(`${API_BASE}/api/audits`, {
        method:  'DELETE',
        headers: authHeaders(),
      });
      history.value = [];
    } catch (err) {
      console.error('clearHistory error:', err);
    }
  };

  // ── Computed helpers (same as before) ──────────────────────────────────────
  const avgScore = computed(() => {
    if (!history.value.length) return 0;
    return Math.round(
      history.value.reduce((s, a) => s + (a.overallScore || 0), 0) / history.value.length
    );
  });

  const topIssues = computed(() => {
    const counts = {};
    history.value.forEach(a => {
      (a.issues || []).forEach(i => {
        counts[i.title] = (counts[i.title] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));
  });

  return { history, fetchAudits, addAudit, removeAudit, clearHistory, avgScore, topIssues };
}

// ── Normalise DB doc → shape views expect ────────────────────────────────────
function normalise(doc) {
  return {
    ...doc,
    id:   doc._id || doc.id,
    date: doc.createdAt || doc.date,
  };
}

// ── Score / severity helpers (unchanged) ─────────────────────────────────────
export function scoreCol(n) {
  if (n >= 75) return { bg: 'rgba(34,197,94,0.12)',  text: '#4ade80', bar: '#22c55e' };
  if (n >= 50) return { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', bar: '#f59e0b' };
  return       { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', bar: '#ef4444' };
}

export function sevStyle(s) {
  if (s === 'critical') return { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' };
  if (s === 'high')     return { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' };
  return                       { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa' };
}