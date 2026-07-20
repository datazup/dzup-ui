<script setup lang="ts">
import { DzAvatar, DzCard, DzText } from '@dzup-ui/core'
import { ref } from 'vue'
import { DzBeam } from '../../motion/index.ts'

/**
 * Animated beam demo (catalog `animated-beam`, effect 37) — a hub-and-spoke
 * network where a light gradient travels {@link DzBeam} paths from a central
 * card out to three orbiting avatars. Each beam is an absolutely-positioned SVG
 * overlay measuring the live boxes of its `from`/`to` template refs, so the
 * connectors track the layout responsively.
 *
 * The refs are read in `<script>` (passed to DzBeam's `:from`/`:to`) so they
 * count as used under `noUnusedLocals`. Under reduced motion (OS or the page
 * toggle) every beam degrades to a static connector line.
 */
const hub = ref<HTMLElement | null>(null)
const nodeA = ref<HTMLElement | null>(null)
const nodeB = ref<HTMLElement | null>(null)
const nodeC = ref<HTMLElement | null>(null)
</script>

<template>
  <div class="stage">
    <div class="net">
      <!-- Beams sit behind the nodes; each connects the hub to one satellite. -->
      <DzBeam :from="hub" :to="nodeA" :curvature="38" />
      <DzBeam :from="hub" :to="nodeB" :curvature="-34" reverse />
      <DzBeam :from="hub" :to="nodeC" :curvature="30" />

      <div ref="nodeA" class="node node--a">
        <DzAvatar fallback="AL" alt="Ada Lovelace" size="md" />
      </div>
      <div ref="nodeB" class="node node--b">
        <DzAvatar fallback="GH" alt="Grace Hopper" size="md" />
      </div>
      <div ref="nodeC" class="node node--c">
        <DzAvatar fallback="AT" alt="Alan Turing" size="md" />
      </div>

      <div ref="hub" class="hub">
        <DzCard variant="elevated" padding="sm" class="hub-card">
          <DzText size="sm" weight="semibold">
            Core
          </DzText>
        </DzCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.net {
  position: relative;
  width: min(360px, 100%);
  height: 188px;
}

/* Satellite + hub nodes sit above the beam overlays. */
.node,
.hub {
  position: absolute;
  z-index: 1;
}

.node--a {
  top: 8%;
  left: 10%;
}

.node--b {
  top: 50%;
  right: 6%;
  transform: translateY(-50%);
}

.node--c {
  bottom: 6%;
  left: 18%;
}

.hub {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hub-card {
  background: var(--dz-surface, #fff);
}
</style>
