<script setup>
import { ref, watch } from 'vue';
import { useAuditStore } from '../auditStore.js';

const { history, clearHistory } = useAuditStore();

const STORAGE_KEY = 'critic_settings';
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
const saved = loadSettings();

const apiUrl   = ref(saved.apiUrl);
const theme    = ref(saved.theme    || 'dark');
const autoSave = ref(saved.autoSave ?? true);
const saved_ok = ref(false);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    apiUrl: apiUrl.value,
    theme: theme.value,
    autoSave: autoSave.value,
  }));
  // Also expose API URL for AuditView via a custom event / env pattern
  window.__CRITIC_API_URL__ = apiUrl.value;
  saved_ok.value = true;
  setTimeout(() => saved_ok.value = false, 2000);
}

function confirmClear() {
  if (confirm('Delete all audit history? This cannot be undone.')) clearHistory();
}
</script>

<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="topbar-title">Settings</div>
      <div class="topbar-sub">Configure your workspace</div>
    </div>
  </div>

  <div style="padding:20px 28px 40px;max-width:560px">
    <!-- API config -->
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-header">
        <span class="panel-title">API Configuration</span>
      </div>
      <div style="padding:16px;display:flex;flex-direction:column;gap:14px">
        <div>
          <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);display:block;margin-bottom:7px">Backend URL</label>
          <input
            v-model="apiUrl"
            style="width:100%;background:var(--surface2);border:1px solid var(--border-md);border-radius:8px;color:var(--text);font-family:var(--font-mono);font-size:13px;padding:10px 14px;outline:none"
            placeholder="http://localhost:3100"
          />
          <div style="font-size:11px;color:var(--hint);margin-top:5px">The URL of your backend analysis server. Set VITE_API_URL in .env for production.</div>
        </div>
      </div>
    </div>

    <!-- Preferences -->
    <div class="panel" style="margin-bottom:12px">
      <div class="panel-header">
        <span class="panel-title">Preferences</span>
      </div>
      <div style="padding:0">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text)">Auto-save audits</div>
            <div style="font-size:11px;color:var(--hint)">Save every audit result to history automatically</div>
          </div>
          <div
            style="width:40px;height:22px;border-radius:999px;cursor:pointer;transition:background 0.2s;position:relative;flex-shrink:0"
            :style="{ background: autoSave ? 'var(--green-bar)' : 'var(--surface3)' }"
            @click="autoSave = !autoSave"
          >
            <div style="position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:white;transition:left 0.2s" :style="{ left: autoSave ? '21px' : '3px' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="panel" style="margin-bottom:20px;border-color:rgba(239,68,68,0.2)">
      <div class="panel-header" style="background:var(--red-bg)">
        <span class="panel-title" style="color:var(--red)">Danger Zone</span>
      </div>
      <div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:14px">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text)">Clear audit history</div>
          <div style="font-size:11px;color:var(--hint)">{{ history.length }} audits stored locally. This cannot be undone.</div>
        </div>
        <button
          @click="confirmClear"
          style="background:var(--red-bg);border:1px solid rgba(239,68,68,0.3);border-radius:8px;color:var(--red);font-size:12px;font-weight:600;padding:8px 16px;cursor:pointer;white-space:nowrap;flex-shrink:0"
        >Clear All</button>
      </div>
    </div>

    <!-- Save button -->
    <button
      @click="save"
      style="height:42px;padding:0 24px;background:var(--text);color:var(--bg);border:none;border-radius:8px;font-family:var(--font-display);font-size:13px;font-weight:700;cursor:pointer;transition:opacity 0.15s"
    >
      {{ saved_ok ? '✓ Saved' : 'Save Settings' }}
    </button>
  </div>
</template>
