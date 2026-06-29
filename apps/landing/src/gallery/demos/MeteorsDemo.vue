<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'
import { computed } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Meteors demo (catalog `meteors`, effect 42) — the `.dz-meteors` utility spawns
 * a capped set of diagonal shooting-star streaks behind a hero-style headline.
 * Each streak gets a randomised start point, delay and duration (the per-streak
 * custom-prop pattern) so they never fire in lockstep. Re-mounting on Replay
 * reseeds them. Under reduced motion (OS or page toggle) the streaks are removed
 * and the night surface reads on its own.
 */
const reduced = useReducedMotion()

// Cap concurrent streaks in the markup (the utility loops one per child).
const STREAK_COUNT = 14
const streaks = Array.from({ length: STREAK_COUNT }, (_, i) => ({
  id: i,
  style: {
    '--dz-meteor-left': `${Math.round(6 + (i / STREAK_COUNT) * 90)}%`,
    '--dz-meteor-top': `${Math.round(-12 + Math.random() * 26)}%`,
    '--dz-meteor-delay': `${(Math.random() * 5).toFixed(2)}s`,
    '--dz-meteor-duration': `${(4.4 + Math.random() * 2.6).toFixed(2)}s`,
  } as Record<string, string>,
}))

const field = computed(() => ({
  'dz-meteors': true,
  'dz-meteors--reduced': reduced.value,
}))
</script>

<template>
  <div class="stage">
    <div :class="field" aria-hidden="true">
      <span v-for="s in streaks" :key="s.id" class="dz-meteors__streak" :style="s.style" />
    </div>
    <div class="content">
      <DzHeading :level="3" size="lg" weight="bold" class="lp-balance">Meteor shower</DzHeading>
      <DzText size="xs" tone="muted" as="div">Diagonal streaks cross on offset loops.</DzText>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 168px;
  overflow: hidden;
  border-radius: var(--dz-radius-lg, 0.625rem);
  /* A deep night surface (same in light + dark) so the streaks read. */
  background:
    radial-gradient(circle at 50% 130%, color-mix(in oklch, var(--dz-colors-primary-500, #6366f1) 30%, transparent), transparent 62%),
    var(--dz-colors-primary-950, #1e1b3a);
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 16px;
  /* Force light copy over the night surface (DzText reads these tokens). */
  --dz-foreground: var(--dz-colors-base-white, #fff);
  --dz-muted-foreground: color-mix(in oklch, var(--dz-colors-base-white, #fff) 72%, transparent);
}
</style>
