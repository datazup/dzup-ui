<script setup lang="ts">
// dzup-ui equivalent of FreestyleDataTable — ONLY @dzup-ui/core components + --dz-* tokens.

import { ref } from 'vue'
import { ArrowUpDown, ChevronUp, MoreHorizontal, Search } from 'lucide-vue-next'
import { DzIconButton } from '../../../src/components/buttons'
import { DzCard } from '../../../src/components/cards'
import {
  DzTable,
  DzTableBody,
  DzTableCell,
  DzTableHeader,
  DzTableRow,
  DzTag,
} from '../../../src/components/data'
import { DzBadge } from '../../../src/components/feedback'
import { DzSelect } from '../../../src/components/forms'
import { DzInput } from '../../../src/components/inputs'
import { DzPagination } from '../../../src/components/navigation'
import {
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
} from '../../../src/components/overlays'
import { DzHeading, DzText } from '../../../src/components/typography'
import type { CanonicalTone } from '@dzup-ui/contracts'
import type { DzSelectItem } from '../../../src/components/forms'

interface Deployment {
  id: string
  service: string
  env: string
  status: 'active' | 'pending' | 'failed'
  owner: string
  initials: string
  duration: string
}

const rows: Deployment[] = [
  {
    id: 'dpl_8f21',
    service: 'api-gateway',
    env: 'production',
    status: 'active',
    owner: 'Mara Lindqvist',
    initials: 'ML',
    duration: '1m 12s',
  },
  {
    id: 'dpl_7c04',
    service: 'billing-worker',
    env: 'production',
    status: 'failed',
    owner: 'Devon Reyes',
    initials: 'DR',
    duration: '0m 48s',
  },
  {
    id: 'dpl_6b93',
    service: 'edge-cache',
    env: 'staging',
    status: 'active',
    owner: 'Priya Nair',
    initials: 'PN',
    duration: '2m 03s',
  },
  {
    id: 'dpl_5a17',
    service: 'auth-service',
    env: 'production',
    status: 'pending',
    owner: 'Sam Okafor',
    initials: 'SO',
    duration: '—',
  },
  {
    id: 'dpl_4d88',
    service: 'search-indexer',
    env: 'staging',
    status: 'active',
    owner: 'Lena Fischer',
    initials: 'LF',
    duration: '3m 41s',
  },
  {
    id: 'dpl_3e02',
    service: 'notification-svc',
    env: 'production',
    status: 'pending',
    owner: 'Tomas Vega',
    initials: 'TV',
    duration: '—',
  },
  {
    id: 'dpl_2f55',
    service: 'media-encoder',
    env: 'staging',
    status: 'failed',
    owner: 'Aiko Tanaka',
    initials: 'AT',
    duration: '0m 19s',
  },
  {
    id: 'dpl_1a09',
    service: 'web-frontend',
    env: 'production',
    status: 'active',
    owner: 'Noah Bauer',
    initials: 'NB',
    duration: '1m 57s',
  },
]

const search = ref('')
const statusFilter = ref('all')
const ownerFilter = ref('all')
const selectedId = ref<string>('dpl_6b93')
const currentPage = ref(1)

const statusTone: Record<Deployment['status'], CanonicalTone> = {
  active: 'success',
  pending: 'warning',
  failed: 'danger',
}

const statusItems: DzSelectItem[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
]

const ownerItems: DzSelectItem[] = [
  { label: 'All owners', value: 'all' },
  { label: 'Mara Lindqvist', value: 'ml' },
  { label: 'Devon Reyes', value: 'dr' },
  { label: 'Priya Nair', value: 'pn' },
]
</script>

