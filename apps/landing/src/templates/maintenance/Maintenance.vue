<script setup lang="ts">
/**
 * Scheduled Maintenance — Utility template (docs/templates.md §6.6).
 *
 * A chromeless, centered "we'll be right back" page: a brand lockup, an oversized
 * warning glyph, a status DzBadge, a DzResult-free headline, a DzProgress bar with
 * a live ETA, and a notify-me DzCard pairing a DzInput email capture with a
 * DzButton. Leans on the warning/amber palette — a deliberate counterpoint to the
 * info-tinted 404 page it sits beside in the Utility category.
 *
 * Built only from free `@dzup-ui/core` components, token-styled, light + dark,
 * reflows cleanly 390px → up.
 */
import { DzBadge, DzButton, DzCard, DzDivider, DzHeading, DzInput, DzProgress, DzText } from '@dzup-ui/core'
import { ArrowRight, Boxes, Clock, Wrench } from 'lucide-vue-next'
import { ref } from 'vue'

/** Live progress of the maintenance window (static sample value). */
const progress = 68
const email = ref('')
</script>

<template>
  <main class="mnt-page">
    <div class="mnt-wrap">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
        <span class="brand-name">Northwind</span>
      </span>

      <span class="mnt-glyph" aria-hidden="true"><Wrench :size="40" /></span>

      <DzBadge variant="subtle" tone="warning" size="md">
        <template #default>
          <span class="badge-inline"><Clock :size="13" aria-hidden="true" /> Maintenance in progress</span>
        </template>
      </DzBadge>

      <DzHeading :level="1" size="2xl" weight="semibold" class="mnt-title">
        We'll be right back
      </DzHeading>

      <DzText tone="muted" as="p" class="mnt-lede">
        Northwind is undergoing scheduled upgrades to make things faster and more
        reliable. No action is needed — your data is safe and everything will be
        back automatically.
      </DzText>

      <!-- ── Progress ────────────────────────────────────────────── -->
      <div class="mnt-progress">
        <div class="progress-head">
          <DzText size="sm" weight="medium" as="span">
            Upgrade progress
          </DzText>
          <DzText size="sm" tone="muted" as="span">
            {{ progress }}% · ~25 min remaining
          </DzText>
        </div>
        <DzProgress
          :value="progress"
          tone="warning"
          aria-label="Maintenance progress"
        />
      </div>

      <!-- ── Notify me ───────────────────────────────────────────── -->
      <DzCard variant="outlined" padding="lg" class="mnt-notify">
        <DzText weight="semibold" as="div" class="notify-title">
          Get notified the moment we're back
        </DzText>
        <DzText size="sm" tone="muted" as="p" class="notify-sub">
          Drop your email and we'll send a single message when service is restored.
        </DzText>
        <form class="notify-form" @submit.prevent>
          <DzInput
            v-model="email"
            type="email"
            placeholder="you@company.com"
            autocomplete="email"
            aria-label="Email address"
            class="notify-input"
          />
          <DzButton type="submit" variant="solid" tone="warning">
            Notify me
            <template #suffix>
              <ArrowRight :size="16" aria-hidden="true" />
            </template>
          </DzButton>
        </form>
      </DzCard>

      <DzDivider class="mnt-divider" />

      <DzText size="sm" tone="muted" as="p" class="mnt-foot">
        Following along? Track live progress on our
        <a class="mnt-link" href="#">status page</a> or reach us at
        <a class="mnt-link" href="mailto:support@northwind.io">support@northwind.io</a>.
      </DzText>
    </div>
  </main>
</template>

<style scoped>
.mnt-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: clamp(24px, 5vw, 64px);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-warning) 10%, transparent), transparent 60%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.mnt-wrap {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
  margin-bottom: 4px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-warning);
  color: var(--dz-warning-foreground, #fff);
}

.mnt-glyph {
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  border-radius: var(--dz-radius-full);
  background: color-mix(in oklch, var(--dz-warning) 14%, transparent);
  color: var(--dz-warning);
  margin-bottom: 2px;
}

.badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.mnt-title {
  margin-top: 2px;
}

.mnt-lede {
  max-width: 42ch;
  line-height: 1.6;
}

/* ── Progress ───────────────────────────────────────────────────── */
.mnt-progress {
  width: 100%;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* ── Notify ─────────────────────────────────────────────────────── */
.mnt-notify {
  width: 100%;
  margin-top: 10px;
  text-align: left;
}

.notify-title {
  margin-bottom: 4px;
}

.notify-sub {
  margin-bottom: 14px;
  line-height: 1.5;
}

.notify-form {
  display: flex;
  gap: 10px;
}

.notify-input {
  flex: 1;
  min-width: 0;
}

/* ── Footer ─────────────────────────────────────────────────────── */
.mnt-divider {
  margin: 10px 0 2px;
}

.mnt-foot {
  line-height: 1.6;
}

.mnt-link {
  color: var(--dz-warning);
  font-weight: var(--dz-font-medium);
  text-decoration: none;
}

.mnt-link:hover {
  text-decoration: underline;
}

.mnt-link:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
  border-radius: var(--dz-radius-sm);
}

@media (max-width: 440px) {
  .notify-form {
    flex-direction: column;
  }
}
</style>
