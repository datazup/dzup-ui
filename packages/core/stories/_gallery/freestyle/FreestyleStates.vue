<script setup lang="ts">
// Free-styled reference screen — RAW Tailwind 4 only.
// No @dzup-ui components, no design-system tokens. This is the "looks great" visual target.

import { Inbox, Plus, RefreshCw } from 'lucide-vue-next'

// Deterministic placeholder rows for the loading skeleton list.
const skeletonRows = [0, 1, 2, 3, 4]
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/40 px-4 py-12 font-sans text-slate-900 antialiased dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 dark:text-slate-100"
  >
    <div class="mx-auto max-w-5xl px-2 sm:px-6">
      <!-- Page header -->
      <header>
        <p
          class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400"
        >
          Async UI
        </p>
        <h1 class="text-2xl font-semibold tracking-tight">
          States
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Loading, empty, and error states
        </p>
      </header>

      <!-- Three panels: Loading / Empty / Error -->
      <section class="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <!-- ── Loading ─────────────────────────────────────────────── -->
        <div class="flex flex-col">
          <p
            class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
          >
            Loading
          </p>
          <div
            class="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
          >
            <div class="px-6 py-6">
              <!-- Header skeleton: title line + caption line -->
              <div class="flex animate-pulse flex-col gap-2" aria-hidden="true">
                <div class="h-4 w-[45%] rounded-md bg-slate-200 dark:bg-slate-700" />
                <div class="h-3 w-[65%] rounded-md bg-slate-200 dark:bg-slate-700" />
              </div>

              <!-- Divider -->
              <div class="my-5 border-t border-slate-100 dark:border-white/5" aria-hidden="true" />

              <!-- 5 rows: circular avatar + two text lines -->
              <div class="flex animate-pulse flex-col gap-5" aria-hidden="true">
                <div v-for="row in skeletonRows" :key="row" class="flex items-center gap-3">
                  <div class="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div class="flex flex-1 flex-col gap-2">
                    <div class="h-3 w-[70%] rounded-md bg-slate-200 dark:bg-slate-700" />
                    <div class="h-2.5 w-[40%] rounded-md bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Empty ───────────────────────────────────────────────── -->
        <div class="flex flex-col">
          <p
            class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
          >
            Empty
          </p>
          <div
            class="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
          >
            <div class="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
              <div
                class="grid h-16 w-16 place-items-center rounded-full bg-slate-100 dark:bg-white/5"
              >
                <Inbox class="h-7 w-7 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              </div>
              <h2 class="mt-4 text-base font-semibold tracking-tight">
                No deployments yet
              </h2>
              <p class="mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                Once you ship your first build, it'll show up here with status and history.
              </p>
              <button
                type="button"
                class="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 ring-1 ring-inset ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 active:translate-y-0 dark:focus-visible:ring-offset-slate-900"
              >
                <Plus class="h-4 w-4" aria-hidden="true" />
                Create deployment
              </button>
            </div>
          </div>
        </div>

        <!-- ── Error ───────────────────────────────────────────────── -->
        <div class="flex flex-col">
          <p
            class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
          >
            Error
          </p>
          <div
            class="h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
          >
            <div class="flex h-full flex-col gap-5 px-6 py-6">
              <!-- Rose-tinted alert -->
              <div
                class="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-950/30"
              >
                <h2 class="text-sm font-semibold text-rose-800 dark:text-rose-200">
                  Failed to load deployments
                </h2>
                <p class="mt-1 text-sm text-rose-700/90 dark:text-rose-300/90">
                  We couldn't reach the deployments service. Check your connection and try again.
                </p>
                <button
                  type="button"
                  class="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:border-rose-500/40 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10 dark:focus-visible:ring-offset-slate-900"
                >
                  <RefreshCw class="h-3.5 w-3.5" aria-hidden="true" />
                  Retry
                </button>
              </div>

              <!-- Retrying indicator pinned to the bottom -->
              <div
                class="mt-auto flex items-center gap-2.5 rounded-xl bg-slate-100 px-3 py-2.5 dark:bg-white/5"
              >
                <span
                  class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rose-300 border-t-rose-600 dark:border-rose-500/40 dark:border-t-rose-400"
                  aria-hidden="true"
                />
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  Retrying automatically…
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
