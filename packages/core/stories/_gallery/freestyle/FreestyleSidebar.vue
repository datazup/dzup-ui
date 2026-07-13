<script setup lang="ts">
// token-check-disable-file — this screen is the raw-Tailwind visual target the token system is measured against; tokenizing it would erase the comparison.
// Free-styled reference screen — RAW Tailwind 4 only.
// No @dzup-ui components, no design-system tokens. This is the "looks great" visual target.

import type { Component } from 'vue'
import {
  BarChart3,
  FolderKanban,
  Home,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Users,
} from 'lucide-vue-next'

interface NavItem {
  label: string
  icon: Component
  active?: boolean
  badge?: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

// Shared nav data — rendered twice (expanded + collapsed).
const groups: NavGroup[] = [
  {
    title: 'Main',
    items: [
      { label: 'Home', icon: Home },
      { label: 'Dashboard', icon: LayoutDashboard, active: true },
      { label: 'Inbox', icon: Inbox, badge: '12' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Projects', icon: FolderKanban, badge: '5' },
      { label: 'Team', icon: Users },
      { label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', icon: Settings },
      { label: 'Support', icon: LifeBuoy },
    ],
  },
]

// Flattened list for the collapsed icon-rail (same items, same active state).
const railItems: NavItem[] = groups.flatMap(group => group.items)
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 px-6 py-10 font-sans text-slate-900 antialiased dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 dark:text-slate-100"
  >
    <div class="mx-auto max-w-6xl">
      <!-- Page header -->
      <header class="mb-8">
        <p
          class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400"
        >
          Navigation
        </p>
        <h1 class="text-2xl font-semibold tracking-tight">
          Sidebar
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Grouped sections, count badges, and the icon-rail collapsed state.
        </p>
      </header>

      <div class="flex flex-wrap items-start gap-8">
        <!-- Expanded grouped sidebar -->
        <div class="flex flex-col gap-3">
          <aside
            class="flex h-[640px] w-[17rem] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
          >
            <!-- Header: logo + workspace name -->
            <div class="border-b border-slate-100 px-4 py-4 dark:border-white/5">
              <div class="flex items-center gap-2.5">
                <span
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-inset ring-white/10"
                >
                  <LayoutDashboard class="h-5 w-5" aria-hidden="true" />
                </span>
                <span class="flex min-w-0 flex-col leading-tight">
                  <span class="truncate text-sm font-semibold tracking-tight">Datazup</span>
                  <span class="truncate text-xs text-slate-500 dark:text-slate-400">Workspace</span>
                </span>
              </div>
            </div>

            <!-- Grouped nav -->
            <nav class="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              <div v-for="group in groups" :key="group.title">
                <p
                  class="mb-1.5 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500"
                >
                  {{ group.title }}
                </p>
                <ul class="space-y-0.5">
                  <li v-for="item in group.items" :key="item.label">
                    <a
                      href="#"
                      class="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                      :class="
                        item.active
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-inset ring-white/10'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                      "
                      :aria-current="item.active ? 'page' : undefined"
                    >
                      <component
                        :is="item.icon"
                        class="h-[1.125rem] w-[1.125rem] shrink-0"
                        :class="
                          item.active
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                        "
                        aria-hidden="true"
                      />
                      <span class="flex-1 truncate">{{ item.label }}</span>
                      <span
                        v-if="item.badge"
                        class="inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums"
                        :class="
                          item.active
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300'
                        "
                      >
                        {{ item.badge }}
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </nav>

            <!-- Footer: avatar + name + role -->
            <div class="border-t border-slate-100 px-4 py-4 dark:border-white/5">
              <div class="flex items-center gap-2.5">
                <span
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10"
                  aria-hidden="true"
                >
                  ML
                </span>
                <span class="flex min-w-0 flex-col leading-tight">
                  <span class="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                    Mara Lindqvist
                  </span>
                  <span class="truncate text-xs text-slate-500 dark:text-slate-400">Admin</span>
                </span>
              </div>
            </div>
          </aside>
          <p class="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Expanded
          </p>
        </div>

        <!-- Collapsed icon-rail — same data, icons only -->
        <div class="flex flex-col gap-3">
          <aside
            class="flex h-[640px] w-[4.5rem] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
          >
            <!-- Header: logo only -->
            <div
              class="flex justify-center border-b border-slate-100 px-3 py-4 dark:border-white/5"
            >
              <span
                class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-inset ring-white/10"
              >
                <LayoutDashboard class="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <!-- Icon-only nav -->
            <nav class="flex-1 overflow-y-auto px-3 py-4">
              <ul class="flex flex-col items-center gap-1">
                <li v-for="item in railItems" :key="item.label">
                  <a
                    href="#"
                    :aria-label="item.label"
                    :aria-current="item.active ? 'page' : undefined"
                    class="group relative grid h-10 w-10 place-items-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                    :class="
                      item.active
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-inset ring-white/10'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                    "
                  >
                    <component
                      :is="item.icon"
                      class="h-[1.125rem] w-[1.125rem]"
                      aria-hidden="true"
                    />
                    <span
                      v-if="item.badge"
                      class="absolute -right-0.5 -top-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-indigo-500 px-1 text-[0.6rem] font-semibold tabular-nums text-white ring-2 ring-white dark:ring-slate-900"
                    >
                      {{ item.badge }}
                    </span>
                  </a>
                </li>
              </ul>
            </nav>

            <!-- Footer: avatar only -->
            <div
              class="flex justify-center border-t border-slate-100 px-3 py-4 dark:border-white/5"
            >
              <span
                class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10"
                aria-hidden="true"
              >
                ML
              </span>
            </div>
          </aside>
          <p class="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Collapsed
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
