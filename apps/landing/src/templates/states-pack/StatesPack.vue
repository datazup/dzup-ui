<script setup lang="ts">
/**
 * Empty & Error States — featured Utility template (docs/templates.md §6.6).
 *
 * A chromeless reference page collecting the UI states every real app needs:
 * a grid of DzEmpty placeholders (no data / no results / all caught up) and a
 * grid of DzResult outcomes (success / error / warning / offline), each framed
 * in a DzCard with copy-and-go actions. Built only from free `@dzup-ui/core`
 * components, token-styled, light + dark, reflows cleanly 390px → up.
 *
 * Heading order is clean: one page <h1>, an <h2> per section, and the <h3>
 * DzResult titles nest beneath their section heading.
 */
import {
  DzButton,
  DzCard,
  DzEmpty,
  DzHeading,
  DzResult,
  DzText,
} from '@dzup-ui/core'
import {
  Boxes,
  FolderPlus,
  Inbox,
  Plus,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-vue-next'
</script>

<template>
  <main class="states-page">
    <div class="states-wrap">
      <!-- ── Page header ─────────────────────────────────────────── -->
      <header class="states-head">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>
        <DzHeading :level="1" size="2xl" weight="semibold">Empty &amp; error states</DzHeading>
        <DzText tone="muted" as="p" class="states-lede">
          The friendly dead-ends of a real product — placeholders, results and
          recoveries, each with a clear next step. Drop these in wherever a list
          comes back empty or a request goes sideways.
        </DzText>
      </header>

      <!-- ── Empty states ────────────────────────────────────────── -->
      <section class="states-section" aria-labelledby="empty-states-title">
        <DzHeading id="empty-states-title" :level="2" size="md" weight="semibold">
          Empty states
        </DzHeading>

        <div class="states-grid">
          <DzCard variant="outlined" padding="lg" class="state-card">
            <DzEmpty
              :icon="FolderPlus"
              title="No projects yet"
              description="Spin up your first project to start tracking work across the team."
            >
              <template #actions>
                <DzButton variant="solid" tone="primary" size="sm">
                  <template #prefix><Plus :size="16" aria-hidden="true" /></template>
                  New project
                </DzButton>
              </template>
            </DzEmpty>
          </DzCard>

          <DzCard variant="outlined" padding="lg" class="state-card">
            <DzEmpty
              :icon="SearchX"
              title="No results found"
              description="No projects match “revenue Q3”. Try a broader term or clear your filters."
            >
              <template #actions>
                <DzButton variant="outline" tone="neutral" size="sm">
                  <template #prefix><SlidersHorizontal :size="16" aria-hidden="true" /></template>
                  Clear filters
                </DzButton>
              </template>
            </DzEmpty>
          </DzCard>

          <DzCard variant="outlined" padding="lg" class="state-card">
            <DzEmpty
              :icon="Inbox"
              title="You're all caught up"
              description="No new notifications. We'll let you know the moment something needs you."
            >
              <template #actions>
                <DzButton variant="ghost" tone="neutral" size="sm">View archive</DzButton>
              </template>
            </DzEmpty>
          </DzCard>
        </div>
      </section>

      <!-- ── Result states ───────────────────────────────────────── -->
      <section class="states-section" aria-labelledby="result-states-title">
        <DzHeading id="result-states-title" :level="2" size="md" weight="semibold">
          Result states
        </DzHeading>

        <div class="states-grid">
          <DzCard variant="outlined" padding="lg" class="state-card">
            <DzResult
              status="success"
              title="Payment received"
              description="Your Pro plan is active. A receipt is on its way to your inbox."
            >
              <template #actions>
                <DzButton variant="solid" tone="primary" size="sm">View receipt</DzButton>
                <DzButton variant="ghost" tone="neutral" size="sm">Back to billing</DzButton>
              </template>
            </DzResult>
          </DzCard>

          <DzCard variant="outlined" padding="lg" class="state-card">
            <DzResult
              status="error"
              title="Upload failed"
              description="“report-final.pdf” couldn't be uploaded. Check your connection and try again."
            >
              <template #actions>
                <DzButton variant="solid" tone="danger" size="sm">
                  <template #prefix><RefreshCw :size="16" aria-hidden="true" /></template>
                  Try again
                </DzButton>
                <DzButton variant="ghost" tone="neutral" size="sm">Contact support</DzButton>
              </template>
            </DzResult>
          </DzCard>

          <DzCard variant="outlined" padding="lg" class="state-card">
            <DzResult
              status="warning"
              title="Storage almost full"
              description="You've used 92% of your workspace storage. Free up space to keep syncing."
            >
              <template #actions>
                <DzButton variant="solid" tone="warning" size="sm">Manage storage</DzButton>
                <DzButton variant="ghost" tone="neutral" size="sm">Upgrade plan</DzButton>
              </template>
            </DzResult>
          </DzCard>

          <DzCard variant="outlined" padding="lg" class="state-card">
            <DzResult
              status="info"
              title="Invite sent"
              description="We emailed an invitation to mara@lumenlabs.io. It expires in 7 days."
            >
              <template #actions>
                <DzButton variant="outline" tone="neutral" size="sm">Resend</DzButton>
                <DzButton variant="ghost" tone="neutral" size="sm">Copy link</DzButton>
              </template>
            </DzResult>
          </DzCard>
        </div>
      </section>

      <footer class="states-foot">
        <Sparkles :size="16" aria-hidden="true" />
        <DzText size="sm" tone="muted" as="span">
          Every state above is a free <code>@dzup-ui/core</code> component — copy, theme, ship.
        </DzText>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.states-page {
  min-height: 100vh;
  width: 100%;
  padding: clamp(32px, 5vw, 72px) clamp(20px, 4vw, 56px);
  background:
    radial-gradient(circle at 50% -10%, color-mix(in oklch, var(--dz-primary) 7%, transparent), transparent 55%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.states-wrap {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: clamp(32px, 4vw, 48px);
}

/* ── Header ─────────────────────────────────────────────────────── */
.states-head {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.states-lede {
  max-width: 60ch;
  line-height: 1.6;
}

/* ── Sections + grid ────────────────────────────────────────────── */
.states-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.states-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.state-card {
  display: flex;
}

/* Let the DzEmpty / DzResult bodies fill and center within each card so the
   grid reads as an even, breathing set of tiles. */
.state-card :deep(> *) {
  flex: 1;
}

/* ── Footer ─────────────────────────────────────────────────────── */
.states-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-top: 8px;
  color: var(--dz-muted-foreground);
  text-align: center;
}

.states-foot code {
  font-family: var(--dz-font-mono);
  font-size: 0.92em;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm);
  background: var(--dz-muted);
  color: var(--dz-foreground);
}
</style>
