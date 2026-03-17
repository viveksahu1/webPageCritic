<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuditStore, scoreCol } from '../auditStore.js';

const router = useRouter();
const { history, avgScore, topIssues } = useAuditStore();
const hostname = (url) => { try { return new URL(url).hostname; } catch { return url; } };

const categoryAverages = computed(() => {
  if (!history.value.length) return [];
  const totals = {};
  const counts = {};
  history.value.forEach(a => {
    [...(a.categories || []), ...(a.croMetrics || [])].forEach(c => {
      totals[c.name] = (totals[c.name] || 0) + c.score;
      counts[c.name] = (counts[c.name] || 0) + 1;
    });
  });
  return Object.keys(totals)
    .map(name => ({ name, avg: Math.round(totals[name] / counts[name]) }))
    .sort((a, b) => a.avg - b.avg);
});

const weakest = computed(() => categoryAverages.value.slice(0, 3));
const strongest = computed(() => [...categoryAverages.value].sort((a,b) => b.avg - a.avg).slice(0, 3));
const scoreTrend = computed(() => [...history.value].reverse().slice(-12));
</script>

<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">Insights</div>
      <div class="topbar-sub">Patterns across {{ history.length }} audits</div>
    </div>
  </div>

  <div style="padding:20px 28px 40px">
    <div v-if="!history.length" style="display:flex;flex-direction:column;align-items:center;padding:80px 0;gap:14px">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--hint)"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      <div style="font-size:14px;font-weight:600;color:var(--muted)">Not enough data yet</div>
      <div style="font-size:12px;color:var(--hint)">Run a few audits to see patterns emerge</div>
      <button class="analyze-btn" style="border-radius:8px;height:38px;padding:0 18px;font-size:12px" @click="router.push('/audit')">Start Auditing</button>
    </div>

    <div v-else>
      <!-- KPI row -->
      <div class="kpi-row" style="margin-bottom:16px">
        <div class="kpi-card">
          <div class="kpi-label">Avg Score</div>
          <div class="kpi-value" :style="{ color: scoreCol(avgScore).text }">{{ avgScore }}</div>
          <div class="kpi-sub">across all audits</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Audits Run</div>
          <div class="kpi-value">{{ history.length }}</div>
          <div class="kpi-sub">total pages</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Weakest Area</div>
          <div class="kpi-value kpi-domain" style="color:#f87171">{{ weakest[0]?.name || '—' }}</div>
          <div class="kpi-sub">avg {{ weakest[0]?.avg ?? '—' }}/100</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Strongest Area</div>
          <div class="kpi-value kpi-domain" style="color:#4ade80">{{ strongest[0]?.name || '—' }}</div>
          <div class="kpi-sub">avg {{ strongest[0]?.avg ?? '—' }}/100</div>
        </div>
      </div>

      <div class="dash-grid">
        <div class="dash-col">
          <!-- Category averages -->
          <div class="panel">
            <div class="panel-header">
              <span class="panel-title">Category Averages</span>
            </div>
            <div class="cat-list">
              <div v-for="cat in categoryAverages" :key="cat.name" class="cat-row">
                <div class="cr-top">
                  <span class="cr-label">{{ cat.name }}</span>
                  <span class="cr-score" :style="{ color: scoreCol(cat.avg).text }">{{ cat.avg }}/100</span>
                </div>
                <div class="cr-track">
                  <div class="cr-fill" :style="{ width: cat.avg + '%', background: scoreCol(cat.avg).bar }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dash-col">
          <!-- Most common issues -->
          <div class="panel">
            <div class="panel-header">
              <span class="panel-title">Recurring Issues</span>
              <span class="panel-badge">Top {{ topIssues.length }}</span>
            </div>
            <div style="padding:6px 0">
              <div v-for="(issue, i) in topIssues" :key="issue.title" style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--border)">
                <div style="width:22px;height:22px;border-radius:50%;background:var(--surface3);color:var(--muted);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">{{ i+1 }}</div>
                <div style="flex:1;font-size:13px;color:var(--text)">{{ issue.title }}</div>
                <div style="font-family:var(--font-mono);font-size:12px;color:var(--red);background:var(--red-bg);border-radius:5px;padding:2px 8px">×{{ issue.count }}</div>
              </div>
            </div>
          </div>

          <!-- Score over time -->
          <div class="panel">
            <div class="panel-header">
              <span class="panel-title">Score Trend</span>
            </div>
            <div style="padding:16px">
              <div style="display:flex;align-items:flex-end;gap:4px;height:80px">
                <div
                  v-for="audit in scoreTrend"
                  :key="audit.id"
                  style="flex:1;border-radius:3px 3px 0 0;min-width:0;transition:height 0.5s;cursor:pointer;position:relative"
                  :style="{ height: audit.overallScore + '%', background: scoreCol(audit.overallScore).bar, opacity: 0.8 }"
                  :title="hostname(audit.url) + ' – ' + audit.overallScore"
                ></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--hint);margin-top:6px">
                <span>Oldest</span><span>Latest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>