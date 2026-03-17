<script setup>
import { useRouter } from 'vue-router';
import { useAuditStore, scoreCol } from '../auditStore.js';

const router = useRouter();
const { history, avgScore, topIssues } = useAuditStore();

const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const hostname = (url) => { try { return new URL(url).hostname; } catch { return url; } };
</script>

<template>
  <!-- Top bar -->
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">Dashboard</div>
      <div class="topbar-sub">Landing page conversion intelligence</div>
    </div>
    <button class="analyze-btn" style="border-radius:8px;height:38px;padding:0 18px;font-size:12px" @click="router.push('/audit')">
      <span class="btn-icon">+</span> New Audit
    </button>
  </div>

  <div style="padding:20px 28px 40px">
    <!-- KPI row -->
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">Total Audits</div>
        <div class="kpi-value">{{ history.length }}</div>
        <div class="kpi-sub">pages analyzed</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Score</div>
        <div class="kpi-value" :style="{ color: scoreCol(avgScore).text }">{{ avgScore || '—' }}</div>
        <div class="kpi-sub">across all audits</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Critical Issues</div>
        <div class="kpi-value" style="color:#f87171">
          {{ history.reduce((s,a) => s + (a.issues||[]).filter(i=>i.severity==='critical').length, 0) }}
        </div>
        <div class="kpi-sub">total found</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Last Audit</div>
        <div class="kpi-value kpi-domain">
          {{ history.length ? hostname(history[0].url) : '—' }}
        </div>
        <div class="kpi-sub">{{ history.length ? fmt(history[0].date) : 'No audits yet' }}</div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!history.length" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 0;gap:14px;color:var(--muted);">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <div style="font-size:14px;font-weight:600;color:var(--muted)">No audits yet</div>
      <div style="font-size:12px;color:var(--hint)">Run your first audit to see results here</div>
      <button class="analyze-btn" style="border-radius:8px;height:38px;padding:0 18px;font-size:12px;margin-top:8px" @click="router.push('/audit')">
        Start Auditing →
      </button>
    </div>

    <!-- Dashboard grid -->
    <div v-else class="dash-grid">
      <!-- Left col -->
      <div class="dash-col">
        <!-- Recent audits -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">Recent Audits</span>
            <span class="panel-badge">{{ history.length }}</span>
          </div>
          <div>
            <div
              v-for="audit in history.slice(0,6)"
              :key="audit.id"
              style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer"
              @click="router.push('/history')"
            >
              <div
                style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:14px;font-weight:800;flex-shrink:0"
                :style="{ background: scoreCol(audit.overallScore).bg, color: scoreCol(audit.overallScore).text }"
              >{{ audit.overallScore }}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  {{ hostname(audit.url) }}
                </div>
                <div style="font-size:11px;color:var(--hint)">{{ fmt(audit.date) }} · {{ (audit.issues||[]).length }} issues</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--hint);flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>

        <!-- Top Issues -->
        <div class="panel" v-if="topIssues.length">
          <div class="panel-header">
            <span class="panel-title">Most Common Issues</span>
          </div>
          <div class="cat-list">
            <div v-for="issue in topIssues" :key="issue.title" class="cat-row">
              <div class="cr-top">
                <span class="cr-label">{{ issue.title }}</span>
                <span class="cr-score" style="color:var(--red)">×{{ issue.count }}</span>
              </div>
              <div class="cr-track">
                <div class="cr-fill" :style="{ width: Math.min(100, issue.count * 20) + '%', background: '#ef4444' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right col -->
      <div class="dash-col">
        <!-- Score distribution -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">Score Breakdown</span>
          </div>
          <div style="padding:16px">
            <div v-for="range in [{ label:'Excellent (75–100)', min:75, max:100, col:'#4ade80' }, { label:'Fair (50–74)', min:50, max:74, col:'#fbbf24' }, { label:'Poor (0–49)', min:0, max:49, col:'#f87171' }]" :key="range.label" style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px">
                <span style="color:var(--muted)">{{ range.label }}</span>
                <span :style="{ color: range.col, fontFamily:'var(--font-mono)' }">
                  {{ history.filter(a => a.overallScore >= range.min && a.overallScore <= range.max).length }}
                </span>
              </div>
              <div class="cr-track">
                <div class="cr-fill" :style="{
                  width: history.length ? (history.filter(a => a.overallScore >= range.min && a.overallScore <= range.max).length / history.length * 100) + '%' : '0%',
                  background: range.col
                }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">Quick Actions</span>
          </div>
          <div style="padding:12px 0">
            <div v-for="action in [
              { label: 'Run new audit', desc: 'Analyze a landing page URL', icon: '⚡', path: '/audit' },
              { label: 'View history', desc: 'Browse all past audits', icon: '📋', path: '/history' },
              { label: 'Compare pages', desc: 'Side-by-side analysis', icon: '⚖', path: '/compare' },
              { label: 'Insights', desc: 'Patterns across your audits', icon: '📊', path: '/insights' },
            ]" :key="action.label"
              style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background 0.12s"
              @click="router.push(action.path)"
              @mouseenter="$event.target.style.background='var(--surface2)'"
              @mouseleave="$event.target.style.background=''"
            >
              <span style="font-size:16px;width:24px;text-align:center">{{ action.icon }}</span>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text)">{{ action.label }}</div>
                <div style="font-size:11px;color:var(--hint)">{{ action.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>