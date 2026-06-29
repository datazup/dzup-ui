/**
 * useBlockCodeView — derivation tests (docs/blocks.md §3.2).
 *
 * Covers the three pure transforms that back the Code-tab toggles — template
 * extraction, the best-effort TS→JS annotation strip, and import-line generation
 * — plus the reactive composable surface that selects between them. The JS strip
 * is deliberately scoped (annotation removal, not a compiler); the tests assert
 * both that the supported annotations are removed AND that lookalikes it must NOT
 * touch (object-literal keys, real `<` comparisons, template markup) survive.
 */

import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { BLOCKS } from '../blocks/registry.ts'
import {
  buildImportLine,
  extractTemplate,
  toJavaScript,
  useBlockCodeView,
} from './useBlockCodeView.ts'

/** A representative block SFC exercising every pattern the stripper handles. */
const SAMPLE_SFC = `<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SegmentedItem } from '@dzup-ui/core'

const password = ref<string>('')
const items: SegmentedItem[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const strength = computed<number>(() => {
  const p = password.value
  return p.length >= 8 ? 100 : 0
})

const tone = computed(() => (strength.value > 50 ? 'success' : 'danger') as const)

function onKeydown(event: KeyboardEvent): void {
  event.preventDefault()
}
</script>

<template>
  <section class="demo">
    <input v-model="password" />
    <template #suffix>
      <span>{{ strength }}</span>
    </template>
  </section>
</template>

<style scoped>
.demo { color: var(--dz-foreground); }
</style>
`

describe('extractTemplate', () => {
  it('returns the root <template> element, trimmed', () => {
    const tpl = extractTemplate(SAMPLE_SFC)
    expect(tpl.startsWith('<template>')).toBe(true)
    expect(tpl.endsWith('</template>')).toBe(true)
  })

  it('keeps nested <template #slot> children inside the result (greedy to last close)', () => {
    const tpl = extractTemplate(SAMPLE_SFC)
    expect(tpl).toContain('<template #suffix>')
    // Both the nested close and the root close survive.
    expect(tpl.match(/<\/template>/g)).toHaveLength(2)
  })

  it('excludes the <script> and <style> blocks', () => {
    const tpl = extractTemplate(SAMPLE_SFC)
    expect(tpl).not.toContain('<script')
    expect(tpl).not.toContain('<style')
    expect(tpl).not.toContain('ref(')
  })

  it('returns an empty string when there is no template', () => {
    expect(extractTemplate('<script setup>const x = 1</script>')).toBe('')
  })
})

describe('buildImportLine', () => {
  it('joins components into a single @dzup-ui/core import in authored order', () => {
    expect(buildImportLine(['DzBadge', 'DzHeading', 'DzText', 'DzButton'])).toBe(
      "import { DzBadge, DzHeading, DzText, DzButton } from '@dzup-ui/core'",
    )
  })

  it('handles a single component', () => {
    expect(buildImportLine(['DzButton'])).toBe("import { DzButton } from '@dzup-ui/core'")
  })

  it('returns an empty string for no components', () => {
    expect(buildImportLine([])).toBe('')
  })
})

