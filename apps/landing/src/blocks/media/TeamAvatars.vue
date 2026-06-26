<script setup lang="ts">
import { DzAvatar, DzAvatarGroup, DzBadge, DzHeading, DzText } from '@dzup-ui/core'

/**
 * Team roster — stacked avatar group plus an individual member list.
 *
 * DzAvatarGroup overlaps its DzAvatar children and collapses everything past
 * `max` into a "+N" indicator, propagating one `size` to all children via typed
 * injection (ADR-08). Each DzAvatar resolves an image, falls back to initials
 * when none loads, and supports `circle` / `square` shapes.
 *
 * Only free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */

interface Member {
  name: string
  role: string
  src?: string
  fallback: string
  online: boolean
}

const members: Member[] = [
  { name: 'Ada Whitfield', role: 'Engineering lead', src: 'https://i.pravatar.cc/160?img=47', fallback: 'AW', online: true },
  { name: 'Marcus Lee', role: 'Product design', src: 'https://i.pravatar.cc/160?img=12', fallback: 'ML', online: true },
  { name: 'Priya Nair', role: 'Data science', src: 'https://i.pravatar.cc/160?img=32', fallback: 'PN', online: false },
  { name: 'Tomás Rivera', role: 'Frontend', fallback: 'TR', online: true },
  { name: 'Sofia Berg', role: 'Customer success', src: 'https://i.pravatar.cc/160?img=5', fallback: 'SB', online: false },
]
</script>

<template>
  <section class="team" aria-labelledby="media-team-title">
    <header class="t-head">
      <div class="t-head-text">
        <DzBadge variant="subtle" tone="primary" size="sm">Team</DzBadge>
        <DzHeading id="media-team-title" :level="4" size="xl" weight="semibold" class="t-title">
          Working on this release
        </DzHeading>
        <DzText size="sm" tone="muted" class="t-lede">
          Twelve people across five squads — here are the core five.
        </DzText>
      </div>

      <!-- Stacked, overlapping group with a "+N" overflow chip. -->
      <DzAvatarGroup :max="4" size="md" aria-label="Release contributors">
        <DzAvatar
          v-for="m in members"
          :key="m.name"
          :src="m.src"
          :alt="m.name"
          :fallback="m.fallback"
        />
        <DzAvatar fallback="JD" alt="Jordan Diaz" />
        <DzAvatar fallback="KO" alt="Kai Owusu" />
        <DzAvatar fallback="ME" alt="Mei Endo" />
      </DzAvatarGroup>
    </header>

    <!-- Roster: one row per member with a presence dot. -->
    <ul class="t-list">
      <li v-for="m in members" :key="m.name" class="t-row">
        <span class="t-avatar">
          <DzAvatar :src="m.src" :alt="m.name" :fallback="m.fallback" size="lg" />
          <span class="t-presence" :class="m.online ? 't-presence--on' : 't-presence--off'" aria-hidden="true" />
        </span>

        <span class="t-meta">
          <DzText weight="semibold" as="div" class="t-name">{{ m.name }}</DzText>
          <DzText size="sm" tone="muted" as="div" class="t-role">{{ m.role }}</DzText>
        </span>

        <DzBadge
          :variant="m.online ? 'subtle' : 'outline'"
          :tone="m.online ? 'success' : 'neutral'"
          size="sm"
          class="t-status"
        >
          {{ m.online ? 'Online' : 'Away' }}
        </DzBadge>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.team {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.t-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--dz-space-4, 1rem);
  margin-bottom: var(--dz-space-5, 1.25rem);
}

.t-head-text {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  min-width: 0;
}

.t-title {
  margin: 0;
  letter-spacing: -0.01em;
}

.t-lede {
  margin: 0;
  line-height: 1.55;
}

.t-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--dz-space-2, 0.5rem);
}

.t-row {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-lg, 0.75rem);
  border: 1px solid color-mix(in oklch, var(--dz-border, #e2e8f0) 55%, transparent);
  background: var(--dz-surface, #fff);
  transition: border-color 160ms ease, background 160ms ease;
}

.t-row:hover {
  border-color: color-mix(in oklch, var(--dz-primary, #6366f1) 40%, transparent);
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 4%, var(--dz-surface, #fff));
}

.t-avatar {
  position: relative;
  flex-shrink: 0;
  line-height: 0;
}

/* Presence dot pinned to the avatar corner, ringed in the surface color. */
.t-presence {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: var(--dz-radius-full, 9999px);
  box-shadow: 0 0 0 2px var(--dz-surface, #fff);
}

.t-presence--on {
  background: var(--dz-success, #16a34a);
}

.t-presence--off {
  background: var(--dz-muted-foreground, #94a3b8);
}

.t-meta {
  flex: 1;
  min-width: 0;
}

.t-name {
  margin: 0;
}

.t-role {
  margin: 0;
}

.t-status {
  flex-shrink: 0;
}

@media (prefers-reduced-motion: reduce) {
  .t-row {
    transition: none;
  }
}
</style>
