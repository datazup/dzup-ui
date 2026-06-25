<script setup lang="ts">
/**
 * Leaderboard — a ranked DzList with animated score figures.
 *
 * DzList (divided variant) stacks DzListItem rows; each row uses the `#prefix`
 * slot for a rank badge + DzAvatar and the `#suffix` slot for a DzAnimatedNumber
 * score (count-up on scroll-into-view) beside a DzTag delta. A "Refresh scores"
 * button mutates the values so the figures re-animate live.
 *
 * Self-contained: local reactive data. Composed only from free @dzup-ui/core
 * components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { ref } from 'vue'
import {
  DzAnimatedNumber,
  DzAvatar,
  DzBadge,
  DzButton,
  DzCard,
  DzHeading,
  DzList,
  DzListItem,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import type { CanonicalTone } from '@dzup-ui/contracts'

interface Player {
  id: number
  name: string
  initials: string
  score: number
  delta: number
}

const RANK_TONE: Record<number, CanonicalTone> = {
  1: 'warning',
  2: 'neutral',
  3: 'primary',
}

const players = ref<Player[]>([
  { id: 1, name: 'Ava Restić', initials: 'AR', score: 9820, delta: 4.2 },
  { id: 2, name: 'Marcus Chen', initials: 'MC', score: 9134, delta: 1.1 },
  { id: 3, name: 'Priya Nair', initials: 'PN', score: 8766, delta: -2.4 },
  { id: 4, name: 'Luca Ferraro', initials: 'LF', score: 8210, delta: 0.7 },
  { id: 5, name: 'Sofia Andersen', initials: 'SA', score: 7995, delta: 3.8 },
])

function refresh() {
  players.value = players.value.map((player) => {
    const drift = Math.round((Math.random() - 0.4) * 400)
    return { ...player, score: Math.max(0, player.score + drift), delta: Math.round((Math.random() * 8 - 3) * 10) / 10 }
  })
}

function deltaTone(delta: number): CanonicalTone {
  if (delta > 0) return 'success'
  if (delta < 0) return 'danger'
  return 'neutral'
}
</script>

<template>
  <section class="lb-wrap" aria-labelledby="lb-title">
    <DzCard variant="outlined" padding="lg">
      <header class="lb-head">
        <div>
          <DzHeading id="lb-title" :level="4" size="md" weight="semibold" class="lb-title">Weekly leaderboard</DzHeading>
          <DzText size="sm" tone="muted" as="p" class="lb-sub">Points earned this week</DzText>
        </div>
        <DzButton variant="outline" tone="neutral" size="sm" @click="refresh">Refresh scores</DzButton>
      </header>

      <DzList variant="divided" size="md">
        <DzListItem v-for="(player, index) in players" :key="player.id">
          <template #prefix>
            <span class="lb-prefix">
              <DzBadge
                variant="solid"
                :tone="RANK_TONE[index + 1] ?? 'neutral'"
                size="sm"
                class="lb-rank"
              >
                {{ index + 1 }}
              </DzBadge>
              <DzAvatar :fallback="player.initials" size="sm" />
            </span>
          </template>

          <DzText weight="medium" as="span">{{ player.name }}</DzText>

          <template #suffix>
            <span class="lb-suffix">
              <DzTag variant="subtle" :tone="deltaTone(player.delta)" size="sm">
                {{ player.delta > 0 ? '+' : '' }}{{ player.delta }}%
              </DzTag>
              <DzAnimatedNumber
                :value="player.score"
                :duration="900"
                easing="ease-out"
                :format="{ useGrouping: true }"
                size="md"
                class="lb-score"
              />
            </span>
          </template>
        </DzListItem>
      </DzList>
    </DzCard>
  </section>
</template>

<style scoped>
.lb-wrap {
  background: var(--dz-background, #fff);
  max-width: 34rem;
  margin: 0 auto;
}

.lb-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: var(--dz-space-4, 1rem);
  flex-wrap: wrap;
}

.lb-title {
  margin: 0;
}

.lb-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.lb-prefix {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
}

.lb-rank {
  min-width: 1.5rem;
  justify-content: center;
}

.lb-suffix {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.lb-score {
  font-variant-numeric: tabular-nums;
  min-width: 3.5rem;
  text-align: right;
}
</style>
