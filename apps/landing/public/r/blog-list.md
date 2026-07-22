# Blog post list

A grid of editorial cards — cover image with a category badge overlay, title, excerpt, and an author byline with avatar and read time; reflows 3 → 2 → 1 columns.

- **Category:** Content
- **Components:** DzImageCard, DzBadge, DzAvatar, DzText
- **Preview:** /blocks/blog-list

```vue
<script setup lang="ts">
import type { CanonicalTone } from '@dzup-ui/contracts'
/**
 * Blog post list — a grid of editorial cards for a blog or news index.
 *
 * Each post is a DzImageCard: a cover image with a category DzBadge in the
 * `#overlay` slot, a body pairing the title + excerpt, and a footer byline
 * pairing a DzAvatar (image, with initials fallback) with the author name and
 * a DzText read-time. The grid reflows 3 → 2 → 1 columns.
 *
 * Self-contained: local static data, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { DzAvatar, DzBadge, DzHeading, DzImageCard, DzText } from '@dzup-ui/core'

interface Post {
  id: number
  title: string
  excerpt: string
  src: string
  alt: string
  category: { label: string, tone: CanonicalTone }
  readTime: string
  author: { name: string, initials: string, src?: string }
}

const posts: Post[] = [
  {
    id: 1,
    title: 'Designing a token-first component library',
    excerpt: 'How a single layer of CSS custom properties lets one codebase ship light, dark and fully re-skinned brand themes.',
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    alt: 'Abstract gradient artwork in violet and blue',
    category: { label: 'Engineering', tone: 'primary' },
    readTime: '6 min read',
    author: { name: 'Mara Lindqvist', initials: 'ML', src: 'https://i.pravatar.cc/80?img=47' },
  },
  {
    id: 2,
    title: 'Accessibility is a feature, not a checklist',
    excerpt: 'Shipping WCAG AA by default means baking keyboard, focus and contrast guarantees into the primitives themselves.',
    src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
    alt: 'Two people collaborating at a laptop',
    category: { label: 'Design', tone: 'success' },
    readTime: '4 min read',
    author: { name: 'Devon Park', initials: 'DP', src: 'https://i.pravatar.cc/80?img=12' },
  },
  {
    id: 3,
    title: 'Inside our Reka UI migration',
    excerpt: 'Adopting headless primitives gave us the accessible behaviour for free — here is what changed and what we kept.',
    src: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80',
    alt: 'Glowing fibre-optic strands',
    category: { label: 'Engineering', tone: 'primary' },
    readTime: '8 min read',
    author: { name: 'Aisha Rahman', initials: 'AR' },
  },
  {
    id: 4,
    title: 'A pricing page that respects your time',
    excerpt: 'We rebuilt the plans grid around clarity first: fewer tiers, plainer language, and a calculator you can actually trust.',
    src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
    alt: 'Team meeting around a glass table',
    category: { label: 'Product', tone: 'info' },
    readTime: '5 min read',
    author: { name: 'Tomás Vega', initials: 'TV', src: 'https://i.pravatar.cc/80?img=33' },
  },
  {
    id: 5,
    title: 'Shipping faster with a block catalog',
    excerpt: 'Ready-made sections composed from the free core mean a landing page goes from blank file to live in an afternoon.',
    src: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80',
    alt: 'Desk with notebooks and a laptop from above',
    category: { label: 'Product', tone: 'info' },
    readTime: '3 min read',
    author: { name: 'Devon Park', initials: 'DP', src: 'https://i.pravatar.cc/80?img=12' },
  },
  {
    id: 6,
    title: 'The case for committed dist artifacts',
    excerpt: 'Why we vendor the build output into the repo, and how it keeps installs reproducible across every consumer.',
    src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    alt: 'Person writing on a whiteboard covered in diagrams',
    category: { label: 'Engineering', tone: 'primary' },
    readTime: '7 min read',
    author: { name: 'Mara Lindqvist', initials: 'ML', src: 'https://i.pravatar.cc/80?img=47' },
  },
]
</script>

<template>
  <section class="bl-wrap" aria-labelledby="bl-title">
    <header class="bl-head">
      <DzText size="xs" tone="muted" as="p" class="bl-eyebrow">
        From the blog
      </DzText>
      <DzHeading id="bl-title" :level="4" class="bl-title">
        <DzText size="xl" weight="bold" as="span">
          Latest writing
        </DzText>
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="bl-sub">
        Notes on building dzup-ui — engineering, design and product.
      </DzText>
    </header>

    <ul class="bl-grid">
      <li v-for="post in posts" :key="post.id" class="bl-cell">
        <DzImageCard
          :src="post.src"
          :alt="post.alt"
          variant="outlined"
          aspect-ratio="16/9"
          class="bl-card"
        >
          <template #overlay>
            <span class="bl-flag">
              <DzBadge variant="solid" :tone="post.category.tone" size="sm">
                {{ post.category.label }}
              </DzBadge>
            </span>
          </template>

          <div class="bl-body">
            <DzHeading :level="5" size="md" class="bl-post-title">
              <a :href="`#post-${post.id}`" class="bl-post-link">{{ post.title }}</a>
            </DzHeading>
            <DzText size="sm" tone="muted" as="p" class="bl-excerpt">
              {{ post.excerpt }}
            </DzText>
          </div>

          <template #footer>
            <div class="bl-byline">
              <DzAvatar :src="post.author.src" :fallback="post.author.initials" size="sm" :alt="post.author.name" />
              <div class="bl-byline-meta">
                <DzText size="sm" weight="medium" as="span">
                  {{ post.author.name }}
                </DzText>
                <DzText size="xs" tone="muted" as="span">
                  {{ post.readTime }}
                </DzText>
              </div>
            </div>
          </template>
        </DzImageCard>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.bl-wrap {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.bl-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-6, 1.5rem);
}

.bl-eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.bl-title {
  margin: 0;
  font: inherit;
}

.bl-sub {
  margin: 0;
}

.bl-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--dz-space-5, 1.25rem);
}

.bl-cell {
  min-width: 0;
}

.bl-card {
  height: 100%;
}

.bl-flag {
  position: absolute;
  top: var(--dz-space-3, 0.75rem);
  left: var(--dz-space-3, 0.75rem);
}

.bl-body {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.bl-post-title {
  margin: 0;
  font-size: var(--dz-text-lg, 1.125rem);
  font-weight: var(--dz-font-semibold, 600);
  line-height: 1.35;
}

.bl-post-link {
  color: var(--dz-foreground, inherit);
  text-decoration: none;
  outline: none;
}

.bl-post-link:hover {
  color: var(--dz-primary, #6366f1);
}

.bl-post-link:focus-visible {
  outline: 2px solid var(--dz-ring, var(--dz-primary, #6366f1));
  outline-offset: 2px;
  border-radius: var(--dz-radius-sm, 0.125rem);
}

.bl-excerpt {
  margin: 0;
  line-height: 1.6;
}

.bl-byline {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.bl-byline-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

@media (max-width: 900px) {
  .bl-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .bl-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
```
