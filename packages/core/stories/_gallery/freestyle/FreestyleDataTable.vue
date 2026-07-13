<script setup lang="ts">
// token-check-disable-file — this screen is the raw-Tailwind visual target the token system is measured against; tokenizing it would erase the comparison.
// Free-styled reference screen — RAW Tailwind 4 only.
// No @dzup-ui components, no design-system tokens. This is the "looks great" visual target.

import { ref } from 'vue'

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

const statusStyles: Record<Deployment['status'], string> = {
  active:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  pending:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  failed:
    'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
}

const pages: number[] = [1, 2, 3, 4, 5]
const currentPage = ref(1)
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100"
  >
    <div class="mx-auto max-w-6xl px-6 py-10">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight">
          Deployments
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track every release across your environments.
        </p>
      </header>

      <div
        class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900"
      >
        <!-- Filter bar -->
        <div
          class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center dark:border-white/5"
        >
          <!-- Search -->
          <div class="relative flex-1">
            <span
              class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-4 w-4"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 3.5a5.5 5.5 0 1 0 3.4 9.82l3.64 3.64a.75.75 0 1 0 1.06-1.06l-3.64-3.64A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            <input
              v-model="search"
              type="search"
              placeholder="Search deployments…"
              class="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500"
            >
          </div>

          <!-- Status filter -->
          <div class="relative">
            <select
              v-model="statusFilter"
              aria-label="Filter by status"
              class="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-3.5 pr-9 text-sm font-medium text-slate-700 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-40 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
            >
              <option value="all">
                All statuses
              </option>
              <option value="active">
                Active
              </option>
              <option value="pending">
                Pending
              </option>
              <option value="failed">
                Failed
              </option>
            </select>
            <span
              class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
              aria-hidden="true"
            >▾</span>
          </div>

          <!-- Owner filter -->
          <div class="relative">
            <select
              v-model="ownerFilter"
              aria-label="Filter by owner"
              class="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-3.5 pr-9 text-sm font-medium text-slate-700 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-40 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200"
            >
              <option value="all">
                All owners
              </option>
              <option value="ml">
                Mara Lindqvist
              </option>
              <option value="dr">
                Devon Reyes
              </option>
              <option value="pn">
                Priya Nair
              </option>
            </select>
            <span
              class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
              aria-hidden="true"
            >▾</span>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr
                class="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-white/5 dark:text-slate-500"
              >
                <th class="px-5 py-3 font-semibold">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Service
                    <span class="text-indigo-500" aria-hidden="true">▲</span>
                  </button>
                </th>
                <th class="px-5 py-3 font-semibold">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-slate-400/80 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Environment
                    <span class="opacity-40" aria-hidden="true">⇅</span>
                  </button>
                </th>
                <th class="px-5 py-3 font-semibold">
                  Status
                </th>
                <th class="px-5 py-3 font-semibold">
                  Owner
                </th>
                <th class="px-5 py-3 font-semibold">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-slate-400/80 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Duration
                    <span class="opacity-40" aria-hidden="true">⇅</span>
                  </button>
                </th>
                <th class="px-5 py-3" />
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/5">
              <tr
                v-for="row in rows"
                :key="row.id"
                class="group cursor-pointer transition-colors"
                :class="
                  selectedId === row.id
                    ? 'bg-indigo-50/70 ring-1 ring-inset ring-indigo-200/70 dark:bg-indigo-500/10 dark:ring-indigo-400/20'
                    : 'hover:bg-slate-50/80 dark:hover:bg-white/[0.03]'
                "
                @click="selectedId = row.id"
              >
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="h-2 w-2 rounded-full"
                      :class="
                        selectedId === row.id ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                      "
                      aria-hidden="true"
                    />
                    <div>
                      <span class="block font-medium">{{ row.service }}</span>
                      <span class="block font-mono text-xs text-slate-400 dark:text-slate-500">{{
                        row.id
                      }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5">
                  <span
                    class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {{ row.env }}
                  </span>
                </td>
                <td class="px-5 py-3.5">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset"
                    :class="statusStyles[row.status]"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full bg-current opacity-70"
                      aria-hidden="true"
                    />
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[11px] font-semibold text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-200"
                    >{{ row.initials }}</span>
                    <span class="text-slate-600 dark:text-slate-300">{{ row.owner }}</span>
                  </div>
                </td>
                <td
                  class="px-5 py-3.5 font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400"
                >
                  {{ row.duration }}
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    aria-label="Row actions"
                    class="rounded-lg px-2 py-1 text-lg leading-none text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-700 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-white"
                    @click.stop
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination footer -->
        <div
          class="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row dark:border-white/5"
        >
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Showing <span class="font-medium text-slate-700 dark:text-slate-200">1–10</span> of
            <span class="font-medium text-slate-700 dark:text-slate-200">42</span>
          </p>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5"
            >
              Prev
            </button>
            <button
              v-for="p in pages"
              :key="p"
              type="button"
              class="min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              :class="
                currentPage === p
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              "
              @click="currentPage = p"
            >
              {{ p }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
