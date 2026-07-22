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
import { DzButton, DzCopyButton, DzHeading, DzText, DzVisuallyHidden } from '@dzup-ui/core'
import { ArrowLeft, ArrowRight, Zap } from 'lucide-vue-next'
import { computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { BLOCKS, CATEGORIES, getBlock } from '../blocks/registry.ts'
import { getBlockSource } from '../blocks/sources.ts'
import BlockManifest from '../components/blocks/BlockManifest.vue'
import Section from '../components/Section.vue'
import { openInStackblitz, stackblitzEnabled, UNPUBLISHED_NOTE } from '../lib/stackblitz.ts'

const props = defineProps<{ id: string }>()

/**
 * LazyBlockPreview is loaded asynchronously, not statically (TASK-FREE3-04).
 *
 * It viewport-gates the preview once it is loaded, but a static import still made
 * its chunk a hard dependency of this route: Rollup groups the preview's shared
 * component code into the chunk the wrapper lives in (488 kB raw / 106 kB gzip),
 * and the page could not render a single pixel until it arrived. That was the last
 * big item on this route's critical path — measured mobile LCP 4.33 s at baseline,
 * the worst on the site, against an FCP of roughly 2.5 s.
 *
 * Loading it asynchronously leaves this route's own chunk at 4 kB. The wrapper in
 * the template reserves the preview's height, so arriving late costs no layout shift.
 */
const LazyBlockPreview = defineAsyncComponent(
  () => import('../components/blocks/LazyBlockPreview.vue'),
)

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
/**
 * Whether the StackBlitz fork can install its `@dzup-ui/*` deps yet. Read once
 * at setup — it's a build-time flag, not reactive state. While it's false the
 * button is replaced by {@link UNPUBLISHED_NOTE}, so the page never offers a
 * one-click flow that dies on `npm install` (TASK-FREE3-03).
 */
const canFork = stackblitzEnabled()

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
            v-if="canFork"
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
        <!-- Honest stand-in for the fork button while @dzup-ui/* is unpublished
             — the same standard the npm badges and live stats already hold. -->
        <DzText v-if="!canFork" size="sm" tone="muted" as="p" class="bd-unpublished">
          {{ UNPUBLISHED_NOTE }}
        </DzText>
      </div>
    </Section>

    <!--
      The full interactive preview (live preview / code / copy / fullscreen).

      Viewport-gated, exactly like the /blocks index (TASK-FREE3-04). A direct
      `<BlockPreview>` here made the 112 kB-gzip preview chunk a render-blocking
      dependency of a page whose above-the-fold content is just a heading, an
      intro and the manifest — and, because the preview is the largest element
      on the page, it also *became* the LCP element once it finally painted.
      Mobile LCP for this route was 4.34 s, the worst on the site.

      Gating it hands LCP back to the heading block, which is ready as soon as
      the route chunk parses. The skeleton reserves the preview's height, so the
      swap costs no layout shift (the CLS gate is hard-asserted at 0.1).
    -->
    <Section>
      <!--
        The heading here is real but visually hidden, and it fixes a genuine
        structure bug (TASK-FREE3-04). Block markup hard-codes its own headings at
        level 4 — correct on the /blocks index, which nests h1 page → h2 category →
        h3 preview title → h4 block content. This page has no category tier, so
        rendering the preview title at h2 produced h1 → h2 → h4: a skipped level on
        every block detail page. It went unnoticed because the a11y suite's
        IntersectionObserver stub never fired, so the preview never rendered and
        was never audited.

        Restoring the missing tier as a visually-hidden h2 gives screen readers
        h1 → h2 → h3 → h4 while leaving the page looking exactly as designed.
      -->
      <DzVisuallyHidden as="h2">
        Live preview
      </DzVisuallyHidden>
      <!-- min-height reserves the preview's own skeleton height, so the async
           chunk arriving cannot displace the prev/next nav below it. -->
      <div class="bd-preview-slot">
        <LazyBlockPreview :block="block" :heading-level="3" @select-component="showBlocksUsing" />
      </div>
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

/* Holds the preview's place while its chunk loads (TASK-FREE3-04), so the
   prev/next nav below never jumps. Matches LazyBlockPreview's own skeleton
   height; `min-height` so the real preview is free to be taller. */
.bd-preview-slot {
  min-height: 520px;
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
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 62%, var(--dz-foreground, #1b1d1f));
  text-decoration: none;
}

.bd-back:hover {
  text-decoration: underline;
}

.bd-back:focus-visible {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #0766ee));
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

.bd-unpublished {
  margin: 8px 0 0;
  max-width: 62ch;
  line-height: 1.5;
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
  background: var(--dz-surface, #ffffff);
  color: var(--dz-foreground, #1b1d1f);
  text-decoration: none;
  transition: border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.bd-pager-link:hover {
  border-color: var(--lp-cat-500, var(--dz-primary, #0766ee));
}

.bd-pager-link:focus-visible {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #0766ee));
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
  color: var(--dz-muted-foreground, #585b60);
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
