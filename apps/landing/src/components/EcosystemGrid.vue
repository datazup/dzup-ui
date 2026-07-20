<script setup lang="ts">
import { DzBadge, DzText } from '@dzup-ui/core'
import { ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ECOSYSTEM } from '../data.ts'
import { ICONS } from '../icons.ts'
import Section from './Section.vue'

/**
 * Ecosystem grid — "beyond components". Showcases the offerings that complement
 * the library, each built on the same tokens and a11y bar as `@dzup-ui/core`.
 *
 * `status` is the one place an offering's availability is stated. An
 * `'available'` offering renders as a whole-tile router-link carrying a "Free"
 * badge and an "Explore" affordance; a `'planned'` one is a non-interactive
 * placeholder. Which offerings are which is `ECOSYSTEM`'s business, not this
 * comment's — that is why neither this comment nor the lede lists them by hand.
 *
 * Mirrors the ComponentGallery / FeatureGrid patterns (Section + lp-card tiles,
 * staggered scroll-reveal, token-only styling) so it reads as one family.
 */

/**
 * The section lede, with the shipped surfaces read off `ECOSYSTEM` rather than
 * typed.
 *
 * This sentence used to end "Coming soon." while, directly beneath it, four
 * tiles rendered live "Free" badges and linked to four shipped pages. A lede is
 * a claim like any count on this site: the fix is not to retype it correctly
 * once, it is to stop authoring it separately from the data it describes. Add a
 * surface, flip its `status`, and this sentence follows. There is deliberately no
 * temporal claim here — "soon" has no source of truth and rots silently.
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
</script>

<template>
  <Section
    eyebrow="Ecosystem"
    title="Beyond components"
    :lede="lede"
    heading-id="ecosystem-title"
  >
    <ul class="eco-grid">
      <li
        v-for="(item, i) in ECOSYSTEM"
        :key="item.title"
        class="eco-cell"
        :style="{ '--reveal-delay': `${i * 45}ms` }"
      >
        <component
          :is="item.status === 'available' ? RouterLink : 'div'"
          class="lp-card tile"
          :class="{ 'lp-card--hover': item.status === 'available', 'tile--link': item.status === 'available' }"
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
  </Section>
</template>

<style scoped>
.eco-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.eco-cell {
  display: flex;
}

.tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px;
}

/* Available tiles are whole-tile links — strip link chrome, keep card looks. */
.tile--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.tile--link:focus-visible {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: 2px;
}

.tile-explore {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-primary, #0766ee);
}

/* Arrow slides forward on hover/focus as the navigational affordance. */
.tile-explore svg {
  transition: transform var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.tile--link:hover .tile-explore svg,
.tile--link:focus-visible .tile-explore svg {
  transform: translateX(3px);
}

@media (prefers-reduced-motion: reduce) {
  .tile-explore svg {
    transition: none;
  }
}

.tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
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
  line-height: 1.6;
}

.tile-meta {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--lp-hairline);
  font-weight: 600;
  letter-spacing: 0.01em;
}

@media (max-width: 900px) {
  .eco-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .eco-grid {
    grid-template-columns: 1fr;
  }
}
</style>
