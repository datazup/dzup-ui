<script setup lang="ts">
// token-check-disable-file — this screen is the raw-Tailwind visual target the token system is measured against; tokenizing it would erase the comparison.
// Free-styled reference screen — RAW Tailwind 4 only.
// No @dzup-ui components, no design-system tokens. This is the "looks great" visual target.

import {
  Activity,
  CheckCircle2,
  GitCommitHorizontal,
  Pencil,
  Rocket,
  UserPlus,
} from 'lucide-vue-next'
import { ref } from 'vue'

const activeTab = ref<'overview' | 'activity' | 'settings'>('overview')

interface Stat {
  label: string
  value: string
  hint: string
  hintTone: 'success' | 'muted' | 'warning'
}

const stats: Stat[] = [
  { label: 'Deployments', value: '128', hint: '+12 this week', hintTone: 'success' },
  { label: 'Uptime', value: '99.9%', hint: 'Last 30 days', hintTone: 'muted' },
  { label: 'Avg response', value: '142ms', hint: '-8ms vs last week', hintTone: 'success' },
  { label: 'Open issues', value: '3', hint: '1 high priority', hintTone: 'warning' },
]

interface DetailRow {
  label: string
  value: string
}

const overviewRows: DetailRow[] = [
  { label: 'Owner', value: 'Mara Lindqvist' },
  { label: 'Environment', value: 'Production' },
  { label: 'Region', value: 'eu-central-1' },
  { label: 'Last deploy', value: '2 hours ago · dpl_8f21' },
]

interface ActivityEntry {
  icon: typeof Rocket
  title: string
  meta: string
  tone: 'success' | 'primary' | 'muted'
}

const activity: ActivityEntry[] = [
  {
    icon: Rocket,
    title: 'Deployed v2.14.0 to production',
    meta: 'Mara Lindqvist · 2 hours ago',
    tone: 'success',
  },
  {
    icon: GitCommitHorizontal,
    title: 'Merged PR #482 — Optimize index rebuild',
    meta: 'Devon Reyes · 5 hours ago',
    tone: 'primary',
  },
  {
    icon: CheckCircle2,
    title: 'All checks passed on staging',
    meta: 'CI pipeline · yesterday',
    tone: 'muted',
  },
  {
    icon: Activity,
    title: 'Scaled worker pool 4 → 6 instances',
    meta: 'Autoscaler · 2 days ago',
    tone: 'muted',
  },
]

interface Member {
  name: string
  role: string
  initials: string
}

const team: Member[] = [
  { name: 'Mara Lindqvist', role: 'Owner', initials: 'ML' },
  { name: 'Devon Reyes', role: 'Maintainer', initials: 'DR' },
  { name: 'Priya Nair', role: 'Contributor', initials: 'PN' },
]

const avatarStack = [
  { initials: 'ML', alt: 'Mara Lindqvist' },
  { initials: 'DR', alt: 'Devon Reyes' },
  { initials: 'PN', alt: 'Priya Nair' },
]
const avatarOverflow = 2

const hintToneClass: Record<Stat['hintTone'], string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  muted: 'text-slate-500 dark:text-slate-400',
  warning: 'text-amber-600 dark:text-amber-400',
}

