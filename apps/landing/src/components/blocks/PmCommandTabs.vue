<script setup lang="ts">
import type { PackageManager } from '../../blocks/config.ts'
import { DzCodeBlock, DzTabContent, DzTabList, DzTabs, DzTabTrigger } from '@dzup-ui/core'
import { ref } from 'vue'
import { PACKAGE_MANAGERS } from '../../blocks/config.ts'

/**
 * PmCommandTabs — a package-manager tab set (npm / pnpm / yarn / bun) over a
 * single copy-paste command (docs requirement <cli_ux>, <hero>).
 *
 * The command differs only by the manager's runner (`npx` vs `pnpm dlx` vs …),
 * so the caller passes the pre-built map (`registryAddCommands(id)` /
 * `installCommands()` from `config.ts` — the single source of truth) and this
 * renders one copyable `DzCodeBlock` per manager. Chrome is dogfooded from
 * `@dzup-ui/core` (DzTabs + DzCodeBlock's built-in DzCopyButton); the only CSS is
 * layout, token-only.
 *
 * The selected manager is local (`npm` by default) — each mount is independent,
 * so a card and the hero don't fight over one global choice.
 */
defineProps<{
  /** Command per package manager — e.g. `{ npm: 'npx …', pnpm: 'pnpm dlx …', … }`. */
  commands: Record<PackageManager, string>
  /** Highlight language hint for the code block (default `bash`). */
  language?: string
  /** Accessible label prefix, e.g. `Add hero-centered via the shadcn CLI`. */
  ariaLabel?: string
}>()

/** Selected manager — kept a plain string for DzTabs' `defineModel<string>()`. */
const pm = ref<string>('npm')
</script>

<template>
  <DzTabs v-model="pm" variant="line" size="sm" tone="neutral" class="pmc">
    <DzTabList class="pmc-list" :aria-label="ariaLabel ? `${ariaLabel} — package manager` : 'Select package manager'">
      <DzTabTrigger v-for="m in PACKAGE_MANAGERS" :key="m" :value="m" class="pmc-trigger">
        {{ m }}
      </DzTabTrigger>
    </DzTabList>
    <DzTabContent v-for="m in PACKAGE_MANAGERS" :key="m" :value="m" class="pmc-panel">
      <DzCodeBlock
        :code="commands[m]"
        :language="language ?? 'bash'"
        copyable
        :aria-label="`${ariaLabel ?? 'Command'} (${m})`"
        class="pmc-code"
      />
    </DzTabContent>
  </DzTabs>
</template>

<style scoped>
.pmc {
  width: 100%;
}

/* Compact, quiet tab row — the command is the hero, the PM switch is secondary. */
.pmc-list {
  margin-bottom: 8px;
}

.pmc-trigger {
  font-family: var(--dz-font-mono, monospace);
  font-size: var(--dz-text-xs, 0.75rem);
  text-transform: lowercase;
}

.pmc-panel {
  margin: 0;
}

.pmc-code {
  margin: 0;
}
</style>
