<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  code: string
  language?: string
}>()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <details class="demo-code">
    <summary class="demo-code-summary">
      <span class="demo-code-label">Show source</span>
      <span class="demo-code-language">{{ language ?? 'vue' }}</span>
    </summary>
    <div class="demo-code-body">
      <button
        type="button"
        class="demo-code-copy"
        :aria-label="copied ? 'Copied' : 'Copy snippet'"
        @click.prevent="copy"
      >
        {{ copied ? 'Copied' : 'Copy' }}
      </button>
      <pre class="demo-code-pre"><code>{{ code }}</code></pre>
    </div>
  </details>
</template>

<style scoped>
.demo-code {
  margin-top: 16px;
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-md, 6px);
  background: var(--dz-surface, #ffffff);
  overflow: hidden;
}

.demo-code-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--dz-muted-foreground, #64748b);
  user-select: none;
  list-style: none;
}

.demo-code-summary::-webkit-details-marker {
  display: none;
}

.demo-code-label {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.demo-code-language {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: var(--dz-radius-sm, 4px);
  background: var(--dz-muted, #f1f5f9);
  color: var(--dz-foreground, #1a202c);
}

.demo-code-body {
  position: relative;
  border-top: 1px solid var(--dz-border, #e2e8f0);
}

.demo-code-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dz-muted-foreground, #64748b);
  background: var(--dz-surface, #ffffff);
  border: 1px solid var(--dz-border, #e2e8f0);
  border-radius: var(--dz-radius-sm, 4px);
  cursor: pointer;
}

.demo-code-copy:hover {
  color: var(--dz-foreground, #1a202c);
  background: var(--dz-muted, #f1f5f9);
}

.demo-code-pre {
  margin: 0;
  padding: 14px 16px;
  overflow-x: auto;
  background: var(--dz-muted, #f8fafc);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--dz-foreground, #1a202c);
}

.demo-code-pre code {
  white-space: pre;
}
</style>
