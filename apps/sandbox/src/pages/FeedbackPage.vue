<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { DzRunStatusBadgeProps, ResultStatus } from '@dzup-ui/core'

type DzRunStatus = DzRunStatusBadgeProps['status']
import {
  DZ_TOAST_KEY,
  DzAlert,
  DzBadge,
  DzEmpty,
  DzNotification,
  DzProgress,
  DzResult,
  DzRunStatusBadge,
  DzSkeleton,
  DzSpinner,
  DzTokenProgressBar,
} from '@dzup-ui/core'
import { inject, ref } from 'vue'

const progressValue = ref(45)
const showAlert = ref(true)
const showNotification = ref(true)
const tokenUsage = ref(620)

const tones: readonly CanonicalTone[] = [
  'neutral',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
]
const sizes: readonly CanonicalSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const badgeVariants = ['solid', 'outline', 'subtle'] as const
const runStatuses: readonly DzRunStatus[] = [
  'PENDING',
  'RUNNING',
  'PAUSED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]
const resultStatuses: readonly ResultStatus[] = ['success', 'error', 'warning', 'info']

const toastCtx = inject(DZ_TOAST_KEY)

function pushToast(tone: CanonicalTone) {
  toastCtx?.add({
    title: `${tone[0]!.toUpperCase()}${tone.slice(1)} toast`,
    description: `This is a ${tone} toast — auto-dismisses after 5s.`,
    tone,
  })
}

function pushPersistentToast() {
  toastCtx?.add({
    title: 'Persistent toast',
    description: 'duration=0 — only dismissable manually.',
    tone: 'primary',
    duration: 0,
  })
}

function pushActionToast() {
  toastCtx?.add({
    title: 'Item deleted',
    description: 'You can still undo this action.',
    tone: 'warning',
    actionLabel: 'Undo',
    onAction: () => toastCtx?.add({ title: 'Undone', tone: 'success' }),
  })
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      Feedback
    </h1>
    <p class="page-description">
      Components for communicating status, progress, and feedback to users.
    </p>

    <!-- Alerts -->
    <section class="demo-section">
      <h2 class="section-title">
        Alerts
      </h2>
      <div class="demo-stack">
        <DzAlert v-for="t in tones" :key="t" :tone="t" :title="t">
          This is a {{ t }} alert message.
        </DzAlert>
      </div>
    </section>

    <!-- Closable Alert -->
    <section class="demo-section">
      <h2 class="section-title">
        Closable Alert
      </h2>
      <div class="demo-stack">
        <DzAlert
          v-if="showAlert"
          tone="primary"
          title="Dismissible"
          closable
          @close="showAlert = false"
        >
          Click the close button to dismiss this alert.
        </DzAlert>
        <button v-if="!showAlert" class="plain-btn" @click="showAlert = true">
          Show Alert Again
        </button>
      </div>
    </section>

    <!-- Alert Variants -->
    <section class="demo-section">
      <h2 class="section-title">
        Alert Variants
      </h2>
      <div class="demo-stack">
        <DzAlert tone="primary" variant="filled" title="Filled Variant">
          Filled background style.
        </DzAlert>
        <DzAlert tone="primary" variant="outline" title="Outline Variant">
          Outline border style.
        </DzAlert>
        <DzAlert tone="primary" variant="subtle" title="Subtle Variant">
          Subtle background style.
        </DzAlert>
        <DzAlert tone="primary" variant="ghost" title="Ghost Variant">
          Ghost background style.
        </DzAlert>
      </div>
    </section>

    <!-- Badges: variant × tone -->
    <section class="demo-section">
      <h2 class="section-title">
        Badges — variant × tone
      </h2>
      <div class="matrix">
        <div v-for="v in badgeVariants" :key="v" class="matrix-row">
          <span class="matrix-label">{{ v }}</span>
          <div class="demo-row">
            <DzBadge v-for="t in tones" :key="t" :variant="v" :tone="t">
              {{ t }}
            </DzBadge>
          </div>
        </div>
      </div>
    </section>

    <!-- Badges: size -->
    <section class="demo-section">
      <h2 class="section-title">
        Badges — size
      </h2>
      <div class="demo-row">
        <DzBadge v-for="s in sizes" :key="s" :size="s" tone="primary">
          {{ s }}
        </DzBadge>
      </div>
    </section>

    <!-- Progress: bar -->
    <section class="demo-section">
      <h2 class="section-title">
        Progress — bar
      </h2>
      <div class="demo-stack">
        <DzProgress :value="progressValue" />
        <div class="demo-row">
          <button class="plain-btn" @click="progressValue = Math.max(0, progressValue - 10)">
            -10
          </button>
          <span class="state-label">{{ progressValue }}%</span>
          <button class="plain-btn" @click="progressValue = Math.min(100, progressValue + 10)">
            +10
          </button>
        </div>
        <DzProgress :value="25" tone="success" />
        <DzProgress :value="60" tone="warning" />
        <DzProgress :value="80" tone="danger" />
      </div>
    </section>

    <!-- Progress: circular -->
    <section class="demo-section">
      <h2 class="section-title">
        Progress — circular
      </h2>
      <div class="demo-row">
        <DzProgress v-for="s in sizes" :key="s" variant="circular" :value="progressValue" :size="s" />
      </div>
      <div class="demo-row" style="margin-top: 12px">
        <DzProgress
          v-for="t in tones"
          :key="t"
          variant="circular"
          :value="65"
          :tone="t"
          size="md"
        />
      </div>
    </section>

    <!-- Progress: indeterminate -->
    <section class="demo-section">
      <h2 class="section-title">
        Progress — indeterminate
      </h2>
      <div class="demo-stack">
        <DzProgress indeterminate />
        <DzProgress indeterminate variant="circular" size="lg" tone="primary" />
      </div>
    </section>

    <!-- Progress: slot label -->
    <section class="demo-section">
      <h2 class="section-title">
        Progress — slot label
      </h2>
      <div class="demo-stack">
        <DzProgress :value="progressValue" tone="info">
          <template #default="{ percentage }">
            <span class="progress-label">{{ percentage }}%</span>
          </template>
        </DzProgress>
      </div>
    </section>

    <!-- Spinner -->
    <section class="demo-section">
      <h2 class="section-title">
        Spinner
      </h2>
      <div class="demo-row">
        <DzSpinner v-for="s in sizes" :key="s" :size="s" />
      </div>
    </section>

    <!-- Skeleton: typed variants -->
    <section class="demo-section">
      <h2 class="section-title">
        Skeleton — text
      </h2>
      <div class="demo-stack">
        <DzSkeleton variant="text" :lines="1" width="240px" />
        <DzSkeleton variant="text" :lines="3" />
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Skeleton — circular
      </h2>
      <div class="demo-row">
        <DzSkeleton variant="circular" width="32px" height="32px" />
        <DzSkeleton variant="circular" width="48px" height="48px" />
        <DzSkeleton variant="circular" width="64px" height="64px" />
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Skeleton — rectangular
      </h2>
      <div class="demo-stack">
        <DzSkeleton variant="rectangular" width="100%" height="120px" />
        <div class="demo-row">
          <DzSkeleton variant="circular" width="48px" height="48px" />
          <div class="demo-stack" style="gap: 8px; flex: 1">
            <DzSkeleton variant="text" :lines="1" width="160px" />
            <DzSkeleton variant="text" :lines="1" width="120px" />
          </div>
        </div>
      </div>
    </section>

    <!-- Toasts -->
    <section class="demo-section">
      <h2 class="section-title">
        Toasts
      </h2>
      <div class="demo-row">
        <button v-for="t in tones" :key="t" class="plain-btn" @click="pushToast(t)">
          {{ t }}
        </button>
      </div>
      <div class="demo-row" style="margin-top: 12px">
        <button class="plain-btn" @click="pushActionToast">
          With action
        </button>
        <button class="plain-btn" @click="pushPersistentToast">
          Persistent (duration=0)
        </button>
        <button class="plain-btn" @click="toastCtx?.clear()">
          Clear all
        </button>
      </div>
    </section>

    <!-- Notification -->
    <section class="demo-section">
      <h2 class="section-title">
        Notifications
      </h2>
      <div class="demo-stack">
        <DzNotification
          v-for="t in tones"
          :key="t"
          :tone="t"
          :title="`${t} notification`"
          description="Persistent until dismissed (unlike a toast)."
        />
        <DzNotification
          v-if="showNotification"
          tone="primary"
          title="Closable notification"
          description="Press the close button to dismiss."
          closable
          @close="showNotification = false"
        />
        <button v-if="!showNotification" class="plain-btn" @click="showNotification = true">
          Show Notification Again
        </button>
      </div>
    </section>

    <!-- Empty + Result side-by-side -->
    <section class="demo-section">
      <h2 class="section-title">
        Empty &amp; Result states
      </h2>
      <div class="side-by-side">
        <div class="state-card">
          <DzEmpty
            title="No items yet"
            description="Add your first item to get started."
          >
            <template #actions>
              <button class="plain-btn">
                Create item
              </button>
            </template>
          </DzEmpty>
        </div>
        <div class="state-card">
          <DzResult
            v-for="s in resultStatuses"
            :key="s"
            :status="s"
            :title="`${s[0]!.toUpperCase()}${s.slice(1)} result`"
            :description="`Operation finished with ${s} status.`"
          />
        </div>
      </div>
    </section>

    <!-- Specialized -->
    <section class="demo-section">
      <h2 class="section-title">
        Specialized
      </h2>
      <p class="subsection-note">
        Domain-specific feedback components.
      </p>

      <h3 class="subsection-title">
        DzRunStatusBadge
      </h3>
      <div class="demo-stack">
        <div class="demo-row">
          <DzRunStatusBadge v-for="s in runStatuses" :key="s" :status="s" size="sm" />
        </div>
        <div class="demo-row">
          <DzRunStatusBadge v-for="s in runStatuses" :key="s" :status="s" size="md" />
        </div>
      </div>

      <h3 class="subsection-title">
        DzTokenProgressBar
      </h3>
      <div class="demo-stack">
        <DzTokenProgressBar :used="tokenUsage" :total="1000">
          <template #default="{ percent, used, total, state }">
            <span class="state-label">{{ used }} / {{ total }} ({{ percent }}%) — {{ state }}</span>
          </template>
        </DzTokenProgressBar>
        <div class="demo-row">
          <button class="plain-btn" @click="tokenUsage = Math.max(0, tokenUsage - 100)">
            -100
          </button>
          <button class="plain-btn" @click="tokenUsage = Math.min(1000, tokenUsage + 100)">
            +100
          </button>
        </div>
        <DzTokenProgressBar :used="300" :total="1000" />
        <DzTokenProgressBar :used="750" :total="1000" />
        <DzTokenProgressBar :used="950" :total="1000" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 32px;
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--dz-surface, #ffffff);
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 16px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 20px 0 12px;
}

.subsection-note {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0 0 16px;
}

.demo-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.matrix {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.matrix-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.matrix-label {
  width: 64px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 720px) {
  .side-by-side {
    grid-template-columns: 1fr;
  }
}

.state-card {
  padding: 16px;
  border: 1px dashed var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.state-label {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  font-family: monospace;
  min-width: 40px;
  text-align: center;
}

.progress-label {
  display: block;
  text-align: right;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
  font-family: monospace;
  margin-top: 4px;
}

.plain-btn {
  padding: 4px 12px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-surface, #ffffff);
  cursor: pointer;
  font-size: 13px;
}

.plain-btn:hover {
  background: var(--dz-muted, #f1f5f9);
}
</style>
