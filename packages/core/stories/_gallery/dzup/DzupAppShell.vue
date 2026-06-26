<script setup lang="ts">
// dzup-ui application shell gallery scene — ONLY @dzup-ui/core components + --dz-* tokens.
// Dark icon-rail / light-panel sidebar + top navbar + dashboard content.

import type { LucideIcon } from 'lucide-vue-next'
import {
  Bell,
  FolderKanban,
  Home,
  LayoutDashboard,

  Menu,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
import { ref } from 'vue'
import { DzIconButton } from '../../../src/components/buttons'
import { DzCard, DzCardBody } from '../../../src/components/cards'
import { DzBadge } from '../../../src/components/feedback'
import { DzInput } from '../../../src/components/inputs'
import { DzAppShell } from '../../../src/components/layout'
import { DzAvatar } from '../../../src/components/media'
import {
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarItem,
  DzSidebarSection,
} from '../../../src/components/navigation'
import { DzHeading, DzText } from '../../../src/components/typography'

interface NavItem {
  label: string
  icon: LucideIcon
  active?: boolean
  badge?: string
}

const mainNav: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Projects', icon: FolderKanban, badge: '12' },
  { label: 'Team', icon: Users },
]

const workspaceNav: NavItem[] = [
  { label: 'Inbox', icon: Home, badge: '3' },
  { label: 'Settings', icon: Settings },
]

interface Kpi {
  label: string
  value: string
  delta: number
  hint: string
}

const kpis: Kpi[] = [
  { label: 'Active Projects', value: '34', delta: 8, hint: 'vs last month' },
  { label: 'Open Tasks', value: '128', delta: 12, hint: 'vs last month' },
  { label: 'Team Members', value: '19', delta: 5, hint: 'vs last month' },
  { label: 'Avg. Cycle Time', value: '2.4d', delta: -3, hint: 'vs last month' },
]

interface RecentItem {
  name: string
  meta: string
  initials: string
  status: 'active' | 'pending' | 'failed'
}

const statusTone: Record<RecentItem['status'], 'success' | 'warning' | 'danger'> = {
  active: 'success',
  pending: 'warning',
  failed: 'danger',
}

const recent: RecentItem[] = [
  { name: 'Atlas Migration', meta: 'Mara Lindqvist · 2 min ago', initials: 'ML', status: 'active' },
  { name: 'Billing Refactor', meta: 'Devon Reyes · 41 min ago', initials: 'DR', status: 'pending' },
  { name: 'Edge Cache Rollout', meta: 'Priya Nair · 1 hr ago', initials: 'PN', status: 'active' },
  { name: 'Auth Token Rotation', meta: 'Sam Okafor · 3 hr ago', initials: 'SO', status: 'failed' },
]

const collapsed = ref(false)
const search = ref('')

