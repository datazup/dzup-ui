<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { DzCountUp } from '../../motion/index.ts'

/**
 * Count-up demo (catalog `count-up`, effect 12) — three KPI figures that tween
 * from 0 to their target the moment the stage scrolls into view, via
 * {@link DzCountUp} (which wraps core's DzAnimatedNumber).
 *
 * Shows the formatting surface: thousands separators (48,200), a "k" suffix and
 * a "+" suffix. Under reduced motion (OS or the page-level toggle) every figure
 * shows its final value instantly, and Replay re-mounts the demo to re-trigger.
 */
const stats = [
  { value: 48200, suffix: '', label: 'Active projects' },
  { value: 12, suffix: 'k', label: 'GitHub stars' },
  { value: 99, suffix: '+', label: 'Components' },
]
</script>

<template>
  <div class="stage">
    <div v-for="s in stats" :key="s.label" class="stat">
      <span class="figure">
        <DzCountUp
          :value="s.value"
          :suffix="s.suffix"
          :duration="1600"
          tone="primary"
          :aria-label="s.label"
        />
      </span>
      <DzText size="xs" tone="muted" as="div">
        {{ s.label }}
      </DzText>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  gap: clamp(20px, 5vw, 44px);
  width: 100%;
  text-align: center;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.figure {
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  font-weight: 750;
  letter-spacing: -0.03em;
  line-height: 1;
}

.figure :deep(*) {
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
}
</style>
