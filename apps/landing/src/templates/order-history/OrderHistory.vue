<script setup lang="ts">
import type { DataViewSortOption } from '@dzup-ui/core'
import type { Order, OrderStatus } from './data.ts'
/**
 * Order History — Commerce template (docs/templates.md §6.5).
 *
 * A chromeless account orders page for the same specialty grocer as the
 * Checkout / Shopping Cart siblings ("Verdant Market"), completing the
 * browse → cart → buy → track → re-order journey. A searchable, status-filtered,
 * sortable and paginated `DzDataView` of past orders — each card carries its
 * reference and date, a status DzBadge, a DzList of the products, the order
 * total and view / reorder actions (Reorder shows a live "added to cart"
 * confirmation). Search, status chips, sort and paging are all real and
 * client-side, with a proper empty state when nothing matches.
 *
 * Built only from free `@dzup-ui/core` components and token-styled (no `lp-*`).
 * The brand accent is re-skinned to emerald entirely through `--dz-*` tokens
 * (no raw hex) — matching the Commerce category and its commerce siblings — so
 * every Dz component re-tints and stays correct in light + dark from 390px up.
 */
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDataView,
  DzHeading,
  DzList,
  DzListItem,
  DzSearchInput,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import { Eye, Leaf, Receipt, RotateCcw } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import {
  ACCOUNT,

  ORDERS,

  STATUS_FILTERS,
  STATUS_META,
} from './data.ts'

// ── Filter + search + sort state ─────────────────────────────────
const query = ref('')
const status = ref<OrderStatus | 'all'>('all')
const first = ref(0)

/** Sort choices rendered by DzDataView's built-in sort control. */
const SORT_OPTIONS: DataViewSortOption[] = [
  { label: 'Newest first', field: 'sortKey', order: -1 },
  { label: 'Oldest first', field: 'sortKey', order: 1 },
  { label: 'Highest total', field: 'total', order: -1 },
]

/** Orders narrowed by the status chip and the search query (id or product). */
const filtered = computed<Order[]>(() => {
  const q = query.value.trim().toLowerCase()
  return ORDERS.filter((order) => {
    const inStatus = status.value === 'all' || order.status === status.value
    const inQuery
      = !q
        || order.id.toLowerCase().includes(q)
        || order.items.some(item => item.name.toLowerCase().includes(q))
    return inStatus && inQuery
  })
})

// Reset to the first page whenever the filter set changes, so paging never
// strands the view on a now-empty page.
watch([query, status], () => {
  first.value = 0
})

function resetFilters(): void {
  query.value = ''
  status.value = 'all'
}

// ── Account summary stats ────────────────────────────────────────
const totalOrders = computed(() => ORDERS.length)
const totalSpent = computed(() =>
  ORDERS.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
)

// ── Reorder (live "added to cart" confirmation) ──────────────────
const reordered = ref<Set<string>>(new Set())
function reorder(id: string): void {
  const next = new Set(reordered.value)
  next.add(id)
  reordered.value = next
  // Clear the confirmation after a moment so it reads as a transient toast.
  window.setTimeout(() => {
    const after = new Set(reordered.value)
    after.delete(id)
    reordered.value = after
  }, 2600)
}

/** Format a number as a 2-dp price string. */
function money(n: number): string {
  return `$${n.toFixed(2)}`
}

