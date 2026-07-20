<script setup lang="ts">
import { DzAvatar, DzBadge, DzListItem } from '@dzup-ui/core'
import { DzStagger } from '../../motion/index.ts'

/**
 * Stagger list-in demo (catalog `stagger-list-in`, effect 24) — a teammate list
 * whose rows cascade into view one after another via {@link DzStagger}, which
 * stamps each direct child (the DzListItem rows, with a DzAvatar prefix and a
 * role DzBadge) with an incremental `--reveal-delay`.
 *
 * Re-cascades on Replay (harness remount). Under reduced motion (OS or the page
 * toggle) every row appears at once, opacity-only, with no delay or transform.
 */
const team = [
  { name: 'Ada Lovelace', role: 'Design', tone: 'primary', initials: 'AL' },
  { name: 'Alan Turing', role: 'Engineering', tone: 'info', initials: 'AT' },
  { name: 'Grace Hopper', role: 'Product', tone: 'success', initials: 'GH' },
  { name: 'Katherine J.', role: 'Research', tone: 'warning', initials: 'KJ' },
] as const
</script>

<template>
  <DzStagger as="ul" :step="90" class="team">
    <DzListItem v-for="member in team" :key="member.name" class="row">
      <template #prefix>
        <DzAvatar :fallback="member.initials" size="sm" :alt="member.name" />
      </template>
      <span class="name">{{ member.name }}</span>
      <template #suffix>
        <DzBadge variant="subtle" :tone="member.tone" size="sm">
          {{ member.role }}
        </DzBadge>
      </template>
    </DzListItem>
  </DzStagger>
</template>

<style scoped>
.team {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(320px, 100%);
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
}

.name {
  flex: 1;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--dz-foreground);
}
</style>
