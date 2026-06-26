<script setup lang="ts">
/**
 * Template preview (/templates/:slug/preview) — the CHROMELESS full render that
 * is both the detail page's <iframe> target and the "Open fullscreen" target
 * (docs/templates.md §3, §5). App.vue suppresses the nav/footer for this route,
 * so the template owns the whole viewport.
 *
 * The render is resolved + lazy-loaded from the registry. The `?theme=` query
 * param (set by the detail page's preview toggle) drives `data-theme` on the
 * document so the preview can be re-skinned independently of the marketing page.
 * An unknown slug redirects back to the gallery (the route guard already does
 * this; this is a defensive fallback if the page is reached another way).
 */
import { computed, defineAsyncComponent, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTemplate } from '../templates/registry.ts'

const props = defineProps<{ slug: string }>()
const route = useRoute()
const router = useRouter()

const template = computed(() => getTemplate(props.slug))

// Defensive redirect — the router guard normally prevents an unknown slug here.
if (!template.value) {
  router.replace('/templates')
}

/** The chromeless template component, code-split per slug. */
const TemplateComponent = template.value ? defineAsyncComponent(template.value.load) : null

/** Apply a `light`/`dark` theme to the document; ignore anything else. */
function applyTheme(theme: unknown): void {
  if (typeof document === 'undefined') return
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

// Honour the initial query param and any later change. The parent updates the
// iframe `src` (which reloads this document), but watching also keeps in-SPA
// navigations correct.
applyTheme(route.query.theme)
watch(
  () => route.query.theme,
  (theme) => applyTheme(theme),
)
</script>

<template>
  <div class="preview-root">
    <component :is="TemplateComponent" v-if="TemplateComponent" />
  </div>
</template>

<style scoped>
.preview-root {
  min-height: 100vh;
  background: var(--dz-background, #ffffff);
}
</style>
