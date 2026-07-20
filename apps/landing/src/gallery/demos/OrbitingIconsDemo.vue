<script setup lang="ts">
import { DzAvatar, DzBadge, DzCard, DzText } from '@dzup-ui/core'
import { DzOrbit } from '../../motion/index.ts'

/**
 * Orbiting icons demo (catalog `orbiting-icons`, effect 38) — avatars and badges
 * orbit a central hub on two concentric rings via {@link DzOrbit}. Each ring
 * spins on a slow loop while every item counter-rotates to stay upright; the two
 * rings turn in opposite directions for a livelier system.
 *
 * The decorative ring tracks are aria-hidden inside DzOrbit; the avatars/badges
 * (each with an `alt`/label) stay in the accessibility tree. Under reduced motion
 * (OS or the page toggle) the rings freeze to a static, upright ring of icons.
 */
</script>

<template>
  <div class="stage">
    <DzOrbit :radius="52" :ring-gap="38" :rings="2" speed="26s">
      <template #center>
        <DzCard variant="elevated" padding="sm" class="hub">
          <DzText size="sm" weight="semibold">
            dzup
          </DzText>
        </DzCard>
      </template>

      <DzAvatar fallback="AL" alt="Ada Lovelace" size="sm" />
      <DzBadge variant="solid" tone="primary">
        UI
      </DzBadge>
      <DzAvatar fallback="GH" alt="Grace Hopper" size="sm" />
      <DzBadge variant="subtle" tone="info">
        API
      </DzBadge>
      <DzAvatar fallback="AT" alt="Alan Turing" size="sm" />
      <DzAvatar fallback="KJ" alt="Katherine Johnson" size="sm" />
    </DzOrbit>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.hub {
  background: var(--dz-surface, #fff);
}
</style>
