<script setup lang="ts">
import { DzBadge } from '@dzup-ui/core'
import { DzMarquee } from '../../motion/index.ts'

/**
 * Marquee strip demo (catalog `marquee-strip`, effect 25) — a row of badge
 * "logos" scrolls infinitely via {@link DzMarquee}, which duplicates the run and
 * translates the track -50% for a seamless loop. Hover (or focus) pauses it.
 *
 * Under reduced motion (OS or the page toggle) DzMarquee renders a single,
 * static wrapped row instead — no loop, no duplicated copy.
 */
const logos = [
  'Acme', 'Globex', 'Initech', 'Umbrella', 'Soylent', 'Hooli', 'Vandelay', 'Stark',
] as const
</script>

<template>
  <DzMarquee class="strip" aria-label="Trusted by teams">
    <DzBadge
      v-for="logo in logos"
      :key="logo"
      variant="outline"
      tone="neutral"
      size="md"
      class="logo"
    >
      {{ logo }}
    </DzBadge>
  </DzMarquee>
</template>

<style scoped>
.strip {
  width: 100%;
}

.logo {
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
