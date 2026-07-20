<script setup lang="ts">
import type { CanonicalTone } from '@dzup-ui/contracts'
import type { Component } from 'vue'
/**
 * System Status — Utility template (docs/templates.md §6.6).
 *
 * A public status page (status.northwind.io): a brand lockup, a success-toned
 * DzAlert summarising overall health, a DzCard list of services each with a
 * status DzBadge and a 90-day uptime DzProgress bar, and a DzTimeline of past
 * incidents. Leans on the success/warning palette to read at a glance — a
 * deliberate counterpoint to the primary-tinted states + 404 utility pages.
 *
 * Built only from free `@dzup-ui/core` components, token-styled, light + dark,
 * reflows cleanly 390px → up. Heading order: one <h1>, an <h2> per section.
 */
import {
  DzAlert,
  DzBadge,
  DzButton,
  DzCard,
  DzDivider,
  DzHeading,
  DzProgress,
  DzText,
  DzTimeline,
  DzTimelineItem,
} from '@dzup-ui/core'
import {
  Activity,
  Bell,
  CheckCircle2,
  CreditCard,
  Database,
  Globe,
  Server,
  Webhook,
} from 'lucide-vue-next'

type ServiceStatus = 'operational' | 'degraded' | 'maintenance'

interface Service {
  icon: Component
  name: string
  description: string
  status: ServiceStatus
  /** 90-day uptime percentage. */
  uptime: number
}

const STATUS_META: Record<ServiceStatus, { label: string, tone: CanonicalTone }> = {
  operational: { label: 'Operational', tone: 'success' },
  degraded: { label: 'Degraded', tone: 'warning' },
  maintenance: { label: 'Maintenance', tone: 'info' },
}

const SERVICES: Service[] = [
  {
    icon: Globe,
    name: 'Web app & dashboard',
    description: 'app.northwind.io',
    status: 'operational',
    uptime: 99.99,
  },
  {
    icon: Server,
    name: 'REST & GraphQL API',
    description: 'api.northwind.io',
    status: 'operational',
    uptime: 99.98,
  },
  {
    icon: Database,
    name: 'Database & storage',
    description: 'Primary cluster · eu-central',
    status: 'operational',
    uptime: 99.95,
  },
  {
    icon: Webhook,
    name: 'Webhooks & events',
    description: 'Delivery pipeline',
    status: 'degraded',
    uptime: 99.41,
  },
  {
    icon: CreditCard,
    name: 'Billing & payments',
    description: 'Stripe integration',
    status: 'maintenance',
    uptime: 99.87,
  },
]

interface Incident {
  title: string
  detail: string
  when: string
  tone: CanonicalTone
}

const INCIDENTS: Incident[] = [
  {
    title: 'Elevated webhook delivery latency',
    detail:
      'We are investigating delayed webhook deliveries in the eu-central region. Events are queued and will be replayed — none are lost.',
    when: 'Investigating · 12 min ago',
    tone: 'warning',
  },
  {
    title: 'Scheduled billing maintenance',
    detail:
      'A short window of payment-provider maintenance is in progress. Card charges may be deferred and retried automatically.',
    when: 'Today · 09:00–10:00 UTC',
    tone: 'info',
  },
  {
    title: 'API latency fully recovered',
    detail:
      'A cache node was rotated out after a spike in p99 latency. Response times returned to baseline within 14 minutes.',
    when: 'Jun 22 · Resolved',
    tone: 'success',
  },
  {
    title: 'Dashboard sign-in disruption',
    detail:
      'An expired certificate briefly blocked SSO sign-ins. The certificate was rotated and sessions restored for all tenants.',
    when: 'Jun 18 · Resolved',
    tone: 'success',
  },
]
</script>

