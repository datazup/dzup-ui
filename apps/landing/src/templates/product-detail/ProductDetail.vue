<script setup lang="ts">
/**
 * Product Detail — Commerce template (docs/templates.md §6.4).
 *
 * A chromeless storefront product page: a gallery whose studio shot re-tints
 * live when the shopper picks a colourway, a buy box (rating, price, colour
 * swatches, DzNumberInput quantity, add-to-cart), a shipping DzAccordion, a
 * DzTabs panel for Description / Specifications / Reviews, and a "pairs well
 * with" grid of DzCards. Built only from free `@dzup-ui/core` components,
 * token-styled (no `lp-*`) and correct in light + dark from 390px upward.
 *
 * The product photography is painted from resolved `--dz-*` tokens (no assets,
 * re-themes with the page) — see `buildShot` in `./data.ts`.
 */
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
  DzAvatar,
  DzBadge,
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzButton,
  DzCard,
  DzDivider,
  DzHeading,
  DzImage,
  DzNumberInput,
  DzRating,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import { Check, Headphones, Heart, RotateCcw, ShoppingBag, Truck } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  buildShot,
  COLORWAYS,
  GALLERY_VIEWS,
  INFO_PANELS,
  PRODUCT,
  RATING_BREAKDOWN,
  RELATED,
  REVIEWS,
  SPECS,
  type ShotPalette,
  type ShotView,
} from './data.ts'

/** Resolve a `--dz-*` token to its computed value, with a neutral fallback. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

// ── Interactive state ────────────────────────────────────────────
const activeColorIndex = ref(0)
const activeColorway = computed(() => COLORWAYS[activeColorIndex.value] ?? COLORWAYS[0]!)
const activeView = ref<ShotView>('front')
const qty = ref<number>(1)
const tab = ref('description')

// Bumped whenever the theme flips so every painted shot recomputes (the preview
// detail page toggles `data-theme` on the iframe document).
const tick = ref(0)
let observer: MutationObserver | null = null
onMounted(() => {
  observer = new MutationObserver(() => (tick.value += 1))
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => observer?.disconnect())

/** Live token palette; re-tinted by the selected colourway. */
const palette = computed<ShotPalette>(() => {
  void tick.value
  return {
    surface: token('--dz-muted', '#f1f5f9'),
    panel: token('--dz-background', '#ffffff'),
    panelAlt: token('--dz-muted', '#e2e8f0'),
    line: token('--dz-border', '#e2e8f0'),
    accent: token(activeColorway.value.token, '#6366f1'),
    ink: token('--dz-foreground', '#0f172a'),
  }
})

/** Thumbnail strip — one shot per framing. */
const thumbs = computed(() =>
  GALLERY_VIEWS.map((v) => ({ ...v, src: buildShot(palette.value, v.id) })),
)
/** The large gallery image, following the active framing + colourway. */
const mainSrc = computed(() => buildShot(palette.value, activeView.value))

// ── Pricing ──────────────────────────────────────────────────────
const savings = computed(() => PRODUCT.compareAt - PRODUCT.price)
const savingsPct = computed(() => Math.round((savings.value / PRODUCT.compareAt) * 100))

const reviewCountLabel = computed(() => PRODUCT.reviewCount.toLocaleString('en-US'))

/** Painted shots for the "pairs well with" cards (theme-aware). */
const relatedShots = computed(() =>
  RELATED.map((r) => ({
    ...r,
    src: buildShot({ ...palette.value, accent: token(r.accentToken, '#6366f1') }, r.view),
  })),
)
</script>

