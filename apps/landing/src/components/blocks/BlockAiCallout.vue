<script setup lang="ts">
import { DzButton, DzCodeBlock, DzHeading, DzText } from '@dzup-ui/core'
import { ExternalLink, FileText, Package, Terminal } from 'lucide-vue-next'
import { computed } from 'vue'
import {
  llmsTxtUrl,
  mcpServerConfig,
  registryDiscoveryCommands,
  registryIndexUrl,
} from '../../blocks/config.ts'

/**
 * BlockAiCallout — the "Use with AI" affordance on /blocks (docs/blocks.md §1.2
 * #3, §1.3, Task G5).
 *
 * A blocks gallery in 2025–2026 is an API for agents as much as for humans: this
 * surfaces the three AI-native entry points the build already generates, with no
 * new runtime service —
 *   • llms.txt (Task G2) — the token-efficient catalog index to point an
 *     assistant at via `@docs`;
 *   • registry.json (Task G1) — the shadcn-vue registry index the MCP server and
 *     `npx shadcn-vue add` read;
 *   • the exact, copy-paste MCP config that runs the shadcn CLI's built-in
 *     `registry:mcp` server against this registry, plus the `list/search/view`
 *     discovery one-liners.
 *
 * Everything resolvable is derived from `blocks/config.ts`, so the links target
 * the live deployment's real endpoints and the copied config/commands can never
 * drift from the docs. Built only from @dzup-ui/core (DzHeading/DzText/DzButton/
 * DzCodeBlock); the copy affordance is DzCodeBlock's own `copyable`. Token-only
 * styling — layout CSS plus `--dz-*` / inherited `--lp-cat-500` accents.
 */

/** Live, absolute URLs to the generated AI endpoints (empty only with no host). */
const llmsHref = computed(() => llmsTxtUrl())
const registryHref = computed(() => registryIndexUrl())

/** The exact copy-paste MCP server config + the shadcn discovery one-liners. */
const mcpConfig = computed(() => mcpServerConfig())
const discovery = computed(() => registryDiscoveryCommands())
</script>

<template>
  <section class="ai-callout" aria-labelledby="blocks-ai-title">
    <div class="ai-head">
      <span class="lp-eyebrow">AI-native</span>
      <DzHeading id="blocks-ai-title" :level="2" size="xl" weight="semibold" class="ai-title">
        Use with AI
      </DzHeading>
      <DzText size="md" tone="muted" class="ai-lede lp-balance">
        This catalog is also an agent-callable API. Point an assistant at the docs index, or wire up
        an MCP server so it can browse and install blocks by natural language — no new service to run.
      </DzText>
    </div>

    <!-- Resource links: the two generated, fetchable endpoints. -->
    <div class="ai-links">
      <DzButton
        v-if="llmsHref"
        as="a"
        :href="llmsHref"
        target="_blank"
        rel="noopener"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #prefix>
          <FileText :size="16" aria-hidden="true" />
        </template>
        llms.txt
        <template #suffix>
          <ExternalLink :size="14" aria-hidden="true" />
        </template>
      </DzButton>
      <DzButton
        v-if="registryHref"
        as="a"
        :href="registryHref"
        target="_blank"
        rel="noopener"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #prefix>
          <Package :size="16" aria-hidden="true" />
        </template>
        registry.json
        <template #suffix>
          <ExternalLink :size="14" aria-hidden="true" />
        </template>
      </DzButton>
    </div>

    <!-- The copy-paste MCP config: runs shadcn's built-in registry:mcp server. -->
    <div class="ai-block">
      <DzText size="xs" tone="muted" as="div" class="ai-label">
        <Terminal :size="13" aria-hidden="true" /> MCP server config
      </DzText>
      <DzText size="sm" tone="muted" class="ai-block-help">
        Add to your assistant's MCP config (e.g. <code>.cursor/mcp.json</code>, <code>.mcp.json</code>),
        then ask it to find and install a block.
      </DzText>
      <DzCodeBlock
        :code="mcpConfig"
        language="json"
        copyable
        aria-label="MCP server config for the dzup-ui blocks registry"
        class="ai-code"
      />
    </div>

    <!-- Discovery one-liners (need the @dzup-ui namespace in components.json). -->
    <div class="ai-block">
      <DzText size="xs" tone="muted" as="div" class="ai-label">
        <Terminal :size="13" aria-hidden="true" /> Discover from the CLI
      </DzText>
      <DzCodeBlock
        :code="discovery"
        language="bash"
        copyable
        aria-label="shadcn CLI discovery commands"
        class="ai-code"
      />
    </div>
  </section>
</template>

<style scoped>
.ai-callout {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: clamp(40px, 6vw, 72px) 24px clamp(56px, 8vw, 96px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-title {
  margin: 0;
  letter-spacing: -0.02em;
}

.ai-lede {
  margin: 0;
  max-width: 60ch;
  line-height: 1.6;
}

.ai-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ai-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.ai-block-help {
  margin: 0 0 2px;
  line-height: 1.5;
}

.ai-block-help code {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  font-size: 0.92em;
  padding: 1px 5px;
  border-radius: var(--dz-radius-sm, 4px);
  background: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #4f46e5)) 11%, var(--dz-surface, #fff));
}

.ai-code {
  margin: 0;
}
</style>
