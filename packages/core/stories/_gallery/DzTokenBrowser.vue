<script setup lang="ts">
/**
 * DzTokenBrowser — an interactive, searchable, copy-to-clipboard browser for
 * every `--dz-*` design token, reading **live** values from the running theme.
 *
 * - Names are enumerated from the canonical `@dzup-ui/tokens` package (+ a live
 *   stylesheet scan for completeness) via `tokenManifest.ts`.
 * - Each token's resolved value is read with `getComputedStyle` off a hidden
 *   probe, so flipping the Storybook Theme toolbar (light ↔ dark) re-resolves
 *   every value in place — a `MutationObserver` on `data-theme` triggers it.
 * - Previews reference `var(--dz-name)` directly, so the swatch/bar/box is also
 *   live and theme-reactive with no JS.
 * - The chrome is built from @dzup-ui/core (DzInput, DzChip, DzCard,
 *   DzCopyButton), so it stays token-only and themable itself.
 */

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { DzCopyButton } from '../../src/components/buttons'
import { DzCard } from '../../src/components/cards'
import { DzChip } from '../../src/components/data'
import { DzInput } from '../../src/components/inputs'
import {
  buildTokenManifest,
  type TokenCategory,
  type TokenEntry,
  type TokenTier,
} from './tokenManifest.ts'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const query = ref('')
const activeTier = ref<TokenTier | 'all'>('all')
const activeCategory = ref<TokenCategory | 'all'>('all')

const tokens = ref<TokenEntry[]>([])
/** Live resolved + declared values per token name, recomputed on theme change. */
const values = ref<Record<string, { resolved: string, declared: string }>>({})

const TIER_LABELS: Record<TokenTier, string> = {
  primitive: 'Primitive',
  semantic: 'Semantic',
  component: 'Component',
}

const CATEGORY_ORDER: TokenCategory[] = [
  'color',
  'spacing',
  'radius',
  'shadow',
  'typography',
  'motion',
  'zindex',
  'other',
]

const CATEGORY_LABELS: Record<TokenCategory, string> = {
  color: 'Color',
  spacing: 'Spacing',
  radius: 'Radius',
  shadow: 'Shadow',
  typography: 'Typography',
  motion: 'Motion',
  zindex: 'Z-index',
  other: 'Other',
}

// ---------------------------------------------------------------------------
// Live value resolution (theme-aware) via a hidden probe element
// ---------------------------------------------------------------------------

let probe: HTMLElement | null = null

function getProbe(): HTMLElement {
  if (!probe) {
    probe = document.createElement('div')
    probe.setAttribute('aria-hidden', 'true')
    document.body.appendChild(probe)
  }
  return probe
}

/** Read the token's *declared* value (the var() chain / authored value). */
function declaredValue(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/**
 * Fully resolve a token to a concrete value by assigning `var(--dz-name)` to a
 * real CSS property whose type matches the token, then reading the computed
 * value back. Custom properties themselves don't substitute var() in
 * `getPropertyValue`, so this probe is what yields the real px/color/etc.
 */
function resolvedValue(name: string, category: TokenCategory): string {
  const el = getProbe()
  el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;pointer-events:none;'
  const v = `var(${name})`
  const cs = (): CSSStyleDeclaration => getComputedStyle(el)
  try {
    switch (category) {
      case 'color':
        el.style.color = v
        return cs().color
      case 'shadow':
        el.style.boxShadow = v
        return cs().boxShadow
      case 'radius':
      case 'spacing':
        el.style.width = v
        return cs().width
      case 'zindex':
        el.style.position = 'absolute'
        el.style.zIndex = v
        return cs().zIndex
      case 'typography': {
        if (name === '--dz-font-sans' || name === '--dz-font-mono' || name.includes('font-family')) {
          el.style.fontFamily = v
          return cs().fontFamily
        }
        if (name.startsWith('--dz-text-') || name.includes('font-size')) {
          el.style.fontSize = v
          return cs().fontSize
        }
        if (name.startsWith('--dz-font-') || name.includes('font-weight')) {
          el.style.fontWeight = v
          return cs().fontWeight
        }
        // leading / tracking / line-height / letter-spacing resolve cleanly as
        // authored values; the declared form is the friendliest to display.
        return declaredValue(name)
      }
      case 'motion': {
        if (name.includes('ease')) {
          el.style.transitionTimingFunction = v
          return cs().transitionTimingFunction
        }
        if (name.includes('duration')) {
          el.style.transitionDuration = v
          return cs().transitionDuration
        }
        return declaredValue(name)
      }
      default:
        return declaredValue(name)
    }
  }
  catch {
    return declaredValue(name)
  }
}

function recompute(): void {
  const next: Record<string, { resolved: string, declared: string }> = {}
  for (const t of tokens.value) {
    const declared = declaredValue(t.name)
    next[t.name] = { resolved: resolvedValue(t.name, t.category) || declared, declared }
  }
  values.value = next
}

// ---------------------------------------------------------------------------
// Lifecycle — build manifest, resolve values, watch the theme toolbar
// ---------------------------------------------------------------------------

let observer: MutationObserver | null = null

onMounted(() => {
  tokens.value = buildTokenManifest()
  recompute()
  observer = new MutationObserver(() => recompute())
  const opts: MutationObserverInit = { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] }
  observer.observe(document.documentElement, opts)
  if (document.body) observer.observe(document.body, opts)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  probe?.remove()
  probe = null
})

