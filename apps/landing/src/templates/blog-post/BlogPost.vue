<script setup lang="ts">
/**
 * Blog Post / Article — featured Content reference template (docs/templates.md §6.5).
 *
 * A chromeless long-form article: sticky minimal nav, an article header with a
 * category tag, byline and token-painted cover, a two-column reading layout with
 * a sticky <DzAnchor> table of contents, rich body type (DzHeading, DzText,
 * DzBlockquote, DzCodeBlock, DzDivider, a token-painted figure), an author bio
 * card and a "Continue reading" grid of DzImageCards. Built only from free
 * `@dzup-ui/core` components, token-styled (no `lp-*`), and correct in light +
 * dark from 390px upward. All artwork is painted from resolved `--dz-*` tokens,
 * so the page re-themes with no shipped image assets.
 */
import {
  DzAnchor,
  DzAvatar,
  DzBlockquote,
  DzButton,
  DzCard,
  DzCodeBlock,
  DzDivider,
  DzHeading,
  DzImage,
  DzImageCard,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import { ArrowLeft, ArrowUpRight, BookOpen, Bookmark, Share2 } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { buildCover, buildFigure, RELATED, SAMPLE_CODE, TOC } from './data.ts'

/** Resolve a `--dz-*` token to its computed value, with a neutral fallback. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const coverSrc = ref('')
const figureSrc = ref('')

function paint(): void {
  const palette = {
    bg: token('--dz-muted', '#f1f5f9'),
    panel: token('--dz-background', '#ffffff'),
    primary: token('--dz-primary', '#6366f1'),
    accent: token('--dz-info', '#0ea5e9'),
    line: token('--dz-border', '#e2e8f0'),
  }
  coverSrc.value = buildCover(palette)
  figureSrc.value = buildFigure(palette)
}

// Repaint whenever the theme attribute flips so the artwork tracks the page
// (the preview detail page toggles `data-theme` on the iframe document).
let observer: MutationObserver | null = null
onMounted(() => {
  paint()
  observer = new MutationObserver(paint)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => observer?.disconnect())
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
        <DzButton variant="ghost" tone="neutral" size="sm">
          <template #prefix><ArrowLeft :size="16" aria-hidden="true" /></template>
          All articles
        </DzButton>
      </div>
    </header>

    <main class="article">
      <!-- ── Article header ───────────────────────────────────── -->
      <header class="head">
        <DzTag variant="subtle" tone="primary" size="sm">Engineering</DzTag>
        <DzHeading :level="1" size="3xl" weight="bold" class="title">
          Stop hardcoding colors: design tokens from first principles
        </DzHeading>
        <DzText size="lg" tone="muted" as="p" class="lede">
          A practical tour of why every value in a modern UI — color, radius,
          shadow, type — should resolve through a named token, and how that one
          decision unlocks effortless theming.
        </DzText>

        <div class="byline">
          <DzAvatar fallback="EI" size="md" />
          <div class="byline-meta">
            <DzText weight="semibold" as="span">Esmir Isić</DzText>
            <DzText size="sm" tone="muted" as="span">Jun 25, 2026 · 8 min read</DzText>
          </div>
          <div class="byline-actions">
            <DzButton variant="outline" tone="neutral" size="sm">
              <template #prefix><Bookmark :size="15" aria-hidden="true" /></template>
              Save
            </DzButton>
            <DzButton variant="ghost" tone="neutral" size="sm">
              <template #prefix><Share2 :size="15" aria-hidden="true" /></template>
              Share
            </DzButton>
          </div>
        </div>
      </header>

      <!-- ── Cover ────────────────────────────────────────────── -->
      <figure class="cover">
        <DzImage
          v-if="coverSrc"
          :src="coverSrc"
          alt="Abstract editorial artwork of overlapping component cards and shapes"
          fit="cover"
          aspect-ratio="2 / 1"
          class="cover-img"
        />
      </figure>

      <!-- ── Body + TOC ───────────────────────────────────────── -->
      <div class="layout">
        <article class="prose">
          <section id="intro" class="scroll-section">
            <DzHeading :level="2" size="xl" weight="semibold" class="h2">Why tokens, not hex</DzHeading>
            <DzText as="p" class="p">
              Every raw <code>#6366f1</code> scattered through a codebase is a tiny
              promise you'll have to keep forever. Change the brand blue and you're
              hunting through stylesheets, components and one-off overrides hoping you
              caught them all. Design tokens flip the model: you name the intent once,
              reference the name everywhere, and change the value in a single place.
            </DzText>
            <DzText as="p" class="p">
              The library this article ships with takes a hard line — no raw colors in
              components, ever. Buttons reach for <code>var(--dz-primary)</code>; cards
              reach for <code>var(--dz-border)</code>. The component never knows what
              "primary" actually is, and that's exactly the point.
            </DzText>

            <DzBlockquote cite="ADR-04 · Token-only styling" class="quote">
              A component that hardcodes a color has quietly forked your design
              system. The fix isn't discipline — it's making the right thing the
              only thing the API allows.
            </DzBlockquote>
          </section>

          <DzDivider class="rule" />

          <section id="anatomy" class="scroll-section">
            <DzHeading :level="2" size="xl" weight="semibold" class="h2">The anatomy of a token</DzHeading>
            <DzText as="p" class="p">
              A token is just a named CSS custom property, but the naming is where the
              leverage lives. Primitives describe raw values; semantic tokens describe
              intent and point at primitives. Components only ever touch the semantic
              layer:
            </DzText>
            <ul class="list">
              <li><strong>Primitive</strong> — <code>--dz-blue-600</code>, a fixed scale value.</li>
              <li><strong>Semantic</strong> — <code>--dz-primary</code>, the role, mapped to a primitive.</li>
              <li><strong>Component</strong> — <code>--dz-button-md-height</code>, local anatomy.</li>
            </ul>
            <DzText as="p" class="p">
              Because components only read semantic names, re-skinning is a matter of
              re-pointing those names — the components are none the wiser.
            </DzText>
          </section>

          <figure class="figure">
            <DzImage
              v-if="figureSrc"
              :src="figureSrc"
              alt="The same button rendered with light and dark token values side by side"
              fit="cover"
              aspect-ratio="100 / 46"
              class="figure-img"
            />
            <figcaption class="figure-cap">
              <DzText size="sm" tone="muted">
                One component, two themes — only the token values changed.
              </DzText>
            </figcaption>
          </figure>

          <DzDivider class="rule" />

          <section id="theming" class="scroll-section">
            <DzHeading :level="2" size="xl" weight="semibold" class="h2">Theming in one layer</DzHeading>
            <DzText as="p" class="p">
              Dark mode stops being a feature and becomes a side effect. You override
              the semantic tokens under a <code>[data-theme='dark']</code> selector and
              every component inherits the new look for free — no per-component dark
              variants, no conditional classes, no duplicated styles.
            </DzText>
          </section>

          <section id="code" class="scroll-section">
            <DzHeading :level="2" size="xl" weight="semibold" class="h2">Wiring it up</DzHeading>
            <DzText as="p" class="p">
              Here's the whole idea in a handful of lines. Define the tokens, override
              them for dark, and let components reference the names:
            </DzText>
            <DzCodeBlock
              :code="SAMPLE_CODE"
              language="css"
              filename="tokens.css"
              show-line-numbers
              copyable
              class="code"
            />
          </section>

          <DzDivider class="rule" />

          <section id="closing" class="scroll-section">
            <DzHeading :level="2" size="xl" weight="semibold" class="h2">Where to go next</DzHeading>
            <DzText as="p" class="p">
              Start small: pick one component, replace its hardcoded values with
              tokens, and add a dark override. Once you feel the leverage, rolling it
              across the system is mechanical. Your future self — the one who has to
              re-brand on a Friday afternoon — will thank you.
            </DzText>

            <DzCard variant="outlined" padding="lg" class="bio">
              <div class="bio-row">
                <DzAvatar fallback="EI" size="lg" />
                <div class="bio-meta">
                  <DzText weight="semibold" as="span">Esmir Isić</DzText>
                  <DzText size="sm" tone="muted" as="p" class="bio-text">
                    Design-systems engineer writing about tokens, theming and the
                    unglamorous work that makes interfaces feel inevitable.
                  </DzText>
                </div>
                <DzButton variant="solid" tone="primary" size="sm">Follow</DzButton>
              </div>
            </DzCard>
          </section>
        </article>

        <!-- ── Sticky TOC ─────────────────────────────────────── -->
        <aside class="toc" aria-label="On this page">
          <DzText size="xs" tone="muted" class="toc-label">On this page</DzText>
          <DzAnchor :items="TOC" :offset-top="88" aria-label="Article sections" />
        </aside>
      </div>

      <!-- ── Continue reading ─────────────────────────────────── -->
      <section class="related" aria-label="Continue reading">
        <div class="related-head">
          <DzHeading :level="2" size="lg" weight="semibold">Continue reading</DzHeading>
          <DzText size="sm" tone="muted" as="p">More from the Engineering desk.</DzText>
        </div>
        <ul class="related-grid">
          <li v-for="post in RELATED" :key="post.slug">
            <DzImageCard
              :src="coverSrc"
              :alt="`Cover artwork for ${post.title}`"
              variant="outlined"
              aspect-ratio="16/9"
              class="related-card"
            >
              <DzTag variant="subtle" tone="primary" size="sm" class="related-tag">
                {{ post.category }}
              </DzTag>
              <DzHeading :level="3" size="md" weight="semibold" class="related-title">
                {{ post.title }}
              </DzHeading>
              <span class="related-foot">
                <DzText size="xs" tone="muted">{{ post.readingTime }}</DzText>
                <span class="related-link">
                  Read <ArrowUpRight :size="13" aria-hidden="true" />
                </span>
              </span>
            </DzImageCard>
          </li>
        </ul>
      </section>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><BookOpen :size="16" /></span>
        <span class="brand-name">Overflow</span>
      </span>
      <DzText size="sm" tone="muted">© 2026 Overflow Journal. Written with @dzup-ui/core.</DzText>
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
.article,
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

/* ── Article header ───────────────────────────────────────────── */
.head {
  max-width: 760px;
  margin: 0 auto;
  padding-top: clamp(32px, 5vw, 64px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 4.4vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.lede {
  margin: 0;
  line-height: 1.6;
}

.byline {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.byline-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.byline-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

/* ── Cover ────────────────────────────────────────────────────── */
.cover {
  margin: clamp(28px, 4vw, 48px) 0 0;
}

.cover-img {
  width: 100%;
  border-radius: var(--dz-radius-2xl);
  border: 1px solid var(--dz-border);
  box-shadow: var(--dz-shadow-lg);
  overflow: hidden;
}

/* ── Reading layout ───────────────────────────────────────────── */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
  padding-top: clamp(32px, 5vw, 56px);
}

.prose {
  max-width: 720px;
  min-width: 0;
}

.scroll-section {
  /* Land below the sticky nav when jumped to from the TOC. */
  scroll-margin-top: 88px;
}

.h2 {
  margin: 0 0 14px;
  letter-spacing: -0.015em;
}

.p {
  margin: 0 0 18px;
  line-height: 1.75;
  font-size: var(--dz-text-lg);
}

.prose code {
  font-family: var(--dz-font-mono);
  font-size: 0.875em;
  padding: 0.12em 0.4em;
  border-radius: var(--dz-radius-sm);
  background: var(--dz-muted);
  color: var(--dz-primary);
}

.quote {
  margin: 24px 0;
}

.list {
  margin: 0 0 18px;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: 1.65;
  font-size: var(--dz-text-lg);
}

.list code {
  font-family: var(--dz-font-mono);
  font-size: 0.85em;
  padding: 0.1em 0.36em;
  border-radius: var(--dz-radius-sm);
  background: var(--dz-muted);
  color: var(--dz-primary);
}

.rule {
  margin: clamp(28px, 4vw, 44px) 0;
}

.figure {
  margin: clamp(28px, 4vw, 44px) 0;
}

.figure-img {
  width: 100%;
  border-radius: var(--dz-radius-xl);
  border: 1px solid var(--dz-border);
  overflow: hidden;
}

.figure-cap {
  margin-top: 10px;
  text-align: center;
}

.code {
  margin: 4px 0 8px;
}

/* ── Author bio ───────────────────────────────────────────────── */
.bio {
  margin-top: 28px;
}

.bio-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.bio-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.bio-text {
  margin: 0;
  line-height: 1.5;
}

/* ── Sticky TOC ───────────────────────────────────────────────── */
.toc {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toc-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--dz-font-semibold);
}

/* ── Continue reading ─────────────────────────────────────────── */
.related {
  padding-top: clamp(40px, 6vw, 72px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.related-head {
  margin-bottom: 24px;
}

.related-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.related-card {
  height: 100%;
}

.related-tag {
  margin-bottom: 10px;
}

.related-title {
  margin: 0 0 14px;
  line-height: 1.3;
}

.related-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.related-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-semibold);
  color: var(--dz-primary);
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
  .layout {
    grid-template-columns: 1fr;
  }
  .toc {
    display: none;
  }
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .byline {
    flex-wrap: wrap;
  }
  .byline-actions {
    margin-left: 0;
    width: 100%;
  }
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