/** First letter of an item name, for its decorative tile. */
function initial(name: string): string {
  return name.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="orders">
    <!-- ── Account bar ────────────────────────────────────────── -->
    <header class="topbar">
      <div class="topbar-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Leaf :size="18" /></span>
          <span class="brand-name">Verdant Market</span>
        </span>
        <span class="account">
          <DzText size="sm" weight="medium" as="span">{{ ACCOUNT.name }}</DzText>
          <DzText size="sm" tone="muted" as="span" class="account-email">{{ ACCOUNT.email }}</DzText>
        </span>
      </div>
    </header>

    <main class="wrap">
      <!-- ── Header + stats ───────────────────────────────────── -->
      <section class="head">
        <div class="head-copy">
          <DzHeading :level="1" size="2xl" weight="bold">
            Order history
          </DzHeading>
          <DzText size="sm" tone="muted" as="p">
            Every order you've placed with us — search, re-order favourites or track a recent one.
          </DzText>
        </div>
        <div class="stats">
          <div class="stat">
            <DzText size="xs" tone="muted" as="span" class="stat-label">
              Orders
            </DzText>
            <DzText size="lg" weight="bold" as="span">
              {{ totalOrders }}
            </DzText>
          </div>
          <div class="stat">
            <DzText size="xs" tone="muted" as="span" class="stat-label">
              Total spent
            </DzText>
            <DzText size="lg" weight="bold" as="span">
              {{ money(totalSpent) }}
            </DzText>
          </div>
          <div class="stat">
            <DzText size="xs" tone="muted" as="span" class="stat-label">
              Member since
            </DzText>
            <DzText size="lg" weight="bold" as="span">
              {{ ACCOUNT.memberSince }}
            </DzText>
          </div>
        </div>
      </section>

      <!-- ── Toolbar ──────────────────────────────────────────── -->
      <div class="toolbar">
        <div class="filters" role="group" aria-label="Filter orders by status">
          <DzTag
            v-for="f in STATUS_FILTERS"
            :key="f.value"
            :variant="status === f.value ? 'solid' : 'outline'"
            :tone="status === f.value ? 'primary' : 'neutral'"
            size="md"
            role="button"
            tabindex="0"
            class="filter"
            @click="status = f.value"
            @keydown.enter.prevent="status = f.value"
            @keydown.space.prevent="status = f.value"
          >
            {{ f.label }}
          </DzTag>
        </div>
        <DzSearchInput
          v-model="query"
          placeholder="Search by order # or product"
          clearable
          size="md"
          aria-label="Search orders"
          class="search"
        />
      </div>

      <!-- ── Orders ───────────────────────────────────────────── -->
      <DzDataView
        v-model:first="first"
        :items="filtered"
        data-key="id"
        paginator
        :rows="4"
        :sort-options="SORT_OPTIONS"
        empty-title="No orders found"
        empty-description="Try a different search term or clear the status filter."
        aria-label="Past orders"
        class="orders-view"
      >
        <template #item="{ item }">
          <DzCard variant="outlined" padding="lg" class="order">
            <div class="order-head">
              <div class="order-id">
                <span class="order-icon" aria-hidden="true"><Receipt :size="18" /></span>
                <div class="order-id-text">
                  <DzText weight="semibold" as="span">
                    Order {{ item.id }}
                  </DzText>
                  <DzText size="sm" tone="muted" as="span">
                    Placed {{ item.date }}
                  </DzText>
                </div>
              </div>
              <DzBadge :tone="STATUS_META[item.status].tone" variant="subtle" size="md">
                {{ STATUS_META[item.status].label }}
              </DzBadge>
            </div>

            <DzList variant="divided" size="sm" class="order-items" aria-label="Items in this order">
              <DzListItem v-for="(it, i) in item.items" :key="i">
                <div class="oi">
                  <span class="oi-tile" :style="{ filter: `hue-rotate(${it.hue}deg)` }" aria-hidden="true">
                    {{ initial(it.name) }}
                  </span>
                  <DzText size="sm" weight="medium" as="span" class="oi-name">
                    {{ it.name }}
                  </DzText>
                  <DzBadge variant="subtle" tone="neutral" size="sm">
                    ×{{ it.qty }}
                  </DzBadge>
                </div>
              </DzListItem>
            </DzList>

            <div class="order-foot">
              <div class="order-total">
                <DzText size="sm" tone="muted" as="span">
                  Order total
                </DzText>
                <DzText size="lg" weight="bold" as="span">
                  {{ money(item.total) }}
                </DzText>
              </div>
              <div class="order-actions">
                <DzBadge
                  v-if="reordered.has(item.id)"
                  tone="success"
                  variant="subtle"
                  size="sm"
                  class="reorder-flash"
                >
                  Added to cart
                </DzBadge>
                <DzButton variant="outline" tone="neutral" size="sm">
                  <template #prefix>
                    <Eye :size="15" aria-hidden="true" />
                  </template>
                  View order
                </DzButton>
                <DzButton
                  variant="solid"
                  tone="primary"
                  size="sm"
                  :disabled="item.status === 'cancelled'"
                  @click="reorder(item.id)"
                >
                  <template #prefix>
                    <RotateCcw :size="15" aria-hidden="true" />
                  </template>
                  Reorder
                </DzButton>
              </div>
            </div>
          </DzCard>
        </template>

        <template #empty>
          <div class="no-results">
            <DzText tone="muted" as="p">
              No orders match your search.
            </DzText>
            <DzButton variant="outline" size="sm" @click="resetFilters">
              Clear filters
            </DzButton>
          </div>
        </template>
      </DzDataView>
    </main>

    <footer class="foot">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Leaf :size="16" /></span>
        <span class="brand-name">Verdant Market</span>
      </span>
      <DzText size="sm" tone="muted">
        © 2026 Verdant Market. Good food, sourced well.
      </DzText>
    </footer>
  </div>
</template>

<style scoped>
/* Re-skin the brand accent to emerald entirely through tokens (ADR-04) — every
   Dz component below inherits it and stays correct in light + dark. */
.orders {
  --dz-primary: var(--dz-success);
  --dz-primary-hover: var(--dz-success);
  --dz-primary-foreground: var(--dz-success-foreground);
  --dz-primary-muted: var(--dz-success-muted);
  --dz-primary-muted-foreground: var(--dz-success-muted-foreground);
  --dz-ring: var(--dz-success);

  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  min-height: 100vh;
}

/* ── Account bar ───────────────────────────────────────────────── */
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
  max-width: 960px;
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

.account {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

/* ── Layout ────────────────────────────────────────────────────── */
.wrap {
  padding-top: clamp(24px, 4vw, 40px);
  padding-bottom: 64px;
}

/* ── Header + stats ────────────────────────────────────────────── */
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: clamp(20px, 3vw, 28px);
}

.head-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.stats {
  display: flex;
  gap: 12px;
  flex: none;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-lg);
  background: var(--dz-surface);
  min-width: 92px;
}

