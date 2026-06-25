<script setup lang="ts">
/**
 * Blog Index — Content template (docs/templates.md §6.5).
 *
 * A chromeless magazine landing: sticky nav, a header with a live
 * <DzSearchInput> and DzTag category filters, a featured hero post, a
 * responsive grid of DzImageCard summaries with byline + DzAvatar, and
 * DzPagination. The filter/search narrow the grid client-side over sample
 * posts. Built only from free `@dzup-ui/core` components, token-styled (no
 * `lp-*`), correct in light + dark from 390px up. Cover thumbnails are painted
 * from resolved `--dz-*` tokens, so the page ships no image assets and re-themes.
 */
import {
  DzAvatar,
  DzButton,
  DzHeading,
  DzImageCard,
  DzPagination,
  DzSearchInput,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import { ArrowUpRight, BookOpen, Rss } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { buildCover, CATEGORIES, FEATURED, POSTS } from './data.ts'
import type { Post } from './data.ts'

/** Resolve a `--dz-*` token to its computed value, with a neutral fallback. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const covers = ref<Record<string, string>>({})

function paint(): void {
  const palette = {
    bg: token('--dz-muted', '#f1f5f9'),
    panel: token('--dz-background', '#ffffff'),
    primary: token('--dz-primary', '#6366f1'),
    line: token('--dz-border', '#e2e8f0'),
  }
  const next: Record<string, string> = { [FEATURED.slug]: buildCover(palette, FEATURED.hue) }
  for (const post of POSTS) next[post.slug] = buildCover(palette, post.hue)
  covers.value = next
}

// Repaint whenever the theme attribute flips so covers track the page
// (the preview detail page toggles `data-theme` on the iframe document).
let observer: MutationObserver | null = null
onMounted(() => {
  paint()
  observer = new MutationObserver(paint)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => observer?.disconnect())

const query = ref('')
const activeCategory = ref('All')

/** Posts narrowed by the active category tag and the search query. */
const visiblePosts = computed<Post[]>(() => {
  const q = query.value.trim().toLowerCase()
  return POSTS.filter((post) => {
    const inCategory = activeCategory.value === 'All' || post.category === activeCategory.value
    const inQuery =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q)
    return inCategory && inQuery
  })
})
</script>

