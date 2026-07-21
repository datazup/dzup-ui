<script setup lang="ts">
import type { BlockDef } from '../../blocks/registry.ts'
import { DzCodeBlock, DzCopyButton, DzText } from '@dzup-ui/core'
import { computed } from 'vue'
import { installCommands, REGISTRY_ENABLED, registryAddCommands } from '../../blocks/config.ts'
import { blocksUsingComponent } from '../../blocks/registry.ts'
import { getBlockSource } from '../../blocks/sources.ts'
import { buildImportLine } from '../../composables/useBlockCodeView.ts'
import PmCommandTabs from './PmCommandTabs.vue'

/**
 * BlockManifest — a block's full dependency manifest (docs/blocks.md §1.2 #9, §3.3).
 *
 * Best-in-class galleries surface more than "Built from N components": the
 * concrete components, the one import a consumer needs, and the exact install
 * command(s). Everything here is DERIVED from the `BlockDef` (`components[]` +
 * `id`) — there is no per-block hand-authored manifest data, so it can never
 * drift from the catalog:
 *   • "Built from" chips — same reverse-lookup affordance (Task E4) as the card
 *     and preview header; each emits `selectComponent` to filter the index.
 *   • Import line — `buildImportLine(components[])` (Task F5), the single source
 *     of truth shared with the Code tab.
 *   • Install — `@dzup-ui/core @dzup-ui/tokens` across npm/pnpm/yarn/bun tabs
 *     (PmCommandTabs); the `npx shadcn@latest add …/r/<id>.json` registry line
 *     (also per-PM) only once Task G1 has shipped (gated by `REGISTRY_ENABLED`),
 *     so it never renders a dead command before the registry exists.
 *   • Copy code — the block's SFC source verbatim (DzCopyButton over
 *     `getBlockSource(block.path)`).
 *
 * Each command is a DzCodeBlock with `copyable`, which copies the EXACT text via
 * DzCopyButton. Chrome is dogfooded from @dzup-ui/core; the only CSS is layout +
 * the shared chip treatment (token-only, no color literals).
 */
const props = withDefaults(
  defineProps<{
    block: BlockDef
    /**
     * Render the "Built from" chips. Hosts that already surface them (e.g.
     * BlockPreview's always-visible header) pass `false` so the affordance is
     * not duplicated; the import/install commands still render.
     */
    showComponents?: boolean
  }>(),
  { showComponents: true },
)

const emit = defineEmits<{
  /** Request the index filter to all blocks using this `Dz*` component (Task E4). */
  selectComponent: [name: string]
}>()

/** How many catalog blocks use `name` (memoized reverse index, Task E1). */
function usageCount(name: string): number {
  return blocksUsingComponent(name).length
}

/** The one consumer import, derived from `components[]` in authored order (Task F5). */
const importLine = computed(() => buildImportLine(props.block.components))

/** `npm i …` per package manager (npm/pnpm/yarn/bun) for the install tab set. */
const installCmds = installCommands()

/** `npx shadcn@latest add …/r/<id>.json` per PM — only shown when REGISTRY_ENABLED. */
const registryAddCmds = computed(() => registryAddCommands(props.block.id))
</script>

<template>
  <section class="block-manifest" aria-label="Dependency manifest">
    <!-- "Built from" chips — optional (a host may already show them). -->
    <div v-if="showComponents" class="bm-group">
      <DzText size="xs" tone="muted" as="div" class="bm-label">
        Built from {{ block.components.length }}
        {{ block.components.length === 1 ? 'component' : 'components' }}
      </DzText>
      <ul
        class="bm-chips"
        :aria-label="`Built from ${block.components.length} ${block.components.length === 1 ? 'component' : 'components'}`"
      >
        <li v-for="name in block.components" :key="name">
          <button
            type="button"
            class="bm-chip"
            :aria-label="`Show ${usageCount(name)} ${usageCount(name) === 1 ? 'block' : 'blocks'} using ${name}`"
            @click="emit('selectComponent', name)"
          >
            <span class="bm-chip-name">{{ name }}</span>
            <span class="bm-chip-count" aria-hidden="true">{{ usageCount(name) }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Import + copy-paste install command(s). -->
    <div v-if="importLine" class="bm-group">
      <DzText size="xs" tone="muted" as="div" class="bm-label">
        Import
      </DzText>
      <DzCodeBlock
        :code="importLine"
        language="ts"
        copyable
        :aria-label="`${block.title} import statement`"
        class="bm-code"
      />
    </div>

    <div class="bm-group">
      <DzText size="xs" tone="muted" as="div" class="bm-label">
        Install packages
      </DzText>
      <PmCommandTabs :commands="installCmds" aria-label="Install the dzup-ui packages" />
    </div>

    <!-- One-command install straight from the registry via the canonical shadcn
         CLI — only once the registry has shipped public/r/<id>.json (Task G1). -->
    <div v-if="REGISTRY_ENABLED" class="bm-group">
      <DzText size="xs" tone="muted" as="div" class="bm-label">
        Add with the shadcn CLI
      </DzText>
      <PmCommandTabs
        :commands="registryAddCmds"
        :aria-label="`Add ${block.title} from the dzup-ui registry`"
      />
    </div>

    <!-- Copy the block's SFC source verbatim (the ?raw string on the BlockDef). -->
    <div class="bm-group">
      <DzText size="xs" tone="muted" as="div" class="bm-label">
        Or copy the source
      </DzText>
      <DzCopyButton
        :value="getBlockSource(block.path)"
        label="Copy code"
        copied-label="Copied!"
        variant="outline"
        tone="neutral"
        size="sm"
        :aria-label="`Copy the ${block.title} block source`"
        class="bm-copy-code"
      />
    </div>
  </section>
</template>

<style scoped>
.block-manifest {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bm-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bm-label {
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* "Built from" component chips — same token treatment as BlockCard / BlockPreview. */
.bm-chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bm-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  padding: 2px 9px;
  border: 0;
  border-radius: var(--dz-radius-full, 9999px);
  cursor: pointer;
  /* Category-accent tint (`--lp-cat-500` inherited from the panel), legible in
     light and dark; brand primary is the fallback. */
  background: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #4f46e5)) 13%, var(--dz-surface, #fff));
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #4f46e5)) 62%, var(--dz-foreground, #1a202c));
  transition: background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.bm-chip:hover {
  background: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #4f46e5)) 22%, var(--dz-surface, #fff));
}

.bm-chip:focus-visible {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #4f46e5));
  outline-offset: 2px;
}

/* Usage count — subtle "used in N blocks" hint, quieter than the name. */
.bm-chip-count {
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}

.bm-code {
  margin: 0;
}
</style>
