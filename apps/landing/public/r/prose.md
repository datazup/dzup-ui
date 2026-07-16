# Prose / rich content

A typographic article body composed from the long-form primitives — DzHeading sections, DzText paragraphs and lists with inline DzCode, a DzBlockquote pull-quote, a block code snippet, and DzDivider rules.

- **Category:** Content
- **Components:** DzHeading, DzText, DzBlockquote, DzCode, DzDivider
- **Preview:** /blocks/prose

```vue
<script setup lang="ts">
/**
 * Prose / rich content — the typographic body of an article or doc page.
 *
 * A worked example of the long-form primitives: DzHeading section titles, DzText
 * paragraphs and lists with inline DzCode, a DzBlockquote pull-quote with an
 * attribution footer, a block DzCode snippet, and DzDivider rules fencing the
 * sections. Constrained to a comfortable reading measure.
 *
 * Self-contained: static content, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { DzBlockquote, DzCode, DzDivider, DzHeading, DzText } from '@dzup-ui/core'
</script>

<template>
  <article class="pr-wrap">
    <div class="pr-measure">
      <DzHeading :level="4" size="2xl" weight="bold" class="pr-h pr-h-lead">
        Theming with design tokens
      </DzHeading>

      <DzText size="lg" tone="muted" as="p" class="pr-lead">
        Every visual decision in the library — colour, radius, spacing, shadow —
        resolves through a single layer of CSS custom properties. Override them
        once and the whole component set follows.
      </DzText>

      <DzText as="p" class="pr-p">
        Components never hard-code a colour. Instead they reference tokens such as
        <DzCode variant="inline">var(--dz-primary)</DzCode> and
        <DzCode variant="inline">var(--dz-radius-md)</DzCode>, so a theme is just a
        set of values on <DzCode variant="inline">:root</DzCode>. Switching to dark
        mode swaps the values, not the markup.
      </DzText>

      <DzDivider class="pr-rule" />

      <DzHeading :level="5" size="lg" weight="semibold" class="pr-h">
        Defining a brand theme
      </DzHeading>

      <DzText as="p" class="pr-p">
        Declare your overrides on a wrapping element. Anything nested inside picks
        up the new values automatically — no props, no recompilation:
      </DzText>

      <DzCode variant="block" language="css" class="pr-code">.brand {
  --dz-primary: oklch(0.62 0.21 270);
  --dz-radius-md: 0.75rem;
  --dz-font-sans: 'Inter', system-ui, sans-serif;
}</DzCode>

      <DzText as="p" class="pr-p">
        Because the cascade does the work, the same button renders on-brand in a
        marketing page and in an embedded widget without a single component change.
      </DzText>

      <DzBlockquote class="pr-quote">
        Good defaults are invisible. The best theming system is the one your team
        never has to think about.
        <template #footer>The dzup-ui design principles</template>
      </DzBlockquote>

      <DzDivider class="pr-rule" />

      <DzHeading :level="5" size="lg" weight="semibold" class="pr-h">
        What lives in a token
      </DzHeading>

      <ul class="pr-list">
        <li>
          <DzText as="span"><strong>Primitives</strong> — raw scales like the colour
          ramp and the spacing steps.</DzText>
        </li>
        <li>
          <DzText as="span"><strong>Semantic tokens</strong> — meaning-bearing
          aliases such as <DzCode variant="inline">--dz-surface</DzCode> and
          <DzCode variant="inline">--dz-border</DzCode>.</DzText>
        </li>
        <li>
          <DzText as="span"><strong>Component tokens</strong> — local anatomy
          mappings, e.g. <DzCode variant="inline">--dz-button-md-height</DzCode>.</DzText>
        </li>
      </ul>

      <DzText size="sm" tone="muted" as="p" class="pr-foot">
        Reach for primitives sparingly — prefer the semantic layer so a single
        change ripples everywhere it should.
      </DzText>
    </div>
  </article>
</template>

<style scoped>
.pr-wrap {
  padding: clamp(1.5rem, 5vw, 2.5rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

.pr-measure {
  max-width: 42rem;
  margin: 0 auto;
}

.pr-h {
  margin: var(--dz-space-6, 1.5rem) 0 var(--dz-space-3, 0.75rem);
}

.pr-h-lead {
  margin-top: 0;
}

.pr-lead {
  margin: 0 0 var(--dz-space-4, 1rem);
  line-height: 1.6;
}

.pr-p {
  margin: 0 0 var(--dz-space-4, 1rem);
  line-height: 1.75;
}

.pr-rule {
  margin: var(--dz-space-6, 1.5rem) 0;
}

.pr-code {
  margin: 0 0 var(--dz-space-4, 1rem);
  display: block;
  overflow-x: auto;
}

.pr-quote {
  margin: var(--dz-space-5, 1.25rem) 0;
}

.pr-list {
  margin: 0 0 var(--dz-space-4, 1rem);
  padding-left: var(--dz-space-5, 1.25rem);
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  line-height: 1.7;
}

.pr-foot {
  margin: 0;
  line-height: 1.6;
}
</style>
```
