# Table-of-contents aside

A docs layout where a sticky DzAnchor "On this page" nav scrollspy-highlights the section in view beside a column of DzText prose with matching heading ids; collapses to one column on mobile.

- **Category:** Content
- **Components:** DzAnchor, DzText
- **Preview:** /blocks/toc-aside

```vue
<script setup lang="ts">
import type { DzAnchorItem } from '@dzup-ui/core'
/**
 * Table-of-contents aside — a sticky "On this page" nav beside doc content.
 *
 * DzAnchor renders a `<nav>` of in-page links and, via an IntersectionObserver
 * scrollspy, highlights the section currently in view (and smooth-scrolls on
 * click). It sits in a sticky aside next to a column of DzText prose whose
 * headings carry the matching ids. Collapses to a single column on mobile.
 *
 * Self-contained: static content, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { DzAnchor, DzText } from '@dzup-ui/core'

const items: DzAnchorItem[] = [
  { href: '#toc-intro', label: 'Introduction' },
  {
    href: '#toc-install',
    label: 'Installation',
    children: [
      { href: '#toc-package', label: 'Package manager' },
      { href: '#toc-theme', label: 'Theme setup' },
    ],
  },
  { href: '#toc-usage', label: 'Usage' },
  { href: '#toc-theming', label: 'Theming' },
  { href: '#toc-faq', label: 'FAQ' },
]
</script>

<template>
  <section class="ta-wrap">
    <div class="ta-grid">
      <article class="ta-main">
        <header>
          <h4 id="toc-intro" class="ta-h ta-h-lead">
            Introduction
          </h4>
          <DzText as="p" class="ta-p">
            dzup-ui is a token-first Vue 3 component library. This guide walks
            through installing the package, wiring up the theme and rendering your
            first component.
          </DzText>
        </header>

        <h5 id="toc-install" class="ta-h">
          Installation
        </h5>
        <DzText as="p" class="ta-p">
          The library ships as a single package with a peer set of design tokens.
          Add both with your package manager of choice.
        </DzText>

        <h6 id="toc-package" class="ta-sub">
          Package manager
        </h6>
        <DzText as="p" class="ta-p">
          Install <DzText as="strong">
            @dzup-ui/core
          </DzText> alongside the tokens
          package; the bundled types come along automatically.
        </DzText>

        <h6 id="toc-theme" class="ta-sub">
          Theme setup
        </h6>
        <DzText as="p" class="ta-p">
          Import the global theme stylesheet once at your application entry point
          so the <DzText as="strong">
            --dz-*
          </DzText> custom properties are
          available everywhere.
        </DzText>

        <h5 id="toc-usage" class="ta-h">
          Usage
        </h5>
        <DzText as="p" class="ta-p">
          Import components by name and drop them into any template. They arrive
          already themed, accessible and responsive — no per-component setup.
        </DzText>

        <h5 id="toc-theming" class="ta-h">
          Theming
        </h5>
        <DzText as="p" class="ta-p">
          Override tokens on any wrapping element to re-skin everything nested
          inside. Light and dark modes are simply two sets of token values.
        </DzText>

        <h5 id="toc-faq" class="ta-h">
          FAQ
        </h5>
        <DzText as="p" class="ta-p">
          Common questions about browser support, SSR and the upgrade path live
          here, with links out to the full documentation.
        </DzText>
      </article>

      <aside class="ta-aside">
        <div class="ta-aside-inner">
          <DzText size="xs" weight="semibold" tone="muted" as="p" class="ta-aside-title">
            On this page
          </DzText>
          <DzAnchor :items="items" :offset-top="16" aria-label="On this page" />
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.ta-wrap {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.ta-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 14rem;
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: start;
}

.ta-main {
  min-width: 0;
  max-width: 42rem;
}

.ta-h {
  margin: var(--dz-space-6, 1.5rem) 0 var(--dz-space-2, 0.5rem);
  font-size: var(--dz-text-xl, 1.25rem);
  font-weight: var(--dz-font-semibold, 600);
  color: var(--dz-foreground, inherit);
  scroll-margin-top: var(--dz-space-4, 1rem);
}

.ta-h-lead {
  margin-top: 0;
}

.ta-sub {
  margin: var(--dz-space-4, 1rem) 0 var(--dz-space-2, 0.5rem);
  font-size: var(--dz-text-base, 1rem);
  font-weight: var(--dz-font-semibold, 600);
  color: var(--dz-foreground, inherit);
  scroll-margin-top: var(--dz-space-4, 1rem);
}

.ta-p {
  margin: 0 0 var(--dz-space-3, 0.75rem);
  line-height: 1.7;
}

.ta-aside {
  position: sticky;
  top: var(--dz-space-4, 1rem);
}

.ta-aside-inner {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  padding-left: var(--dz-space-4, 1rem);
  border-left: 1px solid var(--dz-border, currentColor);
}

.ta-aside-title {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (max-width: 900px) {
  .ta-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .ta-aside {
    position: static;
    order: -1;
  }

  .ta-aside-inner {
    padding-left: 0;
    border-left: none;
  }
}
</style>
```
