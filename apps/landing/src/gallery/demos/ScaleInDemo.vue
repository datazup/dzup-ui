<script setup lang="ts">
import { DzStatCard } from '@dzup-ui/core'
import { DzReveal } from '../../motion/index.ts'

/**
 * Scale-in demo (catalog `scale-in`, effect 5) — a DzStatCard that scales up
 * from {@link --dz-anim-scale-from} (0.96) to full size while it fades in, via
 * {@link DzReveal}'s `scale` option (equivalent to `v-reveal.scale`).
 *
 * Under reduced motion (OS or page toggle) the scale is dropped — a plain fade.
 */
</script>

<template>
  <div class="stage">
    <DzReveal scale class="frame">
      <DzStatCard
        title="Monthly active"
        :value="'48.2k'"
        variant="elevated"
        trend="up"
        trend-value="+12%"
        description="vs. last month"
      />
    </DzReveal>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.frame {
  width: min(260px, 100%);
}
</style>
