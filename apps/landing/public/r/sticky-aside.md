# Sticky aside docs layout

A documentation shell where the "On this page" nav pins on scroll via DzAffix — DzContainer sets the measure, DzFlex splits prose from the aside, a DzScrollArea holds a long related list, and the aside lifts onto a surface once pinned.

- **Category:** Layout
- **Components:** DzAffix, DzContainer, DzFlex, DzScrollArea, DzDivider, DzBadge, DzHeading, DzText
- **Preview:** /blocks/sticky-aside

```vue
<script setup lang="ts">
/**
 * Sticky aside — a documentation layout where the table of contents pins on
 * scroll, built on DzAffix.
 *
 * DzContainer constrains the reading measure; DzFlex splits prose from the
 * aside; DzAffix pins the "On this page" nav once it reaches the top of the
 * scroll container (and exposes `affixed` to style the pinned state). A
 * DzScrollArea holds a long "Related" list without growing the column, and
 * DzDivider separates the aside regions. This is the Layout family's take on
 * the classic docs/article shell.
 *
 * Self-contained: local static data, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 *
 * Responsive: the aside drops below the article (and un-pins) on narrow widths.
 */
import {
  DzAffix,
  DzBadge,
  DzContainer,
  DzDivider,
  DzFlex,
  DzHeading,
  DzScrollArea,
  DzText,
} from '@dzup-ui/core'

interface Heading {
  id: string
  label: string
  active?: boolean
}

const toc: Heading[] = [
  { id: 'overview', label: 'Overview', active: true },
  { id: 'install', label: 'Installation' },
  { id: 'tokens', label: 'Design tokens' },
  { id: 'theming', label: 'Theming' },
  { id: 'a11y', label: 'Accessibility' },
]

interface Section {
  id: string
  title: string
  paragraphs: string[]
}

const sections: Section[] = [
  {
    id: 'overview',
    title: 'Overview',
    paragraphs: [
      'The layout primitives exist so you never reach for a one-off flex wrapper again. Container, Grid, Flex, Stack and Spacer cover the structural 90%, and the specialised pieces — Masonry, Resizable, Affix, ScrollArea — handle the rest.',
      'Everything is token-driven, so a page assembled from these blocks re-themes from a single toggle and stays accessible by construction.',
    ],
  },
  {
    id: 'install',
    title: 'Installation',
    paragraphs: [
      'Add the package and import the components you need. Tree-shaking keeps only what you use, and the styles ride along with the design tokens — no separate CSS import to remember.',
    ],
  },
  {
    id: 'tokens',
    title: 'Design tokens',
    paragraphs: [
      'Spacing, radius, color and shadow all resolve from semantic CSS variables. Compose with the scale rather than literal values and your spacing rhythm stays consistent across every surface.',
    ],
  },
  {
    id: 'theming',
    title: 'Theming',
    paragraphs: [
      'Light and dark are two values of the same variables, so layout never needs to know which theme is active. The aside you are reading stays pinned and legible in both.',
    ],
  },
  {
    id: 'a11y',
    title: 'Accessibility',
    paragraphs: [
      'Landmarks, heading order and focus order survive a fully fluid layout. The pinned nav remains keyboard reachable, and the scroll regions expose proper roles.',
    ],
  },
]

const related: string[] = [
  'Grid vs. Flex: when to reach for which',
  'Responsive column objects',
  'Owning the split with Resizable',
  'Masonry and reading order',
  'Spacer and the auto fill trick',
  'Container measures that read well',
]
</script>

<template>
  <section class="sa" aria-labelledby="sa-title">
    <DzContainer max-width="lg" :padding="false">
      <DzFlex direction="row" gap="xl" align="start" class="sa-row">
        <!-- Article -->
        <article class="sa-main">
          <DzBadge variant="subtle" tone="primary" size="sm">
            Guide
          </DzBadge>
          <DzHeading id="sa-title" :level="4" size="xl" weight="bold" class="sa-main-title">
            Building with layout primitives
          </DzHeading>
          <DzText size="sm" tone="muted" class="sa-lede">
            A tour of the structural building blocks and when to use each.
          </DzText>

          <div
            v-for="section in sections"
            :id="section.id"
            :key="section.id"
            class="sa-section"
          >
            <DzHeading :level="5" size="md" weight="semibold" class="sa-section-title">
              {{ section.title }}
            </DzHeading>
            <DzText
              v-for="(p, i) in section.paragraphs"
              :key="i"
              size="sm"
              as="p"
              class="sa-p"
            >
              {{ p }}
            </DzText>
          </div>
        </article>

        <!-- Pinned aside -->
        <aside class="sa-aside">
          <DzAffix :offset-top="16">
            <template #default="{ affixed }">
              <div class="sa-aside-inner" :class="{ 'sa-aside-inner--pinned': affixed }">
                <DzText size="xs" tone="muted" weight="semibold" class="sa-aside-head">
                  ON THIS PAGE
                </DzText>
                <nav aria-label="Table of contents">
                  <ul class="sa-toc" role="list">
                    <li v-for="item in toc" :key="item.id">
                      <a
                        :href="`#${item.id}`"
                        class="sa-toc-link"
                        :class="{ 'sa-toc-link--active': item.active }"
                        :aria-current="item.active ? 'location' : undefined"
                      >{{ item.label }}</a>
                    </li>
                  </ul>
                </nav>

                <DzDivider class="sa-aside-rule" />

                <DzText size="xs" tone="muted" weight="semibold" class="sa-aside-head">
                  RELATED
                </DzText>
                <DzScrollArea class="sa-related">
                  <ul class="sa-related-list" role="list">
                    <li v-for="(link, i) in related" :key="i" class="sa-related-item">
                      <DzText size="sm" as="span">
                        {{ link }}
                      </DzText>
                    </li>
                  </ul>
                </DzScrollArea>
              </div>
            </template>
          </DzAffix>
        </aside>
      </DzFlex>
    </DzContainer>
  </section>
