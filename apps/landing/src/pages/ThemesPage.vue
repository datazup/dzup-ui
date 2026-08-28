<script setup lang="ts">
import type { Shade } from '@dzup-ui/tokens'
import type { ContrastPair, DesignerIntent } from '../composables/useThemeDesigner.ts'
import { DzBadge, DzButton, DzHeading, DzSegmented, DzSelect, DzText, DzVisuallyHidden } from '@dzup-ui/core'
import { SHADE_STEPS } from '@dzup-ui/tokens'
import { AlertCircle, Check, Copy, Download, Link2, RotateCcw, Sparkles } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ThemeImageLab from '../components/themes/ThemeImageLab.vue'
import ThemePreviewCluster from '../components/themes/ThemePreviewCluster.vue'
import ThemesFinale from '../components/themes/ThemesFinale.vue'
import ThemesHeroField from '../components/themes/ThemesHeroField.vue'
import {
  AA_NORMAL,
  DESIGNER_INTENTS,
  FONT_CHOICES,
  PRESETS,
  RADIUS_MAX,
  RADIUS_MIN,
  RADIUS_STEP,
  shadeCss,
  SHADOW_MAX,
  SHADOW_MIN,
  SHADOW_STEP,
  useThemeDesigner,
} from '../composables/useThemeDesigner.ts'
import { DzBurst, DzCountUp, DzGradientText, DzStagger, provideMotionPreference, useReducedMotion, vAnimateOnScroll } from '../motion/index.ts'

/**
 * Theme Designer (/themes) — the "Themes" ecosystem offering. The home
 * ThemingDemo is a teaser; this is the full editor: live OKLCH control over the
 * whole semantic token set, a rich preview of real `@dzup-ui/core` components in
 * light AND dark side by side, live WCAG contrast gates, and one-click export
 * (CSS + JSON) plus a shareable URL.
 *
 * All the logic lives in `useThemeDesigner` (the single source for preview,
 * export and link). This page is the control surface + layout only.
 */

const route = useRoute()
const designer = useThemeDesigner()
const {
  palettes,
  radiusScale,
  density,
  shadowIntensity,
  fontKey,
  mode,
  direction,
  motion,
  cssText,
  jsonText,
  contrastLight,
  contrastDark,
  failingCount,
  shareUrl,
  deserialize,
  reset,
} = designer

// Bind each preview panel to the design; the panel's own `data-theme` forces the
// theme so the two render light and dark regardless of the site's global theme.
const lightVars = computed(() => designer.varsFor('light'))
const darkVars = computed(() => designer.varsFor('dark'))

// ── TASK-THV2-02: the double motion gate, wired once ────────────────────────
// The recipe's "Motion preview" lands as `[data-motion-preview='reduced']` on
// the root, which stills all CSS animation site-wide — but NOT JS-driven motion
// (rAF parallax, count-up tweens). Installing the motion override here and
// driving it from the recipe makes every `useReducedMotion()` consumer on this
// page (DzParallax, DzCountUp, DzStagger, DzGradientText, …) honour the page's
// own control AND the OS query through one gate.
const motionOverride = provideMotionPreference(motion.value === 'reduced')
watch(motion, (value) => {
  motionOverride.value = value === 'reduced'
})

// ── TASK-THV2-02: hero stats — every figure DERIVED, never typed ────────────
const statPalettes = DESIGNER_INTENTS.length
const statShades = DESIGNER_INTENTS.length * SHADE_STEPS.length
const statChecks = computed(() => contrastLight.value.length + contrastDark.value.length)

// ── TASK-THV2-03: mixing-desk micro-interactions ────────────────────────────
// The dual gate for JS-DRIVEN decoration on this page. Note `useReducedMotion`
// here resolves the OS query only: inject cannot see a component's own provide,
// so the recipe's Motion preview is OR-ed in explicitly.
const osReduced = useReducedMotion()
const decorReduced = computed(() => osReduced.value || motion.value === 'reduced')

// One-shot ring pulse on the preset that was just applied. Driven off
// `recipe.preset` (not the click) so a preset arriving via a share-link
// deserialize pulses too — the watcher is the single trigger for both paths.
// TASK-THV2-04 shares the trigger: the same watcher bumps the showcase's
// apply-sweep key, so a preset (or a reset back to the default preset) sends
// one light band across both preview panels. RECORDED CHOICE: slider drags
// flip `preset` to 'custom' — excluded, so drags never sweep; a deserialize
// landing on 'custom' doesn't sweep either (the page just appeared).
const pulsedPreset = ref<string>('')
const applySweep = ref(0)
let presetPulseTimer = 0
watch(() => designer.recipe.preset, (next) => {
  if (decorReduced.value || next === 'custom')
    return
  pulsedPreset.value = next
  applySweep.value++
  window.clearTimeout(presetPulseTimer)
  presetPulseTimer = window.setTimeout(() => {
    pulsedPreset.value = ''
  }, 900)
})

// TASK-THV2-04 — panel scroll entrance: fail-open directive, once, both gates.
// An empty enterClass turns the directive into a no-op (AV2-05 convention).
const panelEntrance = computed(() => (decorReduced.value ? { enterClass: '' } : {}))

// ── TASK-THV2-05: contrast gauges ───────────────────────────────────────────
// RECORDED DEVIATION from the task text: the headline number does NOT roll via
// DzCountUp/DzOdometer — DzAnimatedNumber hardwires an `aria-live="polite"`
// region, which on a surface recomputed at slider-drag rate would be
// announcement spam. The headline (and each row badge) animates with a
// one-shot POP on state change instead; ratios get a brief tick. All triggers
// are class/key toggles only — zero layout work per slider tick.
const ratioTick = reactive<Record<string, number>>({})
const badgePop = reactive<Record<string, number>>({})
const ratioTickLast: Record<string, number> = {}
const prevRatio: Record<string, number> = {}
const prevPairState: Record<string, string> = {}