<template>
  <div class="min-h-screen bg-[var(--dz-background)] text-[var(--dz-foreground)] antialiased">
    <div class="mx-auto max-w-6xl px-6 py-10">
      <header class="mb-6">
        <DzHeading :level="1" size="xl" weight="semibold">Deployments</DzHeading>
        <DzText as="p" size="sm" tone="muted" class="mt-1">
          Track every release across your environments.
        </DzText>
      </header>

      <DzCard variant="elevated" padding="none">
        <!-- Filter bar -->
        <div
          class="flex flex-col gap-3 border-b border-[var(--dz-border)] px-5 py-4 sm:flex-row sm:items-center"
        >
          <div class="flex-1">
            <DzInput v-model="search" type="search" placeholder="Search deployments…">
              <template #prefix>
                <Search class="h-4 w-4 text-[var(--dz-muted-foreground)]" />
              </template>
            </DzInput>
          </div>
          <DzSelect
            v-model="statusFilter"
            :items="statusItems"
            aria-label="Filter by status"
            class="sm:w-40"
          />
          <DzSelect
            v-model="ownerFilter"
            :items="ownerItems"
            aria-label="Filter by owner"
            class="sm:w-40"
          />
        </div>

        <!-- Table -->
        <DzTable hoverable>
          <DzTableHeader>
            <DzTableRow>
              <DzTableCell header>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 transition-colors hover:text-[var(--dz-foreground)]"
                >
                  Service
                  <ChevronUp class="h-3.5 w-3.5 text-[var(--dz-primary)]" aria-hidden="true" />
                </button>
              </DzTableCell>
              <DzTableCell header>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[var(--dz-muted-foreground)] transition-colors hover:text-[var(--dz-foreground)]"
                >
                  Environment
                  <ArrowUpDown class="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                </button>
              </DzTableCell>
              <DzTableCell header>Status</DzTableCell>
              <DzTableCell header>Owner</DzTableCell>
              <DzTableCell header>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[var(--dz-muted-foreground)] transition-colors hover:text-[var(--dz-foreground)]"
                >
                  Duration
                  <ArrowUpDown class="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                </button>
              </DzTableCell>
              <DzTableCell header align="right"><span class="sr-only">Actions</span></DzTableCell>
            </DzTableRow>
          </DzTableHeader>
          <DzTableBody>
            <DzTableRow
              v-for="row in rows"
              :key="row.id"
              :selected="selectedId === row.id"
              class="cursor-pointer"
              @click="selectedId = row.id"
            >
              <DzTableCell>
                <div class="flex items-center gap-2.5">
                  <span
                    class="h-2 w-2 rounded-[var(--dz-radius-full)]"
                    :class="
                      selectedId === row.id ? 'bg-[var(--dz-primary)]' : 'bg-[var(--dz-border)]'
                    "
                    aria-hidden="true"
                  />
                  <div>
                    <DzText as="span" size="sm" weight="medium" class="block">{{
                      row.service
                    }}</DzText>
                    <DzText as="span" size="xs" tone="muted" class="block font-mono">{{
                      row.id
                    }}</DzText>
                  </div>
                </div>
              </DzTableCell>
              <DzTableCell>
                <DzTag variant="subtle" tone="neutral" size="sm" class="capitalize">{{
                  row.env
                }}</DzTag>
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
                <DzText as="span" size="xs" tone="muted" class="font-mono tabular-nums">{{
                  row.duration
                }}</DzText>
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
                      @click.stop
                    />
                  </DzDropdownMenuTrigger>
                  <DzDropdownMenuContent>
                    <DzDropdownMenuItem>Redeploy</DzDropdownMenuItem>
                    <DzDropdownMenuItem>View logs</DzDropdownMenuItem>
                    <DzDropdownMenuSeparator />
                    <DzDropdownMenuItem>Rollback</DzDropdownMenuItem>
                  </DzDropdownMenuContent>
                </DzDropdownMenu>
              </DzTableCell>
            </DzTableRow>
          </DzTableBody>
        </DzTable>

        <!-- Pagination footer -->
        <div
          class="flex flex-col items-center justify-between gap-3 border-t border-[var(--dz-border)] px-5 py-4 sm:flex-row"
        >
          <DzText as="p" size="sm" tone="muted">
            Showing <span class="font-medium text-[var(--dz-foreground)]">1–10</span> of
            <span class="font-medium text-[var(--dz-foreground)]">42</span>
          </DzText>
          <DzPagination v-model="currentPage" :total="42" :page-size="10" />
        </div>
      </DzCard>
    </div>
  </div>
</template>
