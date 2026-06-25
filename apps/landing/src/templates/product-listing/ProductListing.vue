<script setup lang="ts">
/**
 * Product Listing — Commerce template (docs/templates.md §6.4).
 *
 * A chromeless storefront grid: a filter rail (colour swatches, feature
 * checkboxes, a DzRangeSlider price band), a DzSelect sort, a responsive grid
 * of DzImageCards whose studio shots re-tint per colourway, a live result
 * count, an empty state and DzPagination. Filtering / sorting / paging are all
 * real and client-side. Built only from free `@dzup-ui/core` components,
 * token-styled (no `lp-*`) and correct in light + dark from 390px upward.
 */
import {
  DzBadge,
  DzButton,
  DzCheckbox,
  DzCheckboxGroup,
  DzEmpty,
  DzHeading,
  DzImageCard,
  DzPagination,
  DzRangeSlider,
  DzRating,
  DzSelect,
  DzText,
} from '@dzup-ui/core'
import { Headphones, SearchX, ShoppingBag, SlidersHorizontal } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  BADGE_LABEL,
  buildShot,
  colourLabel,
  colourToken,
  COLOURS,
  FEATURES,
  PRICE_MAX,
  PRICE_MIN,
  PRODUCTS,
  type ShotPalette,
  SORTS,
} from './data.ts'

const PAGE_SIZE = 6

