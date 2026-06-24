<script setup lang="ts">
import { DzCard, DzHeading, DzText } from '@dzup-ui/core'
import { computed } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Gradient border glow demo (catalog `gradient-border-glow`, effect 18) — the
 * `.dz-anim-border-glow` CSS utility wraps a flat DzCard in a rotating
 * conic-gradient ring (masked to a hairline band; only the gradient angle
 * repaints, the box never transforms). The `--reduced` modifier (bound from
 * {@link useReducedMotion}) freezes the ring to a static brand border for the
 * page-level toggle; the OS setting is handled centrally in `tokens.css`.
 */
const reduced = useReducedMotion()

const frameClass = computed(() => ({
  'dz-anim-border-glow': true,
  'dz-anim-border-glow--reduced': reduced.value,
}))
</script>

<template>
  <div class="stage">
    <div :class="frameClass" class="frame">
      <DzCard variant="flat" padding="lg" class="inner">
        <DzHeading :level="3" size="md" weight="semibold">Featured</DzHeading>
        <DzText size="sm" tone="muted" as="p" class="copy">
          A conic ring glows around the card to draw the eye.
        </DzText>
      </DzCard>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.frame {
  width: min(280px, 100%);
}

/* Match the inner card radius to the ring so the band hugs the corners. */
.inner {
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #fff);
}

.copy {
  margin: 6px 0 0;
  line-height: 1.6;
}
</style>
