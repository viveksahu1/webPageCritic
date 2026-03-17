import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from './views/DashboardView.vue';
import AuditView     from './views/AuditView.vue';
import HistoryView   from './views/HistoryView.vue';
import InsightsView  from './views/InsightsView.vue';
import CompareView   from './views/CompareView.vue';
import SettingsView  from './views/SettingsView.vue';
import LoginView     from './views/LoginView.vue';
import SignupView    from './views/SignupView.vue';

const routes = [
  // ── Public routes ──────────────────────────────────────────────────────────
  { path: '/login',  name: 'Login',  component: LoginView,  meta: { public: true } },
  { path: '/signup', name: 'Signup', component: SignupView, meta: { public: true } },

  // ── Protected routes ───────────────────────────────────────────────────────
  { path: '/',         name: 'Dashboard', component: DashboardView },
  { path: '/audit',    name: 'Audit',     component: AuditView },
  { path: '/history',  name: 'History',   component: HistoryView },
  { path: '/insights', name: 'Insights',  component: InsightsView },
  { path: '/compare',  name: 'Compare',   component: CompareView },
  { path: '/settings', name: 'Settings',  component: SettingsView },

  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 }; },
});

// ── Navigation guard ─────────────────────────────────────────────────────────
router.beforeEach((to) => {
  const token = localStorage.getItem('critic_token');
  const isPublic = to.meta.public;

  // Not logged in → redirect to login (except public pages)
  if (!token && !isPublic) return { name: 'Login' };

  // Already logged in → redirect away from login/signup
  if (token && isPublic) return { name: 'Dashboard' };
});

export default router;