<template>
  <main class="status-page">
    <div class="status-wrap">
      <!-- ── Header ──────────────────────────────────────────────── -->
      <header class="status-head">
        <div class="head-row">
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Activity :size="18" /></span>
            <span class="brand-name">Northwind</span>
          </span>
          <DzButton variant="outline" tone="neutral" size="sm">
            <template #prefix>
              <Bell :size="15" aria-hidden="true" />
            </template>
            Subscribe to updates
          </DzButton>
        </div>
        <DzHeading :level="1" size="2xl" weight="semibold">
          System status
        </DzHeading>
      </header>

      <!-- ── Overall summary ─────────────────────────────────────── -->
      <DzAlert
        tone="success"
        variant="subtle"
        :icon="CheckCircle2"
        title="All core systems operational"
      >
        One service is in scheduled maintenance and one is degraded — everything
        else is running normally. Last checked just now.
      </DzAlert>

      <!-- ── Services ────────────────────────────────────────────── -->
      <section class="status-section" aria-labelledby="services-title">
        <DzHeading id="services-title" :level="2" size="md" weight="semibold">
          Current status
        </DzHeading>

        <DzCard variant="outlined" padding="none" class="service-card">
          <ul class="service-list">
            <template v-for="(svc, i) in SERVICES" :key="svc.name">
              <DzDivider v-if="i > 0" />
              <li class="service-row">
                <span class="service-icon" aria-hidden="true">
                  <component :is="svc.icon" :size="18" />
                </span>
                <span class="service-meta">
                  <DzText weight="medium" as="span">{{ svc.name }}</DzText>
                  <DzText size="sm" tone="muted" as="span">{{ svc.description }}</DzText>
                </span>
                <span class="service-uptime">
                  <DzText size="xs" tone="muted" as="span">{{ svc.uptime }}% · 90d</DzText>
                  <DzProgress
                    :value="svc.uptime"
                    size="sm"
                    :tone="STATUS_META[svc.status].tone"
                    class="uptime-bar"
                    :aria-label="`${svc.name} 90-day uptime`"
                  />
                </span>
                <DzBadge variant="subtle" :tone="STATUS_META[svc.status].tone" size="sm">
                  {{ STATUS_META[svc.status].label }}
                </DzBadge>
              </li>
            </template>
          </ul>
        </DzCard>
      </section>

      <!-- ── Past incidents ──────────────────────────────────────── -->
      <section class="status-section" aria-labelledby="incidents-title">
        <DzHeading id="incidents-title" :level="2" size="md" weight="semibold">
          Past incidents
        </DzHeading>

        <DzCard variant="outlined" padding="lg">
          <DzTimeline>
            <DzTimelineItem
              v-for="(incident, i) in INCIDENTS"
              :key="i"
              :tone="incident.tone"
              :status="incident.when"
            >
              <DzText weight="medium" as="div">
                {{ incident.title }}
              </DzText>
              <DzText size="sm" tone="muted" as="div" class="incident-detail">
                {{ incident.detail }}
              </DzText>
            </DzTimelineItem>
          </DzTimeline>
        </DzCard>
      </section>

      <footer class="status-foot">
        <DzText size="sm" tone="muted" as="span">
          Uptime measured across the last 90 days. Status history is retained for 12 months.
        </DzText>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.status-page {
  min-height: 100vh;
  width: 100%;
  padding: clamp(32px, 5vw, 72px) clamp(20px, 4vw, 56px);
  background:
    radial-gradient(circle at 50% -10%, color-mix(in oklch, var(--dz-success) 8%, transparent), transparent 55%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.status-wrap {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 3vw, 36px);
}

/* ── Header ─────────────────────────────────────────────────────── */
.status-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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
  background: var(--dz-success);
  color: var(--dz-success-foreground, #fff);
}

/* ── Sections ───────────────────────────────────────────────────── */
.status-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Services ───────────────────────────────────────────────────── */
.service-card {
  overflow: hidden;
}

.service-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.service-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
}

.service-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-muted);
  color: var(--dz-muted-foreground);
}

.service-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.service-uptime {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  width: 132px;
}

.uptime-bar {
  width: 100%;
}

.incident-detail {
  margin-top: 2px;
  line-height: 1.55;
  max-width: 60ch;
}

/* ── Footer ─────────────────────────────────────────────────────── */
.status-foot {
  padding-top: 4px;
  text-align: center;
}

@media (max-width: 560px) {
  .service-row {
    grid-template-columns: auto 1fr auto;
    row-gap: 12px;
  }
  /* Drop the uptime bar to its own full-width row under the name on mobile. */
  .service-uptime {
    grid-column: 2 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: auto;
  }
  .uptime-bar {
    flex: 1;
    margin-left: 12px;
    max-width: 160px;
  }
}
</style>
