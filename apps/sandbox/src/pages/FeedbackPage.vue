<script setup lang="ts">
import {
  DzAlert,
  DzBadge,
  DzProgress,
  DzSkeleton,
  DzSpinner,
} from '@dzup-ui/core'
import { ref } from 'vue'

const progressValue = ref(45)
const showAlert = ref(true)

const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
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
        <DzAlert tone="primary" title="Information">
          This is a primary informational alert message.
        </DzAlert>
        <DzAlert tone="success" title="Success">
          Operation completed successfully.
        </DzAlert>
        <DzAlert tone="warning" title="Warning">
          Please review your input before proceeding.
        </DzAlert>
        <DzAlert tone="danger" title="Error">
          Something went wrong. Please try again.
        </DzAlert>
        <DzAlert tone="info" title="Note">
          Additional information is available.
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
      </div>
    </section>

    <!-- Badges -->
    <section class="demo-section">
      <h2 class="section-title">
        Badges
      </h2>
      <div class="demo-row">
        <DzBadge v-for="t in tones" :key="t" :tone="t">
          {{ t }}
        </DzBadge>
      </div>
    </section>

    <!-- Progress -->
    <section class="demo-section">
      <h2 class="section-title">
        Progress
      </h2>
      <div class="demo-stack">
        <DzProgress :model-value="progressValue" />
        <div class="demo-row">
          <button class="plain-btn" @click="progressValue = Math.max(0, progressValue - 10)">
            -10
          </button>
          <span class="state-label">{{ progressValue }}%</span>
          <button class="plain-btn" @click="progressValue = Math.min(100, progressValue + 10)">
            +10
          </button>
        </div>
        <DzProgress :model-value="25" tone="success" />
        <DzProgress :model-value="60" tone="warning" />
        <DzProgress :model-value="80" tone="danger" />
      </div>
    </section>

    <!-- Spinner -->
    <section class="demo-section">
      <h2 class="section-title">
        Spinner
      </h2>
      <div class="demo-row">
        <DzSpinner size="xs" />
        <DzSpinner size="sm" />
        <DzSpinner size="md" />
        <DzSpinner size="lg" />
        <DzSpinner size="xl" />
      </div>
    </section>

    <!-- Skeleton -->
    <section class="demo-section">
      <h2 class="section-title">
        Skeleton
      </h2>
      <div class="demo-stack">
        <DzSkeleton style="width: 200px; height: 16px" />
        <DzSkeleton style="width: 300px; height: 16px" />
        <DzSkeleton style="width: 150px; height: 16px" />
        <div class="demo-row">
          <DzSkeleton style="width: 48px; height: 48px; border-radius: 50%" />
          <div class="demo-stack" style="gap: 8px">
            <DzSkeleton style="width: 160px; height: 14px" />
            <DzSkeleton style="width: 120px; height: 12px" />
          </div>
        </div>
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

.state-label {
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  font-family: monospace;
  min-width: 40px;
  text-align: center;
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
