<script setup lang="ts">
import type { CatalogEntry, CatalogType } from './catalog.ts'
import { DzBadge, DzButton, DzText } from '@dzup-ui/core'
import { Check, Code2, Copy, Link2, RotateCcw, Zap } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useInView } from '../motion/index.ts'
import { categoryAccentStyle } from './catalog.ts'

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
 * When an entry carries a `variants` matrix (SFC / Composable / CSS) the snippet
 * area becomes a keyboard-accessible tab set (per-tab Copy); otherwise it shows
 * the single `code` block exactly as before. A `native` badge surfaces any
 * platform-API upgrade next to the type chip, and the card is deep-linkable by
 * `#effect-<id>` (Task N10).
 *
 * `size` lets the bento layout give inherently wide/ambient effects (backgrounds,
 * marquees, route transitions) a roomier stage without the card knowing which
 * effect it is. `highlighted` is driven by the page when a permalink resolves to
 * this card, briefly pulsing it so the reader can spot the deep-linked effect.
 */
const props = withDefaults(
  defineProps<{
    entry: CatalogEntry
    size?: 'normal' | 'wide'
    highlighted?: boolean
  }>(),
  { size: 'normal', highlighted: false },
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
// card enters, so there is no visible "frozen then starts" frame. (The card's
// content-visibility:auto un-skips on a wider margin than this, so the stage is
// laid out before inView flips — the loop cap and the perf skip stay in step.)
const stageEl = ref<HTMLElement | null>(null)
const inView = useInView(stageEl, { once: false, rootMargin: '160px 0px 160px 0px', threshold: 0 })

const showCode = ref(false)
const copied = ref(false)

// ── Variant matrix (SFC / Composable / CSS) ─────────────────────────────────
// Effect-agnostic: the card reads whichever subset of variants the entry offers
// and renders them as tabs; an entry with no `variants` keeps the single-snippet
// path untouched.
type VariantKey = 'sfc' | 'composable' | 'css'
const VARIANT_ORDER = ['sfc', 'composable', 'css'] as const
const VARIANT_LABELS: Record<VariantKey, string> = {
  sfc: 'SFC',
  composable: 'Composable',
  css: 'CSS',
}
const variantTabs = computed<VariantKey[]>(() => {
  const v = props.entry.variants
  return v ? VARIANT_ORDER.filter(k => v[k]) : []
})
const hasVariants = computed(() => variantTabs.value.length > 0)

// Active tab, defaulting to the first available and self-correcting if the entry
// (and thus its tab set) changes under the same card slot.
const activeTab = ref<VariantKey | null>(null)
const currentTab = computed<VariantKey | null>(() => {
  if (!hasVariants.value)
    return null
  const active = activeTab.value
  return active && variantTabs.value.includes(active) ? active : variantTabs.value[0]!
})

// What "Copy" copies and the disclosure renders: the active variant, else `code`.
const displayedCode = computed(() =>
  currentTab.value ? props.entry.variants![currentTab.value]! : props.entry.code,
)

const tablist = ref<HTMLElement | null>(null)

function selectTab(key: VariantKey): void {
  activeTab.value = key
  copied.value = false
}

// Own the APG tabs entry point ourselves: roving tabindex + arrow/Home/End move
// selection and focus together. (Reka's RovingFocusGroup would leave every tab
// at tabindex=-1 until first focus — see memory reka-roving-focus-tabstop.)
function onTabKeydown(event: KeyboardEvent, index: number): void {
  const tabs = variantTabs.value
  let next = index
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
    next = (index + 1) % tabs.length
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
    next = (index - 1 + tabs.length) % tabs.length
  else if (event.key === 'Home')
    next = 0
  else if (event.key === 'End')
    next = tabs.length - 1
  else return
  event.preventDefault()
  selectTab(tabs[next]!)
  tablist.value?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
}

async function copyCode(): Promise<void> {
  try {
    await navigator.clipboard.writeText(displayedCode.value)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 1800)
  }
  catch {
    /* clipboard unavailable */
  }
}

