<script setup lang="ts">
import { DzCodeBlock } from '@dzup-ui/core'
import { installCommands } from '../blocks/config.ts'
import PmCommandTabs from './blocks/PmCommandTabs.vue'

/**
 * The hero's "install → import → use" panel (TASK-DS-11).
 *
 * A developer evaluating a Vue library wants the install line and the first real
 * component call within five seconds. Before this, neither appeared above the
 * fold on the home page.
 *
 * Both halves are reused, not rebuilt: `PmCommandTabs` is the same npm/pnpm/yarn/bun
 * tab set the block pages use, and `DzCodeBlock` brings its own `DzCopyButton`.
 *
 * The snippet mirrors the Getting Started guide's "Use a component" example
 * (`apps/storybook/stories/GettingStarted.mdx`), with the button folded onto one
 * line and its redundant `size="md"` (the default) dropped so the panel clears
 * the fold. Keep the two in lockstep: a hero that teaches an API the docs do not
 * is worse than no hero code at all.
 */
const installCmds = installCommands()

const usage = `<script setup lang="ts">
import { DzButton } from '@dzup-ui/core'
<\/script>

<template>
  <DzButton variant="solid" tone="primary">Save changes</DzButton>
</template>`
</script>

<template>
  <div class="code-panel">
    <ol class="steps">
      <li class="step">
        <span class="step-num" aria-hidden="true">1</span>
        <div class="step-body">
          <span class="step-label">Install</span>
          <PmCommandTabs :commands="installCmds" aria-label="Install the dzup-ui packages" />
        </div>
      </li>
      <li class="step">
        <span class="step-num" aria-hidden="true">2</span>
        <div class="step-body">
          <span class="step-label">Import and use</span>
          <DzCodeBlock
            :code="usage"
            language="vue"
            filename="App.vue"
            copyable
            aria-label="Import DzButton and render it"
            class="usage-code"
          />
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.code-panel {
  width: 100%;
  text-align: left;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 12px;
  align-items: start;
  min-width: 0;
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  border-radius: var(--dz-radius-full, 9999px);
  border: 1px solid var(--lp-hairline);
  background: var(--dz-surface, #fff);
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--dz-muted-foreground, #64748b);
}

.step-body {
  min-width: 0;
}

.step-label {
  display: block;
  margin-bottom: 6px;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #64748b);
}

/* The snippet is nine short lines; let it breathe without scrolling. */
.usage-code {
  margin: 0;
  font-size: var(--dz-text-xs, 0.75rem);
}
</style>
