<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from './composables/useAuth.js';
import { useAuditStore } from './auditStore.js';

const route    = useRoute();
const router   = useRouter();
const { user, isLoggedIn, logout } = useAuth();
const { fetchAudits } = useAuditStore();

const isActive = (path) => route.path === path;

// ── Theme toggle ─────────────────────────────────────────────────────────────
const isDark = ref(localStorage.getItem('critic_theme') !== 'light');

function applyTheme(dark) {
  document.documentElement.classList.toggle('light', !dark);
  localStorage.setItem('critic_theme', dark ? 'dark' : 'light');
}

function toggleTheme() {
  isDark.value = !isDark.value;
  applyTheme(isDark.value);
}

// Apply saved preference on mount
applyTheme(isDark.value);

// ── Auth ──────────────────────────────────────────────────────────────────────
watch(isLoggedIn, (val) => { if (val) fetchAudits(); }, { immediate: true });

function handleLogout() {
  logout();
  router.push('/login');
}
</script>

<template>
  <!-- Auth pages: no sidebar layout -->
  <router-view v-if="!isLoggedIn" />

  <!-- App layout with sidebar -->
  <div v-else style="display:flex;min-height:100vh;">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark">C</div>
        <span class="logo-text">critic<span class="logo-dot">.</span></span>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-group-label">Main</div>

        <router-link to="/" custom v-slot="{ navigate }">
          <div class="nav-item" :class="{ active: isActive('/') }" @click="navigate">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </div>
        </router-link>

        <router-link to="/audit" custom v-slot="{ navigate }">
          <div class="nav-item" :class="{ active: isActive('/audit') }" @click="navigate">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            New Audit
          </div>
        </router-link>

        <router-link to="/history" custom v-slot="{ navigate }">
          <div class="nav-item" :class="{ active: isActive('/history') }" @click="navigate">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            History
          </div>
        </router-link>

        <div class="nav-group-label" style="margin-top:16px">Analysis</div>

        <router-link to="/insights" custom v-slot="{ navigate }">
          <div class="nav-item" :class="{ active: isActive('/insights') }" @click="navigate">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Insights
          </div>
        </router-link>

        <router-link to="/compare" custom v-slot="{ navigate }">
          <div class="nav-item" :class="{ active: isActive('/compare') }" @click="navigate">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Compare
          </div>
        </router-link>

        <div class="nav-group-label" style="margin-top:16px">Settings</div>

        <router-link to="/settings" custom v-slot="{ navigate }">
          <div class="nav-item" :class="{ active: isActive('/settings') }" @click="navigate">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Settings
          </div>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <!-- User info -->
        <div class="user-row" v-if="user">
          <div class="user-avatar">{{ user.name?.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>
        </div>

        <!-- Theme toggle -->
        <button class="theme-btn" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <svg v-if="isDark" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </button>

        <!-- Logout -->
        <button class="logout-btn" @click="handleLogout">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>

        <div class="sidebar-badge" style="margin-top:10px">
          <span class="pulse-dot"></span>
          AI Online
        </div>
      </div>
    </aside>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.user-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
  padding: 8px 10px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.user-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--green-bg);
  border: 1px solid rgba(34,197,94,0.25);
  color: var(--green);
  font-family: var(--font-display);
  font-weight: 800; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-info { min-width: 0; }
.user-name {
  font-size: 12px; font-weight: 600; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-email {
  font-size: 10px; color: var(--hint);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.theme-btn {
  width: 100%;
  display: flex; align-items: center; gap: 7px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 12px; font-weight: 500;
  padding: 7px 10px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.theme-btn:hover {
  border-color: var(--border-hi);
  color: var(--text);
  background: var(--surface2);
}

.logout-btn {
  width: 100%;
  display: flex; align-items: center; gap: 7px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 12px; font-weight: 500;
  padding: 7px 10px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: border-color 0.12s, color 0.12s;
}
.logout-btn:hover {
  border-color: rgba(239,68,68,0.3);
  color: var(--red);
}
</style>