function toggleSidebar(): void {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <div class="h-screen bg-[var(--dz-background)] text-[var(--dz-foreground)] antialiased">
    <DzAppShell aria-label="Workspace application shell" header-height="4rem">
      <!-- Sidebar -->
      <template #sidebar>
        <DzSidebar :collapsed="collapsed" active-style="filled" class="h-full">
          <DzSidebarHeader>
            <div class="flex items-center gap-2.5">
              <span
                class="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--dz-radius-md)] bg-[var(--dz-primary)] text-sm font-bold text-[var(--dz-primary-foreground)]"
                aria-hidden="true"
              >
                D
              </span>
              <span v-if="!collapsed" class="text-base font-semibold tracking-tight">Datazup</span>
            </div>
          </DzSidebarHeader>

          <DzSidebarSection title="Main">
            <DzSidebarItem v-for="item in mainNav" :key="item.label" :active="item.active">
              <template #icon>
                <component :is="item.icon" class="h-[18px] w-[18px]" aria-hidden="true" />
              </template>
              {{ item.label }}
              <template v-if="item.badge" #badge>
                <span class="tabular-nums">{{ item.badge }}</span>
              </template>
            </DzSidebarItem>
          </DzSidebarSection>

          <DzSidebarSection title="Workspace">
            <DzSidebarItem v-for="item in workspaceNav" :key="item.label">
              <template #icon>
                <component :is="item.icon" class="h-[18px] w-[18px]" aria-hidden="true" />
              </template>
              {{ item.label }}
              <template v-if="item.badge" #badge>
                <span class="tabular-nums">{{ item.badge }}</span>
              </template>
            </DzSidebarItem>
          </DzSidebarSection>

          <DzSidebarFooter>
            <div class="flex items-center gap-2.5">
              <DzAvatar fallback="JD" size="sm" alt="Jordan Diaz" />
              <div v-if="!collapsed" class="min-w-0">
                <p class="truncate text-sm font-medium leading-tight">
                  Jordan Diaz
                </p>
                <p class="truncate text-xs leading-tight text-[var(--dz-sidebar-text-muted)]">
                  jordan@datazup.io
                </p>
              </div>
            </div>
          </DzSidebarFooter>
        </DzSidebar>
      </template>

      <!-- Navbar: left toggle -->
      <template #header-start>
        <DzIconButton
          :icon="Menu"
          aria-label="Toggle sidebar"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="toggleSidebar"
        />
      </template>

      <!-- Navbar: center breadcrumb -->
      <template #header>
        <DzBreadcrumb separator="/">
          <DzBreadcrumbItem href="#">
            Home
          </DzBreadcrumbItem>
          <DzBreadcrumbItem href="#">
            Workspace
          </DzBreadcrumbItem>
          <DzBreadcrumbItem current>
            Overview
          </DzBreadcrumbItem>
        </DzBreadcrumb>
      </template>

      <!-- Navbar: right cluster -->
      <template #header-end>
        <div class="flex items-center gap-2">
          <div class="hidden w-56 sm:block">
            <DzInput
              v-model="search"
              type="search"
              placeholder="Search…"
              aria-label="Search"
              size="sm"
            >
              <template #prefix>
                <Search class="h-4 w-4 text-[var(--dz-muted-foreground)]" aria-hidden="true" />
              </template>
            </DzInput>
          </div>
          <DzIconButton
            :icon="Bell"
            aria-label="Notifications"
            variant="ghost"
            tone="neutral"
            size="sm"
          />
          <DzAvatar fallback="JD" size="sm" alt="Jordan Diaz" />
        </div>
      </template>

      <!-- Content -->
      <div class="mx-auto max-w-6xl px-6 py-8">
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
            <DzText as="p" size="sm" tone="muted" class="mt-1">
              A snapshot of activity across your workspace this month.
            </DzText>
          </div>
        </header>

        <!-- KPI cards -->
        <section class="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <span
                class="mt-4 text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums"
              >
                {{ kpi.value }}
              </span>
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

        <!-- Recent items list -->
        <DzCard variant="elevated" padding="none" class="mt-10">
          <div
            class="flex items-center justify-between border-b border-[var(--dz-border)] px-6 py-4"
          >
            <div>
              <DzHeading :level="2" size="md" weight="semibold">
                Recent Activity
              </DzHeading>
              <DzText as="p" size="xs" tone="muted" class="mt-0.5">
                Latest changes across your workspace
              </DzText>
            </div>
          </div>
          <ul class="divide-y divide-[var(--dz-border)]">
            <li v-for="row in recent" :key="row.name" class="flex items-center gap-3 px-6 py-4">
              <span
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--dz-radius-full)] bg-[var(--dz-primary-muted)] text-xs font-semibold leading-none tabular-nums text-[var(--dz-primary-muted-foreground)]"
                aria-hidden="true"
              >
                {{ row.initials }}
              </span>
              <div class="min-w-0 flex-1">
                <DzText as="p" size="sm" weight="medium" class="truncate">
                  {{ row.name }}
                </DzText>
                <DzText as="p" size="xs" tone="muted" class="truncate">
                  {{ row.meta }}
                </DzText>
              </div>
              <DzBadge variant="subtle" :tone="statusTone[row.status]" size="sm" class="capitalize">
                {{ row.status }}
              </DzBadge>
            </li>
          </ul>
        </DzCard>
      </div>
    </DzAppShell>
  </div>
</template>