<template>
  <div class="shop">
    <!-- ── Store bar ──────────────────────────────────────────── -->
    <header class="topbar">
      <div class="topbar-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Headphones :size="18" /></span>
          <span class="brand-name">Lumen Audio</span>
        </span>
        <nav class="topnav" aria-label="Primary">
          <a href="#">Headphones</a>
          <a href="#">Earbuds</a>
          <a href="#">Speakers</a>
          <a href="#">Support</a>
        </nav>
        <DzButton variant="ghost" tone="neutral" size="sm" aria-label="Cart (1 item)">
          <template #prefix><ShoppingBag :size="18" aria-hidden="true" /></template>
          1
        </DzButton>
      </div>
    </header>

    <main class="wrap">
      <DzBreadcrumb separator="/" aria-label="Breadcrumb" class="crumbs">
        <DzBreadcrumbItem href="#">Home</DzBreadcrumbItem>
        <DzBreadcrumbItem href="#">Headphones</DzBreadcrumbItem>
        <DzBreadcrumbItem current>{{ PRODUCT.name }}</DzBreadcrumbItem>
      </DzBreadcrumb>

      <!-- ── Product: gallery + buy box ───────────────────────── -->
      <section class="product">
        <div class="gallery">
          <div class="gallery-main">
            <DzBadge v-if="savings > 0" variant="solid" tone="danger" size="sm" class="gallery-flag">
              Save {{ savingsPct }}%
            </DzBadge>
            <DzImage
              :src="mainSrc"
              :alt="`${PRODUCT.name} headphones in ${activeColorway.name}`"
              fit="contain"
              aspect-ratio="4 / 3"
              class="gallery-shot"
            />
          </div>
          <ul class="thumbs">
            <li v-for="t in thumbs" :key="t.id">
              <button
                type="button"
                class="thumb"
                :class="{ 'is-active': activeView === t.id }"
                :aria-pressed="activeView === t.id"
                :aria-label="`Show ${t.label} view`"
                @click="activeView = t.id"
              >
                <DzImage :src="t.src" alt="" fit="contain" aspect-ratio="1 / 1" />
              </button>
            </li>
          </ul>
        </div>

        <div class="buy">
          <DzText size="sm" weight="semibold" as="span" class="buy-brand">
            {{ PRODUCT.brand }}
          </DzText>
          <DzHeading :level="1" size="2xl" weight="bold" class="buy-title">
            {{ PRODUCT.name }}
          </DzHeading>
          <DzText size="lg" tone="muted" as="p" class="buy-tagline">{{ PRODUCT.tagline }}</DzText>

          <div class="rating-row">
            <DzRating :value="PRODUCT.rating" allow-half readonly size="sm" aria-label="Average rating" />
            <DzText size="sm" weight="semibold" as="span">{{ PRODUCT.rating.toFixed(1) }}</DzText>
            <a href="#reviews" class="rating-link">{{ reviewCountLabel }} reviews</a>
          </div>

          <div class="price-row">
            <span class="price">${{ PRODUCT.price }}</span>
            <span v-if="savings > 0" class="price-was">${{ PRODUCT.compareAt }}</span>
            <DzBadge v-if="savings > 0" variant="subtle" tone="success" size="sm">
              You save ${{ savings }}
            </DzBadge>
          </div>

          <DzText as="p" tone="muted" class="buy-blurb">{{ PRODUCT.blurb }}</DzText>

          <ul class="highlights">
            <li v-for="h in PRODUCT.highlights" :key="h">
              <DzTag variant="subtle" tone="neutral" size="sm">
                <template #prefix><Check :size="13" aria-hidden="true" /></template>
                {{ h }}
              </DzTag>
            </li>
          </ul>

          <DzDivider class="buy-rule" />

          <!-- Colourway -->
          <div class="field">
            <span class="field-label">
              Colour — <strong>{{ activeColorway.name }}</strong>
            </span>
            <ul class="swatches">
              <li v-for="(c, i) in COLORWAYS" :key="c.name">
                <button
                  type="button"
                  class="swatch"
                  :class="{ 'is-active': activeColorIndex === i }"
                  :style="{ '--swatch': `var(${c.token})` }"
                  :aria-pressed="activeColorIndex === i"
                  :aria-label="c.name"
                  @click="activeColorIndex = i"
                />
              </li>
            </ul>
          </div>

          <!-- Quantity + add to cart -->
          <div class="field">
            <span class="field-label">Quantity</span>
            <div class="cart-row">
              <DzNumberInput
                v-model="qty"
                :min="1"
                :max="10"
                class="qty"
                aria-label="Quantity"
              />
              <DzButton variant="solid" tone="primary" size="lg" class="add-btn">
                <template #prefix><ShoppingBag :size="18" aria-hidden="true" /></template>
                Add to cart · ${{ PRODUCT.price * qty }}
              </DzButton>
              <DzButton variant="outline" tone="neutral" size="lg" aria-label="Save to wishlist">
                <Heart :size="18" aria-hidden="true" />
              </DzButton>
            </div>
          </div>

          <!-- Trust strip -->
          <ul class="trust">
            <li><Check :size="16" aria-hidden="true" /><span>In stock — ships in 24h</span></li>
            <li><Truck :size="16" aria-hidden="true" /><span>Free carbon-neutral delivery</span></li>
            <li><RotateCcw :size="16" aria-hidden="true" /><span>30-day free returns</span></li>
          </ul>

          <DzAccordion type="single" collapsible variant="separated" class="info">
            <DzAccordionItem v-for="p in INFO_PANELS" :key="p.value" :value="p.value">
              <DzAccordionTrigger>{{ p.q }}</DzAccordionTrigger>
              <DzAccordionContent>
                <DzText size="sm" tone="muted" as="p">{{ p.a }}</DzText>
              </DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        </div>
      </section>

      <!-- ── Details tabs ─────────────────────────────────────── -->
      <section id="reviews" class="details">
        <DzTabs v-model="tab" variant="line" aria-label="Product details" class="detail-tabs">
          <DzTabList>
            <DzTabTrigger value="description">Description</DzTabTrigger>
            <DzTabTrigger value="specs">Specifications</DzTabTrigger>
            <DzTabTrigger value="reviews">Reviews</DzTabTrigger>
          </DzTabList>

          <DzTabContent value="description" class="tab-pane">
            <div class="prose">
              <DzText as="p">
                The Lumen One is our flagship over-ear — a reference tuning that stays honest
                from your morning playlist to a late-night mixdown. Adaptive noise cancelling
                samples the room hundreds of times a second and blends just enough of the world
                back in when you start a conversation.
              </DzText>
              <DzText as="p">
                A 248 g aluminium frame and memory-foam cushions wrapped in protein leather keep
                it comfortable for hours, while 60 hours of battery means you'll charge it about
                as often as you remember to. Multipoint pairing keeps your laptop and phone
                connected at once.
              </DzText>
            </div>
          </DzTabContent>

          <DzTabContent value="specs" class="tab-pane">
            <ul class="spec-grid">
              <li v-for="s in SPECS" :key="s.label">
                <span class="spec-icon" aria-hidden="true"><component :is="s.icon" :size="18" /></span>
                <span class="spec-meta">
                  <DzText size="sm" tone="muted" as="span">{{ s.label }}</DzText>
                  <DzText weight="semibold" as="span">{{ s.value }}</DzText>
                </span>
              </li>
            </ul>
          </DzTabContent>

          <DzTabContent value="reviews" class="tab-pane">
            <div class="reviews">
              <aside class="review-summary">
                <DzCard variant="outlined" padding="lg">
                  <div class="summary-score">
                    <span class="summary-num">{{ PRODUCT.rating.toFixed(1) }}</span>
                    <DzRating :value="PRODUCT.rating" allow-half readonly size="sm" aria-label="Average rating" />
                    <DzText size="sm" tone="muted" as="span">{{ reviewCountLabel }} reviews</DzText>
                  </div>
                  <ul class="breakdown">
                    <li v-for="b in RATING_BREAKDOWN" :key="b.stars">
                      <span class="bd-label">{{ b.stars }}★</span>
                      <span class="bd-track"><span class="bd-fill" :style="{ width: `${b.pct}%` }" /></span>
                      <span class="bd-pct">{{ b.pct }}%</span>
                    </li>
                  </ul>
                  <DzButton variant="outline" tone="neutral" size="sm" class="summary-cta">
                    Write a review
                  </DzButton>
                </DzCard>
              </aside>

              <ul class="review-list">
                <li v-for="r in REVIEWS" :key="r.name">
                  <DzCard variant="outlined" padding="lg" class="review-card">
                    <div class="review-head">
                      <DzAvatar :fallback="r.initials" size="md" />
                      <span class="review-who">
                        <DzText weight="semibold" as="span">{{ r.name }}</DzText>
                        <span class="review-sub">
                          <DzBadge variant="subtle" tone="success" size="sm">Verified</DzBadge>
                          <DzText size="sm" tone="muted" as="span">{{ r.date }}</DzText>
                        </span>
                      </span>
                      <DzRating :value="r.rating" readonly size="sm" :aria-label="`${r.rating} out of 5`" class="review-stars" />
                    </div>
                    <DzHeading :level="3" size="sm" weight="semibold" class="review-title">
                      {{ r.title }}
                    </DzHeading>
                    <DzText size="sm" tone="muted" as="p">{{ r.body }}</DzText>
                  </DzCard>
                </li>
              </ul>
            </div>
          </DzTabContent>
        </DzTabs>
      </section>

      <!-- ── Related ──────────────────────────────────────────── -->
      <section class="related">
        <div class="related-head">
          <DzHeading :level="2" size="lg" weight="semibold">Pairs well with</DzHeading>
          <a href="#" class="related-all">View all</a>
        </div>
        <ul class="related-grid">
          <li v-for="r in relatedShots" :key="r.id">
            <DzCard variant="outlined" padding="none" class="rel-card">
              <div class="rel-media">
                <DzImage :src="r.src" :alt="r.name" fit="contain" aspect-ratio="4 / 3" />
              </div>
              <div class="rel-body">
                <DzText weight="semibold" as="span">{{ r.name }}</DzText>
                <DzText size="sm" tone="muted" as="span">{{ r.tagline }}</DzText>
                <div class="rel-foot">
                  <span class="rel-price">${{ r.price }}</span>
                  <DzButton variant="outline" tone="neutral" size="sm">View</DzButton>
                </div>
              </div>
            </DzCard>
          </li>
        </ul>
      </section>
    </main>

    <footer class="foot">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Headphones :size="16" /></span>
        <span class="brand-name">Lumen Audio</span>
      </span>
      <DzText size="sm" tone="muted">© 2026 Lumen Audio. Sound, considered.</DzText>
    </footer>
  </div>
