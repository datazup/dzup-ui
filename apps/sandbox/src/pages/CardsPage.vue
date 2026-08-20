<script setup lang="ts">
import {
  DzButton,
  DzCard,
  DzCardBody,
  DzCardFooter,
  DzCardHeader,
  DzImageCard,
  DzStatCard,
} from '@dzup-ui/core'
import { Activity, DollarSign, TrendingDown, Users } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const clickCount = ref(0)
const interactiveVariant = ref<'elevated' | 'outlined' | 'flat'>('elevated')
const interactivePadding = ref<'none' | 'sm' | 'md' | 'lg'>('md')

const kpiVariant = ref<'elevated' | 'outlined'>('elevated')
const revenue = ref(48250)
const activeUsers = ref(12340)
const churn = ref(3.2)

const stats = computed(() => {
  const growth = Math.round((revenue.value / 1000) * 10) / 10
  return [
    {
      title: 'Revenue',
      value: `$${revenue.value.toLocaleString()}`,
      description: 'vs previous month',
      trend: 'up' as const,
      trendValue: '+12.4%',
      icon: DollarSign,
    },
    {
      title: 'Active Users',
      value: activeUsers.value.toLocaleString(),
      description: 'weekly active accounts',
      trend: 'up' as const,
      trendValue: '+5.8%',
      icon: Users,
    },
    {
      title: 'Churn Rate',
      value: `${churn.value.toFixed(1)}%`,
      description: 'monthly churn',
      trend: 'down' as const,
      trendValue: '-0.6%',
      icon: TrendingDown,
    },
    {
      title: 'Growth Index',
      value: growth,
      description: 'normalized growth score',
      trend: 'neutral' as const,
      trendValue: '0.0%',
      icon: Activity,
    },
  ]
})

function randomizeKpis(): void {
  revenue.value = Math.max(20000, Math.round(revenue.value + (Math.random() - 0.5) * 12000))
  activeUsers.value = Math.max(3000, Math.round(activeUsers.value + (Math.random() - 0.5) * 2000))
  churn.value = Math.max(0.8, Math.min(8, churn.value + (Math.random() - 0.5) * 1.4))
}

const aspectRatios = ['1/1', '4/3', '16/9', '21/9'] as const
const aspectImages: Record<(typeof aspectRatios)[number], string> = {
  '1/1': 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=600&h=600&fit=crop',
  '4/3': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
  '16/9': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&h=506&fit=crop',
  '21/9': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1050&h=450&fit=crop',
}

