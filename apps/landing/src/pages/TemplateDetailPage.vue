<script setup lang="ts">
import type { TemplateRawFile } from '../templates/rawSources.ts'
/**
 * Template detail / preview surface (/templates/:slug) — the conversion page
 * (docs/templates.md §5). It frames a single LIVE preview of the template:
 *
 *  - a DzSegmented device switcher (mobile 390 / tablet 768 / desktop 100%) that
 *    reflows the <iframe> width (animated, but stilled under reduced-motion),
 *  - an independent light/dark toggle that re-skins ONLY the preview by driving
 *    its `?theme=` query param,
 *  - an "Open fullscreen" link to the chromeless render in a new tab,
 *  - "Built with" badges deep-linking each component to its Storybook docs,
 *  - a "View source" button + DzCopyButton for the source path,
 *  - prev/next navigation across the catalogue.
 *
 * The route guard redirects unknown slugs to /templates, so a resolved template
 * is guaranteed here; we still guard defensively for type-safety.
 */
import {
  DzBadge,
  DzButton,
  DzCodeBlock,
  DzCopyButton,
  DzSegmented,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
} from '@dzup-ui/core'
import { ArrowLeft, ArrowRight, ExternalLink, Github, Moon, RotateCcw, Sun, Zap } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import Section from '../components/Section.vue'
import { useTheme } from '../composables/useTheme.ts'
import { componentDocs, LINKS } from '../config.ts'
import { openInStackblitz, stackblitzEnabled, UNPUBLISHED_NOTE } from '../lib/stackblitz.ts'
import { paletteSwatchColor, PREVIEW_PALETTES } from '../templates/previewCustomiser.ts'
import { resolveTemplateSources } from '../templates/rawSources.ts'
import { getTemplate, TEMPLATES } from '../templates/registry.ts'

const props = defineProps<{ slug: string }>()

const template = computed(() => getTemplate(props.slug))

/** Index of the current template within the catalogue, for prev/next. */
const index = computed(() => TEMPLATES.findIndex(t => t.slug === props.slug))
const prevTemplate = computed(() => {
  const i = index.value
  if (i < 0)
    return undefined
  return TEMPLATES[(i - 1 + TEMPLATES.length) % TEMPLATES.length]
})
const nextTemplate = computed(() => {
  const i = index.value
  if (i < 0)
    return undefined
  return TEMPLATES[(i + 1) % TEMPLATES.length]
})

// ── Device switcher ──────────────────────────────────────────────
// `DzSegmented` models a plain string (ADR-16), so `device` is a string keyed
// into the width map rather than a narrow union.
const device = ref<string>('desktop')
const deviceItems = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'desktop', label: 'Desktop' },
]
/** Rendered iframe width per device; desktop fills the stage. */
const DEVICE_WIDTH: Record<string, string> = {
  mobile: '390px',
  tablet: '768px',
  desktop: '100%',
}
const frameWidth = computed(() => DEVICE_WIDTH[device.value] ?? '100%')

// ── Independent preview customisation (docs/templates.md §2 #9, #10) ──
// The toolbar writes theme / primary-colour / direction onto the iframe's query
// string; the chromeless preview page reads them and re-skins ONLY its own
// document (see previewCustomiser.ts). Changing any param reloads the iframe, so
// each render is deterministic and no in-place transition is needed (which also
// keeps prefers-reduced-motion satisfied for free).

// Seed the theme from the marketing page's current theme, then toggle freely.
const { resolved } = useTheme()
const previewTheme = ref<'light' | 'dark'>(resolved.value)
/** '' = the template's native primary; otherwise a decorative palette key. */
const previewPrimary = ref<string>('')
const previewDir = ref<'ltr' | 'rtl'>('ltr')

/** Live-region text announcing each customisation change to assistive tech. */
const announcement = ref('')

/** The swatch row: a "Default" (native) chip plus the curated spectrum. */
const swatches = computed(() => [
  { value: '', label: 'Default', color: 'var(--dz-colors-primary-500)' },
  ...PREVIEW_PALETTES.map(p => ({ ...p, color: paletteSwatchColor(p.value) })),
])

