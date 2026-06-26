<script setup lang="ts">
/**
 * Docs / Guide — Content template (docs/templates.md §6.5).
 *
 * A chromeless documentation page, distinct from the editorial blog pair: a
 * sticky nav with search, a DzBreadcrumb trail, and a three-column reading shell
 * — a grouped sidebar nav, a prose article with DzAlert callouts and DzCodeBlock
 * samples, and a sticky DzAnchor "On this page" rail — closing with prev/next
 * pager buttons. Leans on the `warning` tone (an amber accent exposed as a local
 * `--accent` token) so it reads in a different colour family than the indigo
 * blog templates. Built only from free `@dzup-ui/core` components, token-styled
 * (no `lp-*`), correct in light + dark from 390px up, and asset-free.
 */
import {
  DzAlert,
  DzAnchor,
  DzBadge,
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzButton,
  DzCodeBlock,
  DzDivider,
  DzHeading,
  DzSearchInput,
  DzText,
} from '@dzup-ui/core'
import { ArrowLeft, ArrowRight, BookText, Info, TriangleAlert } from 'lucide-vue-next'
import { ref } from 'vue'
import { INSTALL_CODE, OVERRIDE_CODE, SIDEBAR, TOC } from './data.ts'

const search = ref('')
</script>

<template>
  <div class="dg">
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><BookText :size="18" /></span>
          <span class="brand-name">Northwind Docs</span>
          <DzBadge variant="subtle" tone="warning" size="sm" class="ver">v2.4</DzBadge>
        </span>
        <div class="nav-tools">
          <DzSearchInput
            v-model="search"
            placeholder="Search docs…"
            size="sm"
            aria-label="Search documentation"
            class="nav-search"
          />
          <DzButton variant="outline" tone="neutral" size="sm">GitHub</DzButton>
        </div>
      </div>
    </header>

    <div class="shell">
      <!-- ── Sidebar nav ──────────────────────────────────────── -->
      <aside class="sidebar" aria-label="Documentation">
        <nav class="side-nav">
          <div v-for="group in SIDEBAR" :key="group.title" class="side-group">
            <DzText size="xs" tone="muted" as="div" class="side-title">{{ group.title }}</DzText>
            <ul class="side-list">
              <li v-for="link in group.links" :key="link.label">
                <a
                  href="#"
                  class="side-link"
                  :class="{ 'side-link--active': link.active }"
                  :aria-current="link.active ? 'page' : undefined"
                  @click.prevent
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- ── Article ──────────────────────────────────────────── -->
      <main class="doc">
        <DzBreadcrumb separator="/" aria-label="Breadcrumb" class="crumbs">
          <DzBreadcrumbItem href="#">Docs</DzBreadcrumbItem>
          <DzBreadcrumbItem href="#">Core concepts</DzBreadcrumbItem>
          <DzBreadcrumbItem current>Theming</DzBreadcrumbItem>
        </DzBreadcrumb>

        <DzHeading :level="1" size="3xl" weight="bold" class="doc-title">Theming</DzHeading>
        <DzText size="lg" tone="muted" as="p" class="doc-lede">
          Every component reads its colours, radii and shadows from named design
          tokens. Re-point the tokens and the whole UI follows — no per-component
          overrides, no forked styles.
        </DzText>

        <DzDivider class="doc-rule" />

        <section id="overview" class="doc-section">
          <DzHeading :level="2" size="xl" weight="semibold" class="h2">Overview</DzHeading>
          <DzText as="p" class="p">
            Theming in this library is a single-layer concern. Components never
            hardcode a value; they reference a semantic token such as
            <code>--dz-primary</code> or <code>--dz-border</code>. Your theme is
            just the set of values those names resolve to.
          </DzText>
          <DzCodeBlock
            :code="INSTALL_CODE"
            language="ts"
            filename="main.ts"
            show-line-numbers
            copyable
            class="code"
          />
        </section>

        <section id="tokens" class="doc-section">
          <DzHeading :level="2" size="xl" weight="semibold" class="h2">How theming works</DzHeading>
          <DzText as="p" class="p">
            Semantic tokens point at primitive scale values; components only ever
            read the semantic layer. That indirection is what makes re-skinning a
            matter of changing values rather than chasing down components.
          </DzText>

          <DzAlert tone="info" variant="subtle" title="Note" :icon="Info" class="callout">
            <DzText size="sm" tone="muted" as="p" class="callout-text">
              Token names are stable API. Treat renaming a semantic token as a
              breaking change for anyone consuming your theme.
            </DzText>
          </DzAlert>
        </section>

        <section id="override" class="doc-section">
          <DzHeading :level="2" size="xl" weight="semibold" class="h2">Overriding tokens</DzHeading>
          <DzText as="p" class="p">
            Override tokens under any selector — <code>:root</code>, a brand
            attribute, or a scoped container. The closest definition wins, so you
            can theme a whole app or a single subtree.
          </DzText>
          <DzCodeBlock
            :code="OVERRIDE_CODE"
            language="css"
            filename="theme.css"
            show-line-numbers
            copyable
            class="code"
          />

          <DzAlert tone="warning" variant="subtle" title="Caution" :icon="TriangleAlert" class="callout">
            <DzText size="sm" tone="muted" as="p" class="callout-text">
              Avoid hardcoding a raw colour to “just this once” patch a component —
              it silently forks your design system and breaks dark mode.
            </DzText>
          </DzAlert>
        </section>

        <section id="dark" class="doc-section">
          <DzHeading :level="2" size="xl" weight="semibold" class="h2">Dark mode</DzHeading>
          <DzText as="p" class="p">
            Dark mode stops being a feature and becomes a side effect: override the
            semantic tokens under <code>[data-theme='dark']</code> and every
            component inherits the new look for free.
          </DzText>
        </section>

        <!-- ── Prev / next ────────────────────────────────────── -->
        <nav class="pager" aria-label="Page navigation">
          <DzButton variant="outline" tone="neutral" size="md" class="pager-btn">
            <template #prefix><ArrowLeft :size="16" aria-hidden="true" /></template>
            Design tokens
          </DzButton>
          <DzButton variant="solid" tone="warning" size="md" class="pager-btn">
            Accessibility
            <template #suffix><ArrowRight :size="16" aria-hidden="true" /></template>
          </DzButton>
        </nav>
      </main>

      <!-- ── On this page ─────────────────────────────────────── -->
      <aside class="toc" aria-label="On this page">
        <DzText size="xs" tone="muted" class="toc-label">On this page</DzText>
        <DzAnchor :items="TOC" :offset-top="80" aria-label="Sections on this page" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.dg {
  /* Local accent — an amber/warning family that sets this page apart from the
     indigo blog templates, while staying theme-aware. */
  --accent: var(--dz-warning, #d97706);
  --accent-foreground: var(--dz-warning-foreground, #fff);
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

.nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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

.ver {
  margin-left: 2px;
}

.nav-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-search {
  width: min(220px, 40vw);
}

/* ── Shell ────────────────────────────────────────────────────── */
.shell {
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(20px, 3vw, 36px) 24px clamp(40px, 6vw, 72px);
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 200px;
  gap: clamp(24px, 4vw, 48px);
  align-items: start;
}

/* ── Sidebar ──────────────────────────────────────────────────── */
.sidebar {
  position: sticky;
  top: 80px;
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.side-title {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--dz-font-semibold);
  margin-bottom: 8px;
}

.side-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.side-link {
  display: block;
  padding: 6px 10px;
  border-radius: var(--dz-radius-md);
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color 0.15s ease, background 0.15s ease;
}

.side-link:hover {
  color: var(--dz-foreground);
  background: var(--dz-muted);
}

.side-link--active {
  color: var(--accent);
  background: var(--accent-soft);
  border-left-color: var(--accent);
  font-weight: var(--dz-font-semibold);
}

/* ── Article ──────────────────────────────────────────────────── */
.doc {
  min-width: 0;
}

.crumbs {
  margin-bottom: 16px;
}

.doc-title {
  margin: 0 0 12px;
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.doc-lede {
  margin: 0;
  line-height: 1.6;
  max-width: 64ch;
}

.doc-rule {
  margin: clamp(20px, 3vw, 32px) 0;
}

.doc-section {
  scroll-margin-top: 80px;
  margin-bottom: clamp(28px, 4vw, 44px);
}

.h2 {
  margin: 0 0 12px;
  letter-spacing: -0.015em;
}

.p {
  margin: 0 0 16px;
  line-height: 1.7;
  font-size: var(--dz-text-base);
  max-width: 64ch;
}

.doc code {
  font-family: var(--dz-font-mono);
  font-size: 0.875em;
  padding: 0.12em 0.4em;
  border-radius: var(--dz-radius-sm);
  background: var(--dz-muted);
  color: var(--accent);
}

.code {
  margin: 4px 0 8px;
}

.callout {
  margin: 16px 0 4px;
}

.callout-text {
  margin: 4px 0 0;
  line-height: 1.55;
}

/* ── Pager ────────────────────────────────────────────────────── */
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: clamp(28px, 4vw, 44px);
  padding-top: clamp(20px, 3vw, 28px);
  border-top: 1px solid var(--dz-border);
}

/* ── On this page ─────────────────────────────────────────────── */
.toc {
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toc-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--dz-font-semibold);
}

@media (max-width: 1040px) {
  .shell {
    grid-template-columns: 200px minmax(0, 1fr);
  }
  .toc {
    display: none;
  }
}

@media (max-width: 720px) {
  .shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: static;
  }
  .side-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px 32px;
  }
  .nav-search {
    width: 140px;
  }
}

@media (max-width: 480px) {
  .pager {
    flex-direction: column;
    align-items: stretch;
  }
  .pager-btn {
    width: 100%;
  }
}
</style>