describe('toJavaScript', () => {
  const js = toJavaScript(SAMPLE_SFC)

  it('drops lang="ts" from the script tag', () => {
    expect(js).toContain('<script setup>')
    expect(js).not.toContain('lang="ts"')
  })

  it('removes type-only imports but keeps value imports', () => {
    expect(js).not.toContain('import type')
    expect(js).not.toContain('SegmentedItem')
    expect(js).toContain("import { computed, ref } from 'vue'")
  })

  it('strips generic type arguments on known callees', () => {
    expect(js).toContain("ref('')")
    expect(js).toContain('computed(() =>')
    expect(js).not.toContain('ref<string>')
    expect(js).not.toContain('computed<number>')
  })

  it('strips variable, return-type, and as-const annotations', () => {
    expect(js).toContain('const items = [')
    expect(js).not.toContain('SegmentedItem[]')
    expect(js).toContain('function onKeydown(event) {')
    expect(js).not.toContain(': void')
    expect(js).not.toContain('as const')
  })

  it('does NOT touch object-literal keys that look like annotations', () => {
    // `value:`/`label:` are data, not types — they must survive verbatim.
    expect(js).toContain("{ value: 'light', label: 'Light' }")
  })

  it('leaves the template and style blocks byte-for-byte unchanged', () => {
    expect(js).toContain('<input v-model="password" />')
    expect(js).toContain('<template #suffix>')
    expect(js).toContain('.demo { color: var(--dz-foreground); }')
  })

  it('does not mangle a real `<` comparison in the script body', () => {
    // `p.length >= 8` and the `>` in the ternary are operators, not generics.
    expect(js).toContain('p.length >= 8')
  })

  it('returns the source unchanged when there is no script block', () => {
    const tplOnly = '<template><div /></template>'
    expect(toJavaScript(tplOnly)).toBe(tplOnly)
  })

  // Catalog-wide safety net: the strip must run over every real block without
  // throwing, drop `lang="ts"` from the SFC's opening <script> tag, and never
  // disturb the template markup. We check only the *first* script open tag — the
  // real top-of-file `<script setup lang="ts">` — because some blocks (e.g. the
  // IDE preview) legitimately embed the literal text `<script … lang="ts">` as
  // editor content, which no regex can distinguish from a real tag.
  it.each(BLOCKS.map((b) => [b.id, b.source] as const))(
    'strips %s safely (script lang gone, template preserved)',
    (_id, source) => {
      const js = toJavaScript(source)
      const firstScriptTag = js.match(/<script\b[^>]*>/)?.[0] ?? ''
      expect(firstScriptTag).not.toMatch(/lang=["']ts["']/)
      // The verbatim <template> element is identical before and after.
      expect(extractTemplate(js)).toBe(extractTemplate(source))
    },
  )
})

describe('useBlockCodeView', () => {
  it('defaults to the full SFC in TypeScript', () => {
    const view = useBlockCodeView(SAMPLE_SFC, ['DzButton'])
    expect(view.format.value).toBe('sfc')
    expect(view.lang.value).toBe('ts')
    expect(view.code.value).toBe(SAMPLE_SFC)
    expect(view.language.value).toBe('vue')
  })

  it('switches the shown code to the JS variant', () => {
    const view = useBlockCodeView(SAMPLE_SFC, ['DzButton'])
    view.lang.value = 'js'
    expect(view.code.value).toBe(toJavaScript(SAMPLE_SFC))
    expect(view.code.value).not.toContain('lang="ts"')
  })

  it('switches the shown code to template-only and reports html', () => {
    const view = useBlockCodeView(SAMPLE_SFC, ['DzButton'])
    view.format.value = 'template'
    expect(view.code.value).toBe(extractTemplate(SAMPLE_SFC))
    expect(view.language.value).toBe('html')
  })

  it('ignores the language toggle while template-only is selected', () => {
    const view = useBlockCodeView(SAMPLE_SFC, ['DzButton'])
    view.format.value = 'template'
    const ts = view.code.value
    view.lang.value = 'js'
    expect(view.code.value).toBe(ts)
  })

  it('derives the import line from components[]', () => {
    const view = useBlockCodeView(SAMPLE_SFC, ['DzBadge', 'DzButton'])
    expect(view.importLine.value).toBe("import { DzBadge, DzButton } from '@dzup-ui/core'")
  })

  it('reacts when the source/components refs change', async () => {
    const source = ref('<script setup lang="ts">const a = 1</script>')
    const components = ref<string[]>(['DzButton'])
    const view = useBlockCodeView(source, components)
    expect(view.importLine.value).toBe("import { DzButton } from '@dzup-ui/core'")

    source.value = SAMPLE_SFC
    components.value = ['DzHeading', 'DzText']
    await nextTick()
    expect(view.code.value).toBe(SAMPLE_SFC)
    expect(view.importLine.value).toBe("import { DzHeading, DzText } from '@dzup-ui/core'")
  })
})