function toggleTheme(): void {
  previewTheme.value = previewTheme.value === 'dark' ? 'light' : 'dark'
  announcement.value = `Preview theme: ${previewTheme.value}.`
}

function setPrimary(palette: string, label: string): void {
  previewPrimary.value = palette
  announcement.value = palette
    ? `Preview primary colour: ${label}.`
    : 'Preview colour reset to the template default.'
}

function toggleDir(): void {
  previewDir.value = previewDir.value === 'rtl' ? 'ltr' : 'rtl'
  announcement.value
    = previewDir.value === 'rtl' ? 'Preview direction: right to left.' : 'Preview direction: left to right.'
}

/** Restore the preview to the template's native theme, colour and direction. */
function resetPreview(): void {
  previewTheme.value = 'light'
  previewPrimary.value = ''
  previewDir.value = 'ltr'
  announcement.value = 'Preview reset to the template\'s defaults.'
}

/**
 * The preview URL. `theme` is always present; `primary`/`dir` are added only
 * when non-default so a pristine preview keeps the template's own colours/LTR.
 * Fullscreen + "Open in new tab" reuse this src, so they preserve every param.
 */
const previewSrc = computed(() => {
  const params = new URLSearchParams({ theme: previewTheme.value })
  if (previewPrimary.value)
    params.set('primary', previewPrimary.value)
  if (previewDir.value === 'rtl')
    params.set('dir', 'rtl')
  return `/templates/${props.slug}/preview?${params.toString()}`
})

/** GitHub deep-link to the template's source file. */
const sourceHref = computed(() =>
  template.value ? `${LINKS.github}/blob/main/${template.value.source}` : LINKS.github,
)

// ── Preview / Code tabs (docs/templates.md §2 #7) ────────────────
// `DzTabs` models a plain string (ADR-16); 'preview' | 'code' in practice.
const tab = ref<string>('preview')

/** Vertical scroll cap for a code block — long files scroll, not overflow. */
const CODE_MAX_HEIGHT = 'min(70vh, 760px)'

/** A resolved source file with its loaded text. */
interface LoadedSource extends TemplateRawFile {
  code: string
}

/** The template's source files (.vue + optional data.ts), text resolved. */
const sources = ref<LoadedSource[]>([])
/** True when no source could be resolved/loaded — render a safe fallback. */
const sourcesError = ref(false)

// Resolve + load the raw source whenever the template changes. The ?raw chunks
// are pulled lazily (one per file), so only the viewed template's source loads.
// A missing entry flips `sourcesError` rather than throwing.
watch(
  () => template.value?.source,
  async (source) => {
    sources.value = []
    sourcesError.value = false
    if (!source)
      return
    const files = resolveTemplateSources(source)
    if (files.length === 0) {
      sourcesError.value = true
      return
    }
    try {
      const loaded = await Promise.all(
        files.map(async file => ({ ...file, code: await file.load() })),
      )
      // Discard if the slug changed while we were loading (avoid a stale swap).
      if (template.value?.source === source)
        sources.value = loaded
    }
    catch {
      sourcesError.value = true
    }
  },
  { immediate: true },
)

/** The full template source (the .vue file) — the "Copy" target. */
const mainSource = computed(() => sources.value[0]?.code ?? '')

/**
 * Fork this template into a live StackBlitz project (docs/templates.md §2). The
 * `.vue` becomes `src/App.vue`; a co-located `data.ts` (which the template imports
 * via `./data.ts`) is injected next to it as `src/data.ts` so the relative import
 * resolves. Disabled until the source has loaded (see `:disabled` below), and
 * hidden entirely until `@dzup-ui/*` is on npm — the fork installs from there,
 * so before publish it would boot straight into a failed `npm install`
 * (TASK-FREE3-03). "Copy code" is unaffected: the source is real today.
 */
/** Build-time publish flag — read once, not reactive. */
const canFork = stackblitzEnabled()