/** Resolve a `--dz-*` token to its computed value, with a neutral fallback. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

// ── Filter state ─────────────────────────────────────────────────
const sort = ref('featured')
const colours = ref<string[]>([])
const features = ref<string[]>([])
const price = ref<[number, number]>([PRICE_MIN, PRICE_MAX])
const page = ref(1)

// Any filter change returns the shopper to the first page.
watch([colours, features, price, sort], () => (page.value = 1), { deep: true })

const activeFilterCount = computed(() => {
  let n = colours.value.length + features.value.length
  if (price.value[0] > PRICE_MIN || price.value[1] < PRICE_MAX) n += 1
  return n
})

function clearFilters(): void {
  colours.value = []
  features.value = []
  price.value = [PRICE_MIN, PRICE_MAX]
  sort.value = 'featured'
}

// ── Filter → sort → page pipeline ────────────────────────────────
const filtered = computed(() =>
  PRODUCTS.filter((p) => {
    if (colours.value.length && !colours.value.includes(p.colour)) return false
    if (features.value.length && !features.value.every((f) => p.features.includes(f))) return false
    if (p.price < price.value[0] || p.price > price.value[1]) return false
    return true
  }),
)

const sorted = computed(() => {
  const list = [...filtered.value]
  switch (sort.value) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating)
    case 'newest':
      return list.sort((a, b) => b.rank - a.rank)
    default:
      return list.sort((a, b) => a.rank - b.rank)
  }
})

const total = computed(() => sorted.value.length)
const paged = computed(() =>
  sorted.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
)

// ── Theme-aware tile painting ────────────────────────────────────
const tick = ref(0)
let observer: MutationObserver | null = null
onMounted(() => {
  observer = new MutationObserver(() => (tick.value += 1))
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => observer?.disconnect())

const basePalette = computed<Omit<ShotPalette, 'accent'>>(() => {
  void tick.value
  return {
    surface: token('--dz-muted', '#f1f5f9'),
    panel: token('--dz-background', '#ffffff'),
    panelAlt: token('--dz-muted', '#e2e8f0'),
    line: token('--dz-border', '#e2e8f0'),
    ink: token('--dz-foreground', '#0f172a'),
  }
})

const cards = computed(() =>
  paged.value.map((p) => ({
    ...p,
    src: buildShot({ ...basePalette.value, accent: token(colourToken(p.colour), '#6366f1') }),
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
          <a href="#" aria-current="page">Headphones</a>
          <a href="#">Earbuds</a>
          <a href="#">Speakers</a>
          <a href="#">Support</a>
        </nav>
        <DzButton variant="ghost" tone="neutral" size="sm" aria-label="Cart (0 items)">
          <template #prefix><ShoppingBag :size="18" aria-hidden="true" /></template>
          0
        </DzButton>
      </div>
    </header>

    <main class="wrap">
      <!-- ── Header ────────────────────────────────────────────── -->
      <div class="head">
        <div class="head-copy">
          <DzText size="sm" weight="semibold" as="span" class="eyebrow">Headphones</DzText>
          <DzHeading :level="1" size="2xl" weight="bold" class="head-title">Built for the way you listen</DzHeading>
          <DzText size="lg" tone="muted" as="p" class="head-lede">
            Reference tuning, adaptive noise cancelling and battery that outlasts the week —
            in a colourway for every desk.
          </DzText>
        </div>
      </div>

      <!-- ── Toolbar ───────────────────────────────────────────── -->
      <div class="toolbar">
        <DzText size="sm" tone="muted" as="span" class="count" aria-live="polite">
          {{ total }} {{ total === 1 ? 'product' : 'products' }}
        </DzText>
        <label class="sort">
          <DzText size="sm" tone="muted" as="span">Sort</DzText>
          <DzSelect v-model="sort" :items="SORTS" size="sm" aria-label="Sort products" class="sort-select" />
        </label>
      </div>

      <div class="layout">
        <!-- ── Filter rail ─────────────────────────────────────── -->
        <aside class="filters" aria-label="Filters">
          <div class="filters-head">
            <span class="filters-title">
              <SlidersHorizontal :size="16" aria-hidden="true" />
              Filters
            </span>
            <DzButton
              v-if="activeFilterCount"
              variant="ghost"
              tone="neutral"
              size="sm"
              @click="clearFilters"
            >
              Clear ({{ activeFilterCount }})
            </DzButton>
          </div>

          <fieldset class="group">
            <legend class="group-title">Colour</legend>
            <DzCheckboxGroup v-model="colours" aria-label="Filter by colour">
              <DzCheckbox v-for="c in COLOURS" :key="c.value" :value="c.value">
                <span class="opt">
                  <span class="dot" :style="{ background: `var(${c.token})` }" aria-hidden="true" />
                  {{ c.label }}
                </span>
              </DzCheckbox>
            </DzCheckboxGroup>
          </fieldset>

          <fieldset class="group">
            <legend class="group-title">Features</legend>
            <DzCheckboxGroup v-model="features" aria-label="Filter by feature">
              <DzCheckbox v-for="f in FEATURES" :key="f.value" :value="f.value">
                {{ f.label }}
              </DzCheckbox>
            </DzCheckboxGroup>
          </fieldset>

          <fieldset class="group">
            <legend class="group-title">Price</legend>
            <DzRangeSlider
              v-model="price"
              :min="PRICE_MIN"
              :max="PRICE_MAX"
              :step="10"
              aria-label="Filter by price"
            />
            <div class="price-readout">
              <span>${{ price[0] }}</span>
              <span>${{ price[1] }}{{ price[1] === PRICE_MAX ? '+' : '' }}</span>
            </div>
          </fieldset>
        </aside>

        <!-- ── Grid ────────────────────────────────────────────── -->
        <div class="results">
          <ul v-if="cards.length" class="grid">
            <li v-for="p in cards" :key="p.id">
              <DzImageCard
                :src="p.src"
                :alt="`${p.name} headphones in ${colourLabel(p.colour)}`"
                variant="outlined"
                aspect-ratio="5 / 4"
                class="card"
              >
                <template v-if="p.badge" #overlay>
                  <DzBadge
                    variant="solid"
                    :tone="p.badge === 'sale' ? 'danger' : p.badge === 'new' ? 'primary' : 'success'"
                    size="sm"
                    class="card-flag"
                  >
                    {{ BADGE_LABEL[p.badge] }}
                  </DzBadge>
                </template>

                <div class="card-body">
                  <div class="card-line">
                    <DzText weight="semibold" as="span">{{ p.name }}</DzText>
                    <span class="card-dot" :style="{ background: `var(${colourToken(p.colour)})` }" :title="colourLabel(p.colour)" />
                  </div>
                  <DzText size="sm" tone="muted" as="span">{{ p.kind }}</DzText>

                  <div class="card-rating">
                    <DzRating :value="p.rating" allow-half readonly size="sm" :aria-label="`${p.rating} out of 5`" />
                    <DzText size="xs" tone="muted" as="span">{{ p.rating.toFixed(1) }} ({{ p.reviewCount.toLocaleString('en-US') }})</DzText>
                  </div>

                  <div class="card-foot">
                    <span class="card-price">
                      <span class="now">${{ p.price }}</span>
                      <span v-if="p.compareAt" class="was">${{ p.compareAt }}</span>
                    </span>
                    <DzButton variant="solid" tone="primary" size="sm" :aria-label="`Add ${p.name} to cart`">
                      <template #prefix><ShoppingBag :size="15" aria-hidden="true" /></template>
                      Add
                    </DzButton>
                  </div>
                </div>
              </DzImageCard>
            </li>
          </ul>

          <DzEmpty
            v-else
            :icon="SearchX"
            title="No products match those filters"
            description="Try widening the price range or clearing a colour or feature."
            class="empty"
          >
            <template #actions>
              <DzButton variant="outline" tone="neutral" size="sm" @click="clearFilters">
                Clear all filters
              </DzButton>
            </template>
          </DzEmpty>

          <DzPagination
            v-if="total > PAGE_SIZE"
            v-model="page"
            :total="total"
            :page-size="PAGE_SIZE"
            class="pager"
            aria-label="Product pages"
          />
        </div>
      </div>
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
  max-width: 1180px;
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

.topnav a:hover,
.topnav a[aria-current='page'] {
  color: var(--dz-foreground);
}

/* ── Header ────────────────────────────────────────────────────── */
.wrap {
  padding-top: clamp(28px, 4vw, 48px);
  padding-bottom: 64px;
}

