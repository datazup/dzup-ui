<script setup lang="ts">
import { DzBadge, DzText } from '@dzup-ui/core'
import { ArrowRight, Layers } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ECOSYSTEM } from '../../data.ts'
import { ICONS } from '../../icons.ts'
import { DzBeam } from '../../motion/index.ts'
import Section from '../Section.vue'

/**
 * EcosystemConstellation — "beyond components", drawn
 * (docs/landing-v2.md TASK-LV2-06, adapted to what the section truthfully is).
 *
 * The v1 `EcosystemGrid` (which `/classic` keeps) lists the offerings as flat
 * cards while its lede states the diagram-shaped fact: *"the pieces that build
 * on the library … same tokens, same accessibility bar."* This version draws
 * that sentence. At ≥1024px the four shipped offerings sit as corner nodes
 * around a token-system hub, connected by animated `DzBeam` edges — hub →
 * offering, the direction the dependency actually runs. Planned offerings
 * render as detached, dashed satellites with **no beam**: an edge is a claim,
 * and unshipped surfaces don't get one (same truth rule as the badges).
 *
 * Below 1024px the constellation collapses to the v1 card grid — the beams and
 * the hub are presentation; every offering's card (title, blurb, meta, badge,
 * link) is identical semantic content in both layouts, so screen readers and
 * small screens lose nothing. The beam layer is `aria-hidden`.
 */

const lede = computed<string>(() => {
  const shipped = ECOSYSTEM.filter(item => item.status === 'available').map(item =>
    item.title.toLowerCase(),
  )
  const list
    = shipped.length > 1
      ? `${shipped.slice(0, -1).join(', ')} and ${shipped[shipped.length - 1]}`
      : shipped[0] ?? ''
  return (
    `The pieces that build on the library — ${list}. `
    + 'Same tokens, same accessibility bar, same design language.'
  )
})

const WIDE_QUERY = '(min-width: 1024px)'

function matchesWide(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(WIDE_QUERY).matches
    : true
}

const wide = ref(matchesWide())
let mql: MediaQueryList | null = null

function onChange(event: MediaQueryListEvent): void {
  wide.value = event.matches
}

/** Beams resolve their endpoints by selector once the node cards exist. */
const mounted = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mql = window.matchMedia(WIDE_QUERY)
    wide.value = mql.matches
    mql.addEventListener('change', onChange)
  }
  mounted.value = true
})

onBeforeUnmount(() => mql?.removeEventListener('change', onChange))

const available = computed(() => ECOSYSTEM.filter(item => item.status === 'available'))
const planned = computed(() => ECOSYSTEM.filter(item => item.status === 'planned'))

/** Corner slot per shipped offering (grid areas n1..n4) + alternating bow. */
function nodeArea(i: number): string {
  return `n${i + 1}`
}

function bow(i: number): number {
  return i % 2 === 0 ? 44 : -44
}
</script>

