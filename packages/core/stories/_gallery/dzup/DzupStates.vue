<script setup lang="ts">
// dzup-ui STATES showcase — loading skeletons, empty state, and error state.
// ONLY @dzup-ui/core components + --dz-* tokens + plain divs.
// A modern dashboard's async-UI states at reference quality.

import { Inbox, PackageOpen, Plus, RefreshCw } from 'lucide-vue-next'
import { DzButton } from '../../../src/components/buttons'
import { DzCard } from '../../../src/components/cards'
import { DzAlert, DzEmpty, DzSkeleton, DzSpinner } from '../../../src/components/feedback'
import { DzHeading, DzText } from '../../../src/components/typography'

// Deterministic placeholder rows for the loading skeleton list.
const skeletonRows = [0, 1, 2, 3, 4]
</script>

<template>
  <div class="min-h-screen bg-[var(--dz-background)] text-[var(--dz-foreground)] antialiased">
    <div class="mx-auto max-w-5xl px-6 py-10">
      <!-- Page header -->
      <header>
        <DzText
          as="p"
          size="xs"
          weight="semibold"
          tone="muted"
          class="mb-1 uppercase tracking-[0.2em] text-[var(--dz-primary)]"
        >
          Async UI
        </DzText>
        <DzHeading :level="1" size="2xl" weight="semibold" class="tracking-tight">
          States
        </DzHeading>
        <div style="margin-top: 0.5rem">
          <DzText as="p" size="sm" tone="muted">
            Loading, empty, and error states
          </DzText>
        </div>
      </header>

      <!-- Three panels: Loading / Empty / Error -->
      <section class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- ── Loading ─────────────────────────────────────────────── -->
        <div>
          <div style="margin-bottom: 0.75rem">
            <DzText
              as="p"
              size="xs"
              weight="semibold"
              tone="muted"
              class="uppercase tracking-[0.18em]"
            >
              Loading
            </DzText>
          </div>
          <DzCard variant="elevated" padding="none" class="h-full overflow-hidden">
            <div class="px-6 py-6">
              <!-- Header skeleton: title line + caption line -->
              <div class="flex flex-col gap-2">
                <DzSkeleton variant="text" width="45%" height="1rem" />
                <DzSkeleton variant="text" width="65%" height="0.75rem" />
              </div>

              <!-- Divider -->
              <div class="my-5 border-t border-[var(--dz-border)]" aria-hidden="true" />

              <!-- 5 rows: circular avatar + two text lines -->
              <div class="flex flex-col gap-5" aria-hidden="true">
                <div v-for="row in skeletonRows" :key="row" class="flex items-center gap-3">
                  <DzSkeleton variant="circular" width="2.5rem" height="2.5rem" />
                  <div class="flex flex-1 flex-col gap-2">
                    <DzSkeleton variant="text" width="70%" height="0.85rem" />
                    <DzSkeleton variant="text" width="40%" height="0.7rem" />
                  </div>
                </div>
              </div>
            </div>
          </DzCard>
        </div>

        <!-- ── Empty ───────────────────────────────────────────────── -->
        <div>
          <div style="margin-bottom: 0.75rem">
            <DzText
              as="p"
              size="xs"
              weight="semibold"
              tone="muted"
              class="uppercase tracking-[0.18em]"
            >
              Empty
            </DzText>
          </div>
          <DzCard variant="elevated" padding="none" class="h-full overflow-hidden">
            <div class="flex h-full items-center justify-center px-6 py-10">
              <DzEmpty
                :icon="PackageOpen"
                title="No deployments yet"
                description="Once you ship your first build, it'll show up here with status and history."
              >
                <template #icon>
                  <div
                    class="grid place-items-center rounded-[var(--dz-radius-full)] bg-[var(--dz-muted)]"
                    style="height: 4rem; width: 4rem"
                  >
                    <Inbox class="h-7 w-7 text-[var(--dz-muted-foreground)]" aria-hidden="true" />
                  </div>
                </template>
                <template #actions>
                  <DzButton variant="solid" tone="primary">
                    <template #prefix>
                      <Plus class="h-4 w-4" aria-hidden="true" />
                    </template>
                    Create deployment
                  </DzButton>
                </template>
              </DzEmpty>
            </div>
          </DzCard>
        </div>

        <!-- ── Error ───────────────────────────────────────────────── -->
        <div>
          <div style="margin-bottom: 0.75rem">
            <DzText
              as="p"
              size="xs"
              weight="semibold"
              tone="muted"
              class="uppercase tracking-[0.18em]"
            >
              Error
            </DzText>
          </div>
          <DzCard variant="elevated" padding="none" class="h-full overflow-hidden">
            <div class="flex h-full flex-col gap-5 px-6 py-6">
              <DzAlert variant="subtle" tone="danger" title="Failed to load deployments">
                We couldn't reach the deployments service. Check your connection and try again.
                <template #actions>
                  <DzButton variant="outline" tone="danger" size="sm">
                    <template #prefix>
                      <RefreshCw class="h-4 w-4" aria-hidden="true" />
                    </template>
                    Retry
                  </DzButton>
                </template>
              </DzAlert>

              <!-- Retrying indicator -->
              <div
                class="mt-auto flex items-center gap-2.5 rounded-[var(--dz-radius-md)] bg-[var(--dz-muted)] px-3 py-2.5"
              >
                <DzSpinner size="sm" tone="danger" label="Retrying" />
                <DzText as="span" size="xs" tone="muted">
                  Retrying automatically…
                </DzText>
              </div>
            </div>
          </DzCard>
        </div>
      </section>
    </div>
  </div>
</template>
