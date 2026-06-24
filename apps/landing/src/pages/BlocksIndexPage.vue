<script setup lang="ts">
import { computed } from 'vue'
import { DzHeading, DzText } from '@dzup-ui/core'
import Section from '../components/Section.vue'
import BlockCard from '../components/blocks/BlockCard.vue'
import BlockCategoryNav from '../components/blocks/BlockCategoryNav.vue'
import BlockPreview from '../components/blocks/BlockPreview.vue'
import { CATEGORIES, blocksByCategory } from '../blocks/registry.ts'
import type { CategoryMeta } from '../blocks/registry.ts'
import { vReveal } from '../composables/useScrollReveal.ts'

/**
 * /blocks — the Blocks ecosystem index (docs/blocks.md §3.1, §3.2, §4).
 *
 * A hero intro followed by one section per category, every section driven
 * entirely by the block registry: each lists its blocks as cards (which scroll
 * to the matching live preview) above the live previews themselves. Empty
 * categories render nothing, so the page grows automatically as Phase-B authors
 * register blocks — no hardcoded block lists here.
 *
 * Mirrors ComponentGallery (lp-card grid, staggered --reveal-delay) and reuses
 * Section for heading rhythm. Scroll/reveal motion honors prefers-reduced-motion
 * via the shared `.reveal` degrade (tailwind.css) and the global
 * `html { scroll-behavior }` rule (index.html).
 *
 * Each block's live preview is rendered by BlockPreview (Task A4), which owns the
 * tabs / viewport / copy / full-screen chrome and the `#<id>` anchor — the
 * registry data and anchor ids match its props.
 */

interface CategorySection extends CategoryMeta {
  blocks: ReturnType<typeof blocksByCategory>
}

/** Only categories that actually have registered blocks, in browse order. */
const sections = computed<CategorySection[]>(() =>
  CATEGORIES.map((category) => ({ ...category, blocks: blocksByCategory(category.id) })).filter(
    (section) => section.blocks.length > 0,
  ),
)
</script>

<template>
  <!-- Single root element: this page is rendered inside App.vue's <Transition>,
       which can only animate a component with one root node. The category list
       below uses a root-level v-for (a Fragment), so without this wrapper the
       page is a multi-root fragment that the route transition "cannot animate"
       and the view never appears on client-side navigation. -->
  <div class="blocks-page">
    <!-- Hero intro: the page's single H1. -->
    <Section heading-id="blocks-title">
    <div class="blocks-hero">
      <span class="lp-eyebrow">Ecosystem</span>
      <DzHeading id="blocks-title" :level="1" size="3xl" weight="semibold" class="blocks-hero-title lp-balance">
        Blocks
      </DzHeading>
      <DzText size="lg" tone="muted" class="blocks-hero-lede lp-balance">
        Pre-composed UI sections — heroes, pricing, navbars, stat rows, auth cards — built from the same
        @dzup-ui/core components and design tokens. Copy the markup, paste it in, and it drops in already
        themed, accessible, and light/dark-ready.
      </DzText>
    </div>
  </Section>

  <!-- Sticky category nav (only the non-empty categories). -->
  <BlockCategoryNav v-if="sections.length" :categories="sections" />

  <!-- One section per non-empty category, driven by the registry. -->
  <div
    v-for="section in sections"
    :id="section.id"
    :key="section.id"
    class="cat-section"
  >
    <Section :title="section.label" :lede="section.blurb" :heading-id="`blocks-cat-${section.id}`" align="left">
      <!-- Index: a card per block, scrolling to its preview. -->
      <ul class="block-grid">
        <li
          v-for="(block, i) in section.blocks"
          :key="block.id"
          v-reveal="i * 45"
        >
          <BlockCard :block="block" />
        </li>
      </ul>

      <!-- Live previews: each block's full chrome (tabs / viewport / copy). -->
      <div class="block-previews">
        <BlockPreview
          v-for="block in section.blocks"
          :key="block.id"
          :block="block"
          v-reveal
        />
      </div>
    </Section>
    </div>
  </div>
</template>

<style scoped>
.blocks-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.blocks-hero-title {
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.blocks-hero-lede {
  margin: 0;
  max-width: 60ch;
  line-height: 1.65;
}

/* Category anchor: clear the sticky TopNav (64px) + category nav (~52px). */
.cat-section {
  scroll-margin-top: 124px;
}

.block-grid {
  list-style: none;
  margin: 0 0 clamp(40px, 6vw, 72px);
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.block-previews {
  display: flex;
  flex-direction: column;
  gap: clamp(32px, 5vw, 56px);
}

@media (max-width: 900px) {
  .block-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .block-grid {
    grid-template-columns: 1fr;
  }
}
</style>
