<script setup lang="ts">
/**
 * User Profile — full-page profile template (docs/templates.md §6.1).
 *
 * A centered profile surface: a banner DzCard with a large DzAvatar, name,
 * DzBadge status chips and action DzButtons; a stat row; then DzTabs switching
 * between an Overview panel (DzDescriptions detail grid) and an Activity panel
 * (DzTimeline). Built only from free `@dzup-ui/core` components, token-styled,
 * light + dark, reflows to 390px.
 */
import {
  DzAvatar,
  DzBadge,
  DzButton,
  DzCard,
  DzDescriptions,
  DzDescriptionsItem,
  DzHeading,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
  DzTimeline,
  DzTimelineItem,
} from '@dzup-ui/core'
import { BadgeCheck, MapPin, MessageSquare, Pencil } from 'lucide-vue-next'
import { ref } from 'vue'
import { ACTIVITY, FACTS, STATS } from './data.ts'

const tab = ref('overview')

const about =
  'Product designer turned design-systems lead. I work at the seam between ' +
  'engineering and design — shipping accessible components, refining tokens, ' +
  'and keeping the gap between Figma and production as small as possible.'
</script>

<template>
  <div class="profile-page">
    <div class="profile-wrap">
      <DzCard variant="elevated" padding="none" class="banner">
        <div class="banner-cover" aria-hidden="true" />
        <div class="banner-body">
          <DzAvatar fallback="AR" size="xl" class="banner-avatar" />
          <div class="banner-main">
            <div class="banner-head">
              <div class="banner-id">
                <div class="name-row">
                  <DzHeading :level="1" size="xl" weight="semibold">Ava Restić</DzHeading>
                  <DzBadge variant="subtle" tone="primary" size="sm">
                    <template #default>
                      <span class="badge-inline">
                        <BadgeCheck :size="13" aria-hidden="true" /> Verified
                      </span>
                    </template>
                  </DzBadge>
                </div>
                <DzText tone="muted" as="p" class="role">Design Systems Lead · Northwind</DzText>
                <DzText size="sm" tone="muted" as="p" class="loc">
                  <MapPin :size="14" aria-hidden="true" /> Berlin, Germany
                </DzText>
              </div>

              <div class="banner-actions">
                <DzButton variant="outline" tone="neutral" size="sm">
                  <template #prefix><MessageSquare :size="15" aria-hidden="true" /></template>
                  Message
                </DzButton>
                <DzButton variant="solid" tone="primary" size="sm">
                  <template #prefix><Pencil :size="15" aria-hidden="true" /></template>
                  Edit profile
                </DzButton>
              </div>
            </div>

            <ul class="stat-row">
              <li v-for="s in STATS" :key="s.label" class="stat">
                <DzText weight="semibold" as="div" class="stat-value">{{ s.value }}</DzText>
                <DzText size="xs" tone="muted" as="div">{{ s.label }}</DzText>
              </li>
            </ul>
          </div>
        </div>
      </DzCard>

      <DzTabs v-model="tab" variant="line" aria-label="Profile sections" class="profile-tabs">
        <DzTabList>
          <DzTabTrigger value="overview">Overview</DzTabTrigger>
          <DzTabTrigger value="activity">Activity</DzTabTrigger>
        </DzTabList>

        <DzTabContent value="overview">
          <div class="overview">
            <DzCard variant="outlined" padding="md">
              <DzText weight="semibold" as="div" class="card-title">About</DzText>
              <DzText tone="muted" as="p" class="about">{{ about }}</DzText>
            </DzCard>

            <DzCard variant="outlined" padding="md">
              <DzText weight="semibold" as="div" class="card-title">Details</DzText>
              <DzDescriptions :columns="{ base: 1, sm: 2 }" layout="vertical" size="sm">
                <DzDescriptionsItem v-for="f in FACTS" :key="f.label" :label="f.label">
                  {{ f.value }}
                </DzDescriptionsItem>
              </DzDescriptions>
            </DzCard>
          </div>
        </DzTabContent>

        <DzTabContent value="activity">
          <DzCard variant="outlined" padding="md">
            <DzText weight="semibold" as="div" class="card-title">Recent activity</DzText>
            <DzTimeline>
              <DzTimelineItem
                v-for="(event, i) in ACTIVITY"
                :key="i"
                :tone="event.tone"
                :status="event.when"
              >
                <DzText weight="medium" as="div">{{ event.title }}</DzText>
                <DzText size="sm" tone="muted" as="div">{{ event.detail }}</DzText>
              </DzTimelineItem>
            </DzTimeline>
          </DzCard>
        </DzTabContent>
      </DzTabs>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  width: 100%;
  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  padding: clamp(20px, 4vw, 48px);
}

.profile-wrap {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.banner {
  overflow: hidden;
}

.banner-cover {
  height: 116px;
  background:
    radial-gradient(circle at 16% 20%, color-mix(in oklch, var(--dz-primary) 38%, transparent), transparent 60%),
    var(--dz-primary);
}

.banner-body {
  position: relative;
  display: flex;
  gap: 18px;
  padding: 0 clamp(16px, 3vw, 28px) clamp(16px, 3vw, 24px);
}

.banner-avatar {
  margin-top: -36px;
  flex-shrink: 0;
  outline: 4px solid var(--dz-card);
  border-radius: var(--dz-radius-full);
}

.banner-main {
  flex: 1;
  min-width: 0;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.banner-id {
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.role {
  margin-top: 2px;
}

.loc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.banner-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.stat-row {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 28px;
}

.stat-value {
  font-size: var(--dz-text-lg);
}

.card-title {
  margin-bottom: 12px;
}

.about {
  line-height: 1.6;
}

.overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
  align-items: start;
}

.profile-tabs {
  width: 100%;
}

@media (max-width: 720px) {
  .overview {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .banner-actions {
    width: 100%;
  }
  .stat-row {
    gap: 20px;
  }
}
</style>
