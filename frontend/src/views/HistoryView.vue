<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuditStore, scoreCol, sevStyle } from '../auditStore.js';

const router = useRouter();
const { history, removeAudit, clearHistory } = useAuditStore();

const search  = ref('');
const sortBy  = ref('date');
const expanded = ref(null);

const filtered = computed(() => {
  let list = [...history.value];
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(a => a.url.toLowerCase().includes(q));
  }
  if (sortBy.value === 'score-hi') list.sort((a,b) => b.overallScore - a.overallScore);
  if (sortBy.value === 'score-lo') list.sort((a,b) => a.overallScore - b.overallScore);
  return list;
});

const fmt = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const toggle = (id) => { expanded.value = expanded.value === id ? null : id; };
</script>

<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">Audit History</div>
      <div class="topbar-sub">{{ history.length }} audits recorded</div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <button
        v-if="history.length"
        @click="clearHistory"
        style="background:none;border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:12px;padding:7px 14px;cursor:pointer"
      >Clear All</button>
      <button class="analyze-btn" style="border-radius:8px;height:38px;padding:0 18px;font-size:12px" @click="router.push('/audit')">
        + New Audit
      </button>
    </div>
  </div>

  <div style="padding:20px 28px 40px">
    <!-- Filters -->
    <div v-if="history.length" style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;background:var(--surface);border:1px solid var(--border-md);border-radius:8px;overflow:hidden;flex:1;max-width:340px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin:0 12px;color:var(--hint);flex-shrink:0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="search" placeholder="Filter by URL…" style="flex:1;height:38px;background:transparent;border:none;outline:none;color:var(--text);font-size:13px" />
      </div>
      <select v-model="sortBy" style="background:var(--surface);border:1px solid var(--border-md);border-radius:8px;color:var(--muted);font-size:12px;padding:0 12px;height:38px;cursor:pointer;outline:none">
        <option value="date">Sort: Latest First</option>
        <option value="score-hi">Sort: Score High→Low</option>
        <option value="score-lo">Sort: Score Low→High</option>
      </select>
    </div>

    <!-- Empty state -->
    <div v-if="!history.length" style="display:flex;flex-direction:column;align-items:center;padding:80px 0;gap:14px">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--hint)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <div style="font-size:14px;font-weight:600;color:var(--muted)">No history yet</div>
      <button class="analyze-btn" style="border-radius:8px;height:38px;padding:0 18px;font-size:12px" @click="router.push('/audit')">Run your first audit</button>
    </div>

    <!-- Audit list -->
    <div v-for="audit in filtered" :key="audit.id" class="panel" style="margin-bottom:10px">
      <!-- Row header -->
      <div
        style="display:flex;align-items:center;gap:14px;padding:14px 16px;cursor:pointer"
        @click="toggle(audit.id)"
      >
        <!-- Score bubble -->
        <div
          style="width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:15px;font-weight:800;flex-shrink:0"
          :style="{ background: scoreCol(audit.overallScore).bg, color: scoreCol(audit.overallScore).text }"
        >{{ audit.overallScore }}</div>

        <div style="flex:1;min-width:0">
          <div style="font-family:var(--font-mono);font-size:13px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            {{ audit.url }}
          </div>
          <div style="font-size:11px;color:var(--hint);margin-top:2px">{{ fmt(audit.date) }} · {{ audit.issues?.length || 0 }} issues</div>
        </div>

        <!-- Verdict pill -->
        <div style="font-size:11px;color:var(--muted);background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:3px 10px;white-space:nowrap;display:none" class="verdict-pill">
          {{ audit.verdict }}
        </div>

        <!-- Actions -->
        <button
          @click.stop="removeAudit(audit.id)"
          style="background:none;border:1px solid var(--border);border-radius:6px;color:var(--hint);width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0"
          title="Remove"
        >×</button>

        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--hint);flex-shrink:0;transition:transform 0.2s" :style="{ transform: expanded === audit.id ? 'rotate(90deg)' : '' }">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      <!-- Expanded detail -->
      <div v-if="expanded === audit.id" style="border-top:1px solid var(--border);padding:16px">
        <div style="font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:14px">{{ audit.summary }}</div>

        <!-- Category mini-scores -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:14px">
          <div
            v-for="cat in [...(audit.categories||[]), ...(audit.croMetrics||[])]"
            :key="cat.name"
            style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px 12px"
          >
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--hint);margin-bottom:6px">{{ cat.name }}</div>
            <div style="font-size:18px;font-weight:800;font-family:var(--font-display)" :style="{ color: scoreCol(cat.score).text }">{{ cat.score }}</div>
          </div>
        </div>

        <!-- Issues summary -->
        <div v-if="audit.issues?.length">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:var(--hint);margin-bottom:8px">Issues</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <span
              v-for="issue in audit.issues"
              :key="issue.title"
              style="font-size:11px;border-radius:5px;padding:3px 9px;font-weight:600"
              :style="{ background: sevStyle(issue.severity).bg, color: sevStyle(issue.severity).text }"
            >{{ issue.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 620px) { .verdict-pill { display: block !important; } }
</style>
