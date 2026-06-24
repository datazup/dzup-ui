<script setup lang="ts">
import { DzButton, DzText } from '@dzup-ui/core'
import { useReducedMotion, vMagnetic } from '../../motion/index.ts'

/**
 * Magnetic button demo (catalog `magnetic-button`, effect 22) — a CTA DzButton
 * that eases toward the cursor via the {@link vMagnetic} directive and springs
 * back on leave. rAF-throttled, transform-only; the offset is clamped to a few px
 * so the button stays under the pointer and its click target never breaks. Touch
 * and keyboard-only users get a static button, as does reduced motion (OS or page
 * toggle, passed via `disabled`).
 */
const reduced = useReducedMotion()
</script>

<template>
  <div class="stage">
    <DzButton
      v-magnetic="{ strength: 0.45, radius: 16, disabled: reduced }"
      variant="solid"
      tone="primary"
      size="lg"
    >
      Pull me closer
    </DzButton>
    <DzText size="xs" tone="muted" as="div" class="hint">
      Move your cursor over the button.
    </DzText>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
}

.hint {
  text-align: center;
}
</style>
