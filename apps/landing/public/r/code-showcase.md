# Code showcase

A tabbed setup example — DzTabs switch between files, each a DzCodeBlock with a filename header and an explicit DzCopyButton wired into its actions slot that copies exactly the snippet on screen.

- **Category:** Content
- **Components:** DzCodeBlock, DzCopyButton, DzTabs, DzTabList, DzTabTrigger, DzTabContent
- **Preview:** /blocks/code-showcase

```vue
<script setup lang="ts">
/**
 * Code showcase — a tabbed snippet with one-click copy.
 *
 * DzTabs switch between the files of a minimal setup example; each tab renders a
 * DzCodeBlock (filename + language header, line numbers) whose built-in copy is
 * turned off in favour of an explicit DzCopyButton wired into the block's
 * `#actions` slot — copying exactly the snippet on screen.
 *
 * Self-contained: static content, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import {
  DzCodeBlock,
  DzCopyButton,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
} from '@dzup-ui/core'
import { ref } from 'vue'

const tab = ref('install')

interface Snippet {
  value: string
  label: string
  filename: string
  language: string
  code: string
}

const snippets: Snippet[] = [
  {
    value: 'install',
    label: 'Install',
    filename: 'terminal',
    language: 'bash',
    code: 'npm install @dzup-ui/core @dzup-ui/tokens',
  },
  {
    value: 'setup',
    label: 'main.ts',
    filename: 'main.ts',
    language: 'typescript',
    code: `import { createApp } from 'vue'
import '@dzup-ui/tokens/theme.css'
import App from './App.vue'

createApp(App).mount('#app')`,
  },
  {
    value: 'usage',
    label: 'App.vue',
    filename: 'App.vue',
    language: 'vue',
    code: [
      '<template>',
      '  <DzButton tone="primary" @click="start">',
      '    Get started',
      '  </DzButton>',
      '</template>',
    ].join('\n'),
  },
]
</script>

<template>
  <section class="cs-wrap" aria-labelledby="cs-title">
    <header class="cs-head">
      <h4 id="cs-title" class="cs-title">
        Add it to your app
      </h4>
      <p class="cs-sub">
        Three files from zero to a themed button.
      </p>
    </header>

    <DzTabs v-model="tab" variant="enclosed" aria-label="Setup snippets" class="cs-tabs">
      <DzTabList>
        <DzTabTrigger v-for="snippet in snippets" :key="snippet.value" :value="snippet.value">
          {{ snippet.label }}
        </DzTabTrigger>
      </DzTabList>

      <DzTabContent v-for="snippet in snippets" :key="snippet.value" :value="snippet.value">
        <DzCodeBlock
          :code="snippet.code"
          :language="snippet.language"
          :filename="snippet.filename"
          :show-line-numbers="snippet.value !== 'install'"
          :copyable="false"
          :aria-label="`${snippet.filename} snippet`"
        >
          <template #actions>
            <DzCopyButton
              :value="snippet.code"
              variant="ghost"
              size="sm"
              label="Copy"
              copied-label="Copied"
              :aria-label="`Copy ${snippet.filename} snippet`"
            />
          </template>
        </DzCodeBlock>
      </DzTabContent>
    </DzTabs>
  </section>
</template>

<style scoped>
.cs-wrap {
  padding: clamp(1.25rem, 4vw, 2rem);
  background: var(--dz-background, #fff);
}

.cs-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.cs-title {
  margin: 0;
  font-size: var(--dz-text-xl, 1.25rem);
  font-weight: var(--dz-font-bold, 700);
  color: var(--dz-foreground, inherit);
}

.cs-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
  font-size: var(--dz-text-sm, 0.875rem);
  color: var(--dz-muted-foreground, var(--dz-foreground-muted, inherit));
}

.cs-tabs {
  max-width: 44rem;
}
</style>
```
