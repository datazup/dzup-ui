<script setup lang="ts">
// dzup-ui equivalent of FreestyleDashboard — ONLY @dzup-ui/core components + --dz-* tokens.
// A/B comparison target against the raw-Tailwind freestyle reference.

import { MoreHorizontal, Plus } from 'lucide-vue-next'
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
import type { CanonicalTone } from '@dzup-ui/contracts'

interface Kpi {
  label: string
  value: string
  delta: number
  hint: string
}

interface ActivityRow {
  name: string
  status: 'active' | 'pending' | 'failed'
  owner: string
  initials: string
  updated: string
}

const kpis: Kpi[] = [
  { label: 'Total Revenue', value: '$48,290', delta: 12, hint: 'vs last month' },
  { label: 'Active Projects', value: '34', delta: 8, hint: 'vs last month' },
  { label: 'Avg. Cycle Time', value: '2.4d', delta: -3, hint: 'vs last month' },
  { label: 'Open Incidents', value: '7', delta: -18, hint: 'vs last month' },
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
          <DzHeading :level="1" size="2xl" weight="semibold">Overview</DzHeading>
        </div>
        <DzButton variant="solid" tone="primary">
          <template #prefix>
            <Plus class="h-4 w-4" />
          </template>
          New Project
        </DzButton>
      </header>

      <!-- KPI cards — fixed anatomy: Label → Value → Delta → time frame (F-pattern, 8px grid) -->
      <section class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DzCard
          v-for="kpi in kpis"
          :key="kpi.label"
          variant="elevated"
          hoverable
          padding="md"
          class="transition-transform duration-200 hover:-translate-y-0.5"
        >
          <DzCardBody>
            <DzText as="p" size="sm" weight="medium" tone="muted">{{ kpi.label }}</DzText>
            <div class="mt-3 flex items-end justify-between gap-2">
              <span class="text-3xl font-semibold leading-none tracking-tight tabular-nums">{{
                kpi.value
              }}</span>
              <DzBadge variant="subtle" :tone="kpi.delta >= 0 ? 'success' : 'danger'" size="sm">
                <span aria-hidden="true">{{ kpi.delta >= 0 ? '▲' : '▼' }}</span>
                {{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta }}%
              </DzBadge>
            </div>
            <DzText as="p" size="xs" tone="muted" class="mt-2">{{ kpi.hint }}</DzText>
          </DzCardBody>
        </DzCard>
      </section>

      <!-- Chart placeholder -->
      <DzCard variant="elevated" padding="none" class="mt-6">
        <div class="flex items-center justify-between border-b border-[var(--dz-border)] px-6 py-4">
          <div>
            <DzHeading :level="2" size="md" weight="semibold">Revenue trend</DzHeading>
            <DzText as="p" size="xs" tone="muted">Last 12 months</DzText>
          </div>
          <div
            class="flex items-center gap-1 rounded-[var(--dz-radius-lg)] bg-[var(--dz-muted)] p-1"
          >
            <DzButton size="xs" variant="solid" tone="neutral">Monthly</DzButton>
            <DzButton size="xs" variant="ghost" tone="neutral">Weekly</DzButton>
          </div>
        </div>

        <div class="relative px-6 pb-6 pt-8">
          <!-- axis hint lines -->
          <div
            class="pointer-events-none absolute inset-x-6 top-8 bottom-12 flex flex-col justify-between"
          >
            <span
              v-for="n in 4"
              :key="n"
              class="border-t border-dashed border-[var(--dz-border)] opacity-70"
            />
          </div>
          <!-- bars -->
          <div class="relative flex h-48 items-end gap-2 sm:gap-3">
            <div
              v-for="(h, i) in bars"
              :key="i"
              class="flex flex-1 flex-col items-center justify-end"
            >
              <div
                class="w-full rounded-t-[var(--dz-radius-md)] bg-[var(--dz-primary)] opacity-80 transition-all duration-300 hover:opacity-100"
                :style="{ height: h + '%' }"
              />
            </div>
          </div>
          <!-- x axis -->
          <div class="mt-3 flex gap-2 sm:gap-3">
            <DzText
              v-for="m in months"
              :key="m"
              as="span"
              size="xs"
              tone="muted"
              class="flex-1 text-center uppercase tracking-wide"
            >
              {{ m }}
            </DzText>
          </div>
        </div>
      </DzCard>

      <!-- Recent activity table -->
      <DzCard variant="elevated" padding="none" class="mt-6">
        <div class="flex items-center justify-between border-b border-[var(--dz-border)] px-6 py-4">
          <DzHeading :level="2" size="md" weight="semibold">Recent Activity</DzHeading>
          <DzButton variant="link" tone="primary" size="sm">View all</DzButton>
        </div>
        <DzTable hoverable>
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>Name</DzTableCell>
              <DzTableCell header>Status</DzTableCell>
              <DzTableCell header>Owner</DzTableCell>
              <DzTableCell header>Updated</DzTableCell>
              <DzTableCell header align="right"><span class="sr-only">Actions</span></DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow v-for="row in activity" :key="row.name">
              <DzTableCell>
                <DzText as="span" size="sm" weight="medium">{{ row.name }}</DzText>
              </DzTableCell>
              <DzTableCell>
                <DzBadge
                  variant="subtle"
                  :tone="statusTone[row.status]"
                  size="sm"
                  class="capitalize"
                >
                  {{ row.status }}
                </DzBadge>
              </DzTableCell>
              <DzTableCell>
                <div class="flex items-center gap-2.5">
                  <span
                    class="grid h-7 w-7 place-items-center rounded-[var(--dz-radius-full)] bg-[var(--dz-muted)] text-[11px] font-semibold text-[var(--dz-muted-foreground)]"
                    >{{ row.initials }}</span
                  >
                  <DzText as="span" size="sm" tone="muted">{{ row.owner }}</DzText>
                </div>
              </DzTableCell>
              <DzTableCell>
                <DzText as="span" size="sm" tone="muted">{{ row.updated }}</DzText>
              </DzTableCell>
              <DzTableCell align="right">
                <DzDropdownMenu>
                  <DzDropdownMenuTrigger as-child>
                    <DzIconButton
                      :icon="MoreHorizontal"
                      ariaLabel="Row actions"
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
