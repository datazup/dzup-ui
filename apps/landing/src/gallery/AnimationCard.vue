<script setup lang="ts">
import type { CatalogEntry, CatalogType } from './catalog.ts'
import { DzBadge, DzButton, DzText } from '@dzup-ui/core'
import { Check, Code2, Copy, Link2, RotateCcw, Zap } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useInView, useReducedMotion, vTilt } from '../motion/index.ts'
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
    /**
     * TASK-AV2-03: `true` when the entry's demo is itself pointer-driven
     * (spotlight, tilt, lens, drag…) — the page decides from its
     * POINTER_DRIVEN set. Such cards must NOT tilt (a tilting stage under a
     * pointer-tracked performance sabotages the demo); they get the static
     * "stage light" hover instead. The card stays effect-agnostic: it learns
     * this from the prop, never by inspecting the entry id.
     */
    interactiveStage?: boolean
  }>(),
  { size: 'normal', highlighted: false, interactiveStage: false },
)

// Both motion gates (OS preference + the page toolbar switch) — the page
// provides the override; this resolves the combined preference.
const reduced = useReducedMotion()

// 3D tilt for cards whose performance doesn't own the pointer (TASK-AV2-03).
// Modest angles + glare, mirroring BlockCard; the directive additionally
// self-gates to fine pointers and the OS reduced-motion setting.
const tiltOptions = computed(() => ({
  max: 3.5,
  scale: 1.01,
  glare: true,
  disabled: reduced.value || props.interactiveStage,
}))

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
    :class="[`is-${size}`, {
      'is-highlighted': highlighted,
      'is-tiltable': !interactiveStage,
      'is-stage-live': interactiveStage,
      'is-open': showCode,
    }]"
    :style="accentStyle"
  >
    <!-- The visual shell (TASK-AV2-03). The tilt transform is written here, on
         an inner wrapper, because the article root carries content-visibility
         (a paint-containment grouping property that would flatten preserve-3d)
         — the article stays the perf/layout shell, this div is the 3D card. -->
    <div v-tilt="tiltOptions" class="card-shell">
      <!-- Permalink spotlight lap (TASK-AV2-03): one accent beam ride around the
           border while the highlight pulse runs. Motion-gated in JS so the layer
           simply never exists under either reduce gate. -->
      <span v-if="highlighted && !reduced" class="av2-spotlight-lap dz-border-beam" aria-hidden="true" />

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
            <!-- Keyed on replayKey so each activation remounts the span and
               restarts the one-shot spin (TASK-AV2-03); never keyed on the
               demo itself. -->
            <span
              :key="replayKey"
              class="replay-spin"
              :class="{ 'is-spinning': replayKey > 0 && !reduced }"
            >
              <RotateCcw :size="14" aria-hidden="true" />
            </span>
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
              <span v-if="linkCopied" class="copy-pop" :class="{ 'is-still': reduced }">
                <Check :size="14" aria-hidden="true" />
              </span>
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
              <span v-if="copied" class="copy-pop" :class="{ 'is-still': reduced }">
                <Check :size="15" aria-hidden="true" />
              </span>
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
    </div>
  </article>
</template>

<style scoped>
.anim-card {
  position: relative;
  height: 100%;
  /* Skip rendering work for off-screen cards so the larger (~57-card) gallery
     stays cheap to scroll (docs/animations.md §3.5). `auto` makes the browser
     remember each card's real size after first render, so the intrinsic-size
     estimate only seeds never-yet-seen cards and the scrollbar never jumps.
     content-visibility un-skips on a wider margin than the demo loop's IO, so
     the off-screen loop cap is unaffected. NOTE (TASK-AV2-03): the paint
     containment this implies is a grouping property that flattens preserve-3d,
     which is exactly why the tilt + planes live on `.card-shell` below, never
     on this element. */
  content-visibility: auto;
  contain-intrinsic-size: auto 460px;
}

/* The 3D visual shell (TASK-AV2-03): border, glass, shadow and the tilt all
   live here. No `overflow: hidden` — that would flatten the translateZ planes;
   the stage rounds/clips itself instead, and every other layer inherits or
   sets its own radius. */