const dotTone: Record<ActivityEntry['tone'], string> = {
  success: 'bg-emerald-500',
  primary: 'bg-indigo-500',
  muted: 'bg-slate-300 dark:bg-slate-600',
}

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'settings', label: 'Settings' },
] as const
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 font-sans text-slate-900 antialiased dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 dark:text-slate-100"
  >
    <div class="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="text-sm">
        <ol class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <li>
            <a
              href="#"
              class="rounded transition-colors hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:hover:text-slate-200"
            >
              Projects
            </a>
          </li>
          <li aria-hidden="true" class="text-slate-300 dark:text-slate-600">
            /
          </li>
          <li aria-current="page" class="font-medium text-slate-700 dark:text-slate-200">
            Atlas Migration
          </li>
        </ol>
      </nav>

      <!-- Page header -->
      <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="text-xl font-semibold tracking-tight">
              Atlas Migration
            </h1>
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Active
            </span>
          </div>
          <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Created 12 days ago
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/5 dark:focus-visible:ring-offset-slate-900"
          >
            <Pencil class="h-4 w-4" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 ring-1 ring-inset ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 active:translate-y-0 dark:focus-visible:ring-offset-slate-900"
          >
            <Rocket class="h-4 w-4" aria-hidden="true" />
            Deploy
          </button>
        </div>
      </header>

      <!-- Stat tiles -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
        >
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
            {{ stat.label }}
          </p>
          <p class="mt-2 text-2xl font-semibold leading-none tabular-nums">
            {{ stat.value }}
          </p>
          <p class="mt-2 text-xs" :class="hintToneClass[stat.hintTone]">
            {{ stat.hint }}
          </p>
        </div>
      </div>

      <!-- Main two-column area -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- LEFT: tabbed detail -->
        <div
          class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 ring-1 ring-black/[0.02] lg:col-span-2 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
        >
          <div class="px-6 pt-4">
            <!-- Tablist -->
            <div
              role="tablist"
              aria-label="Project detail sections"
              class="-mb-px flex items-center gap-6 border-b border-slate-200 dark:border-white/10"
            >
              <button
                v-for="tab in tabs"
                :key="tab.value"
                type="button"
                role="tab"
                :aria-selected="activeTab === tab.value"
                class="relative -mb-px border-b-2 px-1 pb-3 pt-2 text-sm font-medium transition-colors focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-indigo-400"
                :class="
                  activeTab === tab.value
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-slate-200'
                "
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Overview: definition list -->
            <div v-if="activeTab === 'overview'" role="tabpanel">
              <dl class="divide-y divide-slate-100 py-2 dark:divide-white/5">
                <div
                  v-for="row in overviewRows"
                  :key="row.label"
                  class="flex items-center justify-between gap-4 py-3.5"
                >
                  <dt class="text-sm text-slate-500 dark:text-slate-400">
                    {{ row.label }}
                  </dt>
                  <dd class="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {{ row.value }}
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Activity: timeline -->
            <div v-else-if="activeTab === 'activity'" role="tabpanel">
              <ul class="space-y-5 py-5">
                <li v-for="(entry, idx) in activity" :key="idx" class="flex items-start gap-3.5">
                  <span
                    class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                  >
                    <component :is="entry.icon" class="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {{ entry.title }}
                    </p>
                    <div class="mt-0.5 flex items-center gap-2">
                      <span
                        class="h-1.5 w-1.5 rounded-full"
                        :class="dotTone[entry.tone]"
                        aria-hidden="true"
                      />
                      <span class="text-xs text-slate-500 dark:text-slate-400">{{
                        entry.meta
                      }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Settings: placeholder -->
            <div v-else role="tabpanel">
              <div class="py-8 text-center">
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  Project settings live here — visibility, integrations, and danger zone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: team -->
        <div
          class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 ring-1 ring-black/[0.02] lg:col-span-1 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold tracking-tight">
              Team
            </h2>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <UserPlus class="h-4 w-4" aria-hidden="true" />
              Invite
            </button>
          </div>

          <!-- Overlapping avatar group -->
          <div class="mt-3 flex items-center" aria-label="Project team members">
            <span
              v-for="(av, idx) in avatarStack"
              :key="av.initials"
              :class="idx === 0 ? '' : '-ml-2'"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 ring-2 ring-white dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-slate-900"
              :title="av.alt"
            >
              {{ av.initials }}
            </span>
            <span
              class="-ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 ring-2 ring-white dark:bg-white/10 dark:text-slate-300 dark:ring-slate-900"
            >
              +{{ avatarOverflow }}
            </span>
          </div>

          <ul class="mt-5 space-y-4">
            <li v-for="member in team" :key="member.name" class="flex items-center gap-3">
              <span
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
              >
                {{ member.initials }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {{ member.name }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {{ member.role }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