</template>

<style scoped>
.shop {
  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  min-height: 100vh;
}

/* ── Store bar ─────────────────────────────────────────────────── */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in oklch, var(--dz-background) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--dz-border);
}

.topbar-inner,
.wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 60px;
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

.topnav {
  display: flex;
  gap: 26px;
}

.topnav a {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  color: var(--dz-muted-foreground);
  text-decoration: none;
}

.topnav a:hover {
  color: var(--dz-foreground);
}

/* ── Layout ────────────────────────────────────────────────────── */
.wrap {
  padding-top: 24px;
  padding-bottom: 64px;
}

.crumbs {
  margin-bottom: 20px;
}

.product {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(24px, 4vw, 56px);
  align-items: start;
}

/* ── Gallery ───────────────────────────────────────────────────── */
.gallery {
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gallery-main {
  position: relative;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-2xl);
  background:
    radial-gradient(circle at 50% 12%, color-mix(in oklch, var(--dz-primary) 6%, transparent), transparent 60%),
    var(--dz-muted);
  overflow: hidden;
}

.gallery-flag {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 1;
}

.gallery-shot {
  width: 100%;
}

.thumbs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.thumb {
  width: 100%;
  padding: 6px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-muted);
  cursor: pointer;
  transition: border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.thumb:hover {
  border-color: var(--dz-border-hover);
}

