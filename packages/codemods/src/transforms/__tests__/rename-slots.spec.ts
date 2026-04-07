/**
 * Tests for the rename-slots transform.
 *
 * Verifies that slot names are correctly renamed in Vue SFC templates
 * and script sections.
 */

import jscodeshift from 'jscodeshift'
import { describe, expect, it } from 'vitest'
import transformer from '../rename-slots.js'

/** Helper to run the transform on a Vue SFC string. */
function applyTransform(source: string, path = 'test.vue'): string | null {
  const fileInfo = { path, source }
  const j = jscodeshift.withParser('tsx')
  const api = {
    jscodeshift: j,
    j,
    report: () => {},
    stats: () => {},
  }
  return transformer(fileInfo, api, {})
}

describe('rename-slots transform', () => {
  // -----------------------------------------------------------------------
  // DzCard: #header -> #title, #footer -> #actions
  // -----------------------------------------------------------------------

  it('renames #header to #title on DzCard', () => {
    const input = [
      '<template>',
      '  <DzCard>',
      '    <template #header>Card Title</template>',
      '    <p>Body</p>',
      '  </DzCard>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#title')
    expect(result).not.toContain('#header')
  })

  it('renames #footer to #actions on DzCard', () => {
    const input = [
      '<template>',
      '  <DzCard>',
      '    <template #footer><button>OK</button></template>',
      '  </DzCard>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#actions')
    expect(result).not.toContain('#footer')
  })

  it('renames v-slot:header to v-slot:title on DzCard', () => {
    const input = [
      '<template>',
      '  <DzCard>',
      '    <template v-slot:header>Title</template>',
      '  </DzCard>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('v-slot:title')
    expect(result).not.toContain('v-slot:header')
  })

  // -----------------------------------------------------------------------
  // DzDialog / DzDrawer / DzSheet: #header -> #title, #footer -> #actions
  // -----------------------------------------------------------------------

  it('renames #header to #title on DzDialog', () => {
    const input = [
      '<template>',
      '  <DzDialog>',
      '    <template #header>Dialog Title</template>',
      '    <p>Content</p>',
      '    <template #footer><button>Close</button></template>',
      '  </DzDialog>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#title')
    expect(result).toContain('#actions')
    expect(result).not.toContain('#header')
    expect(result).not.toContain('#footer')
  })

  it('renames #header to #title on DzDrawer', () => {
    const input = [
      '<template>',
      '  <DzDrawer>',
      '    <template #header>Drawer Title</template>',
      '  </DzDrawer>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#title')
    expect(result).not.toContain('#header')
  })

  it('renames #footer to #actions on DzSheet', () => {
    const input = [
      '<template>',
      '  <DzSheet>',
      '    <template #footer>Footer</template>',
      '  </DzSheet>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#actions')
    expect(result).not.toContain('#footer')
  })

  // -----------------------------------------------------------------------
  // DzSelect: #option -> #item
  // -----------------------------------------------------------------------

  it('renames #option to #item on DzSelect', () => {
    const input = [
      '<template>',
      '  <DzSelect>',
      '    <template #option="{ item }">{{ item.label }}</template>',
      '  </DzSelect>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#item=')
    expect(result).not.toContain('#option')
  })

  it('renames v-slot:option to v-slot:item on DzSelect', () => {
    const input = [
      '<template>',
      '  <DzSelect>',
      '    <template v-slot:option="{ item }">{{ item.label }}</template>',
      '  </DzSelect>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('v-slot:item=')
    expect(result).not.toContain('v-slot:option')
  })

  // -----------------------------------------------------------------------
  // DzInput: #prepend -> #prefix, #append -> #suffix
  // -----------------------------------------------------------------------

  it('renames #prepend to #prefix on DzInput', () => {
    const input = [
      '<template>',
      '  <DzInput>',
      '    <template #prepend>$</template>',
      '  </DzInput>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#prefix')
    expect(result).not.toContain('#prepend')
  })

  it('renames #append to #suffix on DzInput', () => {
    const input = [
      '<template>',
      '  <DzInput>',
      '    <template #append>.00</template>',
      '  </DzInput>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#suffix')
    expect(result).not.toContain('#append')
  })

  // -----------------------------------------------------------------------
  // DzButton: #icon -> #prefix
  // -----------------------------------------------------------------------

  it('renames #icon to #prefix on DzButton', () => {
    const input = [
      '<template>',
      '  <DzButton>',
      '    <template #icon><IconPlus /></template>',
      '    Click me',
      '  </DzButton>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#prefix')
    expect(result).not.toContain('#icon')
  })

  // -----------------------------------------------------------------------
  // Script-level $slots renames
  // -----------------------------------------------------------------------

  it('renames $slots.header to $slots.title in script', () => {
    const input = [
      '<template><DzCard><template #header>T</template></DzCard></template>',
      '<script setup lang="ts">',
      'const hasHeader = !!$slots.header',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('$slots.title')
    expect(result).not.toContain('$slots.header')
  })

  it('renames $slots.footer to $slots.actions in script', () => {
    const input = [
      '<template><DzCard></DzCard></template>',
      '<script setup lang="ts">',
      'const hasFooter = !!$slots.footer',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('$slots.actions')
    expect(result).not.toContain('$slots.footer')
  })

  it('renames $slots.option to $slots.item in script', () => {
    const input = [
      '<template><DzSelect></DzSelect></template>',
      '<script setup lang="ts">',
      'if ($slots.option) { renderOption() }',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('$slots.item')
    expect(result).not.toContain('$slots.option')
  })

  // -----------------------------------------------------------------------
  // Idempotency
  // -----------------------------------------------------------------------

  it('does not modify already-correct slot names', () => {
    const input = [
      '<template>',
      '  <DzCard>',
      '    <template #title>Title</template>',
      '    <template #actions><button>OK</button></template>',
      '  </DzCard>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('is idempotent (running twice gives same result)', () => {
    const input = [
      '<template>',
      '  <DzCard>',
      '    <template #header>Title</template>',
      '    <template #footer><button>OK</button></template>',
      '  </DzCard>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const first = applyTransform(input)
    expect(first).not.toBeNull()
    const second = applyTransform(first!)
    expect(second).toBeNull()
  })

  // -----------------------------------------------------------------------
  // Non-matching / edge cases
  // -----------------------------------------------------------------------

  it('does not rename #header on non-matching components', () => {
    const input = [
      '<template>',
      '  <DzAccordion>',
      '    <template #header>Accordion Header</template>',
      '  </DzAccordion>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('does not rename #option on non-DzSelect components', () => {
    const input = [
      '<template>',
      '  <DzCombobox>',
      '    <template #option>Custom</template>',
      '  </DzCombobox>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('does not modify unrelated code', () => {
    const input = [
      '<template>',
      '  <div>',
      '    <p>Hello world</p>',
      '  </div>',
      '</template>',
      '<script setup lang="ts">',
      'const x = 42',
      '</script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).toBeNull()
  })

  it('handles slots with scoped props (#header="{ title }")', () => {
    const input = [
      '<template>',
      '  <DzCard>',
      '    <template #header="{ title }">{{ title }}</template>',
      '  </DzCard>',
      '</template>',
      '<script setup lang="ts"></script>',
    ].join('\n')
    const result = applyTransform(input)
    expect(result).not.toBeNull()
    expect(result).toContain('#title="{ title }"')
    expect(result).not.toContain('#header')
  })
})
