<script setup lang="ts">
import { DzBadge, DzButton, DzDivider, DzHeading, DzQRCode, DzText } from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * QR handoff card — continue a session on another device.
 *
 * DzQRCode renders the value as a token-styled SVG (`role="img"`; the label
 * describes the code's *purpose*, never the raw payload). A centered brand mark
 * is supplied via the `#logo` slot, so `errorLevel="H"` is used for occlusion
 * tolerance. The `status` prop drives the loading/expired overlays, and the
 * expired overlay's refresh action surfaces via the `@refresh` event.
 *
 * Only free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */

const LINK = 'https://app.dzup-ui.dev/handoff'
const PAIR_CODE = 'DZ-4F9K-2QX'

/** Lifecycle of the code; flips to 'expired' to demo the refresh overlay. */
const status = ref<'active' | 'expired'>('active')

function expire(): void {
  status.value = 'expired'
}

function refresh(): void {
  status.value = 'active'
}
</script>

<template>
  <section class="qr" aria-labelledby="media-qr-title">
    <div class="qr-card">
      <header class="qr-head">
        <DzBadge variant="subtle" tone="primary" size="sm">Handoff</DzBadge>
        <DzHeading id="media-qr-title" :level="4" size="lg" weight="semibold" class="qr-title">
          Continue on your phone
        </DzHeading>
        <DzText size="sm" tone="muted" class="qr-lede">
          Scan to open this session on a mobile device. The code rotates for security.
        </DzText>
      </header>

      <div class="qr-code">
        <DzQRCode
          :value="LINK"
          :size="184"
          error-level="H"
          :status="status"
          aria-label="Open the dzup-ui session handoff on your phone"
          @refresh="refresh"
        >
          <template #logo>
            <span class="qr-logo" aria-hidden="true">D</span>
          </template>
        </DzQRCode>
      </div>

      <div class="qr-pair">
        <DzText size="xs" tone="muted" as="div" class="qr-pair-label">Or enter the pairing code</DzText>
        <code class="qr-pair-code">{{ PAIR_CODE }}</code>
      </div>

      <DzDivider class="qr-divider" />

      <div class="qr-actions">
        <DzButton variant="solid" tone="primary" size="md" class="qr-action">Copy link</DzButton>
        <DzButton variant="outline" tone="neutral" size="md" @click="expire">
          {{ status === 'active' ? 'Expire code' : 'Expired' }}
        </DzButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.qr {
  display: grid;
  place-items: center;
  padding: clamp(1.5rem, 5vw, 2.5rem);
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 7%, transparent), transparent 70%),
    var(--dz-background, #fff);
}

.qr-card {
  width: 100%;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--dz-space-4, 1rem);
  padding: clamp(1.25rem, 4vw, 1.75rem);
  border-radius: var(--dz-radius-xl, 0.875rem);
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 60%, transparent);
  background: var(--dz-surface, #fff);
  box-shadow:
    0 4px 6px -1px color-mix(in oklch, var(--dz-shadow, #000) 8%, transparent),
    0 2px 4px -2px color-mix(in oklch, var(--dz-shadow, #000) 6%, transparent);
}

.qr-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.qr-title {
  margin: 0;
}

.qr-lede {
  margin: 0;
  line-height: 1.55;
  max-width: 30ch;
}

/* Framed quiet zone around the code. */
.qr-code {
  padding: var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-lg, 0.75rem);
  background: var(--dz-background, #fff);
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 50%, transparent);
}

/* Brand mark dropped into the QR center via the #logo slot. */
.qr-logo {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--dz-radius-md, 0.5rem);
  font-weight: 800;
  font-size: var(--dz-text-lg, 1.125rem);
  color: var(--dz-primary-foreground, #fff);
  background: var(--dz-primary, #6366f1);
  box-shadow: 0 0 0 4px var(--dz-background, #fff);
}

.qr-pair {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.qr-pair-label {
  margin: 0;
}

.qr-pair-code {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  font-size: var(--dz-text-base, 1rem);
  font-weight: 600;
  letter-spacing: 0.12em;
  padding: 4px 12px;
  border-radius: var(--dz-radius-md, 0.5rem);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #0f172a);
}

.qr-divider {
  width: 100%;
}

.qr-actions {
  display: flex;
  gap: var(--dz-space-2, 0.5rem);
  width: 100%;
}

.qr-action {
  flex: 1;
}
</style>
