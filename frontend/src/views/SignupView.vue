<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';

const router    = useRouter();
const { signup } = useAuth();

const name     = ref('');
const email    = ref('');
const password = ref('');
const error    = ref('');
const loading  = ref(false);

async function submit() {
  error.value = '';
  if (!name.value || !email.value || !password.value) {
    error.value = 'Please fill in all fields.';
    return;
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.';
    return;
  }
  loading.value = true;
  try {
    await signup(name.value, email.value, password.value);
    router.push('/');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <!-- Left brand panel -->
    <div class="auth-brand">
      <div class="auth-brand-inner">
        <div class="sidebar-logo" style="padding:0;border:none;margin-bottom:40px">
          <div class="logo-mark">C</div>
          <span class="logo-text">critic<span class="logo-dot">.</span></span>
        </div>
        <h2 class="auth-headline">Stop guessing why visitors don't convert.</h2>
        <p class="auth-tagline">Get a full CRO audit in seconds — headline clarity, CTA strength, trust signals, and more.</p>

        <div class="auth-stat-row">
          <div class="auth-stat" v-for="s in stats" :key="s.label">
            <div class="auth-stat-val">{{ s.val }}</div>
            <div class="auth-stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="auth-form-panel">
      <div class="auth-card">
        <div style="margin-bottom:28px">
          <div class="auth-card-title">Create account</div>
          <div class="auth-card-sub">Free forever. No credit card needed.</div>
        </div>

        <div class="auth-error" v-if="error">{{ error }}</div>

        <div class="auth-field">
          <label class="auth-label">Full Name</label>
          <input
            v-model="name"
            class="auth-input"
            type="text"
            placeholder="John Doe"
            @keyup.enter="submit"
            :disabled="loading"
          />
        </div>

        <div class="auth-field">
          <label class="auth-label">Email</label>
          <input
            v-model="email"
            class="auth-input"
            type="email"
            placeholder="you@example.com"
            @keyup.enter="submit"
            :disabled="loading"
          />
        </div>

        <div class="auth-field">
          <label class="auth-label">Password</label>
          <input
            v-model="password"
            class="auth-input"
            type="password"
            placeholder="Min. 6 characters"
            @keyup.enter="submit"
            :disabled="loading"
          />
        </div>

        <button class="analyze-btn auth-submit-btn" :disabled="loading" @click="submit">
          <span v-if="loading">Creating account...</span>
          <span v-else>Create Account →</span>
        </button>

        <div class="auth-switch">
          Already have an account?
          <router-link to="/login" class="auth-link">Sign in</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    stats: [
      { val: '8',    label: 'Graded categories' },
      { val: '< 10s', label: 'Audit time' },
      { val: '100%',  label: 'AI-powered' },
    ],
  }),
};
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.auth-brand {
  flex: 1;
  background:
    radial-gradient(ellipse 80% 60% at 20% 50%, rgba(34,197,94,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 80% 20%, rgba(96,165,250,0.04) 0%, transparent 55%),
    var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 56px;
}

.auth-brand-inner { max-width: 400px; }

.auth-headline {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text);
  line-height: 1.25;
  margin-bottom: 12px;
}

.auth-tagline {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 36px;
}

.auth-stat-row {
  display: flex;
  gap: 24px;
}

.auth-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.auth-stat-val {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: var(--green);
  letter-spacing: -0.02em;
}

.auth-stat-label {
  font-size: 11px;
  color: var(--hint);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
}

.auth-form-panel {
  width: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background: var(--bg);
}

.auth-card { width: 100%; max-width: 360px; }

.auth-card-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
  margin-bottom: 4px;
}

.auth-card-sub { font-size: 13px; color: var(--muted); }

.auth-error {
  background: var(--red-bg);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
  color: var(--red);
  margin-bottom: 18px;
}

.auth-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }

.auth-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.auth-input {
  height: 44px;
  background: var(--surface);
  border: 1px solid var(--border-md);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 0 14px;
  outline: none;
  transition: border-color 0.15s;
}
.auth-input:focus { border-color: var(--border-hi); }
.auth-input::placeholder { color: var(--hint); }
.auth-input:disabled { opacity: 0.5; }

.auth-submit-btn {
  width: 100%;
  height: 46px;
  border-radius: var(--radius);
  font-size: 14px;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 20px;
}

.auth-switch { font-size: 13px; color: var(--muted); text-align: center; }

.auth-link {
  color: var(--green);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}
.auth-link:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .auth-brand { display: none; }
  .auth-form-panel { width: 100%; }
}
</style>