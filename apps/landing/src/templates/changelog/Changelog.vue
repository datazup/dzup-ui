<script setup lang="ts">
import type { ChangeType } from './data.ts'
/**
 * Changelog / Release Notes — Content template (docs/templates.md §6.5).
 *
 * A chromeless release feed, distinct from the editorial blog pair: a sticky
 * nav, a header with type-filter chips, and a DzTimeline whose nodes are release
 * cards — each carrying a version DzBadge, a "Latest" marker, a list of changes
 * tagged by type (Added/Improved/Fixed/Removed) and, where useful, a DzCodeBlock
 * snippet. Leans on the `success` tone (an emerald accent exposed as a local
 * `--accent` token) to read in a different colour family than the indigo blog
 * templates. Built only from free `@dzup-ui/core` components, token-styled (no
 * `lp-*`), correct in light + dark from 390px up, and asset-free.
 */
import {
  DzBadge,
  DzButton,
  DzCard,
  DzCodeBlock,
  DzDivider,
  DzHeading,
  DzTag,
  DzText,
  DzTimeline,
  DzTimelineItem,
} from '@dzup-ui/core'
import { GitMerge, Rss } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { CHANGE_TONE, FILTERS, RELEASES } from './data.ts'

const activeFilter = ref<ChangeType | 'All'>('All')

/** Releases narrowed so only changes of the active type remain (drop empties). */
const visibleReleases = computed(() => {
  if (activeFilter.value === 'All')
    return RELEASES
  return RELEASES
    .map(r => ({ ...r, changes: r.changes.filter(c => c.type === activeFilter.value) }))
    .filter(r => r.changes.length > 0)
})
</script>

<template>
  <div class="cl">
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><GitMerge :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>
        <DzButton variant="outline" tone="success" size="sm">
          <template #prefix>
            <Rss :size="15" aria-hidden="true" />
          </template>
          Subscribe
        </DzButton>
      </div>
    </header>

    <main class="wrap">
      <!-- ── Header ───────────────────────────────────────────── -->
      <header class="head">
        <DzTag variant="subtle" tone="success" size="sm">
          Product updates
        </DzTag>
        <DzHeading :level="1" size="3xl" weight="bold" class="head-title">
          Changelog
        </DzHeading>
        <DzText size="lg" tone="muted" as="p" class="head-lede">
          Every shipped improvement to the platform — new features, refinements
          and fixes, newest first.
        </DzText>

        <div class="filters" role="group" aria-label="Filter changes by type">
          <DzTag
            v-for="f in FILTERS"
            :key="f"
            :variant="activeFilter === f ? 'solid' : 'outline'"
            :tone="activeFilter === f ? 'success' : 'neutral'"
            size="md"
            role="button"
            tabindex="0"
            class="filter"
            @click="activeFilter = f"
            @keydown.enter.prevent="activeFilter = f"
            @keydown.space.prevent="activeFilter = f"
          >
            {{ f }}
          </DzTag>
        </div>
      </header>

      <!-- ── Release timeline ─────────────────────────────────── -->
      <DzTimeline v-if="visibleReleases.length" class="timeline">
        <DzTimelineItem
          v-for="release in visibleReleases"
          :key="release.version"
          :tone="release.latest ? 'success' : 'neutral'"
          :status="release.date"
        >
          <DzCard variant="outlined" padding="lg" class="release">
            <div class="release-head">
              <DzBadge variant="solid" tone="success" size="md" class="version">
                {{ release.version }}
              </DzBadge>
              <DzBadge v-if="release.latest" variant="subtle" tone="success" size="sm">
                Latest
              </DzBadge>
              <DzText size="sm" tone="muted" as="span" class="release-date">
                {{ release.date }}
              </DzText>
            </div>

            <DzHeading :level="2" size="lg" weight="semibold" class="release-title">
              {{ release.title }}
            </DzHeading>

            <ul class="changes">
              <li v-for="(change, i) in release.changes" :key="i" class="change">
                <DzTag
                  :tone="CHANGE_TONE[change.type]"
                  variant="subtle"
                  size="sm"
                  class="change-tag"
                >
                  {{ change.type }}
                </DzTag>
                <DzText size="sm" as="span" class="change-text">
                  {{ change.text }}
                </DzText>
              </li>
            </ul>

            <template v-if="release.code">
              <DzDivider class="release-rule" />
              <DzCodeBlock
                :code="release.code"
                :language="release.codeLang"
                :filename="release.codeFile"
                copyable
                class="release-code"
              />
            </template>
          </DzCard>
        </DzTimelineItem>
      </DzTimeline>

      <div v-else class="empty">
        <DzText tone="muted" as="p">
          No “{{ activeFilter }}” changes in this window.
        </DzText>
        <DzButton variant="outline" tone="success" size="sm" @click="activeFilter = 'All'">
          Show all changes
        </DzButton>
      </div>

      <div class="more">
        <DzButton variant="ghost" tone="neutral" size="sm">
          Older releases →
        </DzButton>
      </div>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><GitMerge :size="16" /></span>
        <span class="brand-name">Northwind</span>
      </span>
      <DzText size="sm" tone="muted">
        © 2026 Northwind. Built with @dzup-ui/core.
      </DzText>
    </footer>
  </div>
</template>

<style scoped>
.cl {
  /* Local accent — an emerald/success family distinguishing this page from the
     indigo blog templates, while staying theme-aware. */
  --accent: var(--dz-success, #16a34a);
  --accent-foreground: var(--dz-success-foreground, #fff);
  --accent-soft: color-mix(in oklch, var(--accent) 14%, transparent);

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
.wrap,
.footer {
  max-width: 880px;
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
  background: var(--accent);
  color: var(--accent-foreground);
}

/* ── Header ───────────────────────────────────────────────────── */
.head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding-top: clamp(36px, 5vw, 64px);
  padding-bottom: clamp(20px, 3vw, 32px);
}

.head-title {
  margin: 0;
  font-size: clamp(2rem, 4.6vw, 2.75rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.head-lede {
  margin: 0;
  max-width: 54ch;
  line-height: 1.6;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.filter {
  cursor: pointer;
  user-select: none;
}

/* ── Timeline ─────────────────────────────────────────────────── */
.timeline {
  padding-top: clamp(12px, 2vw, 20px);
  padding-bottom: clamp(24px, 4vw, 40px);
}

.release {
  margin-bottom: 4px;
}

.release-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.version {
  font-family: var(--dz-font-mono);
  letter-spacing: 0.01em;
}

.release-date {
  margin-left: auto;
}

.release-title {
  margin: 0 0 16px;
  line-height: 1.25;
  letter-spacing: -0.015em;
}

.changes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.change-tag {
  flex: none;
  min-width: 72px;
  justify-content: center;
}

.change-text {
  line-height: 1.55;
}

.release-rule {
  margin: 18px 0 16px;
}

.release-code {
  margin: 0;
}

/* ── Empty / more ─────────────────────────────────────────────── */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: clamp(32px, 6vw, 56px) 24px;
  text-align: center;
}

.more {
  display: flex;
  justify-content: center;
  padding-bottom: clamp(32px, 5vw, 56px);
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

@media (max-width: 560px) {
  .release-date {
    margin-left: 0;
    width: 100%;
  }
  .change-tag {
    min-width: 64px;
  }
}
</style>
