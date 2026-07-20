# Product detail

A two-column product page — a looping DzCarousel gallery beside a buy box with rating, sale price, a size toggle group, stock badge and primary actions, over a full-width description / specs / shipping DzTabs panel.

- **Category:** Commerce
- **Components:** DzCarousel, DzCarouselSlide, DzCarouselPrevious, DzCarouselNext, DzCarouselDots, DzImage, DzAspectRatio, DzRating, DzButton, DzTabs, DzTabList, DzTabTrigger, DzTabContent, DzBadge, DzHeading, DzText
- **Preview:** /blocks/product-detail

```vue
<script setup lang="ts">
import {
  DzAspectRatio,
  DzBadge,
  DzButton,
  DzCarousel,
  DzCarouselDots,
  DzCarouselNext,
  DzCarouselPrevious,
  DzCarouselSlide,
  DzHeading,
  DzImage,
  DzRating,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
} from '@dzup-ui/core'
/**
 * Product detail — a gallery + buy-box layout for a single product.
 *
 * The left column is a looping DzCarousel of DzImage slides (framed by
 * DzAspectRatio) with arrow + dot navigation. The right "buy box" pairs a
 * brand eyebrow, title, read-only DzRating with a review count, a sale price,
 * a size picker (DzButton toggle group), an in-stock DzBadge and the primary
 * actions. A full-width DzTabs panel holds description / specs / shipping copy.
 *
 * Self-contained: local reactive state, no props, no network. Composed only
 * from free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { ref } from 'vue'

interface Shot {
  src: string
  alt: string
}

const shots: Shot[] = [
  {
    src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80',
    alt: 'Red running shoe, side profile',
  },
  {
    src: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1000&q=80',
    alt: 'Running shoe, top-down view',
  },
  {
    src: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=1000&q=80',
    alt: 'Running shoe sole detail',
  },
]

const active = ref(0)

const sizes = ['7', '8', '9', '10', '11'] as const
const selectedSize = ref<string>('9')

const tab = ref('description')
</script>

<template>
  <section class="pd-wrap" aria-labelledby="pd-title">
    <div class="pd-grid">
      <!-- Gallery -->
      <DzCarousel
        v-model="active"
        loop
        size="lg"
        aria-label="Product photos"
        class="pd-gallery"
      >
        <DzCarouselSlide v-for="shot in shots" :key="shot.src">
          <DzAspectRatio :ratio="1" class="pd-frame">
            <DzImage :src="shot.src" :alt="shot.alt" fit="cover" lazy class="pd-img" />
          </DzAspectRatio>
        </DzCarouselSlide>

        <DzCarouselPrevious />
        <DzCarouselNext />
        <DzCarouselDots />
      </DzCarousel>

      <!-- Buy box -->
      <div class="pd-info">
        <DzText size="xs" tone="muted" as="p" class="pd-brand">
          Aero Athletics
        </DzText>

        <DzHeading id="pd-title" :level="4" size="xl" weight="bold" class="pd-name">
          Aero Running Shoe
        </DzHeading>

        <div class="pd-rating">
          <DzRating :value="4.5" readonly allow-half size="sm" aria-label="Rated 4.5 out of 5" />
          <DzText size="sm" tone="muted" as="span">
            4.5 · 218 reviews
          </DzText>
        </div>

        <p class="pd-price">
          <DzText size="xl" weight="bold" as="span">
            $119.00
          </DzText>
          <DzText size="md" tone="muted" as="span" class="pd-was">
            $149.00
          </DzText>
          <DzBadge variant="subtle" tone="danger" size="sm">
            Save 20%
          </DzBadge>
        </p>

        <DzText size="sm" tone="muted" as="p" class="pd-lede">
          A featherweight everyday trainer with a responsive foam midsole and a
          breathable knit upper — built for the long run.
        </DzText>

        <!-- Size picker -->
        <fieldset class="pd-sizes">
          <legend class="pd-sizes-legend">
            <DzText size="sm" weight="medium" as="span">
              Size (UK)
            </DzText>
          </legend>
          <div class="pd-size-row">
            <DzButton
              v-for="size in sizes"
              :key="size"
              :variant="selectedSize === size ? 'solid' : 'outline'"
              :tone="selectedSize === size ? 'primary' : 'neutral'"
              size="sm"
              :aria-pressed="selectedSize === size"
              class="pd-size"
              @click="selectedSize = size"
            >
              {{ size }}
            </DzButton>
          </div>
        </fieldset>

        <div class="pd-actions">
          <DzButton variant="solid" tone="primary" size="lg" class="pd-add">
            Add to cart
          </DzButton>
          <DzButton variant="outline" tone="neutral" size="lg">
            Save
          </DzButton>
        </div>

        <DzBadge variant="subtle" tone="success" size="sm" class="pd-stock">
          In stock · ships in 24h
        </DzBadge>
      </div>
    </div>

    <!-- Detail tabs -->
    <DzTabs v-model="tab" variant="line" size="md" class="pd-tabs" aria-label="Product details">
      <DzTabList>
        <DzTabTrigger value="description">
          Description
        </DzTabTrigger>
        <DzTabTrigger value="specs">
          Specifications
        </DzTabTrigger>
        <DzTabTrigger value="shipping">
          Shipping &amp; returns
        </DzTabTrigger>
      </DzTabList>

      <DzTabContent value="description" class="pd-panel">
        <DzText size="sm" as="p" class="pd-panel-text">
          The Aero pairs a recycled knit upper with a dual-density foam midsole
          for a cushioned, stable ride. A reinforced heel counter locks the foot
          in place, while the lugged rubber outsole grips wet and dry surfaces alike.
        </DzText>
      </DzTabContent>

      <DzTabContent value="specs" class="pd-panel">
        <ul class="pd-specs">
          <li>
            <DzText size="sm" as="span">
              <strong>Weight</strong> — 248 g (UK 9)
            </DzText>
          </li>
          <li>
            <DzText size="sm" as="span">
              <strong>Drop</strong> — 8 mm
            </DzText>
          </li>
          <li>
            <DzText size="sm" as="span">
              <strong>Upper</strong> — recycled engineered knit
            </DzText>
          </li>
          <li>
            <DzText size="sm" as="span">
              <strong>Outsole</strong> — abrasion-resistant rubber
            </DzText>
          </li>
        </ul>
      </DzTabContent>

      <DzTabContent value="shipping" class="pd-panel">
        <DzText size="sm" as="p" class="pd-panel-text">
          Free standard shipping on orders over $75, delivered in 3–5 business
          days. Free 30-day returns — send it back in the original box for a full
          refund, no questions asked.
        </DzText>
      </DzTabContent>
    </DzTabs>
  </section>
</template>

<style scoped>
.pd-wrap {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
  max-width: 64rem;
  margin: 0 auto;
}

.pd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1.25rem, 4vw, 2.5rem);
  align-items: start;
}

.pd-gallery {
  border-radius: var(--dz-radius-xl, 0.875rem);
}

.pd-frame {
  border-radius: var(--dz-radius-xl, 0.875rem);
  overflow: hidden;
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 60%, transparent);
}

.pd-img {
  width: 100%;
  height: 100%;
  display: block;
}

.pd-info {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
}

.pd-brand {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pd-name {
  margin: 0;
  letter-spacing: -0.01em;
}

.pd-rating {
  display: flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.pd-price {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--dz-space-2, 0.5rem);
  margin: var(--dz-space-2, 0.5rem) 0 0;
}

.pd-was {
  text-decoration: line-through;
}

.pd-lede {
  margin: 0;
  line-height: 1.55;
}

.pd-sizes {
  border: 0;
  margin: var(--dz-space-2, 0.5rem) 0 0;
  padding: 0;
  min-width: 0;
}

.pd-sizes-legend {
  padding: 0;
  margin-bottom: var(--dz-space-2, 0.5rem);
}

.pd-size-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dz-space-2, 0.5rem);
}

.pd-size {
  min-width: 2.75rem;
  justify-content: center;
}

.pd-actions {
  display: flex;
  gap: var(--dz-space-3, 0.75rem);
  margin-top: var(--dz-space-3, 0.75rem);
}

.pd-add {
  flex: 1;
}

.pd-stock {
  align-self: flex-start;
  margin-top: var(--dz-space-2, 0.5rem);
}

.pd-tabs {
  margin-top: clamp(1.5rem, 4vw, 2.5rem);
}

.pd-panel {
  padding-top: var(--dz-space-4, 1rem);
}

.pd-panel-text {
  margin: 0;
  max-width: 60ch;
  line-height: 1.6;
}

.pd-specs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--dz-space-2, 0.5rem);
}

@media (max-width: 720px) {
  .pd-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
```
