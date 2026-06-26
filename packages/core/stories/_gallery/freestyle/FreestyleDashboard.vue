<script setup lang="ts">
// Free-styled reference screen — RAW Tailwind 4 only.
// No @dzup-ui components, no design-system tokens. This is the "looks great" visual target.

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

const statusStyles: Record<ActivityRow['status'], string> = {
  active:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  pending:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  failed:
    'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
}

// Decorative bars for the chart placeholder (deterministic mock heights).
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
  <div
    class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100"
  >
    <div class="mx-auto max-w-6xl px-6 py-10 [font-feature-settings:'cv11','ss01']">
      <!-- Top bar -->
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400"
          >
            Workspace
          </p>
          <h1 class="text-3xl font-semibold tracking-tight">
            Overview
          </h1>
        </div>
        <button
          type="button"
          class="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 ring-1 ring-inset ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:translate-y-0 dark:focus-visible:ring-offset-slate-950"
        >
          <span
            class="grid h-4 w-4 place-items-center text-base leading-none transition-transform group-hover:rotate-90"
          >+</span>
          New Project
        </button>
      </header>

      <!-- KPI cards -->
      <section class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="kpi in kpis"
          :key="kpi.label"
          class="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-black/40"
        >
          <div
            class="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-indigo-500/5 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-indigo-400/10"
          />
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
            {{ kpi.label }}
          </p>
          <div class="mt-3 flex items-end justify-between gap-2">
            <span class="text-3xl font-semibold tracking-tight tabular-nums">{{ kpi.value }}</span>
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset"
              :class="
                kpi.delta >= 0
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20'
                  : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20'
              "
            >
              <span aria-hidden="true">{{ kpi.delta >= 0 ? '▲' : '▼' }}</span>
              {{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta }}%
            </span>
          </div>
          <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {{ kpi.hint }}
          </p>
        </article>
      </section>

      <!-- Chart placeholder -->
      <section
        class="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/5"
        >
          <div>
            <h2 class="text-base font-semibold">
              Revenue trend
            </h2>
            <p class="text-xs text-slate-400 dark:text-slate-500">
              Last 12 months
            </p>
          </div>
          <div
            class="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium dark:bg-slate-800"
          >
            <button
              type="button"
              class="rounded-md bg-white px-3 py-1 text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
            >
              Monthly
            </button>
            <button
              type="button"
              class="rounded-md px-3 py-1 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Weekly
            </button>
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
              class="border-t border-dashed border-slate-200/70 dark:border-white/5"
            />
          </div>
          <!-- bars -->
          <div class="relative flex h-48 items-end gap-2 sm:gap-3">
            <div
              v-for="(h, i) in bars"
              :key="i"
              class="group/bar flex flex-1 flex-col items-center justify-end"
            >
              <div
                class="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400 opacity-80 transition-all duration-300 hover:opacity-100 dark:from-indigo-500 dark:to-violet-400"
                :style="{ height: `${h}%` }"
              />
            </div>
          </div>
          <!-- x axis -->
          <div
            class="mt-3 flex gap-2 text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:gap-3 dark:text-slate-500"
          >
            <span v-for="m in months" :key="m" class="flex-1 text-center">{{ m }}</span>
          </div>
        </div>
      </section>

      <!-- Recent activity table -->
      <section
        class="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/5"
        >
          <h2 class="text-base font-semibold">
            Recent Activity
          </h2>
          <a
            href="#"
            class="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >View all</a>
        </div>
        <table class="w-full text-left text-sm">
          <thead>
            <tr
              class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              <th class="px-6 py-3 font-semibold">
                Name
              </th>
              <th class="px-6 py-3 font-semibold">
                Status
              </th>
              <th class="px-6 py-3 font-semibold">
                Owner
              </th>
              <th class="px-6 py-3 font-semibold">
                Updated
              </th>
              <th class="px-6 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/5">
            <tr
              v-for="row in activity"
              :key="row.name"
              class="group transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.03]"
            >
              <td class="px-6 py-4 font-medium">
                {{ row.name }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset"
                  :class="statusStyles[row.status]"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
                  {{ row.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2.5">
                  <span
                    class="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[11px] font-semibold text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-200"
                  >{{ row.initials }}</span>
                  <span class="text-slate-600 dark:text-slate-300">{{ row.owner }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-500 dark:text-slate-400">
                {{ row.updated }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  type="button"
                  aria-label="Row actions"
                  class="rounded-lg px-2 py-1 text-lg leading-none text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  ⋯
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>