.card-shell {
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
  transition:
    transform var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    box-shadow var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    border-color var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out);
}

/* Chrome planes: only tiltable cards get real depth — the tilt rotation is
   written on the shell, so children with translateZ read as separate planes.
   Invisible at rest (no rotation → no perspective), so touch and reduced
   motion keep today's flat card. Clamped while the code disclosure is open so
   the snippet stays perfectly legible. */
.is-tiltable .card-shell {
  transform-style: preserve-3d;
}

.is-tiltable:not(.is-open) .stage-wrap {
  transform: translateZ(18px);
}

.is-tiltable:not(.is-open) .title-row {
  transform: translateZ(12px);
}

.is-tiltable:not(.is-open) .actions {
  transform: translateZ(8px);
}

/* Permalink spotlight lap (TASK-AV2-03): the `.dz-border-beam` conic arc rides
   this overlay's border band once per highlight window. */
.av2-spotlight-lap {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  border-radius: var(--dz-radius-xl, 0.875rem);
  --dz-anim-beam-width: 2.5px;
  --dz-anim-beam-duration: 2.2s;
}

/* Permalink target pulse — when the page deep-links to this card, ring + lift it
   briefly so the reader can spot it. Token-only; calmed under reduced motion. */
.anim-card.is-highlighted .card-shell {
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

.anim-card:hover .card-shell {
  transform: translateY(-4px);
  box-shadow: var(--lp-shadow-lg), var(--lp-highlight);
  border-color: color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 40%, var(--lp-hairline));
}

/* Stage-light hover (TASK-AV2-03): pointer-driven demos never tilt — instead
   the whole display case lights up harder in its own accent, so both card
   classes respond to the hand while staying indistinguishable at rest. */
.anim-card.is-stage-live:hover .card-shell {
  border-color: color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 55%, var(--lp-hairline));
  box-shadow:
    0 18px 42px -18px color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 55%, transparent),
    var(--lp-shadow-lg),
    var(--lp-highlight);
}

.anim-card.is-stage-live:hover .stage-glow {
  background: radial-gradient(
    120% 90% at 50% 120%,
    color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 34%, transparent),
    transparent 72%
  );
}

/* Preview stage — tinted, layered backdrop so previews read in light + dark.
   The wrap owns the card's top rounding + clipping now that the shell no
   longer hides overflow (TASK-AV2-03). */
.stage-wrap {
  position: relative;
  border-start-start-radius: calc(var(--dz-radius-xl, 0.875rem) - 1px);
  border-start-end-radius: calc(var(--dz-radius-xl, 0.875rem) - 1px);
  overflow: hidden;
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
  inset-inline-end: 10px;
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
  margin-inline-end: 2px;
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

/* One-shot micro-feedback (TASK-AV2-03). */
.replay-spin {
  display: inline-flex;
}

.replay-spin.is-spinning {
  animation: av2-replay-spin 480ms var(--dz-ease-out, ease-out) 1;
}

@keyframes av2-replay-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.copy-pop {
  display: inline-flex;
}

.copy-pop:not(.is-still) {
  animation: av2-copy-pop 260ms var(--dz-ease-out, ease-out) 1;
}

@keyframes av2-copy-pop {
  0% {
    transform: scale(0.5);
  }
  60% {
    transform: scale(1.18);
  }
  100% {
    transform: scale(1);
  }
}

/* Press feedback on the quiet icon buttons. */
.link-btn:active {
  transform: scale(0.88);
}

/* Honour reduced motion: drop the hover lift/glow to a quiet state change. */
@media (prefers-reduced-motion: reduce) {
  .card-shell,
  .stage-glow,
  .replay-btn {
    transition-duration: 0.01ms;
  }

  .anim-card:hover .card-shell {
    transform: none;
  }

  .is-tiltable:not(.is-open) .stage-wrap,
  .is-tiltable:not(.is-open) .title-row,
  .is-tiltable:not(.is-open) .actions {
    transform: none;
  }

  .replay-spin.is-spinning,
  .copy-pop:not(.is-still) {
    animation: none;
  }

  /* Keep the static ring (the permalink still reads as "this one"); drop the pulse. */
  .anim-card.is-highlighted .card-shell {
    animation: none;
  }
}
</style>
