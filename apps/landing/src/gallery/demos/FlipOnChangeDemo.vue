<script setup lang="ts">
import { DzBadge, DzButton, DzText } from '@dzup-ui/core'
import { RefreshCw } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { DzFlip } from '../../motion/index.ts'

/**
 * Flip on change demo (catalog `flip-on-change`, effect 26) — a build-status
 * DzBadge whose value flips with a half-turn whenever the data updates, via
 * {@link DzFlip}. It auto-advances through the pipeline states and can also be
 * advanced manually with the button.
 *
 * Under reduced motion (OS or the page toggle) the value swaps instantly with no
 * turn. The timer is cleared on unmount, so Replay (remount) restarts cleanly.
 */
const states = [
  { label: 'Queued', tone: 'neutral' },
  { label: 'Running', tone: 'info' },
  { label: 'Passed', tone: 'success' },
  { label: 'Failed', tone: 'danger' },
] as const

const index = ref(0)
const current = computed(() => states[index.value] ?? states[0])

function advance(): void {
  index.value = (index.value + 1) % states.length
}

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(advance, 2200)
})
onBeforeUnmount(() => {
  if (timer !== null)
    clearInterval(timer)
})
</script>

<template>
  <div class="stage">
    <div class="status">
      <DzText size="sm" tone="muted" as="span">
        Build status
      </DzText>
      <DzFlip :value="current.label">
        <DzBadge variant="solid" :tone="current.tone" size="md">
          {{ current.label }}
        </DzBadge>
      </DzFlip>
    </div>

    <DzButton size="sm" variant="outline" tone="neutral" @click="advance">
      <template #prefix>
        <RefreshCw :size="14" aria-hidden="true" />
      </template>
      Update
    </DzButton>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.status {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
