<script setup lang="ts">
import { DzButton, DzCodeBlock, DzHeading, DzText } from '@dzup-ui/core'
import { BookOpen, Boxes, Github, LayoutTemplate, Palette, Sparkles, Terminal } from 'lucide-vue-next'
import {
  DZUP_MCP_PACKAGE,
  dzupMcpClaudeCliCommand,
  dzupMcpConfig,
  dzupMcpVscodeConfig,
} from '../blocks/config.ts'
import { LINKS } from '../config.ts'

/**
 * /ai — "Use dzup-ui with your AI IDE" (Task G5, discovery half).
 *
 * The developer-facing companion to `@dzup-ui/mcp` (packages/mcp): a single docs
 * surface with copy-paste MCP configs for Cursor, Claude Code, Windsurf and
 * VS Code, the list of tools the server exposes, and a few example prompts. Every
 * snippet is derived from `blocks/config.ts` helpers so the page and the shipped
 * server can never drift. Built only from @dzup-ui/core; token-only styling.
 *
 * The snippets are host-independent (an `npx` package, no origin to resolve), so
 * they're computed once as plain strings rather than reactive refs.
 */

const canonicalConfig = dzupMcpConfig()
const vscodeConfig = dzupMcpVscodeConfig()
const claudeCli = dzupMcpClaudeCliCommand()

/** Per-client setup rows. Most share the canonical config; VS Code differs. */
const clients: Array<{ id: string, name: string, where: string, cli?: string, code: string, lang: string }> = [
  {
    id: 'cursor',
    name: 'Cursor',
    where: 'Create .cursor/mcp.json in your project (or Settings → MCP → Add new global MCP server).',
    code: canonicalConfig,
    lang: 'json',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    where: 'Run the CLI one-liner, or add the same block to .mcp.json at your project root.',
    cli: claudeCli,
    code: canonicalConfig,
    lang: 'json',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    where: 'Edit ~/.codeium/windsurf/mcp_config.json (Settings → Cascade → MCP → View raw config).',
    code: canonicalConfig,
    lang: 'json',
  },
  {
    id: 'vscode',
    name: 'VS Code (Copilot)',
    where: 'Add .vscode/mcp.json — note the servers key and explicit stdio type.',
    code: vscodeConfig,
    lang: 'json',
  },
]

const tools = [
  { icon: Boxes, name: 'list_components / get_component', blurb: '158 components — families, props, emits, slots, taxonomy and a usage snippet.' },
  { icon: LayoutTemplate, name: 'list_blocks / get_block', blurb: '88 pre-composed blocks — fetch the real .vue source and install command.' },
  { icon: LayoutTemplate, name: 'list_templates / get_template', blurb: '44 full-page templates — dashboards, auth, settings and marketing pages.' },
  { icon: Palette, name: 'list_tokens', blurb: 'The --dz-* OKLCH design tokens as light/dark CSS variables.' },
  { icon: Terminal, name: 'get_install_command', blurb: 'The exact shadcn add command for any block/template, per package manager.' },
  { icon: Sparkles, name: 'search', blurb: 'One query across components, blocks and templates.' },
] as const

const prompts = [
  'List the dzup-ui form components, then add the contact-form block.',
  'Add a dzup-ui three-tier pricing block to this page.',
  'Show me the DzTable API and scaffold the analytics-dashboard template.',
  'What are the dzup-ui primary color tokens for dark mode?',
] as const
</script>

