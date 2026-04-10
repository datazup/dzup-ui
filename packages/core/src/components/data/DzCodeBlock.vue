<script setup lang="ts">
import type { DzCodeBlockProps, DzCodeBlockSlots } from './DzCodeBlock.types.ts'
/**
 * DzCodeBlock — Code display component with line numbers and copy support.
 *
 * Renders code in a semantically correct `<pre><code>` structure
 * with optional line numbers, a file header, and clipboard copy.
 *
 * @example
 * ```vue
 * <DzCodeBlock code="const x = 1" language="typescript" copyable />
 * <DzCodeBlock code="npm install" filename="terminal" show-line-numbers />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzCopyButton from '../buttons/DzCopyButton.vue'
import { codeBlockVariants } from './DzCodeBlock.variants.ts'

const props = withDefaults(defineProps<DzCodeBlockProps>(), {
  id: undefined,
  ariaLabel: undefined,
  language: undefined,
  filename: undefined,
  showLineNumbers: false,
  maxHeight: undefined,
  copyable: true,
})

defineSlots<DzCodeBlockSlots>()

const attrs = useAttrs()
const styles = codeBlockVariants()

/** Split code into individual lines for rendering */
const lines = computed(() => props.code.split('\n'))

/** Whether the header bar should be displayed */
const showHeader = computed(() => !!props.filename || !!props.language || props.copyable)

const rootClasses = computed(() =>
  cn(
    styles.root(),
    'bg-[var(--dz-muted)] border-[var(--dz-border)] text-[var(--dz-foreground)]',
    attrs.class as string | undefined,
  ),
)

const headerClasses = computed(() =>
  cn(
    styles.header(),
    'bg-[var(--dz-muted)] border-[var(--dz-border)] text-[var(--dz-muted-foreground)]',
  ),
)

const contentStyles = computed(() => {
  const result: Record<string, string> = {}
  if (props.maxHeight) {
    result['max-height'] = props.maxHeight
    result['overflow-y'] = 'auto'
  }
  return result
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :aria-label="ariaLabel"
    role="region"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Header -->
    <div
      v-if="showHeader"
      :class="headerClasses"
      data-part="header"
    >
      <slot name="header" :filename="filename" :language="language">
        <div :class="styles.filename()">
          <span v-if="filename" data-part="filename">{{ filename }}</span>
          <span
            v-if="language"
            class="rounded bg-[var(--dz-foreground)]/10 px-1.5 py-0.5"
            data-part="language"
          >
            {{ language }}
          </span>
        </div>
      </slot>

      <div :class="styles.actions()">
        <slot name="actions" />
        <DzCopyButton
          v-if="copyable"
          :value="code"
          size="sm"
          data-part="copy-button"
        />
      </div>
    </div>

    <!-- Code content -->
    <pre
      :class="styles.content()"
      :style="contentStyles"
      data-part="content"
    ><code :class="language ? `language-${language}` : undefined"><template
      v-for="(line, index) in lines"
      :key="index"
    ><span :class="styles.line()"><span
      v-if="showLineNumbers"
      :class="styles.lineNumber()"
      data-part="line-number"
      aria-hidden="true"
    >{{ index + 1 }}</span><span :class="styles.lineContent()">{{ line }}</span></span><template v-if="index < lines.length - 1" /></template></code></pre>
  </div>
</template>