// ── Permalink ───────────────────────────────────────────────────────────────
// `effect-<id>` is the card's anchor; the page scrolls + highlights it when the
// hash matches (distinct from the category hashes, which carry no prefix).
const anchorId = computed(() => `effect-${props.entry.id}`)
const linkCopied = ref(false)

async function copyLink(): Promise<void> {
  if (typeof window === 'undefined')
    return
  const url = `${window.location.origin}${window.location.pathname}#${anchorId.value}`
  try {
    await navigator.clipboard.writeText(url)
    linkCopied.value = true
    window.setTimeout(() => (linkCopied.value = false), 1800)
  }
  catch {
    /* clipboard unavailable */
  }
}

// ── Native-API badge ────────────────────────────────────────────────────────
const nativeTooltip = computed(() => {
  const native = props.entry.native
  return native
    ? `Upgrades to the native ${native.api} API where supported — ${native.supports}.`
    : ''
})

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
  <article
    :id="anchorId"
    class="anim-card"
    :class="[`is-${size}`, { 'is-highlighted': highlighted }]"
    :style="accentStyle"
  >
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
        <DzText weight="semibold" as="div" class="card-title">
          {{ entry.title }}
        </DzText>

        <div class="title-meta">
          <!-- Native-API badge: names the platform API the effect upgrades to,
               with the fallback in its tooltip. Focusable so keyboard users can
               surface the note (and get the --dz-ring). -->
          <span
            v-if="entry.native"
            class="native-badge"
            tabindex="0"
            :title="nativeTooltip"
            :aria-label="nativeTooltip"
          >
            <Zap :size="11" aria-hidden="true" />
            {{ entry.native.api }}
          </span>

          <DzBadge variant="subtle" :tone="typeTone" size="sm">
            {{ entry.type }}
          </DzBadge>

          <button
            type="button"
            class="link-btn"
            :aria-label="linkCopied ? 'Link copied' : `Copy link to ${entry.title}`"
            @click="copyLink"
          >
            <Check v-if="linkCopied" :size="14" aria-hidden="true" />
            <Link2 v-else :size="14" aria-hidden="true" />
          </button>
        </div>
      </div>

      <DzText size="sm" tone="muted" as="p" class="blurb">
        {{ entry.blurb }}
      </DzText>

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
          <DzText size="xs" tone="muted" as="span" class="built-label">
            Built with
          </DzText>
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

        <!-- Variant matrix → tabs (SFC / Composable / CSS). Roving tabindex,
             arrow/Home/End move selection + focus. Absent ⇒ single code block. -->
        <div
          v-if="hasVariants"
          ref="tablist"
          class="code-tabs"
          role="tablist"
          :aria-label="`Code variants for ${entry.title}`"
        >
          <button
            v-for="(key, i) in variantTabs"
            :id="`${anchorId}-tab-${key}`"
            :key="key"
            type="button"
            role="tab"
            class="code-tab"
            :class="{ 'is-active': currentTab === key }"
            :aria-selected="currentTab === key"
            :tabindex="currentTab === key ? 0 : -1"
            @click="selectTab(key)"
            @keydown="onTabKeydown($event, i)"
          >
            {{ VARIANT_LABELS[key] }}
          </button>
        </div>

        <pre
          class="code"
          :role="hasVariants ? 'tabpanel' : undefined"
          :aria-labelledby="hasVariants && currentTab ? `${anchorId}-tab-${currentTab}` : undefined"
        ><code>{{ displayedCode }}</code></pre>
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
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 80%, transparent);
  backdrop-filter: blur(10px) saturate(1.1);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  overflow: hidden;
  /* Skip rendering work for off-screen cards so the larger (~57-card) gallery
     stays cheap to scroll (docs/animations.md §3.5). `auto` makes the browser
     remember each card's real size after first render, so the intrinsic-size
     estimate only seeds never-yet-seen cards and the scrollbar never jumps.
     content-visibility un-skips on a wider margin than the demo loop's IO, so
     the off-screen loop cap is unaffected. */
  content-visibility: auto;
  contain-intrinsic-size: auto 460px;
  transition:
    transform var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    box-shadow var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    border-color var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out);
}

