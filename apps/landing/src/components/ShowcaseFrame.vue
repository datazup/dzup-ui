<script setup lang="ts">
import {
  DzAvatar,
  DzBadge,
  DzButton,
  DzCard,
  DzCardHeader,
  DzHeading,
  DzInput,
  DzProgress,
  DzSegmented,
  DzStatCard,
  DzSwitch,
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzText,
} from '@dzup-ui/core'
import { Activity, DollarSign, Search, TrendingUp, Users } from 'lucide-vue-next'
import { ref } from 'vue'

// The live browser-window dashboard, composed entirely from @dzup-ui/core
// (spec §4.3). Extracted from ShowcaseDashboard so it can be rendered twice —
// once inside a scoped `data-theme="light"` container and once inside a
// `data-theme="dark"` one — as the side-by-side "show, don't tell" proof. Each
// instance owns its own state so the two frames stay independent.
//
// `.frame-shell` is an inline-size container: the internal layout responds to
// the *frame's* width (via @container below), not the viewport — essential when
// each frame is only ~half the page in the desktop split.
withDefaults(defineProps<{ label?: string }>(), { label: 'the current' })

const query = ref('')
const notifications = ref(true)
const range = ref('30d')
const rangeItems = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
]

const rows = [
  { name: 'Ava Restić', email: 'ava@acme.io', plan: 'Team', usage: 72, status: 'Active' },
  { name: 'Liam Novak', email: 'liam@acme.io', plan: 'Solo', usage: 38, status: 'Active' },
  { name: 'Mara Petrović', email: 'mara@acme.io', plan: 'Org', usage: 91, status: 'Trial' },
  { name: 'Noah Kvist', email: 'noah@acme.io', plan: 'Solo', usage: 14, status: 'Invited' },
]

const statusTone: Record<string, 'success' | 'warning' | 'info'> = {
  Active: 'success',
  Trial: 'warning',
  Invited: 'info',
}

// Faux sparkline heights (%) — rendered as themed bars to imply a chart panel.
const bars = [38, 52, 44, 66, 58, 74, 63, 81, 70, 88, 79, 96]
</script>

<template>
  <div class="frame-shell">
    <div class="frame-glow" aria-hidden="true" />
    <div class="window" role="img" :aria-label="`Example analytics dashboard built with dzup-ui, shown in ${label} theme`">
      <div class="window-bar" aria-hidden="true">
        <span class="dots">
          <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
        </span>
        <span class="window-url">app.dzup-ui.com/dashboard</span>
        <span class="window-spacer" />
      </div>

      <div class="window-body">
        <div class="dash-toolbar">
          <div class="dash-title">
            <DzHeading :level="3" size="lg" weight="semibold">Overview</DzHeading>
            <DzBadge variant="subtle" tone="success" size="sm">Live</DzBadge>
          </div>
          <div class="dash-toolbar-right">
            <DzSegmented v-model="range" :items="rangeItems" size="sm" aria-label="Date range" />
            <DzInput v-model="query" placeholder="Search…" size="sm" clearable class="dash-search">
              <template #prefix><Search :size="15" aria-hidden="true" /></template>
            </DzInput>
            <DzButton size="sm" variant="solid" tone="primary">New report</DzButton>
          </div>
        </div>

        <div class="stat-row">
          <DzStatCard title="Revenue" value="$48.2k" trend="up" trend-value="+12.4%" :icon="DollarSign" />
          <DzStatCard title="Active users" value="2,318" trend="up" trend-value="+4.1%" :icon="Users" />
          <DzStatCard title="Sessions" value="9,042" trend="up" trend-value="+8.7%" :icon="Activity" />
          <DzStatCard title="Churn" value="1.2%" trend="down" trend-value="-0.3%" :icon="TrendingUp" />
        </div>

        <div class="dash-grid">
          <div class="dash-main">
            <DzCard variant="outlined" padding="md" class="chart-card">
              <div class="card-head-row">
                <div>
                  <DzText size="sm" tone="muted" as="div">Revenue</DzText>
                  <DzText weight="semibold" as="div" class="chart-figure">$48,210</DzText>
                </div>
                <DzBadge variant="subtle" tone="success" size="sm">+12.4%</DzBadge>
              </div>
              <div class="chart" aria-hidden="true">
                <span v-for="(b, i) in bars" :key="i" class="bar" :style="{ height: `${b}%` }" />
              </div>
            </DzCard>

            <DzCard variant="outlined" padding="none" class="dash-table-card">
              <DzCardHeader>
                <div class="card-head-row">
                  <DzText weight="semibold">Members</DzText>
                  <DzBadge variant="subtle" tone="primary">{{ rows.length }} seats</DzBadge>
                </div>
              </DzCardHeader>
              <DzTable size="sm" hoverable>
                <DzTableHeader>
                  <DzTableRow>
                    <DzTableCell header>Member</DzTableCell>
                    <DzTableCell header>Plan</DzTableCell>
                    <DzTableCell header>Usage</DzTableCell>
                    <DzTableCell header>Status</DzTableCell>
                  </DzTableRow>
                </DzTableHeader>
                <DzTableBody>
                  <DzTableRow v-for="r in rows" :key="r.email">
                    <DzTableCell>
                      <div class="member-cell">
                        <DzAvatar :fallback="r.name.slice(0, 1)" size="sm" />
                        <div class="member-meta">
                          <DzText size="sm" weight="medium" as="div">{{ r.name }}</DzText>
                          <DzText size="xs" tone="muted" as="div">{{ r.email }}</DzText>
                        </div>
                      </div>
                    </DzTableCell>
                    <DzTableCell>
                      <DzBadge variant="outline" tone="neutral" size="sm">{{ r.plan }}</DzBadge>
                    </DzTableCell>
                    <DzTableCell>
                      <div class="usage-cell">
                        <DzProgress :value="r.usage" size="sm" tone="primary" class="usage-bar" />
                        <DzText size="xs" tone="muted">{{ r.usage }}%</DzText>
                      </div>
                    </DzTableCell>
                    <DzTableCell>
                      <DzBadge variant="subtle" :tone="statusTone[r.status]" size="sm">{{ r.status }}</DzBadge>
                    </DzTableCell>
                  </DzTableRow>
                </DzTableBody>
              </DzTable>
            </DzCard>
          </div>

          <div class="dash-side">
            <DzCard variant="outlined" padding="md">
              <DzText weight="semibold" as="div" class="side-title">Storage</DzText>
              <DzText size="sm" tone="muted" as="div" class="side-sub">68.4 GB of 100 GB used</DzText>
              <DzProgress :value="68" tone="primary" class="side-progress" />
            </DzCard>

            <DzCard variant="outlined" padding="md">
              <DzText weight="semibold" as="div" class="side-title">Preferences</DzText>
              <div class="pref-row">
                <DzText size="sm">Email notifications</DzText>
                <DzSwitch v-model="notifications" size="sm" aria-label="Email notifications" />
              </div>
              <div class="pref-row">
                <DzText size="sm">Two-factor auth</DzText>
                <DzBadge variant="subtle" tone="success" size="sm">On</DzBadge>
              </div>
              <DzButton size="sm" variant="ghost" tone="primary" class="side-btn">Manage plan</DzButton>
            </DzCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The frame is its own inline-size container so the dashboard reflows to the
   frame width (half the page in the split), not the viewport. */
