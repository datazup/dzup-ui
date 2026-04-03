/**
 * Tests for the rename-components transform.
 *
 * Verifies that component tag names are correctly renamed in Vue SFC
 * templates and import statements.
 */

import jscodeshift from 'jscodeshift'
import { describe, expect, it } from 'vitest'
import transformer from '../rename-components.js'

/** Helper to run the transform on a source string. */
function applyTransform(source: string, path = 'test.vue'): string | null {
  const fileInfo = { path, source }
  const api = {
    jscodeshift: jscodeshift.withParser('tsx'),
    stats: () => {},
  }
  return transformer(fileInfo, api, {})
}

describe('rename-components transform', () => {
  // -----------------------------------------------------------------------
  // Template tag renames
  // -----------------------------------------------------------------------

  it('renames DzModal to DzDialog in template', () => {
    const input = [
      '<template>',
      '  <DzModal :open="show">',
      '    <p>Content</p>',
      '  </DzModal>',
      '</template>',
      '<script setup lang="ts">',
      'import { DzModal } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('<DzDialog')
    expect(result).toContain('</DzDialog>')
    expect(result).not.toContain('<DzModal')
    expect(result).not.toContain('</DzModal>')
  })

  it('renames DzNotification to DzToast in template', () => {
    const input = [
      '<template>',
      '  <DzNotification message="Hello" />',
      '</template>',
      '<script setup lang="ts">',
      'import { DzNotification } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('<DzToast')
    expect(result).not.toContain('<DzNotification')
  })

  it('renames DzDropdownMenu to DzDropdown in template', () => {
    const input = [
      '<template>',
      '  <DzDropdownMenu>',
      '    <template #default>Items</template>',
      '  </DzDropdownMenu>',
      '</template>',
      '<script setup lang="ts">',
      'import { DzDropdownMenu } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('<DzDropdown>')
    expect(result).toContain('</DzDropdown>')
    expect(result).not.toContain('DzDropdownMenu')
  })

  it('renames DzToolTip to DzTooltip (case fix) in template', () => {
    const input = [
      '<template>',
      '  <DzToolTip text="Help">',
      '    <button>?</button>',
      '  </DzToolTip>',
      '</template>',
      '<script setup lang="ts">',
      'import { DzToolTip } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('<DzTooltip')
    expect(result).toContain('</DzTooltip>')
    expect(result).not.toContain('DzToolTip')
  })

  it('renames DzLoading to DzSpinner in template', () => {
    const input = [
      '<template>',
      '  <DzLoading size="lg" />',
      '</template>',
      '<script setup lang="ts">',
      'import { DzLoading } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('<DzSpinner')
    expect(result).not.toContain('DzLoading')
  })

  // -----------------------------------------------------------------------
  // Script import renames
  // -----------------------------------------------------------------------

  it('renames import specifier DzModal to DzDialog', () => {
    const input = `import { DzModal } from '@dzup-ui/core'`
    const result = applyTransform(input, 'test.ts')
    expect(result).not.toBeNull()
    expect(result).toContain('DzDialog')
    expect(result).not.toContain('DzModal')
  })

  it('renames import specifier DzNotification to DzToast', () => {
    const input = `import { DzNotification } from '@dzup-ui/core'`
    const result = applyTransform(input, 'test.ts')
    expect(result).not.toBeNull()
    expect(result).toContain('DzToast')
    expect(result).not.toContain('DzNotification')
  })

  it('renames import specifier and all references', () => {
    const input = [
      `import { DzLoading } from '@dzup-ui/core'`,
      `const spinner = DzLoading`,
    ].join('\n')
    const result = applyTransform(input, 'test.ts')
    expect(result).not.toBeNull()
    expect(result).toContain('import { DzSpinner }')
    expect(result).toContain('const spinner = DzSpinner')
    expect(result).not.toContain('DzLoading')
  })

  it('preserves aliased imports (renames imported but keeps local)', () => {
    const input = `import { DzModal as MyDialog } from '@dzup-ui/core'`
    const result = applyTransform(input, 'test.ts')
    expect(result).not.toBeNull()
    expect(result).toContain('DzDialog as MyDialog')
    expect(result).not.toContain('DzModal')
  })

  it('handles multiple renames in one import', () => {
    const input = `import { DzModal, DzLoading, DzButton } from '@dzup-ui/core'`
    const result = applyTransform(input, 'test.ts')
    expect(result).not.toBeNull()
    expect(result).toContain('DzDialog')
    expect(result).toContain('DzSpinner')
    expect(result).toContain('DzButton')
    expect(result).not.toContain('DzModal')
    expect(result).not.toContain('DzLoading')
  })

  // -----------------------------------------------------------------------
  // Vue SFC: both template and script
  // -----------------------------------------------------------------------

  it('renames both template tags and import in Vue SFC', () => {
    const input = [
      '<template>',
      '  <DzModal :open="show">Content</DzModal>',
      '</template>',
      '<script setup lang="ts">',
      'import { DzModal } from \'@dzup-ui/core\'',
      'const show = ref(false)',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    // Template
    expect(result).toContain('<DzDialog')
    expect(result).toContain('</DzDialog>')
    // Script
    expect(result).toContain('import { DzDialog }')
    expect(result).not.toContain('DzModal')
  })

  // -----------------------------------------------------------------------
  // Idempotency
  // -----------------------------------------------------------------------

  it('does not modify already-correct component names', () => {
    const input = [
      '<template><DzDialog :open="show">Content</DzDialog></template>',
      '<script setup lang="ts">',
      'import { DzDialog } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('is idempotent (running twice gives same result)', () => {
    const input = [
      '<template><DzModal :open="show">Content</DzModal></template>',
      '<script setup lang="ts">',
      'import { DzModal } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const first = applyTransform(input)
    expect(first).not.toBeNull()
    const second = applyTransform(first!)
    expect(second).toBeNull()
  })

  // -----------------------------------------------------------------------
  // Non-matching / edge cases
  // -----------------------------------------------------------------------

  it('does not modify unrelated components', () => {
    const input = [
      '<template><DzButton>Click</DzButton></template>',
      '<script setup lang="ts">',
      'import { DzButton } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('does not modify non-Dz components', () => {
    const input = [
      '<template><Modal :open="show">Content</Modal></template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('returns null for files with no imports or components to rename', () => {
    const input = `const x = 42`
    const result = applyTransform(input, 'test.ts')
    expect(result).toBeNull()
  })

  it('handles self-closing tags', () => {
    const input = [
      '<template><DzLoading /></template>',
      '<script setup lang="ts">',
      'import { DzLoading } from \'@dzup-ui/core\'',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('<DzSpinner />')
    expect(result).not.toContain('DzLoading')
  })
})