function pairState(pair: ContrastPair): string {
  return pair.passNormal ? 'aa' : pair.passLarge ? 'aal' : 'fail'
}
function tickOf(col: string, label: string): number {
  return ratioTick[`${col}:${label}`] ?? 0
}
function popOf(col: string, label: string): number {
  return badgePop[`${col}:${label}`] ?? 0
}

watch([contrastLight, contrastDark], ([light, dark]) => {
  const now = Date.now()
  for (const [col, pairs] of [['Light', light], ['Dark', dark]] as const) {
    for (const pair of pairs) {
      const key = `${col}:${pair.label}`
      const wasRatio = prevRatio[key]
      const wasState = prevPairState[key]
      prevRatio[key] = pair.ratio
      prevPairState[key] = pairState(pair)
      if (decorReduced.value)
        continue
      // Pop on STATE flips only (AA ↔ AA Large ↔ Fail) — never on same-state
      // recomputes.
      if (wasState !== undefined && wasState !== pairState(pair))
        badgePop[key] = (badgePop[key] ?? 0) + 1
      if (wasRatio === undefined || Math.abs(wasRatio - pair.ratio) < 0.005)
        continue
      if (now - (ratioTickLast[key] ?? 0) < 250)
        continue
      ratioTickLast[key] = now
      ratioTick[key] = (ratioTick[key] ?? 0) + 1
    }
  }
  // `immediate` so the mount run SEEDS the previous-value maps (the undefined
  // guards above make it animation-free) — without it the first real change
  // would seed instead of tick.
}, { immediate: true })

// The win: `failingCount` crossing >0 → 0 through interaction. The watcher
// never fires on mount (no `immediate`), so a page opened on an all-passing
// theme cannot celebrate; it re-arms naturally because only the crossing
// transition fires it. DzBurst gates itself on reduced motion (both gates via
// the page's motion provider).
const headlinePop = ref(0)
const celebrating = ref(false)
let celebrateTimer = 0
watch(failingCount, (next, prev) => {
  if (decorReduced.value)
    return
  headlinePop.value++
  if (next === 0 && prev > 0) {
    celebrating.value = true
    window.clearTimeout(celebrateTimer)
    celebrateTimer = window.setTimeout(() => {
      celebrating.value = false
    }, 900)
  }
})

// Ramp shimmer: each palette's ramp acknowledges a hue/chroma change with a
// one-shot sweep. The key bump remounts the overlay so its animation replays;
// a 250ms floor keeps a 60Hz slider drag reading as a continuous glint, not a
// strobe. Class toggles only — no layout work per tick.
const rampShimmer = reactive(
  Object.fromEntries(DESIGNER_INTENTS.map(intent => [intent, 0])) as Record<DesignerIntent, number>,
)
const rampShimmerLast: Partial<Record<DesignerIntent, number>> = {}
for (const intent of DESIGNER_INTENTS) {
  watch(() => [palettes[intent].hue, palettes[intent].chroma], () => {
    if (decorReduced.value)
      return
    const now = Date.now()
    if (now - (rampShimmerLast[intent] ?? 0) < 250)
      return
    rampShimmerLast[intent] = now
    rampShimmer[intent]++
  })
}

// ── Restore a shared design from the URL on first load ──────────────────────
// The other half of the "Copy share link" button: `shareUrl` serialises the
// design into a `?theme=` token, and this is what reads it back. Without it that
// button hands out links that open a default editor, which is worse than not
// offering the button at all.
onMounted(() => {
  const token = route.query.theme
  if (typeof token === 'string' && token)
    deserialize(token)
})

// ── Palette control metadata ────────────────────────────────────────────────
interface PaletteMeta {
  intent: DesignerIntent
  label: string
}
const PRIMARY_CONTROLS: PaletteMeta[] = [
  { intent: 'primary', label: 'Primary' },
  { intent: 'neutral', label: 'Neutral / surfaces' },
]
const INTENT_CONTROLS: PaletteMeta[] = [
  { intent: 'secondary', label: 'Secondary' },
  { intent: 'success', label: 'Success' },
  { intent: 'warning', label: 'Warning' },
  { intent: 'danger', label: 'Danger' },
  { intent: 'info', label: 'Info' },
]

/** The 11-shade ramp for a palette (for the preview strip under each control). */
function ramp(intent: DesignerIntent): { shade: Shade, css: string }[] {
  return SHADE_STEPS.map(shade => ({ shade, css: shadeCss(intent, shade) }))
}

/** A hue-wheel gradient for a slider track (constant L/C, hue sweeping 0→360). */
const HUE_TRACK
  = `linear-gradient(to right,${
    Array.from({ length: 13 }, (_, i) => `oklch(0.65 0.16 ${i * 30})`).join(',')
  })`

/** A chroma track for a palette: gray → its own hue at full chroma. */
function chromaTrack(intent: DesignerIntent): string {
  const hue = palettes[intent].hue
  return `linear-gradient(to right, oklch(0.65 0 ${hue}), oklch(0.65 0.24 ${hue}))`
}

const densityItems = [
  { value: 'compact', label: 'Compact' },
  { value: 'cozy', label: 'Cozy' },
  { value: 'spacious', label: 'Spacious' },
]
const fontItems = FONT_CHOICES.map(f => ({ value: f.key, label: f.label }))
const modeItems = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
const directionItems = [
  { value: 'ltr', label: 'LTR' },
  { value: 'rtl', label: 'RTL' },
]
const motionItems = [
  { value: 'normal', label: 'Normal' },
  { value: 'reduced', label: 'Reduced' },
]

// ── Copy / download plumbing ────────────────────────────────────────────────

/** How long the success flash sits before reverting to the idle label. */
const COPY_FLASH_MS = 1600
/**
 * Failure sits FOUR times longer than success (TASK-FREE3-07). Both decay — a
 * permanent error banner over a transient action would be worse — but the two
 * messages ask different things of the reader: "Copied" is a receipt for
 * something already done, while the failure tells the user to go and select the
 * export text by hand. A 1.6s window is not long enough to read an instruction,
 * decide, and act on it.
 */
const COPY_ERROR_MS = 6000

