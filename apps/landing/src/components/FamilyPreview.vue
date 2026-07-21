<script setup lang="ts">
import {
  DzAvatar,
  DzAvatarGroup,
  DzBadge,
  DzButton,
  DzCheckbox,
  DzHeading,
  DzInput,
  DzKbd,
  DzProgress,
  DzRating,
  DzSegmented,
  DzSlider,
  DzSpinner,
  DzSwitch,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import { Search } from 'lucide-vue-next'
import { ref } from 'vue'

// A small, real component cluster per family. Rendered purely as a visual
// (the wrapper is aria-hidden + pointer-events:none in ComponentGallery), so
// nested interactive controls never steal focus from the tile's "View" link.
defineProps<{ name: string }>()

const on = ref(true)
const checked = ref(true)
const slider = ref(60)
const seg = ref('grid')
const rating = ref(4)
const segItems = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
]
</script>

<template>
  <div class="preview">
    <template v-if="name === 'Buttons'">
      <div class="row">
        <DzButton size="sm" variant="solid" tone="primary">
          Save
        </DzButton>
        <DzButton size="sm" variant="outline" tone="neutral">
          Cancel
        </DzButton>
      </div>
      <div class="row">
        <DzButton size="sm" variant="ghost" tone="primary">
          Ghost
        </DzButton>
        <DzButton size="sm" variant="solid" tone="danger">
          Delete
        </DzButton>
      </div>
    </template>

    <template v-else-if="name === 'Inputs'">
      <DzInput size="sm" placeholder="Search…" model-value="design">
        <template #prefix>
          <Search :size="14" aria-hidden="true" />
        </template>
      </DzInput>
      <DzInput size="sm" placeholder="you@example.com" />
    </template>

    <template v-else-if="name === 'Forms'">
      <div class="row row--between">
        <DzText size="sm">
          Email alerts
        </DzText>
        <DzSwitch v-model="on" size="sm" aria-label="demo" />
      </div>
      <DzCheckbox v-model="checked">
        Subscribe to updates
      </DzCheckbox>
      <DzSlider v-model="slider" tone="primary" />
    </template>

    <template v-else-if="name === 'Cards'">
      <div class="mini-card">
        <DzAvatar fallback="A" size="sm" />
        <div>
          <DzText size="sm" weight="medium" as="div">
            Acme Inc.
          </DzText>
          <DzText size="xs" tone="muted" as="div">
            Team · 12 seats
          </DzText>
        </div>
        <DzBadge variant="subtle" tone="success" size="sm">
          Active
        </DzBadge>
      </div>
    </template>

    <template v-else-if="name === 'Data'">
      <div class="row">
        <DzTag tone="primary" size="sm">
          Vue
        </DzTag>
        <DzTag tone="success" size="sm">
          TS
        </DzTag>
        <DzTag tone="info" size="sm">
          OKLCH
        </DzTag>
      </div>
      <DzProgress :value="slider" size="sm" tone="primary" />
    </template>

    <template v-else-if="name === 'Feedback'">
      <div class="row">
        <DzBadge variant="subtle" tone="success" size="sm">
          Passed
        </DzBadge>
        <DzBadge variant="subtle" tone="warning" size="sm">
          Pending
        </DzBadge>
        <DzBadge variant="subtle" tone="danger" size="sm">
          Failed
        </DzBadge>
      </div>
      <div class="row">
        <DzSpinner size="sm" tone="primary" />
        <DzText size="sm" tone="muted">
          Loading…
        </DzText>
      </div>
    </template>

    <template v-else-if="name === 'Layout'">
      <div class="layout-skeleton">
        <span class="ls-side" />
        <span class="ls-main">
          <span class="ls-bar" />
          <span class="ls-bar ls-bar--short" />
        </span>
      </div>
    </template>

    <template v-else-if="name === 'Navigation'">
      <DzSegmented v-model="seg" :items="segItems" size="sm" aria-label="view" />
      <div class="crumbs">
        <DzText size="xs" tone="muted">
          Home
        </DzText>
        <span class="crumb-sep">/</span>
        <DzText size="xs" tone="muted">
          Projects
        </DzText>
        <span class="crumb-sep">/</span>
        <DzText size="xs">
          Web
        </DzText>
      </div>
    </template>

    <template v-else-if="name === 'Overlays'">
      <div class="row row--between">
        <DzText size="sm">
          Quick actions
        </DzText>
        <DzKbd :keys="['cmd', 'K']" size="sm" />
      </div>
      <div class="popover-mock">
        <DzText size="xs" tone="muted" as="div">
          Tooltip · popover · dialog
        </DzText>
      </div>
    </template>

    <template v-else-if="name === 'Media'">
      <DzAvatarGroup :max="4" aria-label="Team">
        <DzAvatar fallback="A" />
        <DzAvatar fallback="B" />
        <DzAvatar fallback="C" />
        <DzAvatar fallback="D" />
        <DzAvatar fallback="E" />
      </DzAvatarGroup>
    </template>

    <template v-else-if="name === 'Typography'">
      <DzHeading :level="3" size="md" weight="semibold">
        Type that scales
      </DzHeading>
      <DzText size="sm" tone="muted">
        Headings, text, code and kbd on one fluid scale.
      </DzText>
      <DzRating v-model="rating" :count="5" />
    </template>

    <template v-else>
      <DzText size="sm" tone="muted">
        {{ name }}
      </DzText>
    </template>
  </div>
</template>

<style scoped>
.preview {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.row--between {
  justify-content: space-between;
}

.mini-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #fff);
}

.mini-card > div {
  flex: 1;
  line-height: 1.2;
}

.layout-skeleton {
  display: flex;
  gap: 8px;
  height: 64px;
}

.ls-side {
  width: 30%;
  border-radius: var(--dz-radius-sm, 4px);
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 22%, transparent);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #6366f1) 28%, transparent);
}

.ls-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ls-bar {
  height: 16px;
  border-radius: var(--dz-radius-sm, 4px);
  background: color-mix(in oklch, var(--dz-foreground, #000) 12%, transparent);
}

.ls-bar:first-child {
  background: color-mix(in oklch, var(--dz-foreground, #000) 18%, transparent);
}

.ls-bar--short {
  width: 60%;
}

.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.crumb-sep {
  color: var(--dz-muted-foreground, #64748b);
  font-size: var(--dz-text-xs, 0.75rem);
}

.popover-mock {
  padding: 8px 10px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #fff);
  box-shadow: var(--lp-shadow-sm);
}
</style>