// ---------------------------------------------------------------------------
// Filtering + grouping
// ---------------------------------------------------------------------------

/** Categories that actually occur, in canonical order (drives the chips). */
const presentCategories = computed<TokenCategory[]>(() => {
  const seen = new Set(tokens.value.map(t => t.category))
  return CATEGORY_ORDER.filter(c => seen.has(c))
})

const tiers: TokenTier[] = ['primitive', 'semantic', 'component']

const filtered = computed<TokenEntry[]>(() => {
  const q = query.value.trim().toLowerCase()
  return tokens.value.filter((t) => {
    if (activeTier.value !== 'all' && t.tier !== activeTier.value) return false
    if (activeCategory.value !== 'all' && t.category !== activeCategory.value) return false
    if (!q) return true
    return (
      t.name.toLowerCase().includes(q)
      || t.reference.toLowerCase().includes(q)
      || (values.value[t.name]?.resolved ?? '').toLowerCase().includes(q)
    )
  })
})

/** Filtered tokens grouped by tier for the section layout. */
const groups = computed(() =>
  tiers
    .map(tier => ({ tier, items: filtered.value.filter(t => t.tier === tier) }))
    .filter(g => g.items.length > 0),
)

const tierCounts = computed<Record<TokenTier, number>>(() => {
  const counts: Record<TokenTier, number> = { primitive: 0, semantic: 0, component: 0 }
  for (const t of tokens.value) counts[t.tier]++
  return counts
})

// ---------------------------------------------------------------------------
// Per-card display helpers
// ---------------------------------------------------------------------------

function live(name: string): { resolved: string, declared: string } {
  return values.value[name] ?? { resolved: '', declared: '' }
}

/** Show the authored mapping only when it differs and is an indirection. */
function showReference(t: TokenEntry): boolean {
  const d = live(t.name).declared
  return d.includes('var(') && d !== live(t.name).resolved
}

type PreviewKind =
  | 'color'
  | 'spacing'
  | 'radius'
  | 'shadow'
  | 'typo-family'
  | 'typo-size'
  | 'typo-weight'
  | 'typo-lead'
  | 'typo-track'
  | 'plain'

function previewKind(t: TokenEntry): PreviewKind {
  switch (t.category) {
    case 'color':
      return 'color'
    case 'spacing':
      return 'spacing'
    case 'radius':
      return 'radius'
    case 'shadow':
      return 'shadow'
    case 'typography':
      if (t.name === '--dz-font-sans' || t.name === '--dz-font-mono' || t.name.includes('font-family')) return 'typo-family'
      if (t.name.startsWith('--dz-text-') || t.name.includes('font-size')) return 'typo-size'
      if (t.name.startsWith('--dz-leading-') || t.name.includes('line-height')) return 'typo-lead'
      if (t.name.startsWith('--dz-tracking-') || t.name.includes('letter-spacing')) return 'typo-track'
      return 'typo-weight'
    default:
      return 'plain'
  }
}

const cssVar = (name: string): string => `var(${name})`
</script>