/** Key of the affordance currently flashing success — '' when none is. */
const copied = ref<string>('')
/** Key of the affordance currently showing a failure — '' when none is. */
const copyFailed = ref<string>('')
/**
 * Spoken by the aria-live region below, for BOTH outcomes.
 *
 * The success flash was already silent to assistive tech: it swaps an icon and
 * rewrites the label of a button the user has just pressed, and a live label
 * change on the focused control is not reliably re-announced. The failure had no
 * representation at all — in a non-secure context (`navigator.clipboard` is
 * undefined off HTTPS/localhost) pressing Copy CSS did precisely nothing, with
 * nothing said and nothing shown.
 */
const copyStatus = ref<string>('')

function flashCopied(key: string): void {
  copied.value = key
  copyFailed.value = ''
  copyStatus.value = 'Copied to clipboard.'
  window.setTimeout(() => {
    if (copied.value === key) {
      copied.value = ''
      copyStatus.value = ''
    }
  }, COPY_FLASH_MS)
}

function flashCopyFailed(key: string): void {
  copyFailed.value = key
  copied.value = ''
  copyStatus.value = 'Copy failed — select the export text and copy it manually.'
  window.setTimeout(() => {
    if (copyFailed.value === key) {
      copyFailed.value = ''
      copyStatus.value = ''
    }
  }, COPY_ERROR_MS)
}

async function copyText(text: string, key: string): Promise<void> {
  try {
    // The `navigator.clipboard` PROPERTY ACCESS is itself inside the try on
    // purpose: the API is undefined outside a secure context, so the throw can
    // come from the lookup rather than from the rejected write.
    await navigator.clipboard.writeText(text)
    flashCopied(key)
  }
  catch {
    flashCopyFailed(key)
  }
}