</template>

<style scoped>
.sa {
  background: var(--dz-background, #fff);
  padding: var(--dz-space-2, 0.5rem);
}

.sa-row {
  width: 100%;
}

.sa-main {
  flex: 1;
  min-width: 0;
}

.sa-main-title {
  margin: var(--dz-space-2, 0.5rem) 0 var(--dz-space-1, 0.25rem);
}

.sa-lede {
  margin: 0 0 var(--dz-space-6, 1.5rem);
}

.sa-section {
  padding-bottom: var(--dz-space-6, 1.5rem);
  scroll-margin-top: var(--dz-space-4, 1rem);
}

.sa-section-title {
  margin: 0 0 var(--dz-space-2, 0.5rem);
}

.sa-p {
  margin: 0 0 var(--dz-space-3, 0.75rem);
  line-height: 1.65;
  color: var(--dz-muted-foreground, #4b5563);
}

.sa-aside {
  flex: 0 0 14rem;
}

.sa-aside-inner {
  border: 1px solid transparent;
  border-radius: var(--dz-radius-lg, 0.75rem);
  padding: var(--dz-space-4, 1rem);
  transition: background var(--dz-duration-fast, 150ms) ease, border-color var(--dz-duration-fast, 150ms) ease;
}

/* When pinned, lift the nav onto a subtle surface for separation. */
.sa-aside-inner--pinned {
  background: var(--dz-muted, #f9fafb);
  border-color: var(--dz-border, #e5e7eb);
}

.sa-aside-head {
  display: block;
  letter-spacing: 0.06em;
  margin-bottom: var(--dz-space-2, 0.5rem);
}

.sa-toc {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
}

.sa-toc-link {
  display: block;
  padding: var(--dz-space-1, 0.25rem) var(--dz-space-2, 0.5rem);
  border-radius: var(--dz-radius-sm, 0.25rem);
  border-left: 2px solid transparent;
  color: var(--dz-muted-foreground, #6b7280);
  text-decoration: none;
  font-size: var(--dz-text-sm, 0.875rem);
}

.sa-toc-link:hover {
  color: var(--dz-foreground, #111);
}

.sa-toc-link--active {
  color: var(--dz-primary, #6366f1);
  border-left-color: var(--dz-primary, #6366f1);
  font-weight: 600;
}

.sa-toc-link:focus-visible {
  outline: 2px solid var(--dz-ring, #6366f1);
  outline-offset: 2px;
}

.sa-aside-rule {
  margin: var(--dz-space-4, 1rem) 0;
}

.sa-related {
  height: 7rem;
}

.sa-related-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.sa-related-item {
  color: var(--dz-muted-foreground, #6b7280);
  padding-right: var(--dz-space-3, 0.75rem);
}

/* Stack the aside under the article on narrow viewports. */
@media (max-width: 768px) {
  .sa-row {
    flex-direction: column;
  }

  .sa-aside {
    flex: 1 1 auto;
    width: 100%;
  }
}
</style>
```