.stat-label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Toolbar ───────────────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: clamp(16px, 3vw, 24px);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.filter {
  cursor: pointer;
  user-select: none;
}

.search {
  flex: none;
  width: min(280px, 42vw);
}

/* ── Orders ────────────────────────────────────────────────────── */
.orders-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.order-id {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.order-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
}

.order-id-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  line-height: 1.35;
}

.order-items {
  margin: 0;
}

.oi {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.oi-tile {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: var(--dz-radius-md);
  background: color-mix(in oklch, var(--dz-primary) 16%, transparent);
  color: var(--dz-primary);
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-bold);
}

.oi-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oi .dz-badge,
.oi :last-child {
  margin-left: auto;
}

.order-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.order-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.order-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.reorder-flash {
  white-space: nowrap;
}

/* ── Empty ─────────────────────────────────────────────────────── */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: clamp(40px, 8vw, 72px) 24px;
  text-align: center;
}

/* ── Footer ────────────────────────────────────────────────────── */
.foot {
  max-width: 960px;
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
@media (max-width: 720px) {
  .head {
    flex-direction: column;
    align-items: stretch;
  }
  .stats {
    width: 100%;
  }
  .stat {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 600px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search {
    width: 100%;
  }
  .account-email {
    display: none;
  }
}
</style>
