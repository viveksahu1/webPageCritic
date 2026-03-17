<script setup>
import { ref } from 'vue';
import { useAuditStore, scoreCol, sevStyle } from '../auditStore.js';
import { useAuth } from '../composables/useAuth.js';

const { addAudit } = useAuditStore();
const { getAuthHeaders } = useAuth();

const urlInput    = ref('');
const loading     = ref(false);
const error       = ref('');
const results     = ref(null);
const statusText  = ref('');
const currentStep = ref(-1);

const steps = [
  'Fetching the page...',
  'Scanning DOM structure...',
  'Running CRO & UX audit...',
  'Checking SEO & accessibility...',
  'Analysing performance signals...',
  'Generating recommendations...',
];

const API_BASE = import.meta.env.VITE_API_URL || '';

const normUrl = (raw) => {
  raw = raw.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  return raw;
};

async function analyze() {
  error.value   = '';
  results.value = null;
  const url = normUrl(urlInput.value);
  if (!url) { error.value = 'Please enter a URL to analyze.'; return; }

  loading.value     = true;
  currentStep.value = 0;
  statusText.value  = steps[0];

  let si = 0;
  const ticker = setInterval(() => {
    si = Math.min(si + 1, steps.length - 1);
    currentStep.value = si;
    statusText.value  = steps[si];
  }, 1800);

  try {
    const res  = await fetch(`${API_BASE}/api/analyze`, {
      method:  'POST',
      headers: getAuthHeaders(),
      body:    JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    results.value = data;
    addAudit({ ...data, url });
  } catch (err) {
    error.value = `Could not analyze this page. ${err.message || 'Make sure the URL is public and the server is running.'}`;
  } finally {
    clearInterval(ticker);
    currentStep.value = -1;
    loading.value     = false;
  }
}

const prefill = (url) => { urlInput.value = url; analyze(); };
const reset   = () => { results.value = null; urlInput.value = ''; error.value = ''; };

// helpers
const sevUx = (s) => {
  if (s === 'high')   return { bg: 'rgba(239,68,68,0.12)',  text: '#f87171' };
  if (s === 'medium') return { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' };
  return                     { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa' };
};
const priCol = (p) => {
  if (p === 'critical') return { bg: 'rgba(239,68,68,0.12)',  text: '#f87171' };
  if (p === 'high')     return { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' };
  return                       { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa' };
};
const scoreLabel = (n) => n >= 75 ? 'Good' : n >= 50 ? 'Fair' : 'Poor';

const breakdownItems = (bd) => bd ? [
  { label: 'UX',            score: bd.ux,            icon: '📐' },
  { label: 'Copywriting',   score: bd.copywriting,   icon: '✍️' },
  { label: 'Conversion',    score: bd.conversion,    icon: '📈' },
  { label: 'SEO',           score: bd.seo,            icon: '🔍' },
  { label: 'Performance',   score: bd.performance,   icon: '⚡' },
  { label: 'Accessibility', score: bd.accessibility, icon: '♿' },
] : [];
</script>

<template>
  <!-- Topbar -->
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">New Audit</div>
      <div class="topbar-sub">Full-stack landing page analysis</div>
    </div>
    <div class="topbar-status">
      <span class="status-dot" :class="loading ? 'loading' : 'idle'"></span>
      {{ loading ? statusText : 'Ready' }}
    </div>
  </div>

  <!-- URL input -->
  <div class="url-section">
    <div class="url-field-wrap">
      <div class="url-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </div>
      <input v-model="urlInput" class="url-input" type="text" placeholder="https://yourstartup.com"
        @keyup.enter="analyze" :disabled="loading" />
      <button class="analyze-btn" :disabled="loading" @click="analyze">
        <span v-if="loading">Analyzing...</span>
        <span v-else><span class="btn-icon">⚡</span> Analyze</span>
      </button>
    </div>
    <div class="quick-links">
      Try:
      <button @click="prefill('linear.app')">linear.app</button>
      <button @click="prefill('notion.so')">notion.so</button>
      <button @click="prefill('vercel.com')">vercel.com</button>
      <button @click="prefill('stripe.com')">stripe.com</button>
    </div>
  </div>

  <!-- Error -->
  <div v-if="error" id="errorBox" style="display:block;margin:16px 28px 0">{{ error }}</div>

  <!-- Loading -->
  <div v-if="loading" id="loadingPanel" style="display:flex">
    <div class="loading-inner">
      <div class="loading-spinner"></div>
      <div class="loading-steps">
        <div v-for="(step, i) in steps" :key="step" class="lstep"
          :class="{ active: i === currentStep, done: i < currentStep }">{{ step }}</div>
      </div>
    </div>
  </div>

  <!-- ═══════════ RESULTS ═══════════ -->
  <div v-if="results" id="results" style="display:block">

    <!-- KPI row -->
    <div class="kpi-row" style="grid-template-columns:repeat(5,1fr)">
      <div class="kpi-card">
        <div class="kpi-label">Overall Score</div>
        <div class="kpi-value" :style="{ color: scoreCol(results.overallScore).text }">{{ results.overallScore }}</div>
        <div class="kpi-sub">{{ results.verdict }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Domain</div>
        <div class="kpi-value kpi-domain">{{ urlInput }}</div>
        <div class="kpi-sub">{{ new Date().toLocaleDateString() }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Issues Found</div>
        <div class="kpi-value" style="color:#f87171">{{ results.issues?.length || 0 }}</div>
        <div class="kpi-sub">{{ results.issues?.filter(i=>i.severity==='critical').length || 0 }} critical</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Performance</div>
        <div class="kpi-value" :style="{ color: scoreCol(results.performance?.score || 0).text }">
          {{ results.performance?.score || '—' }}
        </div>
        <div class="kpi-sub">{{ scoreLabel(results.performance?.score || 0) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Accessibility</div>
        <div class="kpi-value" :style="{ color: scoreCol(results.accessibility?.score || 0).text }">
          {{ results.accessibility?.score || '—' }}
        </div>
        <div class="kpi-sub">{{ scoreLabel(results.accessibility?.score || 0) }}</div>
      </div>
    </div>

    <!-- ── 🏆 Gamified Score Breakdown ─────────────────────────────── -->
    <div class="panel" style="margin-bottom:12px" v-if="results.scoreBreakdown">
      <div class="panel-header">
        <span class="panel-title">📊 Score Breakdown</span>
        <span class="panel-badge">{{ results.overallScore }}/100</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:0;border-top:1px solid var(--border)">
        <div v-for="item in breakdownItems(results.scoreBreakdown)" :key="item.label"
          style="padding:16px 12px;text-align:center;border-right:1px solid var(--border);last-child:border-none">
          <div style="font-size:18px;margin-bottom:6px">{{ item.icon }}</div>
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;letter-spacing:-0.02em"
            :style="{ color: scoreCol(item.score).text }">{{ item.score }}</div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--hint);margin-top:3px">{{ item.label }}</div>
          <div style="margin-top:8px;height:3px;background:var(--surface3);border-radius:2px;overflow:hidden">
            <div :style="{ width: item.score+'%', background: scoreCol(item.score).bar, height:'100%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-header">
        <span class="panel-title">Summary</span>
        <span class="panel-badge">{{ results.overallScore }}/100</span>
      </div>
      <div style="padding:16px;font-size:13px;color:var(--muted);line-height:1.7">{{ results.summary }}</div>
    </div>

    <!-- Main 2-col grid -->
    <div class="dash-grid">
      <div class="dash-col">

        <!-- Category Scores -->
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Category Scores</span></div>
          <div class="cat-list">
            <div v-for="cat in [...(results.categories || []), ...(results.croMetrics || [])]"
              :key="cat.name" class="cat-row">
              <div class="cr-top">
                <span class="cr-label">{{ cat.name }}</span>
                <span class="cr-score" :style="{ color: scoreCol(cat.score).text }">{{ cat.score }}/100</span>
              </div>
              <div class="cr-track"><div class="cr-fill" :style="{ width: cat.score+'%', background: scoreCol(cat.score).bar }"></div></div>
              <div class="cr-note">{{ cat.note }}</div>
            </div>
          </div>
        </div>

        <!-- ── 📉 UX Friction ──────────────────────────────────────── -->
        <div class="panel" v-if="results.uxFriction">
          <div class="panel-header">
            <span class="panel-title">📉 UX Friction</span>
            <span class="panel-badge" :style="{ color: scoreCol(results.uxFriction.score).text }">
              {{ results.uxFriction.score }}/100
            </span>
          </div>
          <div class="issue-list">
            <div v-for="(item, i) in results.uxFriction.issues" :key="i" class="issue-card">
              <div class="issue-top">
                <span class="sev-tag" :style="{ background: sevUx(item.severity).bg, color: sevUx(item.severity).text }">
                  {{ item.severity }}
                </span>
                <span class="issue-title">{{ item.issue }}</span>
              </div>
              <div class="issue-desc">{{ item.detail }}</div>
              <div class="issue-fix"><span class="fix-arrow">→</span> {{ item.fix }}</div>
            </div>
          </div>
        </div>

        <!-- ── ♿ Accessibility ─────────────────────────────────────── -->
        <div class="panel" v-if="results.accessibility">
          <div class="panel-header">
            <span class="panel-title">♿ Accessibility</span>
            <span class="panel-badge" :style="{ color: scoreCol(results.accessibility.score).text }">
              {{ results.accessibility.score }}/100
            </span>
          </div>
          <div class="issue-list">
            <div v-for="(item, i) in results.accessibility.issues" :key="i" class="issue-card">
              <div class="issue-top">
                <span class="sev-tag" style="background:rgba(96,165,250,0.12);color:#60a5fa">WCAG {{ item.wcag }}</span>
                <span class="sev-tag" :style="{ background: sevUx(item.severity === 'critical' ? 'high' : item.severity).bg, color: sevUx(item.severity === 'critical' ? 'high' : item.severity).text }">
                  {{ item.severity }}
                </span>
                <span class="issue-title" style="flex:1">{{ item.issue }}</span>
              </div>
              <div class="issue-fix"><span class="fix-arrow">→</span> {{ item.fix }}</div>
            </div>
          </div>
        </div>

        <!-- Wins -->
        <div class="panel" v-if="results.wins?.length">
          <div class="panel-header">
            <span class="panel-title">What's Working</span>
            <span class="panel-badge" style="color:var(--green)">✓ {{ results.wins.length }}</span>
          </div>
          <div class="wins-list">
            <div v-for="win in results.wins" :key="win" class="win-row">
              <div class="win-check">✓</div>{{ win }}
            </div>
          </div>
        </div>

      </div>

      <div class="dash-col">

        <!-- Issues -->
        <div class="panel" v-if="results.issues?.length">
          <div class="panel-header">
            <span class="panel-title">Conversion Issues</span>
            <span class="panel-badge issues-badge">{{ results.issues.length }}</span>
          </div>
          <div class="issue-list">
            <div v-for="issue in results.issues" :key="issue.title" class="issue-card">
              <div class="issue-top">
                <span class="sev-tag" :style="{ background: sevStyle(issue.severity).bg, color: sevStyle(issue.severity).text }">
                  {{ issue.severity }}
                </span>
                <span class="issue-title">{{ issue.title }}</span>
              </div>
              <div class="issue-desc">{{ issue.description }}</div>
              <div class="issue-fix"><span class="fix-arrow">→</span> {{ issue.fix }}</div>
            </div>
          </div>
        </div>

        <!-- ── ⚡ Performance ──────────────────────────────────────── -->
        <div class="panel" v-if="results.performance">
          <div class="panel-header">
            <span class="panel-title">⚡ Performance</span>
            <span class="panel-badge" :style="{ color: scoreCol(results.performance.score).text }">
              {{ results.performance.score }}/100
            </span>
          </div>
          <div class="issue-list">
            <div v-for="(item, i) in results.performance.issues" :key="i" class="issue-card">
              <div class="issue-top">
                <span class="sev-tag" :style="{ background: sevUx(item.severity).bg, color: sevUx(item.severity).text }">
                  {{ item.severity }}
                </span>
                <span class="issue-title">{{ item.issue }}</span>
              </div>
              <div class="issue-desc">{{ item.impact }}</div>
              <div class="issue-fix"><span class="fix-arrow">→</span> {{ item.fix }}</div>
            </div>
          </div>
          <div v-if="results.performance.recommendations?.length" style="padding:12px 16px;border-top:1px solid var(--border)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:var(--hint);margin-bottom:8px">Recommendations</div>
            <div v-for="(rec, i) in results.performance.recommendations" :key="i"
              style="display:flex;gap:8px;margin-bottom:6px;font-size:12px;color:var(--muted)">
              <span style="color:var(--green);flex-shrink:0">→</span>{{ rec }}
            </div>
          </div>
        </div>

        <!-- ── 🔍 SEO Audit ────────────────────────────────────────── -->
        <div class="panel" v-if="results.seo">
          <div class="panel-header">
            <span class="panel-title">🔍 SEO Audit</span>
            <span class="panel-badge" :style="{ color: scoreCol(results.seo.score).text }">
              {{ results.seo.score }}/100
            </span>
          </div>
          <div class="issue-list">
            <div v-for="(item, i) in results.seo.issues" :key="i" class="issue-card">
              <div class="issue-top">
                <span class="sev-tag" :style="{ background: priCol(item.priority).bg, color: priCol(item.priority).text }">
                  {{ item.priority }}
                </span>
                <span class="issue-title">{{ item.issue }}</span>
              </div>
              <div class="issue-fix"><span class="fix-arrow">→</span> {{ item.fix }}</div>
            </div>
          </div>
          <div v-if="results.seo.positives?.length" style="padding:10px 16px;border-top:1px solid var(--border)">
            <div v-for="p in results.seo.positives" :key="p"
              style="display:flex;gap:8px;padding:5px 0;font-size:12px;color:var(--muted)">
              <span style="color:var(--green)">✓</span>{{ p }}
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── 🧪 A/B Tests full width ────────────────────────────────── -->
    <div class="panel" style="margin-top:12px" v-if="results.abTests?.length">
      <div class="panel-header">
        <span class="panel-title">🧪 A/B Test Ideas</span>
        <span class="panel-badge">{{ results.abTests.length }} tests</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:0">
        <div v-for="test in results.abTests" :key="test.id"
          style="padding:16px;border-right:1px solid var(--border);border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
            <span style="font-family:var(--font-mono);font-size:10px;background:var(--surface3);border:1px solid var(--border);border-radius:4px;padding:2px 8px;color:var(--muted)">Test {{ test.id }}</span>
            <span style="font-size:12px;font-weight:600;color:var(--text)">{{ test.element }}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="font-size:10px;font-weight:700;color:var(--red);background:rgba(239,68,68,0.1);padding:2px 6px;border-radius:3px;flex-shrink:0;margin-top:1px">A</span>
              <span style="font-size:12px;color:var(--muted);font-family:var(--font-mono)">{{ test.variantA }}</span>
            </div>
            <div style="display:flex;gap:8px;align-items:flex-start">
              <span style="font-size:10px;font-weight:700;color:var(--green);background:rgba(34,197,94,0.1);padding:2px 6px;border-radius:3px;flex-shrink:0;margin-top:1px">B</span>
              <span style="font-size:12px;font-weight:500;color:var(--text);font-family:var(--font-mono)">{{ test.variantB }}</span>
            </div>
          </div>
          <div style="font-size:11px;color:var(--hint);line-height:1.55;margin-bottom:6px">{{ test.hypothesis }}</div>
          <div style="font-size:11px;font-weight:600;color:var(--green);font-family:var(--font-mono)">Expected: {{ test.expectedLift }}</div>
        </div>
      </div>
    </div>

    <!-- ── Quick Wins + Roadmap ───────────────────────────────────── -->
    <div class="dash-grid" style="margin-top:12px">
      <div class="dash-col">

        <!-- Quick Wins -->
        <div class="panel" v-if="results.quickWins?.length">
          <div class="panel-header">
            <span class="panel-title">⚡ Quick Wins</span>
            <span class="panel-badge" style="color:var(--green)">under 30 min</span>
          </div>
          <div>
            <div v-for="(win, i) in results.quickWins" :key="i"
              style="display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border)">
              <div style="width:22px;height:22px;border-radius:50%;background:var(--green-bg);border:1px solid rgba(34,197,94,0.2);color:var(--green);font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">{{ i + 1 }}</div>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px">{{ win.action }}</div>
                <div style="font-size:11px;color:var(--green)">{{ win.impact }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Optimisation -->
        <div class="panel" v-if="results.ctaOptimization?.length">
          <div class="panel-header"><span class="panel-title">CTA Optimisation</span></div>
          <div class="cta-list">
            <div v-for="cta in results.ctaOptimization" :key="cta.original" class="cta-item">
              <div class="cta-compare">
                <span class="cta-old">{{ cta.original }}</span>
                <span class="cta-arrow">→</span>
                <span class="cta-new">{{ cta.suggested }}</span>
              </div>
              <div class="cta-reason">{{ cta.reason }}</div>
            </div>
          </div>
        </div>

      </div>
      <div class="dash-col">

        <!-- Priority Roadmap -->
        <div class="panel" v-if="results.priorityRoadmap?.length">
          <div class="panel-header">
            <span class="panel-title">Priority Roadmap</span>
          </div>
          <div>
            <div v-for="item in results.priorityRoadmap" :key="item.priority"
              style="display:flex;gap:14px;padding:14px 16px;border-bottom:1px solid var(--border);align-items:flex-start">
              <div style="font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--hint);width:20px;flex-shrink:0;line-height:1">{{ item.priority }}</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px">{{ item.action }}</div>
                <div style="font-size:11px;color:var(--muted);margin-bottom:4px">{{ item.why }}</div>
                <span style="font-size:10px;font-weight:600;font-family:var(--font-mono);background:var(--surface3);border:1px solid var(--border);border-radius:4px;padding:2px 7px;color:var(--hint)">
                  {{ item.timeframe }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Copy Suggestions -->
        <div class="panel" v-if="results.copyRewrites?.length">
          <div class="panel-header"><span class="panel-title">Copy Suggestions</span></div>
          <div class="rewrite-list">
            <div v-for="rw in results.copyRewrites" :key="rw.section" class="rewrite-item">
              <div class="rw-section">{{ rw.section }}</div>
              <div class="rw-original">{{ rw.original }}</div>
              <div class="rw-suggested">{{ rw.suggested }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Competitor Gaps -->
    <div class="panel" style="margin-top:12px" v-if="results.competitorGaps">
      <div class="panel-header"><span class="panel-title">📊 Competitor Gaps</span></div>
      <div style="padding:16px;font-size:13px;color:var(--muted);line-height:1.7">{{ results.competitorGaps }}</div>
    </div>

    <div class="reset-row">
      <button class="reset-btn" @click="reset">← Analyze another page</button>
    </div>
  </div>
</template>