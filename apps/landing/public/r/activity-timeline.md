# Activity timeline

A vertical DzTimeline feed of events — tone-coded dots, timestamp statuses, avatar indicators, and per-item tags for a "who did what, when" history.

- **Category:** Data display
- **Components:** DzTimeline, DzTimelineItem, DzAvatar, DzBadge, DzTag, DzText, DzCard
- **Preview:** /blocks/activity-timeline

```vue
<script setup lang="ts">
/**
 * Activity timeline — a vertical feed of events built from DzTimeline.
 *
 * DzTimeline lays out a connected rail; each DzTimelineItem carries a semantic
 * `tone` dot and a `status` (the timestamp). The `#indicator` slot swaps the
 * default dot for a DzAvatar, and each item body pairs a DzText title/detail
 * with a tokenised DzTag / DzBadge — the standard "who did what, when" pattern.
 *
 * Self-contained: local static data, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import {
  DzAvatar,
  DzBadge,
  DzCard,
  DzHeading,
  DzTag,
  DzText,
  DzTimeline,
  DzTimelineItem,
} from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'

interface Event {
  id: number
  actor: string
  initials: string
  tone: CanonicalTone
  status: string
  title: string
  detail: string
  tag?: { label: string, tone: CanonicalTone }
}

const events: Event[] = [
  {
    id: 1,
    actor: 'Ava Restić',
    initials: 'AR',
    tone: 'success',
    status: 'Just now',
    title: 'Merged pull request #482',
    detail: '“Add roving-tabindex to DzTree” into main.',
    tag: { label: 'merged', tone: 'success' },
  },
  {
    id: 2,
    actor: 'CI Pipeline',
    initials: 'CI',
    tone: 'info',
    status: '4 min ago',
    title: 'Deployment started',
    detail: 'Building api-gateway v2.8.1 for production.',
    tag: { label: 'building', tone: 'info' },
  },
  {
    id: 3,
    actor: 'Marcus Chen',
    initials: 'MC',
    tone: 'primary',
    status: '32 min ago',
    title: 'Commented on issue #119',
    detail: '“Repro confirmed on Safari — focus ring is clipped.”',
  },
  {
    id: 4,
    actor: 'Priya Nair',
    initials: 'PN',
    tone: 'warning',
    status: '1 hr ago',
    title: 'Requested changes',
    detail: 'Two comments on the design-tokens migration.',
    tag: { label: 'review', tone: 'warning' },
  },
  {
    id: 5,
    actor: 'Luca Ferraro',
    initials: 'LF',
    tone: 'neutral',
    status: 'Yesterday',
    title: 'Opened pull request #480',
    detail: '“Document the hybrid token ownership model.”',
  },
]
</script>

<template>
  <section class="at-wrap" aria-labelledby="at-title">
    <DzCard variant="outlined" padding="lg">
      <header class="at-head">
        <DzHeading id="at-title" :level="4" size="md" weight="semibold" class="at-title">Recent activity</DzHeading>
        <DzBadge variant="subtle" tone="neutral" size="sm">Today</DzBadge>
      </header>

      <DzTimeline size="md">
        <DzTimelineItem
          v-for="event in events"
          :key="event.id"
          :tone="event.tone"
          :status="event.status"
        >
          <template #indicator>
            <DzAvatar :fallback="event.initials" :alt="event.actor" size="sm" />
          </template>

          <div class="at-body">
            <DzText size="sm" as="p" class="at-line">
              <DzText size="sm" weight="semibold" as="span">{{ event.actor }}</DzText>
              {{ ' ' }}{{ event.title }}
            </DzText>
            <DzText size="sm" tone="muted" as="p" class="at-detail">{{ event.detail }}</DzText>
            <DzTag v-if="event.tag" variant="subtle" :tone="event.tag.tone" size="sm" class="at-tag">
              {{ event.tag.label }}
            </DzTag>
          </div>
        </DzTimelineItem>
      </DzTimeline>
    </DzCard>
  </section>
</template>

<style scoped>
.at-wrap {
  background: var(--dz-background, #fff);
  max-width: 36rem;
  margin: 0 auto;
}

.at-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.at-title {
  margin: 0;
}

.at-body {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-1, 0.25rem);
  padding-bottom: var(--dz-space-2, 0.5rem);
}

.at-line,
.at-detail {
  margin: 0;
  line-height: 1.45;
}

.at-tag {
  align-self: flex-start;
  margin-top: var(--dz-space-1, 0.25rem);
}
</style>
```
