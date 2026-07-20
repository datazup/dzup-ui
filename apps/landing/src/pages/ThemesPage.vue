<script setup lang="ts">
import type { Shade } from '@dzup-ui/tokens'
import type { DesignerIntent } from '../composables/useThemeDesigner.ts'
import { DzBadge, DzButton, DzHeading, DzSegmented, DzSelect, DzText, DzVisuallyHidden } from '@dzup-ui/core'
import { SHADE_STEPS } from '@dzup-ui/tokens'
import { AlertCircle, Check, Copy, Download, Link2, RotateCcw, Sparkles, Upload } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ThemePreviewCluster from '../components/themes/ThemePreviewCluster.vue'
import {
  AA_NORMAL,
  FONT_CHOICES,
  PRESETS,
  RADIUS_MAX,
  RADIUS_MIN,
  RADIUS_STEP,
  shadeCss,
  SHADOW_MAX,
  SHADOW_MIN,
  SHADOW_STEP,
  srgbToOklch,
  useThemeDesigner,
} from '../composables/useThemeDesigner.ts'

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

// ── Restore a shared design from the URL on first load ──────────────────────
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
  { value: 'comfortable', label: 'Cozy' },
  { value: 'spacious', label: 'Spacious' },
]
const fontItems = FONT_CHOICES.map(f => ({ value: f.key, label: f.label }))

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

// ── Experimental: theme from an image ───────────────────────────────────────
// Fully client-side: sample the uploaded image, find its dominant chromatic hue,
// and drop it onto the primary palette (with a faint matching neutral undertone).
const imageStatus = ref<string>('')

function onImagePick(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-picking the same file
  if (!file)
    return
  imageStatus.value = 'Reading image…'
  const img = new Image()
  const objectUrl = URL.createObjectURL(file)
  img.onload = () => {
    try {
      applyImagePalette(img)
    }
    catch {
      imageStatus.value = 'Could not read that image.'
    }
    finally {
      URL.revokeObjectURL(objectUrl)
    }
  }
  img.onerror = () => {
    imageStatus.value = 'Could not load that image.'
    URL.revokeObjectURL(objectUrl)
  }
  img.src = objectUrl
}

function applyImagePalette(img: HTMLImageElement): void {
  const size = 48
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    imageStatus.value = 'Canvas unavailable in this browser.'
    return
  }
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  // Bucket chromatic pixels by hue (24 bins) and pick the most-represented hue.
  const BINS = 24
  const count = Array.from({ length: BINS }, () => 0)
  const hueSum = Array.from({ length: BINS }, () => 0)
  const chromaSum = Array.from({ length: BINS }, () => 0)
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] ?? 0
    if (alpha < 128)
      continue
    const { lightness, chroma, hue } = srgbToOklch(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0)
    if (chroma < 0.04 || lightness < 0.2 || lightness > 0.9)
      continue // skip near-gray / extremes
    const bin = Math.min(BINS - 1, Math.floor((hue / 360) * BINS))
    count[bin] = (count[bin] ?? 0) + 1
    hueSum[bin] = (hueSum[bin] ?? 0) + hue
    chromaSum[bin] = (chromaSum[bin] ?? 0) + chroma
  }
  let best = -1
  let bestCount = 0
  for (let b = 0; b < BINS; b++) {
    if ((count[b] ?? 0) > bestCount) {
      bestCount = count[b] ?? 0
      best = b
    }
  }
  if (best < 0 || bestCount === 0) {
    imageStatus.value = 'No dominant colour found — try a more colourful image.'
    return
  }
  const n = count[best] ?? 1
  const hue = Math.round((hueSum[best] ?? 0) / n)
  // Clamp chroma into a usable brand range so washed-out or neon photos still
  // yield a workable palette.
  const chroma = Math.min(0.24, Math.max(0.1, (chromaSum[best] ?? 0) / n))
  palettes.primary = { hue, chroma }
  palettes.neutral = { hue, chroma: 0.012 }
  imageStatus.value = `Applied primary from image · hue ${hue}° · chroma ${chroma.toFixed(2)}`
}
</script>

