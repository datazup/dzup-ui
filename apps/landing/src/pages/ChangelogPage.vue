<script setup lang="ts">
import type { CanonicalTone } from '@dzup-ui/contracts'
import type { Release } from '../generated/releases.ts'
/**
 * ChangelogPage — the on-site release feed (FREE2-10). Dogfoods the shipped
 * changelog template's design (a type-filtered DzTimeline of release cards) but
 * renders inside the real site chrome (App.vue owns the single <main>/<h1>… so
 * this page adds neither) and reads BUILD-DERIVED data: `src/generated/releases.ts`
 * is a committed, drift-guarded projection of CHANGELOG.md + .changeset via the
 * shared `@dzup-ui/tooling` parser — the exact data the Storybook Releases page
 * and the Atom feed use. Nothing here is hand-typed (claims.spec.ts discipline).
 *
 * The changelog is date-grouped (`## 2026-06-27`), so a release card is keyed by
 * its date and lists changes under their section (Added / Changed / Fixed / …).
 */
import {
  DzAlert,
  DzBadge,
  DzButton,
  DzCard,
  DzHeading,
  DzTag,
  DzText,
  DzTimeline,
  DzTimelineItem,
} from '@dzup-ui/core'
import { Rss } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import Section from '../components/Section.vue'
import { LINKS } from '../config.ts'
import { HIGHLIGHTS, PENDING, RELEASES, SECTION_ORDER, TOTAL_RELEASES } from '../generated/releases.ts'

/** The raw feed URL (also advertised via <link rel="alternate"> in index.html). */
const FEED_URL = '/feed.xml'

/** Map a changelog section to its semantic tone (drives its inline DzTag). */
const SECTION_TONE: Record<string, CanonicalTone> = {
  Breaking: 'danger',
  Deprecated: 'warning',
  Removed: 'danger',
  Security: 'info',
  Added: 'success',
  Changed: 'info',
  Fixed: 'warning',
}

function toneFor(section: string): CanonicalTone {
  return SECTION_TONE[section] ?? 'neutral'
}

/** Section names actually present, in canonical order — the filter chip set. */
const presentSections = computed<string[]>(() => {
  const seen = new Set<string>()
  for (const release of RELEASES) {
    for (const section of release.sections)
      seen.add(section.name)
  }
  return SECTION_ORDER.filter(name => seen.has(name))
})

const filters = computed<string[]>(() => ['All', ...presentSections.value])

const activeFilter = ref<string>('All')

/** Releases narrowed so only sections of the active type remain (drop empties). */
const visibleReleases = computed<Release[]>(() => {
  if (activeFilter.value === 'All')
    return RELEASES
  return RELEASES
    .map(release => ({
      ...release,
      sections: release.sections.filter(section => section.name === activeFilter.value),
    }))
    .filter(release => release.sections.length > 0)
})

/** The newest release carries the "Latest" marker. */
const latestDate = computed<string>(() => RELEASES[0]?.date ?? '')

/** A short deprecations/breaking summary, newest source first (capped for scan). */
const shownHighlights = computed(() => HIGHLIGHTS.slice(0, 6))
</script>

