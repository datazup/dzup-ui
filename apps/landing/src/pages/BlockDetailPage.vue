<script setup lang="ts">
/**
 * BlockDetailPage (/blocks/:id) — the indexable, shareable page for a SINGLE
 * block (docs/blocks.md §3.5, §1.2 #7, Task I4). Unlike the chrome-free
 * /blocks/preview/:id render (the iframe / OG source), this page wears the full
 * site chrome and is meant to be crawled and linked:
 *
 *   • the full interactive BlockPreview first (live preview / code / copy /
 *     fullscreen), with the block title serving as the page H1,
 *   • unique usage + setup guidance below the preview,
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
import { DzButton, DzHeading, DzText } from '@dzup-ui/core'
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
 * Category-level placement guidance. The block's exact description already
 * appears in the preview header, so the supporting section uses the category
 * blurb rather than repeating the same sentence below the fold.
 */
const whenToUse = computed(() => {
  return category.value?.blurb
    ?? 'A production-ready starting point composed from free @dzup-ui/core components.'
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
    <!-- Preview-first: route context stays compact, then the live block owns the
         first viewport. Its title is the page's single H1. -->
    <Section class="bd-preview-section">
      <div class="bd-context">
        <RouterLink to="/blocks" class="bd-back">
          <ArrowLeft :size="15" aria-hidden="true" />
          <span>All blocks</span>
        </RouterLink>
        <span class="bd-position">{{ index + 1 }} of {{ BLOCKS.length }}</span>
      </div>
      <BlockPreview
        :block="block"
        :heading-level="1"
        :show-code-manifest="false"
        @select-component="showBlocksUsing"
      />
    </Section>

    <!-- Supporting information is deliberately below the working preview. The
         preview already owns title, description, components and source copy; this
         section only adds category context, install commands and the live-editor
         handoff, so no information is duplicated on the page. -->
    <Section surface bordered class="bd-details-section">
      <div class="bd-details">
        <div class="bd-overview">
          <span class="lp-eyebrow">{{ category?.label ?? 'Block' }}</span>
          <DzHeading id="block-detail-usage-title" :level="2" size="xl" weight="semibold" class="bd-section-title">
            Use this block
          </DzHeading>
          <DzText size="md" tone="muted" as="p" class="bd-when">
            {{ whenToUse }}
          </DzText>
          <DzButton
            variant="solid"
            tone="primary"
            size="sm"
            :aria-label="`Open ${block.title} in a live StackBlitz project`"
            class="bd-stackblitz"
            @click="openStackblitz"
          >
            <template #prefix>
              <Zap :size="16" aria-hidden="true" />
            </template>
            Open in StackBlitz
          </DzButton>
        </div>

        <div class="bd-setup">
          <div class="bd-setup-head">
            <DzHeading id="block-detail-setup-title" :level="2" size="md" weight="semibold" class="bd-section-title">
              Add it to your project
            </DzHeading>
            <DzText size="sm" tone="muted" as="p" class="bd-setup-lede">
              Use the registry command, or install the packages and import the components manually.
            </DzText>
          </div>
          <BlockManifest
            :block="block"
            :show-components="false"
            :show-source-copy="false"
            class="bd-manifest"
            @select-component="showBlocksUsing"
          />
        </div>
      </div>

      <!-- Prev / next across the whole catalog + back to the gallery. -->
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

/* ── Preview-first route context ───────────────────────────────── */
.bd-preview-section {
  padding-top: clamp(24px, 4vw, 48px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.bd-context {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-4, 1rem);
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

.bd-position {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  font-variant-numeric: tabular-nums;
}

.bd-details-section {
  padding-top: clamp(40px, 6vw, 64px);
  padding-bottom: clamp(40px, 6vw, 64px);
}

.bd-details {
  display: grid;
  grid-template-columns: minmax(15rem, 0.7fr) minmax(0, 1.5fr);
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
}

.bd-overview,
.bd-setup {
  min-width: 0;
}

.bd-overview {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dz-space-3, 0.75rem);
}

.bd-section-title {
  margin: 0;
}

.bd-when {
  margin: 0;
  max-width: 48ch;
  line-height: 1.6;
}

.bd-stackblitz {
  margin-top: var(--dz-space-2, 0.5rem);
}

.bd-setup {
  padding-inline-start: clamp(24px, 4vw, 48px);
  border-inline-start: 1px solid var(--lp-hairline);
}

.bd-setup-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.bd-setup-lede {
  margin: 0;
  max-width: 62ch;
  line-height: 1.5;
}

/* Import spans the width; package and registry commands sit side by side. */
.bd-manifest {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--dz-space-5, 1.25rem);
}

.bd-manifest :deep(.bm-group:first-child) {
  grid-column: 1 / -1;
}

/* ── Pager ────────────────────────────────────────────────────── */
.bd-pager {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-top: clamp(32px, 5vw, 56px);
  padding-top: var(--dz-space-5, 1.25rem);
  border-top: 1px solid var(--lp-hairline);
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
  .bd-preview-section {
    padding-inline: var(--dz-space-4, 1rem);
  }

  .bd-details {
    grid-template-columns: minmax(0, 1fr);
  }

  .bd-setup {
    padding-inline-start: 0;
    padding-top: var(--dz-space-6, 1.5rem);
    border-inline-start: 0;
    border-top: 1px solid var(--lp-hairline);
  }

  .bd-manifest {
    grid-template-columns: minmax(0, 1fr);
  }

  .bd-manifest :deep(.bm-group:first-child) {
    grid-column: auto;
  }

  .bd-pager-name {
    display: none;
  }
}
</style>
