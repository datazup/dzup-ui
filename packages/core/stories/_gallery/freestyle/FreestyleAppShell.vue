<script setup lang="ts">
// token-check-disable-file — this screen is the raw-Tailwind visual target the token system is measured against; tokenizing it would erase the comparison.
// Free-styled reference screen — RAW Tailwind 4 only.
// No @dzup-ui components, no design-system tokens. This is the "looks great" visual target.

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

const statusPill: Record<RecentItem['status'], string> = {
  active:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  pending:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  failed:
    'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
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
  <div
    class="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100"
  >
    <!-- Sidebar -->
    <aside
      class="hidden shrink-0 flex-col bg-slate-900 text-slate-300 ring-1 ring-black/10 transition-[width] duration-200 md:flex dark:bg-slate-950 dark:ring-white/5"
      :class="collapsed ? 'w-[4.5rem]' : 'w-64'"
      aria-label="Workspace navigation"
    >
      <!-- Logo / header -->
      <div class="flex h-16 items-center gap-2.5 border-b border-white/5 px-4">
        <span
          class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/40"
          aria-hidden="true"
        >
          D
        </span>
        <span v-if="!collapsed" class="text-base font-semibold tracking-tight text-white">
          Datazup
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <!-- Main section -->
        <div>
          <p
            v-if="!collapsed"
            class="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            Main
          </p>
          <ul class="space-y-0.5">
            <li v-for="item in mainNav" :key="item.label">
              <a
                href="#"
                class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                :class="
                  item.active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                "
                :title="collapsed ? item.label : undefined"
              >
                <component
                  :is="item.icon"
                  class="h-[18px] w-[18px] shrink-0"
                  :class="item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'"
                  aria-hidden="true"
                />
                <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
                <span
                  v-if="item.badge && !collapsed"
                  class="inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[0.7rem] font-semibold tabular-nums"
                  :class="
                    item.active
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-slate-300 group-hover:bg-white/15'
                  "
                >
                  {{ item.badge }}
                </span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Workspace section -->
        <div>
          <p
            v-if="!collapsed"
            class="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            Workspace
          </p>
          <ul class="space-y-0.5">
            <li v-for="item in workspaceNav" :key="item.label">
              <a
                href="#"
                class="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                :title="collapsed ? item.label : undefined"
              >
                <component
                  :is="item.icon"
                  class="h-[18px] w-[18px] shrink-0 text-slate-400 group-hover:text-slate-200"
                  aria-hidden="true"
                />
                <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
                <span
                  v-if="item.badge && !collapsed"
                  class="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-white/10 px-1.5 text-[0.7rem] font-semibold tabular-nums text-slate-300 group-hover:bg-white/15"
                >
                  {{ item.badge }}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Footer / user -->
      <div class="border-t border-white/5 p-3">
        <div class="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <span
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-semibold text-white ring-1 ring-white/10"
            aria-hidden="true"
          >
            JD
          </span>
          <div v-if="!collapsed" class="min-w-0">
            <p class="truncate text-sm font-medium leading-tight text-white">
              Jordan Diaz
            </p>
            <p class="truncate text-xs leading-tight text-slate-400">
              jordan@datazup.io
            </p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Top navbar -->
      <header
        class="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-sm sm:px-6 dark:border-white/10 dark:bg-slate-900/80"
      >
        <!-- Menu toggle -->
        <button
          type="button"
          aria-label="Toggle sidebar"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
          @click="toggleSidebar"
        >
          <Menu class="h-5 w-5" aria-hidden="true" />
        </button>

        <!-- Breadcrumb -->
        <nav aria-label="Breadcrumb" class="hidden min-w-0 sm:block">
          <ol class="flex items-center gap-2 text-sm">
            <li>
              <a
                href="#"
                class="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >Home</a>
            </li>
            <li class="text-slate-300 dark:text-slate-600" aria-hidden="true">
              /
            </li>
            <li>
              <a
                href="#"
                class="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >Workspace</a>
            </li>
            <li class="text-slate-300 dark:text-slate-600" aria-hidden="true">
              /
            </li>
            <li>
              <span class="font-medium text-slate-900 dark:text-slate-100" aria-current="page">Overview</span>
            </li>
          </ol>
        </nav>

        <!-- Right cluster -->
        <div class="ml-auto flex items-center gap-2">
          <!-- Search -->
          <div class="relative hidden w-56 sm:block">
            <Search
              class="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              v-model="search"
              type="search"
              placeholder="Search…"
              aria-label="Search"
              class="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500"
            >
          </div>

          <!-- Notifications -->
          <button
            type="button"
            aria-label="Notifications"
            class="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
          >
            <Bell class="h-5 w-5" aria-hidden="true" />
            <span
              class="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"
              aria-hidden="true"
            />
          </button>

          <!-- Avatar -->
          <span
            class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-semibold text-white ring-1 ring-black/5 dark:ring-white/10"
            aria-label="Jordan Diaz"
          >
            JD
          </span>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="mx-auto max-w-6xl px-6 py-8">
          <!-- Overview header -->
          <header class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p
                class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400"
              >
                Workspace
              </p>
              <h1 class="text-2xl font-semibold tracking-tight">
                Overview
              </h1>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                A snapshot of activity across your workspace this month.
              </p>
            </div>
          </header>

          <!-- KPI cards -->
          <section class="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="kpi in kpis"
              :key="kpi.label"
              class="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 ring-1 ring-black/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40 dark:ring-white/[0.03]"
            >
              <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
                {{ kpi.label }}
              </p>
              <span
                class="mt-4 text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums"
              >
                {{ kpi.value }}
              </span>
              <div class="mt-4 flex items-center gap-2">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset"
                  :class="
                    kpi.delta >= 0
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20'
                      : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20'
                  "
                >
                  <component
                    :is="kpi.delta >= 0 ? TrendingUp : TrendingDown"
                    class="h-3 w-3"
                    aria-hidden="true"
                  />
                  <span class="tabular-nums">{{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta }}%</span>
                </span>
                <span class="text-xs text-slate-500 dark:text-slate-400">{{ kpi.hint }}</span>
              </div>
            </div>
          </section>

          <!-- Recent activity -->
          <section
            class="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40 dark:ring-white/[0.03]"
          >
            <div
              class="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/5"
            >
              <div>
                <h2 class="text-base font-semibold tracking-tight">
                  Recent Activity
                </h2>
                <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Latest changes across your workspace
                </p>
              </div>
            </div>
            <ul class="divide-y divide-slate-100 dark:divide-white/5">
              <li
                v-for="row in recent"
                :key="row.name"
                class="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
              >
                <span
                  class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold leading-none tabular-nums text-indigo-700 ring-1 ring-inset ring-indigo-600/10 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20"
                  aria-hidden="true"
                >
                  {{ row.initials }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {{ row.name }}
                  </p>
                  <p class="truncate text-xs text-slate-500 dark:text-slate-400">
                    {{ row.meta }}
                  </p>
                </div>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset"
                  :class="statusPill[row.status]"
                >
                  {{ row.status }}
                </span>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>
