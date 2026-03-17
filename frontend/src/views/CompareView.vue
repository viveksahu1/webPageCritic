<script setup>
import { ref, computed } from 'vue';
import { useAuditStore, scoreCol } from '../auditStore.js';

const { history } = useAuditStore();

const hostname = (url) => { try { return new URL(url).hostname; } catch { return url; } };

const leftId  = ref('');
const rightId = ref('');

const left  = computed(() => history.value.find(a => a.id == leftId.value)  || null);
const right = computed(() => history.value.find(a => a.id == rightId.value) || null);

const allCatNames = computed(() => {
  const names = new Set();
  [left.value, right.value].forEach(a => {
    if (!a) return;
    [...(a.categories||[]), ...(a.croMetrics||[])].forEach(c => names.add(c.name));
  });
  return [...names];
});

const getCatScore = (audit, name) => {
  if (!audit) return null;
  const all = [...(audit.categories||[]), ...(audit.croMetrics||[])];
  return all.find(c => c.name === name)?.score ?? null;
};
</script>

<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">Compare</div>
      <div class="topbar-sub">Side-by-side audit comparison</div>
    </div>
  </div>

  <div style="padding:20px 28px 40px">
    <div v-if="history.length < 2" style="display:flex;flex-direction:column;align-items:center;padding:80px 0;gap:14px;color:var(--muted);">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--hint)"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      <div style="font-size:14px;font-weight:600">Need at least 2 audits</div>
      <div style="font-size:12px;color:var(--hint)">Run more audits to compare pages</div>
    </div>

    <div v-else>
      <!-- Selectors -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--hint);margin-bottom:8px">Page A</div>
          <select v-model="leftId" style="width:100%;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;color:var(--text);font-size:13px;padding:10px 12px;outline:none;cursor:pointer">
            <option value="" disabled>Select a page...</option>
            <option v-for="a in history" :key="a.id" :value="a.id">{{ hostname(a.url) }} ({{ a.overallScore }})</option>
          </select>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--hint);margin-bottom:8px">Page B</div>
          <select v-model="rightId" style="width:100%;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;color:var(--text);font-size:13px;padding:10px 12px;outline:none;cursor:pointer">
            <option value="" disabled>Select a page...</option>
            <option v-for="a in history" :key="a.id" :value="a.id">{{ hostname(a.url) }} ({{ a.overallScore }})</option>
          </select>
        </div>
      </div>

      <!-- Comparison table -->
      <div v-if="left && right" class="panel">
        <!-- Score header -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:var(--surface2);border-bottom:1px solid var(--border)">
          <div style="padding:16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--hint)">Category</div>
          <div style="padding:16px;text-align:center;border-left:1px solid var(--border)">
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:4px">{{ hostname(left.url) }}</div>
            <div style="font-family:var(--font-display);font-size:24px;font-weight:800" :style="{ color: scoreCol(left.overallScore).text }">{{ left.overallScore }}</div>
          </div>
          <div style="padding:16px;text-align:center;border-left:1px solid var(--border)">
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:4px">{{ hostname(right.url) }}</div>
            <div style="font-family:var(--font-display);font-size:24px;font-weight:800" :style="{ color: scoreCol(right.overallScore).text }">{{ right.overallScore }}</div>
          </div>
        </div>

        <!-- Category rows -->
        <div v-for="name in allCatNames" :key="name" style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid var(--border)">
          <div style="padding:12px 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted);display:flex;align-items:center">{{ name }}</div>
          <div v-for="audit in [left, right]" :key="audit.id" style="padding:12px 16px;border-left:1px solid var(--border);display:flex;align-items:center;justify-content:center;gap:10px">
            <template v-if="getCatScore(audit, name) !== null">
              <div style="flex:1;height:3px;background:var(--surface3);border-radius:2px;overflow:hidden">
                <div :style="{ width: getCatScore(audit, name)+'%', background: scoreCol(getCatScore(audit, name)).bar, height:'100%', borderRadius:'2px' }"></div>
              </div>
              <span style="font-family:var(--font-mono);font-size:12px;font-weight:600;min-width:28px;text-align:right" :style="{ color: scoreCol(getCatScore(audit, name)).text }">{{ getCatScore(audit, name) }}</span>
            </template>
            <span v-else style="color:var(--hint);font-size:12px">—</span>
          </div>
        </div>

        <!-- Verdict -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:var(--surface2)">
          <div style="padding:14px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--hint)">Verdict</div>
          <div v-for="audit in [left, right]" :key="audit.id" style="padding:14px 16px;border-left:1px solid var(--border);font-size:12px;color:var(--muted)">{{ audit.verdict }}</div>
        </div>
      </div>

      <div v-else-if="!left || !right" style="padding:40px 0;text-align:center;color:var(--hint);font-size:13px">Select two pages above to compare them</div>
    </div>
  </div>
</template>