<template>
  <div class="themes-page">
    <!-- Hero -->
    <header class="themes-hero">
      <div class="themes-hero-inner">
        <span class="lp-eyebrow">Themes</span>
        <DzHeading :level="1" size="4xl" weight="bold" class="themes-title lp-balance">
          Theme Designer
        </DzHeading>
        <DzText size="lg" tone="muted" class="themes-lede lp-balance">
          Design a complete theme against a live cluster of real components. Tune the OKLCH token
          palette, watch it re-skin in light and dark at once, verify WCAG contrast as you go, then
          export the <code>--dz-*</code> variables or share a link that reproduces it exactly.
        </DzText>
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
                class="range" :style="{ '--track': HUE_TRACK }"
                :aria-label="`${meta.label} hue`"
              >
            </label>
            <label class="slider">
              <span class="slider-cap">Chroma <em>{{ palettes[meta.intent].chroma.toFixed(3) }}</em></span>
              <input
                v-model.number="palettes[meta.intent].chroma"
                type="range" min="0" max="0.3" step="0.005"
                class="range" :style="{ '--track': chromaTrack(meta.intent) }"
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
                  class="range" :style="{ '--track': HUE_TRACK }"
                  :aria-label="`${meta.label} hue`"
                >
              </label>
              <label class="slider">
                <span class="slider-cap">Chroma <em>{{ palettes[meta.intent].chroma.toFixed(3) }}</em></span>
                <input
                  v-model.number="palettes[meta.intent].chroma"
                  type="range" min="0" max="0.3" step="0.005"
                  class="range" :style="{ '--track': chromaTrack(meta.intent) }"
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

        <!-- Experimental: from image -->
        <section class="control-group">
          <h2 class="control-h">
            From image
            <DzBadge variant="subtle" tone="warning" size="sm">
              Experimental
            </DzBadge>
          </h2>
          <DzText size="sm" tone="muted">
            Derive a primary hue from an image's dominant colour — client-side, nothing uploaded.
          </DzText>
          <label class="upload">
            <Upload :size="15" aria-hidden="true" />
            <span>Choose image…</span>
            <input type="file" accept="image/*" class="upload-input" @change="onImagePick">
          </label>
          <DzText v-if="imageStatus" size="xs" tone="muted">
            {{ imageStatus }}
          </DzText>
        </section>
      </aside>

      <!-- ── Preview + a11y + export ── -->
      <div class="themes-stage">
        <!-- Contrast readout -->
        <section class="a11y-bar" aria-label="Contrast check">
          <div class="a11y-head">
            <Sparkles :size="16" aria-hidden="true" />
            <DzText weight="semibold" as="span">
              Accessibility
            </DzText>
            <DzBadge
              :variant="failingCount === 0 ? 'subtle' : 'solid'"
              :tone="failingCount === 0 ? 'success' : 'danger'"
              size="sm"
            >
              {{ failingCount === 0 ? 'All pairs pass AA' : `${failingCount} below AA` }}
            </DzBadge>
          </div>
          <div class="a11y-cols">
            <div v-for="col in [{ label: 'Light', pairs: contrastLight }, { label: 'Dark', pairs: contrastDark }]" :key="col.label" class="a11y-col">
              <div class="a11y-col-h">
                {{ col.label }}
              </div>
              <ul class="a11y-list">
                <li v-for="pair in col.pairs" :key="pair.label" class="a11y-item">
                  <span class="a11y-label">{{ pair.label }}</span>
                  <span class="a11y-ratio">{{ pair.ratio.toFixed(2) }}:1</span>
                  <DzBadge
                    :variant="pair.passNormal ? 'subtle' : 'solid'"
                    :tone="pair.passNormal ? 'success' : pair.passLarge ? 'warning' : 'danger'"
                    size="sm"
                  >
                    {{ pair.passNormal ? 'AA' : pair.passLarge ? 'AA Large' : 'Fail' }}
                  </DzBadge>
                </li>
              </ul>
            </div>
          </div>
          <DzText size="xs" tone="muted" class="a11y-note">
            Contrast is computed in OKLCH against the resolved semantic pairs (AA = {{ AA_NORMAL }}:1
            for normal text). Solid swatches flag a failing pair.
          </DzText>
        </section>

        <!-- Split light/dark preview -->
        <div class="preview-split">
          <div class="preview-panel" data-theme="light" :style="lightVars">
            <div class="preview-panel-label">
              <span class="pp-dot pp-dot--light" aria-hidden="true" /> Light
            </div>
            <ThemePreviewCluster />
          </div>
          <div class="preview-panel" data-theme="dark" :style="darkVars">
            <div class="preview-panel-label">
              <span class="pp-dot pp-dot--dark" aria-hidden="true" /> Dark
            </div>
            <ThemePreviewCluster />
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
          <pre class="export-code"><code>{{ cssText }}</code></pre>
        </section>
      </div>
    </div>

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

<style scoped>
.themes-page {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: clamp(28px, 5vw, 56px) 24px 80px;
}

/* ── Hero ── */
.themes-hero {
  margin-bottom: 32px;
}
.themes-hero-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 760px;
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
  transition: border-color var(--dz-duration-fast, 150ms), background var(--dz-duration-fast, 150ms);
}
.preset:hover {
  border-color: color-mix(in oklch, var(--sw) 55%, var(--lp-hairline));
  background: color-mix(in oklch, var(--sw) 7%, var(--dz-background, #e7e8e9));
}
.preset-dot {
  width: 13px;
  height: 13px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--sw);
  flex: none;
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
}
.range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: var(--dz-radius-full, 9999px);
  background: #fff;
  border: 2px solid var(--dz-foreground, #1b1d1f);
}
.range--plain::-webkit-slider-thumb {
  border-color: var(--dz-primary, #0766ee);
}
.range--plain::-moz-range-thumb {
  border-color: var(--dz-primary, #0766ee);
}

/* Ramp strip */
.ramp {
  display: flex;
  height: 16px;
  border-radius: var(--dz-radius-sm, 4px);
  overflow: hidden;
  border: 1px solid color-mix(in oklch, currentColor 8%, transparent);
}
.ramp-swatch {
  flex: 1;
}

.advanced {
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  padding: 4px 12px;
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

.upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px dashed var(--dz-border, #b5b7bb);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-background, #e7e8e9);
  color: var(--dz-foreground, #1b1d1f);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--dz-duration-fast, 150ms);
}
.upload:hover {
  border-color: var(--dz-primary, #0766ee);
}
.upload-input {
  display: none;
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
  padding: 16px 18px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #ffffff);
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
