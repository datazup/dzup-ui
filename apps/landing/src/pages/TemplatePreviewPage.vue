<script setup lang="ts">
/**
 * Template preview (/templates/:slug/preview) — the CHROMELESS full render that
 * is both the detail page's <iframe> target and the "Open fullscreen" target
 * (docs/templates.md §3, §5). App.vue suppresses the nav/footer for this route,
 * so the template owns the whole viewport.
 *
 * The render is resolved + lazy-loaded from the registry. Three query params
 * (set by the detail page's preview toolbar) re-skin the document independently
 * of the marketing page, each deterministically applied on load:
 *   - `?theme=light|dark` → `data-theme` on <html>,
 *   - `?primary=<palette>` → remaps the primary colour ramp to a decorative
 *     spectrum palette (see previewCustomiser.ts for the token mechanics),
 *   - `?dir=rtl` → `dir` on <html> for an RTL layout check.
 * With no params the template renders in its own native colours/LTR, as today.
 * An unknown slug redirects back to the gallery (the route guard already does
 * this; this is a defensive fallback if the page is reached another way).
 *
 * The template bundle is code-split per slug, so it lazy-loads on first paint.
 * `<Suspense>` shows a centered DzSpinner while that bundle resolves, then swaps
 * in the rendered template — the frame is never a blank white box mid-load.
 */
import { DzSpinner } from '@dzup-ui/core'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { lazyComponent } from '../lib/lazyComponent.ts'
import { applyDir, applyPrimaryPalette, isPreviewPalette } from '../templates/previewCustomiser.ts'
import { getTemplate } from '../templates/registry.ts'

const props = defineProps<{ slug: string }>()
const route = useRoute()
const router = useRouter()

const template = computed(() => getTemplate(props.slug))

// Defensive fallback — the route guard normally sends an unknown slug to the
// 404 page before this component mounts; mirror it for any other entry path.
if (!template.value) {
  void router.replace({ name: 'not-found', params: { pathMatch: route.path.slice(1).split('/') } })
}

/**
 * The chromeless template component, code-split per slug. `lazyComponent`
 *  supplies the loading / error / timeout states, so a failed chunk shows a
 *  retry action instead of a blank frame (TASK-FREE-09).
 */
const TemplateComponent = template.value ? lazyComponent(template.value.load) : null

/** Apply a `light`/`dark` theme to the document; ignore anything else. */
function applyTheme(theme: unknown): void {
  if (typeof document === 'undefined')
    return
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

/** Read all three customisation params off the query and apply them together. */
function applyCustomisation(): void {
  applyTheme(route.query.theme)
  applyPrimaryPalette(isPreviewPalette(route.query.primary) ? route.query.primary : null)
  applyDir(route.query.dir)
}

// Honour the initial query params and any later change. The parent updates the
// iframe `src` (which reloads this document and re-runs setup), but watching
// also keeps in-SPA navigations correct.
applyCustomisation()
watch(
  () => [route.query.theme, route.query.primary, route.query.dir],
  applyCustomisation,
)
</script>

<template>
  <div class="preview-root">
    <Suspense v-if="TemplateComponent">
      <component :is="TemplateComponent" />
      <template #fallback>
        <div class="preview-loading">
          <DzSpinner size="lg" tone="primary" label="Loading template preview…" />
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
.preview-root {
  min-height: 100vh;
  background: var(--dz-background, #e7e8e9);
}

/* Centered loading state shown while the per-slug template bundle resolves. */
.preview-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
