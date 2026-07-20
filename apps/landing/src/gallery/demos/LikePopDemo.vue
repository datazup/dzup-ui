<script setup lang="ts">
import { DzText, DzToggleButton } from '@dzup-ui/core'
import { Heart } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { DzBurst } from '../../motion/index.ts'

/**
 * Like pop demo (catalog `like-pop`, effect 36) — a like toggle wrapped in
 * {@link DzBurst}. Pressing it fills the heart and fires a pop + radial spark
 * burst on the rising edge; un-pressing quietly removes the like.
 *
 * Auto-likes once on mount so Replay (remount) re-demos the burst. Under reduced
 * motion the pop/sparks are skipped — the pressed/colour state carries the change.
 */
const liked = ref(false)
const base = 248
const count = computed(() => base + (liked.value ? 1 : 0))

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  timer = setTimeout(() => {
    liked.value = true
  }, 560)
})
onBeforeUnmount(() => {
  if (timer !== null)
    clearTimeout(timer)
})
</script>

<template>
  <div class="stage">
    <DzText size="sm" tone="muted" as="p" class="prompt">
      Was this effect helpful?
    </DzText>

    <DzBurst :active="liked">
      <DzToggleButton
        v-model="liked"
        variant="outline"
        :tone="liked ? 'danger' : 'neutral'"
        size="lg"
        :aria-label="liked ? 'Remove like' : 'Like this effect'"
        class="like"
      >
        <template #prefix>
          <Heart
            :size="18"
            :fill="liked ? 'currentColor' : 'none'"
            aria-hidden="true"
          />
        </template>
        <span class="count" aria-live="polite">{{ count.toLocaleString() }}</span>
      </DzToggleButton>
    </DzBurst>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  min-height: 168px;
}

.prompt {
  margin: 0;
}

.count {
  font-variant-numeric: tabular-nums;
}
</style>
