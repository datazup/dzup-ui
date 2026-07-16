# Testimonials grid

Grid of customer quote cards each with a star rating, avatar, name/role, and quote text; responsive 3→2→1 columns.

- **Category:** Marketing
- **Components:** DzCard, DzAvatar, DzRating, DzHeading, DzText
- **Preview:** /blocks/testimonials

```vue
<script setup lang="ts">
import {
  DzAvatar,
  DzCard,
  DzHeading,
  DzRating,
  DzText,
} from '@dzup-ui/core'

/**
 * Testimonials — a masonry-style grid of customer quote cards, each
 * containing the quote text, a DzRating (read-only star display),
 * a DzAvatar, and the reviewer's name and role.
 *
 * DzRating with `readonly` prop renders a static slider widget that is
 * announced by screen readers as the user's rating score. The `v-model:value`
 * binding is intentionally omitted — a static `:value` prop is all we need
 * for display. (Confirmed from DzRating ReadOnly story: `:value="4"` with
 * no v-model is valid and renders correctly.)
 *
 * Heading level: section title at :level="4" (BlockPreview uses H3).
 * No heading inside individual cards — the quote is the primary content.
 */

interface Testimonial {
  id: string
  quote: string
  rating: number
  name: string
  role: string
  company: string
  initials: string
  avatarSrc?: string
}

const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote: 'DataZup cut our dashboard build time in half. The component library is incredibly polished — every detail from spacing to dark-mode is already sorted.',
    rating: 5,
    name: 'Priya Nakamura',
    role: 'Lead Frontend Engineer',
    company: 'Shopstream',
    initials: 'PN',
  },
  {
    id: 't2',
    quote: 'We migrated three products in a month. The token system means our brand just drops in with zero overrides. Accessibility out of the box is a game changer.',
    rating: 5,
    name: 'Marcus Webb',
    role: 'CTO',
    company: 'Helix Analytics',
    initials: 'MW',
  },
  {
    id: 't3',
    quote: 'The blocks catalog saved weeks of design work. Our designers and engineers finally speak the same language — we reference component names, not Figma frames.',
    rating: 5,
    name: 'Sofia Andersen',
    role: 'Head of Product',
    company: 'Clair Finance',
    initials: 'SA',
  },
  {
    id: 't4',
    quote: 'Best DX I have experienced in a component library. TypeScript types are strict and complete — my IDE knows every prop before I even check the docs.',
    rating: 5,
    name: 'James Okonkwo',
    role: 'Senior Developer',
    company: 'Orbital Labs',
    initials: 'JO',
  },
  {
    id: 't5',
    quote: 'We were skeptical about adopting a third-party design system, but the customisation depth is remarkable. It feels like we built it ourselves.',
    rating: 4,
    name: 'Lena Ström',
    role: 'Engineering Manager',
    company: 'NorthBridge',
    initials: 'LS',
  },
  {
    id: 't6',
    quote: 'The dark-mode support is flawless and the WCAG compliance means we passed our accessibility audit on the first attempt. That alone justified the switch.',
    rating: 5,
    name: 'Ren Chaturvedi',
    role: 'UI / UX Engineer',
    company: 'Pebble Works',
    initials: 'RC',
  },
]
</script>

<template>
  <section class="testimonials" aria-labelledby="testimonials-title">
    <!-- Section header ----------------------------------------------------->
    <div class="tm-header">
      <DzHeading id="testimonials-title" :level="4" size="2xl" weight="bold" align="center" class="tm-title">
        Loved by engineering teams
      </DzHeading>
      <DzText size="md" tone="muted" align="center" class="tm-subtitle">
        Over 2,000 teams ship faster with dzup-ui every day.
      </DzText>
    </div>

    <!-- Testimonial grid --------------------------------------------------->
    <ul class="tm-grid" aria-label="Customer testimonials">
      <li
        v-for="item in testimonials"
        :key="item.id"
        class="tm-item"
      >
        <DzCard variant="elevated" padding="lg" class="tm-card">
          <!-- Star rating ---->
          <DzRating
            :value="item.rating"
            :count="5"
            readonly
            tone="warning"
            size="sm"
            :aria-label="`${item.rating} out of 5 stars`"
            class="tm-rating"
          />

          <!-- Quote text — blockquote is semantic HTML; DzText renders the
               visible copy inside it as a paragraph. -->
          <blockquote class="tm-quote-wrapper">
            <DzText size="sm" class="tm-quote">
              "{{ item.quote }}"
            </DzText>
          </blockquote>

          <!-- Reviewer identity ---->
          <div class="tm-reviewer">
            <DzAvatar
              :fallback="item.initials"
              :alt="`Avatar of ${item.name}`"
              size="md"
              shape="circle"
            />
            <div class="tm-reviewer-info">
              <DzText size="sm" weight="semibold" class="tm-name">{{ item.name }}</DzText>
              <DzText size="xs" tone="muted" class="tm-role">
                {{ item.role }}, {{ item.company }}
              </DzText>
            </div>
          </div>
        </DzCard>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.testimonials {
  padding: clamp(2.5rem, 6vw, 4rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

/* Section header ---------------------------------------------------------*/
.tm-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: clamp(2rem, 4vw, 3rem);
  text-align: center;
}

.tm-title,
.tm-subtitle {
  margin: 0;
}

/* Grid -------------------------------------------------------------------*/
.tm-grid {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  max-width: 72rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--dz-space-4, 1rem);
  align-items: start;
}

.tm-item {
  /* break-inside: avoid for print / masonry polyfill */
  break-inside: avoid;
}

/* Card internals ---------------------------------------------------------*/
.tm-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-3, 0.75rem);
}

.tm-rating {
  flex-shrink: 0;
}

.tm-quote-wrapper {
  flex: 1;
  margin: 0;
  padding: 0;
}

.tm-quote {
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

/* Reviewer row -----------------------------------------------------------*/
.tm-reviewer {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  padding-top: var(--dz-space-3, 0.75rem);
  border-top: 1px solid var(--dz-border, #e5e7eb);
}

.tm-reviewer-info {
  min-width: 0;
}

.tm-name,
.tm-role {
  margin: 0;
  display: block;
}

/* Responsive: 2 cols on tablet, 1 on mobile ------------------------------*/
@media (max-width: 900px) {
  .tm-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .tm-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```
