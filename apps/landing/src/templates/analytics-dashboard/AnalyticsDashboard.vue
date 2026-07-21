<script setup lang="ts">
/**
 * Analytics Dashboard — featured reference template (docs/templates.md §6.1).
 *
 * ShowcaseDashboard.vue promoted to a full, chromeless page: a DzAppShell with a
 * DzSidebar, a header toolbar, a DzStatCard KPI row, a chart card, a DzTable of
 * members and a side column — built ONLY from free `@dzup-ui/core` components and
 * styled entirely with `var(--dz-*)` tokens (no `lp-*` landing styles). Renders
 * correctly in light and dark and reflows from desktop down to 390px.
 */
import {
  DzAppShell,
  DzAvatar,
  DzBadge,
  DzButton,
  DzCard,
  DzCardHeader,
  DzHeading,
  DzProgress,
  DzSearchInput,
  DzSegmented,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
  DzStatCard,
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzText,
} from '@dzup-ui/core'
import { Boxes, Plus } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import {
  CHANNELS,
  MEMBERS,
  PRIMARY_NAV,
  REVENUE_SERIES,
  SECONDARY_NAV,
  STATS,
  STATUS_TONE,
} from './data.ts'

const query = ref('')
const range = ref('30d')
const rangeItems = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
]

// Scale the faux chart bars to the tallest month so the panel reads as a chart.
const peak = Math.max(...REVENUE_SERIES.map(p => p.value))
const bars = computed(() =>
  REVENUE_SERIES.map(p => ({ ...p, height: Math.round((p.value / peak) * 100) })),
)
</script>

