<script setup lang="ts">
import { DzButton, DzText } from '@dzup-ui/core'
import { CreditCard } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { DzSuccessCheck } from '../../motion/index.ts'

/**
 * Success check demo (catalog `success-check`, effect 33) — a mock checkout whose
 * confirm button resolves into a drawn-in {@link DzSuccessCheck}. Submitting runs
 * a brief loading window, then the ring + tick draw with a small pop.
 *
 * Auto-plays once on mount so Replay (remount) re-runs the whole flow; the button
 * also replays it. Under reduced motion the mark appears fully drawn instantly.
 */
type Phase = 'idle' | 'submitting' | 'done'
const phase = ref<Phase>('idle')

let timer: ReturnType<typeof setTimeout> | null = null

function submit(): void {
  if (phase.value === 'submitting') return
  phase.value = 'submitting'
  timer = setTimeout(() => {
    phase.value = 'done'
  }, 850)
}

function reset(): void {
  phase.value = 'idle'
  if (timer !== null) clearTimeout(timer)
  // Defer so DzSuccessCheck unmounts before the next draw re-triggers cleanly.
  timer = setTimeout(submit, 360)
}

onMounted(() => {
  timer = setTimeout(submit, 500)
})
onBeforeUnmount(() => {
  if (timer !== null) clearTimeout(timer)
})
</script>

<template>
  <div class="stage">
    <Transition name="swap" mode="out-in">
      <!-- Resolved state: the drawn check + confirmation copy. -->
      <div v-if="phase === 'done'" key="done" class="result">
        <DzSuccessCheck :active="true" :size="68" tone="success" label="Payment confirmed" />
        <DzText weight="semibold" as="p" class="result-title">Payment confirmed</DzText>
        <DzText size="sm" tone="muted" as="p">$29.00 · Pro plan, billed monthly</DzText>
        <DzButton size="sm" variant="text" tone="neutral" @click="reset">Run again</DzButton>
      </div>

      <!-- Pre-submit: the confirm button. -->
      <div v-else key="form" class="form">
        <DzText size="sm" tone="muted" as="p" class="form-lede">Upgrade to Pro · $29/mo</DzText>
        <DzButton
          variant="solid"
          tone="primary"
          size="lg"
          :loading="phase === 'submitting'"
          @click="submit"
        >
          <template #prefix>
            <CreditCard :size="17" aria-hidden="true" />
          </template>
          {{ phase === 'submitting' ? 'Processing…' : 'Confirm payment' }}
        </DzButton>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 168px;
}

.form,
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.form-lede {
  margin: 0 0 2px;
}

.result-title {
  margin: 4px 0 0;
  font-size: var(--dz-text-lg, 1.125rem);
}

.result :deep(p) {
  margin: 0;
}

/* Cross-fade the two states; transform/opacity only. */
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    transform var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .swap-enter-active,
  .swap-leave-active {
    transition-duration: 0.01ms;
  }
  .swap-enter-from,
  .swap-leave-to {
    transform: none;
  }
}
</style>