function openStackblitz(): void {
  const t = template.value
  if (!t || !mainSource.value)
    return
  const files: Record<string, string> = { 'src/App.vue': mainSource.value }
  const data = sources.value.find(file => file.filename === 'data.ts')
  if (data)
    files['src/data.ts'] = data.code
  openInStackblitz({
    title: `${t.name} — dzup-ui template`,
    description: t.blurb,
    files,
  })
}

/**
 * A prompt-friendly markdown bundle of the template (docs/templates.md §8): a
 * short "what this is / built with" header, then each source file in a fenced
 * block. A visitor pastes this straight into an AI assistant.
 */
const llmBundle = computed(() => {
  const t = template.value
  if (!t || sources.value.length === 0)
    return ''
  const header
    = `# dzup-ui template: ${t.name}\n\n`
      + `Built with @dzup-ui/core — ${t.stack.join(', ')}.\n`
      + `${t.blurb}\n`
  const blocks = sources.value
    .map((file) => {
      const fence = file.language === 'vue' ? 'vue' : 'ts'
      return `## ${file.filename}\n\n\`\`\`${fence}\n${file.code}\n\`\`\``
    })
    .join('\n\n')
  return `${header}\n${blocks}\n`
})
</script>

<template>
  <Section
    v-if="template"
    eyebrow="Template"
    :title="template.name"
    :lede="template.blurb"
    align="left"
    heading-id="template-detail-title"
    :heading-level="1"
  >
    <div class="detail">
      <!-- Meta strip: built-with chips + source actions. -->
      <div class="detail-meta">
        <div class="built-with">
          <DzText size="sm" tone="muted" weight="medium" as="span" class="built-with-label">
            Built with
          </DzText>
          <ul class="chip-row">
            <li v-for="component in template.stack" :key="component">
              <a
                class="chip"
                :href="componentDocs(component)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <DzBadge variant="outline" tone="neutral" size="sm">{{ component }}</DzBadge>
              </a>
            </li>
          </ul>
        </div>

        <div class="source-actions">
          <DzButton
            v-if="canFork"
            variant="solid"
            tone="primary"
            size="sm"
            :disabled="!mainSource"
            :aria-label="`Open ${template.name} in a live StackBlitz project`"
            @click="openStackblitz"
          >
            <template #prefix>
              <Zap :size="16" aria-hidden="true" />
            </template>
            Open in StackBlitz
          </DzButton>
          <DzCopyButton
            :value="mainSource"
            :disabled="!mainSource"
            variant="outline"
            tone="neutral"
            size="sm"
            label="Copy code"
            copied-label="Copied!"
            :aria-label="`Copy the full source of ${template.name}`"
          />
          <DzButton
            variant="outline"
            tone="neutral"
            size="sm"
            :href="sourceHref"
            target="_blank"
            rel="noopener noreferrer"
          >
            <template #prefix>
              <Github :size="16" aria-hidden="true" />
            </template>
            View source
          </DzButton>
          <DzCopyButton
            :value="template.source"
            variant="outline"
            tone="neutral"
            size="sm"
            label="Copy path"
            copied-label="Copied!"
            :aria-label="`Copy the source path for ${template.name}`"
          />
        </div>
        <!-- Stands in for the fork button while @dzup-ui/* is unpublished. -->
        <DzText v-if="!canFork" size="sm" tone="muted" as="p" class="detail-unpublished">
          {{ UNPUBLISHED_NOTE }}
        </DzText>
      </div>

      <!-- Preview / Code (docs/templates.md §2 #7). -->
      <DzTabs
        v-model="tab"
        variant="enclosed"
        class="detail-tabs"
        aria-label="Template preview and source"
      >
        <DzTabList>
          <DzTabTrigger value="preview">
            Preview
          </DzTabTrigger>
          <DzTabTrigger value="code">
            Code
          </DzTabTrigger>
        </DzTabList>

        <!-- Preview: force-mounted so the iframe (and its device/theme state)
             survives tab switches instead of reloading each time. -->
        <DzTabContent value="preview" force-mount class="tab-panel">
          <!-- Preview toolbar: device + colour/theme/RTL customiser + fullscreen. -->
          <div class="preview-toolbar">
            <DzSegmented
              v-model="device"
              :items="deviceItems"
              size="sm"
              aria-label="Preview device width"
            />
            <div class="preview-toolbar-right">
              <!-- Live primary-colour picker: each swatch re-skins the preview. -->
              <div class="swatch-picker" role="group" aria-label="Preview primary colour">
                <button
                  v-for="swatch in swatches"
                  :key="swatch.value || 'default'"
                  type="button"
                  class="swatch"
                  :class="{ 'is-active': previewPrimary === swatch.value }"
                  :style="{ '--swatch-color': swatch.color }"
                  :aria-pressed="previewPrimary === swatch.value"
                  :aria-label="
                    swatch.value
                      ? `Set preview primary colour to ${swatch.label}`
                      : 'Reset preview primary colour to the template default'
                  "
                  :title="swatch.label"
                  @click="setPrimary(swatch.value, swatch.label)"
                >
                  <span class="sr-only">{{ swatch.label }}</span>
                </button>
              </div>

              <DzButton
                variant="outline"
                tone="neutral"
                size="sm"
                :aria-label="`Switch preview to ${previewTheme === 'dark' ? 'light' : 'dark'} theme`"
                @click="toggleTheme"
              >
                <template #prefix>
                  <Moon v-if="previewTheme === 'light'" :size="16" aria-hidden="true" />
                  <Sun v-else :size="16" aria-hidden="true" />
                </template>
                {{ previewTheme === 'dark' ? 'Dark' : 'Light' }}
              </DzButton>
              <DzButton
                variant="outline"
                tone="neutral"
                size="sm"
                :aria-label="`Switch preview to ${previewDir === 'rtl' ? 'left-to-right' : 'right-to-left'} layout`"
                :aria-pressed="previewDir === 'rtl'"
                @click="toggleDir"
              >
                {{ previewDir === 'rtl' ? 'RTL' : 'LTR' }}
              </DzButton>
              <DzButton
                variant="ghost"
                tone="neutral"
                size="sm"
                aria-label="Reset preview to the template's defaults"
                @click="resetPreview"
              >
                <template #prefix>
                  <RotateCcw :size="16" aria-hidden="true" />
                </template>
                Reset
              </DzButton>
              <DzButton
                variant="outline"
                tone="neutral"
                size="sm"
                :href="previewSrc"
                target="_blank"
                rel="noopener noreferrer"
              >
                <template #prefix>
                  <ExternalLink :size="16" aria-hidden="true" />
                </template>
                Open fullscreen
              </DzButton>
            </div>
          </div>

          <!-- Visually-hidden live region: announces colour/theme/RTL changes. -->
          <p class="sr-only" role="status" aria-live="polite">
            {{ announcement }}
          </p>

          <!-- Live preview stage. -->
          <div class="stage" :data-device="device">
            <iframe
              :src="previewSrc"
              :title="`Live preview of the ${template.name} template`"
              class="preview-frame"
              :style="{ width: frameWidth }"
              loading="lazy"
            />
          </div>
        </DzTabContent>

        <!-- Code: the real, generically-resolved template source. -->
        <DzTabContent value="code" class="tab-panel">
          <div class="code-actions">
            <DzCopyButton
              :value="mainSource"
              :disabled="!mainSource"
              variant="outline"
              tone="neutral"
              size="sm"
              label="Copy"
              copied-label="Copied!"
              :aria-label="`Copy the full source of ${template.name}`"
            />
            <DzCopyButton
              :value="llmBundle"
              :disabled="!llmBundle"
              variant="outline"
              tone="primary"
              size="sm"
              label="Copy for LLM"
              copied-label="Copied!"
              :aria-label="`Copy ${template.name} as a markdown bundle for an AI assistant`"
            />
          </div>

          <p v-if="sourcesError" class="code-note" role="status">
            Source for this template is unavailable — view it on
            <a :href="sourceHref" target="_blank" rel="noopener noreferrer">GitHub</a>.
          </p>
          <p v-else-if="sources.length === 0" class="code-note" role="status">
            Loading source…
          </p>
          <div v-else class="code-stack">
            <DzCodeBlock
              v-for="file in sources"
              :key="file.filename"
              :code="file.code"
              :language="file.language"
              :filename="file.filename"
              :max-height="CODE_MAX_HEIGHT"
              show-line-numbers
              :aria-label="`Source of ${file.filename}`"
            />
          </div>
        </DzTabContent>
      </DzTabs>

      <!-- Prev / next. -->
      <nav class="pager" aria-label="Template navigation">
        <RouterLink
          v-if="prevTemplate"
          class="pager-link is-prev"
          :to="`/templates/${prevTemplate.slug}`"
        >
          <ArrowLeft :size="16" aria-hidden="true" />
          <span class="pager-meta">
            <span class="pager-eyebrow">Previous</span>
            <span class="pager-name">{{ prevTemplate.name }}</span>
          </span>
        </RouterLink>
        <span v-else />

        <RouterLink
          v-if="nextTemplate"
          class="pager-link is-next"
          :to="`/templates/${nextTemplate.slug}`"
        >
          <span class="pager-meta">
            <span class="pager-eyebrow">Next</span>
            <span class="pager-name">{{ nextTemplate.name }}</span>
          </span>
          <ArrowRight :size="16" aria-hidden="true" />
        </RouterLink>
        <span v-else />
      </nav>
    </div>
  </Section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: -32px;
}

/* ── Meta strip ───────────────────────────────────────────────── */
.detail-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.built-with {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.built-with-label {
  flex: none;
}

.chip-row {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  text-decoration: none;
  border-radius: var(--dz-radius-full);
}

.chip:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
}

