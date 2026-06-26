<script setup lang="ts">
// dzup-ui equivalent of FreestyleDashboard — ONLY @dzup-ui/core components + --dz-* tokens.
// A/B comparison target against the raw-Tailwind freestyle reference.

import type { CanonicalTone } from '@dzup-ui/contracts'
import { MoreHorizontal, Plus, TrendingDown, TrendingUp } from 'lucide-vue-next'
import { computed } from 'vue'
import { DzButton, DzIconButton } from '../../../src/components/buttons'
import { DzCard, DzCardBody } from '../../../src/components/cards'
import {
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
} from '../../../src/components/data'
import { DzBadge } from '../../../src/components/feedback'
import {
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
} from '../../../src/components/overlays'
import { DzHeading, DzText } from '../../../src/components/typography'

interface Kpi {
  label: string
  value: string
  delta: number
  hint: string
  spark: number[]
}

interface ActivityRow {
  name: string
  status: 'active' | 'pending' | 'failed'
  owner: string
  initials: string
  updated: string
}

const kpis: Kpi[] = [
  {
    label: 'Total Revenue',
    value: '$48,290',
    delta: 12,
    hint: 'vs last month',
    spark: [40, 44, 41, 52, 49, 58, 64],
  },
  {
    label: 'Active Projects',
    value: '34',
    delta: 8,
    hint: 'vs last month',
    spark: [22, 26, 25, 29, 31, 30, 34],
  },
  {
    label: 'Avg. Cycle Time',
    value: '2.4d',
    delta: -3,
    hint: 'vs last month',
    spark: [3.1, 2.9, 3.0, 2.7, 2.6, 2.5, 2.4],
  },
  {
    label: 'Open Incidents',
    value: '7',
    delta: -18,
    hint: 'vs last month',
    spark: [14, 12, 13, 10, 9, 8, 7],
  },
]

const activity: ActivityRow[] = [
  {
    name: 'Atlas Migration',
    status: 'active',
    owner: 'Mara Lindqvist',
    initials: 'ML',
    updated: '2 min ago',
  },
  {
    name: 'Billing Refactor',
    status: 'pending',
    owner: 'Devon Reyes',
    initials: 'DR',
    updated: '41 min ago',
  },
  {
    name: 'Edge Cache Rollout',
    status: 'active',
    owner: 'Priya Nair',
    initials: 'PN',
    updated: '1 hr ago',
  },
  {
    name: 'Auth Token Rotation',
    status: 'failed',
    owner: 'Sam Okafor',
    initials: 'SO',
    updated: '3 hr ago',
  },
  {
    name: 'Design System v4',
    status: 'pending',
    owner: 'Lena Fischer',
    initials: 'LF',
    updated: 'Yesterday',
  },
]

const statusTone: Record<ActivityRow['status'], CanonicalTone> = {
  active: 'success',
  pending: 'warning',
  failed: 'danger',
}

const bars: number[] = [38, 52, 44, 67, 58, 81, 74, 92, 70, 86, 64, 78]
const months: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

// Normalise a sparkline series into 0–100 percentage heights for tiny bar columns.
function sparkHeights(series: number[]): number[] {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  return series.map(v => 18 + ((v - min) / span) * 82)
}

// Goal-completion ring fed by a single deterministic figure.
const goalPercent = 72
const goalRing = computed(
  () =>
    `conic-gradient(var(--dz-primary) ${goalPercent * 3.6}deg, var(--dz-muted) ${
      goalPercent * 3.6
    }deg)`,
)

const ringStats = [
  { label: 'Shipped', value: '129', tone: 'var(--dz-primary)' },
  { label: 'In review', value: '38', tone: 'var(--dz-warning)' },
  { label: 'Blocked', value: '12', tone: 'var(--dz-danger)' },
]
</script>