.head {
  margin-bottom: 28px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dz-primary);
}

.head-title {
  margin: 6px 0 8px;
  letter-spacing: -0.02em;
}

.head-lede {
  margin: 0;
  max-width: 60ch;
  line-height: 1.6;
}

/* ── Toolbar ───────────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--dz-border);
}

.count {
  font-weight: var(--dz-font-medium);
}

.sort {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  width: 200px;
}

/* ── Layout ────────────────────────────────────────────────────── */
.layout {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  gap: clamp(20px, 3vw, 40px);
  align-items: start;
}

/* ── Filter rail ───────────────────────────────────────────────── */
.filters {
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filters-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filters-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-semibold);
}

.group {
  margin: 0;
  padding: 0;
  border: 0;
}

.group-title {
  padding: 0;
  margin-bottom: 12px;
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dz-muted-foreground);
}

.opt {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: var(--dz-radius-full);
  border: 1px solid color-mix(in oklch, var(--dz-foreground) 20%, transparent);
}

.price-readout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  color: var(--dz-muted-foreground);
}

/* ── Grid ──────────────────────────────────────────────────────── */
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.card {
  height: 100%;
}

.card-flag {
  margin: 12px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 16px;
}

.card-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-dot {
  width: 14px;
  height: 14px;
  flex: none;
  border-radius: var(--dz-radius-full);
  border: 1px solid color-mix(in oklch, var(--dz-foreground) 20%, transparent);
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}

.card-price {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}

.now {
  font-size: var(--dz-text-lg);
  font-weight: var(--dz-font-bold);
}

.was {
  font-size: var(--dz-text-sm);
  color: var(--dz-muted-foreground);
  text-decoration: line-through;
}

.empty {
  padding: clamp(32px, 6vw, 64px) 24px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-xl);
}

.pager {
  margin-top: 28px;
  display: flex;
  justify-content: center;
}

/* ── Footer ────────────────────────────────────────────────────── */
.foot {
  max-width: 1180px;
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
@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .filters {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20px 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--dz-border);
  }
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .topnav {
    display: none;
  }
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