.source-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-unpublished {
  margin: 8px 0 0;
  max-width: 62ch;
  line-height: 1.5;
}

/* ── Tabs ─────────────────────────────────────────────────────── */
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

/* ── Code tab ─────────────────────────────────────────────────── */
.code-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.code-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-note {
  margin: 0;
  padding: 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-muted);
  color: var(--dz-muted-foreground);
  font-size: var(--dz-text-sm);
}

.code-note a {
  color: var(--dz-primary);
  text-decoration: underline;
}

/* ── Preview toolbar ──────────────────────────────────────────── */
.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-toolbar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* ── Primary-colour swatch picker ─────────────────────────────── */
.swatch-picker {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-full);
  background: var(--dz-surface);
}

.swatch {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--dz-radius-full);
  background: var(--swatch-color);
  cursor: pointer;
  /* Subtle ring so very light swatches stay visible on the surface. */
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--dz-foreground) 12%, transparent);
  transition: transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.swatch:hover {
  transform: scale(1.12);
}

.swatch.is-active {
  border-color: var(--dz-foreground);
}

.swatch:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
}

/* Visually-hidden but screen-reader-available (swatch labels + live region). */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .swatch {
    transition: none;
  }
  .swatch:hover {
    transform: none;
  }
}

/* ── Stage + frame ────────────────────────────────────────────── */
.stage {
  display: flex;
  justify-content: center;
  padding: clamp(12px, 2vw, 24px);
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-xl);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-primary) 5%, transparent), transparent 60%),
    var(--dz-muted);
  overflow: hidden;
}

.preview-frame {
  height: min(72vh, 760px);
  max-width: 100%;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-background);
  box-shadow: var(--dz-shadow-lg);
  /* Width animates between device sizes; stilled under reduced motion below. */
  transition: width var(--dz-duration-normal, 280ms) var(--dz-ease-out, ease-out);
}

/* ── Pager ────────────────────────────────────────────────────── */
.pager {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.pager-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-surface);
  color: var(--dz-foreground);
  text-decoration: none;
  transition: border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.pager-link:hover {
  border-color: var(--dz-border-hover);
}

.pager-link:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
}

.pager-link.is-next {
  text-align: right;
}

.pager-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.pager-eyebrow {
  font-size: var(--dz-text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--dz-muted-foreground);
}

.pager-name {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-semibold);
}

@media (prefers-reduced-motion: reduce) {
  .preview-frame {
    transition: none;
  }
}

@media (max-width: 640px) {
  .detail-meta,
  .preview-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .preview-frame {
    height: min(64vh, 620px);
  }
}
</style>