.frame-shell {
  position: relative;
  container-type: inline-size;
}

/* Soft brand glow pooling beneath the frame for depth. */
.frame-glow {
  position: absolute;
  inset: 4% 2% -8%;
  z-index: 0;
  background:
    radial-gradient(ellipse 50% 55% at 32% 38%, color-mix(in oklch, var(--lp-brand) 20%, transparent), transparent 70%),
    radial-gradient(ellipse 50% 55% at 70% 42%, color-mix(in oklch, var(--lp-brand-2) 16%, transparent), transparent 70%);
  filter: blur(56px);
}

.window {
  position: relative;
  z-index: 1;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  overflow: hidden;
  background: var(--dz-surface, #fff);
  box-shadow: var(--lp-shadow-lg), var(--lp-highlight);
  transition: var(--dz-landing-theme-transition);
}

.window-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: color-mix(in oklch, var(--dz-muted, #f1f5f9) 60%, var(--dz-surface, #fff));
  border-bottom: 1px solid var(--lp-hairline);
}

.dots {
  display: inline-flex;
  gap: 7px;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: var(--dz-radius-full, 9999px);
  opacity: 0.85;
}
.dot-r { background: var(--dz-danger, #ef4444); }
.dot-y { background: var(--dz-warning, #f59e0b); }
.dot-g { background: var(--dz-success, #22c55e); }

.window-url {
  flex: 1;
  text-align: center;
  font-size: var(--dz-text-xs, 0.75rem);
  font-family: var(--dz-font-mono, monospace);
  color: var(--dz-muted-foreground, #64748b);
  padding: 4px 12px;
  background: var(--dz-surface, #fff);
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-full, 9999px);
  max-width: 280px;
  margin: 0 auto;
}

.window-spacer {
  width: 52px;
}

.window-body {
  padding: clamp(16px, 2.4cqw, 26px);
  background:
    radial-gradient(circle at 0% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 4%, transparent), transparent 38%),
    var(--dz-background, #fff);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dash-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.dash-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dash-toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dash-search {
  width: 184px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.dash-grid {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 14px;
  align-items: start;
}

.dash-main {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.card-head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.chart-figure {
  font-size: var(--dz-text-xl, 1.25rem);
  margin-top: 2px;
}

.chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 96px;
  margin-top: 16px;
}

.bar {
  flex: 1;
  border-radius: var(--dz-radius-sm, 4px) var(--dz-radius-sm, 4px) 0 0;
  background: linear-gradient(to top,
    color-mix(in oklch, var(--dz-primary, #6366f1) 28%, transparent),
    var(--dz-primary, #6366f1));
  min-height: 6px;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-meta {
  line-height: 1.2;
}

.usage-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.usage-bar {
  width: 84px;
}

.dash-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.side-title {
  margin-bottom: 2px;
}
.side-sub {
  margin-bottom: 12px;
}
.side-progress {
  margin-top: 4px;
}
.pref-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0;
}
.side-btn {
  margin-top: 8px;
}

/* Frame-width breakpoints (container queries): the dashboard collapses when the
   frame itself gets narrow — the desktop split (~half width) and mobile alike —
   instead of keying off the viewport, which the old @media rules could not see. */
@container (max-width: 640px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .dash-grid {
    grid-template-columns: 1fr;
  }
}

@container (max-width: 420px) {
  .dash-search {
    display: none;
  }
}
</style>