const skeletonLoading = ref(true)
function toggleSkeleton(): void {
  skeletonLoading.value = !skeletonLoading.value
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">
        Cards
      </h1>
      <p class="page-description">
        Surface and content-card components for dashboard metrics, media blocks, and interactive layouts.
      </p>
    </header>

    <section class="demo-section">
      <h2 class="section-title">
        Surface Variants
      </h2>
      <div class="variant-grid">
        <DzCard variant="elevated">
          <DzCardBody>
            <h3 class="card-title">
              Elevated
            </h3>
            <p class="card-text">
              Use for primary content surfaces where depth and separation are needed.
            </p>
          </DzCardBody>
        </DzCard>

        <DzCard variant="outlined">
          <DzCardBody>
            <h3 class="card-title">
              Outlined
            </h3>
            <p class="card-text">
              Use for dense layouts where borders should define structure without heavy shadows.
            </p>
          </DzCardBody>
        </DzCard>

        <DzCard variant="flat">
          <DzCardBody>
            <h3 class="card-title">
              Flat
            </h3>
            <p class="card-text">
              Use inside already-elevated sections to avoid nested visual weight.
            </p>
          </DzCardBody>
        </DzCard>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Surface Behavior
      </h2>
      <p class="section-hint">
        <code>hoverable</code> and <code>clickable</code> are independent. Hover lift is purely visual;
        clickable adds <code>role="button"</code>, <code>tabindex="0"</code>, and Enter/Space activation.
      </p>

      <div class="variant-grid">
        <DzCard variant="outlined">
          <DzCardBody>
            <h3 class="card-title">
              Static
            </h3>
            <p class="card-text">
              Neither hoverable nor clickable. Default surface behavior.
            </p>
          </DzCardBody>
        </DzCard>

        <DzCard hoverable variant="outlined">
          <DzCardBody>
            <h3 class="card-title">
              Hoverable only
            </h3>
            <p class="card-text">
              Lifts on hover but is not focusable or activatable. Use for content groups that should
              feel responsive without implying an action.
            </p>
          </DzCardBody>
        </DzCard>

        <DzCard clickable variant="outlined">
          <DzCardBody>
            <h3 class="card-title">
              Clickable only
            </h3>
            <p class="card-text">
              Adds button semantics and keyboard support; no hover lift. Useful when the visual
              affordance is provided by surrounding context (e.g. a list row).
            </p>
          </DzCardBody>
        </DzCard>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Interactive Composition
      </h2>

      <div class="controls-row">
        <DzButton size="sm" variant="outline" @click="interactiveVariant = 'elevated'">
          Elevated
        </DzButton>
        <DzButton size="sm" variant="outline" @click="interactiveVariant = 'outlined'">
          Outlined
        </DzButton>
        <DzButton size="sm" variant="outline" @click="interactiveVariant = 'flat'">
          Flat
        </DzButton>
        <DzButton size="sm" variant="ghost" @click="interactivePadding = interactivePadding === 'lg' ? 'sm' : 'lg'">
          Toggle Padding
        </DzButton>
      </div>

      <DzCard
        clickable
        hoverable
        :variant="interactiveVariant"
        :padding="interactivePadding"
        class="interactive-card"
        @click="clickCount += 1"
      >
        <template #header>
          <DzCardHeader>
            <h3 class="card-title">
              Clickable Product Card
            </h3>
            <template #actions>
              <DzButton size="sm" variant="ghost" tone="neutral" @click.stop>
                Edit
              </DzButton>
            </template>
          </DzCardHeader>
        </template>

        <DzCardBody>
          <p class="card-text">
            This card demonstrates click handling, configurable variant/padding, and structured slots.
            Keyboard interaction also works via Enter and Space on the card surface.
          </p>
        </DzCardBody>

        <template #footer>
          <DzCardFooter>
            <span class="meta">Clicked: {{ clickCount }}</span>
            <DzButton size="sm" tone="primary" @click.stop>
              Open
            </DzButton>
          </DzCardFooter>
        </template>
      </DzCard>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Padding
      </h2>
      <p class="section-hint">
        Padding controls only the body inset. Use <code>padding="none"</code> when child content
        needs to bleed to the surface edge (charts, images, tables).
      </p>

      <div class="variant-grid">
        <DzCard padding="sm" variant="outlined">
          <h3 class="card-title">
            sm
          </h3>
          <p class="card-text">
            Compact inset for dense lists.
          </p>
        </DzCard>

        <DzCard padding="md" variant="outlined">
          <h3 class="card-title">
            md
          </h3>
          <p class="card-text">
            Default inset; balanced for most content.
          </p>
        </DzCard>

        <DzCard padding="lg" variant="outlined">
          <h3 class="card-title">
            lg
          </h3>
          <p class="card-text">
            Spacious inset for marketing or hero surfaces.
          </p>
        </DzCard>
      </div>

      <DzCard padding="none" variant="outlined" class="bleed-card">
        <div class="bleed-chart">
          <div v-for="(h, i) in [40, 65, 30, 80, 55, 90, 45, 70, 35, 60, 75, 50]" :key="i" class="bleed-bar" :style="{ height: `${h}%` }" />
        </div>
        <DzCardBody>
          <h3 class="card-title">
            Edge-to-edge media
          </h3>
          <p class="card-text">
            <code>padding="none"</code> lets the bar chart above span the full surface width while the
            body still uses normal text spacing.
          </p>
        </DzCardBody>
      </DzCard>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Media Slot vs DzImageCard
      </h2>
      <p class="section-hint">
        <code>DzCard</code>'s <code>media</code> slot is a structural anchor for any media element
        (carousel, video, custom layout). <code>DzImageCard</code> is the shortcut when a single image
        with alt text and aspect ratio is enough.
      </p>

      <div class="image-grid">
        <DzCard variant="elevated" padding="none">
          <template #media>
            <div class="media-stack">
              <img
                src="https://images.unsplash.com/photo-1483653364400-eedcfb9f1f88?w=900&h=300&fit=crop"
                alt="Abstract gradient skyline"
                class="media-image"
              >
              <span class="media-badge">media slot</span>
            </div>
          </template>
          <DzCardBody>
            <h3 class="card-title">
              Custom media composition
            </h3>
            <p class="card-text">
              Wraps any element — here a layered image plus floating badge — without the
              <code>aspectRatio</code> / <code>alt</code> contract that <code>DzImageCard</code> enforces.
            </p>
          </DzCardBody>
        </DzCard>

        <DzImageCard
          src="https://images.unsplash.com/photo-1483653364400-eedcfb9f1f88?w=900&h=300&fit=crop"
          alt="Same abstract gradient skyline, rendered via DzImageCard"
          aspect-ratio="3/1"
          variant="elevated"
        >
          <h3 class="card-title">
            DzImageCard equivalent
          </h3>
          <p class="card-text">
            Same source image but rendered through <code>DzImageCard</code>. Enforces alt text and
            aspect ratio; fewer knobs, less template code.
          </p>
        </DzImageCard>
      </div>
    </section>

    <section class="demo-section">
      <h2 class="section-title">
        Image Cards
      </h2>

      <div class="image-grid">
        <DzImageCard
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=520&fit=crop"
          alt="Snow-covered mountain range at sunrise"
          aspect-ratio="16/9"
          variant="elevated"
        >
          <template #header>
            <span class="pill">Featured</span>
          </template>
          <h3 class="card-title">
            Alpine Campaign
          </h3>
          <p class="card-text">
            Hero media card suitable for featured campaign content and editorial highlights.
          </p>
          <template #footer>
            <div class="footer-inline">
              <span class="meta">Updated 2h ago</span>
              <a class="link" href="#" @click.prevent>View details</a>
            </div>
          </template>
        </DzImageCard>

        <DzImageCard
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&h=520&fit=crop"
          alt="City skyline in evening light"
          aspect-ratio="16/9"
          variant="outlined"
        >
          <template #overlay>
            <div class="overlay-top">
              <span class="pill dark">Analytics</span>
            </div>
          </template>
          <h3 class="card-title">
            City Insights
          </h3>
          <p class="card-text">
            Example with image overlay content and compact metadata footer.
          </p>
          <template #footer>
            <div class="footer-inline">
              <span class="meta">52K impressions</span>
              <a class="link" href="#" @click.prevent>Open report</a>
            </div>
          </template>
        </DzImageCard>
      </div>

      <h3 class="subsection-title">
        Aspect Ratios
      </h3>
      <div class="aspect-grid">
        <div v-for="ratio in aspectRatios" :key="ratio" class="aspect-cell">
          <DzImageCard
            :src="aspectImages[ratio]"
            :alt="`Sample landscape rendered at ${ratio}`"
            :aspect-ratio="ratio"
            variant="outlined"
          >
            <span class="ratio-label">{{ ratio }}</span>
          </DzImageCard>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <div class="section-head">
        <h2 class="section-title">
          Stat Cards
        </h2>
        <div class="controls-row">
          <DzButton size="sm" variant="outline" @click="kpiVariant = 'elevated'">
            Elevated
          </DzButton>
          <DzButton size="sm" variant="outline" @click="kpiVariant = 'outlined'">
            Outlined
          </DzButton>
          <DzButton size="sm" tone="primary" @click="randomizeKpis">
            Randomize
          </DzButton>
        </div>
      </div>

      <div class="kpi-grid">
        <DzStatCard
          v-for="item in stats"
          :key="item.title"
          :title="item.title"
          :value="item.value"
          :description="item.description"
          :trend="item.trend"
          :trend-value="item.trendValue"
          :icon="item.icon"
          :variant="kpiVariant"
        />
      </div>

      <h3 class="subsection-title">
        Slot Overrides
      </h3>
      <div class="kpi-grid kpi-grid-2">
        <DzStatCard
          title="Avg Order Value"
          :value="187"
          :icon="DollarSign"
          :variant="kpiVariant"
        >
          <template #value>
            <span class="value-number">$187</span>
            <span class="value-unit">/order</span>
          </template>
        </DzStatCard>

        <DzStatCard
          title="API Latency"
          value="142ms"
          :icon="Activity"
          :variant="kpiVariant"
        >
          <template #footer>
            <div class="sparkline" aria-hidden="true">
              <span v-for="(h, i) in [30, 50, 35, 70, 45, 60, 55, 80, 65]" :key="i" :style="{ height: `${h}%` }" />
            </div>
            <span class="meta">last 9 mins · p95</span>
          </template>
        </DzStatCard>
      </div>
    </section>

    <section class="demo-section">
      <div class="section-head">
        <h2 class="section-title">
          Skeleton Placeholders
        </h2>
        <DzButton size="sm" variant="outline" @click="toggleSkeleton">
          {{ skeletonLoading ? 'Show loaded' : 'Show skeleton' }}
        </DzButton>
      </div>
      <p class="section-hint">
        Markup-only placeholders for now — surfaces the case for a future <code>loading</code> prop or
        a <code>DzSkeleton</code> primitive in <code>@dzup-ui/core</code>.
      </p>

      <div class="variant-grid">
        <DzCard v-if="skeletonLoading" variant="outlined" aria-busy="true" aria-live="polite">
          <DzCardBody>
            <div class="sk sk-title" />
            <div class="sk sk-line" />
            <div class="sk sk-line sk-short" />
          </DzCardBody>
        </DzCard>
        <DzCard v-else variant="outlined">
          <DzCardBody>
            <h3 class="card-title">
              Article Card
            </h3>
            <p class="card-text">
              Real content replaces the placeholder once data is ready.
            </p>
          </DzCardBody>
        </DzCard>

        <DzCard v-if="skeletonLoading" variant="outlined" aria-busy="true" aria-live="polite">
          <DzCardBody>
            <div class="sk sk-pill" />
            <div class="sk sk-value" />
            <div class="sk sk-line sk-short" />
          </DzCardBody>
        </DzCard>
        <DzStatCard
          v-else
          title="Conversions"
          value="2,184"
          description="vs previous week"
          trend="up"
          trend-value="+9.1%"
          :icon="Activity"
          variant="outlined"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 1120px;
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 8px;
}