<template>
  <div class="min-h-screen bg-[var(--dz-background)] text-[var(--dz-foreground)] antialiased">
    <div class="mx-auto max-w-6xl px-6 py-10">
      <!-- Top bar -->
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <DzText
            as="p"
            size="xs"
            weight="semibold"
            tone="muted"
            class="mb-1 uppercase tracking-[0.2em] text-[var(--dz-primary)]"
          >
            Workspace
          </DzText>
          <DzHeading :level="1" size="2xl" weight="semibold" class="tracking-tight">
            Overview
          </DzHeading>
        </div>
        <DzButton variant="solid" tone="primary">
          <template #prefix>
            <Plus class="h-4 w-4" />
          </template>
          New Project
        </DzButton>
      </header>

      <!-- KPI cards — fixed anatomy: Label → Value + sparkline → Delta → time frame (8px grid) -->
      <section class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DzCard
          v-for="kpi in kpis"
          :key="kpi.label"
          variant="elevated"
          hoverable
          padding="none"
          class="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--dz-shadow-lg)]"
        >
          <DzCardBody class="flex h-full flex-col" style="padding: 1.5rem">
            <DzText as="p" size="sm" weight="medium" tone="muted">
              {{ kpi.label }}
            </DzText>

            <div class="mt-4 flex items-end justify-between gap-3">
              <span class="text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums">
                {{ kpi.value }}
              </span>
              <!-- mini sparkline built from divs (fixed width so it never overflows the card) -->
              <div class="flex h-8 w-16 shrink-0 items-end gap-[3px]" aria-hidden="true">
                <span
                  v-for="(h, i) in sparkHeights(kpi.spark)"
                  :key="i"
                  class="flex-1 rounded-full bg-[var(--dz-primary)] opacity-30 transition-opacity duration-200 group-hover:opacity-60"
                  :class="{ '!opacity-100': i === kpi.spark.length - 1 }"
                  :style="{ height: `${Math.round((h / 100) * 32)}px` }"
                />
              </div>
            </div>

            <div class="mt-4 flex items-center gap-2">
              <DzBadge variant="subtle" :tone="kpi.delta >= 0 ? 'success' : 'danger'" size="sm">
                <span class="inline-flex items-center gap-1">
                  <component
                    :is="kpi.delta >= 0 ? TrendingUp : TrendingDown"
                    class="h-3 w-3"
                    aria-hidden="true"
                  />
                  <span class="tabular-nums">{{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta }}%</span>
                </span>
              </DzBadge>
              <DzText as="span" size="xs" tone="muted">
                {{ kpi.hint }}
              </DzText>
            </div>
          </DzCardBody>
        </DzCard>
      </section>

      <!-- Chart row: revenue bar chart + goal-completion ring -->
      <section class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Revenue bar chart -->
        <DzCard variant="elevated" padding="none" class="lg:col-span-2">
          <div
            class="flex items-center justify-between border-b border-[var(--dz-border)] px-6 py-4"
          >
            <div>
              <DzHeading :level="2" size="md" weight="semibold">
                Revenue trend
              </DzHeading>
              <DzText as="p" size="xs" tone="muted" class="mt-0.5">
                Monthly recurring revenue, last 12 months
              </DzText>
            </div>
            <div
              class="flex items-center gap-1 rounded-[var(--dz-radius-lg)] bg-[var(--dz-muted)] p-1"
            >
              <DzButton size="xs" variant="solid" tone="neutral">
                Monthly
              </DzButton>
              <DzButton size="xs" variant="ghost" tone="neutral">
                Weekly
              </DzButton>
            </div>
          </div>

          <div class="relative px-6 pb-6 pt-8">
            <!-- dashed gridlines + y-axis ticks -->
            <div
              class="pointer-events-none absolute inset-x-6 top-8 bottom-12 flex flex-col justify-between"
            >
              <span
                v-for="n in 4"
                :key="n"
                class="border-t border-dashed border-[var(--dz-border)] opacity-70"
              />
            </div>
            <!-- bars — explicit PIXEL heights (h% of the 192px row) so the bars render
                 reliably regardless of flex %-height quirks. -->
            <div class="relative flex h-48 items-end gap-2 sm:gap-3">
              <div
                v-for="(h, i) in bars"
                :key="i"
                class="flex-1 rounded-t-[var(--dz-radius-md)] bg-[var(--dz-primary)] opacity-80 transition-all duration-300 hover:opacity-100"
                :style="{ height: `${Math.round((h / 100) * 192)}px` }"
              />
            </div>
            <!-- x axis -->
            <div class="mt-3 flex gap-2 sm:gap-3">
              <DzText
                v-for="m in months"
                :key="m"
                as="span"
                size="xs"
                tone="muted"
                class="flex-1 text-center uppercase tracking-wide tabular-nums"
              >
                {{ m }}
              </DzText>
            </div>
          </div>
        </DzCard>

        <!-- Goal-completion donut ring -->
        <DzCard variant="elevated" padding="none">
          <div class="border-b border-[var(--dz-border)] px-6 py-4">
            <DzHeading :level="2" size="md" weight="semibold">
              Quarterly goal
            </DzHeading>
            <DzText as="p" size="xs" tone="muted" class="mt-0.5">
              Delivery completion
            </DzText>
          </div>
          <div class="flex flex-col items-center gap-6 px-6 py-7">
            <div
              class="relative grid place-items-center rounded-[var(--dz-radius-full)]"
              :style="{ width: '9rem', height: '9rem', backgroundImage: goalRing }"
              role="img"
              :aria-label="`Quarterly goal ${goalPercent} percent complete`"
            >
              <div
                class="grid place-items-center rounded-[var(--dz-radius-full)] bg-[var(--dz-card)] text-center"
                style="height: 6.5rem; width: 6.5rem"
              >
                <div>
                  <span class="block text-3xl font-semibold leading-none tabular-nums">
                    {{ goalPercent }}%
                  </span>
                  <DzText as="span" size="xs" tone="muted" class="mt-1 block">
                    complete
                  </DzText>
                </div>
              </div>
            </div>
            <div class="grid w-full grid-cols-3 gap-2">
              <div
                v-for="stat in ringStats"
                :key="stat.label"
                class="flex flex-col items-center gap-1 rounded-[var(--dz-radius-md)] bg-[var(--dz-muted)] py-2"
              >
                <span
                  class="h-2 w-2 rounded-[var(--dz-radius-full)]"
                  :style="{ backgroundColor: stat.tone }"
                  aria-hidden="true"
                />
                <span class="text-lg font-semibold leading-none tabular-nums">
                  {{ stat.value }}
                </span>
                <DzText as="span" size="xs" tone="muted">
                  {{ stat.label }}
                </DzText>
              </div>
            </div>
          </div>
        </DzCard>
      </section>

      <!-- Recent activity table -->
      <DzCard variant="elevated" padding="none" class="mt-6">
        <div class="flex items-center justify-between border-b border-[var(--dz-border)] px-6 py-4">
          <div>
            <DzHeading :level="2" size="md" weight="semibold">
              Recent Activity
            </DzHeading>
            <DzText as="p" size="xs" tone="muted" class="mt-0.5">
              Latest changes across your workspace
            </DzText>
          </div>
          <DzButton variant="link" tone="primary" size="sm">
            View all
          </DzButton>
        </div>
        <DzTable hoverable density="comfortable">
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>
                Name
              </DzTableCell>
              <DzTableCell header>
                Status
              </DzTableCell>
              <DzTableCell header>
                Owner
              </DzTableCell>
              <DzTableCell header>
                Updated
              </DzTableCell>
              <DzTableCell header align="right">
                <span class="sr-only">Actions</span>
              </DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow v-for="row in activity" :key="row.name">
              <DzTableCell>
                <DzText as="span" size="sm" weight="medium">
                  {{ row.name }}
                </DzText>
              </DzTableCell>
              <DzTableCell>
                <DzBadge
                  variant="subtle"
                  :tone="statusTone[row.status]"
                  size="sm"
                  class="capitalize"
                >
                  <span class="inline-flex items-center gap-1.5">
                    <span
                      class="h-1.5 w-1.5 rounded-[var(--dz-radius-full)] bg-current opacity-70"
                      aria-hidden="true"
                    />
                    {{ row.status }}
                  </span>
                </DzBadge>
              </DzTableCell>
              <DzTableCell>
                <div class="flex items-center gap-2.5">
                  <span
                    class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--dz-radius-full)] bg-[var(--dz-primary-muted)] text-[11px] font-semibold leading-none tabular-nums text-[var(--dz-primary-muted-foreground)]"
                  >{{ row.initials }}</span>
                  <DzText as="span" size="sm" tone="muted">
                    {{ row.owner }}
                  </DzText>
                </div>
              </DzTableCell>
              <DzTableCell>
                <DzText as="span" size="sm" tone="muted" class="tabular-nums">
                  {{ row.updated }}
                </DzText>
              </DzTableCell>
              <DzTableCell align="right">
                <DzDropdownMenu>
                  <DzDropdownMenuTrigger as-child>
                    <DzIconButton
                      :icon="MoreHorizontal"
                      aria-label="Row actions"
                      variant="ghost"
                      tone="neutral"
                      size="sm"
                    />
                  </DzDropdownMenuTrigger>
                  <DzDropdownMenuContent>
                    <DzDropdownMenuItem>View</DzDropdownMenuItem>
                    <DzDropdownMenuItem>Edit</DzDropdownMenuItem>
                    <DzDropdownMenuSeparator />
                    <DzDropdownMenuItem>Archive</DzDropdownMenuItem>
                  </DzDropdownMenuContent>
                </DzDropdownMenu>
              </DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>
      </DzCard>
    </div>
  </div>
</template>
