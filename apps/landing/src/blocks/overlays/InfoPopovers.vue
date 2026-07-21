<script setup lang="ts">
/**
 * Info popovers — anchored rich-content panels (DzPopover).
 *
 * Two real popover patterns side by side: a profile "hover card" anchored to a
 * user chip (avatar, bio, follow action), and a non-modal filter panel anchored
 * to a Filters button (switch rows + apply/reset). Both use DzPopoverContent
 * with an arrow and explicit side/alignment, and re-theme with the global
 * toggle. The applied filter count is echoed below.
 *
 * Self-contained — free @dzup-ui/core components and `--dz-*` tokens only.
 * Heading level 4 to nest under the BlockPreview H3.
 */
import {
  DzAvatar,
  DzBadge,
  DzButton,
  DzDivider,
  DzHeading,
  DzPopover,
  DzPopoverContent,
  DzPopoverTrigger,
  DzSwitch,
  DzText,
} from '@dzup-ui/core'
import { ChevronDown, MapPin, SlidersHorizontal } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const following = ref(false)

const onlyActive = ref(true)
const hasAvatar = ref(false)
const recentlySeen = ref(true)
const filtersOpen = ref(false)
const appliedCount = ref(0)

const pendingCount = computed(
  () => [onlyActive.value, hasAvatar.value, recentlySeen.value].filter(Boolean).length,
)

function applyFilters(): void {
  appliedCount.value = pendingCount.value
  filtersOpen.value = false
}

function resetFilters(): void {
  onlyActive.value = false
  hasAvatar.value = false
  recentlySeen.value = false
}
</script>

<template>
  <section class="ip-wrap" aria-labelledby="ip-title">
    <header class="ip-head">
      <DzHeading id="ip-title" :level="4" size="md" weight="semibold" class="ip-title">
        Popovers
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="ip-sub">
        Anchored panels for previews and inline controls.
      </DzText>
    </header>

    <div class="ip-row">
      <!-- Profile hover card ------------------------------------------------ -->
      <DzPopover>
        <DzPopoverTrigger>
          <button type="button" class="ip-chip" aria-label="Preview Ada Lovelace">
            <DzAvatar fallback="AL" alt="Ada Lovelace" size="sm" />
            <span class="ip-chip-name">@ada</span>
            <ChevronDown :size="14" aria-hidden="true" class="ip-chip-caret" />
          </button>
        </DzPopoverTrigger>
        <DzPopoverContent side="bottom" align="start" size="md">
          <div class="ip-card">
            <div class="ip-card-head">
              <DzAvatar fallback="AL" alt="Ada Lovelace" size="lg" />
              <div class="ip-card-id">
                <DzText size="sm" weight="semibold" as="span">
                  Ada Lovelace
                </DzText>
                <DzText size="xs" tone="muted" as="span">
                  @ada · Engineering
                </DzText>
              </div>
            </div>
            <DzText size="sm" as="p" class="ip-card-bio">
              Building the analytics engine. First programmer, occasional poet.
            </DzText>
            <div class="ip-card-meta">
              <MapPin :size="13" aria-hidden="true" />
              <DzText size="xs" tone="muted" as="span">
                London, UK
              </DzText>
            </div>
            <DzButton
              :variant="following ? 'outline' : 'solid'"
              tone="primary"
              size="sm"
              class="ip-card-action"
              @click="following = !following"
            >
              {{ following ? 'Following' : 'Follow' }}
            </DzButton>
          </div>
        </DzPopoverContent>
      </DzPopover>

      <!-- Filters panel ----------------------------------------------------- -->
      <DzPopover v-model:open="filtersOpen">
        <DzPopoverTrigger>
          <DzButton variant="outline" tone="neutral" size="sm">
            <template #prefix>
              <SlidersHorizontal :size="15" aria-hidden="true" />
            </template>
            Filters
            <template v-if="appliedCount" #suffix>
              <DzBadge variant="solid" tone="primary" size="sm">
                {{ appliedCount }}
              </DzBadge>
            </template>
          </DzButton>
        </DzPopoverTrigger>
        <DzPopoverContent side="bottom" align="end" size="md">
          <div class="ip-filters">
            <DzText size="sm" weight="semibold" as="p" class="ip-filters-title">
              Filter members
            </DzText>
            <label class="ip-filter-row">
              <DzText size="sm" as="span">Active only</DzText>
              <DzSwitch v-model="onlyActive" aria-label="Active only" />
            </label>
            <label class="ip-filter-row">
              <DzText size="sm" as="span">Has avatar</DzText>
              <DzSwitch v-model="hasAvatar" aria-label="Has avatar" />
            </label>
            <label class="ip-filter-row">
              <DzText size="sm" as="span">Seen this week</DzText>
              <DzSwitch v-model="recentlySeen" aria-label="Seen this week" />
            </label>
            <DzDivider />
            <div class="ip-filters-actions">
              <DzButton variant="ghost" tone="neutral" size="sm" @click="resetFilters">
                Reset
              </DzButton>
              <DzButton variant="solid" tone="primary" size="sm" @click="applyFilters">
                Apply ({{ pendingCount }})
              </DzButton>
            </div>
          </div>
        </DzPopoverContent>
      </DzPopover>
    </div>

    <div class="ip-result" role="status" aria-live="polite">
      <DzText size="sm" tone="muted" as="span">
        {{ appliedCount }} filter{{ appliedCount === 1 ? '' : 's' }} applied.
      </DzText>
    </div>
  </section>
</template>

<style scoped>
.ip-wrap {
  max-width: 38rem;
  margin: 0 auto;
}

.ip-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.ip-title {
  margin: 0;
}

.ip-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.ip-row {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  flex-wrap: wrap;
}

/* Profile chip ------------------------------------------------------------ */
.ip-chip {
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-1, 0.25rem) var(--dz-space-3, 0.75rem) var(--dz-space-1, 0.25rem) var(--dz-space-1, 0.25rem);
  border-radius: var(--dz-radius-full, 999px);
  border: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #fff);
  cursor: pointer;
  transition: background var(--dz-transition-fast, 150ms) ease;
}

.ip-chip:hover {
  background: var(--dz-surface-raised, #f3f4f6);
}

.ip-chip:focus-visible {
  outline: 2px solid var(--dz-ring, #6366f1);
  outline-offset: 2px;
}

.ip-chip-name {
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 500;
  color: var(--dz-text, #111827);
}

.ip-chip-caret {
  color: var(--dz-text-muted, #6b7280);
}

/* Profile card content ---------------------------------------------------- */
.ip-card {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  min-width: 15rem;
}

.ip-card-head {
  display: flex;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.ip-card-id {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ip-card-bio {
  margin: 0;
}

.ip-card-meta {
  display: flex;
  align-items: center;
  gap: var(--dz-space-1, 0.25rem);
  color: var(--dz-text-muted, #6b7280);
}

.ip-card-action {
  margin-top: var(--dz-space-1, 0.25rem);
  align-self: flex-start;
}

/* Filters content --------------------------------------------------------- */
.ip-filters {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-2, 0.5rem);
  min-width: 15rem;
}

.ip-filters-title {
  margin: 0 0 var(--dz-space-1, 0.25rem);
}

.ip-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  cursor: pointer;
}

.ip-filters-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--dz-space-2, 0.5rem);
}

.ip-result {
  margin-top: var(--dz-space-3, 0.75rem);
  min-height: 1.25rem;
}
</style>