<template>
  <div class="dztb">
    <!-- Controls -->
    <div class="dztb__controls">
      <div class="dztb__search">
        <DzInput
          v-model="query"
          type="search"
          clearable
          aria-label="Filter tokens by name"
          placeholder="Filter tokens — try “radius”, “primary”, “spacing”…"
        />
      </div>

      <div class="dztb__filters">
        <div class="dztb__chiprow" role="group" aria-label="Filter by tier">
          <button type="button" class="dztb__chipbtn" :aria-pressed="activeTier === 'all'" @click="activeTier = 'all'">
            <DzChip size="sm" :variant="activeTier === 'all' ? 'solid' : 'subtle'" :tone="activeTier === 'all' ? 'primary' : 'neutral'">
              All tiers
            </DzChip>
          </button>
          <button
            v-for="tier in tiers"
            :key="tier"
            type="button"
            class="dztb__chipbtn"
            :aria-pressed="activeTier === tier"
            @click="activeTier = tier"
          >
            <DzChip size="sm" :variant="activeTier === tier ? 'solid' : 'subtle'" :tone="activeTier === tier ? 'primary' : 'neutral'">
              {{ TIER_LABELS[tier] }} · {{ tierCounts[tier] }}
            </DzChip>
          </button>
        </div>

        <div class="dztb__chiprow" role="group" aria-label="Filter by category">
          <button type="button" class="dztb__chipbtn" :aria-pressed="activeCategory === 'all'" @click="activeCategory = 'all'">
            <DzChip size="sm" :variant="activeCategory === 'all' ? 'solid' : 'subtle'" :tone="activeCategory === 'all' ? 'primary' : 'neutral'">
              All categories
            </DzChip>
          </button>
          <button
            v-for="cat in presentCategories"
            :key="cat"
            type="button"
            class="dztb__chipbtn"
            :aria-pressed="activeCategory === cat"
            @click="activeCategory = cat"
          >
            <DzChip size="sm" :variant="activeCategory === cat ? 'solid' : 'subtle'" :tone="activeCategory === cat ? 'primary' : 'neutral'">
              {{ CATEGORY_LABELS[cat] }}
            </DzChip>
          </button>
        </div>
      </div>

      <p class="dztb__count" aria-live="polite">
        Showing <strong>{{ filtered.length }}</strong> of {{ tokens.length }} tokens.
        Values are read live from the current theme — flip the <strong>Theme</strong> toolbar to watch them remap.
      </p>
    </div>

    <!-- Empty state -->
    <p v-if="tokens.length && !filtered.length" class="dztb__empty">
      No tokens match <code>{{ query }}</code>.
    </p>

    <!-- Grouped grid -->
    <section v-for="group in groups" :key="group.tier" class="dztb__section">
      <h3 class="dztb__heading">
        {{ TIER_LABELS[group.tier] }}
        <span class="dztb__headingcount">{{ group.items.length }}</span>
      </h3>

      <div class="dztb__grid">
        <DzCard v-for="t in group.items" :key="t.name" variant="outlined" padding="none" class="dztb__card">
          <!-- Live preview -->
          <div class="dztb__preview" :data-kind="previewKind(t)">
            <div v-if="previewKind(t) === 'color'" class="dztb__swatch">
              <span class="dztb__swatchfill" :style="{ background: cssVar(t.name) }" />
            </div>

            <div v-else-if="previewKind(t) === 'spacing'" class="dztb__track">
              <span class="dztb__trackfill" :style="{ width: cssVar(t.name) }" />
            </div>

            <div
              v-else-if="previewKind(t) === 'radius'"
              class="dztb__radiusbox"
              :style="{ borderRadius: cssVar(t.name) }"
            />

            <div
              v-else-if="previewKind(t) === 'shadow'"
              class="dztb__shadowbox"
              :style="{ boxShadow: cssVar(t.name) }"
            />

            <span v-else-if="previewKind(t) === 'typo-family'" class="dztb__type" :style="{ fontFamily: cssVar(t.name) }">Ag 1</span>
            <span v-else-if="previewKind(t) === 'typo-size'" class="dztb__type" :style="{ fontSize: cssVar(t.name) }">Ag</span>
            <span v-else-if="previewKind(t) === 'typo-weight'" class="dztb__type" :style="{ fontWeight: cssVar(t.name) }">Ag</span>
            <span
              v-else-if="previewKind(t) === 'typo-lead'"
              class="dztb__typelines"
              :style="{ lineHeight: cssVar(t.name) }"
            >Line one<br>Line two</span>
            <span
              v-else-if="previewKind(t) === 'typo-track'"
              class="dztb__type dztb__type--track"
              :style="{ letterSpacing: cssVar(t.name) }"
            >TRACK</span>

            <span v-else class="dztb__plain">{{ live(t.name).resolved || '—' }}</span>
          </div>

          <!-- Meta -->
          <div class="dztb__body">
            <code class="dztb__name" :title="t.name">{{ t.name }}</code>
            <div class="dztb__value" :title="live(t.name).resolved">{{ live(t.name).resolved || '—' }}</div>
            <div v-if="showReference(t)" class="dztb__ref" :title="live(t.name).declared">→ {{ live(t.name).declared }}</div>

            <div class="dztb__copyrow">
              <DzCopyButton
                size="xs"
                variant="ghost"
                tone="neutral"
                :value="t.name"
                label="name"
                copied-label="copied!"
                :aria-label="`Copy token name ${t.name}`"
              />
              <DzCopyButton
                size="xs"
                variant="ghost"
                tone="neutral"
                :value="cssVar(t.name)"
                label="var()"
                copied-label="copied!"
                :aria-label="`Copy var() reference for ${t.name}`"
              />
            </div>

            <div v-if="t.components.length" class="dztb__used" :title="t.components.join(', ')">
              <span class="dztb__usedlabel">Used by</span>
              {{ t.components.slice(0, 4).join(', ') }}<template v-if="t.components.length > 4"> +{{ t.components.length - 4 }}</template>
            </div>
          </div>
        </DzCard>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dztb {
  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

/* ── Controls ── */
.dztb__controls {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--dz-spacing-3);
  padding: var(--dz-spacing-4);
  margin-bottom: var(--dz-spacing-4);
  background: color-mix(in oklch, var(--dz-background) 88%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-xl);
}

