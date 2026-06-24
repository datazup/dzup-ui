<script setup lang="ts">
import { DzNotification } from '@dzup-ui/core'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Pulse / ping demo (catalog `pulse-ping`, effect 27) — a DzNotification with a
 * status dot that radiates an expanding ring on a loop via the `.dz-ping` CSS
 * utility (transform/opacity only). The ring inherits `currentColor`, so the
 * wrapper's colour drives the tone.
 *
 * Under reduced motion (OS or the page toggle) the ring is removed and a calm,
 * static dot remains — bound here for the live page toggle; the OS setting is
 * handled centrally in `tokens.css`.
 */
const reduced = useReducedMotion()
</script>

<template>
  <div class="stage">
    <DzNotification
      title="Deployment live"
      description="api-gateway · v2.4.0 is now serving traffic."
      tone="info"
      class="note"
    >
      <template #icon>
        <span
          class="dz-ping ping"
          :class="{ 'dz-ping--reduced': reduced }"
          aria-hidden="true"
        >
          <span class="dz-ping__ring" />
          <span class="dz-ping__dot dot" />
        </span>
      </template>
    </DzNotification>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.note {
  width: min(320px, 100%);
}

/* The ping wrapper sizes the dot; its colour feeds the ring (currentColor). */
.ping {
  width: 10px;
  height: 10px;
  margin-top: 4px;
  border-radius: 9999px;
  color: var(--dz-info, #0ea5e9);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: currentColor;
}
</style>