.thumb.is-active {
  border-color: var(--dz-primary);
  box-shadow: 0 0 0 1px var(--dz-primary);
}

.thumb:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
}

/* ── Buy box ───────────────────────────────────────────────────── */
.buy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.buy-brand {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dz-primary);
}

.buy-title {
  margin: 6px 0 2px;
  letter-spacing: -0.02em;
}

.buy-tagline {
  margin: 0;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.rating-link {
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
  text-decoration: none;
}

.rating-link:hover {
  color: var(--dz-foreground);
}

.price-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.price {
  font-size: var(--dz-text-3xl);
  font-weight: var(--dz-font-bold);
  letter-spacing: -0.02em;
}

.price-was {
  font-size: var(--dz-text-lg);
  color: var(--dz-muted-foreground);
  text-decoration: line-through;
}

.buy-blurb {
  margin: 18px 0 0;
  line-height: 1.6;
  max-width: 52ch;
}

.highlights {
  list-style: none;
  margin: 18px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.buy-rule {
  margin: 22px 0;
  align-self: stretch;
}

.field {
  align-self: stretch;
  margin-bottom: 22px;
}

.field-label {
  display: block;
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  margin-bottom: 10px;
}

.field-label strong {
  font-weight: var(--dz-font-semibold);
}

/* Colour swatches */
.swatches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 10px;
}

.swatch {
  width: 34px;
  height: 34px;
  border-radius: var(--dz-radius-full);
  background: var(--swatch);
  border: 2px solid var(--dz-border);
  cursor: pointer;
  transition: box-shadow var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.swatch.is-active {
  box-shadow: 0 0 0 2px var(--dz-background), 0 0 0 4px var(--dz-primary);
}

.swatch:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 3px;
}

/* Quantity + cart */
.cart-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.qty {
  width: 132px;
  flex: none;
}

.add-btn {
  flex: 1;
  min-width: 200px;
}

.trust {
  list-style: none;
  margin: 4px 0 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.trust li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
}

.trust svg {
  color: var(--dz-success);
  flex: none;
}

.info {
  align-self: stretch;
}

/* ── Details tabs ──────────────────────────────────────────────── */
.details {
  margin-top: clamp(40px, 6vw, 72px);
}

.tab-pane {
  padding-top: 28px;
}

.prose {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 70ch;
  line-height: 1.7;
}

.spec-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 760px;
}

