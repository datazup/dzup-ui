<script setup lang="ts">
import type { Component } from 'vue'
/**
 * 500 — Server Error — Utility template (docs/templates.md §6.3).
 *
 * A chromeless, centered error page mirroring the shipped 404: a brand lockup, an
 * oversized "500" glyph, a DzResult (status error) headline with recovery actions
 * (retry / status page / contact), and a DzCard of next steps separated by
 * DzDividers. Leans on the danger palette — a deliberate red counterpoint to the
 * info-tinted 404 and amber maintenance pages it sits beside in Utility.
 *
 * Built only from free `@dzup-ui/core` components, token-styled, light + dark,
 * reflows cleanly 390px → up.
 */
import { DzButton, DzCard, DzDivider, DzResult, DzText } from '@dzup-ui/core'
import { Activity, Boxes, LifeBuoy, RefreshCw, RotateCw } from 'lucide-vue-next'
import { ref } from 'vue'

interface NextStep {
  icon: Component
  label: string
  description: string
}

const STEPS: NextStep[] = [
  {
    icon: RotateCw,
    label: 'Reload the page',
    description: 'Most transient errors clear on a second attempt.',
  },
  {
    icon: Activity,
    label: 'Check our status page',
    description: 'See live system health and any open incidents.',
  },
  {
    icon: LifeBuoy,
    label: 'Contact support',
    description: 'Quote the reference below and we’ll dig in.',
  },
]

/** A plausible incident reference so support has something to anchor on. */
const INCIDENT_ID = 'INC-4F9C-2207'

/** A short, self-clearing "retrying" state so the primary action feels alive. */
const retrying = ref(false)
function retry(): void {
  if (retrying.value)
    return
  retrying.value = true
  window.setTimeout(() => {
    retrying.value = false
  }, 1600)
}
</script>

<template>
  <main class="err-page">
    <div class="err-wrap">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
        <span class="brand-name">Northwind</span>
      </span>

      <p class="err-code" aria-hidden="true">
        500
      </p>

      <DzResult
        status="error"
        title="Something went wrong on our end"
        description="A server error stopped this page from loading. It’s not you — our team has been notified and is looking into it."
      >
        <template #actions>
          <DzButton variant="solid" tone="danger" :loading="retrying" @click="retry">
            <template #prefix>
              <RefreshCw :size="16" aria-hidden="true" />
            </template>
            {{ retrying ? 'Retrying…' : 'Try again' }}
          </DzButton>
          <DzButton variant="outline" tone="neutral" href="#">
            Status page
          </DzButton>
          <DzButton variant="text" tone="neutral" href="#">
            Contact support
          </DzButton>
        </template>
      </DzResult>

      <DzCard variant="outlined" padding="none" class="err-steps">
        <DzText size="xs" tone="muted" weight="semibold" as="div" class="err-steps-label">
          WHILE YOU’RE HERE
        </DzText>
        <ul class="err-steps-list">
          <template v-for="(step, i) in STEPS" :key="step.label">
            <DzDivider v-if="i > 0" />
            <li class="err-step">
              <span class="err-step-icon" aria-hidden="true">
                <component :is="step.icon" :size="18" />
              </span>
              <span class="err-step-meta">
                <DzText weight="medium" as="span">{{ step.label }}</DzText>
                <DzText size="sm" tone="muted" as="span">{{ step.description }}</DzText>
              </span>
            </li>
          </template>
        </ul>
      </DzCard>

      <DzText size="sm" tone="muted" as="p" class="err-foot">
        Reference <code class="err-ref">{{ INCIDENT_ID }}</code> · captured just now
      </DzText>
    </div>
  </main>
</template>

<style scoped>
.err-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: clamp(24px, 5vw, 64px);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-danger) 9%, transparent), transparent 60%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.err-wrap {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
  margin-bottom: 8px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-danger);
  color: var(--dz-danger-foreground, #fff);
}

.err-code {
  margin: 0;
  font-size: clamp(5rem, 18vw, 8rem);
  font-weight: var(--dz-font-bold);
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(
    135deg,
    var(--dz-danger),
    color-mix(in oklch, var(--dz-danger) 55%, var(--dz-foreground))
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.err-steps {
  width: 100%;
  margin-top: 24px;
  text-align: left;
  overflow: hidden;
}

.err-steps-label {
  letter-spacing: 0.06em;
  padding: 14px 16px 6px;
}

.err-steps-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.err-step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
}

.err-step-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: var(--dz-radius-md);
  background: color-mix(in oklch, var(--dz-danger) 12%, transparent);
  color: var(--dz-danger);
}

.err-step-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.err-foot {
  margin-top: 18px;
}

.err-ref {
  font-family: var(--dz-font-mono, monospace);
  font-size: 0.85em;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm);
  background: var(--dz-muted);
  color: var(--dz-foreground);
}
</style>
