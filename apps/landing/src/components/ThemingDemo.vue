<script setup lang="ts">
import { DzAlert, DzBadge, DzButton, DzInput, DzProgress, DzRating, DzSwitch } from '@dzup-ui/core'
import { Check, Copy } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import Section from './Section.vue'
import { LINKS } from '../config.ts'

// Interactive re-theming (spec §4.5): presets + sliders override --dz-* tokens
// on a scoped preview wrapper, so a cluster of real components updates live.
// "Copy CSS variables" emits the overrides for paste — on-brand with the tokens.
interface Preset { name: string, hue: number, chroma: number }
const presets: Preset[] = [
  { name: 'Indigo', hue: 260, chroma: 0.16 },
  { name: 'Violet', hue: 290, chroma: 0.17 },
  { name: 'Sky', hue: 230, chroma: 0.14 },
  { name: 'Emerald', hue: 155, chroma: 0.15 },
  { name: 'Amber', hue: 75, chroma: 0.15 },
  { name: 'Rose', hue: 15, chroma: 0.16 },
]

const hue = ref(260)
const chroma = ref(0.16)
const radius = ref(0.625)
const activePreset = ref('Indigo')
const copied = ref(false)
const rating = ref(4)
const toggle = ref(true)

function applyPreset(p: Preset): void {
  hue.value = p.hue
  chroma.value = p.chroma
  activePreset.value = p.name
}

function swatch(p: Preset): string {
  return `oklch(0.58 ${p.chroma} ${p.hue})`
}

const primary = computed(() => `oklch(0.58 ${chroma.value} ${hue.value})`)
const primaryHover = computed(() => `oklch(0.52 ${chroma.value} ${hue.value})`)

const previewVars = computed<Record<string, string>>(() => ({
  '--dz-primary': primary.value,
  '--dz-primary-hover': primaryHover.value,
  '--dz-primary-foreground': 'oklch(0.99 0 0)',
  '--dz-primary-muted': `oklch(0.96 ${(chroma.value * 0.25).toFixed(3)} ${hue.value})`,
  '--dz-ring': primary.value,
  '--dz-radius-lg': `${radius.value}rem`,
  '--dz-radius-md': `${(radius.value * 0.75).toFixed(3)}rem`,
  '--dz-radius-sm': `${(radius.value * 0.5).toFixed(3)}rem`,
}))

const cssText = computed(() =>
  `:root {\n${Object.entries(previewVars.value)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}`,
)

async function copyVars(): Promise<void> {
  try {
    await navigator.clipboard.writeText(cssText.value)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 1800)
  }
  catch {
    /* clipboard unavailable */
  }
}
</script>

<template>
  <Section
    eyebrow="Make it yours"
    title="Theme it in seconds"
    lede="Pick a preset or dial in a hue, and watch the components re-skin. Swap tokens, not component code — then copy the CSS variables into your app."
    heading-id="theming-title"
  >
    <div class="theming-grid">
      <div class="controls lp-card">
        <div class="swatches">
          <button
            v-for="p in presets"
            :key="p.name"
            type="button"
            class="swatch"
            :class="{ active: activePreset === p.name }"
            :style="{ '--swatch': swatch(p) }"
            :aria-pressed="activePreset === p.name"
            :aria-label="`Apply ${p.name} theme`"
            @click="applyPreset(p)"
          >
            <span class="swatch-dot" aria-hidden="true" />
            {{ p.name }}
          </button>
        </div>

        <label class="control">
          <span class="control-label">Hue <em>{{ hue }}</em></span>
          <input v-model.number="hue" type="range" min="0" max="360" step="1" class="range" @input="activePreset = ''">
        </label>
        <label class="control">
          <span class="control-label">Chroma <em>{{ chroma.toFixed(2) }}</em></span>
          <input v-model.number="chroma" type="range" min="0" max="0.3" step="0.01" class="range" @input="activePreset = ''">
        </label>
        <label class="control">
          <span class="control-label">Radius <em>{{ radius.toFixed(3) }}rem</em></span>
          <input v-model.number="radius" type="range" min="0" max="1.5" step="0.025" class="range">
        </label>

        <pre class="css-out"><code>{{ cssText }}</code></pre>

        <div class="control-actions">
          <DzButton size="sm" variant="solid" tone="primary" @click="copyVars">
            <template #prefix>
              <Check v-if="copied" :size="15" aria-hidden="true" />
              <Copy v-else :size="15" aria-hidden="true" />
            </template>
            {{ copied ? 'Copied!' : 'Copy CSS variables' }}
          </DzButton>
          <DzButton size="sm" variant="text" tone="primary" as="a" :href="LINKS.designTokens">
            Token guide →
          </DzButton>
        </div>
      </div>

      <div class="preview lp-card" :style="previewVars">
        <div class="preview-cluster">
          <div class="cluster-row">
            <DzButton variant="solid" tone="primary">Primary</DzButton>
            <DzButton variant="outline" tone="primary">Outline</DzButton>
            <DzButton variant="ghost" tone="primary">Ghost</DzButton>
          </div>
          <div class="cluster-row">
            <DzBadge variant="solid" tone="primary">Solid</DzBadge>
            <DzBadge variant="subtle" tone="primary">Subtle</DzBadge>
            <DzBadge variant="outline" tone="primary">Outline</DzBadge>
            <DzSwitch v-model="toggle" aria-label="Preview toggle" />
            <DzRating v-model="rating" :count="5" />
          </div>
          <DzInput placeholder="you@example.com" />
          <DzProgress :value="64" tone="primary" />
          <DzAlert tone="primary" variant="subtle" title="Theming applied">
            These components read your token overrides live.
          </DzAlert>
        </div>
      </div>
    </div>
  </Section>
</template>

<style scoped>
.theming-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: stretch;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
}

.swatches {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.swatch {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-background, #fff);
  color: var(--dz-foreground, #1a202c);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--dz-duration-fast, 150ms), background var(--dz-duration-fast, 150ms);
}

.swatch:hover {
  border-color: color-mix(in oklch, var(--swatch) 50%, var(--lp-hairline));
}

.swatch.active {
  border-color: var(--swatch);
  background: color-mix(in oklch, var(--swatch) 8%, var(--dz-background, #fff));
}

.swatch-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--swatch);
}

.control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  display: flex;
  justify-content: space-between;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
}

.control-label em {
  font-style: normal;
  font-family: var(--dz-font-mono, monospace);
  color: var(--dz-muted-foreground, #64748b);
}

.range {
  width: 100%;
  accent-color: var(--dz-primary, #4f46e5);
}

.css-out {
  margin: 0;
  padding: 16px;
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-colors-primary-900, #1e1b3a);
  color: oklch(0.92 0.03 260);
  font-family: var(--dz-font-mono, monospace);
  font-size: var(--dz-text-xs, 0.75rem);
  line-height: 1.65;
  overflow-x: auto;
}

.control-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preview {
  display: flex;
  align-items: center;
  min-height: 100%;
  padding: clamp(24px, 4vw, 48px);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 9%, transparent), transparent 55%),
    var(--dz-surface, #fff);
}

.preview-cluster {
  max-width: 460px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cluster-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 860px) {
  .theming-grid {
    grid-template-columns: 1fr;
  }
}
</style>
