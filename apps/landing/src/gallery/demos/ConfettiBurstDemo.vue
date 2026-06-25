<script setup lang="ts">
import { DzButton, DzText } from '@dzup-ui/core'
import { PartyPopper, Rocket } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { DzConfetti, useReducedMotion } from '../../motion/index.ts'

/**
 * Confetti burst demo (catalog `confetti-burst`, effect 34) — a "ship it" CTA that
 * fires a {@link DzConfetti} pop on click. The confetti overlay fills the
 * positioned stage; clicking calls its exposed `burst()` and ticks a counter.
 *
 * Auto-fires once on mount so Replay (remount) re-runs it. Under reduced motion
 * `burst()` is a no-op — the counter + label change still confirm the action.
 */
const confetti = ref<InstanceType<typeof DzConfetti> | null>(null)
const reduced = useReducedMotion()
const ships = ref(0)

let timer: ReturnType<typeof setTimeout> | null = null

function ship(): void {
  ships.value += 1
  confetti.value?.burst()
}

onMounted(() => {
  timer = setTimeout(ship, 520)
})
onBeforeUnmount(() => {
  if (timer !== null) clearTimeout(timer)
})
</script>

<template>
  <div class="stage">
    <DzConfetti ref="confetti" />

    <div class="content">
      <span class="badge" aria-hidden="true">
        <PartyPopper :size="22" />
      </span>
      <DzText weight="semibold" as="p" class="title">Release shipped</DzText>
      <DzText size="sm" tone="muted" as="p">
        {{ ships }} deploy{{ ships === 1 ? '' : 's' }} celebrated{{ reduced ? ' · motion reduced' : '' }}
      </DzText>

      <DzButton variant="solid" tone="primary" @click="ship">
        <template #prefix>
          <Rocket :size="16" aria-hidden="true" />
        </template>
        Ship it
      </DzButton>
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
  min-height: 180px;
  overflow: visible;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.badge {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 2px;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-primary, #6366f1);
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 12%, transparent);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #6366f1) 24%, transparent);
}

.title {
  margin: 0;
  font-size: var(--dz-text-lg, 1.125rem);
}

.content :deep(p) {
  margin: 0;
}
</style>
