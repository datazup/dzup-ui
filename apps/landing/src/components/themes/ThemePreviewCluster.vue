<script setup lang="ts">
import {
  DzAlert,
  DzAvatar,
  DzBadge,
  DzButton,
  DzCard,
  DzCardHeader,
  DzInput,
  DzProgress,
  DzRating,
  DzSegmented,
  DzSwitch,
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzText,
} from '@dzup-ui/core'
import { Search } from 'lucide-vue-next'
import { ref } from 'vue'

/**
 * ThemePreviewCluster — the live "does my theme actually work?" surface for the
 * Theme Designer. A dense cluster of REAL `@dzup-ui/core` components (buttons in
 * every variant · inputs · a stat row · a chart-like panel · a members table ·
 * alerts across intents · badges/switch/rating) so a single glance shows how a
 * palette reads across the whole system, not just a hero button.
 *
 * It carries its OWN local state (query/switch/rating) so the light and dark
 * instances the page renders side by side stay independent. It sets NO tokens
 * itself — the page binds `varsFor('light' | 'dark')` as `:style` on each panel
 * wrapper, and every token here resolves from that scoped override.
 */

const query = ref('')
const notifications = ref(true)
const rating = ref(4)
const range = ref('30d')
const rangeItems = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
]

const rows = [
  { name: 'Ava Restić', plan: 'Team', usage: 72, status: 'Active' },
  { name: 'Liam Novak', plan: 'Solo', usage: 38, status: 'Trial' },
  { name: 'Mara Petrović', plan: 'Org', usage: 91, status: 'Invited' },
]

const statusTone: Record<string, 'success' | 'warning' | 'info'> = {
  Active: 'success',
  Trial: 'warning',
  Invited: 'info',
}

// Faux sparkline heights (%) — themed bars standing in for a chart panel.
const bars = [42, 58, 48, 70, 60, 78, 66, 88, 74, 96]
</script>

<template>
  <div class="cluster">
    <!-- Toolbar: segmented + search + primary CTA -->
    <div class="cluster-toolbar">
      <DzSegmented v-model="range" :items="rangeItems" size="sm" aria-label="Date range" />
      <DzInput v-model="query" placeholder="Search…" size="sm" clearable class="cluster-search">
        <template #prefix>
          <Search :size="15" aria-hidden="true" />
        </template>
      </DzInput>
      <DzButton size="sm" variant="solid" tone="primary">
        New report
      </DzButton>
    </div>

    <!-- Button variant matrix -->
    <div class="cluster-row">
      <DzButton size="sm" variant="solid" tone="primary">
        Solid
      </DzButton>
      <DzButton size="sm" variant="outline" tone="primary">
        Outline
      </DzButton>
      <DzButton size="sm" variant="ghost" tone="primary">
        Ghost
      </DzButton>
      <DzButton size="sm" variant="solid" tone="success">
        Success
      </DzButton>
      <DzButton size="sm" variant="solid" tone="danger">
        Danger
      </DzButton>
    </div>

    <!-- Badges + controls -->
    <div class="cluster-row">
      <DzBadge variant="solid" tone="primary" size="sm">
        Primary
      </DzBadge>
      <DzBadge variant="subtle" tone="success" size="sm">
        Success
      </DzBadge>
      <DzBadge variant="subtle" tone="warning" size="sm">
        Warning
      </DzBadge>
      <DzBadge variant="outline" tone="info" size="sm">
        Info
      </DzBadge>
      <DzSwitch v-model="notifications" size="sm" aria-label="Notifications" />
      <DzRating v-model="rating" :count="5" />
    </div>

    <!-- Chart-like panel -->
    <DzCard variant="outlined" padding="md" class="cluster-chart-card">
      <div class="cluster-card-head">
        <div>
          <DzText size="sm" tone="muted" as="div">
            Revenue
          </DzText>
          <DzText weight="semibold" as="div" class="cluster-figure">
            $48,210
          </DzText>
        </div>
        <DzBadge variant="subtle" tone="success" size="sm">
          +12.4%
        </DzBadge>
      </div>
      <div class="cluster-chart" aria-hidden="true">
        <span v-for="(b, i) in bars" :key="i" class="cluster-bar" :style="{ height: `${b}%` }" />
      </div>
    </DzCard>

    <!-- Members table -->
    <DzCard variant="outlined" padding="none" class="cluster-table-card">
      <DzCardHeader>
        <div class="cluster-card-head">
          <DzText weight="semibold">
            Members
          </DzText>
          <DzBadge variant="subtle" tone="primary" size="sm">
            {{ rows.length }} seats
          </DzBadge>
        </div>
      </DzCardHeader>
      <DzTable size="sm" hoverable tabindex="0" aria-label="Members table scroll area">
        <DzTableHeader>
          <DzTableRow>
            <DzTableCell header>
              Member
            </DzTableCell>
            <DzTableCell header>
              Plan
            </DzTableCell>
            <DzTableCell header>
              Usage
            </DzTableCell>
            <DzTableCell header>
              Status
            </DzTableCell>
          </DzTableRow>
        </DzTableHeader>
        <DzTableBody>
          <DzTableRow v-for="r in rows" :key="r.name">
            <DzTableCell>
              <div class="cluster-member">
                <DzAvatar :fallback="r.name.slice(0, 1)" size="sm" />
                <DzText size="sm" weight="medium">
                  {{ r.name }}
                </DzText>
              </div>
            </DzTableCell>
            <DzTableCell>
              <DzBadge variant="outline" tone="neutral" size="sm">
                {{ r.plan }}
              </DzBadge>
            </DzTableCell>
            <DzTableCell>
              <div class="cluster-usage">
                <DzProgress :value="r.usage" size="sm" tone="primary" class="cluster-usage-bar" />
                <DzText size="xs" tone="muted">
                  {{ r.usage }}%
                </DzText>
              </div>
            </DzTableCell>
            <DzTableCell>
              <DzBadge variant="subtle" :tone="statusTone[r.status]" size="sm">
                {{ r.status }}
              </DzBadge>
            </DzTableCell>
          </DzTableRow>
        </DzTableBody>
      </DzTable>
    </DzCard>

    <!-- Alerts across intents -->
    <div class="cluster-alerts">
      <DzAlert tone="primary" variant="subtle" title="Theme applied">
        Every component here reads your token overrides live.
      </DzAlert>
      <DzAlert tone="warning" variant="subtle" title="Heads up">
        Trial ends in 3 days.
      </DzAlert>
    </div>
  </div>
</template>

<style scoped>
.cluster {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cluster-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cluster-search {
  flex: 1 1 140px;
  min-width: 0;
}

.cluster-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.cluster-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cluster-figure {
  font-size: var(--dz-text-xl, 1.25rem);
  margin-top: 2px;
}

.cluster-chart {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 84px;
  margin-top: 14px;
}

.cluster-bar {
  flex: 1;
  border-radius: var(--dz-radius-sm, 4px) var(--dz-radius-sm, 4px) 0 0;
  background: linear-gradient(
    to top,
    color-mix(in oklch, var(--dz-primary, #0766ee) 26%, transparent),
    var(--dz-primary, #0766ee)
  );
  min-height: 6px;
}

.cluster-member {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cluster-usage {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cluster-usage-bar {
  width: 72px;
}

.cluster-alerts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
