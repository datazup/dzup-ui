<script setup lang="ts">
/**
 * BlockDetailPage (/blocks/:id) — the indexable, shareable page for a SINGLE
 * block (docs/blocks.md §3.5, §1.2 #7, Task I4). Unlike the chrome-free
 * /blocks/preview/:id render (the iframe / OG source), this page wears the full
 * site chrome and is meant to be crawled and linked:
 *
 *   • an H1 + eyebrow + one-line "what it is / when to use it" intro,
 *   • the dependency manifest at a glance (BlockManifest — import + install +
 *     the "Built from" chips), so the install path is visible above the fold,
 *   • the full interactive BlockPreview (live preview / code / copy / fullscreen),
 *   • prev/next across the catalog + a back-to-gallery link.
 *
 * The per-block <title>/description/OG card + the self-referential canonical are
 * set by the route's `meta.head` resolver (router.ts) — this page only renders.
 * The /blocks index stays the PRIMARY browse surface; the in-page `#<id>` anchors
 * keep working, and this canonical is what crawlers index for the block.
 *
 * The route guard redirects unknown ids to /blocks, so a resolved block is
 * guaranteed here; we still guard defensively for type-safety.
 */
import { DzButton, DzCopyButton, DzHeading, DzText } from '@dzup-ui/core'
import { ArrowLeft, ArrowRight, Zap } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BLOCKS, CATEGORIES, getBlock } from '../blocks/registry.ts'
import { getBlockSource } from '../blocks/sources.ts'
import BlockManifest from '../components/blocks/BlockManifest.vue'
import BlockPreview from '../components/blocks/BlockPreview.vue'
import Section from '../components/Section.vue'
import { openInStackblitz } from '../lib/stackblitz.ts'

const props = defineProps<{ id: string }>()
const router = useRouter()

const block = computed(() => getBlock(props.id))

// Defensive redirect — the route guard normally prevents an unknown id here.
if (!block.value) {
  router.replace('/blocks')
}

/** The block's category metadata, for the eyebrow + intro copy. */
const category = computed(() => CATEGORIES.find(c => c.id === block.value?.category))

/**
 * The category's decorative accent as a `--lp-cat-500` custom property, set on
 * the page wrapper so the BlockManifest / BlockPreview inside inherit the group's
 * hue (chips, links and the preview wash all derive from it) — mirroring how the
 * index panel scopes the accent.
 */
const accentStyle = computed(() =>
  category.value ? { '--lp-cat-500': `var(--dz-colors-${category.value.accent}-500)` } : undefined,
)

/**
 * A short "when to use it" line, derived (never hand-authored per block) from the
 * category + responsive metadata so it can't drift from the catalog.
 */
const whenToUse = computed(() => {
  const label = category.value?.label ?? 'UI'
  const responsive = block.value?.responsive?.mobile
    ? ' It reflows to a single column on narrow viewports.'
    : ''
  return (
    `A ${label.toLowerCase()} block composed entirely from free @dzup-ui/core `
    + `components and design tokens, so it drops in already themed, accessible `
    + `and light/dark-ready.${responsive}`
  )
})

/** Index of the current block within the catalog, for prev/next (wraps around). */
const index = computed(() => BLOCKS.findIndex(b => b.id === props.id))
const prevBlock = computed(() => {
  const i = index.value
  return i < 0 ? undefined : BLOCKS[(i - 1 + BLOCKS.length) % BLOCKS.length]
})
const nextBlock = computed(() => {
  const i = index.value
  return i < 0 ? undefined : BLOCKS[(i + 1) % BLOCKS.length]
})

/**
 * A component chip ("Built from" / reverse-lookup) routes back to the gallery
 * filtered to every block using that component — the index seeds its filter from
 * `?component=` (BlocksIndexPage), so the reverse-lookup works across the page
 * boundary rather than dead-ending on this single-block view.
 */
function showBlocksUsing(name: string): void {
  router.push({ path: '/blocks', query: { component: name } })
}

/**
 * Fork this block into a live StackBlitz project — its exact `?raw` source (the
 * same string the Code tab shows) is injected as `src/App.vue` in the shared
 * Vite + Vue 3 + @dzup-ui/core starter, so a visitor goes from "I like this" to
 * "it runs in my editor" in one click.
 */
function openStackblitz(): void {
  const b = block.value
  if (!b)
    return
  openInStackblitz({
    title: `${b.title} — dzup-ui block`,
    description: b.description,
    files: { 'src/App.vue': getBlockSource(b.path) },
  })
}
</script>

