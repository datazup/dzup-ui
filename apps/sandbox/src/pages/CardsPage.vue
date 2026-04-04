<script setup lang="ts">
import {
  DzCard,
  DzCardBody,
  DzCardFooter,
  DzCardHeader,
  DzImageCard,
  DzStatCard,
  DzButton,
} from '@dzup-ui/core'
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
    },
    {
      title: 'Active Users',
      value: activeUsers.value.toLocaleString(),
      description: 'weekly active accounts',
      trend: 'up' as const,
      trendValue: '+5.8%',
    },
    {
      title: 'Churn Rate',
      value: `${churn.value.toFixed(1)}%`,
      description: 'monthly churn',
      trend: 'down' as const,
      trendValue: '-0.6%',
    },
    {
      title: 'Growth Index',
      value: growth,
      description: 'normalized growth score',
      trend: 'neutral' as const,
      trendValue: '0.0%',
    },
  ]
})

function randomizeKpis(): void {
  revenue.value = Math.max(20000, Math.round(revenue.value + (Math.random() - 0.5) * 12000))
  activeUsers.value = Math.max(3000, Math.round(activeUsers.value + (Math.random() - 0.5) * 2000))
  churn.value = Math.max(0.8, Math.min(8, churn.value + (Math.random() - 0.5) * 1.4))
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
          :variant="kpiVariant"
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
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
  color: oklch(1 0 0);
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

@media (max-width: 1100px) {
  .variant-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .demo-section {
    padding: 18px;
  }

  .image-grid,
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