<template>
  <DzAppShell aria-label="Analytics workspace" class="dash-shell">
    <template #sidebar>
      <DzSidebar aria-label="Primary">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Northwind</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Analytics">
          <DzSidebarItem
            v-for="item in PRIMARY_NAV"
            :key="item.label"
            :active="item.active"
            href="#"
          >
            <template #icon>
              <component :is="item.icon" :size="18" />
            </template>
            {{ item.label }}
            <template v-if="item.badge" #badge>
              <DzBadge variant="solid" tone="primary" size="sm">
                {{ item.badge }}
              </DzBadge>
            </template>
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarSection title="Workspace">
          <DzSidebarItem v-for="item in SECONDARY_NAV" :key="item.label" href="#">
            <template #icon>
              <component :is="item.icon" :size="18" />
            </template>
            {{ item.label }}
          </DzSidebarItem>
        </DzSidebarSection>

        <DzSidebarFooter>
          <span class="user">
            <DzAvatar fallback="AR" size="sm" />
            <span class="user-meta">
              <DzText size="sm" weight="medium" as="span">Ava Restić</DzText>
              <DzText size="xs" tone="muted" as="span">ava@northwind.io</DzText>
            </span>
          </span>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="dash-title">
        <DzHeading :level="1" size="lg" weight="semibold">
          Overview
        </DzHeading>
        <DzBadge variant="subtle" tone="success" size="sm">
          Live
        </DzBadge>
      </div>
    </template>

    <template #header-end>
      <DzSegmented v-model="range" :items="rangeItems" size="sm" aria-label="Date range" />
      <DzSearchInput
        v-model="query"
        placeholder="Search…"
        size="sm"
        class="dash-search"
        aria-label="Search the dashboard"
      />
      <DzButton size="sm" variant="solid" tone="primary">
        <template #prefix>
          <Plus :size="15" aria-hidden="true" />
        </template>
        New report
      </DzButton>
    </template>

    <div class="dash-body">
      <div class="stat-row">
        <DzStatCard
          v-for="stat in STATS"
          :key="stat.title"
          :title="stat.title"
          :value="stat.value"
          :trend="stat.trend"
          :trend-value="stat.trendValue"
          :icon="stat.icon"
        />
      </div>

      <div class="dash-grid">
        <div class="dash-main">
          <DzCard variant="outlined" padding="md" class="chart-card">
            <div class="card-head-row">
              <div>
                <DzText size="sm" tone="muted" as="div">
                  Revenue this year
                </DzText>
                <DzText weight="semibold" as="div" class="chart-figure">
                  $534,180
                </DzText>
              </div>
              <DzBadge variant="subtle" tone="success" size="sm">
                +12.4%
              </DzBadge>
            </div>
            <div
              class="chart"
              role="img"
              aria-label="Monthly revenue trending upward across the year"
            >
              <span
                v-for="bar in bars"
                :key="bar.month"
                class="bar"
                :style="{ height: `${bar.height}%` }"
              >
                <span class="bar-label">{{ bar.month }}</span>
              </span>
            </div>
          </DzCard>

          <DzCard variant="outlined" padding="none" class="table-card">
            <DzCardHeader>
              <div class="card-head-row">
                <DzText weight="semibold">
                  Members
                </DzText>
                <DzBadge variant="subtle" tone="primary">
                  {{ MEMBERS.length }} seats
                </DzBadge>
              </div>
            </DzCardHeader>
            <div class="table-scroll">
              <DzTable size="sm" hoverable>
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
                  <DzTableRow v-for="m in MEMBERS" :key="m.email">
                    <DzTableCell>
                      <div class="member-cell">
                        <DzAvatar :fallback="m.name.slice(0, 1)" size="sm" />
                        <div class="member-meta">
                          <DzText size="sm" weight="medium" as="div">
                            {{ m.name }}
                          </DzText>
                          <DzText size="xs" tone="muted" as="div">
                            {{ m.email }}
                          </DzText>
                        </div>
                      </div>
                    </DzTableCell>
                    <DzTableCell>
                      <DzBadge variant="outline" tone="neutral" size="sm">
                        {{ m.plan }}
                      </DzBadge>
                    </DzTableCell>
                    <DzTableCell>
                      <div class="usage-cell">
                        <DzProgress :value="m.usage" size="sm" tone="primary" class="usage-bar" />
                        <DzText size="xs" tone="muted">
                          {{ m.usage }}%
                        </DzText>
                      </div>
                    </DzTableCell>
                    <DzTableCell>
                      <DzBadge variant="subtle" :tone="STATUS_TONE[m.status]" size="sm">
                        {{ m.status }}
                      </DzBadge>
                    </DzTableCell>
                  </DzTableRow>
                </DzTableBody>
              </DzTable>
            </div>
          </DzCard>
        </div>

        <div class="dash-side">
          <DzCard variant="outlined" padding="md">
            <DzText weight="semibold" as="div" class="side-title">
              Storage
            </DzText>
            <DzText size="sm" tone="muted" as="div" class="side-sub">
              68.4 GB of 100 GB used
            </DzText>
            <DzProgress :value="68" tone="primary" class="side-progress" />
          </DzCard>

          <DzCard variant="outlined" padding="md">
            <DzText weight="semibold" as="div" class="side-title">
              Acquisition
            </DzText>
            <DzText size="sm" tone="muted" as="div" class="side-sub">
              Top channels, last 30 days
            </DzText>
            <ul class="channel-list">
              <li v-for="c in CHANNELS" :key="c.label" class="channel-row">
                <div class="channel-head">
                  <DzText size="sm">
                    {{ c.label }}
                  </DzText>
                  <DzText size="sm" weight="medium">
                    {{ c.share }}%
                  </DzText>
                </div>
                <DzProgress :value="c.share" size="sm" tone="primary" />
              </li>
            </ul>
          </DzCard>
        </div>
      </div>
    </div>
  </DzAppShell>
</template>

<style scoped>
.dash-shell {
  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

/* Brand lockup in the sidebar header. */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.dash-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dash-search {
  width: 184px;
}

.dash-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.chart-card {
  overflow: hidden;
}

.chart-figure {
  font-size: var(--dz-text-xl);
  margin-top: 2px;
}

.chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 168px;
  margin-top: 18px;
  /* Room for the month labels that sit just below each bar. */
  margin-bottom: 20px;
}

.bar {
  position: relative;
  flex: 1;
  border-radius: var(--dz-radius-sm) var(--dz-radius-sm) 0 0;
  background: linear-gradient(
    to top,
    color-mix(in oklch, var(--dz-primary) 28%, transparent),
    var(--dz-primary)
  );
  min-height: 8px;
}

.bar-label {
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: var(--dz-text-xs);
  color: var(--dz-muted-foreground);
}

.table-card {
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
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

.channel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.channel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

@media (max-width: 900px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .dash-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .dash-search {
    display: none;
  }
  .stat-row {
    grid-template-columns: 1fr;
  }
}
</style>
