<script setup lang="ts">
import autoAnimate from '@formkit/auto-animate'
import type { AnimationController } from '@formkit/auto-animate'
import { DzAvatar, DzBadge, DzButton, DzListItem } from '@dzup-ui/core'
import { Plus, Shuffle, X } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Auto-animate list demo (catalog `auto-animate-list`, effect via AutoAnimate —
 * docs/animations.md §3.4, Task N2). A teammate list whose rows animate their
 * add / remove / reorder in one line via `@formkit/auto-animate`: the parent
 * element is registered once and every direct-child mutation (insert, delete,
 * move) is tweened automatically — no per-item transition wiring.
 *
 * The ergonomic public forms are `v-auto-animate` (directive) and `useAutoAnimate`
 * (composable), both re-exported from `../motion` and shown in the Copy snippet —
 * the bento gallery itself uses the directive. Here we hold AutoAnimate's
 * controller directly so the live "Reduce motion" toggle can flip it.
 *
 * Reduced motion: AutoAnimate already honours the OS `prefers-reduced-motion`
 * setting by default (it snaps instead of tweening). We additionally drive the
 * controller's `enable`/`disable` from `useReducedMotion` so the gallery's
 * page-level "Reduce motion" switch makes the list snap live too.
 */
interface Member {
  id: number
  name: string
  role: string
  tone: 'primary' | 'info' | 'success' | 'warning' | 'danger'
  initials: string
}

const POOL: Omit<Member, 'id'>[] = [
  { name: 'Ada Lovelace', role: 'Design', tone: 'primary', initials: 'AL' },
  { name: 'Alan Turing', role: 'Engineering', tone: 'info', initials: 'AT' },
  { name: 'Grace Hopper', role: 'Product', tone: 'success', initials: 'GH' },
  { name: 'Katherine J.', role: 'Research', tone: 'warning', initials: 'KJ' },
  { name: 'Linus T.', role: 'Platform', tone: 'danger', initials: 'LT' },
  { name: 'Margaret H.', role: 'Software', tone: 'primary', initials: 'MH' },
]

const members = ref<Member[]>(POOL.slice(0, 3).map((m, i) => ({ ...m, id: i })))
let nextId = members.value.length

// Register the <ul> with AutoAnimate once mounted; keep the controller so the
// page-level toggle can enable/disable it live (OS preference is respected
// internally regardless).
const listRef = ref<HTMLUListElement | null>(null)
const reduced = useReducedMotion()
let controller: AnimationController | undefined

onMounted(() => {
  if (!listRef.value) return
  controller = autoAnimate(listRef.value)
  if (reduced.value) controller.disable()
})

watch(reduced, (r) => (r ? controller?.disable() : controller?.enable()))
onBeforeUnmount(() => controller?.disable())

function add(): void {
  if (members.value.length >= POOL.length) return
  const taken = new Set(members.value.map((m) => m.name))
  const next = POOL.find((m) => !taken.has(m.name))
  if (next) members.value.splice(0, 0, { ...next, id: nextId++ })
}

function remove(id: number): void {
  members.value = members.value.filter((m) => m.id !== id)
}

function shuffle(): void {
  members.value = [...members.value].reverse()
}
</script>

<template>
  <div class="wrap">
    <div class="controls">
      <DzButton size="sm" variant="outline" tone="primary" :disabled="members.length >= POOL.length" @click="add">
        <template #prefix><Plus :size="14" aria-hidden="true" /></template>
        Add
      </DzButton>
      <DzButton size="sm" variant="outline" tone="neutral" :disabled="members.length < 2" @click="shuffle">
        <template #prefix><Shuffle :size="14" aria-hidden="true" /></template>
        Reorder
      </DzButton>
    </div>

    <ul ref="listRef" class="team">
      <DzListItem v-for="member in members" :key="member.id" class="row">
        <template #prefix>
          <DzAvatar :fallback="member.initials" size="sm" :alt="member.name" />
        </template>
        <span class="name">{{ member.name }}</span>
        <template #suffix>
          <span class="suffix">
            <DzBadge variant="subtle" :tone="member.tone" size="sm">{{ member.role }}</DzBadge>
            <DzButton
              size="sm"
              variant="ghost"
              tone="neutral"
              :aria-label="`Remove ${member.name}`"
              @click="remove(member.id)"
            >
              <X :size="14" aria-hidden="true" />
            </DzButton>
          </span>
        </template>
      </DzListItem>
    </ul>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(340px, 100%);
}

.controls {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.team {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.suffix {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
