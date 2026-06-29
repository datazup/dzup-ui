<script setup lang="ts">
import { DzIconButton } from '@dzup-ui/core'
import { Activity, Bell, Compass, LayoutDashboard, Settings, Sparkles, Users } from 'lucide-vue-next'
import { DzDock, useReducedMotion } from '../../motion/index.ts'

/**
 * Dock magnification demo (catalog `dock`, effect 46) — a row of DzIconButtons
 * that scale by pointer proximity, neighbours easing too, via {@link DzDock}.
 * rAF-throttled, pure scale about each item's own centre so click/focus targets
 * never move. Touch + keyboard get a flat row; under reduced motion (OS or page
 * toggle, passed via `disabled`) the magnification is off.
 */
const reduced = useReducedMotion()

const items = [
  { icon: Activity, label: 'Activity' },
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: Compass, label: 'Explore' },
  { icon: Sparkles, label: 'Highlights' },
  { icon: Users, label: 'Team' },
  { icon: Bell, label: 'Notifications' },
  { icon: Settings, label: 'Settings' },
]
</script>

<template>
  <div class="stage">
    <DzDock :disabled="reduced" aria-label="Workspace dock">
      <DzIconButton
        v-for="item in items"
        :key="item.label"
        :icon="item.icon"
        :ariaLabel="item.label"
        variant="ghost"
        tone="primary"
        size="lg"
      />
    </DzDock>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  min-height: 120px;
  /* Headroom so the magnified item can lift without clipping. */
  padding: 24px 8px 8px;
}
</style>