/* Permalink target pulse — when the page deep-links to this card, ring + lift it
   briefly so the reader can spot it. Token-only; calmed under reduced motion. */
.anim-card.is-highlighted {
  border-color: color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 60%, var(--lp-hairline));
  box-shadow:
    var(--lp-shadow-lg),
    0 0 0 3px color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 40%, transparent);
  animation: card-highlight 1.6s var(--dz-ease-out, ease-out) 1;
}

@keyframes card-highlight {
  0% {
    box-shadow:
      var(--lp-shadow-sm),
      0 0 0 0 color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 65%, transparent);
  }
  30% {
    box-shadow:
      var(--lp-shadow-lg),
      0 0 0 5px color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 45%, transparent);
  }
}

.anim-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--lp-shadow-lg), var(--lp-highlight);
  border-color: color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 40%, var(--lp-hairline));
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
    color-mix(in oklch, var(--dz-muted, #d3d4d7) 88%, transparent);
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
    color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 24%, transparent),
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
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 72%, transparent);
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

.title-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Native-API badge — a quiet accent-tinted pill beside the type chip. */
.native-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--dz-radius-full, 9999px);
  border: 1px solid color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 40%, transparent);
  background: color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 12%, transparent);
  color: var(--accent-strong, var(--dz-primary, #0766ee));
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  white-space: nowrap;
  cursor: help;
}

.native-badge:focus-visible {
  outline: 2px solid var(--dz-ring, var(--accent, #6366f1));
  outline-offset: 2px;
}

/* Copy-permalink affordance — ghost until hover/focus on the card. */
.link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: var(--dz-radius-md, 6px);
  background: transparent;
  color: var(--dz-muted-foreground, #585b60);
  cursor: pointer;
  opacity: 0.55;
  transition:
    color var(--dz-duration-fast, 150ms),
    background var(--dz-duration-fast, 150ms),
    opacity var(--dz-duration-fast, 150ms);
}

.anim-card:hover .link-btn,
.link-btn:focus-visible {
  opacity: 1;
}

.link-btn:hover {
  color: var(--dz-foreground, #1b1d1f);
  background: color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 12%, transparent);
}

.link-btn:focus-visible {
  outline: 2px solid var(--dz-ring, var(--accent, #6366f1));
  outline-offset: 2px;
}

/* Variant matrix tab strip — segmented pills above the snippet. */
.code-tabs {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: var(--dz-radius-md, 6px);
  background: color-mix(in oklch, var(--dz-muted, #d3d4d7) 70%, transparent);
  border: 1px solid var(--lp-hairline);
  align-self: flex-start;
}

.code-tab {
  appearance: none;
  border: none;
  padding: 5px 12px;
  border-radius: var(--dz-radius-sm, 4px);
  background: transparent;
  color: var(--dz-muted-foreground, #585b60);
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  cursor: pointer;
  transition:
    color var(--dz-duration-fast, 150ms),
    background var(--dz-duration-fast, 150ms);
}

.code-tab:hover {
  color: var(--dz-foreground, #1b1d1f);
}

.code-tab.is-active {
  color: var(--dz-foreground, #1b1d1f);
  background: var(--dz-surface, #ffffff);
  box-shadow: var(--lp-shadow-sm);
}

.code-tab:focus-visible {
  outline: 2px solid var(--dz-ring, var(--accent, #6366f1));
  outline-offset: 2px;
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
  background: var(--dz-colors-primary-900, #001551);
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

  /* Keep the static ring (the permalink still reads as "this one"); drop the pulse. */
  .anim-card.is-highlighted {
    animation: none;
  }
}
</style>