.page-description {
  font-size: 15px;
  color: var(--dz-muted-foreground, #64748b);
  margin: 0;
  line-height: 1.6;
  max-width: 820px;
}

.demo-section {
  margin-bottom: 24px;
  padding: 24px;
  border-radius: var(--dz-radius-lg, 8px);
  border: 1px solid var(--dz-border, #e2e8f0);
  background: var(--dz-surface, #fff);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
  margin: 0 0 14px;
}

.subsection-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dz-muted-foreground, #64748b);
  margin: 22px 0 12px;
}

.section-hint {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  line-height: 1.55;
}

.section-hint code,
.card-text code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.92em;
  padding: 1px 5px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.variant-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interactive-card {
  margin-top: 10px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.aspect-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.aspect-cell {
  position: relative;
}

.ratio-label {
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.value-number {
  font-size: inherit;
  font-weight: inherit;
}

.value-unit {
  margin-left: 4px;
  font-size: 0.55em;
  font-weight: 500;
  color: var(--dz-muted-foreground, #64748b);
  vertical-align: middle;
}

.sparkline {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 18px;
  margin-right: 8px;
  vertical-align: middle;
}

.sparkline span {
  width: 3px;
  border-radius: 1px;
  background: var(--dz-primary, #2563eb);
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--dz-foreground, #1a202c);
}

.card-text {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--dz-muted-foreground, #64748b);
  line-height: 1.55;
}

.meta {
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
}

.pill {
  display: inline-flex;
  align-items: center;
  border-radius: var(--dz-radius-full, 9999px);
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dz-primary-muted-foreground, #1d4ed8);
  background: var(--dz-primary-muted, #dbeafe);
}

.pill.dark {
  color: var(--dz-primary-foreground, oklch(1 0 0));
  background: color-mix(in oklch, var(--dz-foreground, #111827) 65%, transparent);
}

.footer-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.overlay-top {
  position: absolute;
  top: 10px;
  right: 10px;
}

.link {
  color: var(--dz-primary, #2563eb);
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.bleed-card {
  margin-top: 14px;
  overflow: hidden;
}

.bleed-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
  padding: 14px;
  background: color-mix(in oklch, var(--dz-primary, #2563eb) 8%, transparent);
}

.bleed-bar {
  flex: 1;
  border-radius: var(--dz-radius-sm, 4px) var(--dz-radius-sm, 4px) 0 0;
  background: var(--dz-primary, #2563eb);
  opacity: 0.85;
}

.media-stack {
  position: relative;
}

.media-image {
  display: block;
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.media-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  border-radius: var(--dz-radius-full, 9999px);
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--dz-primary-foreground, oklch(1 0 0));
  background: color-mix(in oklch, var(--dz-foreground, #111827) 65%, transparent);
}

.sk {
  border-radius: var(--dz-radius-sm, 4px);
  background: linear-gradient(
    90deg,
    var(--dz-muted, #f1f5f9) 0%,
    color-mix(in oklch, var(--dz-muted, #f1f5f9) 70%, var(--dz-border, #e2e8f0)) 50%,
    var(--dz-muted, #f1f5f9) 100%
  );
  background-size: 200% 100%;
  animation: sk-shimmer 1.4s ease-in-out infinite;
}

.sk-title {
  width: 60%;
  height: 14px;
  margin-bottom: 12px;
}

.sk-line {
  width: 100%;
  height: 10px;
  margin-top: 8px;
}

.sk-short {
  width: 45%;
}

.sk-pill {
  width: 40%;
  height: 10px;
  margin-bottom: 14px;
}

.sk-value {
  width: 55%;
  height: 22px;
  margin-bottom: 10px;
}

@keyframes sk-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .sk {
    animation: none;
  }
}

@media (max-width: 1100px) {
  .variant-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .aspect-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .demo-section {
    padding: 18px;
  }

  .image-grid,
  .kpi-grid,
  .kpi-grid-2,
  .aspect-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