/** Label for a copy button, resolving idle / success / failure in one place. */
function copyLabel(key: string, idle: string, done: string): string {
  if (copied.value === key)
    return done
  if (copyFailed.value === key)
    return 'Copy failed'
  return idle
}
function download(text: string, filename: string, mime: string): void {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// The experimental "theme from an image" feature moved to ThemeImageLab
// (TASK-THV2-06) — same sampling (now the pure `themeImageSampling.ts`), same
// clamps, same palette writes, staged as a drop zone with a thumbnail and a
// sampled-colour flight.
</script>

<template>
  <div class="themes-page" :class="{ 'thv2-still': decorReduced }">
    <!-- TASK-THV2-01 — the atelier's light. Two fixed washes reading the LIVE
         semantic tokens: ThemeRecipeController applies the visitor's recipe to
         documentElement, so `--dz-primary`/`--dz-secondary` here ARE the design
         being mixed — the room re-lights on every slider tick with zero designer
         state reads. -->
    <div class="thv2-atmosphere" aria-hidden="true" />
    <!-- Hero -->
    <header class="themes-hero">
      <!-- TASK-THV2-02 — floating paint chips reading the LIVE tokens; the
           decoration repaints as the visitor mixes. aria-hidden + inert. -->
      <ThemesHeroField />
      <div class="themes-hero-inner">
        <span class="lp-eyebrow">Themes</span>
        <!-- Same visible string as v1 ("Theme Designer") — the stagger cascades
             it in once, and the gradient phrase reads the live primary ramp, so
             the visitor literally repaints the headline as they mix. -->
        <DzHeading :level="1" size="4xl" weight="bold" class="themes-title lp-balance">
          <DzStagger as="span" :step="90" class="themes-title-stagger">
            <span>Theme</span>{{ ' ' }}<DzGradientText>Designer</DzGradientText>
          </DzStagger>
        </DzHeading>
        <DzText size="lg" tone="muted" class="themes-lede lp-balance">
          Design a complete theme against a live cluster of real components. Tune the OKLCH token
          palette, watch it re-skin in light and dark at once, verify WCAG contrast as you go, then
          export the <code>--dz-*</code> variables or share a link that reproduces it exactly.
          Every change applies live to the site you're standing on.
        </DzText>
        <!-- TASK-THV2-02 — derived scale figures; values come from the designer's
             own exports, never typed (repo rule). -->
        <dl class="themes-stats" aria-label="Theme Designer scale">
          <div class="themes-stat">
            <dt class="themes-stat-label">
              Editable palettes
            </dt>
            <dd class="themes-stat-figure">
              <DzCountUp :value="statPalettes" size="lg" />
            </dd>
          </div>
          <div class="themes-stat">
            <dt class="themes-stat-label">
              Live ramp shades
            </dt>
            <dd class="themes-stat-figure">
              <DzCountUp :value="statShades" size="lg" />
            </dd>
          </div>
          <div class="themes-stat">
            <dt class="themes-stat-label">
              WCAG checks, live
            </dt>
            <dd class="themes-stat-figure">
              <DzCountUp :value="statChecks" size="lg" />
            </dd>
          </div>
        </dl>
        <div class="themes-hero-actions">
          <DzButton size="md" variant="solid" tone="primary" @click="copyText(shareUrl, 'share')">
            <template #prefix>
              <Check v-if="copied === 'share'" :size="16" aria-hidden="true" />
              <AlertCircle v-else-if="copyFailed === 'share'" :size="16" aria-hidden="true" />
              <Link2 v-else :size="16" aria-hidden="true" />
            </template>
            {{ copyLabel('share', 'Copy share link', 'Link copied!') }}
          </DzButton>
          <DzButton size="md" variant="outline" tone="neutral" @click="reset">
            <template #prefix>
              <RotateCcw :size="15" aria-hidden="true" />
            </template>
            Reset
          </DzButton>
          <a class="themes-share-link" :href="shareUrl">Open share URL</a>
        </div>
      </div>
    </header>

    <div class="themes-workspace">
      <!-- ── Controls ── -->
      <aside class="themes-controls" aria-label="Theme controls">
        <!-- Presets -->
        <section class="control-group">
          <h2 class="control-h">
            Presets
          </h2>
          <div class="preset-row">
            <button
              v-for="preset in PRESETS"
              :key="preset.name"
              type="button"
              class="preset"
              :class="{ 'preset--pulsed': pulsedPreset === preset.id }"
              :style="{ '--sw': `oklch(0.6 ${preset.swatch.chroma} ${preset.swatch.hue})` }"
              @click="preset.apply()"
            >
              <span class="preset-dot" aria-hidden="true" />
              {{ preset.name }}
            </button>
          </div>
        </section>

        <!-- Colour palettes -->
        <section class="control-group">
          <h2 class="control-h">
            Colour
          </h2>
          <div
            v-for="meta in PRIMARY_CONTROLS"
            :key="meta.intent"
            class="palette-control"
          >
            <div class="palette-head">
              <span
                class="palette-swatch"
                :style="{ background: shadeCss(meta.intent, 500) }"
                aria-hidden="true"
              />
              <span class="palette-label">{{ meta.label }}</span>
            </div>
            <label class="slider">
              <span class="slider-cap">Hue <em>{{ Math.round(palettes[meta.intent].hue) }}°</em></span>
              <input
                v-model.number="palettes[meta.intent].hue"
                type="range" min="0" max="360" step="1"
                class="range" :style="{ '--track': HUE_TRACK, '--thumb': shadeCss(meta.intent, 500) }"
                :aria-label="`${meta.label} hue`"
              >
            </label>
            <label class="slider">
              <span class="slider-cap">Chroma <em>{{ palettes[meta.intent].chroma.toFixed(3) }}</em></span>
              <input
                v-model.number="palettes[meta.intent].chroma"
                type="range" min="0" max="0.3" step="0.005"
                class="range" :style="{ '--track': chromaTrack(meta.intent), '--thumb': shadeCss(meta.intent, 500) }"
                :aria-label="`${meta.label} chroma`"
              >
            </label>
            <div class="ramp" aria-hidden="true">
              <span
                v-for="s in ramp(meta.intent)"
                :key="s.shade"
                class="ramp-swatch"
                :style="{ background: s.css }"
              />
              <!-- THV2-03 — one-shot change acknowledgment; key bump replays it. -->
              <i
                v-if="rampShimmer[meta.intent]"
                :key="rampShimmer[meta.intent]"
                class="ramp-shimmer"
              />
            </div>
          </div>

          <details class="advanced">
            <summary>Status &amp; accent palettes</summary>
            <div
              v-for="meta in INTENT_CONTROLS"
              :key="meta.intent"
              class="palette-control"
            >
              <div class="palette-head">
                <span
                  class="palette-swatch"
                  :style="{ background: shadeCss(meta.intent, 500) }"
                  aria-hidden="true"
                />
                <span class="palette-label">{{ meta.label }}</span>
              </div>
              <label class="slider">
                <span class="slider-cap">Hue <em>{{ Math.round(palettes[meta.intent].hue) }}°</em></span>
                <input
                  v-model.number="palettes[meta.intent].hue"
                  type="range" min="0" max="360" step="1"
                  class="range" :style="{ '--track': HUE_TRACK, '--thumb': shadeCss(meta.intent, 500) }"
                  :aria-label="`${meta.label} hue`"
                >
              </label>
              <label class="slider">
                <span class="slider-cap">Chroma <em>{{ palettes[meta.intent].chroma.toFixed(3) }}</em></span>
                <input
                  v-model.number="palettes[meta.intent].chroma"
                  type="range" min="0" max="0.3" step="0.005"
                  class="range" :style="{ '--track': chromaTrack(meta.intent), '--thumb': shadeCss(meta.intent, 500) }"
                  :aria-label="`${meta.label} chroma`"
                >
              </label>
              <div class="ramp" aria-hidden="true">
                <span
                  v-for="s in ramp(meta.intent)"
                  :key="s.shade"
                  class="ramp-swatch"
                  :style="{ background: s.css }"
                />
                <i
                  v-if="rampShimmer[meta.intent]"
                  :key="rampShimmer[meta.intent]"
                  class="ramp-shimmer"
                />
              </div>
            </div>
          </details>
        </section>

        <!-- Shape & type -->
        <section class="control-group">
          <h2 class="control-h">
            Shape &amp; type
          </h2>
          <label class="slider">
            <span class="slider-cap">Radius <em>×{{ radiusScale.toFixed(2) }}</em></span>
            <input
              v-model.number="radiusScale"
              type="range" :min="RADIUS_MIN" :max="RADIUS_MAX" :step="RADIUS_STEP"
              class="range range--plain" aria-label="Corner radius scale"
            >
          </label>
          <label class="slider">
            <span class="slider-cap">Shadow <em>×{{ shadowIntensity.toFixed(2) }}</em></span>
            <input
              v-model.number="shadowIntensity"
              type="range" :min="SHADOW_MIN" :max="SHADOW_MAX" :step="SHADOW_STEP"
              class="range range--plain" aria-label="Shadow intensity"
            >
          </label>
          <div class="field">
            <span class="field-cap">Density</span>
            <DzSegmented v-model="density" :items="densityItems" size="sm" aria-label="Density" />
          </div>
          <div class="field">
            <span class="field-cap">Font</span>
            <DzSelect v-model="fontKey" :items="fontItems" size="sm" aria-label="Font family" />
          </div>
        </section>

        <!-- Runtime preferences -->
        <section class="control-group">
          <h2 class="control-h">
            Runtime
          </h2>
          <div class="field">
            <span class="field-cap">Color mode</span>
            <DzSegmented v-model="mode" :items="modeItems" size="sm" aria-label="Color mode" />
          </div>
          <div class="field">
            <span class="field-cap">Direction</span>
            <DzSegmented v-model="direction" :items="directionItems" size="sm" aria-label="Direction" />
          </div>
          <div class="field">
            <span class="field-cap">Motion preview</span>
            <DzSegmented v-model="motion" :items="motionItems" size="sm" aria-label="Motion preview" />
          </div>
          <DzText size="xs" tone="muted">
            These preferences apply to the full landing surface and travel with the exported recipe.
          </DzText>
        </section>

        <!-- Experimental: from image (TASK-THV2-06 — the darkroom) -->
        <ThemeImageLab />
      </aside>

      <!-- ── Preview + a11y + export ── -->
      <div class="themes-stage">
        <!-- Contrast readout -->
        <section class="a11y-bar" aria-label="Contrast check">
          <!-- THV2-05 — one-shot success glow when the last failing pair flips. -->
          <i v-if="celebrating" class="a11y-won-glow" aria-hidden="true" />
          <div class="a11y-head">
            <!-- The burst anchors to the header icon; DzBurst self-gates on
                 reduced motion (both gates via the page's motion provider). -->
            <DzBurst :active="celebrating" :spokes="10">
              <Sparkles :size="16" aria-hidden="true" />
            </DzBurst>
            <DzText weight="semibold" as="span">
              Accessibility
            </DzText>
            <span
              :key="headlinePop"
              class="a11y-headline"
              :class="{ 'a11y-pop': headlinePop > 0 }"
            >
              <DzBadge
                :variant="failingCount === 0 ? 'subtle' : 'solid'"
                :tone="failingCount === 0 ? 'success' : 'danger'"
                size="sm"
              >
                {{ failingCount === 0 ? 'All pairs pass AA' : `${failingCount} below AA` }}
              </DzBadge>
            </span>
          </div>
          <div class="a11y-cols">
            <div v-for="col in [{ label: 'Light', pairs: contrastLight }, { label: 'Dark', pairs: contrastDark }]" :key="col.label" class="a11y-col">
              <div class="a11y-col-h">
                {{ col.label }}
              </div>
              <ul class="a11y-list">
                <li v-for="pair in col.pairs" :key="pair.label" class="a11y-item">
                  <span class="a11y-label">{{ pair.label }}</span>
                  <span
                    :key="`tick-${tickOf(col.label, pair.label)}`"
                    class="a11y-ratio"
                    :class="{ 'a11y-ratio--tick': tickOf(col.label, pair.label) > 0 }"
                  >{{ pair.ratio.toFixed(2) }}:1</span>
                  <span
                    :key="`pop-${popOf(col.label, pair.label)}`"
                    class="a11y-badge"
                    :class="{ 'a11y-pop': popOf(col.label, pair.label) > 0 }"
                  >
                    <DzBadge
                      :variant="pair.passNormal ? 'subtle' : 'solid'"
                      :tone="pair.passNormal ? 'success' : pair.passLarge ? 'warning' : 'danger'"
                      size="sm"
                    >
                      {{ pair.passNormal ? 'AA' : pair.passLarge ? 'AA Large' : 'Fail' }}
                    </DzBadge>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <DzText size="xs" tone="muted" class="a11y-note">
            Contrast is computed in OKLCH against the resolved semantic pairs (AA = {{ AA_NORMAL }}:1
            for normal text). Solid swatches flag a failing pair.
          </DzText>
        </section>

        <!-- Split light/dark preview. THV2-04: entrance + easel rake + apply
             sweep — the panels' `data-theme` + `:style` vars mechanism is
             untouched; every v2 addition is a class or an aria-hidden overlay. -->
        <div class="preview-split">
          <div
            v-animate-on-scroll="panelEntrance"
            class="preview-panel preview-panel--light"
            data-theme="light"
            :style="lightVars"
          >
            <div class="preview-panel-label">
              <span class="pp-dot pp-dot--light" aria-hidden="true" /> Light
            </div>
            <ThemePreviewCluster />
            <i v-if="applySweep" :key="applySweep" class="panel-sweep" aria-hidden="true" />
          </div>
          <div
            v-animate-on-scroll="panelEntrance"
            class="preview-panel preview-panel--dark"
            data-theme="dark"
            :style="darkVars"
          >
            <div class="preview-panel-label">
              <span class="pp-dot pp-dot--dark" aria-hidden="true" /> Dark
            </div>
            <ThemePreviewCluster />
            <i v-if="applySweep" :key="applySweep" class="panel-sweep" aria-hidden="true" />
          </div>
        </div>

        <!-- Export -->
        <section class="export" aria-label="Export theme">
          <div class="export-head">
            <DzText weight="semibold" as="span">
              Export
            </DzText>
            <div class="export-actions">
              <DzButton size="sm" variant="outline" tone="neutral" @click="copyText(cssText, 'css')">
                <template #prefix>
                  <Check v-if="copied === 'css'" :size="14" aria-hidden="true" />
                  <AlertCircle v-else-if="copyFailed === 'css'" :size="14" aria-hidden="true" />
                  <Copy v-else :size="14" aria-hidden="true" />
                </template>
                {{ copyLabel('css', 'Copy CSS', 'Copied') }}
              </DzButton>
              <DzButton size="sm" variant="outline" tone="neutral" @click="download(cssText, 'dzup-theme.css', 'text/css')">
                <template #prefix>
                  <Download :size="14" aria-hidden="true" />
                </template>
                .css
              </DzButton>
              <DzButton size="sm" variant="outline" tone="neutral" @click="copyText(jsonText, 'json')">
                <template #prefix>
                  <Check v-if="copied === 'json'" :size="14" aria-hidden="true" />
                  <AlertCircle v-else-if="copyFailed === 'json'" :size="14" aria-hidden="true" />
                  <Copy v-else :size="14" aria-hidden="true" />
                </template>
                {{ copyLabel('json', 'Copy JSON', 'Copied') }}
              </DzButton>
              <DzButton size="sm" variant="outline" tone="neutral" @click="download(jsonText, 'dzup-theme.json', 'application/json')">
                <template #prefix>
                  <Download :size="14" aria-hidden="true" />
                </template>
                .json
              </DzButton>
            </div>
          </div>
          <!-- Visible failure note, next to the very text the message tells the
               user to select. The button label ("Copy failed") is the feedback on
               the affordance itself; this carries the instruction. Success needs
               no equivalent — the label flip is a sufficient receipt. -->
          <p v-if="copyFailed !== ''" class="export-error" role="alert">
            Copy failed — your browser blocked clipboard access. Select the text below and copy it
            manually.
          </p>
          <pre class="export-code" tabindex="0" aria-label="Generated theme CSS"><code>{{ cssText }}</code></pre>
          <details class="recipe-json">
            <summary>Serialized ThemeRecipeV1</summary>
            <pre data-testid="theme-recipe-export" tabindex="0" aria-label="Serialized theme recipe"><code>{{ jsonText }}</code></pre>
          </details>
        </section>
      </div>
    </div>

    <!-- TASK-THV2-07 — the private view: the pipeline drawn live in the
         visitor's own primary, plus the ship-it actions. The share button IS
         the hero's plumbing (handlers + labels passed down — one clipboard
         source of truth). -->
    <!-- Distinct visible label ("Share this theme") so the hero's accessible
         name stays unique (the copy spec queries by role+name); same key, same
         handler, same announcement. -->
    <ThemesFinale
      :share-label="copyLabel('share', 'Share this theme', 'Link copied!')"
      :share-state="copied === 'share' ? 'copied' : copyFailed === 'share' ? 'failed' : 'idle'"
      @share="copyText(shareUrl, 'share')"
      @download-css="download(cssText, 'dzup-theme.css', 'text/css')"
    />

    <!-- Copy outcome, spoken once per action (TASK-FREE3-07). Covers BOTH
         outcomes: the share button sits in the hero, far from the export block's
         visible note, and a label change on the button the user just pressed is
         not reliably re-announced. `polite` so it waits for a pause rather than
         cutting across whatever is being read. -->
    <DzVisuallyHidden aria-live="polite" role="status">
      {{ copyStatus }}
    </DzVisuallyHidden>
  </div>
</template>

<style>
/* TASK-THV2-01 — register the ambient accents as real <color>s so the browser
   interpolates them: a preset apply (or a slider drag) then cross-fades the
   atmosphere instead of snapping it. UNSCOPED on purpose: `@property` is a
   document-level registration (BV2-01 precedent) and scoped blocks strip
   at-rules. Own names (`--thv2-*`) — the sibling atmosphere pages can all be
   alive in one SPA session. Browsers without @property simply snap the hue. */
@property --thv2-accent {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}
@property --thv2-accent-2 {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}
</style>

<style scoped>
.themes-page {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 56px) 24px 80px;
  /* The page owns an isolated stacking context so `.thv2-atmosphere`
     (z-index -1) paints above the shell's opaque background yet below every
     child of the page — without isolation a negative z-index child vanishes
     behind the shell's paint (the BV2-01 trap). */
  isolation: isolate;
  /* The atelier's light IS the theme being mixed: the registered properties
     resolve through the live semantic tokens, so every wash and tint follows
     the visitor's edits — and the transition smooths preset jumps and slider
     drags alike (registered properties interpolate on computed-value change). */
  --thv2-accent: var(--dz-primary, #0766ee);
  --thv2-accent-2: var(--dz-secondary, #0766ee);
  transition:
    --thv2-accent 400ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    --thv2-accent-2 400ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

/* Two large, whisper-quiet radial washes in the mix's own hues: primary high
   behind the hero, secondary at the trailing edge mid-stage. Fixed so the room
   stays lit while scrolling; pointer-events none so it never swallows a click. */
.thv2-atmosphere {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(
      52rem 36rem at 12% -6%,
      color-mix(in oklch, var(--thv2-accent, var(--dz-primary, #0766ee)) 9%, transparent),
      transparent 70%
    ),
    radial-gradient(
      44rem 32rem at 104% 44%,
      color-mix(in oklch, var(--thv2-accent-2, var(--dz-primary, #0766ee)) 6%, transparent),
      transparent 72%
    );
}

/* Dark rooms need dimmer lamps: same washes at a lower mix so the accent reads
   as ambience, not a spotlight, on the dark background. */
:root[data-theme='dark'] .thv2-atmosphere {
  background:
    radial-gradient(
      52rem 36rem at 12% -6%,
      color-mix(in oklch, var(--thv2-accent, var(--dz-primary, #0766ee)) 6%, transparent),
      transparent 70%
    ),
    radial-gradient(
      44rem 32rem at 104% 44%,
      color-mix(in oklch, var(--thv2-accent-2, var(--dz-primary, #0766ee)) 4%, transparent),
      transparent 72%
    );
}

/* The eyebrow pill takes the room's tint too — the sibling pages' cue, with the
   live accent standing in for the fixed primary. */
.themes-hero .lp-eyebrow {
  border-color: color-mix(in oklch, var(--thv2-accent, var(--dz-primary, #0766ee)) 22%, transparent);
  background: color-mix(in oklch, var(--thv2-accent, var(--dz-primary, #0766ee)) 9%, transparent);
  color: color-mix(
    in oklch,
    var(--thv2-accent, var(--dz-primary, #0766ee)) 62%,
    var(--dz-foreground, #1b1d1f)
  );
}

@media (prefers-reduced-motion: reduce) {
  .themes-page {
    transition: none;
  }
}

/* ── Hero ── */
.themes-hero {
  /* Positioning context for the THV2-02 paint-chip field. */
  position: relative;
  margin-bottom: 32px;
}
.themes-hero-inner {
  /* Above the chip field (z 0). */
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 760px;
}

/* THV2-02 — derived stats row. Real content (a `<dl>`), tabular figures. */
.themes-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 36px;
  margin: 6px 0 0;
}
.themes-stat {
  display: grid;
  gap: 2px;
}
.themes-stat-label {
  order: 2;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}
.themes-stat-figure {
  order: 1;
  margin: 0;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.themes-title {
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.themes-lede {
  margin: 0;
  line-height: 1.6;
}
.themes-lede code {
  font-family: var(--dz-font-mono, monospace);
  font-size: 0.9em;
  padding: 1px 5px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #d3d4d7);
}
.themes-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.themes-share-link {
  align-self: center;
  color: var(--dz-link, var(--dz-primary));
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  text-underline-offset: 3px;
}

/* ── Workspace ── */
.themes-workspace {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 24px;
  align-items: start;
}

.themes-controls {
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  padding: 20px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #ffffff);
  scrollbar-width: thin;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}

/* Presets */
.preset-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.preset {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-background, #e7e8e9);
  color: var(--dz-foreground, #1b1d1f);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color var(--dz-duration-fast, 150ms),
    background var(--dz-duration-fast, 150ms),
    transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}
.preset:hover {
  border-color: color-mix(in oklch, var(--sw) 55%, var(--lp-hairline));
  background: color-mix(in oklch, var(--sw) 7%, var(--dz-background, #e7e8e9));
}
/* THV2-03 — press spring (transform-only; the settle rides the transition). */
.preset:active {
  transform: scale(0.96);
}
.preset-dot {
  width: 13px;
  height: 13px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--sw);
  flex: none;
  transition: transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}
.preset:hover .preset-dot {
  transform: scale(1.25);
}
/* THV2-03 — one-shot applied ring pulse in the preset's OWN swatch colour. */
.preset--pulsed::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  border: 2px solid var(--sw);
  opacity: 0;
  pointer-events: none;
  animation: thv2-preset-pulse 700ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}
@keyframes thv2-preset-pulse {
  0% {
    opacity: 0.9;
    transform: scale(0.97);
  }
  100% {
    opacity: 0;
    transform: scale(1.07);
  }
}

/* Palette controls */
.palette-control {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 12px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-background, #e7e8e9);
}
.palette-head {
  display: flex;
  align-items: center;
  gap: 9px;
}
.palette-swatch {
  width: 20px;
  height: 20px;
  border-radius: var(--dz-radius-sm, 4px);
  border: 1px solid color-mix(in oklch, currentColor 12%, transparent);
  flex: none;
  /* THV2-03 — glide between hues instead of snapping. */
  transition: background var(--dz-duration-normal, 250ms);
}
.palette-label {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-foreground, #1b1d1f);
}

.slider {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.slider-cap {
  display: flex;
  justify-content: space-between;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  color: var(--dz-foreground, #1b1d1f);
}
.slider-cap em {
  font-style: normal;
  font-family: var(--dz-font-mono, monospace);
  color: var(--dz-muted-foreground, #585b60);
}

/* Slider with a coloured track (hue/chroma) */
.range {
  width: 100%;
  height: 14px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--track, var(--dz-muted, #d3d4d7));
  cursor: pointer;
  outline-offset: 3px;
}
.range--plain {
  height: 6px;
  accent-color: var(--dz-primary, #0766ee);
  background: var(--dz-muted, #d3d4d7);
}
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: var(--dz-radius-full, 9999px);
  background: #fff;
  border: 2px solid var(--dz-foreground, #1b1d1f);
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.3);
  transition:
    transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    box-shadow var(--dz-duration-fast, 150ms);
}
.range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: var(--dz-radius-full, 9999px);
  background: #fff;
  border: 2px solid var(--dz-foreground, #1b1d1f);
  transition:
    transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    box-shadow var(--dz-duration-fast, 150ms);
}
/* THV2-03 — the thumb answers the hand: grows with a halo in the palette's
   own 500 shade (`--thumb`, bound inline per control) while dragged/focused. */
.range:active::-webkit-slider-thumb,
.range:focus-visible::-webkit-slider-thumb {
  transform: scale(1.25);
  box-shadow: 0 0 0 5px color-mix(in oklch, var(--thumb, var(--dz-primary, #0766ee)) 30%, transparent);
}
.range:active::-moz-range-thumb,
.range:focus-visible::-moz-range-thumb {
  transform: scale(1.25);
  box-shadow: 0 0 0 5px color-mix(in oklch, var(--thumb, var(--dz-primary, #0766ee)) 30%, transparent);
}
.range--plain::-webkit-slider-thumb {
  border-color: var(--dz-primary, #0766ee);
}
.range--plain::-moz-range-thumb {
  border-color: var(--dz-primary, #0766ee);
}

/* Ramp strip */
.ramp {
  position: relative;
  display: flex;
  height: 16px;
  border-radius: var(--dz-radius-sm, 4px);
  overflow: hidden;
  border: 1px solid color-mix(in oklch, currentColor 8%, transparent);
}
.ramp-swatch {
  flex: 1;
}
/* THV2-03 — the change glint: a narrow band sweeping the strip once per
   (debounced) palette change. Transform-only; the `.ramp` clip contains it.
   The white glint matches the existing `oklch()` literal pattern this page
   already uses for tracks and dots (data visualisation, not theme styling). */
.ramp-shimmer {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: 40%;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    transparent,
    oklch(1 0 0 / 0.55) 50%,
    transparent
  );
  transform: translateX(-110%);
  animation: thv2-ramp-shimmer 550ms ease-out forwards;
}
@keyframes thv2-ramp-shimmer {
  to {
    transform: translateX(290%);
  }
}

.advanced {
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  padding: 4px 12px;
  /* THV2-03 — smooth open/close via the modern `::details-content` height
     interpolation (RECORDED CHOICE: progressive enhancement — browsers without
     `interpolate-size`/`::details-content` simply snap, exactly today's
     behaviour; the `<details>` semantics and keyboard toggling are untouched). */
  interpolate-size: allow-keywords;
}
.advanced::details-content {
  block-size: 0;
  overflow-y: clip;
  transition:
    content-visibility var(--dz-duration-normal, 250ms) allow-discrete,
    block-size var(--dz-duration-normal, 250ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}
.advanced[open]::details-content {
  block-size: auto;
}
.advanced > summary {
  cursor: pointer;
  padding: 8px 0;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-foreground, #1b1d1f);
}
.advanced[open] {
  padding-bottom: 12px;
}
.advanced .palette-control {
  margin-top: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-cap {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  color: var(--dz-foreground, #1b1d1f);
}

/* ── Stage ── */
.themes-stage {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

/* Accessibility bar */
.a11y-bar {
  position: relative;
  padding: 16px 18px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #ffffff);
}

/* THV2-05 — one-shot success glow around the bar on the win transition. */
.a11y-won-glow {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  border: 2px solid var(--dz-success, #007146);
  pointer-events: none;
  animation: thv2-won-glow 900ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)) forwards;
}
@keyframes thv2-won-glow {
  0% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}

/* THV2-05 — one-shot badge pop (state flips only; keyed remount replays it). */
.a11y-headline,
.a11y-badge {
  display: inline-flex;
}
.a11y-pop {
  animation: thv2-badge-pop 280ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}
@keyframes thv2-badge-pop {
  0% {
    transform: scale(0.72);
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* THV2-05 — brief ratio tick on value change. */
.a11y-ratio--tick {
  display: inline-block;
  animation: thv2-ratio-tick 320ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}
@keyframes thv2-ratio-tick {
  0% {
    transform: scale(1.16);
    color: var(--dz-foreground, #1b1d1f);
  }
}
.a11y-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.a11y-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.a11y-col-h {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
  margin-bottom: 8px;
}
.a11y-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.a11y-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
  font-size: var(--dz-text-sm, 0.875rem);
}
.a11y-label {
  color: var(--dz-foreground, #1b1d1f);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.a11y-ratio {
  font-family: var(--dz-font-mono, monospace);
  font-size: var(--dz-text-xs, 0.75rem);
  color: var(--dz-muted-foreground, #585b60);
}
.a11y-note {
  margin: 14px 0 0;
  line-height: 1.5;
}

/* Split preview */
.preview-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  /* THV2-04 — the shared depth for the easel rake. */
  perspective: 1400px;
}
.preview-panel {
  position: relative;
  padding: 20px;
  border: 1px solid var(--dz-border, #b5b7bb);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--dz-primary, #0766ee) 8%, transparent), transparent 55%),
    var(--dz-background, #e7e8e9);
  color: var(--dz-foreground, #1b1d1f);
  overflow: hidden;
  transition:
    transform 400ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    box-shadow 400ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

/* THV2-04 — the easel at rest: a barely-open book (outer edges receding).
   `transform-style: flat` on purpose — no preserve-3d planes here; the panels'
   own `overflow: hidden` would flatten them anyway (the AV2-03 trap), and the
   content must stay crisp. Two-column widths only. */
@media (min-width: 1041px) {
  .preview-panel--light {
    transform: rotateY(1.2deg);
    transform-style: flat;
  }
  .preview-panel--dark {
    transform: rotateY(-1.2deg);
    transform-style: flat;
  }
}

/* Interaction always lands on a flat surface: hover AND focus-within flatten
   the rake and lift the panel instead (declared after the media block so it
   wins the equal-specificity contest at every width). */
.preview-panel:hover,
.preview-panel:focus-within {
  transform: translateY(-2px);
  box-shadow: var(--dz-shadow-md, 0 6px 16px rgb(0 0 0 / 0.08));
}

/* Both motion gates still the rake and the lift entirely. */
.thv2-still .preview-panel {
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .preview-panel {
    transform: none;
  }
}

/* THV2-04 — the dark panel follows the light one into place. */
.preview-panel--dark.dz-animate-in {
  animation-delay: 120ms;
}

/* THV2-04 — the apply sweep: one soft light band crossing the panel when a
   preset lands. Transform-only; contained by the panel's own clip. Same
   `oklch()` glint pattern as the ramp shimmer. */
.panel-sweep {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: 45%;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    transparent,
    oklch(1 0 0 / 0.22) 50%,
    transparent
  );
  transform: translateX(-120%);
  animation: thv2-panel-sweep 700ms ease-out forwards;
}
@keyframes thv2-panel-sweep {
  to {
    transform: translateX(290%);
  }
}
.preview-panel-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 16px;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}
.pp-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--dz-radius-full, 9999px);
  border: 1px solid var(--dz-border, #b5b7bb);
  /* THV2-04 — the chrome wears the mix: a live primary ring (resolves through
     each panel's own scoped vars, so it re-tints as the visitor edits). */
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--dz-primary, #0766ee) 35%, transparent);
}
.pp-dot--light {
  background: oklch(1 0 0);
}
.pp-dot--dark {
  background: oklch(0.15 0 0);
}

/* Export */
.export {
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #ffffff);
  overflow: hidden;
}
.export-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 16px;
  border-bottom: 1px solid var(--lp-hairline);
}
.export-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
/* `--dz-danger-muted-foreground`, never `--dz-danger`: the intent token is a
   fill/border colour and fails WCAG AA as text on this surface (CLAUDE.md §1b,
   enforced by `yarn validate:tokens`). */
.export-error {
  margin: 0;
  padding: 10px 16px;
  background: var(--dz-danger-muted, #ffddd9);
  color: var(--dz-danger-muted-foreground, #88000e);
  font-size: var(--dz-text-xs, 0.75rem);
  line-height: 1.6;
}

.export-code {
  margin: 0;
  padding: 16px;
  max-height: 320px;
  overflow: auto;
  background: var(--dz-codeblock-bg, #1b1d1f);
  color: var(--dz-codeblock-text, #e7e8e9);
  font-family: var(--dz-font-mono, monospace);
  font-size: var(--dz-text-xs, 0.75rem);
  line-height: 1.65;
}

.recipe-json {
  padding: 0 16px 16px;
  color: var(--dz-muted-foreground, #585b60);
  font-size: var(--dz-text-xs, 0.75rem);
}

.recipe-json summary {
  width: fit-content;
  cursor: pointer;
  font-weight: 600;
}

.recipe-json pre {
  max-height: 320px;
  overflow: auto;
  white-space: pre-wrap;
}

@media (max-width: 1040px) {
  .themes-workspace {
    grid-template-columns: 1fr;
  }
  .themes-controls {
    position: static;
    max-height: none;
  }
}

@media (max-width: 720px) {
  .preview-split,
  .a11y-cols {
    grid-template-columns: 1fr;
  }
}
</style>
