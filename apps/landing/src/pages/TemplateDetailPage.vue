<script setup lang="ts">
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
import { DzBadge, DzButton, DzCopyButton, DzSegmented, DzText } from '@dzup-ui/core'
import { ArrowLeft, ArrowRight, ExternalLink, Github, Moon, Sun } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import Section from '../components/Section.vue'
import { componentDocs, LINKS } from '../config.ts'
import { useTheme } from '../composables/useTheme.ts'
import { getTemplate, TEMPLATES } from '../templates/registry.ts'

const props = defineProps<{ slug: string }>()

const template = computed(() => getTemplate(props.slug))

/** Index of the current template within the catalogue, for prev/next. */
const index = computed(() => TEMPLATES.findIndex((t) => t.slug === props.slug))
const prevTemplate = computed(() => {
  const i = index.value
  if (i < 0) return undefined
  return TEMPLATES[(i - 1 + TEMPLATES.length) % TEMPLATES.length]
})
const nextTemplate = computed(() => {
  const i = index.value
  if (i < 0) return undefined
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

// ── Independent preview theme ────────────────────────────────────
// Seed from the marketing page's current theme, then toggle independently.
const { resolved } = useTheme()
const previewTheme = ref<'light' | 'dark'>(resolved.value)
function toggleTheme(): void {
  previewTheme.value = previewTheme.value === 'dark' ? 'light' : 'dark'
}

/** The preview URL — changing the theme reloads the iframe with a new skin. */
const previewSrc = computed(
  () => `/templates/${props.slug}/preview?theme=${previewTheme.value}`,
)

/** GitHub deep-link to the template's source file. */
const sourceHref = computed(() =>
  template.value ? `${LINKS.github}/blob/main/${template.value.source}` : LINKS.github,
)
</script>

<template>
  <Section
    v-if="template"
    eyebrow="Template"
    :title="template.name"
    :lede="template.blurb"
    align="left"
    heading-id="template-detail-title"
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
            variant="outline"
            tone="neutral"
            size="sm"
            :href="sourceHref"
            target="_blank"
            rel="noopener noreferrer"
          >
            <template #prefix><Github :size="16" aria-hidden="true" /></template>
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
      </div>

      <!-- Preview toolbar: device + theme + fullscreen. -->
      <div class="preview-toolbar">
        <DzSegmented
          v-model="device"
          :items="deviceItems"
          size="sm"
          aria-label="Preview device width"
        />
        <div class="preview-toolbar-right">
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
            :href="previewSrc"
            target="_blank"
            rel="noopener noreferrer"
          >
            <template #prefix><ExternalLink :size="16" aria-hidden="true" /></template>
            Open fullscreen
          </DzButton>
        </div>
      </div>

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
  gap: 8px;
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