<template>
  <div class="lp">
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><BookOpen :size="18" /></span>
          <span class="brand-name">Overflow</span>
        </span>
        <DzButton variant="outline" tone="neutral" size="sm">
          <template #prefix><Rss :size="15" aria-hidden="true" /></template>
          Subscribe
        </DzButton>
      </div>
    </header>

    <main>
      <!-- ── Header ───────────────────────────────────────────── -->
      <section class="head">
        <DzTag variant="subtle" tone="primary" size="sm">The Overflow blog</DzTag>
        <DzHeading :level="1" size="3xl" weight="bold" class="head-title">
          Ideas on design systems, in the open
        </DzHeading>
        <DzText size="lg" tone="muted" as="p" class="head-lede">
          Field notes on tokens, theming, accessibility and the craft of shipping
          interfaces that feel inevitable.
        </DzText>

        <div class="toolbar">
          <div class="filters" role="group" aria-label="Filter posts by category">
            <DzTag
              v-for="cat in CATEGORIES"
              :key="cat"
              :variant="activeCategory === cat ? 'solid' : 'outline'"
              :tone="activeCategory === cat ? 'primary' : 'neutral'"
              size="md"
              role="button"
              tabindex="0"
              class="filter"
              @click="activeCategory = cat"
              @keydown.enter.prevent="activeCategory = cat"
              @keydown.space.prevent="activeCategory = cat"
            >
              {{ cat }}
            </DzTag>
          </div>
          <DzSearchInput
            v-model="query"
            placeholder="Search articles"
            clearable
            size="md"
            aria-label="Search articles"
            class="search"
          />
        </div>
      </section>

      <!-- ── Featured ─────────────────────────────────────────── -->
      <section class="featured" aria-label="Featured article">
        <DzImageCard
          :src="covers[FEATURED.slug] ?? ''"
          :alt="`Cover artwork for ${FEATURED.title}`"
          variant="elevated"
          aspect-ratio="16/9"
          loading="eager"
          class="featured-card"
        >
          <div class="featured-body">
            <DzTag variant="subtle" tone="primary" size="sm">{{ FEATURED.category }}</DzTag>
            <DzHeading :level="2" size="2xl" weight="bold" class="featured-title">
              {{ FEATURED.title }}
            </DzHeading>
            <DzText size="lg" tone="muted" as="p" class="featured-excerpt">
              {{ FEATURED.excerpt }}
            </DzText>
            <div class="meta">
              <DzAvatar :fallback="FEATURED.initials" size="sm" />
              <DzText size="sm" weight="medium" as="span">{{ FEATURED.author }}</DzText>
              <span class="dot" aria-hidden="true">·</span>
              <DzText size="sm" tone="muted" as="span">
                {{ FEATURED.date }} · {{ FEATURED.readingTime }}
              </DzText>
            </div>
          </div>
        </DzImageCard>
      </section>

      <!-- ── Post grid ────────────────────────────────────────── -->
      <section class="grid-wrap" aria-label="Latest articles">
        <ul v-if="visiblePosts.length" class="grid">
          <li v-for="post in visiblePosts" :key="post.slug">
            <DzImageCard
              :src="covers[post.slug] ?? ''"
              :alt="`Cover artwork for ${post.title}`"
              variant="outlined"
              aspect-ratio="16/9"
              class="post-card"
            >
              <DzTag variant="subtle" tone="primary" size="sm" class="post-tag">
                {{ post.category }}
              </DzTag>
              <DzHeading :level="3" size="md" weight="semibold" class="post-title">
                {{ post.title }}
              </DzHeading>
              <DzText size="sm" tone="muted" as="p" class="post-excerpt">
                {{ post.excerpt }}
              </DzText>
              <div class="meta post-meta">
                <DzAvatar :fallback="post.initials" size="sm" />
                <DzText size="xs" weight="medium" as="span">{{ post.author }}</DzText>
                <span class="dot" aria-hidden="true">·</span>
                <DzText size="xs" tone="muted" as="span">{{ post.readingTime }}</DzText>
                <span class="post-link" aria-hidden="true">
                  <ArrowUpRight :size="15" />
                </span>
              </div>
            </DzImageCard>
          </li>
        </ul>

        <div v-else class="no-results">
          <DzText tone="muted" as="p">No articles match your search.</DzText>
          <DzButton
            variant="outline"
            size="sm"
            @click="query = ''; activeCategory = 'All'"
          >
            Clear filters
          </DzButton>
        </div>

        <div v-if="visiblePosts.length" class="pager">
          <DzPagination :total="48" :page-size="6" aria-label="Article pages" />
        </div>
      </section>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><BookOpen :size="16" /></span>
        <span class="brand-name">Overflow</span>
      </span>
      <DzText size="sm" tone="muted">© 2026 Overflow Journal. Built with @dzup-ui/core.</DzText>
    </footer>
  </div>
</template>

<style scoped>
.lp {
  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  min-height: 100vh;
}

/* ── Nav ──────────────────────────────────────────────────────── */
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in oklch, var(--dz-background) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--dz-border);
}

.nav-inner,
.head,
.featured,
.grid-wrap,
.footer {
  max-width: 1080px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

/* ── Header ───────────────────────────────────────────────────── */
.head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding-top: clamp(36px, 5vw, 72px);
  padding-bottom: clamp(24px, 4vw, 40px);
}

.head-title {
  margin: 0;
  font-size: clamp(2rem, 4.6vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.head-lede {
  margin: 0;
  max-width: 56ch;
  line-height: 1.6;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  margin-top: 12px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.filter {
  cursor: pointer;
  user-select: none;
}

.search {
  flex: none;
  width: min(260px, 42vw);
}

/* ── Featured ─────────────────────────────────────────────────── */
.featured {
  padding-bottom: clamp(28px, 4vw, 48px);
}

.featured-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding-top: 4px;
}

.featured-title {
  margin: 0;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.featured-excerpt {
  margin: 0;
  max-width: 60ch;
  line-height: 1.6;
}

/* ── Shared byline ────────────────────────────────────────────── */
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.dot {
  color: var(--dz-muted-foreground);
}

/* ── Grid ─────────────────────────────────────────────────────── */
.grid-wrap {
  padding-bottom: clamp(40px, 6vw, 72px);
}

.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.post-card {
  height: 100%;
}

.post-tag {
  margin-bottom: 10px;
}

.post-title {
  margin: 0 0 8px;
  line-height: 1.3;
}

.post-excerpt {
  margin: 0;
  line-height: 1.55;
}

.post-meta {
  margin-top: 14px;
}

.post-link {
  margin-left: auto;
  display: inline-flex;
  color: var(--dz-primary);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: clamp(40px, 8vw, 80px) 24px;
  text-align: center;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: clamp(32px, 5vw, 48px);
}

/* ── Footer ───────────────────────────────────────────────────── */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 28px;
  padding-bottom: 28px;
  border-top: 1px solid var(--dz-border);
}

@media (max-width: 860px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