.spec-grid li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-surface);
}

.spec-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
}

.spec-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.4;
}

/* Reviews */
.reviews {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.review-summary {
  position: sticky;
  top: 84px;
}

.summary-score {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.summary-num {
  font-size: var(--dz-text-4xl);
  font-weight: var(--dz-font-bold);
  line-height: 1;
  letter-spacing: -0.02em;
}

.breakdown {
  list-style: none;
  margin: 20px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown li {
  display: grid;
  grid-template-columns: 28px 1fr 38px;
  align-items: center;
  gap: 10px;
  font-size: var(--dz-text-xs);
  color: var(--dz-muted-foreground);
}

.bd-track {
  height: 7px;
  border-radius: var(--dz-radius-full);
  background: var(--dz-muted);
  overflow: hidden;
}

.bd-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--dz-warning);
}

.bd-pct {
  text-align: right;
}

.summary-cta {
  width: 100%;
}

.review-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.review-who {
  display: flex;
  flex-direction: column;
  gap: 3px;
  line-height: 1.3;
}

.review-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-stars {
  margin-left: auto;
}

.review-title {
  margin-bottom: 4px;
}

/* ── Related ───────────────────────────────────────────────────── */
.related {
  margin-top: clamp(40px, 6vw, 72px);
}

.related-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.related-all {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  color: var(--dz-primary);
  text-decoration: none;
}

.related-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.rel-card {
  overflow: hidden;
  height: 100%;
}

.rel-media {
  background:
    radial-gradient(circle at 50% 12%, color-mix(in oklch, var(--dz-primary) 5%, transparent), transparent 60%),
    var(--dz-muted);
  border-bottom: 1px solid var(--dz-border);
}

.rel-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px;
}

.rel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.rel-price {
  font-size: var(--dz-text-lg);
  font-weight: var(--dz-font-bold);
}

/* ── Footer ────────────────────────────────────────────────────── */
.foot {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 28px 24px;
  border-top: 1px solid var(--dz-border);
}

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 920px) {
  .product {
    grid-template-columns: 1fr;
  }
  .gallery {
    position: static;
  }
  .reviews {
    grid-template-columns: 1fr;
  }
  .review-summary {
    position: static;
  }
  .topnav {
    display: none;
  }
}

@media (max-width: 560px) {
  .spec-grid {
    grid-template-columns: 1fr;
  }
  .related-grid {
    grid-template-columns: 1fr;
  }
  .add-btn {
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thumb,
  .swatch {
    transition: none;
  }
}
</style>
