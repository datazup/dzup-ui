# Product card grid

A storefront grid of product cards — image with a sale/new corner badge, name, read-only star rating with review count, current/original price, and an add-to-cart button; reflows 3 → 2 → 1 columns.

- **Category:** Commerce
- **Components:** DzImageCard, DzBadge, DzRating, DzButton, DzHeading, DzText
- **Preview:** /blocks/product-grid

```vue
<script setup lang="ts">
import type { CanonicalTone } from '@dzup-ui/contracts'
/**
 * Product card grid — a storefront listing of products.
 *
 * Each product is a DzImageCard: a prominent image with a corner DzBadge for
 * sale / new-arrival flags (rendered in the `#overlay` slot), a body pairing the
 * name with a read-only DzRating + review count and a current/original price,
 * and a footer "Add to cart" DzButton. The grid reflows 3 → 2 → 1 columns.
 *
 * Self-contained: local static data, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { DzBadge, DzButton, DzHeading, DzImageCard, DzRating, DzText } from '@dzup-ui/core'

interface Product {
  id: number
  name: string
  category: string
  src: string
  alt: string
  price: number
  was?: number
  rating: number
  reviews: number
  flag?: { label: string, tone: CanonicalTone }
}

const products: Product[] = [
  {
    id: 1,
    name: 'Aero Running Shoe',
    category: 'Footwear',
    src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    alt: 'Red low-top running shoe on a plain background',
    price: 119,
    was: 149,
    rating: 4.5,
    reviews: 218,
    flag: { label: '-20%', tone: 'danger' },
  },
  {
    id: 2,
    name: 'Field Daypack 18L',
    category: 'Bags',
    src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    alt: 'Grey canvas backpack standing upright',
    price: 89,
    rating: 5,
    reviews: 96,
    flag: { label: 'New', tone: 'success' },
  },
  {
    id: 3,
    name: 'Studio Headphones',
    category: 'Audio',
    src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    alt: 'Black over-ear headphones',
    price: 199,
    was: 229,
    rating: 4,
    reviews: 341,
  },
  {
    id: 4,
    name: 'Classic Wristwatch',
    category: 'Accessories',
    src: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
    alt: 'Analog wristwatch with a leather strap',
    price: 245,
    rating: 4.5,
    reviews: 64,
  },
  {
    id: 5,
    name: 'Polaroid Instant Camera',
    category: 'Photography',
    src: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    alt: 'Retro instant film camera',
    price: 79,
    was: 99,
    rating: 4,
    reviews: 152,
    flag: { label: '-20%', tone: 'danger' },
  },
  {
    id: 6,
    name: 'Linen Throw Blanket',
    category: 'Home',
    src: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800&q=80',
    alt: 'Folded textured linen throw blanket',
    price: 64,
    rating: 5,
    reviews: 38,
    flag: { label: 'New', tone: 'success' },
  },
]

const money = (value: number) => `$${value.toFixed(2)}`
</script>

<template>
  <section class="pg-wrap" aria-labelledby="pg-title">
    <header class="pg-head">
      <DzHeading id="pg-title" :level="4" size="lg" weight="semibold" class="pg-heading">
        Featured products
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="pg-sub">
        Free shipping on orders over $75
      </DzText>
    </header>

    <ul class="pg-grid">
      <li v-for="product in products" :key="product.id" class="pg-cell">
        <DzImageCard
          :src="product.src"
          :alt="product.alt"
          variant="outlined"
          aspect-ratio="4/5"
          class="pg-card"
        >
          <template v-if="product.flag" #overlay>
            <span class="pg-flag">
              <DzBadge variant="solid" :tone="product.flag.tone" size="sm">{{ product.flag.label }}</DzBadge>
            </span>
          </template>

          <div class="pg-body">
            <DzText size="xs" tone="muted" as="p" class="pg-eyebrow">
              {{ product.category }}
            </DzText>
            <DzHeading :level="5" size="md" weight="semibold" class="pg-name">
              {{ product.name }}
            </DzHeading>

            <div class="pg-rating">
              <DzRating
                :value="product.rating"
                readonly
                allow-half
                size="sm"
                :aria-label="`Rated ${product.rating} out of 5`"
              />
              <DzText size="xs" tone="muted" as="span">
                ({{ product.reviews }})
              </DzText>
            </div>

            <p class="pg-price">
              <DzText size="md" weight="bold" as="span">
                {{ money(product.price) }}
              </DzText>
              <DzText v-if="product.was" size="sm" tone="muted" as="span" class="pg-was">
                {{ money(product.was) }}
              </DzText>
            </p>
          </div>

          <template #footer>
            <DzButton variant="solid" tone="primary" size="sm" class="pg-add">
              Add to cart
            </DzButton>
          </template>
        </DzImageCard>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.pg-wrap {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.pg-head {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.pg-heading,
.pg-sub {
  margin: 0;
}

.pg-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--dz-space-5, 1.25rem);
}

.pg-cell {
  min-width: 0;
}

.pg-card {
  height: 100%;
}

/* Corner flag sits inside the image overlay, top-left. */
.pg-flag {
  position: absolute;
  top: var(--dz-space-3, 0.75rem);
  left: var(--dz-space-3, 0.75rem);
}

.pg-body {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
}

.pg-eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pg-name {
  margin: 0;
}

.pg-rating {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  margin-top: var(--dz-space-1, 0.25rem);
}

.pg-price {
  display: flex;
  align-items: baseline;
  gap: var(--dz-space-2, 0.5rem);
  margin: var(--dz-space-2, 0.5rem) 0 0;
}

.pg-was {
  text-decoration: line-through;
}

.pg-add {
  width: 100%;
}

@media (max-width: 900px) {
  .pg-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .pg-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
```