<template>
  <!-- Single root element: rendered inside App.vue's route <Transition>. -->
  <div v-if="block" class="block-detail" :style="accentStyle">
    <!-- Hero intro: the page's single H1, eyebrow + lede + "when to use it". -->
    <Section heading-id="block-detail-title">
      <div class="bd-hero">
        <RouterLink to="/blocks" class="bd-back">
          <ArrowLeft :size="15" aria-hidden="true" />
          <span>All blocks</span>
        </RouterLink>
        <span v-if="category" class="lp-eyebrow">{{ category.label }}</span>
        <DzHeading id="block-detail-title" :level="1" size="3xl" weight="semibold" class="bd-title lp-balance">
          {{ block.title }}
        </DzHeading>
        <DzText size="lg" tone="muted" as="p" class="bd-lede lp-balance">
          {{ block.description }}
        </DzText>
        <DzText size="md" tone="muted" as="p" class="bd-when">
          {{ whenToUse }}
        </DzText>

        <!-- Dependency manifest at a glance: the one import + install command(s)
             + "Built from" chips, so the install path is visible without opening
             the Code tab. Reused verbatim from the catalog (single source). -->
        <BlockManifest :block="block" class="bd-manifest" @select-component="showBlocksUsing" />

        <!-- One-click handoff: fork the block into a live StackBlitz project, or
             copy its exact source. Both reuse the block's `?raw` `source`. -->
        <div class="bd-actions">
          <DzButton
            variant="solid"
            tone="primary"
            size="sm"
            :aria-label="`Open ${block.title} in a live StackBlitz project`"
            @click="openStackblitz"
          >
            <template #prefix>
              <Zap :size="16" aria-hidden="true" />
            </template>
            Open in StackBlitz
          </DzButton>
          <DzCopyButton
            :value="getBlockSource(block.path)"
            variant="outline"
            tone="neutral"
            size="sm"
            label="Copy code"
            copied-label="Copied!"
            :aria-label="`Copy the full source of ${block.title}`"
          />
        </div>
      </div>
    </Section>

    <!-- The full interactive preview (live preview / code / copy / fullscreen). -->
    <Section>
      <BlockPreview :block="block" :heading-level="2" @select-component="showBlocksUsing" />
    </Section>

    <!-- Prev / next across the whole catalog + back to the gallery. -->
    <Section>
      <nav class="bd-pager" aria-label="Block navigation">
        <RouterLink
          v-if="prevBlock"
          class="bd-pager-link is-prev"
          :to="`/blocks/${prevBlock.id}`"
        >
          <ArrowLeft :size="16" aria-hidden="true" />
          <span class="bd-pager-meta">
            <span class="bd-pager-eyebrow">Previous</span>
            <span class="bd-pager-name">{{ prevBlock.title }}</span>
          </span>
        </RouterLink>
        <span v-else />

        <DzButton variant="ghost" tone="neutral" size="sm" @click="router.push('/blocks')">
          Browse all blocks
        </DzButton>

        <RouterLink
          v-if="nextBlock"
          class="bd-pager-link is-next"
          :to="`/blocks/${nextBlock.id}`"
        >
          <span class="bd-pager-meta">
            <span class="bd-pager-eyebrow">Next</span>
            <span class="bd-pager-name">{{ nextBlock.title }}</span>
          </span>
          <ArrowRight :size="16" aria-hidden="true" />
        </RouterLink>
        <span v-else />
      </nav>
    </Section>
  </div>
</template>

<style scoped>
.block-detail {
  display: block;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.bd-hero {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
}

.bd-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #4f46e5)) 62%, var(--dz-foreground, #1a202c));
  text-decoration: none;
}

.bd-back:hover {
  text-decoration: underline;
}

.bd-back:focus-visible {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #4f46e5));
  outline-offset: 2px;
  border-radius: var(--dz-radius-sm, 0.375rem);
}

.bd-title {
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.bd-lede {
  margin: 0;
  max-width: 60ch;
  line-height: 1.6;
}

.bd-when {
  margin: 0;
  max-width: 64ch;
  line-height: 1.65;
}

.bd-manifest {
  margin-top: 10px;
  width: 100%;
  max-width: 640px;
}

.bd-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

/* ── Pager ────────────────────────────────────────────────────── */
.bd-pager {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
}

.bd-pager-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  max-width: 44%;
  padding: 12px 16px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
  color: var(--dz-foreground, #1a202c);
  text-decoration: none;
  transition: border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.bd-pager-link:hover {
  border-color: var(--lp-cat-500, var(--dz-primary, #4f46e5));
}

.bd-pager-link:focus-visible {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #4f46e5));
  outline-offset: 2px;
}

.bd-pager-link.is-next {
  text-align: right;
}

.bd-pager-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.bd-pager-eyebrow {
  font-size: var(--dz-text-xs, 0.75rem);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--dz-muted-foreground, #64748b);
}

.bd-pager-name {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .bd-pager-link {
    transition: none;
  }
}

@media (max-width: 560px) {
  .bd-pager-name {
    display: none;
  }
}
</style>
