<script setup lang="ts">
import { DzBadge, DzButton, DzText } from '@dzup-ui/core'
import { Check, Code2, Copy, RotateCcw } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useInView } from '../motion/index.ts'
import { categoryAccentStyle } from './catalog.ts'
import type { CatalogEntry, CatalogType } from './catalog.ts'

/**
 * AnimationCard — the gallery's atomic unit (docs/animations.md §4.4).
 *
 * Renders one {@link CatalogEntry} as a preview-forward glass tile: a large,
 * live, replayable stage where the motion is the hero, with the metadata
 * (title, "type" chip, blurb) sitting quietly beneath it and the heavier
 * details — "Built with" chips and the copy-pasteable snippet — tucked behind a
 * "View code" disclosure so they never compete with the preview. The card is
 * effect-agnostic: adding a catalog entry needs no change here.
 *
 * `size` lets the bento layout give inherently wide/ambient effects (backgrounds,
 * marquees, route transitions) a roomier stage without the card knowing which
 * effect it is.
 */
const props = withDefaults(
  defineProps<{ entry: CatalogEntry, size?: 'normal' | 'wide' }>(),
  { size: 'normal' },
)

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

// Each card inherits its category's accent (decorative spectrum) as local
// --accent* custom properties; the stage tint, hover glow and hover border below
// read from them so the gallery shows a full colour range, not one brand hue.
const accentStyle = computed(() => categoryAccentStyle(props.entry.category))
</script>

<template>
  <article class="anim-card" :class="`is-${size}`" :style="accentStyle">
    <!-- Live, replayable preview stage — the hero of the tile. -->
    <div class="stage-wrap">
      <div ref="stageEl" class="stage" :class="{ 'dz-stage-idle': !inView }">
        <component :is="entry.demo" :key="replayKey" />
      </div>

      <!-- Decorative dreamy glow that warms the stage on hover. -->
      <div class="stage-glow" aria-hidden="true" />

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

    <!-- Quiet metadata beneath the stage. -->
    <div class="body">
      <div class="title-row">
        <DzText weight="semibold" as="div" class="card-title">{{ entry.title }}</DzText>
        <DzBadge variant="subtle" :tone="typeTone" size="sm">{{ entry.type }}</DzBadge>
      </div>

      <DzText size="sm" tone="muted" as="p" class="blurb">{{ entry.blurb }}</DzText>

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

      <!-- Disclosure: built-with chips + the copy-pasteable snippet. -->
      <div v-if="showCode" class="disclosure">
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
        <pre class="code"><code>{{ entry.code }}</code></pre>
      </div>
    </div>
  </article>
</template>

<style scoped>
.anim-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  /* Translucent glass so the page's drifting aurora glows faintly through. */
  background: color-mix(in oklch, var(--dz-surface, #fff) 80%, transparent);
  backdrop-filter: blur(10px) saturate(1.1);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  overflow: hidden;
  transition:
    transform var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    box-shadow var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    border-color var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out);
}

.anim-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--lp-shadow-lg), var(--lp-highlight);
  border-color: color-mix(in oklch, var(--accent, var(--dz-primary, #6366f1)) 40%, var(--lp-hairline));
}

/* Preview stage — tinted, layered backdrop so previews read in light + dark. */
.stage-wrap {
  position: relative;
}

.stage {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 208px;
  padding: clamp(20px, 4vw, 40px);
  background:
    radial-gradient(circle at 85% 0%, color-mix(in oklch, var(--accent-2, var(--lp-brand-2, #a855f7)) 16%, transparent), transparent 55%),
    radial-gradient(circle at 0% 100%, color-mix(in oklch, var(--accent, var(--lp-brand, #6366f1)) 16%, transparent), transparent 55%),
    color-mix(in oklch, var(--dz-muted, #f8fafc) 88%, transparent);
  border-bottom: 1px solid var(--lp-hairline);
  overflow: hidden;
}

.is-wide .stage {
  min-height: 252px;
}

/* Soft brand glow that blooms in on hover — pure decoration. */
.stage-glow {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
    120% 90% at 50% 120%,
    color-mix(in oklch, var(--accent, var(--dz-primary, #6366f1)) 24%, transparent),
    transparent 70%
  );
  transition: opacity var(--dz-duration-slow, 320ms) var(--dz-ease-out, ease-out);
}

.anim-card:hover .stage-glow {
  opacity: 1;
}

.replay-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  opacity: 0;
  transform: translateY(-4px);
  background: color-mix(in oklch, var(--dz-surface, #fff) 72%, transparent);
  backdrop-filter: blur(6px);
  transition:
    opacity var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

/* Keep the control reachable: show it on hover and whenever it has focus. */
.anim-card:hover .replay-btn,
.replay-btn:focus-visible {
  opacity: 1;
  transform: none;
}

.body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px 20px;
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

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.disclosure {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

/* Honour reduced motion: drop the hover lift/glow to a quiet state change. */
@media (prefers-reduced-motion: reduce) {
  .anim-card,
  .stage-glow,
  .replay-btn {
    transition-duration: 0.01ms;
  }

  .anim-card:hover {
    transform: none;
  }
}
</style>