<template>
  <main class="ai">
    <!-- Hero -->
    <section class="ai-hero">
      <span class="lp-eyebrow">AI-native distribution</span>
      <DzHeading :level="1" size="xl" weight="bold" class="ai-hero-title lp-balance">
        Use dzup-ui with your AI IDE
      </DzHeading>
      <DzText size="lg" tone="muted" class="ai-hero-lede lp-balance">
        Connect the free <code>{{ DZUP_MCP_PACKAGE }}</code> MCP server and your assistant can browse
        every component, block, template and design token — and drop in the real source on request.
        Say <em>"add a dzup-ui pricing block"</em> and it fetches the code and the install command.
      </DzText>

      <div class="ai-hero-config">
        <DzText size="xs" tone="muted" as="div" class="ai-label">
          <Terminal :size="13" aria-hidden="true" /> One config — works in every MCP client
        </DzText>
        <DzCodeBlock
          :code="canonicalConfig"
          language="json"
          copyable
          aria-label="dzup-ui MCP server config"
          class="ai-code"
        />
        <DzText size="sm" tone="muted" class="ai-note">
          No install, no API key. <code>npx</code> fetches and runs the server on demand; it reads the
          same public registry the site ships, so it's always in sync.
        </DzText>
      </div>

      <div class="ai-hero-links">
        <DzButton as="a" :href="LINKS.github" target="_blank" rel="noopener" variant="outline" tone="neutral" size="sm">
          <template #prefix><Github :size="16" aria-hidden="true" /></template>
          Source &amp; docs
        </DzButton>
        <DzButton as="a" :href="LINKS.components" target="_blank" rel="noopener" variant="outline" tone="neutral" size="sm">
          <template #prefix><BookOpen :size="16" aria-hidden="true" /></template>
          Component API
        </DzButton>
      </div>
    </section>

    <!-- Per-client setup -->
    <section class="ai-section" aria-labelledby="ai-clients-title">
      <DzHeading id="ai-clients-title" :level="2" size="lg" weight="semibold">
        Connect your client
      </DzHeading>
      <div class="ai-clients">
        <article v-for="client in clients" :key="client.id" class="ai-client">
          <DzHeading :level="3" size="md" weight="semibold" class="ai-client-name">
            {{ client.name }}
          </DzHeading>
          <DzText size="sm" tone="muted" class="ai-client-where">
            {{ client.where }}
          </DzText>
          <DzCodeBlock
            v-if="client.cli"
            :code="client.cli"
            language="bash"
            copyable
            :aria-label="`${client.name} CLI command`"
            class="ai-code"
          />
          <DzCodeBlock
            :code="client.code"
            :language="client.lang"
            copyable
            :aria-label="`${client.name} MCP config`"
            class="ai-code"
          />
        </article>
      </div>
    </section>

    <!-- What the server exposes -->
    <section class="ai-section" aria-labelledby="ai-tools-title">
      <DzHeading id="ai-tools-title" :level="2" size="lg" weight="semibold">
        What the assistant can do
      </DzHeading>
      <div class="ai-tools">
        <article v-for="tool in tools" :key="tool.name" class="ai-tool">
          <component :is="tool.icon" :size="18" aria-hidden="true" class="ai-tool-icon" />
          <div>
            <DzText size="sm" weight="semibold" as="div" class="ai-tool-name">{{ tool.name }}</DzText>
            <DzText size="sm" tone="muted" as="div">{{ tool.blurb }}</DzText>
          </div>
        </article>
      </div>
    </section>

    <!-- Example prompts -->
    <section class="ai-section" aria-labelledby="ai-prompts-title">
      <DzHeading id="ai-prompts-title" :level="2" size="lg" weight="semibold">
        Try asking
      </DzHeading>
      <ul class="ai-prompts">
        <li v-for="prompt in prompts" :key="prompt" class="ai-prompt">
          <Sparkles :size="15" aria-hidden="true" class="ai-prompt-icon" />
          <DzText size="sm" as="span">{{ prompt }}</DzText>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.ai {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: clamp(32px, 6vw, 64px) 24px clamp(56px, 8vw, 96px);
  display: flex;
  flex-direction: column;
  gap: clamp(40px, 6vw, 72px);
}

.ai-hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 68ch;
}

.ai-hero-title {
  margin: 0;
  letter-spacing: -0.02em;
}

.ai-hero-lede {
  margin: 0;
  line-height: 1.6;
}

.ai-hero-lede code,
.ai-note code {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  font-size: 0.9em;
  padding: 1px 5px;
  border-radius: var(--dz-radius-sm, 4px);
  background: color-mix(in oklch, var(--dz-primary, #4f46e5) 11%, var(--dz-surface, #fff));
}

.ai-hero-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.ai-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.ai-note {
  margin: 0;
  line-height: 1.5;
}

.ai-code {
  margin: 0;
}

.ai-hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.ai-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-clients {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.ai-client {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-lg, 12px);
  background: var(--dz-surface, #fff);
}

.ai-client-name {
  margin: 0;
}

.ai-client-where {
  margin: 0;
  line-height: 1.5;
}

.ai-tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.ai-tool {
  display: flex;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 8px);
  background: var(--dz-surface, #fff);
}

.ai-tool-icon {
  flex-shrink: 0;
  color: var(--dz-primary, #4f46e5);
  margin-top: 2px;
}

.ai-tool-name {
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  margin-bottom: 2px;
}

.ai-prompts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ai-prompt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 8px);
  background: var(--dz-muted, #f8fafc);
}

.ai-prompt-icon {
  flex-shrink: 0;
  color: var(--dz-primary, #4f46e5);
}
</style>