<template>
  <div class="changelog-page">
    <Section
      eyebrow="Product updates"
      title="Changelog"
      lede="Every shipped change to dzup-ui — new components, refinements and fixes, newest first. This feed is generated from the repository's changelog, so it never drifts from what actually shipped."
      heading-id="changelog-title"
      align="left"
      :heading-level="1"
    >
      <div class="cl-toolbar">
        <DzButton
          :href="FEED_URL"
          as="a"
          variant="outline"
          tone="primary"
          size="sm"
          aria-label="Subscribe to the changelog via RSS/Atom feed"
        >
          <template #prefix>
            <Rss :size="15" aria-hidden="true" />
          </template>
          Subscribe (RSS)
        </DzButton>
        <DzText size="sm" tone="muted" as="span">
          {{ TOTAL_RELEASES }} releases
        </DzText>
      </div>

      <!-- Deprecations & breaking changes, pulled forward from anywhere in the
           history so they are easy to spot even when buried in an old bullet. -->
      <DzAlert
        v-if="shownHighlights.length"
        variant="subtle"
        tone="warning"
        class="cl-highlights"
        title="Deprecations & breaking changes"
      >
        <ul class="cl-highlight-list">
          <li v-for="(h, i) in shownHighlights" :key="i" class="cl-highlight">
            <DzBadge :tone="h.kind === 'breaking' ? 'danger' : 'warning'" variant="subtle" size="sm">
              {{ h.kind === 'breaking' ? 'Breaking' : 'Deprecated' }}
            </DzBadge>
            <DzText size="sm" as="span">
              {{ h.text }}
            </DzText>
          </li>
        </ul>
      </DzAlert>

      <!-- Coming next: changes staged in .changeset but not yet released. -->
      <DzCard v-if="PENDING.length" variant="outlined" padding="lg" class="cl-pending">
        <DzHeading :level="2" size="md" weight="semibold" class="cl-pending-title">
          Coming next
        </DzHeading>
        <ul class="cl-pending-list">
          <li v-for="(p, i) in PENDING" :key="i" class="cl-pending-item">
            <DzBadge
              :tone="p.level === 'major' ? 'danger' : p.level === 'minor' ? 'info' : 'neutral'"
              variant="subtle"
              size="sm"
            >
              {{ p.level }}
            </DzBadge>
            <DzText size="sm" as="span">
              {{ p.summary }}
            </DzText>
          </li>
        </ul>
      </DzCard>

      <!-- Filter chips: All + one per section type actually present. -->
      <div class="cl-filters" role="group" aria-label="Filter changes by type">
        <DzTag
          v-for="f in filters"
          :key="f"
          :variant="activeFilter === f ? 'solid' : 'outline'"
          :tone="activeFilter === f ? 'primary' : 'neutral'"
          size="md"
          role="button"
          tabindex="0"
          :aria-pressed="activeFilter === f"
          class="cl-filter"
          @click="activeFilter = f"
          @keydown.enter.prevent="activeFilter = f"
          @keydown.space.prevent="activeFilter = f"
        >
          {{ f }}
        </DzTag>
      </div>

      <!-- Release timeline -->
      <DzTimeline v-if="visibleReleases.length" class="cl-timeline">
        <DzTimelineItem
          v-for="release in visibleReleases"
          :id="release.date"
          :key="release.date"
          :tone="release.date === latestDate ? 'success' : 'neutral'"
          :status="release.date"
        >
          <DzCard variant="outlined" padding="lg" class="cl-release">
            <div class="cl-release-head">
              <DzBadge variant="solid" tone="primary" size="md" class="cl-version">
                {{ release.date }}
              </DzBadge>
              <DzBadge v-if="release.date === latestDate" variant="subtle" tone="success" size="sm">
                Latest
              </DzBadge>
              <DzText size="sm" tone="muted" as="span" class="cl-count">
                {{ release.entryCount }} {{ release.entryCount === 1 ? 'change' : 'changes' }}
              </DzText>
            </div>

            <div v-for="section in release.sections" :key="section.name" class="cl-section">
              <DzHeading :level="2" size="sm" weight="semibold" class="cl-section-title">
                {{ section.name }}
              </DzHeading>
              <ul class="cl-changes">
                <li v-for="(entry, i) in section.entries" :key="i" class="cl-change">
                  <DzTag :tone="toneFor(section.name)" variant="subtle" size="sm" class="cl-change-tag">
                    {{ section.name }}
                  </DzTag>
                  <DzText size="sm" as="span" class="cl-change-text">
                    {{ entry.text }}
                    <span v-if="entry.author" class="cl-author">— {{ entry.author }}</span>
                  </DzText>
                </li>
              </ul>
            </div>
          </DzCard>
        </DzTimelineItem>
      </DzTimeline>

      <div v-else class="cl-empty">
        <DzText tone="muted" as="p">
          No “{{ activeFilter }}” changes in this window.
        </DzText>
        <DzButton variant="outline" tone="neutral" size="sm" @click="activeFilter = 'All'">
          Show all changes
        </DzButton>
      </div>

      <div class="cl-more">
        <DzButton :href="LINKS.changelogHistory" as="a" variant="ghost" tone="neutral" size="sm">
          Full history on GitHub →
        </DzButton>
      </div>
    </Section>
  </div>
</template>

<style scoped>
.changelog-page {
  --cl-wrap: 880px;
}

.cl-toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin: 0 auto 8px;
  max-width: var(--cl-wrap);
}

.cl-highlights,
.cl-pending,
.cl-filters,
.cl-timeline,
.cl-empty,
.cl-more {
  max-width: var(--cl-wrap);
  margin-left: auto;
  margin-right: auto;
}

.cl-highlights {
  margin-top: 16px;
}

.cl-highlight-list,
.cl-pending-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cl-highlight,
.cl-pending-item {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.cl-pending {
  margin-top: 16px;
}

.cl-pending-title {
  margin: 0 0 4px;
}

.cl-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;
}

.cl-filter {
  cursor: pointer;
  user-select: none;
}

.cl-timeline {
  padding-top: clamp(16px, 2vw, 24px);
}

.cl-release {
  margin-bottom: 4px;
}

.cl-release-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.cl-version {
  font-family: var(--dz-font-mono);
  letter-spacing: 0.01em;
}

.cl-count {
  margin-left: auto;
}

.cl-section + .cl-section {
  margin-top: 16px;
}

.cl-section-title {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dz-muted-foreground);
}

.cl-changes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cl-change {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.cl-change-tag {
  flex: none;
  min-width: 76px;
  justify-content: center;
}

.cl-change-text {
  line-height: 1.55;
}

.cl-author {
  color: var(--dz-muted-foreground);
}

.cl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: clamp(32px, 6vw, 56px) 24px;
  text-align: center;
}

.cl-more {
  display: flex;
  justify-content: center;
  padding: clamp(20px, 4vw, 40px) 0;
}

@media (max-width: 560px) {
  .cl-count {
    margin-left: 0;
    width: 100%;
  }
  .cl-change-tag {
    min-width: 64px;
  }
}
</style>