.dztb__search {
  max-width: 32rem;
}

.dztb__filters {
  display: flex;
  flex-direction: column;
  gap: var(--dz-spacing-2);
}

.dztb__chiprow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dz-spacing-2);
}

.dztb__chipbtn {
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  border-radius: var(--dz-radius-full);
}

.dztb__chipbtn:focus-visible {
  outline: var(--dz-button-focus-ring-width, 2px) solid var(--dz-ring);
  outline-offset: 2px;
}

.dztb__count {
  margin: 0;
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
}

.dztb__empty {
  padding: var(--dz-spacing-8);
  text-align: center;
  color: var(--dz-muted-foreground);
}

/* ── Sections ── */
.dztb__section {
  margin-bottom: var(--dz-spacing-8);
}

.dztb__heading {
  display: flex;
  align-items: center;
  gap: var(--dz-spacing-2);
  font-size: var(--dz-text-lg);
  font-weight: var(--dz-font-semibold);
  margin: 0 0 var(--dz-spacing-3);
}

.dztb__headingcount {
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-medium);
  color: var(--dz-muted-foreground);
  background: var(--dz-muted);
  padding: 0 var(--dz-spacing-2);
  border-radius: var(--dz-radius-full);
}

.dztb__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--dz-spacing-3);
}

.dztb__card {
  overflow: hidden;
}

/* ── Preview ── */
.dztb__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84px;
  padding: var(--dz-spacing-3);
  border-bottom: 1px solid var(--dz-border);
  /* Checkerboard so alpha/near-white swatches stay visible. */
  background-color: var(--dz-surface);
  background-image:
    linear-gradient(45deg, var(--dz-muted) 25%, transparent 25%),
    linear-gradient(-45deg, var(--dz-muted) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--dz-muted) 75%),
    linear-gradient(-45deg, transparent 75%, var(--dz-muted) 75%);
  background-size: 14px 14px;
  background-position: 0 0, 0 7px, 7px -7px, -7px 0;
}

.dztb__swatch {
  width: 100%;
  height: 100%;
}

.dztb__swatchfill {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--dz-radius-md);
  border: 1px solid color-mix(in oklch, var(--dz-border) 60%, transparent);
}

.dztb__track {
  width: 100%;
  height: 20px;
  border-radius: var(--dz-radius-full);
  background: color-mix(in oklch, var(--dz-muted-foreground) 20%, transparent);
  overflow: hidden;
}

.dztb__trackfill {
  display: block;
  max-width: 100%;
  height: 100%;
  background: var(--dz-primary);
  border-radius: var(--dz-radius-full);
}

.dztb__radiusbox {
  width: 56px;
  height: 56px;
  background: var(--dz-primary);
  border-top-left-radius: 0;
}

.dztb__shadowbox {
  width: 56px;
  height: 56px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-surface);
  border: 1px solid var(--dz-border);
}

.dztb__type {
  color: var(--dz-foreground);
  line-height: 1;
  font-size: 1.75rem;
}

.dztb__type--track {
  font-size: var(--dz-text-base);
  font-weight: var(--dz-font-semibold);
}

.dztb__typelines {
  font-size: var(--dz-text-xs);
  text-align: center;
  color: var(--dz-foreground);
}

.dztb__plain {
  font-family: var(--dz-font-mono);
  font-size: var(--dz-text-xs);
  color: var(--dz-muted-foreground);
  text-align: center;
  word-break: break-all;
}

/* ── Body ── */
.dztb__body {
  display: flex;
  flex-direction: column;
  gap: var(--dz-spacing-1);
  padding: var(--dz-spacing-3);
}

.dztb__name {
  font-family: var(--dz-font-mono);
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-medium);
  color: var(--dz-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dztb__value {
  font-family: var(--dz-font-mono);
  font-size: 11px;
  color: var(--dz-muted-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dztb__ref {
  font-family: var(--dz-font-mono);
  font-size: 11px;
  color: color-mix(in oklch, var(--dz-primary) 80%, var(--dz-foreground));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dztb__copyrow {
  display: flex;
  gap: var(--dz-spacing-1);
  margin-top: var(--dz-spacing-1);
}

.dztb__used {
  margin-top: var(--dz-spacing-1);
  font-size: 11px;
  color: var(--dz-muted-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dztb__usedlabel {
  font-weight: var(--dz-font-semibold);
  color: var(--dz-foreground);
  margin-right: var(--dz-spacing-1);
}
</style>
