<script setup lang="ts">
/**
 * NotFoundPage — the real 404 (TASK-FREE-09). Replaces the old silent
 * catch-all redirect to `/`, which explained nothing: every typo, dead inbound
 * link and removed block landed a visitor on the home page with no message.
 *
 * Says what happened (with a more specific message when the miss was a
 * block/template slug — a removed catalog item and a mistyped URL read
 * differently), offers an inline search over the same unified index the ⌘K
 * palette uses, and links the primary destinations. `noindex` via the route's
 * `meta.head`, so crawlers never index error pages.
 */
import { DzButton, DzHeading, DzSearchInput, DzText } from '@dzup-ui/core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalSearch } from '../composables/useGlobalSearch.ts'
import { LINKS, storybookDocs } from '../config.ts'

const route = useRoute()

/**
 * A more precise explanation when the path targeted a catalog detail page —
 * the slug guards route unknown ids here, and "this block no longer exists"
 * is more useful than a generic "page not found".
 */
const context = computed(() => {
  const path = route.path
  if (path.startsWith('/blocks/')) {
    return {
      what: `There is no block at “${path}”. It may have been renamed or removed from the catalog — or the address has a typo.`,
      cta: { label: 'Browse all blocks', to: '/blocks' },
    }
  }
  if (path.startsWith('/templates/')) {
    return {
      what: `There is no template at “${path}”. It may have been renamed or removed from the catalog — or the address has a typo.`,
      cta: { label: 'Browse all templates', to: '/templates' },
    }
  }
  return {
    what: `The address “${path}” doesn’t match any page on this site — the link may be outdated or mistyped.`,
    cta: { label: 'Go to the home page', to: '/' },
  }
})

// The same unified component/block/template index the ⌘K palette searches.
const search = useGlobalSearch()
const results = computed(() => (search.query.value.trim() === '' ? [] : search.results.value.slice(0, 8)))

/** Where a search result leads (components live in the Storybook app). */
function resultHref(doc: { storyId?: string }): string | undefined {
  return doc.storyId ? storybookDocs(doc.storyId) : undefined
}
function resultTo(doc: { blockId?: string, slug?: string }): string | undefined {
  if (doc.blockId)
    return `/blocks/${doc.blockId}`
  if (doc.slug)
    return `/templates/${doc.slug}`
  return undefined
}
</script>

<template>
  <section class="nf">
    <div class="nf-inner">
      <span class="nf-code" aria-hidden="true">404</span>
      <DzHeading :level="1" size="3xl" weight="semibold" class="nf-title">
        Page not found
      </DzHeading>
      <DzText size="lg" tone="muted" class="nf-what">
        {{ context.what }}
      </DzText>

      <div class="nf-search">
        <DzSearchInput
          v-model="search.query.value"
          placeholder="Search components, blocks and templates…"
          aria-label="Search components, blocks and templates"
        />
        <ul v-if="results.length > 0" class="nf-results" aria-label="Search results">
          <li v-for="doc in results" :key="doc.id">
            <a v-if="resultHref(doc)" :href="resultHref(doc)">
              <span class="nf-result-title">{{ doc.title }}</span>
              <span class="nf-result-meta">{{ doc.meta }}</span>
            </a>
            <router-link v-else-if="resultTo(doc)" :to="resultTo(doc)!">
              <span class="nf-result-title">{{ doc.title }}</span>
              <span class="nf-result-meta">{{ doc.meta }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="nf-actions">
        <DzButton variant="solid" tone="primary" :to="context.cta.to">
          {{ context.cta.label }}
        </DzButton>
        <DzButton variant="outline" tone="neutral" :href="LINKS.components">
          Browse component docs
        </DzButton>
        <DzButton variant="ghost" tone="neutral" to="/blocks">
          Blocks
        </DzButton>
        <DzButton variant="ghost" tone="neutral" to="/templates">
          Templates
        </DzButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.nf {
  padding: clamp(64px, 12vw, 140px) 24px;
}

.nf-inner {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.nf-code {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--dz-primary, #4f46e5);
}

.nf-title {
  margin: 0;
  letter-spacing: -0.025em;
}

.nf-what {
  margin: 0;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.nf-search {
  width: 100%;
  margin-top: 8px;
}

.nf-results {
  list-style: none;
  margin: 8px 0 0;
  padding: 4px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 8px);
  background: var(--dz-surface, #fff);
  display: flex;
  flex-direction: column;
}

.nf-results a {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border-radius: var(--dz-radius-sm, 6px);
  text-decoration: none;
  color: var(--dz-foreground, #1a202c);
}

.nf-results a:hover,
.nf-results a:focus-visible {
  background: var(--dz-muted, #f1f5f9);
}

.nf-result-title {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
}

.nf-result-meta {
  font-size: var(--dz-text-xs, 0.75rem);
  color: var(--dz-muted-foreground, #64748b);
}

.nf-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}
</style>