<template>
  <Section
    eyebrow="Ecosystem"
    title="Beyond components"
    :lede="lede"
    heading-id="ecosystem-title"
  >
    <div class="constellation" :class="{ 'constellation--graph': wide }">
      <!-- Edge layer: decorative (each DzBeam svg is aria-hidden, absolute,
           pointer-events none), only in the graph layout and only toward
           SHIPPED offerings. The beams must be DIRECT children of
           .constellation — each resolves its endpoint selectors within its
           svg's parent element. -->
      <template v-if="wide && mounted">
        <DzBeam
          v-for="(item, i) in available"
          :key="item.title"
          from=".hub-card"
          :to="`[data-eco-node='${item.title}']`"
          :curvature="bow(i)"
        />
      </template>

      <!-- The hub: the one fact every edge asserts — a single token system. -->
      <div v-if="wide" class="hub">
        <div class="lp-card hub-card">
          <span class="tile-icon" aria-hidden="true">
            <Layers :size="22" />
          </span>
          <DzText weight="semibold" as="div" class="tile-title">
            One token system
          </DzText>
          <DzText size="xs" tone="muted" as="div">
            @dzup-ui/core · OKLCH tokens
          </DzText>
        </div>
      </div>

      <ul class="eco-items">
        <li
          v-for="(item, i) in [...available, ...planned]"
          :key="item.title"
          class="eco-cell"
          :class="item.status === 'planned' ? `eco-cell--planned eco-cell--p${planned.indexOf(item) + 1}` : `eco-cell--${nodeArea(available.indexOf(item))}`"
          :style="!wide ? { '--reveal-delay': `${i * 45}ms` } : undefined"
        >
          <component
            :is="item.status === 'available' ? RouterLink : 'div'"
            class="lp-card tile"
            :class="{
              'lp-card--hover': item.status === 'available',
              'tile--link': item.status === 'available',
              'tile--planned': item.status === 'planned',
            }"
            :data-eco-node="item.title"
            v-bind="item.status === 'available'
              ? { 'to': item.href, 'aria-label': `Explore ${item.title}` }
              : {}"
          >
            <div class="tile-top">
              <span class="tile-icon" aria-hidden="true">
                <component :is="ICONS[item.icon]" :size="20" />
              </span>
              <DzBadge v-if="item.status === 'available'" variant="solid" tone="success" size="sm">
                Free
              </DzBadge>
              <DzBadge v-else variant="subtle" tone="neutral" size="sm">
                Planned
              </DzBadge>
            </div>

            <DzText weight="semibold" as="div" class="tile-title">
              {{ item.title }}
            </DzText>
            <DzText size="sm" tone="muted" as="div" class="tile-blurb">
              {{ item.blurb }}
            </DzText>

            <DzText size="xs" tone="muted" as="div" class="tile-meta">
              {{ item.meta }}
            </DzText>

            <span v-if="item.status === 'available'" class="tile-explore">
              Explore
              <ArrowRight :size="14" aria-hidden="true" />
            </span>
          </component>
        </li>
      </ul>
    </div>
  </Section>
</template>

<style scoped>
.constellation {
  position: relative;
}

/* --- Narrow: the v1 grid --------------------------------------------------- */

.eco-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 560px) {
  .eco-items {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* --- Wide: the constellation ---------------------------------------------- */

.constellation--graph .eco-items {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr) minmax(0, 1fr);
  grid-template-areas:
    'n1 .   n2'
    '.  hub .'
    'n3 .   n4'
    'p1 .   p2';
  gap: 28px 56px;
  align-items: stretch;
}

.constellation--graph .eco-cell--n1 { grid-area: n1; }
.constellation--graph .eco-cell--n2 { grid-area: n2; }
.constellation--graph .eco-cell--n3 { grid-area: n3; }
.constellation--graph .eco-cell--n4 { grid-area: n4; }

/* Planned satellites: detached corners of the bottom band, no beams. */
.constellation--graph .eco-cell--p1 {
  grid-area: p1;
}

.constellation--graph .eco-cell--p2 {
  grid-area: p2;
}

.hub {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.hub-card {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 20px 28px;
  /* Opaque surface so the beams read as meeting its edge, not crossing it. */
  background: var(--dz-surface, #ffffff);
}

/* --- Shared card anatomy (v1 parity) --------------------------------------- */

.tile {
  height: 100%;
  padding: 22px;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.tile--planned {
  border-style: dashed;
  opacity: 0.82;
}

.tile-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.tile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-primary-muted, #d5e9ff);
  color: var(--dz-primary, #0766ee);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #0766ee) 14%, transparent);
}

.tile-title {
  margin-bottom: 6px;
  font-size: var(--dz-text-base, 1rem);
}

.tile-blurb {
  flex: 1;
}

.tile-meta {
  margin-top: 12px;
}

.tile-explore {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-primary-muted-foreground, #0039a3);
}
</style>
