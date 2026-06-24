<script setup lang="ts">
import { DzBadge, DzButton, DzCard, DzText } from '@dzup-ui/core'
import { Check, Code2, Copy, RotateCcw } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useInView } from '../motion/index.ts'
import type { CatalogEntry, CatalogType } from './catalog.ts'

/**
 * AnimationCard — the gallery's atomic unit (docs/animations.md §4.4).
 *
 * Renders one {@link CatalogEntry}: a live, replayable preview stage; the
 * title + a "type" chip; the blurb; "Built with" component chips; and a
 * "View code" toggle revealing the copy-pasteable snippet (Copy→Check pattern
 * mirrored from ThemingDemo). The card is effect-agnostic — it knows nothing
 * about any specific effect, so adding a catalog entry needs no change here.
 */
const props = defineProps<{ entry: CatalogEntry }>()

// Replay re-mounts the demo by bumping its :key, re-triggering the effect
// without the reviewer having to scroll away and back (§4.4).
const replayKey = ref(0)
function replay(): void {
  replayKey.value += 1
}

// Cap concurrent looping animations: pause this demo's motion while its preview
// stage is scrolled out of view (docs/animations.md §7). `once: false` so it
// re-pauses on scroll-away; the rootMargin buffer resumes loops just before the
// card enters, so there is no visible "frozen then starts" frame.
const stageEl = ref<HTMLElement | null>(null)
const inView = useInView(stageEl, { once: false, rootMargin: '160px 0px 160px 0px', threshold: 0 })

const showCode = ref(false)
const copied = ref(false)

async function copyCode(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.entry.code)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 1800)
  }
  catch {
    /* clipboard unavailable */
  }
}

/** Tone per effect type so the "type" chip reads at a glance. */
const TYPE_TONE: Record<CatalogType, 'primary' | 'info' | 'success' | 'warning'> = {
  directive: 'primary',
  composable: 'info',
  component: 'success',
  css: 'warning',
}
const typeTone = computed(() => TYPE_TONE[props.entry.type])
</script>

<template>
  <DzCard variant="outlined" padding="none" class="anim-card">
    <!-- Live, replayable preview stage -->
    <div class="stage-wrap">
      <div ref="stageEl" class="stage" :class="{ 'dz-stage-idle': !inView }">
        <component :is="entry.demo" :key="replayKey" />
      </div>
      <DzButton
        size="sm"
        variant="ghost"
        tone="neutral"
        class="replay-btn"
        :aria-label="`Replay ${entry.title} animation`"
        @click="replay"
      >
        <template #prefix>
          <RotateCcw :size="14" aria-hidden="true" />
        </template>
        Replay
      </DzButton>
    </div>

    <!-- Meta -->
    <div class="body">
      <div class="title-row">
        <DzText weight="semibold" as="div" class="card-title">{{ entry.title }}</DzText>
        <DzBadge variant="subtle" :tone="typeTone" size="sm">{{ entry.type }}</DzBadge>
      </div>

      <DzText size="sm" tone="muted" as="p" class="blurb">{{ entry.blurb }}</DzText>

      <div v-if="entry.components.length" class="built-with">
        <DzText size="xs" tone="muted" as="span" class="built-label">Built with</DzText>
        <DzBadge
          v-for="name in entry.components"
          :key="name"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          {{ name }}
        </DzBadge>
      </div>

      <div class="actions">
        <DzButton
          size="sm"
          variant="text"
          tone="neutral"
          :aria-expanded="showCode"
          @click="showCode = !showCode"
        >
          <template #prefix>
            <Code2 :size="15" aria-hidden="true" />
          </template>
          {{ showCode ? 'Hide code' : 'View code' }}
        </DzButton>

        <DzButton
          v-if="showCode"
          size="sm"
          variant="ghost"
          tone="primary"
          @click="copyCode"
        >
          <template #prefix>
            <Check v-if="copied" :size="15" aria-hidden="true" />
            <Copy v-else :size="15" aria-hidden="true" />
          </template>
          {{ copied ? 'Copied!' : 'Copy' }}
        </DzButton>
      </div>

      <pre v-if="showCode" class="code"><code>{{ entry.code }}</code></pre>
    </div>
  </DzCard>
</template>

<style scoped>
.anim-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Preview stage — tinted backdrop so previews read in light + dark. */
.stage-wrap {
  position: relative;
}

.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: clamp(20px, 4vw, 36px);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 7%, transparent), transparent 60%),
    var(--dz-muted, #f8fafc);
  border-bottom: 1px solid var(--lp-hairline);
}

.replay-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.card-title {
  font-size: var(--dz-text-base, 1rem);
}

.blurb {
  margin: 0;
  line-height: 1.6;
}

.built-with {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.built-label {
  margin-right: 2px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.code {
  margin: 0;
  padding: 16px;
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-colors-primary-900, #1e1b3a);
  color: oklch(0.92 0.03 260);
  font-family: var(--dz-font-mono, monospace);
  font-size: var(--dz-text-xs, 0.75rem);
  line-height: 1.65;
  overflow-x: auto;
  white-space: pre;
}
</style>
